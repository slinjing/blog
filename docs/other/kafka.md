### 系统环境
| 主机名 | IP | 角色 | 软件 |
| --- | --- | --- | --- |
| kafka-1 | 192.168.183.155 | kafka | jdk8/kafka3.7.0/zookeeper3.8.4/kafka-eagle3.0.1 |
| kafka-2 | 192.168.183.156 | kafka | jdk8/kafka3.7.0/zookeeper3.8.4 |
| kafka-2 | 192.168.183.137 | kafka | jdk8/kafka3.7.0/zookeeper3.8.4 |

### 准备
```shell
# 关闭SELINUX
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0
# 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld
```
### 安装Java环境
> 下载地址：[https://www.oracle.com/java/technologies/javase/javase8u211-later-archive-downloads.html](https://www.oracle.com/java/technologies/javase/javase8u211-later-archive-downloads.html)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713346964087-3ca50066-0ffb-49da-8fee-8d5fb7621b93.png#averageHue=%23ecebe9&clientId=u56ad42dd-995b-4&from=paste&height=953&id=u0193d50f&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=184269&status=done&style=none&taskId=u146466a2-eb11-4793-ab96-9c2d56df7d3&title=&width=1920)
所有节点执行，将下载的安装包上传至服务器
```shell
tar -zxvf jdk-8u381-linux-x64.tar.gz
mv jdk1.8.0_381 /usr/local/java
vim /etc/profile
------------------------------------
export JAVA_HOME=/usr/local/java
export CLASSPATH=.:$JAVA_HOME/jre/lib:$JAVA_HOME/lib:$JAVA_HOME/lib/tools.jar
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
------------------------------------
source /etc/profile
java -version
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713410112257-ff2a8081-5e54-4bd8-8551-529b097e2baf.png#averageHue=%232e2b29&clientId=u02514dd3-f5c1-4&from=paste&height=116&id=u126a6684&originHeight=111&originWidth=716&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17200&status=done&style=none&taskId=u67efe4d4-ebf7-4f94-9850-b141b9fe98d&title=&width=748)
### 安装zookeeper
> 下载地址：[https://zookeeper.apache.org/releases.html#download](https://zookeeper.apache.org/releases.html#download)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713409964916-197f668d-f5ba-43e9-b8e4-d7634fae4573.png#averageHue=%23fefdfd&clientId=u02514dd3-f5c1-4&from=paste&height=953&id=u1f888801&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=140418&status=done&style=none&taskId=u23f45126-457a-4551-bae1-9028f1edccf&title=&width=1920)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713409985042-2bb4b9e2-102f-4fa4-811f-c61b0c877d6f.png#averageHue=%23fdfcfc&clientId=u02514dd3-f5c1-4&from=paste&height=953&id=ud5f6f1b0&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=162476&status=done&style=none&taskId=u2ab65046-44fc-4537-87d1-ca387e28448&title=&width=1920)
所有节点执行，将下载的安装包上传到服务器
```shell
tar -zxvf apache-zookeeper-3.8.4-bin.tar.gz
mv apache-zookeeper-3.8.4-bin /usr/local/zookeeper
mkdir -p /usr/local/zookeeper/data
cd /usr/local/zookeeper
cp conf/zoo_sample.cfg conf/zoo.cfg
vim conf/zoo.cfg
---
# 心跳时间
tickTime=2000
# follow连接leader的初始化连接时间，表示tickTime的倍数
initLimit=10
# syncLimit配置表示leader与follower之间发送消息，请求和应答时间长度。如果followe在设置的时间内不能与leader进行通信，那么此follower将被丢弃，tickTime的倍数
syncLimit=5
# 客户端连接端口
clientPort=2181
# 节点数据存储目录，需要提前创建，注意myid添加，用于标识服务器节点
dataDir=/usr/local/zookeeper/data
dataLogDir=/usr/local/zookeeper/log
server.1=192.168.183.155:2888:3888
server.2=192.168.183.156:2888:3888
server.3=192.168.183.137:2888:3888

---
# 修改每个节点zookeeper.properties文件一致 192.168.183.155的myid为1，以此类推
echo 1 > /usr/local/zookeeper/data/myid
```
启动zookeeper
```shell
./bin/zkServer.sh start
```
验证zookeeper
```shell
./bin/zkServer.sh ststus
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713425580289-bb2a6d12-68e1-40f5-8cff-587555cf8273.png#averageHue=%232e2b28&clientId=u02514dd3-f5c1-4&from=paste&height=112&id=u186c4a33&originHeight=112&originWidth=799&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16859&status=done&style=none&taskId=ue73e58fa-855b-4e6f-a5d0-840e1bd77c8&title=&width=799)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713425595506-4c9d8639-cd42-43e4-8b62-283bca262ba8.png#averageHue=%232f2c29&clientId=u02514dd3-f5c1-4&from=paste&height=109&id=u22ef3005&originHeight=109&originWidth=789&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16926&status=done&style=none&taskId=uadc72918-aa46-4e53-8edc-715d9a71881&title=&width=789)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713425610600-bf1c2d71-8869-4780-b5b9-95a46c0842bb.png#averageHue=%232d2a28&clientId=u02514dd3-f5c1-4&from=paste&height=109&id=u6a922142&originHeight=109&originWidth=787&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16387&status=done&style=none&taskId=u8a481395-d96d-4312-8b48-2b6f2e874e1&title=&width=787)
### 安装kafka
> 下载地址：[https://kafka.apache.org/downloads](https://kafka.apache.org/downloads)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713427855369-0602b7f5-c734-4e12-88c2-707018933cdd.png#averageHue=%23fdfcfc&clientId=u02514dd3-f5c1-4&from=paste&height=953&id=u1dad759b&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=152890&status=done&style=none&taskId=u0e43e352-5a38-4e20-a09c-453e1f73712&title=&width=1920)
所有节点执行，将下载的安装包上传至服务器
```shell
tar -zxvf kafka_2.12-3.7.0.tgz
mv kafka_2.12-3.7.0 /usr/local/kafka
cd /usr/local/kafka
cp  config/server.properties  config/server.properties.back

# 配置server.propertie
vim config/server.properties
# 修改时去掉注释
------------------------------------
broker.id=155  # 修改 broker.id  id保持不一致
listeners = PLAINTEXT://192.168.183.155:9092  ##侦听端口 为各节点本机ip
advertised.listeners=PLAINTEXT://192.168.183.155:9092  ##节点侦听端口 为各节点本机ip
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
log.dirs=/usr/local/kafka/kafka-logs     ## 日志目录
num.partitions=1
num.recovery.threads.per.data.dir=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connect=192.168.183.155:2181,192.168.183.156:2181,192.168.183.137:2181 ### zookeeper 地址
zookeeper.connection.timeout.ms=6000
group.initial.rebalance.delay.ms=0
delete.topic.enable=true    ### 删除属性
-----------------------------------

# 配置zookeeper.properties
cp  config/zookeeper.properties  config/zookeeper.properties.back
vim config/zookeeper.properties
-----------------------------------
# Zookeeper的数据存储路径与Zookeeper集群配置保持一致
dataDir=/usr/local/zookeeer/data
-----------------------------------

# 配置consumer.properties
cp config/consumer.properties config/consumer.properties.back
vim config/consumer.properties
-----------------------------------
bootstrap.servers=192.168.183.155:9092,192.168.183.156:9092,192.168.183.137:9092
#配置Zookeeper地址
zookeeper.connect=192.168.183.155:2181,192.168.183.156:2181,192.168.183.137:2181
# consumer group id
group.id=test-consumer-group
-----------------------------------

# 配置producer.properties
cp config/producer.properties  config/producer.properties.back
vim config/producer.properties
-----------------------------------
bootstrap.servers=192.168.183.155:9092,192.168.183.156:9092,192.168.183.137:9092
# 配置Zookeeper地址
zookeeper.connect=192.168.183.155:2181,192.168.183.156:2181,192.168.183.137:2181
# specify the compression codec for all data generated: none, gzip, snappy, lz4, zstd
compression.type=none
-----------------------------------

# 配置kafka-run-class.sh
cp bin/kafka-run-class.sh bin/kafka-run-class.sh.back
vim bin/kafka-run-class.sh
-----------------------------------
# 行首新增JAVA_HOME配置
export JAVA_HOME=/usr/local/java
```
启动
```shell
cd /usr/local/kafka/
# 启动（每个节点）
bin/kafka-server-start.sh config/server.properties >/dev/null 2>&1 &
bin/kafka-server-start.sh -daemon config/server.properties
# 停止（每个节点）
bin/kafka-server-stop.sh config/server.properties
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713430369041-31a26afb-b7a7-4889-a50b-0db38bf4e031.png#averageHue=%23222120&clientId=u02514dd3-f5c1-4&from=paste&height=87&id=u1258486f&originHeight=87&originWidth=785&originalType=binary&ratio=1&rotation=0&showTitle=false&size=7401&status=done&style=none&taskId=u8a6af8a7-c2a6-487b-95be-5113c4d0271&title=&width=785)
测试，在集群内任意节点执行都可以
```shell
export IP=192.168.183.155:9092,192.168.183.156:9092,192.168.183.137:9092
# 创建topic
bin/kafka-topics.sh --create --bootstrap-server $IP --replication-factor 1 --partitions 1 --topic test
# 查看topic
bin/kafka-topics.sh --describe --bootstrap-server $IP --topic test
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713431029293-6d8ec30a-5c7e-42d8-bdc8-a40eb1fc5ac7.png#averageHue=%232e2c29&clientId=u02514dd3-f5c1-4&from=paste&height=63&id=ud9dd69a1&originHeight=63&originWidth=1444&originalType=binary&ratio=1&rotation=0&showTitle=false&size=18066&status=done&style=none&taskId=uf64e6a3d-bfb4-478c-8f22-7ed07f580c1&title=&width=1444)
生产者生成数据
```shell
bin/kafka-console-producer.sh --broker-list $IP --topic test
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713431244539-7068666c-ce9d-4a95-9d77-12ca62711458.png#averageHue=%23201f1e&clientId=u02514dd3-f5c1-4&from=paste&height=113&id=u048617dd&originHeight=113&originWidth=930&originalType=binary&ratio=1&rotation=0&showTitle=false&size=8876&status=done&style=none&taskId=u517223c8-408f-4fcb-8597-1c25ca7c2e0&title=&width=930)
消费者消费数据
```shell
bin/kafka-console-consumer.sh --bootstrap-server $IP --topic test --from-beginning
# --from-beginning 从头开始消费，不加该参数则从最新的消息开始消费，之前的丢弃
# --bootstrap-server 将在kafka集群上创建一个名称为“__consumer_offsets”的topic，50个分区，1个副本，用于存放消费者偏移量
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713431260304-7b54da0d-9add-409a-8194-26070d1581af.png#averageHue=%231e1e1d&clientId=u02514dd3-f5c1-4&from=paste&height=114&id=u9113f28d&originHeight=114&originWidth=1155&originalType=binary&ratio=1&rotation=0&showTitle=false&size=9903&status=done&style=none&taskId=ubd6a0dd2-4445-4f02-9f0d-5187c01a496&title=&width=1155)
删除topic
```shell
bin/kafka-topics.sh --delete --bootstrap-server $IP --topic test
```
### 安装kafka Eagle
安装mysql5.7
```shell
wget  https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
yum -y install mysql80-community-release-el7-7.noarch.rpm
yum-config-manager --disable mysql80-community
yum-config-manager --enable mysql57-community
yum clean all && yum makecache
yum -y  install mysql-community-server
systemctl start mysqld
grep 'temporary password' /var/log/mysqld.log
MySQL > ALTER USER 'root'@'localhost' IDENTIFIED BY 'YIERSAN123pp@';
MySQL > GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'YIERSAN123pp@' WITH GRANT OPTION;   #5.7
MySQL > FLUSH PRIVILEGES;
MySQL > create database ke;
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713495688032-6fcdc392-412e-4046-be1f-1652b38b7b63.png#averageHue=%23232120&clientId=uc1e7800f-d056-4&from=paste&height=332&id=ufb549949&originHeight=332&originWidth=921&originalType=binary&ratio=1&rotation=0&showTitle=false&size=34635&status=done&style=none&taskId=u8a0623cf-ce2a-42ec-82bd-a6ef058ffce&title=&width=921)
安装kafka Eagle
> 下载地址：[https://www.kafka-eagle.org/](https://www.kafka-eagle.org/)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713431738823-3f09552d-b60a-40bd-957c-3b266714c820.png#averageHue=%23010101&clientId=u02514dd3-f5c1-4&from=paste&height=953&id=ucd42a68d&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=185752&status=done&style=none&taskId=u2c7d0b36-421d-45dc-b91d-b96f0077a91&title=&width=1920)
```shell
tar -zxvf kafka-eagle-bin-3.0.1.tar.gz
cd kafka-eagle-bin-3.0.1
tar -zxvf efak-web-3.0.1-bin.tar.gz
mv efak-web-3.0.1 /usr/local/kafka-eagle
cd /usr/local/kafka-eagle

# 配置环境变量 
vim/etc/profile
-----------------------------------
export KE_HOME=/usr/local/kafka-eagle
export PATH=$KE_HOME/bin:$PATH
-----------------------------------
source /etc/profile

vim conf/system-config.properties
-----------------------------------
# 配置Zookeeper地址
# 注释cluster2
kafka.eagle.zk.cluster.alias=cluster1
cluster1.zk.list=192.168.183.155:2181,192.168.183.156:2181,192.168.183.137:2181


# 配置MySQL
# kafka mysql jdbc driver address
######################################
efak.driver=com.mysql.cj.jdbc.Driver
efak.url=jdbc:mysql://192.168.183.155:3306/ke?useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull
efak.username=root
efak.password=YIERSAN123pp@
```
配置文件详解
```shell
# 此处设置zookeeper集群的客户端连接地址
efak.zk.cluster.alias=cluster1,cluster2
cluster1.zk.list=tdn1:2181,tdn2:2181,tdn3:2181
cluster2.zk.list=xdn1:2181,xdn2:2181,xdn3:2181
# 添加zookeeper acl
cluster1.zk.acl.enable=false
cluster1.zk.acl.schema=digest
cluster1.zk.acl.username=test
cluster1.zk.acl.password=test123
# Kafka broker nodes online list
cluster1.efak.broker.size=10
cluster2.efak.broker.size=20
# Zookeeper 集群允许连接到的客户端数量
# 如果启用分布式模式，则可以将值设置为4或8
kafka.zk.limit.size=8
# EFAK webui端口访问地址
efak.webui.port=8048
######################################
# EFAK 启用分布式
######################################
efak.distributed.enable=false
# master工作节点将状态设置为master，其他节点将状态设为slave
efak.cluster.mode.status=slave
# efak服务器地址
efak.worknode.master.host=localhost
efak.worknode.port=8085
# Kafka offset storage -- 存储在Kafka集群中，如果存储在zookeeper中，则不能使用此选项
cluster1.efak.offset.storage=kafka
cluster2.efak.offset.storage=kafka
# 是否启用Kafka性能监控图
efak.metrics.charts=false
# EFAK数据保存时间，默认30天
efak.metrics.retain=30
# 如果偏移量超出范围，请启用此属性--仅适用于kafka-sql
efak.sql.fix.error=false
efak.sql.topic.records.max=5000
# Delete kafka topic token -- 设置为删除主题令牌，以便管理员有权删除
efak.topic.token=keadmin
# Kafka sasl authenticate
cluster1.efak.sasl.enable=false
cluster1.efak.sasl.protocol=SASL_PLAINTEXT
cluster1.efak.sasl.mechanism=SCRAM-SHA-256
cluster1.efak.sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="admin" password="admin-secret";
# 如果未设置，则该值可以为空
cluster1.efak.sasl.client.id=
# 添加kafka集群cgroups
cluster1.efak.sasl.cgroup.enable=false
cluster1.efak.sasl.cgroup.topics=kafka_ads01,kafka_ads02
cluster2.efak.sasl.enable=true
cluster2.efak.sasl.protocol=SASL_PLAINTEXT
cluster2.efak.sasl.mechanism=PLAIN
cluster2.efak.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="admin" password="admin-secret";
cluster2.efak.sasl.client.id=
cluster2.efak.sasl.cgroup.enable=false
cluster2.efak.sasl.cgroup.topics=kafka_ads03,kafka_ads04
# 使用sqlite存储数据，与MySQL二选一
efak.driver=org.sqlite.JDBC
# '/hadoop/kafka-eagle/db' 路径必须存在
efak.url=jdbc:sqlite:/hadoop/kafka-eagle/db/ke.db
efak.username=root
efak.password=smartloli
# 设置MySQL地址
#efak.driver=com.mysql.jdbc.Driver
#efak.url=jdbc:mysql://127.0.0.1:3306/ke?useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull
#efak.username=root
#efak.password=smartloli
```
### 开启Kafka JMX监控
```shell
vim /usr/local/kafka/bin/kafka-server-start.sh
# 开启Kafka JMX监控
# 修改Kafka各节点JMX启动配置，开启监控功能
if [ "x$KAFKA_HEAP_OPTS" = "x" ]; then
    export KAFKA_HEAP_OPTS="-server -Xmx1G -Xms1G -XX:PermSize=128m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:ParallelGCThreads=8 -XX:ConcGCThreads=5 -XX:InitiatingHeapOccupancyPercent=70 "
    export JMX_PORT="9999"
fi
```
### 启动kafka Eagle
```shell
# 重启kafka
cd /usr/local/kafka-eagle/bin
./ke.sh start
```
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713492036464-44e575a4-ce4a-42bb-b640-6b6def98be35.png#averageHue=%23222020&clientId=uc1e7800f-d056-4&from=paste&height=916&id=ub01bb0bf&originHeight=916&originWidth=1867&originalType=binary&ratio=1&rotation=0&showTitle=false&size=142314&status=done&style=none&taskId=u482fb63c-a3fa-4cbc-b099-6e44d466ead&title=&width=1867)
![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713496161995-acc60a45-3fa2-4f08-8ebb-370ed916f4a0.png#averageHue=%23222222&clientId=uc1e7800f-d056-4&from=paste&height=953&id=u1c9c3a98&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=67474&status=done&style=none&taskId=u965d1edc-0ad0-49bf-914c-e79d761062b&title=&width=1920)![image.png](https://cdn.nlark.com/yuque/0/2024/png/36072167/1713496324039-35213adf-1dcf-414b-9205-49fb3cc0abf6.png#averageHue=%23212b40&clientId=uc1e7800f-d056-4&from=paste&height=953&id=u156a4272&originHeight=953&originWidth=1920&originalType=binary&ratio=1&rotation=0&showTitle=false&size=150534&status=done&style=none&taskId=u199d85a6-eee6-4f00-9c8a-086c89483d9&title=&width=1920)
