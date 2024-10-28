# Docker in Docker
Docker in Docker 顾名思义就是在 Docker 容器内运行 Docker，例如用 Docker 起了一个 Jenkins 容器，Jenkins 构建项目的时候，在 Jenkins 容器内部也需要用到 Docker。

> [!TIP] 实现方式
> 挂载 docker.sock、dind、使用 Sysbox 运行时。

## 挂载 docker.sock
首先将宿主机 docker.sock 文件挂载到容器内部，并赋予权限，重启该容器就可以在容器内部执行 Docker 命令。

例如：
```yaml
version: "3.6"
services:
  jenkins:
    image: jenkins/jenkins:2.414.3-lts
    container_name: jenkins
    restart: always
    privileged: true
    user: root
    environment:
      TZ: 'Asia/Shanghai'
    ports:
      - 8080:8080
      - 50000:50000
    volumes:
      - ./data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
      - /etc/docker/daemon.json:/etc/docker/daemon.json
```

赋予权限：
```shell
$ sudo chown root:root /var/run/docker.sock
$ sudo chmod o+rw /var/run/docker.sock
$ sudo docker-compose up -d
```

> [!TIP] 缺点：
> 这意味着容器具有对 Docker 守护程序的完全特权，在实际项目中使用时，有一定的安全隐患，因为容器可以访问并删除宿主机的所有镜像。

## dind
此方法实际上在容器内部创建一个子容器，只需要使用带有 dind 标签的官方 docker 镜像即可。只有确实要在容器中包含容器和镜像时才使用此方法。 否则，建议使用第一种方法。

示例：建立一个以 docker:dind 为镜像，名字为 some-docker 的容器

```shell
$ sudo docker run --privileged --name some-docker -v /my/own/var-lib-docker:/var/lib/docker -d docker:dind
```

## 使用 Sysbox 运行时
[Sysbox](/https://github.com/nestybox/sysbox) 是 nestybox 公司旗下的一款产品，当允许 Docker 容器充当虚拟服务器， 能够在其中运行 Systemd、Docker 和 Kubernetes 等软件，操作容易且具有适当的隔离。
