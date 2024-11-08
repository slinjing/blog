# 手动部署 Kubernetes

> [!TIP] 集群信息：
> 操作系统：CentOS 7.9 主机数量：7

```
 序号  主机名           IP地址 
  1     ha1           11.0.1.140 
  2     ha2           11.0.1.141 
  3   k8s-master01    11.0.1.142 
  4   k8s-master02    11.0.1.143 
  5   k8s-master03    11.0.1.144 
  6   k8s-node01      11.0.1.145 
  7   k8s-node02      11.0.1.146 
  8     k8s-lb        11.0.1.100 
```

## 集群主机准备

> [!NOTE] 注意：
> 如无特别说明，则以下配置所有主机均要执行。

- Linux 内核升级
```shell
# 导入 elrepo gpg key
$ rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

# 安装 elrepo YUM 源仓库
$ yum -y install https://www.elrepo.org/elrepo-release-7.0-4.el7.elrepo.noarch.rpm

# 安装 kernel-lt 版本，ml 为最新稳定版本，lt 为长期维护版本
$ yum --enablerepo="elrepo-kernel" -y install kernel-lt.x86_64

# 设置 grub2 默认引导为0
$ grub2-set-default 0

# 重新生成 grub2 引导文件
$ grub2-mkconfig -o /boot/grub2/grub.cfg

# 重启使升级的内核生效
$ reboot
# 验证内核是否更新
$ uname -r
```

- 主机名配置
```shell
$ hostnamectl set-hostname XXX
```

- IP 地址配置
```shell
# /etc/sysconfig/network-scripts/ifcfg-ens33
......
BOOTPROTO="none"
.......
IPADDR="11.0.1.140"
PREFIX="24"
GATEWAY="11.0.1.1"
DNS1="114.114.114.114"
DNS2="8.8.8.8"
```

- 主机名与 IP 地址解析
```shell
# /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
11.0.1.140  ha1
11.0.1.141  ha2
11.0.1.142  k8s-master01
11.0.1.143  k8s-master02
11.0.1.144  k8s-master03
11.0.1.145  k8s-node01
11.0.1.146  k8s-node02
11.0.1.100  k8s-lb 
```

- 关闭防火墙
```shell
$ systemctl stop firewalld
$ systemctl disable firewalld
```

- 关闭 SELINUX
```shell
$ sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
$ setenforce 0
```

- 时间同步
```shell
$ yum -y install ntpdate
$ ntpdate ntp1.aliyun.com
$ cat > /var/spool/cron/root << EOF
* */1 * * * ntpdate -u ntp1.aliyun.com > /dev/null 2>&1
EOF
$ hwclock -w
```

- 关闭 swap
```shell
$ swapoff -a  
$ sed -ri 's/.*swap.*/#&/' /etc/fstab
```

- 安装 ipvs
```shell
$ yum -y install ipvsadm ipset sysstat conntrack libseccomp

# 配置 ipvsadm 模块加载
$ cat > /etc/sysconfig/modules/ipvs.modules <<EOF
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack
EOF

# 授权、运行、检查是否加载
$ chmod 755 /etc/sysconfig/modules/ipvs.modules && bash /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack
```

- 内核路由转发及网桥过滤，配置内核加载`br_netfilter`和`iptables`放行`ipv6`和`ipv4`的流量，确保集群内的容器能够正常通信。
```shell
# 添加网桥过滤及内核转发配置文件
$ cat > /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
vm.swappiness = 0
EOF

# 加载 br_netfilter 模块
$ modprobe br_netfilter

# 验证
$ lsmod | grep br_netfilter
br_netfilter           22256  0
bridge                151336  1 br_netfilter
```

- 免密登录，在 k8s-master01 节点上执行即可，复制公钥到其它节点。
```shell
$ ssh-keygen
$ ssh-copy-id root@k8s-master02
```

## 部署负载均衡器
> [!NOTE] 注意：
> 以下操作在 ha1、ha2 节点上执行。

- 安装 Haproxy、Keepalived
```shell
$ yum -y install haproxy keepalived
```

- Haproxy 配置文件，所有节点都相同。
```shell
$ cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg-back
$ cat > /etc/haproxy/haproxy.cfg << "EOF"
global
 maxconn 2000
 ulimit-n 16384
 log 127.0.0.1 local0 err
 stats timeout 30s

defaults
 log global
 mode http
 option httplog
 timeout connect 5000
 timeout client 50000
 timeout server 50000
 timeout http-request 15s
 timeout http-keep-alive 15s

frontend monitor-in
 bind *:33305
 mode http
 option httplog
 monitor-uri /monitor

frontend k8s-master
 bind 0.0.0.0:6443
 bind 127.0.0.1:6443
 mode tcp
 option tcplog
 tcp-request inspect-delay 5s
 default_backend k8s-master

backend k8s-master
 mode tcp
 option tcplog
 option tcp-check
 balance roundrobin
 default-server inter 10s downinter 5s rise 2 fall 2 slowstart 60s maxconn 250 maxqueue 256 weight 100
 server  k8s-master01  11.0.1.142:6443 check
 server  k8s-master02  11.0.1.143:6443 check
 server  k8s-master03  11.0.1.144:6443 check
EOF
```

- Keepalived 配置文件
> ha1 节点：
```shell
$ cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf-back
$ cat > /etc/keepalived/keepalived.conf << "EOF"
! Configuration File for keepalived
global_defs {
   router_id LVS_DEVEL
script_user root
   enable_script_security
}
vrrp_script chk_apiserver {
   script "/etc/keepalived/check_apiserver.sh"
   interval 5
   weight -5
   fall 2 
rise 1
}
vrrp_instance VI_1 {
   state MASTER
   interface ens33
   mcast_src_ip 11.0.1.140
   virtual_router_id 51
   priority 100
   advert_int 2
   authentication {
       auth_type PASS
       auth_pass K8SHA_KA_AUTH
   }
   virtual_ipaddress {
       11.0.1.100
   }
   track_script {
      chk_apiserver
   }
}
EOF
```

