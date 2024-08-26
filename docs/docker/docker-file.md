# Dockerfile
Docker通过读取Dockerfile中的指令来构建镜像。Dockerfile是一个文本文件，其中包含构建源代码的指令。每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。

## 常见指令
> FROM：基础镜像，指定当前新镜像是基于哪个镜像的
RUN：镜像构建时需要运行的命令，有shell和exec两种格式，shell格式：RUN <命令>；ecex格式：RUN ["可执行文件","参数1","参数2"]
WORKDIR：为Dockerfile中其后的任何RUN、CMD、ENTRYPOINT、COPY和指令设置工作目录。
ADD：将宿主机的文件拷贝进镜像且会自动处理URL和解压tar压缩包
COPY： 类似ADD，不会自动处理URL和解压tar压缩包
CMD：启动容器后默认运行的命令，格式与RUN相似。每个Dockerfile只有一个CMD，当存在多个时，仅CMD最后一个有效。

下面演示一个基本的镜像构建过程：
> hello.py
```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"
```

> Dockerfile
```Dockerfile
# syntax=docker/dockerfile:1
FROM ubuntu:22.04

# install app dependencies
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip install flask==3.0.*

# install app
COPY hello.py /

# final configuration
ENV FLASK_APP=hello
EXPOSE 8000
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "8000"]
```

>构建命令
```shell
$ docker build -t hello_app:v1 .
$ docker images | grep  hello_app
hello_app    v1        e3ac86d22aff   3 minutes ago   484MB
```

## 多阶段构建
从上面的例子可以看出，在镜像构建时是将源代码一起打包到了镜像。当面对java、golang这样的编译型语言时，实际上只需要将二进制文件打包到镜像就可以了，下面通过一个Dockerfile实现多阶段构建：
>main.go
```golang
package main

import "fmt"

func main() {
  fmt.Println("hello, world")
}
```

>Dockerfile
```Dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.21 AS build
WORKDIR /src
COPY ./main.go /src/main.go

RUN go build -o /bin/hello ./main.go

FROM scratch
COPY --from=build /bin/hello /bin/hello
CMD ["/bin/hello"]
```

>构建
```shell
$ docker build -t hello_go:v1 .
$ sudo docker images
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
hello_go     v1        a09a944ee0b3   15 seconds ago   1.81MB
```
多阶段构建每个FROM指令都可以使用不同的基础镜像，并可以通过索引来引用，也可以用as指令为阶段命令，上面将第一个FROM命名为build，然后再其他阶段需要引用时使用`COPY --from=build`即可。



## 最佳实践
>使用多阶段构建

多阶段构建可以让最终构建的镜像尽可能的小，将Dockerfile指令拆分为不同的阶段，以确保构建的镜像仅包含运行应用程序所必需的文件。

>选择正确的基础镜像

选择基础镜像时，要确保它是安全的，尽量选择官方镜像，并且镜像体积要小。

>仅安装必要软件包

为了降低复杂性、减少依赖、减小文件大小和构建时间，应该避免安装额外的或者不必要的软件包。

>对多行参数排序

比如要安装多个包时,将多行参数按字母顺序排序，可以帮助避免重复安装同一个包，更新包列表时也更容易，同时也更容易阅读。如下：
```shell
RUN apt-get update && apt-get install -y \
  bzr \
  cvs \
  git \
  mercurial \
  subversion \
  && rm -rf /var/lib/apt/lists/*
```

>利用构建缓存
构建映像时，Docker会逐步执行Dockerfile中的指令，并按指定的顺序执行每条指令。对于每条指令，Docker都会检查是否可以重用构建缓存中的指令。

>不以root身份运行容器

正确的删除权限的方法如下：
```shell
FROM node:16.17.0-bullseye-slim
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app
RUN npm ci --only=production
USER node
CMD "npm" "start"
```

>一个容器只专注做一件事情

每个容器应该只关注一个方面。将应用程序解耦到多个容器中可以更轻松地进行水平扩展和重复使用容器。例如，一个Web应用程序可能由三个独立的容器组成，每个容器都有自己独特的镜像。

>使用.dockerignore排除

排除与构建无关的文件，使用文件.dockerignore。此文件支持与.gitignore文件类似的排除模式。例如，排除所有带有以下.md扩展名的文件：
```shell
*.md
```
