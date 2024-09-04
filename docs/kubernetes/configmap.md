# ConfigMap
很多应用在其初始化或运行期间要依赖一些配置，并且配置可能会随着需求产生变化，ConfigMap 可以实现应用和配置分离，避免因为修改配置项而重新构建应用。

## 创建 ConfigMap
可以使用`kubectl create configmap`命令基于目录、 文件或者字符串来创建 ConfigMap。
```bash
$ kubectl create configmap special-config --from-literal=special.how=very
configmap "special-config" created
$ kubectl get configmap special-config -o go-template='{{.data}}'
map[special.how:very]
```