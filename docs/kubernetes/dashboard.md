# Dashboard
Kubernetes Dashboard 是 k8s集群的一个 WEB UI管理工具，代码托管在 github 上。

> [!NOTE] 项目地址：
> https://github.com/kubernetes/dashboard

## 安装 Dashboard

```shell
$ wget https://raw.githubusercontent.com/kubernetes/dashboard/v1.10.1/src/deploy/recommended/kubernetes-dashboard.yaml
$ kubectl create -f kubernetes-dashboard.yaml
```

## 身份认证
创建一个 admin 用户并授予 admin 角色绑定，使用下面的 yaml 文件创建 admin 用户并赋予他管理员权限，然后就可以通过 token 登陆 dashbaord。
```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: admin
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
subjects:
- kind: ServiceAccount
  name: admin
  namespace: kube-system

  ---
  apiVersion: v1
  kind: ServiceAccount
  metadata:
  name: admin
  namespace: kube-system
  labels:
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
```

上面的 admin 用户创建完成后就可以获取到该用户对应的 token 了，命令如下：
```shell
$ kubectl get secret -n kube-system|grep admin-token
admin-token-d5jsg                  kubernetes.io/service-account-token   3         1d
$ kubectl get secret admin-token-d5jsg -o jsonpath={.data.token} -n kube-system |base64 -d
# 会生成一串很长的base64后的字符串
```

然后在 dashboard 登录页面上直接使用上面得到的 token 字符串即可登录，这样就可以拥有管理员权限操作整个 kubernetes 集群的对象，当然也可以为你的登录用户新建一个指定操作权限的用户。