> ha2 节点：
```shell
$ cat > /etc/keepalived/keepalived.conf << "EOF"
! Configuration File for keepalived
global_defs {
   router_id LVS_DEVEL
script_user root
   enable_script_security
}
vrrp_script chk_apiserver {
   script "/etc/keepalived/check_apiserver.sh"
  interval 5
   weight -5
   fall 2 
rise 1
}
vrrp_instance VI_1 {
   state BACKUP
   interface ens33
   mcast_src_ip 11.0.1.141
   virtual_router_id 51
   priority 99
   advert_int 2
   authentication {
       auth_type PASS
       auth_pass K8SHA_KA_AUTH
   }
   virtual_ipaddress {
       11.0.1.100
   }
   track_script {
      chk_apiserver
   }
}
EOF
```

- 健康检查脚本
> ha1 节点：
```shell
$ cat > /etc/keepalived/check_apiserver.sh <<"EOF"
#!/bin/bash
err=0
for k in $(seq 1 3)
do
   check_code=$(pgrep haproxy)
   if [[ $check_code == "" ]]; then
       err=$(expr $err + 1)
       sleep 1
       continue
   else
       err=0
       break
   fi
done

if [[ $err != "0" ]]; then
   echo "systemctl stop keepalived"
   /usr/bin/systemctl stop keepalived
   exit 1
else
   exit 0
fi
EOF

$ chmod +x /etc/keepalived/check_apiserver.sh
```
> ha2 节点：
```shell
$ cat > /etc/keepalived/check_apiserver.sh <<"EOF"
#!/bin/bash
err=0
for k in $(seq 1 3)
do
   check_code=$(pgrep haproxy)
   if [[ $check_code == "" ]]; then
       err=$(expr $err + 1)
       sleep 1
       continue
   else
       err=0
       break
   fi
done

if [[ $err != "0" ]]; then
   echo "systemctl stop keepalived"
   /usr/bin/systemctl stop keepalived
   exit 1
else
   exit 0
fi
EOF

$ chmod +x /etc/keepalived/check_apiserver.sh
```

- 启动 Haproxy、Keepalived，ha1、ha2 均执行
```shell
$ systemctl enable haproxy keepalived --now
```

- 验证
```shell
$ ip a s
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:aa:5c:b4 brd ff:ff:ff:ff:ff:ff
    inet 11.0.1.141/24 brd 11.0.1.255 scope global noprefixroute ens33
       valid_lft forever preferred_lft forever
    inet 11.0.1.100/32 scope global ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::6305:76c5:ac2c:894e/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```

## 部署 ETCD 

> [!NOTE] 注意：
> 以下操作在 k8s-master01 节点上执行。

- 创建工作目录
```shell
$ mkdir -p /data/k8s
```

- 获取 cfssl 工具
> [!NOTE] cfssl：
> cfssl 是使用 go 编写，由 CloudFlare 开源的一款 PKI/TLS 工具。地址：https://github.com/cloudflare/cfssl 主要程序有：   
> cfssl：CFSSL 的命令行工具；     
> cfssljson：用来从 cfssl 程序获取 JSON 输出，并将证书，密钥，CSR 和 bundle 写入文件中。

```shell
# cfssl
$ cd /data/k8s
$ wget https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssl_1.6.4_linux_amd64
$ mv cfssl_1.6.4_linux_amd64 /usr/local/bin/cfssl
$ chmod +x /usr/local/bin/cfssl

# cfssljson
$ wget https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssljson_1.6.4_linux_amd64
$ mv cfssljson_1.6.4_linux_amd64 /usr/local/bin/cfssljson
$ chmod +x /usr/local/bin/cfssljson

# cfssl-certinfo
$ wget https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssl-certinfo_1.6.4_linux_amd64
$ mv cfssl-certinfo_1.6.4_linux_amd64 /usr/local/bin/cfssl-certinfo
$ chmod +x /usr/local/bin/cfssl-certinfo
```

- 创建 CA 证书
```shell
# CA 证书请求文件
$ cat > ca-csr.json <<"EOF"
{
  "CN": "kubernetes",
  "key": {
      "algo": "rsa",
      "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Chengdu",
      "L": "Chengdu",
      "O": "kubemsb",
      "OU": "CN"
    }
  ],
  "ca": {
          "expiry": "87600h"
  }
}
EOF
```

创建 CA 证书：
```shell
$ cfssl gencert -initca ca-csr.json | cfssljson -bare ca
$ ls
ca.csr  ca-csr.json  ca-key.pem  ca.pem
```

- CA 证书策略
```shell
$ cat > ca-config.json <<"EOF"
{
  "signing": {
      "default": {
          "expiry": "87600h"
        },
      "profiles": {
          "kubernetes": {
              "usages": [
                  "signing",
                  "key encipherment",
                  "server auth",
                  "client auth"
              ],
              "expiry": "87600h"
          }
      }
  }
}
EOF

# server auth 表示 client 可以对使用该 ca 对 server 提供的证书进行验证
# client auth 表示 server 可以使用该 ca 对 client 提供的证书进行验证
```

- 创建 etcd 证书
```shell
$ cat > etcd-csr.json <<"EOF"
{
  "CN": "etcd",
  "hosts": [
    "127.0.0.1",
    "11.0.1.142",
    "11.0.1.143",
    "11.0.1.144"
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [{
    "C": "CN",
    "ST": "Chengdu",
    "L": "Chengdu",
    "O": "kubemsb",
    "OU": "CN"
  }]
}
EOF
```

