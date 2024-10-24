# CentOS
> [!TIP] 系统要求
> 支持 64 位版本 CentOS 7/8，并且内核版本不低于 3.10。

## 系统要求
> [!TIP] 系统要求
> Docker 支持 64 位版本 CentOS 7/8，并且要求内核版本不低于 3.10。 CentOS 7 满足最低内核的要求，但由于内核版本比较低，部分功能（如 overlay2 存储层驱动）无法使用，并且部分功能可能不太稳定。

Docker 支持 64 位版本 CentOS 7/8，并且要求内核版本不低于 3.10。 CentOS 7 满足最低内核的要求，但由于内核版本比较低，部分功能（如 overlay2 存储层驱动）无法使用，并且部分功能可能不太稳定。

## 卸载旧版本
旧版本的 Docker 称为 docker 或者 docker-engine，在安装新版本及其相关依赖项之前，先卸载所有此类旧版本。

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

## 设置存储库
执行以下命令安装依赖包：
```shell
$ yum install -y yum-utils
```

由于国内网络问题，强烈建议使用国内源，执行下面的命令添加 yum 软件源：
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

## 脚本自动安装
在测试或开发环境中 Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，CentOS 系统上可以使用这套脚本安装，另外可以通过 --mirror 选项使用国内源进行安装：
> 安装测试版的 Docker, 从 test.docker.com 获取脚本
```shell
# $ curl -fsSL test.docker.com -o get-docker.sh
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun
# $ sudo sh get-docker.sh --mirror AzureChinaCloud
```
执行这个命令后，脚本就会自动的将一切准备工作做好，并且把 Docker 的稳定(stable)版本安装在系统中。

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
退出当前终端并重新登录，进行如下测试。

## 修改默认存储路径
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
如果在 CentOS 使用 Docker 看到下面的这些警告信息：
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


<!-- ## 前提条件

安装Docker需要满足系统版本最低为Centos7，Linux内核为3.8以上，可以使用以下命令查看是否符合：

```shell
$ cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
$ uname -r
3.10.0-1160.el7.x86_64
```

## 设置存储库
由于Docker官方提供的yum仓库在国外，受网络限制比较大，这里使用的是阿里云提供的yum仓库。
```shell
$ yum install -y yum-utils
$ yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
$ sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
$ yum makecache fast
```

## 安装Docker
添加yum仓库后就可以执行`yum install`命令安装了。
>安装Docker最新版本命令：

```shell
$ yum -y install docker-ce
```
>安装指定版本命令:
```shell
# 查看可选版本
$ yum list docker-ce.x86_64 --showduplicates | sort -r
# 安装指定版本
$ yum -y install docker-ce-[VERSION]
```

## 启动Docker

```shell
$ systemctl enable docker --now
```

## 镜像加速

阿里云加速器(点击管理控制台 -> 登录账号(淘宝账号) -> 左侧镜像工具 -> 镜像加速器 -> 复制加速器地址)

由于默认的镜像下载源是在国外，镜像下载速度会比较慢，所以这里更改一下镜像源提高镜像拉取速度。这里提供几个常用的镜像下载地址,也可以使用阿里云的镜像加速器，个人可以免费使用。
>腾讯云 docker hub 镜像
>https://mirror.ccs.tencentyun.com
>DaoCloud 镜像
>https://docker.m.daocloud.io
>阿里云 docker hub 镜像
>https://registry.cn-hangzhou.aliyuncs.com


在Docker的配置文件`/etc/docker/daemon.json`添加以下内容：

```shell
$ tee /etc/docker/daemon.json <<-'EOF'
{  
"registry-mirrors": ["https://registry.cn-hangzhou.aliyuncs.com"]
}
EOF
```
修改后载入配置并重启Docker服务

## 修改Docker默认存储路径

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

## 安装Docker Compose
Docker Compose是一个可以定义和运行多容器的工具，可以通过yum或二进制文件安装，点击二进[Docker Compose](https://github.com/docker/compose/releases)下载二进制文件。
>yum安装
```shell
$ yum install -y docker-compose-plugin
$ docker-compose version
Docker Compose version v2.23.3
```

>二进制文件安装
```shell
$ curl -L https://github.com/docker/compose/releases/download/2.23.3/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose
$ docker-compose version
Docker Compose version v2.23.3
```

## 卸载Docker

```shell
$ yum -y remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine

$ rm -rf /var/lib/docker/*
``` -->
