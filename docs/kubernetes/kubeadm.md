# Kubeadm 部署高可用集群
Kubeadm 是一个搭建 Kubernetes 集群的工具，该工具可以方便、快捷的创建和管理 Kubernetes 集群。项目地址：https://github.com/kubernetes/kubeadm

>集群架构

![img](/kubeadm-1.png)


## 配置 K8S yum 源
```shell
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```

## 安装kubelet、kubeadm、kubectl
```shell
yum install -y kubelet-1.23.6 kubeadm-1.23.6 kubectl-1.23.6
```


## 重启 docker，并启动 kubelet
```shell
systemctl daemon-reload
systemctl restart docker
systemctl enable kubelet && systemctl start kubelet

docker version
```




## 初始化 master 节点
```shell
kubeadm init \
      --apiserver-advertise-address=192.168.33.100 \
      --image-repository registry.aliyuncs.com/google_containers \
      --kubernetes-version v1.23.6 \
      --service-cidr=10.96.0.0/12 \
      --pod-network-cidr=10.244.0.0/16
```

## 检查 master 初始化结果
```shell
# 只在 master 节点执行

# 执行如下命令，等待 3-10 分钟，直到所有的容器组处于 Running 状态
watch kubectl get pod -n kube-system -o wide

# 查看 master 节点初始化结果
kubectl get nodes -o wide

```

安装成功后，复制如下配置并执行
```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes
```

若出现错误排错之后先通过下面命令重置之后再执行init命令：
```shell
kubeadm reset
```

## node 节点加入集群
在 k8s-node 节点执行，下方命令是 k8s master 控制台初始化成功后复制的 join 命令
```shell
kubeadm join 192.168.33.131:6443 --token 6tmev4.a1m9ks62q0j3t868 \
        --discovery-token-ca-cert-hash sha256:6361880a7c63c76dbf17e4a1575869dc09206f84aedb569c6652747c97641516
```
如果初始化的 token 不小心清空了，可以通过如下命令获取或者重新申请，如果 token 已经过期，就重新申请
```shell
kubeadm token create
```
token 没有过期可以通过如下命令获取
```shell
kubeadm token list
```
获取 --discovery-token-ca-cert-hash 值，得到值后需要在前面拼接上 sha256:
```shell
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
```

## 验证
```shell
kubectl get node
```
到 master 节点查看状态，都是 ready 说明没有问题，此时执行`kubectl get po -n kube-system`可以发现 coredns 未就绪这是因为网络问题接下来安装好网络插件就可以了。
