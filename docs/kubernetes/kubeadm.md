# Kubeadm 部署高可用集群
Kubeadm 是一个搭建 Kubernetes 集群的工具，该工具可以方便、快捷的创建和管理 Kubernetes 集群。项目地址：https://github.com/kubernetes/kubeadm

>集群架构

![img](/kubeadm-1.png)

## 初始化系统
Kubernetes 集群所有节点都要执行，不能使用 localhost 作为节点的名字，CPU 内核数量不能低于2。


### 关闭防火墙
```shell
systemctl stop firewalld
systemctl disable firewalld
```

### 关闭 SeLinux
```shell
setenforce 0
sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config
```

### 关闭 Swap
```shell
swapoff -a
sed -ri 's/.*swap.*/#&/' /etc/fstab
```

### 修改 /etc/sysctl.conf
```shell
# 如果有配置，则修改
sed -i "s#^net.ipv4.ip_forward.*#net.ipv4.ip_forward=1#g"  /etc/sysctl.conf
sed -i "s#^net.bridge.bridge-nf-call-ip6tables.*#net.bridge.bridge-nf-call-ip6tables=1#g"  /etc/sysctl.conf
sed -i "s#^net.bridge.bridge-nf-call-iptables.*#net.bridge.bridge-nf-call-iptables=1#g"  /etc/sysctl.conf
# 可能没有，追加
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
echo "net.bridge.bridge-nf-call-ip6tables = 1" >> /etc/sysctl.conf
echo "net.bridge.bridge-nf-call-iptables = 1" >> /etc/sysctl.conf
# 执行命令以应用
sysctl -p
```

### 设置 Yum 仓库
```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```


### 安装并启动 Docker
```shell
yum -y install docker-ce
systemctl enable docker --now
```

### Docker 镜像加速
```shell
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://f1361db2.m.daocloud.io
```

### 配置K8S的yum源
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

### 安装kubelet、kubeadm、kubectl
```shell
yum install -y kubelet-1.23.6 kubeadm-1.23.6 kubectl-1.23.6
```


### 重启 docker，并启动 kubelet
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

### 检查 master 初始化结果
```shell
# 只在 master 节点执行

# 执行如下命令，等待 3-10 分钟，直到所有的容器组处于 Running 状态
watch kubectl get pod -n kube-system -o wide

# 查看 master 节点初始化结果
kubectl get nodes -o wide

```