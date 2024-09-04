# Kubeasz
Kubeasz 是一款快速部署高可用k8s集群的工具, 基于二进制方式利用ansible-playbook实现自动化部署。项目地址：https://github.com/easzlab/kubeasz

## 准备部署环境
Kubernetes 高可用集群至少为2个 master 节点，etcd 集群节点为奇数，一般复用master节点。