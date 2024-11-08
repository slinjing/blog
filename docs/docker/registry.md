# Registry
生产环境中使用 **Docker Hub** 这样的公共仓库有时非常不方便，为了解决这个问题，可以搭建本地的私有镜像仓库来使用。**Docker-registry** 就是其中的一种，除此之外还有 **Harbor**。

## 部署 Docker-registry

使用官方 **registry** 镜像来运行。
```shell
$ docker run -d \
    -p 5000:5000 \
    --name=registry \
    --restart=always \
    -v /opt/data/registry:/var/lib/registry \
    registry
```

> [!TIP] 说明：
> 默认情况下，仓库会被创建在容器的`/var/lib/registry`目录下，这里通过`-v`参数将镜像文件存放在本地的指定路径`/opt/data/registry`目录。


## 上传、搜索、下载镜像

部署好 **registry** 之后，就可以使用`docker tag`来标记一个镜像，然后推送它到仓库，私有仓库地址为：`127.0.0.1:5000`。

- 查看已有的镜像。
```shell
$ docker images
REPOSITORY               TAG                 IMAGE ID       CREATED         SIZE
mysql                    8.0                 f5da8fc4b539   3 months ago    573MB
```

使用`docker tag`将`mysql:8.0`标记为：`127.0.0.1:5000/mysql:8.0`。   
命令格式为：`docker tag IMAGE[:TAG] [REGISTRY_HOST[:REGISTRY_PORT]/]REPOSITORY[:TAG]`。

```shell
$ docker tag mysql:8.0 127.0.0.1:5000/mysql:8.0
$ docker images
REPOSITORY               TAG                 IMAGE ID       CREATED         SIZE
mysql                    8.0                 f5da8fc4b539   3 months ago    573MB
127.0.0.1:5000/mysql     8.0                 f5da8fc4b539   3 months ago    573MB
```

- 使用`docker push`推送标记的镜像
```shell
$ docker push 127.0.0.1:5000/mysql:8.0
```

- 用`curl`查看仓库中的镜像
```shell
$ curl 127.0.0.1:5000/v2/_catalog
{"repositories":["mysql"]}
```

- 先删除已有镜像，再使用`docker pull`拉取镜像
```shell
$ docker rmi 127.0.0.1:5000/mysql:8.0
$ docker pull 127.0.0.1:5000/mysql:8.0
```

## 配置非 https 仓库地址
**registry** 部署完成后，如果想让本网段的其他主机也能把镜像推送到 **registry**，就得把例如`192.168.199.100:5000`这样的内网地址作为私有仓库地址，但此时却无法成功推送镜像。

> [!TIP] 说明：
> 这是因为`Docker`默认不允许非`https`方式推送镜像，可以通过`Docker`的配置选项来取消这个限制，或者配置`https`访问的私有仓库。

- 在`/etc/docker/daemon.json`中写入如下内容，如果文件不存在请新建该文件。
```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "insecure-registries": [
    "11.0.1.100:5000"
  ]
}
```

> [!WARNING] 注意：
> 该文件必须符合`json`规范，否则`Docker`将不能启动。

## 高级配置
使用`Docker Compose`搭建一个拥有权限认证、TLS 的私有仓库。新建`/etc/docker/registry/`目录，以下步骤均在该目录中进行。

> [!TIP] 说明：
> 私有仓库地址为：`docker.gt.com`，下面使用 **openssl** 自行签发`docker.gt.com`的站点 SSL 证书。


- 创建 CA 私钥
```shell
$ openssl genrsa -out "root-ca.key" 4096
```

- 创建 CA 根证书请求文件
```shell
$ openssl req \
          -new -key "root-ca.key" \
          -out "root-ca.csr" -sha256 \
          -subj '/C=CN/ST=Sichuan/L=Chengdu/O=GTDQ/CN=docker.gt.com CA'
```

> [!TIP] 说明：
> 以上命令中`-subj`参数里的`/C`表示国家，如`CN`；`/ST`表示省；`/L`表示城市或者地区；`/O`表示组织名；`/CN`表示通用名称。

- 配置 CA 根证书，新建`root-ca.cnf`文件
```shell
[root_ca]
basicConstraints = critical,CA:TRUE,pathlen:1
keyUsage = critical, nonRepudiation, cRLSign, keyCertSign
subjectKeyIdentifier=hash
```