- 生成 etcd 证书
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes etcd-csr.json | cfssljson  -bare etcd
$ ls
ca-config.json  ca.csr  ca-csr.json  ca-key.pem  ca.pem  etcd.csr  etcd-csr.json  etcd-key.pem  etcd.pem
```

- 下载 etcd 软件包
```shell
$ wget https://github.com/etcd-io/etcd/releases/download/v3.5.9/etcd-v3.5.9-linux-amd64.tar.gz
```

- etcd 软件分发
```shell
$ tar xvf etcd-v3.5.9-linux-amd64.tar.gz
$ cp -p etcd-v3.5.9-linux-amd64/etcd* /usr/local/bin/
$ for i in k8s-master02 k8s-master03;do scp etcd-v3.5.9-linux-amd64/etcd* $i:/usr/local/bin/;done
```

- etcd 配置文件   
> k8s-master01
```shell
$ mkdir /etc/etcd
$ cat >  /etc/etcd/etcd.conf << "EOF"
#[Member]
ETCD_NAME="etcd1"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://11.0.1.142:2380"
ETCD_LISTEN_CLIENT_URLS="https://11.0.1.142:2379,http://127.0.0.1:2379"

#[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://11.0.1.142:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://11.0.1.142:2379"
ETCD_INITIAL_CLUSTER="etcd1=https://11.0.1.142:2380,etcd2=https://11.0.1.143:2380,etcd3=https://11.0.1.144:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
EOF
```

> k8s-master02
```shell
$ mkdir /etc/etcd
$ cat >  /etc/etcd/etcd.conf <<"EOF"
#[Member]
ETCD_NAME="etcd2"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://11.0.1.143:2380"
ETCD_LISTEN_CLIENT_URLS="https://11.0.1.143:2379,http://127.0.0.1:2379"

#[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://11.0.1.143:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://11.0.1.143:2379"
ETCD_INITIAL_CLUSTER="etcd1=https://11.0.1.142:2380,etcd2=https://11.0.1.143:2380,etcd3=https://11.0.1.144:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
EOF
```

> k8s-master03
```shell
$ mkdir /etc/etcd
$ cat >  /etc/etcd/etcd.conf << "EOF"
#[Member]
ETCD_NAME="etcd3"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://11.0.1.144:2380"
ETCD_LISTEN_CLIENT_URLS="https://11.0.1.144:2379,http://127.0.0.1:2379"

#[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://11.0.1.144:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://11.0.1.144:2379"
ETCD_INITIAL_CLUSTER="etcd1=https://11.0.1.142:2380,etcd2=https://11.0.1.143:2380,etcd3=https://11.0.1.144:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
EOF
```

```
说明：
ETCD_NAME：节点名称，集群中唯一
ETCD_DATA_DIR：数据目录
ETCD_LISTEN_PEER_URLS：集群通信监听地址
ETCD_LISTEN_CLIENT_URLS：客户端访问监听地址
ETCD_INITIAL_ADVERTISE_PEER_URLS：集群通告地址
ETCD_ADVERTISE_CLIENT_URLS：客户端通告地址
ETCD_INITIAL_CLUSTER：集群节点地址
ETCD_INITIAL_CLUSTER_TOKEN：集群Token
ETCD_INITIAL_CLUSTER_STATE：加入集群的当前状态，new是新集群，existing表示加入已有集群
```

- 准备证书文件及创建 etcd 服务配置文件
```shell
$ mkdir -p /etc/etcd/ssl
$ mkdir -p /var/lib/etcd/default.etcd
$ cp ca*.pem /etc/etcd/ssl
$ cp etcd*.pem /etc/etcd/ssl
$ for i in k8s-master02 k8s-master03;do scp ca*.pem etcd*.pem $i:/etc/etcd/ssl/;done
```

- 服务配置文件，所有节点配置一样。
```shell
$ cat > /etc/systemd/system/etcd.service <<"EOF"
[Unit]
Description=Etcd Server
After=network.target
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
EnvironmentFile=-/etc/etcd/etcd.conf
WorkingDirectory=/var/lib/etcd/
ExecStart=/usr/local/bin/etcd \
  --cert-file=/etc/etcd/ssl/etcd.pem \
  --key-file=/etc/etcd/ssl/etcd-key.pem \
  --trusted-ca-file=/etc/etcd/ssl/ca.pem \
  --peer-cert-file=/etc/etcd/ssl/etcd.pem \
  --peer-key-file=/etc/etcd/ssl/etcd-key.pem \
  --peer-trusted-ca-file=/etc/etcd/ssl/ca.pem \
  --peer-client-cert-auth \
  --client-cert-auth
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```

- 启动 etcd 集群
```shell
$ systemctl daemon-reload
$ systemctl enable etcd --now
$ systemctl status etcd
```

- 验证 etcd 集群状态
```shell
$ etcdctl member list
$ etcdctl member list -w table

$ ETCDCTL_API=3 /usr/local/bin/etcdctl --write-out=table --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/etcd.pem --key=/etc/etcd/ssl/etcd-key.pem --endpoints=https://11.0.1.142:2379,https://11.0.1..143:2379,https://11.0.1..144:2379 endpoint health

