# 磁盘管理

## 命名规则
Linux 系统中一切都是文件，硬件设备也不例外，常见的硬件设备的文件名称如下：
```md
/dev/hd[a-d]  # IDE 设备 
/dev/sd[a-p]  # SCSI/SATA/U 盘 
/dev/fd[0-1]  # 软驱 
/dev/lp[0-15]  # 打印机 
/dev/cdrom  # 光驱 
/dev/mouse  # 鼠标 
/dev/st0 或/dev/ht0  # 磁带机 
```
一般的硬盘设备都会是以`/dev/sd`开头，一台主机上可以有多块硬盘，因此系统采用`a~p`来代表16块不同的硬盘。硬盘的分区编号：
>主分区或扩展分区的编号从1开始，到4结束；
<br>逻辑分区从编号5开始。

## 文件系统
用户在硬件存储设备中执行的文件建立、写入、读取、修改、转存与控制等操作都是依靠文件系统来完成的。文件系统的作用是合理规划硬盘，以保证用户正常的使用需求。Linux 系统支持数十种的文件系统，而最常见的文件系统包括：

### Ext3
是一款日志文件系统，能够在系统异常宕机时避免文件系统资料丢失，并能自动修复数据的不一致与错误。然而，当硬盘容量较大时，所需的修复时间也会很长，而且也不能百分之百地保证资料不会丢失。它会把整个磁盘的每个写入动作的细节都预先记录下来，以便在发生异常宕机后能回溯追踪到被中断的部分，然后尝试进行修复。

### Ext4
Ext3 的改进版本，作为 RHEL 6 系统中的默认文件管理系统，它支持的存储容
量高达 1EB（1EB=1,073,741,824GB），且能够有无限多的子目录。另外，Ext4 文件系统能够批量分配 block 块，从而极大地提高了读写效率。

### XFS
是一种高性能的日志文件系统，而且是 RHEL 7 中默认的文件管理系统，它的
优势在发生意外宕机后尤其明显，即可以快速地恢复可能被破坏的文件，而且强大的日志功能只用花费极低的计算和存储性能，并且它最大可支持的存储容量为 18EB。

## 磁盘分区
fdisk 命令用于管理磁盘分区，格式为`fdisk [磁盘名称]`，它提供了添加、删除、转换分区等功能。fdisk 命令中的参数以及作用：
```md
m  # 查看全部可用的参数
n  # 添加新的分区
d  # 删除某个分区信息
l  # 列出所有可用的分区类型
t  # 改变某个分区的类型
p  # 查看分区信息
w  # 保存并退出
q  # 不保存直接退出
```

### 分区
首先使用 fdisk 命令来尝试管理/dev/sdb 硬盘设备。在看到提示信息后输入参数 p 来查看硬盘设备内已有的分区信息，其中包括了硬盘的容量大小、扇区个数等信息：
```shell
$ fdisk /dev/sdb
Welcome to fdisk (util-linux 2.23.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.
Device does not contain a recognized partition table
Building a new DOS disklabel with disk identifier 0x47d24a34.
Command (m for help): p
Disk /dev/sdb: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x47d24a34
Device Boot Start End Blocks Id System
```
输入参数 n 尝试添加新的分区。系统会要求您是选择继续输入参数 p 来创建主分区，还是输入参数 e 来创建扩展分区。这里输入参数 p 来创建一个主分区：
```shell
Command (m for help): n
Partition type:
p primary (0 primary, 0 extended, 4 free)
e extended
Select (default p): p
```
在确认创建一个主分区后，系统要求您先输入主分区的编号。我们在前文得知，主分区的编号范围是 1～4，因此这里输入默认的 1 就可以了。接下来系统会提示定义起始的扇区位置，这不需要改动，我们敲击回车键保留默认设置即可，统会自动计算出最靠前的空闲扇区的位置。最后，系统会要求定义分区的结束扇区位置，这其实就是要去定义整个分区的大小是多少。我们不用去计算扇区的个数，只需要输入+2G 即可创建出一个容量为 2GB 的硬盘分区。
```shell
Partition number (1-4, default 1): 1
First sector (2048-41943039, default 2048):
Using default value 2048
Last sector, +sectors or +size{K,M,G} (2048-41943039, default 41943039): +2G
Partition 1 of type Linux and of size 2 GiB is set
```
再次使用参数 p 来查看硬盘设备中的分区信息。果然就能看到一个名称为/dev/sdb1、起始扇区位置为 2048、结束扇区位置为 4196351 的主分区了。这时候千万不要直接关闭窗口，而应该敲击参数 w 后回车，这样分区信息才是真正的写入成功。
```shell
Command (m for help): p
Disk /dev/sdb: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x47d24a34
Device Boot Start End Blocks Id System
/dev/sdb1 2048 4196351 2097152 83 Linux
Command (m for help): w
The partition table has been altered!
Calling ioctl() to re-read partition table.
Syncing disks.
```

