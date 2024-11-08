# 部署 kubectl 

## 创建 kubectl 证书请求文件
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

## 生成 admin 证书文件
```shell
$ cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes admin-csr.json | cfssljson -bare admin
```

- 复制 admin 证书到指定目录
```shell
$ cp admin*.pem /etc/kubernetes/ssl/
```

## 生成 admin 配置文件 kubeconfig
> [!NOTE] 说明：
> kube.config 为 kubectl 的配置文件，包含访问 apiserver 的所有信息，如 apiserver 地址、CA 证书和自身使用的证书
```shell
$ kubectl config set-cluster kubernetes --certificate-authority=ca.pem --embed-certs=true --server=https://11.0.1.100:6443 --kubeconfig=kube.config

$ kubectl config set-credentials admin --client-certificate=admin.pem --client-key=admin-key.pem --embed-certs=true --kubeconfig=kube.config

$ kubectl config set-context kubernetes --cluster=kubernetes --user=admin --kubeconfig=kube.config

$ kubectl config use-context kubernetes --kubeconfig=kube.config
```

## 准备 kubectl 配置文件并进行角色绑定
```shell
$ mkdir ~/.kube
$ cp kube.config ~/.kube/config
$ kubectl create clusterrolebinding kube-apiserver:kubelet-apis --clusterrole=system:kubelet-api-admin --user kubernetes --kubeconfig=/root/.kube/config
```

## 查看集群状态
```shell
$ kubectl cluster-info
$ kubectl get componentstatuses
$ kubectl get all --all-namespaces
```

## 分发 kubectl 配置文件
```shell
$ scp /root/.kube/config k8s-master02:/root/.kube/config
$ scp /root/.kube/config k8s-master03:/root/.kube/config
```

## kubectl 命令补全
```shell
$ yum install -y bash-completion
$ source /usr/share/bash-completion/bash_completion
$ source <(kubectl completion bash)
$ kubectl completion bash > ~/.kube/completion.bash.inc
$ source '/root/.kube/completion.bash.inc'  
$ source $HOME/.bash_profile
```