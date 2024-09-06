# 系统管理

## reboot
用于重启系统，格式为`reboot`，默认只能使用 root 用户执行。
```shell
$ reboot
```

## shutdown
用于关闭系统，其格式为 `shutdown -[选项]`。
```shell
# 立即关机
$ shutdown -h now

# 5分钟后关机
$ shutdown +5 
```

## date
date 命令用于显示及设置系统的时间或日期，格式为：`date [选项] [指定格式]`。

查看系统时间:
```shell
$ date
Mon Aug 24 16:11:23 CST 2017
```
按照`年-月-日 小时:分钟:秒`的格式查看当前系统时间：
```shell
$ date "+%Y-%m-%d %H:%M:%S"
2017-08-24 16:29:12
```
设置系统的当前时间:
```shell
$ date -s "20210901 13:30:00"
Wed Sep  1 13:30:00 CST 2021
```

## wget
用于在终端中下载网络文件，格式为`wget [参数] url地址`。
> 参数
```shell
-b # 后台下载模式
-P # 下载到指定目录
-t # 最大尝试次数
-c # 断点续传
-p # 下载页面内所有资源，包括图片、视频等
-r # 递归下载
```
下载百度首页：
```shell
$ wget www.baid.com
--2021-09-05 14:59:30--  http://www.baid.com/
Resolving www.baid.com (www.baid.com)... 85.121.14.224
Connecting to www.baid.com (www.baid.com)|85.121.14.224|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/html]
Saving to: ‘index.html’

    [ <=>                                               ] 988         --.-K/s   in 0s

2021-09-05 14:59:32 (84.9 MB/s) - ‘index.html’ saved [988]
```

## ps
用于查看系统中的进程状态，格式为`ps [参数]`。
> 参数
```shell
-a # 显示所有进程（包括其他用户的进程）
-u # 用户以及其他详细信息
-x # 显示没有控制终端的进程
```
Linux 系统进程有5种常见的进程状态，分别为运行、中断、不可中断、僵死与停止：
>R（运行）：进程正在运行或在运行队列中等待。
<br>S（中断）：进程处于休眠中，当某个条件形成后或者接收到信号时，则脱离该状态。
<br>D（不可中断）：进程不响应系统异步信号，即便用 kill 命令也不能将其中断。
<br>Z（僵死）：进程已经终止，但进程描述符依然存在, 直到父进程调用 wait4()系统函数
后将进程释放。
<br>T（停止）：进程收到停止信号后停止运行。

当执行`ps -aux`命令后可以看到进程状态等信息：
![img](/ps.png)

按内存资源的使用量对进程进行排序：
```shell
$ ps -aux | sort -rnk 4
```
按 CPU 资源的使用量对进程进行排序：
```shell
$ ps aux | sort -rnk 3
```

## top
top 命令用于动态地监视进程活动与系统负载等信息，格式为`top`。
![img](/top.png)
>第1行：系统时间、运行时间、登录终端数、系统负载（三个数值分别为 1 分钟、5分钟、15 分钟内的平均值，数值越小意味着负载越低）。
<br>第2行：进程总数、运行中的进程数、睡眠中的进程数、停止的进程数、僵死的进程数。
<br>第3行：用户占用资源百分比、系统内核占用资源百分比、改变过优先级的进程资源百分比、空闲的资源百分比等。
<br>第4行：物理内存总量、内存使用量、内存空闲量、作为内核缓存的内存量。
<br>第5行：虚拟内存总量、虚拟内存使用量、虚拟内存空闲量、已被提前加载的内存量。

## kill
用于终止某个指定 PID 的服务进程，格式为`kill [参数] [进程 PID]`。
```shell
$ kill 2156
```

## killall
用于终止某个指定名称的服务所对应的全部进程，格式为`killall [参数] [服务名称]`。
```shell
$ killall httpd
```

## uname
用于查看系统内核与系统版本等信息，格式为`uname -a`。
```shell
$ uname -a
Linux master-01 3.10.0-1160.el7.x86_64 #1 SMP Mon Oct 19 16:18:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```
若要查看当前系统版本的详细信息，则需要查看`redhat-release`文件：
```shell
$ cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
```

## uptime
用于查看系统的负载信息，格式为`uptime`。
```shell
$ uptime
 15:36:20 up  1:03,  1 user,  load average: 0.00, 0.02, 0.05
```
>它显示当前系统时间、系统已运行时间、启用终端数量以及平均负载值等信息。平均负载值指的是系统在最近1分钟、5分钟、15分钟内的压力情况；负载值越低越好，尽量不要长期超过1，在生产环境中不要超过 5。

## free
用于显示当前系统中内存的使用量信息，格式为`free -h`。
```shell
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           1.8G        218M        1.4G        9.4M        134M        1.4G
Swap:          2.0G          0B        2.0G
```
> Mem：物理内存；Swap：虚拟内存；total：内存总量；used：已使用；free：剩余可用；shared：进程的共享内存；buff：缓冲区；cache：磁盘的缓存大小。

## last
用于查看所有系统的登录记录，格式为`last [参数]`。
```shell
$ last
```

## systemctl