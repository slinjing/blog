# Portainer
Portainer 是一款轻量级的应用，它提供了图形化界面，用于方便地管理Docker环境，包括单机环境和集群环境。
官网：https://www.portainer.io/

## 安装
将以下内容保存为`portainer.yml`，再执行`docker-compose -f portainer.yml up -d`命令。
```yaml
version: '3.2'
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: always
    ports: 
      - 8000:8000
      - 9443:9443
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data

networks:
  portainer_net:

volumes:
  portainer_data:
```
执行`docker-compose -f portainer.yml ps`命令可以查看容器状态
```shell
$ docker-compose -f portainer.yml ps
NAME                IMAGE                           COMMAND             SERVICE             CREATED             STATUS              PORTS
portainer           portainer/portainer-ce:latest   "/portainer"        portainer           3 minutes ago       Up 3 minutes        0.0.0.0:8000->8000/tcp, 0.0.0.0:9443->9443/tcp, 9000/tcp
```
## 登陆
访问本机9000端口，第一次登陆需创建用户密码。