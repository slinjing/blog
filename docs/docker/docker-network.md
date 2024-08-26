# Docker网络
在Docker中使用`docker run`创建容器时，可以用`--net`选项指定容器的网络模式，Docker有以下4种网络模式：
- bridge模式：--net=bridge  默认设置
- host模式：--net=host
- none模式：--net=none
- container模式：--net=container_name or container_name_id

## Bridge模式
当Docker进程启动时，会在主机上创建一个名为docker0的虚拟网桥，默认情况下主机上启动的Docker容器会连接到这个虚拟网桥上。由于Bridge模式是Docker的默认模式，此时主机上的所有容器都通过docker0连接在同一个网络中，并由docker0分配网络，其自身的IP地址作为容器的网关。主机上会创建一对虚拟网卡veth pair设备， veth pair设备的一端放在新创建的容器中，命名为eth0作为容器的网卡，另一端在主机上，命名方式为：vethxxx，并加入到docker0网桥中。如下图：
<!-- ![img](/img/bridge.png) -->

可以通过`brctl show`命令查看，默认是没有此命令的，使用`yum install bridge-utils`命令安装。
```shell
$ docker run -it --rm --name busybox --net=bridge busybox sh
$ brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.0242d5b3cb20       no              veth2b99c1c

$ ip a
22: veth2b99c1c@if21: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default
    link/ether 0e:ab:6f:9a:f7:cf brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::cab:6fff:fe9a:f7cf/64 scope link
       valid_lft forever preferred_lft forever
```
进入容器内部查看：
```shell
$ docker exec -it busybox /bin/sh
$ ip a
21: eth0@if22: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever

$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
```
Docker实际是在iptables做了DNAT规则，实现端口转发功能。可以使用`iptables -t nat -vnL`命令查看：
```shell
iptables -t nat -vnL
Chain PREROUTING (policy ACCEPT 14 packets, 1466 bytes)
 pkts bytes target     prot opt in     out     source               destination
    5   256 DOCKER     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ADDRTYPE match dst-type LOCAL

Chain INPUT (policy ACCEPT 14 packets, 1466 bytes)
 pkts bytes target     prot opt in     out     source               destination

Chain OUTPUT (policy ACCEPT 25 packets, 2314 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 DOCKER     all  --  *      *       0.0.0.0/0           !127.0.0.0/8          ADDRTYPE match dst-type LOCAL

Chain POSTROUTING (policy ACCEPT 25 packets, 2314 bytes)
 pkts bytes target     prot opt in     out     source               destination
    0     0 MASQUERADE  all  --  *      !docker0  172.17.0.0/16        0.0.0.0/0

Chain DOCKER (2 references)
 pkts bytes target     prot opt in     out     source               destination
    0     0 RETURN     all  --  docker0 *       0.0.0.0/0            0.0.0.0/0

```


## Host模式
使用时容器将和宿主机共用一个Network Namespace，也就是说容器不会虚拟出自己的网卡、配置网络信息。但文件系统、进程列表等还是和宿主机隔离的。下面可以看到容器的网络信息与宿主机一致：
```shell
$ docker run -it --rm --name busybox --net=host busybox sh
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:0c:29:53:85:06 brd ff:ff:ff:ff:ff:ff
    inet 11.0.1.128/24 brd 11.0.1.255 scope global dynamic noprefixroute ens33
       valid_lft 1545sec preferred_lft 1545sec
    inet6 fe80::fba3:83b9:4fd0:7678/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue
    link/ether 02:42:d5:b3:cb:20 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:d5ff:feb3:cb20/64 scope link
       valid_lft forever preferred_lft forever
```

## Container模式
使用Container模式时，指定新创建的容器和已经存在的一个容器共用一个Network Namespace。Container模式与Host模式类似，只不过它共享的不是宿主机网络，而是已存在的容器，两个容器的进程可以通过lo网卡设备通信。Container模式​演示：

```shell
$ docker run -it --rm --name busybox busybox sh
$ docker run -it --rm --net=container:busybox --name busybox_container busybox sh

# 分别查看两个容器的网络信息，是完全一致的
$ ifconfig –a
$ route -n
```


## None模式
使用none模式，Docker容器拥有自己的Network Namespace，但是不进行任何网络配置。使用none模式的容器没有网卡、IP、路由等信息，需要手动配置。None模式​​演示：
```shell
$ docker run -it --rm --net=none --name busybox busybox sh
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
```

## 自定义网络
在Docker中可以创建自定义网络，并将多个容器连接到同一网络。连接到用户定义网络后，容器可以使用容器IP地址或容器名称相互通信。定义网络演示：
```shell
# 创建网络
$ docker network create -d bridge my-net
# 创建容器连接到自定义网络
$ docker run -it --rm --net=my-net --name busybox busybox sh
# 再次创建查看两个容器的网络
$ docker run -it --rm --net=my-net --name busybox1 busybox sh

# busybox
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
32: eth0@if33: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever

# busybox1
ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
34: eth0@if35: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.3/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```
可以看到两个容器在同一网段，在创建自定义网络时，可以根据需要选择上述不同的网络模式。通过`docker inspect`命令查看创建的网卡信息，其中Config字段为网络信息，Containers字段为连接的容器信息。
```shell
$ docker inspect my-net
[
    {
        "Name": "my-net",
        "Id": "86711b725a35c4f750fd9096cf024110d919361a0c88c840eff56ec35e419740",
        "Created": "2024-07-05T11:14:55.349813302+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "48bf14c44c83a0977eb023fdc908db9693643075477b65f5c46a8f4d3ac3b143": {
                "Name": "busybox1",
                "EndpointID": "e46e94e25cb07dbddce56c0df29f4da1a3563389bd3d2a5e274a47238d52e4a0",
                "MacAddress": "02:42:ac:12:00:03",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            },
            "cb417227ad31a9d5db451a53af06f3990c33a4c97422104b837867657a687e8e": {
                "Name": "busybox",
                "EndpointID": "a151efa62c7bc15ebf54145921b919a35640be8812ac54876880a44d1ac03921",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```
以上为Docker网络的基本使用，多容器之间需要互相连接时，推荐使用Docker Compose。