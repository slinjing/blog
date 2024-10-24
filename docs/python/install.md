# 安装
`Python`是跨平台的，它可以运行在`Windows`、`Mac`和各种`Linux/Unix`系统上。目前，`Python`有两个版本，分别是`2.x`版和`3.x`版，这两个版本是不兼容的。

## Windows
前往 [官网](https://www.python.org/downloads/) 下载需要的版本，下载完后，直接安装。

![](/python_install.png)

勾上 Add Python 3.6 to PATH，勾上之后就不需要自己配置环境变量，然后点 「Install Now」 即可完成安装。

> 手动配置环境变量

在命令提示框中 cmd 上输入：`path=%path%;C:\Python`，`C:\Python`是 `Python`的安装目录。

## Linux/UNIX

> 安装依赖包
```shell
$ yum install openssl-devel bzip2-devel libffi-devel -y
$ yum groupinstall "Development Tools" -y
```

> 下载 Python 压缩包
```shell
$ wget https://www.python.org/ftp/python/3.10.2/Python-3.10.2.tgz
$ tar xvf Python-3.10.2.tgz
```


