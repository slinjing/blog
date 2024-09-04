# Pod
Pod 是可以在 Kubernetes 中创建和管理的、最小的可部署的计算单元。

## 创建 Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.14.2
    ports:
    - containerPort: 80
```