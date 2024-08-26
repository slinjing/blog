# Docker安装
Docker是基于Go语言开发的开源容器引擎，它可以将应用以及依赖打包成镜像，并在任何Docker环境中运行。由于Docker的轻量、便捷和跨平台等特性，目前Docker的使用率非常火爆，本文演示如何安装Docker并进行一些基本的配置。


## 前提条件

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
```