- 签发根证书
```shell
$ openssl x509 -req  -days 3650  -in "root-ca.csr" \
               -signkey "root-ca.key" -sha256 -out "root-ca.crt" \
               -extfile "root-ca.cnf" -extensions \
               root_ca
```

- 生成站点 SSL 私钥
```shell
$ openssl genrsa -out "docker.gt.com.key" 4096
```

- 使用私钥生成证书请求文件
```shell
$ openssl req -new -key "docker.gt.com.key" -out "site.csr" -sha256 \
          -subj '/C=CN/ST=Sichuan/L=Chengdu/O=GTDQ/CN=docker.gt.com'
```

- 配置证书，新建`site.cnf`文件
```shell
[server]
authorityKeyIdentifier=keyid,issuer
basicConstraints = critical,CA:FALSE
extendedKeyUsage=serverAuth
keyUsage = critical, digitalSignature, keyEncipherment
subjectAltName = DNS:docker.gt.com, IP:127.0.0.1
subjectKeyIdentifier=hash
```

- 签署站点 SSL 证书
```shell
$ openssl x509 -req -days 750 -in "site.csr" -sha256 \
    -CA "root-ca.crt" -CAkey "root-ca.key"  -CAcreateserial \
    -out "docker.gt.com.crt" -extfile "site.cnf" -extensions server
```

新建 ssl 文件夹并将`docker.gt.com.key` `docker.gt.com.crt` `root-ca.crt`这三个文件移入，删除其他文件。

**registry** 的默认配置文件位于`/etc/docker/registry/config.yml`，先在本地编辑`config.yml`，之后挂载到容器中。

```yaml
version: 0.1
log:
  accesslog:
    disabled: true
  level: debug
  formatter: text
  fields:
    service: registry
    environment: staging
storage:
  delete:
    enabled: true
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
auth:
  htpasswd:
    realm: basic-realm
    path: /etc/docker/registry/auth/nginx.htpasswd
http:
  addr: :443
  host: https://docker.gt.com
  headers:
    X-Content-Type-Options: [nosniff]
  http2:
    disabled: false
  tls:
    certificate: /etc/docker/registry/ssl/docker.gt.com.crt
    key: /etc/docker/registry/ssl/docker.gt.com.key
health:
  storagedriver:
    enabled: true
    interval: 10s
threshold: 3
```

- 生成 http 认证文件
```shell
$ mkdir auth

$ docker run --rm \
    --entrypoint htpasswd \
    httpd:alpine \
    -Bbn username password > auth/nginx.htpasswd
```

> [!TIP] 说明：
> 将上面的`username` `password`替换为自己的用户名和密码。

- 编辑 docker-compose.yml
```yaml
version: '3'

services:
  registry:
    image: registry.cn-chengdu.aliyuncs.com/shulinjing/registry
    ports:
      - "443:443"
    volumes:
      - ./:/etc/docker/registry
      - registry-data:/var/lib/registry

volumes:
  registry-data:
```

- 编辑 /etc/hosts
```shell
$ echo '127.0.0.1 docker.gt.com' >> /etc/hosts
```

- 启动 registry
```shell
$ docker-compose up -d
```

## 测试私有仓库功能
由于自行签发的 CA 根证书不被系统信任，所以需要将 CA 根证书`ssl/root-ca.crt`移入`/etc/docker/certs.d/docker.gt.com`文件夹中。

```shell
$ sudo mkdir -p /etc/docker/certs.d/docker.gt.com

$ sudo cp ssl/root-ca.crt /etc/docker/certs.d/docker.gt.com/ca.crt
```

- 登录
```shell
$ docker login docker.gt.com
```

- 推送、拉取镜像
```shell
$ docker pull ubuntu:18.04

$ docker tag ubuntu:18.04 docker.gt.com/username/ubuntu:18.04

$ docker push docker.gt.com/username/ubuntu:18.04

$ docker image rm docker.gt.com/username/ubuntu:18.04

$ docker pull docker.gt.com/username/ubuntu:18.04
```

- 退出登录，尝试推送镜像
```shell
$ docker logout docker.gt.com

$ docker push docker.gt.com/username/ubuntu:18.04
no basic auth credentials
```
发现会提示没有登录，不能将镜像推送到私有仓库中