$ ETCDCTL_API=3 /usr/local/bin/etcdctl --write-out=table --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/etcd.pem --key=/etc/etcd/ssl/etcd-key.pem --endpoints=https://11.0.1.142:2379,https://11.0.1.143:2379,https://11.0.1.144:2379 endpoint status
```

## 部署 K8S 集群

- 下载 kubernetes 软件包
```shell
$ wget https://dl.k8s.io/v1.28.0/kubernetes-server-linux-amd64.tar.gz
$ tar xf kubernetes-server-linux-amd64.tar.gz
$ cd kubernetes/server/bin/
$ cp kube-apiserver kube-controller-manager kube-scheduler kubectl /usr/local/bin/
```

- 分发 kubernetes 软件包
```shell
$ for i in k8s-master02 k8s-master03;do scp kube-apiserver kube-controller-manager kube-scheduler kubectl $i:/usr/local/bin/;done
$ for i in k8s-node01 k8s-node02;do scp kubelet kube-proxy $i:/usr/local/bin/;done
```

- 创建 kubernetes 目录
```shell
$ mkdir -p /etc/kubernetes/        
$ mkdir -p /etc/kubernetes/ssl     
$ mkdir -p /var/log/kubernetes 
```

- 创建 apiserver 证书请求文件
```shell
$ cat > kube-apiserver-csr.json << "EOF"
{
"CN": "kubernetes",
  "hosts": [
    "127.0.0.1",
    "11.0.1.142",
    "11.0.1.143",
    "11.0.1.144",
    "11.0.1.145",
    "11.0.1.146",
    "11.0.1.100",
    "10.96.0.1",
    "kubernetes",
    "kubernetes.default",
    "kubernetes.default.svc",
    "kubernetes.default.svc.cluster",
    "kubernetes.default.svc.cluster.local"
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Chengdu",
      "L": "Chengdu",
      "O": "kubemsb",
      "OU": "CN"
    }
  ]
}
EOF
```

> [!NOTE] 说明：
> 如果 hosts 字段不为空则需要指定授权使用该证书的 IP（含VIP） 或域名列表，由于该证书被集群使用，需要将节点的 IP 都填上，为了方便后期扩容可以多写几个预留的 IP。同时还需要填写 service 网络的首个IP(一般是 kube-apiserver 指定的 service-cluster-ip-range 网段的第一个IP，如 10.96.0.1)。

- 生成 apiserver 证书
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-apiserver-csr.json | cfssljson -bare kube-apiserver
```

- 创建 TLS 机制所需 TOKEN
> [!NOTE] 说明：
> apiserver 启用 TLS 认证后，Node 节点 kubelet 和 kube-proxy 与 kube-apiserver 进行通信，必须使用 CA 签发的有效证书才可以，当 Node 节点很多时，这种客户端证书颁发需要大量工作，同样也会增加集群扩展复杂度。为了简化流程，Kubernetes 引入了 TLS bootstraping 机制来自动颁发客户端证书，kubelet 会以一个低权限用户自动向 apiserver 申请证书，kubelet 的证书由 apiserver 动态签署。所以强烈建议在 Node 上使用这种方式，目前主要用于 kubelet，kube-proxy 还是由我们统一颁发一个证书。

```shell
$ cat > token.csv << EOF
$(head -c 16 /dev/urandom | od -An -t x | tr -d ' '),kubelet-bootstrap,10001,"system:kubelet-bootstrap"
EOF
```

- 创建 apiserver 服务配置文件
```shell
$ cat > /etc/kubernetes/kube-apiserver.conf << "EOF"
KUBE_APISERVER_OPTS="--enable-admission-plugins=NamespaceLifecycle,NodeRestriction,LimitRanger,ServiceAccount,DefaultStorageClass,ResourceQuota \
  --anonymous-auth=false \
  --bind-address=11.0.1.142 \
  --advertise-address=11.0.1.142 \
  --insecure-port=0 \
  --authorization-mode=Node,RBAC \
  --runtime-config=api/all=true \
  --enable-bootstrap-token-auth \
  --service-cluster-ip-range=10.96.0.0/16 \
  --token-auth-file=/etc/kubernetes/token.csv \
  --service-node-port-range=30000-32767 \
  --tls-cert-file=/etc/kubernetes/ssl/kube-apiserver.pem  \
  --tls-private-key-file=/etc/kubernetes/ssl/kube-apiserver-key.pem \
  --client-ca-file=/etc/kubernetes/ssl/ca.pem \
  --kubelet-client-certificate=/etc/kubernetes/ssl/kube-apiserver.pem \
  --kubelet-client-key=/etc/kubernetes/ssl/kube-apiserver-key.pem \
  --service-account-key-file=/etc/kubernetes/ssl/ca-key.pem \
  --service-account-signing-key-file=/etc/kubernetes/ssl/ca-key.pem  \
  --service-account-issuer=api \
  --etcd-cafile=/etc/etcd/ssl/ca.pem \
  --etcd-certfile=/etc/etcd/ssl/etcd.pem \
  --etcd-keyfile=/etc/etcd/ssl/etcd-key.pem \
  --etcd-servers=https://11.0.1.142:2379,https://11.0.1.143:2379,https://11.0.1.144:2379 \
  --enable-swagger-ui=true \
  --allow-privileged=true \
  --apiserver-count=3 \
  --audit-log-maxage=30 \
  --audit-log-maxbackup=3 \
  --audit-log-maxsize=100 \
  --audit-log-path=/var/log/kube-apiserver-audit.log \
  --event-ttl=1h \
  --v=4"
EOF
```

- 创建 apiserver 服务管理配置文件
```shell
$ cat > /etc/systemd/system/kube-apiserver.service << "EOF"
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/kubernetes/kubernetes
After=etcd.service
Wants=etcd.service

[Service]
EnvironmentFile=-/etc/kubernetes/kube-apiserver.conf
ExecStart=/usr/local/bin/kube-apiserver $KUBE_APISERVER_OPTS
Restart=on-failure
RestartSec=5
Type=notify
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```

- 分发证书及 token 文件到各 master 节点
```shell
$ cp ca*.pem kube-apiserver*.pem /etc/kubernetes/ssl/
$ cp token.csv /etc/kubernetes/

$ scp ca*.pem kube-apiserver*.pem k8s-master02:/etc/kubernetes/ssl/
$ scp token.csv k8s-master02:/etc/kubernetes/

$ scp ca*.pem kube-apiserver*.pem k8s-master03:/etc/kubernetes/ssl/
$ scp token.csv k8s-master03:/etc/kubernetes/
```

- 启动 apiserver 服务
```shell
$ systemctl daemon-reload
$ systemctl enable kube-apiserver --now 
$ systemctl status kube-apiserver
```

- 验证 apiserver
```shell
$ curl --insecure https://11.0.1.142:6443/
$ curl --insecure https://11.0.1.100:6443/
```

- kubectl 部署

