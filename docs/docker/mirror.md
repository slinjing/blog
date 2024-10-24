# 镜像加速
国内从`Docker Hub`拉取镜像有时会遇到困难，此时可以配置镜像加速器。由于镜像服务可能出现宕机，建议同时配置多个镜像。

## 国内加速器地址

- 阿里云：`点击管理控制台 -> 登录账号(淘宝账号) -> 左侧镜像工具 -> 镜像加速器 -> 复制加速器地址`

- 网易云：`https://hub-mirror.c.163.com`

- 百度云：`https://mirror.baidubce.com`


## 配置镜像加速器
在`/etc/docker/daemon.json`中写入如下内容（如果文件不存在请新建该文件）：
```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```
修改完成之后重新启动服务。
```shell
$ sudo systemctl daemon-reload
$ sudo systemctl restart docker
```



