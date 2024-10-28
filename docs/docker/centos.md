# CentOS
> [!TIP] 系统要求
> Docker 支持 64 位版本 CentOS 7 或 8，并且要求内核版本不低于 3.10。 CentOS 7 满足最低内核的要求，但由于内核版本比较低，部分功能（如 overlay2 存储层驱动）无法使用，并且部分功能可能不太稳定。


## 卸载旧版本
旧版本的 Docker 称为 docker 或者 docker-engine，在安装新版本及其相关依赖项之前，先使用以下命令卸载旧版本：

```shell
$ sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

## Yum 安装
使用以下命令安装依赖包：
```shell
$ yum install -y yum-utils
```

由于国内网络原因，使用以下命令添加 yum 软件源：
```shell
$ yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
$ sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
$ yum makecache fast

# 官方源
# $ sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

## 安装 Docker
```shell
$ sudo yum -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```



## 脚本安装
Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，CentOS 系统上可以使用这套脚本安装，另外可以通过`--mirror`选项使用国内源进行安装：
> 安装测试版本的 Docker, 从 test.docker.com 获取脚本
```shell
# 稳定版本
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun

# 测试版本
# $ curl -fsSL test.docker.com -o get-docker.sh
# $ sudo sh get-docker.sh --mirror AzureChinaCloud
```


## 启动 Docker
```shell
$ sudo systemctl enable docker
$ sudo systemctl start docker
```

## 建立 Docker 用户组
默认情况下，docker 命令会使用 Unix socket 与 Docker 引擎通讯。而只有 root 用户和 docker 组的用户才可以访问 Docker 引擎的 Unix socket。出于安全考虑，一般 Linux 系统上不会直接使用 root 用户。因此，更好地做法是将需要使用 docker 的用户加入 docker 用户组。

建立 docker 组：
```shell
# 建立 docker 组
$ sudo groupadd docker

# 将当前用户加入 docker 组：
$ sudo usermod -aG docker $USER
```
退出当前终端并重新登录，测试 Docker 是否安装正确。

## 修改 Docker 默认存储路径
使用`docker info | grep Dir`命令可以看到Docker的默认存储路径是`/var/lib/docker`，如果希望将数据存储到其他位置可以按照下面的流程修改：


首先停止docker服务，然后`/etc/docker/daemon.json`加入：`"data-root": "/home/docker"`，需要注意的是新存储路径必须存在，如下：

```json
{  
"registry-mirrors": ["https://registry.cn-hangzhou.aliyuncs.com"],
"data-root": "/home/docker"  
}
```
完成后使用以下`rsync`迁移数据，如果没有rsync需要先安装，命令如下：
```shell
$ yum -y install rsync
$ rsync -avz /var/lib/docker /home/docker
```

迁移完成后重启Docker，并验证是否成功，检查存储路径是否修改、容器和镜像是否正常，验证无误后就可以删除原存储目录中的数据：
```shell
$ docker info | grep Dir
$ docker ps -a
$ docker images
$ rm -rf /var/lib/docker/*
```

## 添加内核参数
如果在 CentOS 使用 Docker 时看到下面的这些警告信息：
```shell
WARNING: bridge-nf-call-iptables is disabled
WARNING: bridge-nf-call-ip6tables is disabled
```
请添加内核配置参数以启用这些功能。
```shell
$ sudo tee -a /etc/sysctl.conf <<-EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
```
然后重新加载`sysctl.conf`即可
```shell
$ sudo sysctl -p
```

## 卸载 Docker
卸载 Docker Engine、CLI、containerd 和 Docker Compose 软件包：
```shell
$ sudo yum remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
```
主机上的镜像、容器、卷或自定义配置文件不会自动删除。要删除所有镜像、容器和卷，请执行以下操作：
```shell
$ sudo rm -rf /var/lib/docker
$ sudo rm -rf /var/lib/containerd
```


## CentOS 8
由于 CentOS 8 防火墙使用了 nftables，但 Docker 尚未支持 nftables， 更改`/etc/firewalld/firewalld.conf`使用 iptables：
```shell
# FirewallBackend=nftables
FirewallBackend=iptables
```
或者执行如下命令：
```shell
$ firewall-cmd --permanent --zone=trusted --add-interface=docker0
$ firewall-cmd --reload
```