创建 kubectl 证书请求文件
> [!NOTE] 说明：
> 后续 kube-apiserver 使用 RBAC 对客户端(如 kubelet、kube-proxy、Pod)请求进行授权；
kube-apiserver 预定义了一些 RBAC 使用的 RoleBindings，如 cluster-admin 将 Group system:masters 与 Role cluster-admin 绑定，该 Role 授予了调用 kube-apiserver 的所有 API 的权限；

```shell
$ cat > admin-csr.json << "EOF"
{
  "CN": "admin",
  "hosts": [],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Beijing",
      "L": "Beijing",
      "O": "system:masters",             
      "OU": "system"
    }
  ]
}
EOF
```

> [!NOTE] 说明：
> 这个admin 证书，是将来生成管理员用的 kubeconfig 配置文件用的，现在我们一般建议使用 RBAC 来对 kubernetes 进行角色权限控制，kubernetes 将证书中的CN 字段 作为 User，O 字段作为 Group；"O": "system:masters", 必须是 system:masters，否则后面 kubectl create clusterrolebinding 报错。

- 生成 admin 证书文件
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes admin-csr.json | cfssljson -bare admin
```

- 复制 admin 证书到指定目录
```shell
$ cp admin*.pem /etc/kubernetes/ssl/
```

- 生成 admin 配置文件 kubeconfig
> [!NOTE] 说明：
> kube.config 为 kubectl 的配置文件，包含访问 apiserver 的所有信息，如 apiserver 地址、CA 证书和自身使用的证书
```shell
$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://11.0.1.100:6443 --kubeconfig=kube.config

$ kubectl config set-credentials admin --client-certificate=admin.pem --client-key=admin-key.pem --embed-certs=true --kubeconfig=kube.config

$ kubectl config set-context kubernetes --cluster=kubernetes --user=admin --kubeconfig=kube.config

$ kubectl config use-context kubernetes --kubeconfig=kube.config
```

- 准备 kubectl 配置文件并进行角色绑定
```shell
$ mkdir ~/.kube
$ cp kube.config ~/.kube/config
$ kubectl create clusterrolebinding kube-apiserver:kubelet-apis --clusterrole=system:kubelet-api-admin --user kubernetes --kubeconfig=/root/.kube/config
```

- 查看集群状态
```shell
$ kubectl cluster-info
$ kubectl get componentstatuses
$ kubectl get all --all-namespaces
```

- 同步 kubectl 配置文件到其它 master 节点
```shell
$ scp /root/.kube/config k8s-master02:/root/.kube/config
$ scp /root/.kube/config k8s-master03:/root/.kube/config
```

- 配置 kubectl 命令补全功能
```shell
$ yum install -y bash-completion
$ source /usr/share/bash-completion/bash_completion
$ source <(kubectl completion bash)
$ kubectl completion bash > ~/.kube/completion.bash.inc
$ source '/root/.kube/completion.bash.inc'  
$ source $HOME/.bash_profile
```

- 部署 kube-controller-manager

创建 kube-controller-manager 证书请求文件
```shell
$ cat > kube-controller-manager-csr.json << "EOF"
{
    "CN": "system:kube-controller-manager",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "hosts": [
      "127.0.0.1",
      "11.0.1.142",
      "11.0.1.143",
      "11.0.1.144"
    ],
    "names": [
      {
        "C": "CN",
        "ST": "Chengdu",
        "L": "Chengdu",
        "O": "system:kube-controller-manager",
        "OU": "system"
      }
    ]
}
EOF
```

> [!NOTE] 说明：
> hosts 列表包含所有 kube-controller-manager 节点 IP；CN 为 system:kube-controller-manager、O 为 system:kube-controller-manager，kubernetes 内置的 ClusterRoleBindings system:kube-controller-manager 赋予 kube-controller-manager 工作所需的权限。


- 创建 kube-controller-manager 证书文件
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-controller-manager-csr.json | cfssljson -bare kube-controller-manager
```

- 创建 kube-controller-manager 的 config 文件
```shell
$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://11.0.1.100:6443 --kubeconfig=kube-controller-manager.kubeconfig

$ kubectl config set-credentials system:kube-controller-manager --client-certificate=kube-controller-manager.pem --client-key=kube-controller-manager-key.pem --embed-certs=true --kubeconfig=kube-controller-manager.kubeconfig

$ kubectl config set-context system:kube-controller-manager --cluster=kubernetes --user=system:kube-controller-manager --kubeconfig=kube-controller-manager.kubeconfig

$ kubectl config use-context system:kube-controller-manager --kubeconfig=kube-controller-manager.kubeconfig
```

- 创建 kube-controller-manager 服务配置文件
```shell
cat > /etc/kubernetes/kube-controller-manager.conf << "EOF"
KUBE_CONTROLLER_MANAGER_OPTS=" \
  --secure-port=10257 \
  --bind-address=127.0.0.1 \
  --kubeconfig=/etc/kubernetes/kube-controller-manager.kubeconfig \
  --service-cluster-ip-range=10.96.0.0/16 \
  --cluster-name=kubernetes \
  --cluster-signing-cert-file=/etc/kubernetes/ssl/ca.pem \
  --cluster-signing-key-file=/etc/kubernetes/ssl/ca-key.pem \
  --allocate-node-cidrs=true \
  --cluster-cidr=10.244.0.0/16 \
  --root-ca-file=/etc/kubernetes/ssl/ca.pem \
  --service-account-private-key-file=/etc/kubernetes/ssl/ca-key.pem \
  --leader-elect=true \
  --feature-gates=RotateKubeletServerCertificate=true \
  --controllers=*,bootstrapsigner,tokencleaner \
  --tls-cert-file=/etc/kubernetes/ssl/kube-controller-manager.pem \
  --tls-private-key-file=/etc/kubernetes/ssl/kube-controller-manager-key.pem \
  --use-service-account-credentials=true \
  --v=2"
EOF
```

