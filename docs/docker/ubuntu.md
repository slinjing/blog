# Ubuntu
> [!TIP] 系统要求
> 要安装 Docker 需要 Ubuntu 64 位版本：Ubuntu Noble 24.04 (LTS)、Ubuntu Jammy 22.04 (LTS)、Ubuntu Focal 20.04 (LTS)


## 卸载旧版本
旧版本的 Docker 称为 docker 或者 docker-engine，在安装新版本及其相关依赖项之前，先使用以下命令卸载旧版本：
```shell
$ for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

## apt 安装
使用以下命令安装必要的一些系统工具：
```shell
$ sudo apt-get update
$ sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
```


使用以下命令安装GPG证书：
```shell
$ curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
```





使用以下命令写入软件源信息：
```shell
$ add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
```




## 安装 Docker

更新并安装 docker-ce
```shell
$ sudo apt update

$ sudo apt install docker-ce docker-ce-cli containerd.io
```

## 脚本安装
Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，Ubuntu 系统上可以使用这套脚本安装，另外可以通过`--mirror`选项使用国内源进行安装：
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

## 建立 docker 用户组
默认情况下，docker 命令会使用 Unix socket 与 Docker 引擎通讯。而只有 root 用户和 docker 组的用户才可以访问 Docker 引擎的 Unix socket。出于安全考虑，一般 Linux 系统上不会直接使用 root 用户。因此，更好地做法是将需要使用 docker 的用户加入 docker 用户组。

建立 docker 组：

复制
```shell
$ sudo groupadd docker
```
将当前用户加入 docker 组：

```shell
$ sudo usermod -aG docker $USER
```

退出当前终端并重新登录，测试 Docker 是否安装正确


## 安装指定版本的 Docker
首先使用一下命令查找 Docker 的版本:
```shell
$ sudo apt-cache madison docker-ce
```


安装指定版本的 docker，例如：`17.03.1~ce-0~ubuntu-xenial`

```shell
$ apt-get -y install docker-ce=17.03.1~ce-0~ubuntu-xenial
```

