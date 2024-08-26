# Linux排错
## 启动报错entering emergency mode
### 问题描述
CentOS启动报entering emergency mode
### 解决办法
输入`journalctl`查看出错的文件系统，进入`/etc/fstab`注释出错的文件系统并重新启动。