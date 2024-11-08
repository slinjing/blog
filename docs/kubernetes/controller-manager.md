# 部署 kube-controller-manager

## kube-controller-manager 证书

- 创建 kube-controller-manager 证书请求文件
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

## kube-controller-manager 服务配置文件
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

## 分发证书文件
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

## 启动 kube-controller-manager
```shell
$ systemctl daemon-reload 
$ systemctl enable kube-controller-manager --now 
$ systemctl status kube-controller-manager
```

## 验证
```shell
$ kubectl get cs
```