### 格式化
完成以上操作后还，需要对硬件存储设备进行格式化，否则 Linux 系统无法得知怎么在其上写入数据。在 Linux 系统中用于格式化操作的命令是 mkfs，mkfs 命令把常用的文件系统名称用后缀的方式保存成了多个命令文件，用起来也非常简单，例如要格式分区为 XFS 的文件系统，命令为`mkfs.xfs /dev/sdb1`。
```shell
$ mkfs.xfs /dev/sdb1
meta-data=/dev/sdb1 isize=256 agcount=4, agsize=131072 blks
= sectsz=512 attr=2, projid32bit=1
= crc=0
data = bsize=4096 blocks=524288, imaxpct=25
= sunit=0 swidth=0 blks
naming =version 2 bsize=4096 ascii-ci=0 ftype=0
log =internal log bsize=4096 blocks=2560, version=2
= sectsz=512 sunit=0 blks, lazy-count=1
realtime =none extsz=4096 blocks=0, rtextents=0
```

### 挂载
完成了存储设备的分区和格式化操作，接下来就是要来挂载并使用存储设备了。首先是创建一个用于挂载设备的挂载点目录；然后使用 mount 命令将存储设备与挂载点进行关联；最后使用 df -h 命令来查看挂载状态和硬盘使用量信息。
```shell
$ mkdir /newFS
$ mount /dev/sdb1 /newFS/
$ df -h
Filesystem Size Used Avail Use% Mounted on
/dev/mapper/rhel-root 18G 3.5G 15G 20% /
devtmpfs 905M 0 905M 0% /dev
tmpfs 914M 140K 914M 1% /dev/shm
tmpfs 914M 8.8M 905M 1% /run
tmpfs 914M 0 914M 0% /sys/fs/cgroup
/dev/sr0 3.5G 3.5G 0 100% /media/cdrom
/dev/sda1 497M 119M 379M 24% /boot
/dev/sdb1 2.0G 33M 2.0G 2% /newFS
```
>mount 参数
```shell
-a  # 挂载所有在 /etc/fstab 中定义的文件系统
-t  # 指定文件系统的类型
```

按照上面的方法执行 mount 命令挂载文件系统，在重启后挂载就会失效，如果想让硬件设备和目录永久地进行自动关联，就必须把挂载信息按照`设备文件 挂载目录 格式类型 权限选项 是否备份 是否自检`的格式写入到`/etc/fstab`文件中。
```shell
$ echo "/dev/sdb1 /newFS  xfs defaults 0 0" >> /etc/fstab
```

```md
设备文件 # 一般为设备的路径+设备名称，也可以写UUID
挂载目录 # 指定要挂载到的目录，需在挂载前创建好
格式类型 # 指定文件系统的格式，比如 Ext3、Ext4、XFS、SWAP、iso9660等
权限选项 # 若设置为 defaults，则默认权限为：rw, suid, dev, exec, auto, nouser, async
是否备份 # 若为 1 则开机后使用 dump 进行磁盘备份，为 0 则不备份
是否自检 # 若为 1 则开机后自动进行磁盘自检，为 0 则不自检
```

>获取 UUID
```shell
$ blkid /dev/sdb1
/dev/sdb1: UUID="bf499f8d-bfce-4ea0-b71a-4a9328197292" TYPE="xfs"
```

>取消挂载
```shell
$ umount /newFS
```

>更改挂载权限
```shell
$ mount -o ro /dev/sdb1 /newFS   # 将挂载设备改为只读
$ mount -o rw /dev/sdb1 /newFS   # 将挂载设备改为可读写
```