# 部署负载均衡器
> [!NOTE] 注意：
> 以下操作在 ha1、ha2 节点上执行。

## 安装 Haproxy、Keepalived
```shell
$ yum -y install haproxy keepalived
```

## Haproxy 配置文件
ha1、ha2 节点配置文件相同
```shell
$ cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg-back
$ cat > /etc/haproxy/haproxy.cfg << "EOF"
global
 maxconn 2000
 ulimit-n 16384
 log 127.0.0.1 local0 err
 stats timeout 30s

defaults
 log global
 mode http
 option httplog
 timeout connect 5000
 timeout client 50000
 timeout server 50000
 timeout http-request 15s
 timeout http-keep-alive 15s

frontend monitor-in
 bind *:33305
 mode http
 option httplog
 monitor-uri /monitor

frontend k8s-master
 bind 0.0.0.0:6443
 bind 127.0.0.1:6443
 mode tcp
 option tcplog
 tcp-request inspect-delay 5s
 default_backend k8s-master

backend k8s-master
 mode tcp
 option tcplog
 option tcp-check
 balance roundrobin
 default-server inter 10s downinter 5s rise 2 fall 2 slowstart 60s maxconn 250 maxqueue 256 weight 100
 server  k8s-master01  11.0.1.142:6443 check
 server  k8s-master02  11.0.1.143:6443 check
 server  k8s-master03  11.0.1.144:6443 check
EOF
```

## Keepalived 配置文件
- ha1 节点：
```shell
$ cp /etc/keepalived/keepalived.conf /etc/keepalived/keepalived.conf-back
$ cat > /etc/keepalived/keepalived.conf << "EOF"
! Configuration File for keepalived
global_defs {
   router_id LVS_DEVEL
script_user root
   enable_script_security
}
vrrp_script chk_apiserver {
   script "/etc/keepalived/check_apiserver.sh"
   interval 5
   weight -5
   fall 2 
rise 1
}
vrrp_instance VI_1 {
   state MASTER
   interface ens33
   mcast_src_ip 11.0.1.140
   virtual_router_id 51
   priority 100
   advert_int 2
   authentication {
       auth_type PASS
       auth_pass K8SHA_KA_AUTH
   }
   virtual_ipaddress {
       11.0.1.100
   }
   track_script {
      chk_apiserver
   }
}
EOF
```

- ha2 节点：
```shell
$ cat > /etc/keepalived/keepalived.conf << "EOF"
! Configuration File for keepalived
global_defs {
   router_id LVS_DEVEL
script_user root
   enable_script_security
}
vrrp_script chk_apiserver {
   script "/etc/keepalived/check_apiserver.sh"
  interval 5
   weight -5
   fall 2 
rise 1
}
vrrp_instance VI_1 {
   state BACKUP
   interface ens33
   mcast_src_ip 11.0.1.141
   virtual_router_id 51
   priority 99
   advert_int 2
   authentication {
       auth_type PASS
       auth_pass K8SHA_KA_AUTH
   }
   virtual_ipaddress {
       11.0.1.100
   }
   track_script {
      chk_apiserver
   }
}
EOF
```

## 健康检查脚本
- ha1 节点：
```shell
$ cat > /etc/keepalived/check_apiserver.sh <<"EOF"
#!/bin/bash
err=0
for k in $(seq 1 3)
do
   check_code=$(pgrep haproxy)
   if [[ $check_code == "" ]]; then
       err=$(expr $err + 1)
       sleep 1
       continue
   else
       err=0
       break
   fi
done

if [[ $err != "0" ]]; then
   echo "systemctl stop keepalived"
   /usr/bin/systemctl stop keepalived
   exit 1
else
   exit 0
fi
EOF

$ chmod +x /etc/keepalived/check_apiserver.sh
```
- ha2 节点：
```shell
$ cat > /etc/keepalived/check_apiserver.sh <<"EOF"
#!/bin/bash
err=0
for k in $(seq 1 3)
do
   check_code=$(pgrep haproxy)
   if [[ $check_code == "" ]]; then
       err=$(expr $err + 1)
       sleep 1
       continue
   else
       err=0
       break
   fi
done

if [[ $err != "0" ]]; then
   echo "systemctl stop keepalived"
   /usr/bin/systemctl stop keepalived
   exit 1
else
   exit 0
fi
EOF

$ chmod +x /etc/keepalived/check_apiserver.sh
```

## 启动 Haproxy、Keepalived

```shell
$ systemctl enable haproxy keepalived --now
```

## 验证
```shell
$ ip a s
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:aa:5c:b4 brd ff:ff:ff:ff:ff:ff
    inet 11.0.1.141/24 brd 11.0.1.255 scope global noprefixroute ens33
       valid_lft forever preferred_lft forever
    inet 11.0.1.100/32 scope global ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::6305:76c5:ac2c:894e/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```
