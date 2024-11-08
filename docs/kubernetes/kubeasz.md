# Kubeasz
Kubeasz 是一款快速部署高可用k8s集群的工具, 基于二进制方式利用ansible-playbook实现自动化部署。

> [!TIP] kubeasz 项目地址：   
> https://github.com/easzlab/kubeasz

## 准备部署环境
Kubernetes 高可用集群至少为2个 master 节点，etcd 集群节点为奇数，一般复用 master 节点。

- 下载 ezdown 
```shell
$ wget https://github.com/easzlab/kubeasz/releases/download/3.5.0/ezdown
$ chmod +x ./ezdown
```

- 下载 kubeasz 代码、二进制、默认容器镜像
```shell
# 国内环境
$ ./ezdown -D
# 海外环境
# ./ezdown -D -m standard
```

## 创建集群
```shell
$ ezctl new k8s-1
```

## 配置集群信息
修改`/etc/kubeasz/clusters/k8s-01/hosts`，主要配置 etcd、kube_master、kube_node 字段。
```shell
[etcd]
192.168.238.12
192.168.238.13
192.168.238.14

[kube_master]
192.168.238.12
192.168.238.13
192.168.238.14

[kube_node]
192.168.238.15
```

## 一键安装
```shell
$ ezctl setup k8s-01 all
```