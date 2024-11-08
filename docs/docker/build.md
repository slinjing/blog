# Dockerfile 定制镜像

Dockerfile 是一个文本文件，其内包含了一条条的 **指令(Instruction)**，每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。


以 nginx 镜像为例，使用 Dockerfile 来定制自己的镜像。在一个空目录中，建立一个文本文件，并命名为 Dockerfile。
```shell
$ mkdir nginx
$ cd nginx
$ touch Dockerfile
```

Dockerfile 文件内容：
```Dockerfile
FROM nginx
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
```

## FROM 指定基础镜像
定制镜像必须以一个镜像为基础，并在其上进行定制。`FROM` 就是用来指定**基础镜像**的指令，在`Dockerfile`中`FROM`是必备的指令，并且必须是第一条指令。


除了选择现有镜像为基础镜像外，Docker 还存在一个特殊的镜像，名为 **scratch**。这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像。

```Dockerfile
FROM scratch
...
```

> [!TIP] 说明：
> 如果使用 **scratch** 为基础镜像的话，意味着不以任何镜像为基础，接下来所写的指令将作为镜像第一层开始存在。

## RUN 执行命令

`RUN` 指令是用来执行命令行命令的。由于命令行的强大能力，`RUN` 指令在定制镜像时是最常用的指令之一。其格式有两种：

- shell 格式：`RUN <命令>`，就像直接在命令行中输入的命令一样。
```Dockerfile
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
```

- exec 格式：`RUN ["可执行文件", "参数1", "参数2"]`，这更像是函数调用中的格式。


- RUN 的正确写法   
> [!TIP] 说明：
> `Dockerfile` 中每一个指令都会建立一层，`RUN` 也不例外。每一个 `RUN` 的行为，就会新建立一层，在其上执行这些命令，执行结束后，`commit` 这一层的修改，构成新的镜像。因此，当需要执行多条 `Shell` 命令时 `Dockerfile` 正确的写法应该是这样：
```Dockerfile
FROM debian:stretch

RUN set -x; buildDeps='gcc libc6-dev make wget' \
    && apt-get update \
    && apt-get install -y $buildDeps \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && mkdir -p /usr/src/redis \
    && tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1 \
    && make -C /usr/src/redis \
    && make -C /usr/src/redis install \
    && rm -rf /var/lib/apt/lists/* \
    && rm redis.tar.gz \
    && rm -r /usr/src/redis \
    && apt-get purge -y --auto-remove $buildDeps
```

## 构建镜像

在 Dockerfile 文件所在目录执行：
```shell
$ docker build -t nginx:v3 .
Sending build context to Docker daemon 2.048 kB
Step 1 : FROM nginx
 ---> e43d811ce2f4
Step 2 : RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
 ---> Running in 9cdc27646c7b
 ---> 44aa4490ce2c
Removing intermediate container 9cdc27646c7b
Successfully built 44aa4490ce2c
```

> [!TIP] 说明：
> 从命令的输出结果中，可以看到镜像的构建过程。在 Step 2 中，RUN 指令启动了一个容器 9cdc27646c7b，执行了所要求的命令，并最后提交了这一层 44aa4490ce2c，随后删除了所用到的这个容器 9cdc27646c7b。


## 镜像构建上下文

构建镜像时执行的 `docker build` 命令最后有一个` .`。`. `表示当前目录，也是在指定上下文的目录。

- Dockerfile 中有一条指令：

```Dockerfile
COPY ./package.json /app/
```

这并不是要复制执行 `docker build` 命令所在的目录下的 `package.json`，也不是复制 `Dockerfile` 所在目录下的 `package.json`，而是复制 `上下文（context）` 目录下的 `package.json`。

> [!TIP] 说明：
> 一般来说，应该会将 `Dockerfile` 置于一个空目录下，或者项目根目录下。如果该目录下没有所需文件，那么应该把所需文件复制一份过来。如果目录下有些东西确实不希望构建时传给 `Docker` 引擎，那么可以用 `.gitignore` 一样的语法写一个 `.dockerignore`，该文件是用于剔除不需要作为上下文传递给 `Docker` 引擎的。

- docker build 还支持从 URL 构建
```shell
$ docker build -t hello-world https://github.com/docker-library/hello-world.git#master:amd64/hello-world

Step 1/3 : FROM scratch
 --->
Step 2/3 : COPY hello /
 ---> ac779757d46e
Step 3/3 : CMD ["/hello"]
 ---> Running in d2a513a760ed
Removing intermediate container d2a513a760ed
 ---> 038ad4142d2b
Successfully built 038ad4142d2b
```

- 用给定的 tar 压缩包构建

如果所给出的 URL 不是个 Git repo，而是个 tar 压缩包，那么 Docker 引擎会下载这个包，并自动解压缩，以其作为上下文，开始构建。
```shell
$ docker build http://server/context.tar.gz
```


- 从标准输入中读取 Dockerfile 进行构建
```shell
$ docker build - < Dockerfile
```
或
```shell
$ cat Dockerfile | docker build -
```

- 从标准输入中读取上下文压缩包进行构建
```shell
$ docker build - < context.tar.gz
```