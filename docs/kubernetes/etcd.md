# 部署 ETCD 集群

> [!NOTE] 注意：
> 以下操作在 k8s-master01 节点上执行。

## 创建工作目录
```shell
$ mkdir -p /data/k8s
```

## 获取 cfssl 工具
> [!NOTE] cfssl：
> cfssl 是使用 go 编写，由 CloudFlare 开源的一款 PKI/TLS 工具。地址：https://github.com/cloudflare/cfssl 主要程序有：   
> cfssl：CFSSL 的命令行工具；     
> cfssljson：用来从 cfssl 程序获取 JSON 输出，并将证书，密钥，CSR 和 bundle 写入文件中。

- 下载 cfssl 工具
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

## 创建 CA 证书

- 创建 CA 证书请求文件
```shell
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

- 创建 CA 证书
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
```

> [!NOTE] 说明：
> server auth 表示 client 可以对使用该 ca 对 server 提供的证书进行验证，client auth 表示 server 可以使用该 ca 对 client 提供的证书进行验证。

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

## 下载 etcd 软件包
```shell
$ wget https://github.com/etcd-io/etcd/releases/download/v3.5.9/etcd-v3.5.9-linux-amd64.tar.gz
```

## etcd 软件分发
```shell
$ tar xvf etcd-v3.5.9-linux-amd64.tar.gz
$ cp -p etcd-v3.5.9-linux-amd64/etcd* /usr/local/bin/
$ for i in k8s-master02 k8s-master03;do scp etcd-v3.5.9-linux-amd64/etcd* $i:/usr/local/bin/;done
```

## etcd 配置文件   
- k8s-master01
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

- k8s-master02
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

- k8s-master03
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

> [!NOTE] 说明：
> ETCD_NAME：节点名称，集群中唯一   
> ETCD_DATA_DIR：数据目录   
> ETCD_LISTEN_PEER_URLS：集群通信监听地址   
> ETCD_LISTEN_CLIENT_URLS：客户端访问监听地址   
> ETCD_INITIAL_ADVERTISE_PEER_URLS：集群通告地址   
> ETCD_ADVERTISE_CLIENT_URLS：客户端通告地址   
> ETCD_INITIAL_CLUSTER：集群节点地址  
> ETCD_INITIAL_CLUSTER_TOKEN：集群 Token   
> ETCD_INITIAL_CLUSTER_STATE：加入集群的当前状态，new是新集群，existing表示加入已有集群  

- 分发证书文件及创建 etcd 服务配置文件
```shell
$ mkdir -p /etc/etcd/ssl
$ mkdir -p /var/lib/etcd/default.etcd
$ cp ca*.pem /etc/etcd/ssl
$ cp etcd*.pem /etc/etcd/ssl
$ for i in k8s-master02 k8s-master03;do scp ca*.pem etcd*.pem $i:/etc/etcd/ssl/;done
```

## 服务配置文件
所有节点配置一样
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

## 启动 etcd 集群
```shell
$ systemctl daemon-reload
$ systemctl enable etcd --now
$ systemctl status etcd
```

## 验证 etcd 集群状态
```shell
$ etcdctl member list
$ etcdctl member list -w table

$ ETCDCTL_API=3 /usr/local/bin/etcdctl --write-out=table --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/etcd.pem --key=/etc/etcd/ssl/etcd-key.pem --endpoints=https://11.0.1.142:2379,https://11.0.1..143:2379,https://11.0.1..144:2379 endpoint health

$ ETCDCTL_API=3 /usr/local/bin/etcdctl --write-out=table --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/etcd.pem --key=/etc/etcd/ssl/etcd-key.pem --endpoints=https://11.0.1.142:2379,https://11.0.1.143:2379,https://11.0.1.144:2379 endpoint status
```