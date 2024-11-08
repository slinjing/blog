# Ingress

在 Kubernetes 集群中，Ingress 作为集群内服务对外暴露的访问接入点，其几乎承载着集群内服务访问的所有流量。Ingress 是 Kubernetes 中的一个资源对象，用来管理集群外部访问集群内部服务的方式。可以通过 Ingress 资源来配置不同的转发规则，从而达到根据不同的规则设置访问集群内不同的 Service 后端 Pod。

## Ingress Controller 工作原理
为了使得 Ingress 资源正常工作，集群中必须要有个 Ingress Controller 来解析 Ingress 的转发规则。

![](/kubernetes/ingress.png)

Ingress Controller 收到请求，匹配 Ingress 转发规则转发到后端 Service，而 Service 转发到 Pod，最终由 Pod 处理请求。Kubernetes 中 Service、Ingress 与 Ingress Controller 有着以下关系：

- Service 是后端真实服务的抽象，一个 Service 可以代表多个相同的后端服务。   
- Ingress 是反向代理规则，用来规定 HTTP/HTTPS 请求应该被转发到哪个 Service 上。例如根据请求中不同的 Host 和 URL 路径，让请求落到不同的 Service 上。
- Ingress Controller 是一个反向代理程序，负责解析 Ingress 的反向代理规则。如果 Ingress 有增删改的变动，Ingress Controller 会及时更新自己相应的转发规则，当 Ingress Controller 收到请求后就会根据这些规则将请求转发到对应的 Service。
- Ingress Controller 通过 API Server 获取 Ingress 资源的变化，动态地生成 Load Balancer（例如 Nginx）所需的配置文件（例如 nginx.conf），然后重新加载 Load Balancer（例如执行 nginx -s load 重新加载 Nginx。）来生成新的路由转发规则。

## 部署 Ingress Controller

