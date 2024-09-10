# psutil
psutil 是一个跨平台库，能够轻松实现获取系统运行的进程和系统利用率（包括CPU、内存、磁盘、网络等）信息。它主要应用于系统监控，分析和限制系统资源及进程的管理。
>支持系统：Linux、Windows、macOS、FreeBSD、OpenBSD、NetBSD、Sun Solaris、AIX

地址：https://github.com/giampaolo/psutil

>Linux, Windows, macOS安装：
```shell
pip install psutil
```

## 系统性能信息
>CPU 信息
```python
import psutil

# 获取CPU完整信息
psutil.cpu_times()

# 获取单项数据信息，如用户user的CPU时间比
psutil.cpu_times().user

# 获取CPU的逻辑个数，默认logical=True4
psutil.cpu_count()

# 获取CPU的物理个数
>>>psutil.cpu_count(logical=False)
```

>内存信息
```python
# 获取内存完整信息
psutil.virtual_memory()

# 获取swap分区大小
psutil.swap_memory()

# 获取内存总数
psutil.virtual_memory().total

# 获取空闲内存数
psutil.virtual_memory().free
```

>磁盘信息
```python
# 获取磁盘完整信息
psutil.disk_partitions()

# 获取分区（参数）的使用情况
psutil.disk_usage('/')

# 获取硬盘总IO数
psutil.disk_io_counters()
```

>网络信息
```python
# 获取网络总的IO信息，默认pernic=False
psutil.net_io_counters()

# pernic=True输出每个网络接口的IO信息
psutil.net_io_counters(pernic=True)

# 获取网卡信息
psutil.net_if_addrs()

# 获取网卡状态
psutil.net_if_stats()
```

## 进程管理方法

### 进程信息
```python
import psutil
# 列出所有进程PID
psutil.pids()

# 实例化一个Process对象，参数为一进程PID
p = psutil.Process(2424)

# 进程名
p.name() 
# 进程bin路径
p.exe()
# 进程工作目录绝对路径
p.cwd() 
# 进程状态
p.status()
# 进程创建时间，时间戳格式
p.create_time()
# 进程uid信息
p.uids()
# 进程gid信息
p.gids()
# 进程CPU时间信息，包括user、system两个CPU时间
p.cpu_times()
# get进程CPU亲和度，如要设置进程CPU亲和度，将CPU号作为参数即可
p.cpu_affinity()
# 进程内存利用率
p.memory_percent()
# 进程内存rss、vms信息
p.memory_info()
# 进程IO信息，包括读写IO数及字节数
p.io_counters()
# 返回打开进程socket的namedutples列表，包括fs、family、laddr等信息
p.connections()
# 进程开启的线程数
p.num_threads()
```

### popen类的使用
psutil 提供的 popen 类的作用是获取用户启动的应用程序进程信息，以便跟踪程序进程的运行状态。
```python
import psutil
from subprocess import PIPE
# 通过psutil的Popen方法启动的应用程序，可以跟踪该程序运行的所有相关信息
p = psutil.Popen(["/usr/bin/python", "-c", "print（'hello'）"], stdout=PIPE)

p.name（）

p.username（）

p.communicate（）

# 得到进程运行的CPU时间
p.cpu_times（） #得到进程运行的CPU时间，更多方法见上一小节
```