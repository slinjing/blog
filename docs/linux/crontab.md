# Crontab
适合用于重复性任务，通过 crontab 命令，可以在固定的间隔时间执行指定的命令。

> [!TIP] 表达式在线工具：
> https://www.jyshare.com/front-end/9444/



## 格式

```shell
# .---------------- 分 (0 - 59)
# |  .------------- 时 (0 - 23)
# |  |  .---------- 日 (1 - 31)
# |  |  |  .------- 月 (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- 周 (0 - 6) (周天=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed
```
![img](/linux/crontab.jpeg)

## 命令
```shell
# 查看当前用户的 crontab 文件
crontab -l
# 删除当前用户的 crontab 文件
crontab -r
# 编辑当前用户的 crontab 文件
crontab -e
# 列出某个用户的 crontab 文件
crontab -u username -l
# 编辑某个用户的 crontab 文件
crontab -u username -e
```

## 创建 Crontab
- `crontab -e`添加任务
- 编辑`/etc/crontab`文件添加任务

可以用`-`来表示一段连续的时间周期，`/`表示执行任务的间隔时间。
>示例：
```shell
# 每分钟执行一次
* * * * * /bin/ls
# 周1到周5每天下午5点执行
0 17 * * 1-5 /usr/bin/rm -rf /tmp/*
# 每3小时执行一次
0 */3 * * * /etc/init.d/smb restart
# 每月1号和28号执行一次
0 0 1,28 * * fsck /home
```

## 特殊字符串
```shell
@reboot	   # 运行一次，在系统启动时 (非标准)
@yearly	   # 每年运行一次，“0 0 1 1 *” (非标准)
@annually	   # (与@yearly 相同)(非标准)
@monthly	   # 每月运行一次，“0 0 1 * *” (非标准)
@weekly	   # 每周运行一次，“0 0 * * 0” (非标准)
@daily	   # 每天运行一次，“0 0 * * *” (非标准)
@midnight	   # (与@daily 相同)(非标准)
@hourly	   # 每小时运行一次，“0 * * * *” (非标准)
```