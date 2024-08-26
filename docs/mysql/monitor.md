# MySQL监控
## 创建监控用户
```sql
mysql> CREATE USER 'mysqld_exporter'@'localhost' IDENTIFIED BY 'Mysqld_exporter@123' WITH MAX_USER_CONNECTIONS 3;
mysql> GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'mysqld_exporter'@'localhost';
mysql> FLUSH PRIVILEGES;
mysql> \q
```



## 安装mysqld_exporter
官网：https://prometheus.io/download/

github：https://github.com/prometheus/mysqld_exporter
```shell
$ wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.1/mysqld_exporter-0.15.1.linux-amd64.tar.gz
$ tar -zxvf mysqld_exporter-0.15.1.linux-amd64.tar.gz
$ mv mysqld_exporter-0.15.1.linux-amd64 /home/mysqld_exporter
```
创建mysqld_exporter配置文件，路径`/home/mysqld_exporter/my.cnf`
```shell
[client]
user=mysqld_exporter 
password=Mysqld_exporter@123 
```
创建mysqld_exporter.service文件，路径`/usr/lib/systemd/system/mysqld_exporter.service`
```shell
[Unit]
Description=mysql Monitoring SystemDocumentation=mysql Monitoring System
[Service]
ExecStart=/home/mysqld_exporter/mysqld_exporter \
--collect.info_schema.processlist \
--collect.info_schema.innodb_tablespaces \
--collect.info_schema.innodb_metrics \
--collect.perf_schema.tableiowaits \
--collect.perf_schema.indexiowaits \
--collect.perf_schema.tablelocks \
--collect.engine_innodb_status \
--collect.perf_schema.file_events \
--collect.binlog_size \
--collect.info_schema.clientstats \
--collect.perf_schema.eventswaits \
--config.my-cnf=/home/mysqld_exporter/my.cnf
[Install]
WantedBy=multi-user.target
```
## 启动
```shell
$ systemctl daemon-reload
$ systemctl enable mysqld_exporter --now
```
## Prometheus配置
在Prometheus中增加以下配置：
```yaml
- job_name: mysql 
  params:
    auth_module: [client.servers]
  static_configs:
    - targets:
      - 192.168.10.100:9104
```
## Granafa面板
地址：https://grafana.com/grafana/dashboards/



