# Prometheus
Prometheus 是一个开源的系统监控和报警系统，现在已经加入到 CNCF 基金会，成为继 k8s 之后第二个在 CNCF 托管的项目，在 Kubernetes 容器管理系统中，通常会搭配 Prometheus 进行监控，同时也支持多种 Exporter 采集数据，还支持 PushGateway 进行数据上报，Prometheus 性能足够支撑上万台规模的集群。

## Prometheus 核心组件
![Prometheus 架构](/prometheus-1.png)

### Prometheus Server
Prometheus Server 是 Prometheus 组件中的核心部分，负责实现对监控数据的获取，存储以及查询。它可以通过静态配置管理监控目标，也可以配合使用 Service Discovery 的方式动态管理监控目标，并从这些监控目标中获取数据。

Prometheus Server 本身就是一个时序数据库，将采集到的监控数据按照时间序列的方式存储在本地磁盘当中。最后 Prometheus Server 对外提供了自定义的 PromQL 语言，实现对数据的查询以及分析。

### Exporters
Exporter 将监控数据采集的端点通过 HTTP 服务的形式暴露给 Prometheus Server，Prometheus Server 通过访问该 Exporter 提供的 Endpoint 端点，即可获取到需要采集的监控数据。Exporter 分为2类：
> 直接采集：

这类 Exporter 直接内置了对 Prometheus 监控的支持，比如 cAdvisor、Kubernetes、Etcd、Gokit 等，都直接内置了用于向 Prometheus 暴露监控数据的端点。

>间接采集：

原有监控目标并不直接支持 Prometheus ，因此需要通过 Prometheus 提供的Client Library 编写该监控目标的监控采集程序。例如：Mysql Exporter、JMX Exporter、Consul Exporter 等。

### AlertManager
在 Prometheus Server 中支持基于 PromQL 创建告警规则，如果满足 PromQL 定义的规则，则会产生一条告警，而告警的后续处理流程则由 AlertManager 进行管理。在 AlertManager 中可以与邮件、Slack 等等内置的通知方式进行集成，也可以通过 Webhook 自定义告警处理方式。AlertManager 即 Prometheus 体系中的告警处理中心。

### PushGateway
由于 Prometheus 数据采集基于 Pull 模型进行设计，因此在网络环境的配置上必须要让 Prometheus Server 能够直接与 Exporter 进行通信。 当这种网络需求无法直接满足时，就可以利用 PushGateway 来进行中转。可以通过 PushGateway 将内部网络的监控数据主动 Push 到 Gateway 当中。而 Prometheus Server 则可以采用同样 Pull 的方式从 PushGateway 中获取到监控数据。

## 安装 Prometheus Server
Prometheus 基于 Golang 编写，编译后的软件包，不依赖于任何的第三方依赖。用户只需要下载对应平台的二进制包，解压并且添加基本的配置即可正常启动 Prometheus Server。

### 二进制包部署
从 <https://prometheus.io/download/> 下载最新版本的 Prometheus Sevrer 二进制包。
```shell
wget https://github.com/prometheus/prometheus/releases/download/v2.45.1/prometheus-2.45.1.linux-amd64.tar.gz
tar -zxvf prometheus-2.45.1.linux-amd64.tar.gz
mv prometheus-2.45.1.linux-amd64 /home/prometheus
```
下载并解压之后，接下来在`/usr/lib/systemd/system/`或者`/etc/systemd/system/`目录下创建一个`prometheus.service`文件，内容如下：
```shell
[Unit]
Description=Prometheus Server
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target
[Service]
User=root
Restart=on-failure
ExecStart=/home/prometheus/prometheus \
--config.file=/home/prometheus/prometheus.yml \
--storage.tsdb.path=/home/prometheus/data
[Install]
WantedBy=multi-user.target
```
完成后载入配置并启动 Prometheus 服务，验证本地9090端口，访问：`http://localhost:9090`。
```shell
systemctl daemon-reload
systemctl enable prometheus --now
netstat -plntu |grep 9090

tcp6       0      0 :::9090                 :::*                    LISTEN      25105/prometheus
```

### 容器部署
```shell
# docker-prometheus.yml
version: '3.3'
services:
   prometheus:
     container_name: prometheus
     image: prom/prometheus
     ports:
       - "9090:9090"
     volumes:
       - /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
     restart: always  
```

## 安装 Node Exporter