# Harbor
**Harbor** 是由 **VMware** 公司开源的容器镜像仓库，**Harbor** 在 **Docker Registry** 上进行了相应的企业级拓展，从而获得了更加广泛的应用，这些企业级拓展包括：管理用户界面、基于角色访问控制、**AD/LDAP** 集成以及审计日志，足以满足基本企业需求。

> 官网：https://goharbor.io/

> [!TIP] 前提条件：
> 部署 Harbor 需要提前安装 Docker 和 Docker Compose 环境。



## 下载 Harbor
**Harbor** 官方提供了**在线**和**离线**两种安装包，点击 [releases](https://github.com/goharbor/harbor/releases) 下载。


> [!TIP] 说明：
> online-installer：在线安装，offline-installer：离线安装。


- 下载离线安装包
```shell
$ wget https://github.com/goharbor/harbor/releases/download/v2.10.2/harbor-offline-installer-v2.10.2.tgz
$ tar -zxvf harbor-offline-installer-v2.10.2.tgz
```

## 安装

下载完成后进入 **Harbor** 目录，将`harbor.yml.tmpl`拷贝一份命名为`harbor.yml`。

- 修改`harbor.yml`文件
```yaml
hostname: harbor.gt.com   
certificate: /home/harbor/ssl/tls.cert
private_key: /home/harbor/ssl/tls.key
harbor_admin_password: 123456Aa
```
> [!TIP] 说明：
> 若不使用域名，则`hostname`填 IP 地址，注释 https 配置。

- 创建证书
```shell
$ mkdir /home/harbor/ssl && cd /home/harbor/ssl
$ openssl genrsa -out tls.key 2048
$ openssl req -new -x509 -key tls.key -out tls.cert -days 360 -subj /CN=*.gt.com
```

- 安装 Harbor
```shell
$ ./prepare
$ ./install.sh
```
**Harbor** 安装完成之后通过 **docker-compose** 来管理，执行`docker-compose ps`则可以查看到对应的容器状态：
![img](/harbor.png)


## 推送镜像
由于 **Harbor** 配置了域名，如果没有 dns 的话需要手动配置 hosts。
```shell
$ echo '11.0.1.100 harbor.gt.com' >> /etc/hosts
```

- 推送到 Harbor
```shell
$ docker tag nginx:latest  harbor.gt.com/library/nginx:latest
$ docker push harbor.gt.com/library/nginx:latest
```

- 配置信任 Harbor 证书

由于自行签发的 CA 根证书不被系统信任，拉取镜像会出现如下错误：
```shell
$ docker pull harbor.gt.com:1443/library/nginx:latest
Error response from daemon: Get "https://harbor.gt.com:1443/v2/": x509: certificate relies on legacy Common Name field, use SANs or temporarily enable Common Name matching with GODEBUG=x509ignoreCN=0
```
所以需要将 CA 根证书`ssl/root-ca.crt`移入`/etc/docker/certs.d/harbor.gt.com`文件夹中。
```shell
$ sudo mkdir -p /etc/docker/certs.d/harbor.gt.com
$ sudo cp /home/harbor/ssl/tls.cert /etc/docker/certs.d/harbor.gt.com/ca.crt
```