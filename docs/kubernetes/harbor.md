# kubernetes 中使用 Harbor

> [!TIP] 前提条件：
> 使用 Harbor **公开项目**中的镜像，只需要在 YAML 文件中指定镜像地址即可；使用 Harbor **私有项目**中的镜像，需要指定 **imagePullSecrets**。


## 公开项目
- YAML 文件中指定镜像地址
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: harbor.gt.com/library/nginx:latest
    imagePullPolicy: Always
```

## 私有项目

- 指定 imagePullSecrets
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: harbor.gt.com/library/nginx:latest
    imagePullPolicy: Always
  imagePullSecrets:
  - name: harbor-secret
```

- 创建 Secret

使用命令创建 Secret
```shell
$ kubectl create secret docker-registry harbor-secret \
--docker-server=harbor.gt.com \
--docker-username=admin \
--docker-password=Harbor12345 \
--docker-email=team@test.com
```
- 使用 YAML 文件创建 Secret，首先使用`docker login`登录 Harbor。
```shell
$ docker login 10.0.1.13
Username: test
Password: 
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
Login Succeeded
```

> [!TIP] 说明：
> docker login 会在`~/.docker`下面创建一个`config.json`文件保存鉴权串，下面的 YAML 文件`.dockerconfigjson`后面的数据就是`json`文件的`base64`编码输出，`-w 0`让`base64`输出在单行上，避免折行。



```yaml
apiVersion: v1
kind: Secret
metadata:
  name: harbor-secret
  namespace: default
data:
    .dockerconfigjson: {base64 -w 0 ~/.docker/config.json}
type: kubernetes.io/dockerconfigjson
```