- 创建 kube-controller-manager 服务启动配置文件
```shell
$ cat > /usr/lib/systemd/system/kube-controller-manager.service << "EOF"
[Unit]
Description=Kubernetes Controller Manager
Documentation=https://github.com/kubernetes/kubernetes

[Service]
EnvironmentFile=-/etc/kubernetes/kube-controller-manager.conf
ExecStart=/usr/local/bin/kube-controller-manager $KUBE_CONTROLLER_MANAGER_OPTS
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

- 同步 kube-controller-manager 证书文件到集群 master 节点
```shell
$ cp kube-controller-manager*.pem /etc/kubernetes/ssl/
$ cp kube-controller-manager.kubeconfig /etc/
kubernetes/

$ scp kube-controller-manager*.pem k8s-master02:/etc/kubernetes/ssl/
$ scp kube-controller-manager.kubeconfig k8s-master02:/etc/kubernetes/

$ scp kube-controller-manager*.pem k8s-master03:/etc/kubernetes/ssl/
$ scp kube-controller-manager.kubeconfig k8s-master03:/etc/kubernetes/
```

- 查看证书
```shell
$ openssl x509 -in /etc/kubernetes/ssl/kube-controller-manager.pem -noout -text
```

- 启动 kube-controller-manager 服务
```shell
$ systemctl daemon-reload 
$ systemctl enable kube-controller-manager --now 
$ systemctl status kube-controller-manager

$ kubectl get cs
```

- 部署 kube-scheduler

创建 kube-scheduler 证书请求文件
```shell
$ cat > kube-scheduler-csr.json << "EOF"
{
    "CN": "system:kube-scheduler",
    "hosts": [
      "127.0.0.1",
      "11.0.1.142",
      "11.0.1.143",
      "11.0.1.144"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
      {
        "C": "CN",
        "ST": "Chengdu",
        "L": "Chengdu",
        "O": "system:kube-scheduler",
        "OU": "system"
      }
    ]
}
EOF
```

- 生成 kube-scheduler 证书
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-scheduler-csr.json | cfssljson -bare kube-scheduler
```

- 创建 kube-scheduler 的 kubeconfig
```shell
$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://192.168.10.100:6443 --kubeconfig=kube-scheduler.kubeconfig

$ kubectl config set-credentials system:kube-scheduler --client-certificate=kube-scheduler.pem --client-key=kube-scheduler-key.pem --embed-certs=true --kubeconfig=kube-scheduler.kubeconfig

$ kubectl config set-context system:kube-scheduler --cluster=kubernetes --user=system:kube-scheduler --kubeconfig=kube-scheduler.kubeconfig

$ kubectl config use-context system:kube-scheduler --kubeconfig=kube-scheduler.kubeconfig
```

- 创建 kube-scheduler 服务配置文件
```shell
$ cat > /etc/kubernetes/kube-scheduler.conf << "EOF"
KUBE_SCHEDULER_OPTS=" \
--kubeconfig=/etc/kubernetes/kube-scheduler.kubeconfig \
--leader-elect=true \
--v=2"
EOF
```

- 创建 kube-scheduler 服务启动配置文件
```shell
$ cat > /usr/lib/systemd/system/kube-scheduler.service << "EOF"
[Unit]
Description=Kubernetes Scheduler
Documentation=https://github.com/kubernetes/kubernetes

[Service]
EnvironmentFile=-/etc/kubernetes/kube-scheduler.conf
ExecStart=/usr/local/bin/kube-scheduler $KUBE_SCHEDULER_OPTS
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

- 同步证书文件到 master 节点
```shell
$ cp kube-scheduler*.pem /etc/kubernetes/ssl/
$ cp kube-scheduler.kubeconfig /etc/kubernetes/

$ scp kube-scheduler*.pem k8s-master02:/etc/kubernetes/ssl/
$ scp kube-scheduler.kubeconfig k8s-master02:/etc/kubernetes/

$ scp kube-scheduler*.pem k8s-master03:/etc/kubernetes/ssl/
$ scp kube-scheduler.kubeconfig k8s-master03:/etc/kubernetes/
```

- 启动 kube-scheduler 服务
```shell
$ systemctl daemon-reload
$ systemctl enable --now kube-scheduler
$ systemctl status kube-scheduler

$ kubectl get cs
```


- Node 节点部署

容器运行时 Docker 部署
```shell
$ wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
$ yum -y install docker-ce
$ systemctl enable --now docker
```

修改 Docker 配置
```shell
$ cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF

$ sysstemctl restart docker
```

- cri-dockerd 安装
> [!NOTE] cri-dockerd：
> 地址：https://github.com/Mirantis/cri-dockerd/

```shell
$ wget https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.4/cri-dockerd-0.3.4-3.el7.x86_64.rpm
$  yum install cri-dockerd-0.3.4-3.el7.x86_64.rpm

$ vim /usr/lib/systemd/system/cri-docker.service
# 修改第10行内容
ExecStart=/usr/bin/cri-dockerd --pod-infra-container-image=registry.k8s.io/pause:3.9 --container-runtime-endpoint fd://


$ systemctl enable cri-docker --now  
```

> [!NOTE] 容器运行时的说明：
> 如果使用的是 containerd，则 --container-runtime-endpoint 设置为：unix:///run/containerd/containerd.sock

- kubelet 部署

创建 kubelet-bootstrap 的 kubeconfig
```shell
$ BOOTSTRAP_TOKEN=$(awk -F "," '{print $1}' /etc/kubernetes/token.csv)

$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://11.0.1.100:6443 --kubeconfig=kubelet-bootstrap.kubeconfig

$ kubectl config set-credentials kubelet-bootstrap --token=${BOOTSTRAP_TOKEN} --kubeconfig=kubelet-bootstrap.kubeconfig

$ kubectl config set-context default --cluster=kubernetes --user=kubelet-bootstrap --kubeconfig=kubelet-bootstrap.kubeconfig

