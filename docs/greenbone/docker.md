# Docker 安装 Greenbone

## 启动 Greenbone
前往 [docker compose 文件地址](https://github.com/slinjing/docs/blob/main/docker-compose/greenbone-community/docker-compose.yaml) 下载 compose 文件，执行以下命令运行：

```shell
$ sudo docker-compose up -d
```
当容器全部启动成功后，浏览器访问`http://127.0.0.1:9392`打开 web 界面，按照提示创建账号，安装完成。

## 更新密码

> [!TIP] 默认账户：
> 用户：admin，密码：admin

默认情况下，用户密码均为：admin，使用以下命令更新密码：

```shell
$ docker-compose exec -u gvmd gvmd gvmd --user=admin --new-password='<password>'
```

