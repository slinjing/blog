# 安装
`etcd`基于`Go`语言实现，因此，可以从[项目主页](https://github.com/etcd-io/etcd)下载源代码自行编译，也可以下载编译好的二进制文件，或者使用`Docker`镜像运行。


## 二进制下载
编译好的二进制文件都在 [github.com/etcd-io/etcd/releases](https://github.com/etcd-io/etcd/releases) 页面，选择需要的版本，或通过下载工具下载。

```shell
$ curl -L https://github.com/etcd-io/etcd/releases/download/v3.4.0/etcd-v3.4.0-linux-amd64.tar.gz -o etcd-v3.4.0-linux-amd64.tar.gz

# 国内用户可以使用以下方式加快下载
$ curl -L https://download.fastgit.org/etcd-io/etcd/releases/download/v3.4.0/etcd-v3.4.0-linux-amd64.tar.gz -o etcd-v3.4.0-linux-amd64.tar.gz

$ tar xzvf etcd-v3.4.0-linux-amd64.tar.gz
$ cd etcd-v3.4.0-linux-amd64
```
解压后，可以看到文件包括
```shell
$ ls
Documentation README-etcdctl.md README.md READMEv2-etcdctl.md etcd etcdctl
```
其中`etcd`是服务主文件，`etcdctl`是提供给用户的命令客户端，其他文件是支持文档。

将`etcd etcdctl`文件放到系统可执行目录（例如 `/usr/local/bin/`）。
```shell
$ sudo cp etcd* /usr/local/bin/
```

默认`2379`端口处理客户端的请求，`2380`端口用于集群各成员间的通信。启动`etcd`显示类似如下的信息：
```shell
$ etcd
...
2017-12-03 11:18:34.411579 I | embed: listening for peers on http://localhost:2380
2017-12-03 11:18:34.411938 I | embed: listening for client requests on localhost:2379
```
此时，可以使用`etcdctl`命令进行测试，设置和获取键值`testkey: "hello world"`，检查`etcd`服务是否启动成功：
```shell
$ ETCDCTL_API=3 etcdctl member list
8e9e05c52164694d, started, default, http://localhost:2380, http://localhost:2379

$ ETCDCTL_API=3 etcdctl put testkey "hello world"
OK

$ etcdctl get testkey
testkey
hello world
```
说明`etcd`服务已经成功启动。