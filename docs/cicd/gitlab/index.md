# Gitlab 
GitLab 是一个用于仓库管理系统的开源项目，使用 Git 作为代码管理工具，并在此基础上搭建起来的 Web 服务。

## 安装 Gitlab
> Gitlab 安装源
```shell
$ cat > /etc/yum.repos.d/gitlab_gitlab-ce.repo << EOF
[gitlab-ce]
name=gitlab-ce
baseurl=http://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7
Repo_gpgcheck=0
Enabled=1
Gpgkey=https://packages.gitlab.com/gpg.key
EOF

$ yum makecache
```


> 一键脚本
```shell
$ curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash
$ yum -y install gitlab-ce
```
> 手动安装
<br>下载地址：https://packages.gitlab.com/gitlab/gitlab-ce

```shell
$ wget https://packages.gitlab.com/gitlab/gitlab-ce/packages/el/7/gitlab-ce-17.1.7-ce.0.el7.x86_64.rpm
$ rpm -vih gitlab-ce-17.1.7-ce.0.el7.x86_64.rpm
$ yum -y install gitlab-ce
```

## 初始化 Gitlab
修改 Gitlab 配置文件`/etc/gitlab/gitlab.rb`，将 external_url 设置为自定义域名或 IP 地址。
```shell
## GitLab URL
##! URL on which GitLab will be reachable.
##! For more details on configuring external_url see:
##! https://docs.gitlab.com/omnibus/settings/configuration.html#configuring-the-external-url-for-gitlab
external_url 'http://11.0.1.65'
```
> 验证
```shell
$ grep "^external_url" /etc/gitlab/gitlab.rb
```

> 初始化
```shell
$ gitlab-ctl reconfigure 
```

> 启动
```shell
$ gitlab-ctl start
```

> 开机自启
```shell
$ systemctl enable gitlab-runsvdir.service
```

> 开放防火墙端口
```shell
$ firewall-cmd --zone=public --add-port=8989/tcp --permanent
$ firewall-cmd --reload
```

> 查看 Gitlab 版本
```shell
$ head -1 /opt/gitlab/version-manifest.txt
```

## 查看密码
```shell
$ cat /etc/gitlab/initial_root_password
```



## Gitlab 配置 HTTPS
> 创建私有密钥
```shell
$ mkdir -p /etc/gitlab/ssl
$ openssl genrsa -out "/etc/gitlab/ssl/gitlab.example.com.key"  2048
Generating RSA private key, 2048 bit long modulus
...............+++
...............................................................................+++
e is 65537 (0x10001)
```

> 创建私有证书
```shell
$ openssl req -new -key "/etc/gitlab/ssl/gitlab.example.com.key"  -out "/etc/gitlab/ssl/gitlab.example.com.csr"
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:cn
State or Province Name (full name) []:sh
Locality Name (eg, city) [Default City]:sh
Organization Name (eg, company) [Default Company Ltd]:  #输入空格，然后回车
Organizational Unit Name (eg, section) []:  #输入空格，然后回车
Common Name (eg, your name or your server's hostname) []:gitlab.example.com
Email Address []:admin@example.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:123456
An optional company name []:  #直接回车

$ ll /etc/gitlab/ssl/
total 8
-rw-r--r-- 1 root root 1066 Jan  2 15:32 gitlab.example.com.csr
-rw-r--r-- 1 root root 1679 Jan  2 15:30 gitlab.example.com.key
```

> 创建 CRT 签署证书
```shell
$ openssl x509 -req -days 365 -in "/etc/gitlab/ssl/gitlab.example.com.csr" -signkey "/etc/gitlab/ssl/gitlab.example.com.key" -out "/etc/gitlab/ssl/gitlab.example.com.crt"
Signature ok
subject=/C=cn/ST=sh/L=sh/O= /OU= /CN=gitlab.example.com/emailAddress=admin@example.com
Getting Private key

$ ll /etc/gitlab/ssl/
total 12
-rw-r--r-- 1 root root 1265 Jan  2 15:39 gitlab.example.com.crt
-rw-r--r-- 1 root root 1066 Jan  2 15:32 gitlab.example.com.csr
-rw-r--r-- 1 root root 1679 Jan  2 15:30 gitlab.example.com.key
```

> 创建 pem 证书
```shell
$ openssl dhparam -out /etc/gitlab/ssl/dhparam.pem 2048
Generating DH parameters, 2048 bit long safe prime, generator 2
This is going to take a long time

$ ll /etc/gitlab/ssl/
$ chmod 600 /etc/gitlab/ssl/*
```

> 更改如下
```shell
[root@cicd-gitlab ~]# cp /etc/gitlab/gitlab.rb{,.bak}
[root@cicd-gitlab ~]# vim /etc/gitlab/gitlab.rb
## 更改如下
 13 external_url 'https://gitlab.example.com'  13行左右
952 nginx['redirect_http_to_https'] = true
964 nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.example.com.crt"
965 nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.example.com.key"
979 # nginx['ssl_dhparam'] = "/etc/gitlab/ssl/dhparam.pem" # Path to dhparams.pem,      eg. /etc/gitlab/ssl/dhparams.pem
```