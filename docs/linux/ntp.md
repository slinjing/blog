# 时间同步

## NTP

### 安装NTP
```shell
$ yum -y install ntp
```
### 配置
修改配置文件`/etc/ntp.conf`，修改客户端网段限制，并注释默认的时间同步源，添加新的时间同步源。
```shell
restrict 192.168.0.0 mask 255.255.0.0 nomodify notrap

#server 0.centos.pool.ntp.org iburst
#server 1.centos.pool.ntp.org iburst
#server 2.centos.pool.ntp.org iburst
#server 3.centos.pool.ntp.org iburst
server ntp1.aliyun.com
```

修改完成后启动ntp服务并加入开机自启动，启动后可以通过`ntpq -p`命令查看服务状态。
```shell
$ systemctl enable ntpd --now
$ ntpq -p
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 120.25.115.20   .INIT.          16 u    -   64    0    0.000    0.000   0.000
```

### 客户端配置
```shell
$ ntpdate 192.168.0.1
$ crontab -e
*/5 * * * * /usr/sbin/ntpdate 192.168.0.1 &>/dev/null
```