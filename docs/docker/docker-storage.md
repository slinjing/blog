# Docker存储
在Docker中默认情况下，容器内创建的所有文件都存储在可写的容器层上。为了能在容器停止后依旧保留其数据，Docker提供了两种数据持久化方式：数据卷和绑定挂载。


## 数据卷
卷由Docker独立管理，可供一个或多个容器使用。对卷内文件的修改会马上生效，并且即使容器删除卷也会存在。在Docker中可以使用以下命令创建一个卷：
```shell
$ docker volume create test-volume
```
创建完成后查看`test-volume`的信息，可以看到卷的位置处于`/var/lib/docker/volumes/test-volume/_data`，具体信息如下：
```shell
$ docker volume inspect test-volume
[
    {
        "CreatedAt": "2024-07-02T14:02:52+08:00",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/test-volume/_data",
        "Name": "test-volume",
        "Options": {},
        "Scope": "local"
    }
]
```
此时已经准备好一个用来持久化数据的卷，接下来在容器启动时使用，对于卷的使用可以选择`-v`或`--mount`，它们的区别在于`-v`语法将所有选项组合在一个字段中，而`--mount`语法将它们分开，对于`-v`或`--mount`官方推荐使用`--mount`。下面先演示`-v`如何使用：
```shell
$ docker run -d --name test-nginx -v test-volume:/usr/share/nginx/html:ro  nginx
```
上面的命令中`test-volume`为卷名，`/usr/share/nginx/html`为容器中的挂载路径，`ro`代表容器内只读。如果在容器中执行以下命令则会报错：
```shell
$ echo 22 >> /usr/share/nginx/html/50x.html
bash: 50x.html: Read-only file system
```

`--mount`使用时，`type`可以指定为`bind、volume和tmpfs`,默认是`volume`；`source或src`为卷名，使用匿名卷时可以省略；`destination、dst或target`为容器中的挂载路径；`readonly或ro`会以只读形式挂载，具体如下：
```shell
$ docker run -d --name test1-nginx --mount source=test-volume,destination=/usr/share/nginx/html,readonly nginx
```
此时使用`docker inspect`分别查看两个容器的信息，关于Mounts部分可以看到使用的是同一个卷，并且都为只读：
```shell
$ docker inspect test-nginx
"Mounts": [
            {
                "Type": "volume",
                "Name": "test-volume",
                "Source": "/var/lib/docker/volumes/test-volume/_data",
                "Destination": "/usr/share/nginx/html",
                "Driver": "local",
                "Mode": "ro",
                "RW": false,
                "Propagation": ""
            }
        ],

$ docker inspect test1-nginx
"Mounts": [
            {
                "Type": "volume",
                "Name": "test-volume",
                "Source": "/var/lib/docker/volumes/test-volume/_data",
                "Destination": "/usr/share/nginx/html",
                "Driver": "local",
                "Mode": "z",
                "RW": false,
                "Propagation": ""
            }
        ],
```

卷的生命周期是独立于容器之外的，Docker不会在容器被删除后自动删除卷，下面删掉测试的两个容器验证一下：
```shell
$ docker rm -f test-nginx
test-nginx
$ docker rm -f test1-nginx
test1-nginx
$ docker volume ls | grep test-volume
local     test-volume
$ ls /var/lib/docker/volumes/test-volume/_data
50x.html  index.html
```
通过验证发现此时数据卷确实还保留在主机上，如果需要删除卷可以使用`docker volume rm test-volume`命令，清理无主的数据卷使用`docker volume prune`命令。

