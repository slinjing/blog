# Docker Compose
Docker Compose是用于定义和运行多容器Docker应用程序的工具。当需要多个容器相互配合来完成某项任务的的时候，就可以通过Docker Compose，将它们以YAML文件的形式来定义。然后，使用一个命令，就可以从YAML中创建并启动所有服务。项目地址：[https://github.com/docker/compose](https://github.com/docker/compose)




## 安装
Docker Compose的安装非常简单，可以直接从GitHub下载编译好的二进制文件，并赋予可执行权限即可，也可以通过yum、pip安装。
>二进制安装
```shell
$ sudo curl -L https://github.com/docker/compose/releases/download/1.17.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```

>yum安装
```shell
$ yum install docker-compose-plugin
```

## Docker Compose示例
```yaml
services:  # 定义一个或多个服务
  service1:  # 服务名称
    image: nginx:latest  # 使用的 Docker 镜像，这里是 Nginx 的最新版本
    # 或者使用构建指令来从 Dockerfile 构建镜像
    build:
      context: ./path/to/Dockerfile  # Dockerfile 所在的目录
      dockerfile: Dockerfile-alternative  # 可选的 Dockerfile 名称，默认是 Dockerfile
    # 容器启动时执行的命令，覆盖默认的命令
    command: 
      - "nginx"
      - "-g"
      - "daemon off;"  # 以数组形式指定，防止 shell 解析
    ports:       # 容器端口与主机端口映射
      - "80:80"  # 主机 80 端口映射到容器的 80 端口

    volumes:  # 数据卷挂载
      - ./nginx.conf:/etc/nginx/nginx.conf:ro  # 将主机上的 nginx.conf 
                                              # 挂载到容器的 /etc/nginx/nginx.conf，只读
      - ./logs:/var/log/nginx  # 将 logs 目录挂载到容器的 /var/log/nginx
    environment:  # 设置环境变量
      - MYSQL_HOST=database  # 可以引用其他服务，这里假设有一个名为 database 的服务
      - MYSQL_PORT=3306
    depends_on:  # 服务启动顺序，这里表明 service1 依赖于 database 服务
      - database
    networks:  # 定义网络
      - my_network  # 参与名为 my_network 的网络

  service2:  # 另一个服务示例
    # ... 类似地定义其他服务

networks:       # 定义网络
  my_network:  # 网络名称
    driver: bridge  # 网络驱动，通常是 bridge 模式

volumes:  # 定义数据卷
  nginx_logs:  # 卷名称
```


## Compose Watch
Watch会监听指定的文件，并在文件更新时重新生成或刷新容器，Watch有sync和rebuild两个动作。
>sync

如果action设置为sync，每当path路径下文件发生更改时，Compose都会将文件同步到容器内的/code目录下并更新容器，例如：
```yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
    develop:
      watch:
        - action: sync
          path: .  
          target: /code
  redis:
    image: "redis:6.2-alpine3.15"
```

>rebuild

如果action设置为rebuild，Compose会自动使用BuildKit构建一个新的镜像并替换正在运行的服务容器。示例如下：
```yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
    develop:
      watch:
        - action: rebuild
          path: app.py
  redis:
    image: "redis:6.2-alpine3.15"
```
对于不想同步的文件，可以通过ignore忽略，如下：
```yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
    develop:
      watch:
        - action: rebuild
          path: app.py
          ignore:
            - node_modules/
  redis:
    image: "redis:6.2-alpine3.15"
```

## 服务拆分
如果需要运行多个容器，并且由不同团队维护时，可以将yaml文件进行拆分。例如：
```yaml
# infra.yaml
services:
  redis:
    image: "redis:6.2-alpine3.15"
```
下面的docker-compose.yaml文件中，使用include来引用infra.yaml的内容。
```yaml
# docker-compose.yaml
include:
  - infra.yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
```
