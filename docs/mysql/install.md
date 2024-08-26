# MySQL安装

## 下载安装rpm源
```shell
$ wget  https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
$ yum -y install  mysql80-community-release-el7-7.noarch.rpm
```
## 安装最新版本
```shell
$ yum clean all && yum makecache
$ yum -y  install mysql-community-server
```
## 安装其他版本
```shell
$ yum-config-manager --disable mysql80-community
$ yum-config-manager --enable mysql57-community
$ yum -y  install mysql-community-server
```
## 启动
```shell
$ systemctl start mysqld
$ systemctl enable mysqld
```
## 查看密码
```shell
$ grep 'temporary password' /var/log/mysqld.log
```
## 修改密码
```shell
$ mysql -uroot -ppassword
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
```
## 登录授权
```sql
# 8.0使用
mysql> UPDATE user SET host='%' WHERE user = 'root';   
# 5.7使用
mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'YIERSAN123pp@' WITH GRANT OPTION;   
mysql> FLUSH PRIVILEGES;
```



