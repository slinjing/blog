# etcd
`etcd`是一种高度一致的分布式键值存储（`key-value`），它提供了一种可靠的方式来存储需要由分布式系统或机器集群访问的数据。

`etcd` 官网：[https://etcd.io/](https://etcd.io/)。

`etcd` Github：[github.com/etcd-io/etcd](github.com/etcd-io/etcd)。


![](/etcd.png)



`etcd`在设计的时候重点考虑了下面四个要素：

简单：具有定义良好、面向用户的`API(gRPC)`

安全：支持`HTTPS`方式的访问

快速：支持并发`10k/s`的写操作

可靠：支持分布式结构，基于`Raft`的一致性算法



`Raft`是一套通过选举主节点来实现分布式系统一致性的算法。

使用`etcd`可以在多个节点上启动多个实例，并添加它们为一个集群。同一个集群中的`etcd`实例将会保持彼此信息的一致性。