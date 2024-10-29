# Ubuntu 安装 LibreNMS
> [!TIP] 系统支持：
> Ubuntu 24.04、Ubuntu 22.04、Ubuntu 20.04、CentOS 8、Debian 12

本文使用 **Ubuntu 22.04**，更多系统安装 LibreNMS 参考 [官方文档](https://docs.librenms.org/Installation/Install-LibreNMS/#__tabbed_1_3)。

## 安装 **PHP** 和所需模块
```shell
$ sudo apt install software-properties-common
$ LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php
$ sudo apt update
$ apt install -y acl curl fping git graphviz imagemagick mariadb-client mariadb-server mtr-tiny nginx-full nmap php-cli php-curl php-fpm php-gd php-gmp php-json php-mbstring php-mysql php-snmp php-xml php-zip rrdtool snmp snmpd unzip python3-pymysql python3-dotenv python3-redis python3-setuptools python3-psutil python3-systemd python3-pip whois traceroute
```
安装完成后，使用`php -v`命令确保 **PHP** 版本大于 8.2。

## 添加 **librenms** 用户
```shell
$ sudo useradd librenms -d /opt/librenms -M -r -s "$(which bash)"
```

## 下载 **LibreNMS**
```shell
$ cd /opt
$ git clone https://github.com/librenms/librenms.git
```

## 设置权限
```shell
$ sudo chown -R librenms:librenms /opt/librenms
$ sudo chmod 771 /opt/librenms
$ sudo setfacl -d -m g::rwx /opt/librenms/rrd /opt/librenms/logs /opt/librenms/bootstrap/cache/ /opt/librenms/storage/
$ sudo setfacl -R -m g::rwx /opt/librenms/rrd /opt/librenms/logs /opt/librenms/bootstrap/cache/ /opt/librenms/storage/
```

## 安装 **PHP** 依赖项
```shell
$ su - librenms
$ ./scripts/composer_wrapper.php install --no-dev
$ exit
```
> 若安装失败，使用以下命令手动安装 PHP 依赖项：
```shell
$ wget https://getcomposer.org/composer-stable.phar
$ sudo mv composer-stable.phar /usr/bin/composer
$ sudo chmod +x /usr/bin/composer
```

## 设置时区
```shell
$ sudo vim /etc/php/8.3/fpm/php.ini
$ sudo vim /etc/php/8.3/cli/php.ini
```
将上面两个 **php.ini** 文件中的`; date.timezone =`修改为：`
date.timezone = Asia/Shanghai`。
系统时区设置使用以下命令：
```shell
$ sudo timedatectl set-timezone Asia/Shanghai
```

## 配置 **MariaDB**
```shell
$ sudo vim /etc/mysql/mariadb.conf.d/50-server.cnf
```
在配置文件`[mysqld]`部分加入以下内容：
```md
innodb_file_per_table=1
lower_case_table_names=0
```
然后重新启动 **MariaDB**
```shell
$ sudo systemctl enable mariadb
$ sudo systemctl restart mariadb
```

连接 MariaDB 客户端，为 LibreNMS 创建一个数据库。
```shell
$ sudo mysql -u root
```
> [!TIP] 注意：
> 将下面的 password 更改为自己的密码。
```sql
CREATE DATABASE librenms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'librenms'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON librenms.* TO 'librenms'@'localhost';
exit
```

## 配置 **PHP-FPM**
```shell
$ sudo cp /etc/php/8.3/fpm/pool.d/www.conf /etc/php/8.3/fpm/pool.d/librenms.conf
$ sudo vim /etc/php/8.3/fpm/pool.d/librenms.conf
```
将配置文件中的`[www]`修改为：`[librenms]`，**user**、**group** 和 **listen** 字段修改为如下：
```md
user = librenms
group = librenms
listen = /run/php-fpm-librenms.sock
```

## 配置 **Web** 服务器
```shell
$ sudo vim /etc/nginx/conf.d/librenms.conf
```
添加以下配置：
```shell
server {
 listen      80;
 server_name 127.0.0.1;
 root        /opt/librenms/html;
 index       index.php;

 charset utf-8;
 gzip on;
 gzip_types text/css application/javascript text/javascript application/x-javascript image/svg+xml text/plain text/xsd text/xsl text/xml image/x-icon;
 location / {
  try_files $uri $uri/ /index.php?$query_string;
 }
 location ~ [^/]\.php(/|$) {
  fastcgi_pass unix:/run/php-fpm-librenms.sock;
  fastcgi_split_path_info ^(.+\.php)(/.+)$;
  include fastcgi.conf;
 }
 location ~ /\.(?!well-known).* {
  deny all;
 }
}
```
完成后重启 ngingx 和 php-fpm：
```shell
$ sudo rm /etc/nginx/sites-enabled/default
$ sudo systemctl restart nginx
$ sudo systemctl restart php8.3-fpm
```

## 启用 lnms 
```shell
$ sudo ln -s /opt/librenms/lnms /usr/bin/lnms
$ sudo cp /opt/librenms/misc/lnms-completion.bash /etc/bash_completion.d/
```

## 配置 snmpd
```shell
$ sudo cp /opt/librenms/snmpd.conf.example /etc/snmp/snmpd.conf
$ sudo vim /etc/snmp/snmpd.conf
```
将`snmpd.conf`中的`RANDOMSTRINGGOESHERE`字段，修改为自己的 SNMP Community。

下一个下载发行版：
```shell
$ sudo curl -o /usr/bin/distro https://raw.githubusercontent.com/librenms/librenms-agent/master/snmp/distro
$ sudo chmod +x /usr/bin/distro
$ sudo systemctl enable snmpd
$ sudo systemctl restart snmpd
```

## 配置 **Cron**
```shell
$ sudo cp /opt/librenms/dist/librenms.cron /etc/cron.d/librenms
```
启用计划程序
```shell
$ sudo cp /opt/librenms/dist/librenms-scheduler.service /opt/librenms/dist/librenms-scheduler.timer /etc/systemd/system/
$ sudo systemctl enable librenms-scheduler.timer
$ sudo systemctl start librenms-scheduler.timer
```

## 配置 **logrotate**

为确保 **LibreNMS** 日志不会变得很大，启用配置文件：`/opt/librenms/logs`
```shell
$ sudo cp /opt/librenms/misc/librenms.logrotate /etc/logrotate.d/librenms
```

## 在 Web UI 上配置 LibreNMS  
浏览器访问`http://localhost:80`打开 web 界面，按照提示进行配置，安装完成。