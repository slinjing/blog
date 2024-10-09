# Harbor
Harbor 是由 VMware 公司开源的容器镜像仓库。该项目托管在 CNCF。在本地部署 Harbor 私有镜像仓库后，其他需要拉取镜像的主机通过 Harbor 拉取镜像。

官网：https://goharbor.io/

## 前提条件
安装Harbor需要有Docker和Docker Compose环境，如何安装Docker和Docker Compose可以前往Docker栏目。
当安装好Docker和Docker Compose后就可以开始安装Harbor，Harbor官方提供了在线和离线两种安装包，下载地址：[https://github.com/goharbor/harbor/releases]

>online-installer：在线安装
>offline-installer：离线安装


下载离线安装包可以使用以下命令：
```shell
$ wget https://github.com/goharbor/harbor/releases/download/v2.10.2/harbor-offline-installer-v2.10.2.tgz
$ tar -zxvf harbor-offline-installer-v2.10.2.tgz
```

## 安装
下载完成后进入Harbor目录，将`harbor.yml.tmpl`拷贝一份命名为：`harbor.yml`，再修改配置文件如下对应的地方：
```yaml
hostname: harbor.gt.com   
certificate: /home/harbor/ssl/tls.cert
private_key: /home/harbor/ssl/tls.key
harbor_admin_password: 123456Aa
```
若不使用域名`hostname`填主机IP地址，不开启https则将https整个注释掉。这里由于开启了https需要创建对应的证书，命令如下：
```shell
$ mkdir /home/harbor/ssl && cd /home/harbor/ssl
$ openssl genrsa -out tls.key 2048
$ openssl req -new -x509 -key tls.key -out tls.cert -days 360 -subj /CN=*.gt.com
```
以上步骤完成后执行以下命令完成Harbor安装：
```shell
$ ./prepare
$ ./install.sh
```
Harbor安装完成之后通过docker-compose来管理，执行`docker-compose ps`则可以查看到对应的容器状态：![img](/harbor.png)


## 推送镜像到 Harbor
当Harbor安装完成后就可以尝试推送镜像到Harbor，Harbor还支持基于角色访问控制，我这里就不创建其他用户，直接使用管理员账户演示了。由于Harbor配置了域名，如果没有dns的话需要手动配置hosts，命令如下：
```shell
$ echo 'Harbor_IP harbor.gt.com' >> /etc/hosts
```
下面将本地的nginx镜像推送到Harbor，先将镜像tag一下，格式为`Harbor地址/仓库名/镜像名:镜像版本`：
```shell
$ docker tag nginx:latest  harbor.gt.com/library/nginx:latest
```
然后就可以直接推送到Harbor：
```shell
$ docker push harbor.gt.com/library/nginx:latest
```

## 配置信任 Harbor 证书
由于Harbor仓库使用了自签证书，所以当docker客户端拉取自建Harbor仓库镜像前必须配置信任Harbor证书，否则出现如下错误：
```shell
$ docker pull harbor.gt.com:1443/library/nginx:latest
Error response from daemon: Get "https://harbor.gt.com:1443/v2/": x509: certificate relies on legacy Common Name field, use SANs or temporarily enable Common Name matching with GODEBUG=x509ignoreCN=0
```
在Docker主机创建下面的目录，用来保存Harbor的CA证书：
```shell
$ mkdir -p /etc/docker/certs.d/harbor.gt.com:1443/ 
$ scp 10.10.100.32:/home/harbor/ssl/tls.cert /etc/docker/certs.d/harbor.gt.com:1443/ca.crt
```

## K8S 使用 Harbor
如果镜像保存在Harbor中的公开项目中，那么只需要在Yaml文件中简单指定镜像地址即可，例如：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: harbor.gt.com/library/nginx:latest
    imagePullPolicy: Always
```
但如果镜像保存在Harbor中的私有项目中，那么Yaml文件中使用该私有项目的镜像需要指定imagePullSecrets并创建Secret，例如：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: harbor.gt.com/library/nginx:latest
    imagePullPolicy: Always
  imagePullSecrets:
  - name: harbor-secret
```
Secret可以使用命令或Yaml文件的方式创建，分别如下：
>命令：
```shell
$ kubectl create secret docker-registry harbor-secret --docker-server=harbor.gt.com --docker-username=admin --docker-password=Harbor12345 --docker-email=team@test.com
```
>Yaml

首先使用`docker login`登录一下：
```shell
docker login 10.0.1.13
Username: test
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
Login Succeeded
```
`docker login`会在~/.docker下面创建一个config.json文件保存鉴权串，下面Secret yaml的.dockerconfigjson后面的数据就是那个json文件的base64编码输出，-w 0让base64输出在单行上，避免折行。
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: harbor-secret
  namespace: default
data:
    .dockerconfigjson: {base64 -w 0 ~/.docker/config.json}
type: kubernetes.io/dockerconfigjson
```