## 绑定挂载
Docker中除了上述的卷挂载外，还支持直接将主机目录挂载到容器内。跟卷相比主机上挂载的目录或文件不需要提前创建，如果不存在Docker会自动创建。绑定挂载同样可以使用`-v`或`--volume`，如下：
```shell
$ docker run -d --name nginx-v -v /tmp/html:/usr/share/nginx/html nginx
```
此时主机的`/tmp/html`目录，会被挂载到容器的`/usr/share/nginx/html`，进入容器查看会发现`/usr/share/nginx/html`下是空的，因为主机的`/tmp/html`目录不存在任何文件，当在主机的`/tmp/html`目录下添加一个文件，进入容器再次查看：
```shell
$ echo 11 > /tmp/html/index.html
$ docker exec -it nginx-v /bin/bash
$ ls /usr/share/nginx/html/
index.html
```

使用绑定挂载时`type`默认为`bind`，其他地方与上面使用卷挂载时一样。
```shell
docker run -d --name nginx-mount --mount type=bind,source=/tmp/html,target=/usr/share/nginx/html nginx
```
容器启动后进入容器，应该可以看到上面创建的`index.html`：
```shell
$ docker exec -it nginx-mount /bin/bash
$ cat /usr/share/nginx/html/index.html
11
```


## 远程挂载
在上述的步骤中持久化数据都是保存在本地，如果需要将数据保存在其他主机时，Docker也支持将数据卷挂载到远程主机，并且支持多种方式，如：卷驱动程序、NFS、CIFS/Samba以及块设备。详细内容可以参考[文档。](https://docs.docker.com/storage/volumes/#share-data-between-machines)

### 卷驱动程序
使用卷驱动程序步骤如下：
> 首先需要在Docker主机安装vieux/sshfs插件

```shell
$ docker plugin install --grant-all-permissions vieux/sshfs
```

> 安装完成后使用卷驱动程序创建卷，可以配置SSH密钥实现免密
```shell
$ docker volume create --driver vieux/sshfs -o sshcmd=user@host_ip:/home/test -o password=password sshvolume
```

>启动容器


容器启动时`/home/test`需要存在，不然容器会无法启动。
```shell
 docker run -d --name sshfs-container  --mount type=volume,volume-driver=vieux/sshfs,src=sshvolume,target=/app,volume-opt=sshcmd=user@host_ip:/home/test,volume-opt=password=password nginx
```

### NFS
上面的方式实现了将Docker容器数据存储到远端，但是创建数据卷和容器时都必须指定远端主机密码，或者配置免密登录，用起来不是很方便，下面使用NFS作为远程存储。

>部署NFS服务
```shell
$ yum -y install nfs-utils

# 创建NFS挂载目录
$ mkdir /home/docker-nfs
$ chown nobody.nobody /home/docker-nfs

# 修改NFS-SERVER配置，*替换为对应的网段或地址如：/home/docker-nfs 10.1.1.0/24
$ echo '/home/docker-nfs *(rw,sync,no_root_squash)' > /etc/exports

$ systemctl restart rpcbind nfs-utils nfs-server
$ systemctl enable nfs-server
```

>验证NFS SERVER
```shell
$ yum -y install nfs-utils
$ showmount -e nfs_host_ip    
----
Export list for nfs_host_ip:
/home/docker-nfs *
```

>使用NFS卷服务

```shell
$ docker run -d --name nfs-nginx --mount 'type=volume,source=nfsvolume,target=//usr/share/nginx/html,volume-driver=local,volume-opt=type=nfs,volume-opt=device=:/home/docker-nfs,volume-opt=o=addr=nfs_host_ip' nginx
```

> 验证
```shell
$ docker ps | grep nfs-nginx
3f855d503ec5   nginx     "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   80/tcp    nfs-nginx
$ docker volume ls | grep nfsvolume
local                nfsvolume

# NFS
$ ls /home/docker-nfs/
50x.html  index.html
```

NFS Server为v4版本，只需要加上`nfsvers=4`如下：
```shell
$ docker run -d --name nfs-nginx --mount 'type=volume,source=nfsvolume,target=/usr/share/nginx/html,volume-driver=local,volume-opt=type=nfs,volume-opt=device=:/home/docker-nfs,volume-opt=o=addr=nfs_host_ip,nfsvers=4' nginx
```
