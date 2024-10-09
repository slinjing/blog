# Elasticsearch
Elastic Stack 是在 Elasticsearch、Logstash、Kibana 发展的过程中，又有新成员 Beats 的加入，所以就形成了Elastic Stack。

## Elasticsearch
Elasticsearch 是位于 Elastic Stack 核心的分布式搜索和分析引擎。Logstash 和 Beats 有助于收集、聚合和丰富您的数据并将其存储Elasticsearch 中。

地址：https://www.elastic.co/cn/downloads/elasticsearch

## Logstash
是一个数据收集引擎，（ELK中主要就是用来收集日志）主要是对数据的收集，解析，然后把数据发送给 ElasticSearch。支持的数据源包括本地文件、ElasticSearch、MySQL、Kafka 等。

地址：https://www.elastic.co/cn/downloads/logstash

## Kibana
为 Elasticsearch 提供可视化的页面，对数据进行分析，查看，还有各式各样的报表，仪表盘，对数据进行筛选过滤等。

地址：https://www.elastic.co/cn/downloads/kibana

## Beats
Beats 是 elastic 公司开源的一款采集系统监控数据的代理，是在被监控服务器上以客户端的形式运行的数据收集器的统称，可以直接把数据发送给 Elasticsearch 或通过 Logstash 发送到 Elasticsearch，然后进行后续数据分析。

地址：https://www.elastic.co/cn/downloads/beats

> 特点

分布式、零配置、自动发现、索引自动分片、索引副本机制、restful风格接口、多数据源、自动搜索负载等。

>安装
```shell
tar -zxvf elasticsearch-8.3.3-linux-x86_64.tar.gz
```