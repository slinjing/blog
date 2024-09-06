# 常用命令
## date
date 命令用于显示及设置系统的时间或日期，格式为：`date [选项] [指定格式]`。
>参数：
<br>%t：跳格[Tab 键]
<br>%H：小时（00～23）
<br>%I：小时（00～12）
<br>%M：分钟（00～59）
<br>%S：秒（00～59）
<br>%j：一年中的第几天

查看系统时间:
```shell
$ date
Mon Aug 24 16:11:23 CST 2021
```
按照`年-月-日 小时:分钟:秒`的格式查看当前系统时间：
```shell
$ date "+%Y-%m-%d %H:%M:%S"
2021-08-24 16:29:12
```
设置系统的当前时间:
```shell
$ date -s "20210901 13:30:00"
Wed Sep  1 13:30:00 CST 2021
```

## wget
用于在终端中下载网络文件，格式为`wget [参数] url地址`。
> 参数：
<br>-b：后台下载模式
<br>-P：下载到指定目录
<br>-t：最大尝试次数
<br>-c：断点续传
<br>-p：下载页面内所有资源，包括图片、视频等
<br>-r：递归下载

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
> 参数：
<br>-a：显示所有进程（包括其他用户的进程）
<br>-u：用户以及其他详细信息
<br>-x：显示没有控制终端的进程

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

## uptime
用于查看系统的负载信息，格式为`uptime`。
```shell
$ uptime
 15:36:20 up  1:03,  1 user,  load average: 0.00, 0.02, 0.05
```
>它显示当前系统时间、系统已运行时间、启用终端数量以及平均负载值等信息。平均负载值指的是系统在最近1分钟、5分钟、15分钟内的压力情况；负载值越低越好，尽量不要长期超过1，在生产环境中不要超过5。

## free
用于显示当前系统中内存的使用量信息，格式为`free -h`。
```shell
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           1.8G        218M        1.4G        9.4M        134M        1.4G
Swap:          2.0G          0B        2.0G
```
> Mem：物理内存；Swap：虚拟内存；total：内存总量；used：已使用；free：剩余可用；shared：进程的共享内存；buff：缓冲区；cache：磁盘的缓存大小。

## tar
用于对文件进行打包压缩或解压，格式为`tar [选项] [文件]`。
>参数：
<br>-c：创建压缩文件
<br>-x：解开压缩文件
<br>-t：查看压缩包内有哪些文件
<br>-z：用 Gzip 压缩或解压
<br>-j：用 bzip2 压缩或解压
<br>-v：显示压缩或解压的过程
<br>-f：目标文件名
<br>-p：保留原始的权限与属性
<br>-P：使用绝对路径来压缩
<br>-C：指定解压到的目录

使用 tar 命令把/etc目录通过 gzip 格式进行打包压缩，并把文件命名为 `etc.tar.gz`：
```shell
$ tar -czvf etc.tar.gz /etc
```
将压缩包文件解压到`/root/etc`：
```shell
$ tar xzvf etc.tar.gz -C /root/etc
```

## grep 
用于在文本中执行关键词搜索，并显示匹配的结果，格式为`grep [选项] [文件]`。
>参数：
<br>-b：将可执行文件当作文本文件来搜索
<br>-c：仅显示找到的行数
<br>-i：忽略大小写
<br>-n：显示行号
<br>-v：反向选择—仅列出没有关键词的行

在`/etc/passwd`文件中查找包含`adm`的行：
```shell
$ grep adm /etc/passwd
```

## find
用于按照指定条件来查找文件，格式为`find [查找路径] 寻找条件 操作`。
>参数：
<br>-name：匹配名称
<br>-perm：匹配权限（mode 为完全匹配，-mode 为包含即可）
<br>-user：匹配所有者
<br>-group：匹配所有组
<br>-mtime -n +n：匹配修改内容的时间（-n 指 n 天以内，+n 指 n 天以前）
<br>-atime -n +n：匹配访问文件的时间（-n 指 n 天以内，+n 指 n 天以前）
<br>-ctime -n +n：匹配修改文件权限的时间（-n 指 n 天以内，+n 指 n 天以前）
<br>-nouser：匹配无所有者的文件
<br>-nogroup：匹配无所有组的文件
<br>-newer f1 !f2：匹配比文件 f1 新但比 f2 旧的文件
<br>--type b/d/c/p/l/f：匹配文件类型（后面的字母参数依次表示块设备、目录、字符设备、管道、链接文件、文本文件）
<br>-size：匹配文件的大小（+50KB 为查找超过 50KB 的文件，而-50KB 为查找小于 50KB 的文件）
<br>-prune：忽略某个目录
<br>-exec …… {}\;：后面可跟用于进一步处理搜索结果的命令<>

查找 /etc 下所有以 host 开头的文件：
```shell
$ find /etc -name "host*" -print
```

查找系统中所有属于 tom 用户的文件并复制到`/root/findtest`目录：
```shell
$ find / -user tom -exec cp -a {} /root/findtest/ \;
```