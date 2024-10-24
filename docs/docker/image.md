# 镜像
镜像是一个标准化包，其中包含运行容器所需的所有文件、二进制文件、库和配置。

## 原则
- 镜像是不可变的。镜像一旦创建，就无法修改。只能创建新镜像或在其上添加更改。

- 镜像由层组成。每层代表一组添加、删除或修改文件的文件系统更改。

## 查找镜像
使用`docker search`命令搜索像：
```shell
$ docker search docker/welcome-to-docker
```

使用`docker pull`命令拉取镜像：
```shell
$ docker pull docker/welcome-to-docker
```