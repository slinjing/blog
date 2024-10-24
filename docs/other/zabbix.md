# Zabbix
官网：https://www.zabbix.com/community

## 安装
```shell
$ rpm -Uvh https://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm
$ yum clean all
$ yum -y install zabbix-server-mysql zabbix-agent
$ yum -y install centos-release-scl
```