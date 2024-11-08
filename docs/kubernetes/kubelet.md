# 部署 kubelet 

## 创建证书
- 创建 kubelet-bootstrap 的 kubeconfig
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

## 创建 kubelet 配置文件

- k8s-node01
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

- k8s-node02
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

## 创建 kubelet 服务配置文件
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

## 分发证书

- 分发 CA 证书及 kubelet-bootstrap.kubeconfig 文件
```shell
$ for i in k8s-node01 k8s-node02;do scp kubelet-bootstrap.kubeconfig $i:/etc/kubernetes;done
$ for i in k8s-node01 k8s-node02;do scp ca.pem $i:/etc/kubernetes/ssl;done
```

- 创建目录
```shell
$ mkdir -p /var/lib/kubelet
```

## 启动 kubelet 服务
```shell
$ systemctl daemon-reload
$ systemctl enable kubelet --now 
$ systemctl status kubelet
```

## 验证
```shell
$ kubectl get nodes
$ kubectl get csr
```

确认 kubelet 服务启动成功后，接着到 master 上 Approve 一下 bootstrap 请求。
```shell
$ kubectl describe node | grep Runtime
```