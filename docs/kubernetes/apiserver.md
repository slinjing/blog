# 部署 apiserver

## 下载 kubernetes 软件包
```shell
$ wget https://dl.k8s.io/v1.28.0/kubernetes-server-linux-amd64.tar.gz
$ tar xf kubernetes-server-linux-amd64.tar.gz
$ cd kubernetes/server/bin/
$ cp kube-apiserver kube-controller-manager kube-scheduler kubectl /usr/local/bin/
```

## 分发 kubernetes 软件包
```shell
$ for i in k8s-master02 k8s-master03;do scp kube-apiserver kube-controller-manager kube-scheduler kubectl $i:/usr/local/bin/;done
$ for i in k8s-node01 k8s-node02;do scp kubelet kube-proxy $i:/usr/local/bin/;done
```

## 创建 kubernetes 目录
```shell
$ mkdir -p /etc/kubernetes/        
$ mkdir -p /etc/kubernetes/ssl     
$ mkdir -p /var/log/kubernetes 
```

## 创建 apiserver 证书请求文件
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

## 生成 apiserver 证书
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-apiserver-csr.json | cfssljson -bare kube-apiserver
```

## 创建 TLS 机制所需 TOKEN
> [!NOTE] 说明：
> apiserver 启用 TLS 认证后，Node 节点 kubelet 和 kube-proxy 与 kube-apiserver 进行通信，必须使用 CA 签发的有效证书才可以，当 Node 节点很多时，这种客户端证书颁发需要大量工作，同样也会增加集群扩展复杂度。为了简化流程，Kubernetes 引入了 TLS bootstraping 机制来自动颁发客户端证书，kubelet 会以一个低权限用户自动向 apiserver 申请证书，kubelet 的证书由 apiserver 动态签署。所以强烈建议在 Node 上使用这种方式，目前主要用于 kubelet，kube-proxy 还是由我们统一颁发一个证书。

```shell
$ cat > token.csv << EOF
$(head -c 16 /dev/urandom | od -An -t x | tr -d ' '),kubelet-bootstrap,10001,"system:kubelet-bootstrap"
EOF
```

## 创建 apiserver 服务配置文件
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

## 创建 apiserver 服务管理配置文件
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

## 分发证书及 token 文件到各 master 节点
```shell
$ cp ca*.pem kube-apiserver*.pem /etc/kubernetes/ssl/
$ cp token.csv /etc/kubernetes/

$ scp ca*.pem kube-apiserver*.pem k8s-master02:/etc/kubernetes/ssl/
$ scp token.csv k8s-master02:/etc/kubernetes/

$ scp ca*.pem kube-apiserver*.pem k8s-master03:/etc/kubernetes/ssl/
$ scp token.csv k8s-master03:/etc/kubernetes/
```

## 启动 apiserver 服务
```shell
$ systemctl daemon-reload
$ systemctl enable kube-apiserver --now 
$ systemctl status kube-apiserver
```

## 验证 apiserver
```shell
$ curl --insecure https://11.0.1.142:6443/
$ curl --insecure https://11.0.1.100:6443/
```