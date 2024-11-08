# 部署 kube-scheduler

## kube-scheduler 证书
- 创建 kube-scheduler 证书请求文件
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

## kube-scheduler 服务配置
- 创建 kube-scheduler 服务配置文件
```shell
$ cat > /etc/kubernetes/kube-scheduler.conf << "EOF"
KUBE_SCHEDULER_OPTS=" \
--kubeconfig=/etc/kubernetes/kube-scheduler.kubeconfig \
--leader-elect=true \
--v=2"
EOF
```

## kube-scheduler 启动配置
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

## 分发证书文件
- 同步证书文件到 master 节点
```shell
$ cp kube-scheduler*.pem /etc/kubernetes/ssl/
$ cp kube-scheduler.kubeconfig /etc/kubernetes/

$ scp kube-scheduler*.pem k8s-master02:/etc/kubernetes/ssl/
$ scp kube-scheduler.kubeconfig k8s-master02:/etc/kubernetes/

$ scp kube-scheduler*.pem k8s-master03:/etc/kubernetes/ssl/
$ scp kube-scheduler.kubeconfig k8s-master03:/etc/kubernetes/
```

## 启动 kube-scheduler
```shell
$ systemctl daemon-reload
$ systemctl enable --now kube-scheduler
$ systemctl status kube-scheduler
```

## 验证
```shell
$ kubectl get cs
```