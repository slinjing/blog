# 部署容器运行时

## 部署 Docker 
```shell
$ wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
$ yum -y install docker-ce
$ systemctl enable --now docker
```

- 修改 Docker 配置
```shell
$ cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF

$ sysstemctl restart docker
```

## cri-dockerd 安装
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
