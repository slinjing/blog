# 部署网络插件


## flannel

> [!TIP] flannel 项目地址：  
> https://github.com/flannel-io/flannel

- 下载 yaml 文件
```shell
$ wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

- 修改 flannel 镜像地址
```shell
$ sed -i 's/quay.io/quay-mirror.qiniu.com/g' kube-flannel.yml
```

- 安装网络插件
```shell
$ kubectl apply -f kube-flannel.yml
```


## calico
> [!TIP] calico 参考网址：  
> https://projectcalico.docs.tigera.io/about/about-calico

> 使用 operator 安装
```shell
$ kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml
```

> 通过自定义资源方式安装
- 下载 yaml 文件
```shell
$ https://docs.projectcalico.org/v3.20/manifests/calico.yaml
```

```shell
$ vim calico.yaml
# 修改定义pod网络CALICO_IPV4POOL_CIDR的值
# 要和kubeadm init pod-network-cidr的值一致
# 修改calico.yaml
# 修改定义pod网络CALICO_IPV4POOL_CIDR的值和kubeadm init pod-network-cidr的值一致
## 取消注释
- name: CALICO_IPV4POOL_CIDR
  value: "10.244.0.0/16"
  
# calico配置自动检测此主机的 IPv4 地址的方法
# 在env:CLUSTER_TYPE下配置
- name: IP_AUTODETECTION_METHOD
  value: "interface=ens33"   # ens33为本地网卡名字
```

- 修改 calico 镜像地址
```shell
$ grep image calico.yaml
$ sed -i 's/docker.io/registry.cn-chengdu.aliyuncs.com/shulinjing/g' calico.yaml
```

- 安装网络插件
```shell
$ kubectl create -f calico.yaml
$ watch kubectl get pods -n calico-system
```