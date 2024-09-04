# Kubernetes
Kubernetes 是一个开源的容器编排引擎，用来对容器化应用进行自动化部署、扩缩和管理。该项目托管在 CNCF。Kubernetes 的目标是让部署容器化的应用简单并且高效，它提供了应用部署，规划，更新，维护的一种机制。

官网：https://kubernetes.io

## Kubernetes 架构
Kubernetes 集群由一个控制平面和若干运行（Pod）的工作节点组成，这些工作节点称为（Node）。 每个集群至少需要一个工作节点来运行 Pod。

控制平面管理集群中的 Node 和 Pod。工作节点托管着组成应用负载的 Pod。 在生产环境中，控制平面通常跨多台计算机运行，而一个集群通常运行多个节点，以提供容错和高可用。
![Kubernetes 架构](/k8s-1.png)

## 控制平面组件
控制平面组件负责管理整个集群的状态，比如资源调度、状态检测和响应集群事件等。控制平面组件可以在集群中的任何节点上运行，但通常会部署在同一节点，并且默认情况下此节点上不会运行业务 Pod。

### kube-apiserver
kube-apiserver 是 Kubernetes 的核心组件之一，该组件负责提供集群管理的 API 接口、并提供认证、授权、访问控制、注册和发现等功能，是 Kubernetes 控制平面的前端。
kube-apiserver 设计上就支持水平扩缩，可以通过部署多个实例来实现高可用和负载均衡。

### etcd
etcd 是一款分布式、高可用的 key-value 存储数据库。基于Go语言实现，在 Kubernetes 集群中它存储集群的配置和状态。

### kube-scheduler
kube-scheduler 负责分配调度 Pod 到集群内的节点上，它监听 kube-apiserver，并根据预定的调度策略将 Pod 调度到指定节点上。

### kube-controller-manager
kube-controller-manager 是 Kubernetes 的大脑，它通过 apiserver 监控整个集群的状态，并确保集群处于预期的工作状态。比如故障检测、自动扩展、滚动更新等。

## 工作节点组件
工作节点组件会在 Kubernetes 集群每个节点上运行，负责维护运行 Pod 并提供 Kubernetes 运行时环境。

### kubelet
kubelet 会在 Kubernetes 集群中每个 Node 节点上运行，接收 Master 发来的指令，管理 Pod 及 Pod 中的容器。每个 Kubelet 进程会在 API Server 上注册所在Node节点的信息，定期向 Master 节点汇报该节点的资源使用情况，并通过 cAdvisor 监控节点和容器的资源。

### kube-proxy
kube-proxy 是 Kubernetes 集群中的网络代理，负责为 Service 提供集群内部的服务发现和负载均衡。

### Container runtime
Container runtime 负责镜像管理以及容器的运行。Kubernetes 支持多种容器运行环境，包括 Docker、Containerd、CRI-O 以及 Kubernetes CRI的其他容器运行时，在1.24版本之后不支持 Docker。

## 插件
### kube-dns 
kube-dns 负责为整个集群提供 DNS 服务。

### Ingress Controller 
Ingress Controller 为服务提供外网入口。