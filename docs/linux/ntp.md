# 时间同步
## ntp
网络时间协议（Network Time Protocol）是一种通过分组交换、可变延迟数据网络在计算机系统之间进行时钟同步的网络协议。

> ntp 安装
```shell
yum -y install ntp
```
> ntp 配置

配置文件路径：`/etc/ntp.conf` ，参考配置：
```shell
driftfile /var/lib/ntp/drift

restrict default nomodify notrap nopeer noquery

restrict 127.0.0.1   
restrict ::1         

# 放行允许的网段
restrict 11.0.1.0 mask 255.255.255.0 nomodify notrap 

# 注释掉默认 ntp server 
# server 0.centos.pool.ntp.org iburst
# server 1.centos.pool.ntp.org iburst
# server 2.centos.pool.ntp.org iburst
# server 3.centos.pool.ntp.org iburst

# 设置国内 ntp server 可配置多条
server ntp1.aliyun.com
```


修改完成后执行`systemctl enable ntpd --now`命令启动 ntp 服务并加入开机自启动，启动后可以通过`ntpq -p`命令查看服务状态，返回信息如下。
```shell
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 120.25.115.20   .INIT.          16 u    -   64    0    0.000    0.000   0.000
```

> 端口

ntp 使用的端口是 udp 123，所以服务端的防火墙需要开放 udp 123 端口，或者关闭防火墙。

- iptables
```shell
iptables -A INPUT -p UDP -i eth0 -s 192.168.0.0/24 --dport 123 -j ACCEPT
```

- firewalld
```shell
firewall-cmd --zone=public --add-port=123/udp --permanent
```

> 客户端配置

```shell
yum -y install ntpdate
ntpdate 11.0.1.70
echo "0 3 * * * /usr/sbin/ntpdate 11.0.1.70" >> /etc/crontab 
systemctl restart crond 
```

> 扩展命令
```shell
ntpstat # 查看 ntp server 状态
watch ntpq -p # 查看ntpd进程的状态
```

> 网址
[ntp](https://en.wikipedia.org/wiki/Network_Time_Protocol) 

## chrony
chrony 是网络时间协议的多功能实现。它可以将系统时钟与 ntp 服务器、参考时钟以及使用手表和键盘的手动输入同步。它还可以作为 ntp 服务器和对等端运行，为网络中的其他计算机提供时间服务。

> chrony 安装

```shell
yum -y install chrony
```
> 服务端配置

配置文件路径：`/etc/chrony.conf`，参考配置：
```shell
# 修改以下两处
# 注释掉默认 ntp server 
# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server ntp1.aliyun.com

# 允许 ntp 客户端地址
# Allow NTP client access from local network.
allow 11.0.1.0/24
```
修改完成后执行`systemctl enable chronyd --now`命令启动 chrony 服务并加入开机自启动。

> 客户端配置

配置文件路径：`/etc/chrony.conf`，参考配置：
```shell
# 注释掉默认 ntp server 
# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server 11.0.1.70 iburst
```
修改完成后执行`systemctl enable chronyd --now`命令启动 chrony 服务并加入开机自启动。

> 扩展命令
```shell
timedatectl status # 查看时间同步状态
timedatectl set-ntp true # 开启网络时间同步
chronyc clients # 查看客户端
chronyc sources -v # 查看 ntp server
chronyc activity -v # 查看 ntp server 状态
chronyc tracking -v # 查看 ntp 详细信息
chronyc -a makestep # 强制同步系统时钟
```

> 网址
[chrony](https://chrony-project.org/)

## ntp server
```shell
ntp1.aliyun.com  # 阿里云
time.windows.com  # Windows
cn.ntp.org.cn  # ntp 授时快速域名服务
```