$ kubectl config use-context default --kubeconfig=kubelet-bootstrap.kubeconfig
```

```shell
$ kubectl create clusterrolebinding cluster-system-anonymous --clusterrole=cluster-admin --user=kubelet-bootstrap

$ kubectl create clusterrolebinding kubelet-bootstrap --clusterrole=system:node-bootstrapper --user=kubelet-bootstrap --kubeconfig=kubelet-bootstrap.kubeconfig

$ kubectl describe clusterrolebinding cluster-system-anonymous

$ kubectl describe clusterrolebinding kubelet-bootstrap
```

- 创建 kubelet 配置文件

> k8s-node01
```shell
$ cat >  /etc/kubernetes/kubelet.json << "EOF"
{
  "kind": "KubeletConfiguration",
  "apiVersion": "kubelet.config.k8s.io/v1beta1",
  "authentication": {
    "x509": {
      "clientCAFile": "/etc/kubernetes/ssl/ca.pem"
    },
    "webhook": {
      "enabled": true,
      "cacheTTL": "2m0s"
    },
    "anonymous": {
      "enabled": false
    }
  },
  "authorization": {
    "mode": "Webhook",
    "webhook": {
      "cacheAuthorizedTTL": "5m0s",
      "cacheUnauthorizedTTL": "30s"
    }
  },
  "address": "11.0.1.145",
  "port": 10250,
  "readOnlyPort": 10255,
  "cgroupDriver": "systemd",                    
  "hairpinMode": "promiscuous-bridge",
  "serializeImagePulls": false,
  "clusterDomain": "cluster.local.",
  "clusterDNS": ["10.96.0.2"]
}
EOF
```

> k8s-node02
```shell
$ cat > /etc/kubernetes/kubelet.json << "EOF"
{
  "kind": "KubeletConfiguration",
  "apiVersion": "kubelet.config.k8s.io/v1beta1",
  "authentication": {
    "x509": {
      "clientCAFile": "/etc/kubernetes/ssl/ca.pem"
    },
    "webhook": {
      "enabled": true,
      "cacheTTL": "2m0s"
    },
    "anonymous": {
      "enabled": false
    }
  },
  "authorization": {
    "mode": "Webhook",
    "webhook": {
      "cacheAuthorizedTTL": "5m0s",
      "cacheUnauthorizedTTL": "30s"
    }
  },
  "address": "11.0.1.146",
  "port": 10250,
  "readOnlyPort": 10255,
  "cgroupDriver": "systemd",                    
  "hairpinMode": "promiscuous-bridge",
  "serializeImagePulls": false,
  "clusterDomain": "cluster.local.",
  "clusterDNS": ["10.96.0.2"]
}
EOF
```

- 创建 kubelet 服务配置文件
```shell
$ cat > /usr/lib/systemd/system/kubelet.service << "EOF"
[Unit]
Description=Kubernetes Kubelet
Documentation=https://github.com/kubernetes/kubernetes
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/var/lib/kubelet
ExecStart=/usr/local/bin/kubelet \
  --bootstrap-kubeconfig=/etc/kubernetes/kubelet-bootstrap.kubeconfig \
  --cert-dir=/etc/kubernetes/ssl \
  --kubeconfig=/etc/kubernetes/kubelet.kubeconfig \
  --config=/etc/kubernetes/kubelet.json \
  --rotate-certificates \
  --container-runtime-endpoint=unix:///run/cri-dockerd.sock \
  --pod-infra-container-image=registry.k8s.io/pause:3.9 \
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

- 分发 CA 证书及 kubelet-bootstrap.kubeconfig 文件
```shell
$ for i in k8s-node01 k8s-node02;do scp kubelet-bootstrap.kubeconfig $i:/etc/kubernetes;done
$ for i in k8s-node01 k8s-node02;do scp ca.pem $i:/etc/kubernetes/ssl;done
```

- 创建目录及启动 kubelet 服务
```shell
$ mkdir -p /var/lib/kubelet
$ systemctl daemon-reload
$ systemctl enable kubelet --now 
$ systemctl status kubelet

$ kubectl get nodes
$ kubectl get csr
```

确认 kubelet 服务启动成功后，接着到 master 上 Approve 一下 bootstrap 请求。
```shell
$ kubectl describe node | grep Runtime
```

- kube-proxy 部署
创建 kube-proxy 证书请求文件
```shell
$ cat > kube-proxy-csr.json << "EOF"
{
  "CN": "system:kube-proxy",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Chengdu",
      "L": "Chengdu",
      "O": "kubemsb",
      "OU": "CN"
    }
  ]
}
EOF
```

- 生成 kube-proxy 证书
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-proxy-csr.json | cfssljson -bare kube-proxy
```

- 生成 kube-proxy 的 kubeconfig 文件
```shell
$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://11.0.1.100:6443 --kubeconfig=kube-proxy.kubeconfig

$ kubectl config set-credentials kube-proxy --client-certificate=kube-proxy.pem --client-key=kube-proxy-key.pem --embed-certs=true --kubeconfig=kube-proxy.kubeconfig

$ kubectl config set-context default --cluster=kubernetes --user=kube-proxy --kubeconfig=kube-proxy.kubeconfig

$ kubectl config use-context default --kubeconfig=kube-proxy.kubeconfig
```

- 创建 kube-proxy 服务配置文件
> k8s-node01
```shell
$ cat > /etc/kubernetes/kube-proxy.yaml << "EOF"
apiVersion: kubeproxy.config.k8s.io/v1alpha1
bindAddress: 11.0.1.145
clientConnection:
  kubeconfig: /etc/kubernetes/kube-proxy.kubeconfig
clusterCIDR: 10.244.0.0/16
healthzBindAddress: 11.0.1.145:10256
kind: KubeProxyConfiguration
metricsBindAddress: 11.0.1.145:10249
mode: "ipvs"
EOF
```


> k8s-node01
```shell
$ cat > /etc/kubernetes/kube-proxy.yaml << "EOF"
apiVersion: kubeproxy.config.k8s.io/v1alpha1
bindAddress: 11.0.1.146
clientConnection:
  kubeconfig: /etc/kubernetes/kube-proxy.kubeconfig
