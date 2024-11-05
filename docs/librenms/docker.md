# Docker 安装 LibreNMS

前往 [docker compose 文件地址](https://github.com/slinjing/docs/tree/main/docker-compose/librenms) 下载 compose 文件后，修改`.env`文件，设置数据库密码，最后执行以下命令运行：
```shell
$ sudo docker-compose up -d
```
当容器全部启动成功后，浏览器访问`http://localhost:8000`打开 web 界面，按照提示创建账号，安装完成。