# MySQL排错

## MySql安装时提示GPG密钥验证失败

### 问题描述
MySql安装时提示GPG密钥验证失败报错信息如下：
```shell
Retrieving key from file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql-2022
Retrieving key from file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql

The GPG keys listed for the "MySQL 8.0 Community Server" repository are already installed but they are not correct for this package.
Check that the correct key URLs are configured for this repository.

Failing package is: mysql-community-client-8.0.36-1.el7.x86_64
GPG Keys are configured as: file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql-2022, file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
```

### 解决办法
解决这个问题可以在安装时跳过验证，或导入最新的GPGkey，GPGkey下载地址：https://repo.mysql.com

```shell
# 跳过验证，不推荐
$ yum install mysql-community-server -y --nogpgcheck 

# 导入最新的GPGkey
$ rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2023
$ yum -y  install mysql-community-server
```