clusterCIDR: 10.244.0.0/16
healthzBindAddress: 11.0.1.146:10256
kind: KubeProxyConfiguration
metricsBindAddress: 11.0.1.146:10249
mode: "ipvs"
EOF
```

- 创建 kube-proxy 服务启动配置文件
```shell
$ cat >  /usr/lib/systemd/system/kube-proxy.service << "EOF"
[Unit]
Description=Kubernetes Kube-Proxy Server
Documentation=https://github.com/kubernetes/kubernetes
After=network.target

[Service]
WorkingDirectory=/var/lib/kube-proxy
ExecStart=/usr/local/bin/kube-proxy \
  --config=/etc/kubernetes/kube-proxy.yaml \
  --v=2
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
```

- 同步 kube-proxy 文件到 node 节点
```shell
$ for i in k8s-node01 k8s-node02;do scp kube-proxy*.pem $i:/etc/kubernetes/ssl/; done
$ for i in k8s-node01 k8s-node02;do scp kube-proxy.kubeconfig $i:/etc/kubernetes/; done
```

- kube-proxy 服务启动
```shell
$ mkdir -p /var/lib/kube-proxy
$ systemctl daemon-reload
$ systemctl enable kube-proxy --now 
$ systemctl status kube-proxy
```

## 网络插件部署

> [!TIP] calico 参考网址：  
> https://projectcalico.docs.tigera.io/about/about-calico

- 应用 operator 资源清单文件
```shell
$ kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml
```

- 通过自定义资源方式安装
```shell
$ wget https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/custom-resources.yaml
```

```shell
$ vim custom-resources.yaml
# 修改文件第13行，修改为使用kubeadm init ----pod-network-cidr对应的IP地址段
......
 11     ipPools:
 12     - blockSize: 26
 13       cidr: 10.244.0.0/16 
 14       encapsulation: VXLANCrossSubnet
......
```

- 应用资源清单文件
```shell
$ kubectl create -f custom-resources.yaml
$ watch kubectl get pods -n calico-system
```

## coredns 部署

> k8s-master01
```shell
$ cat >  coredns.yaml << "EOF"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: coredns
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:coredns
rules:
  - apiGroups:
    - ""
    resources:
    - endpoints
    - services
    - pods
    - namespaces
    verbs:
    - list
    - watch
  - apiGroups:
    - discovery.k8s.io
    resources:
    - endpointslices
    verbs:
    - list
    - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:coredns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:coredns
subjects:
- kind: ServiceAccount
  name: coredns
  namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health {
          lameduck 5s
        }
        ready
        kubernetes cluster.local  in-addr.arpa ip6.arpa {
          fallthrough in-addr.arpa ip6.arpa
        }
        prometheus :9153
        forward . /etc/resolv.conf {
          max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: kube-dns
    kubernetes.io/name: "CoreDNS"
spec:
  # replicas: not specified here:
  # 1. Default is 1.
  # 2. Will be tuned in real time if DNS horizontal auto-scaling is turned on.
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      k8s-app: kube-dns
  template:
    metadata:
      labels:
        k8s-app: kube-dns
    spec:
      priorityClassName: system-cluster-critical
      serviceAccountName: coredns
      tolerations:
        - key: "CriticalAddonsOnly"
          operator: "Exists"
      nodeSelector:
        kubernetes.io/os: linux
      affinity:
         podAntiAffinity:
           preferredDuringSchedulingIgnoredDuringExecution:
           - weight: 100
             podAffinityTerm:
               labelSelector:
                 matchExpressions:
                   - key: k8s-app
                     operator: In
                     values: ["kube-dns"]
               topologyKey: kubernetes.io/hostname
      containers:
      - name: coredns
        image: coredns/coredns:1.10.1
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: 170Mi
          requests:
            cpu: 100m
            memory: 70Mi
        args: [ "-conf", "/etc/coredns/Corefile" ]
        volumeMounts:
        - name: config-volume
          mountPath: /etc/coredns
          readOnly: true
        ports:
        - containerPort: 53
          name: dns
          protocol: UDP
        - containerPort: 53
          name: dns-tcp
          protocol: TCP
        - containerPort: 9153
          name: metrics
          protocol: TCP
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            add:
            - NET_BIND_SERVICE
            drop:
            - all
          readOnlyRootFilesystem: true
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 60
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 8181
            scheme: HTTP
      dnsPolicy: Default
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
            - key: Corefile
              path: Corefile
---
apiVersion: v1
kind: Service
metadata:
  name: kube-dns
  namespace: kube-system
  annotations:
    prometheus.io/port: "9153"
    prometheus.io/scrape: "true"
  labels:
    k8s-app: kube-dns
    kubernetes.io/cluster-service: "true"
    kubernetes.io/name: "CoreDNS"
spec:
  selector:
    k8s-app: kube-dns
  clusterIP: 10.96.0.2
  ports:
  - name: dns
    port: 53
    protocol: UDP
  - name: dns-tcp
    port: 53
    protocol: TCP
  - name: metrics
    port: 9153
    protocol: TCP
 
EOF
```

```shell
$ kubectl apply -f coredns.yaml
$ kubectl get pods -n kube-system
$ dig -t a www.baidu.com @10.96.0.2
```

## 可用性验证
```shell
$ cat >  nginx.yaml  << "EOF"
---
apiVersion: v1
kind: ReplicationController
metadata:
  name: nginx-web
spec:
  replicas: 2
  selector:
    name: nginx
  template:
    metadata:
      labels:
        name: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.19.6
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service-nodeport
spec:
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30001
      protocol: TCP
  type: NodePort
  selector:
    name: nginx
EOF
```

```shell
$ kubectl apply -f nginx.yaml
$ kubectl get pods -o wide
$ kubectl get svc
```