Ingress Controller YAML 文件
```shell
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ingress-nginx
  namespace: kube-system

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.9.3
  name: ingress-nginx
  namespace: kube-system
rules:
- apiGroups:
  - ""
  resources:
  - namespaces
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - configmaps
  - pods
  - secrets
  - endpoints
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses/status
  verbs:
  - update
- apiGroups:
  - networking.k8s.io
  resources:
  - ingressclasses
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - ""
  resourceNames:
  - ingress-controller-leader-nginx
  resources:
  - configmaps
  verbs:
  - get
  - update
- apiGroups:
  - ""
  resources:
  - configmaps
  verbs:
  - create
- apiGroups:
  - coordination.k8s.io
  resourceNames:
  - ingress-controller-leader-nginx
  resources:
  - leases
  verbs:
  - get
  - update
- apiGroups:
  - coordination.k8s.io
  resources:
  - leases
  verbs:
  - create
- apiGroups:
  - ""
  resources:
  - events
  verbs:
  - create
  - patch
- apiGroups:
  - discovery.k8s.io
  resources:
  - endpointslices
  verbs:
  - list
  - watch
  - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.9.3
  name: ingress-nginx
rules:
- apiGroups:
  - ""
  resources:
  - configmaps
  - endpoints
  - nodes
  - pods
  - secrets
  - namespaces
  verbs:
  - list
  - watch
- apiGroups:
  - coordination.k8s.io
  resources:
  - leases
  verbs:
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - nodes
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - events
  verbs:
  - create
  - patch
- apiGroups:
  - networking.k8s.io
  resources:
  - ingresses/status
  verbs:
  - update
- apiGroups:
  - networking.k8s.io
  resources:
  - ingressclasses
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - discovery.k8s.io
  resources:
  - endpointslices
  verbs:
  - list
  - watch
  - get
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.9.3
  name: ingress-nginx
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ingress-nginx
subjects:
- kind: ServiceAccount
  name: ingress-nginx
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/part-of: ingress-nginx
    app.kubernetes.io/version: 1.9.3
  name: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx
subjects:
- kind: ServiceAccount
  name: ingress-nginx
  namespace: kube-system


# https://www.cnblogs.com/dudu/p/12197646.html
#---
#apiVersion: monitoring.coreos.com/v1
#kind: ServiceMonitor
#metadata:
#  labels:
#    app: ingress-nginx
#  name: nginx-ingress-scraping
#  namespace: kube-system
#spec:
#  endpoints:
#  - interval: 30s
#    path: /metrics
#    port: metrics
#  jobLabel: app
#  namespaceSelector:
#    matchNames:
#    - ingress-nginx
#  selector:
#    matchLabels:
#      app: ingress-nginx

---

apiVersion: v1
kind: Service
metadata:
  labels:
    app: ingress-nginx
  name: nginx-ingress-lb
  namespace: kube-system
spec:
  # DaemonSet need:
  # ----------------
  type: ClusterIP
  # ----------------
  # Deployment need:
  # ----------------
#  type: NodePort
  # ----------------
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
  - name: https
    port: 443
    targetPort: 443
    protocol: TCP
  - name: metrics
    port: 10254
    protocol: TCP
    targetPort: 10254
  selector:
    app: ingress-nginx

---
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller-admission
  namespace: kube-system
spec:
  type: ClusterIP
  ports:
    - name: https-webhook
      port: 443
      targetPort: 8443
  selector:
    app: ingress-nginx

---
# all configmaps means:
# https://github.com/kubernetes/ingress-nginx/blob/master/docs/user-guide/nginx-configuration/configmap.md

kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-configuration
  namespace: kube-system
  labels:
    app: ingress-nginx
data:
  allow-snippet-annotations: "true"
  allow-backend-server-header: "true"
  disable-access-log: "false"
  enable-underscores-in-headers: "true"
  generate-request-id: "true"
  ignore-invalid-headers: "true"
  keep-alive: "900"
  keep-alive-requests: "10000"
  large-client-header-buffers: 5 20k
  log-format-upstream: '{"@timestamp": "$time_iso8601","remote_addr": "$remote_addr","x-forward-for": "$proxy_add_x_forwarded_for","request_id": "$req_id","remote_user": "$remote_user","bytes_sent": $bytes_sent,"request_time": $request_time,"status": $status,"vhost": "$host","request_proto": "$server_protocol","path": "$uri","request_query": "$args","request_length": $request_length,"duration": $request_time,"method": "$request_method","http_referrer": "$http_referer","http_user_agent":  "$http_user_agent","upstream-sever":"$proxy_upstream_name","proxy_alternative_upstream_name":"$proxy_alternative_upstream_name","upstream_addr":"$upstream_addr","upstream_response_length":$upstream_response_length,"upstream_response_time":$upstream_response_time,"upstream_status":$upstream_status}'
  max-worker-connections: "65536"
  proxy-body-size: 20m
  proxy-connect-timeout: "10"
  proxy-read-timeout: "60"
  proxy-send-timeout: "60"
  reuse-port: "true"
  server-tokens: "false"
  ssl-redirect: "false"
  upstream-keepalive-connections: "300"
  upstream-keepalive-requests: "1000"
  upstream-keepalive-timeout: "900"
  worker-cpu-affinity: ""
  worker-processes: "1"
  http-redirect-code: "301"
  proxy_next_upstream: error timeout http_502
  ssl-ciphers: ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA
  ssl-protocols: TLSv1 TLSv1.1 TLSv1.2


---
kind: ConfigMap
apiVersion: v1
metadata:
  name: tcp-services
  namespace: kube-system
  labels:
    app: ingress-nginx

---
kind: ConfigMap
apiVersion: v1
metadata:
  name: udp-services
  namespace: kube-system
  labels:
    app: ingress-nginx

---
apiVersion: apps/v1
kind: DaemonSet
#kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: kube-system
  labels:
    app: ingress-nginx
  annotations:
    component.revision: "2"
    component.version: 1.9.3
spec:
  # Deployment need:
  # ----------------
#  replicas: 1
  # ----------------
  selector:
    matchLabels:
      app: ingress-nginx
  template:
    metadata:
      labels:
        app: ingress-nginx
      annotations:
        prometheus.io/port: "10254"
        prometheus.io/scrape: "true"
    spec:
      # DaemonSet need:
      # ----------------
      hostNetwork: true
      # ----------------
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - ingress-nginx
              topologyKey: kubernetes.io/hostname
            weight: 100
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: type
                operator: NotIn
                values:
                - virtual-kubelet
              - key: k8s.aliyun.com
                operator: NotIn
                values:
                - "true"
      containers:
      - args:
          - /nginx-ingress-controller
          - --election-id=ingress-controller-leader-nginx
          - --ingress-class=nginx
          - --watch-ingress-without-class
          - --controller-class=k8s.io/ingress-nginx
          - --configmap=$(POD_NAMESPACE)/nginx-configuration
          - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
          - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
          - --annotations-prefix=nginx.ingress.kubernetes.io
          - --publish-service=$(POD_NAMESPACE)/nginx-ingress-lb
          - --validating-webhook=:8443
          - --validating-webhook-certificate=/usr/local/certificates/cert
          - --validating-webhook-key=/usr/local/certificates/key
          - --enable-metrics=false
          - --v=2
        env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: LD_PRELOAD
            value: /usr/local/lib/libmimalloc.so
        image: registry-cn-hangzhou.ack.aliyuncs.com/acs/aliyun-ingress-controller:v1.9.3-aliyun.1
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
                - /wait-shutdown
        livenessProbe:
          failureThreshold: 5
          httpGet:
            path: /healthz
            port: 10254
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 1
          successThreshold: 1
        name: nginx-ingress-controller
        ports:
          - name: http
            containerPort: 80
            protocol: TCP
          - name: https
            containerPort: 443
            protocol: TCP
          - name: webhook
            containerPort: 8443
            protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /healthz
            port: 10254
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 1
          successThreshold: 1
#  资源限制          
#        resources:
#          limits:
#            cpu: 1
#            memory: 2G
#          requests:
#            cpu: 1
#            memory: 2G
        securityContext:
          allowPrivilegeEscalation: true
          capabilities:
            drop:
              - ALL
            add:
              - NET_BIND_SERVICE
          runAsUser: 101
          # 如果日志报如下提示，打开下面注释
          # if get 'mount: mounting rw on /proc/sys failed: Permission denied', use:
#          privileged: true
#          procMount: Default
#          runAsUser: 0
        volumeMounts:
        - name: webhook-cert
          mountPath: /usr/local/certificates/
          readOnly: true
        - mountPath: /etc/localtime
          name: localtime
          readOnly: true
      dnsPolicy: ClusterFirst
      initContainers:
      - command:
        - /bin/sh
        - -c
        - |
          if [ "$POD_IP" != "$HOST_IP" ]; then
          mount -o remount rw /proc/sys
          sysctl -w net.core.somaxconn=65535
          sysctl -w net.ipv4.ip_local_port_range="1024 65535"
          sysctl -w kernel.core_uses_pid=0
          fi
        env:
        - name: POD_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.podIP
        - name: HOST_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.hostIP
        image: registry.cn-shanghai.aliyuncs.com/acs/busybox:v1.29.2
        imagePullPolicy: IfNotPresent
        name: init-sysctl
        resources:
          limits:
            cpu: 100m
            memory: 70Mi
          requests:
            cpu: 100m
            memory: 70Mi
        securityContext:
          capabilities:
            add:
            - SYS_ADMIN
            drop:
            - ALL
          # if get 'mount: mounting rw on /proc/sys failed: Permission denied', use:
          privileged: true
          procMount: Default
          runAsUser: 0
      # choose node with set this label running
      # kubectl label node xx.xx.xx.xx ingress-controller-ready=true
      # kubectl get node --show-labels
      # kubectl label node xx.xx.xx.xx ingress-controller-ready-
      nodeSelector:
        ingress-controller-ready: "true"
      priorityClassName: system-node-critical
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      serviceAccount: ingress-nginx
      serviceAccountName: ingress-nginx
      terminationGracePeriodSeconds: 300
      # 打上污点禁止其他pod调度到ingress节点上
      # kubectl taint nodes xx.xx.xx.xx ingress-controller-ready="true":NoExecute
      # kubectl taint nodes xx.xx.xx.xx ingress-controller-ready:NoExecute-
# 容忍所有污点
      tolerations:
      - operator: Exists
# 容忍指定污点      
#      tolerations:
#      - effect: NoExecute
#        key: ingress-controller-ready
#        operator: Equal
#        value: "true"
      volumes:
      - name: webhook-cert
        secret:
          defaultMode: 420
          secretName: ingress-nginx-admission
      - hostPath:
          path: /etc/localtime
          type: File
        name: localtime

---
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx-master
  namespace: kube-system
  annotations:
   ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx


---
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  labels:
    name: ingress-nginx
  name: ingress-nginx-admission
webhooks:
  - name: validate.nginx.ingress.kubernetes.io
    matchPolicy: Equivalent
    rules:
      - apiGroups:
          - networking.k8s.io
        apiVersions:
          - v1
        operations:
          - CREATE
          - UPDATE
        resources:
          - ingresses
    failurePolicy: Fail
    sideEffects: None
    admissionReviewVersions:
      - v1
    clientConfig:
      service:
        namespace: kube-system
        name: ingress-nginx-controller-admission
        path: /networking/v1/ingresses
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ingress-nginx-admission
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ingress-nginx-admission
rules:
  - apiGroups:
      - admissionregistration.k8s.io
    resources:
      - validatingwebhookconfigurations
    verbs:
      - get
      - update
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ingress-nginx-admission
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx-admission
subjects:
  - kind: ServiceAccount
    name: ingress-nginx-admission
    namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ingress-nginx-admission
  namespace: kube-system
rules:
  - apiGroups:
      - ""  
    resources:
      - secrets
    verbs:
      - get
      - create
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ingress-nginx-admission
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ingress-nginx-admission
subjects:
  - kind: ServiceAccount
    name: ingress-nginx-admission
    namespace: kube-system
---
apiVersion: batch/v1
kind: Job
metadata:
  name: ingress-nginx-admission-create
  labels:
    name: ingress-nginx
  namespace: kube-system
spec:
  template:
    metadata:
      name: ingress-nginx-admission-create
      labels:
        name: ingress-nginx
    spec:
      containers:
        - name: create
#          image: registry-vpc.cn-hangzhou.aliyuncs.com/acs/kube-webhook-certgen:v1.1.1
          image: registry.cn-beijing.aliyuncs.com/acs/kube-webhook-certgen:v1.5.1
          imagePullPolicy: IfNotPresent
          args:
            - create
            - --host=ingress-nginx-controller-admission,ingress-nginx-controller-admission.$(POD_NAMESPACE).svc
            - --namespace=$(POD_NAMESPACE)
            - --secret-name=ingress-nginx-admission
          env:
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
      restartPolicy: OnFailure
      serviceAccountName: ingress-nginx-admission
      securityContext:
        runAsNonRoot: true
        runAsUser: 2000
---
apiVersion: batch/v1
kind: Job
metadata:
  name: ingress-nginx-admission-patch
  labels:
    name: ingress-nginx
  namespace: kube-system
spec:
  template:
    metadata:
      name: ingress-nginx-admission-patch
      labels:
        name: ingress-nginx
    spec:
      containers:
        - name: patch
          image: registry.cn-hangzhou.aliyuncs.com/acs/kube-webhook-certgen:v1.1.1  # if error use this image
          imagePullPolicy: IfNotPresent
          args:
            - patch
            - --webhook-name=ingress-nginx-admission
            - --namespace=$(POD_NAMESPACE)
            - --patch-mutating=false
            - --secret-name=ingress-nginx-admission
            - --patch-failure-policy=Fail
          env:
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          securityContext:
            allowPrivilegeEscalation: false
      restartPolicy: OnFailure
      serviceAccountName: ingress-nginx-admission
      securityContext:
        runAsNonRoot: true
        runAsUser: 2000

---
# 云平台SLB配置
## Deployment need for aliyun'k8s:
#apiVersion: v1
#kind: Service
#metadata:
#  annotations:
#    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id: "lb-xxxxxxxxxxxxxxxxx"
#    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-force-override-listeners: "true"
#  labels:
#    app: nginx-ingress-lb
#  name: nginx-ingress-lb-boge
#  namespace: kube-system
#spec:
#  externalTrafficPolicy: Local
#  ports:
#  - name: http
#    port: 80
#    protocol: TCP
#    targetPort: 80
#  - name: https
#    port: 443
#    protocol: TCP
#    targetPort: 443
#  selector:
#    app: ingress-nginx
#  type: LoadBalancer
```

- 为 node 节点打上标签
```shell
$ kubectl label node 192.168.183.142  ingress-controller-ready=true
$ kubectl  get no --show-labels
NAME              STATUS                     ROLES    AGE   VERSION   LABELS
192.168.183.139   Ready                      node     41h   v1.23.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=192.168.183.139,kubernetes.io/os=linux,kubernetes.io/role=node
192.168.183.142   Ready,SchedulingDisabled   master   41h   v1.23.1   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,ingress-controller-ready=true,kubernetes.io/arch=amd64,kubernetes.io/hostname=192.168.183.142,kubernetes.io/os=linux,kubernetes.io/role=master
```

- 部署 Ingress Controller
```shell
$ kubectl  apply -f k8s/aliyun-ingress-nginx.yaml
```

- 禁止 pod 调度到 Ingress 节点

Ingress Controller 部署在 master 节点上的可忽略此步骤
```shell
$ kubectl taint nodes 192.168.183.142 ingress-controller-ready="true":NoExecute
$ kubectl taint 192.168.183.142 ingress-controller-ready:NoExecute-
```