# 部署 kube-proxy 

## 创建证书
- 创建 kube-proxy 证书请求文件
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

## 创建 kube-proxy 服务配置文件
- k8s-node01
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


- k8s-node01
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

## 创建 kube-proxy 服务启动配置文件
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

## 分发 kube-proxy 文件
- 同步 kube-proxy 文件到 node 节点
```shell
$ for i in k8s-node01 k8s-node02;do scp kube-proxy*.pem $i:/etc/kubernetes/ssl/; done
$ for i in k8s-node01 k8s-node02;do scp kube-proxy.kubeconfig $i:/etc/kubernetes/; done
```

## 启动 kube-proxy
```shell
$ mkdir -p /var/lib/kube-proxy
$ systemctl daemon-reload
$ systemctl enable kube-proxy --now 
$ systemctl status kube-proxy
```