# Kuboard
Kuboard 是一个强大的 Kubernetes 管理工具，提供了直观的界面和丰富的功能，使开发者和运维人员能够更轻松地管理 Kubernetes 集群。

> [!NOTE] 官网：
> https://kuboard.cn/   
> 安装文档：https://kuboard.cn/install/v3/install-in-k8s.html

## 安装 Kuboard

- hostPath
```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: kuboard

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: kuboard-v3-config
  namespace: kuboard
data:
  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-built-in.html
  # [common]
  KUBOARD_SERVER_NODE_PORT: '30080'
  KUBOARD_AGENT_SERVER_UDP_PORT: '30081'
  KUBOARD_AGENT_SERVER_TCP_PORT: '30081'
  KUBOARD_SERVER_LOGRUS_LEVEL: info  # error / debug / trace
  # KUBOARD_AGENT_KEY 是 Agent 与 Kuboard 通信时的密钥，请修改为一个任意的包含字母、数字的32位字符串，此密钥变更后，需要删除 Kuboard Agent 重新导入。
  KUBOARD_AGENT_KEY: 32b7d6572c6255211b4eec9009e4a816
  KUBOARD_AGENT_IMAG: registry.mycompany.com/kuboard/kuboard-agent
  KUBOARD_QUESTDB_IMAGE: registry.mycompany.com/kuboard/questdb:6.0.5
  KUBOARD_DISABLE_AUDIT: 'false' # 如果要禁用 Kuboard 审计功能，将此参数的值设置为 'true'，必须带引号。

  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-gitlab.html
  # [gitlab login]
  # KUBOARD_LOGIN_TYPE: "gitlab"
  # KUBOARD_ROOT_USER: "your-user-name-in-gitlab"
  # GITLAB_BASE_URL: "http://gitlab.mycompany.com"
  # GITLAB_APPLICATION_ID: "7c10882aa46810a0402d17c66103894ac5e43d6130b81c17f7f2d8ae182040b5"
  # GITLAB_CLIENT_SECRET: "77c149bd3a4b6870bffa1a1afaf37cba28a1817f4cf518699065f5a8fe958889"
  
  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-github.html
  # [github login]
  # KUBOARD_LOGIN_TYPE: "github"
  # KUBOARD_ROOT_USER: "your-user-name-in-github"
  # GITHUB_CLIENT_ID: "17577d45e4de7dad88e0"
  # GITHUB_CLIENT_SECRET: "ff738553a8c7e9ad39569c8d02c1d85ec19115a7"

  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-ldap.html
  # [ldap login]
  # KUBOARD_LOGIN_TYPE: "ldap"
  # KUBOARD_ROOT_USER: "your-user-name-in-ldap"
  # LDAP_HOST: "ldap-ip-address:389"
  # LDAP_BIND_DN: "cn=admin,dc=example,dc=org"
  # LDAP_BIND_PASSWORD: "admin"
  # LDAP_BASE_DN: "dc=example,dc=org"
  # LDAP_FILTER: "(objectClass=posixAccount)"
  # LDAP_ID_ATTRIBUTE: "uid"
  # LDAP_USER_NAME_ATTRIBUTE: "uid"
  # LDAP_EMAIL_ATTRIBUTE: "mail"
  # LDAP_DISPLAY_NAME_ATTRIBUTE: "cn"
  # LDAP_GROUP_SEARCH_BASE_DN: "dc=example,dc=org"
  # LDAP_GROUP_SEARCH_FILTER: "(objectClass=posixGroup)"
  # LDAP_USER_MACHER_USER_ATTRIBUTE: "gidNumber"
  # LDAP_USER_MACHER_GROUP_ATTRIBUTE: "gidNumber"
  # LDAP_GROUP_NAME_ATTRIBUTE: "cn"

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kuboard-boostrap
  namespace: kuboard

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kuboard-boostrap-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: kuboard-boostrap
  namespace: kuboard

---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    k8s.kuboard.cn/name: kuboard-etcd
  name: kuboard-etcd
  namespace: kuboard
spec:
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      k8s.kuboard.cn/name: kuboard-etcd
  template:
    metadata:
      labels:
        k8s.kuboard.cn/name: kuboard-etcd
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: node-role.kubernetes.io/master
                    operator: Exists
              - matchExpressions:
                  - key: node-role.kubernetes.io/control-plane
                    operator: Exists
              - matchExpressions:
                  - key: k8s.kuboard.cn/role
                    operator: In
                    values:
                      - etcd
      containers:
        - env:
            - name: HOSTNAME
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: spec.nodeName
            - name: HOSTIP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.hostIP
          image: 'registry.mycompany.com/kuboard/etcd-host:3.4.16-2'
          imagePullPolicy: Always
          name: etcd
          ports:
            - containerPort: 2381
              hostPort: 2381
              name: server
              protocol: TCP
            - containerPort: 2382
              hostPort: 2382
              name: peer
              protocol: TCP
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /health
              port: 2381
              scheme: HTTP
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          volumeMounts:
            - mountPath: /data
              name: data
      dnsPolicy: ClusterFirst
      hostNetwork: true
      restartPolicy: Always
      serviceAccount: kuboard-boostrap
      serviceAccountName: kuboard-boostrap
      tolerations:
        - key: node-role.kubernetes.io/master
          operator: Exists
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
      volumes:
        - hostPath:
            path: /usr/share/kuboard/etcd
          name: data
  updateStrategy:
    rollingUpdate:
      maxUnavailable: 1
    type: RollingUpdate


---
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations: {}
  labels:
    k8s.kuboard.cn/name: kuboard-v3
  name: kuboard-v3
  namespace: kuboard
spec:
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      k8s.kuboard.cn/name: kuboard-v3
  template:
    metadata:
      labels:
        k8s.kuboard.cn/name: kuboard-v3
    spec:
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - preference:
                matchExpressions:
                  - key: node-role.kubernetes.io/master
                    operator: Exists
              weight: 100
            - preference:
                matchExpressions:
                  - key: node-role.kubernetes.io/control-plane
                    operator: Exists
              weight: 100
      containers:
        - env:
            - name: HOSTIP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.hostIP
            - name: HOSTNAME
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: spec.nodeName
          envFrom:
            - configMapRef:
                name: kuboard-v3-config
          image: 'registry.mycompany.com/kuboard/kuboard:v3'
          imagePullPolicy: Always
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /kuboard-resources/version.json
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          name: kuboard
          ports:
            - containerPort: 80
              name: web
              protocol: TCP
            - containerPort: 443
              name: https
              protocol: TCP
            - containerPort: 10081
              name: peer
              protocol: TCP
            - containerPort: 10081
              name: peer-u
              protocol: UDP
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /kuboard-resources/version.json
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          resources: {}
          # startupProbe:
          #   failureThreshold: 20
          #   httpGet:
          #     path: /kuboard-resources/version.json
          #     port: 80
          #     scheme: HTTP
          #   initialDelaySeconds: 5
          #   periodSeconds: 10
          #   successThreshold: 1
          #   timeoutSeconds: 1
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      serviceAccount: kuboard-boostrap
      serviceAccountName: kuboard-boostrap
      tolerations:
        - key: node-role.kubernetes.io/master
          operator: Exists

---
apiVersion: v1
kind: Service
metadata:
  annotations: {}
  labels:
    k8s.kuboard.cn/name: kuboard-v3
  name: kuboard-v3
  namespace: kuboard
spec:
  ports:
    - name: web
      nodePort: 30080
      port: 80
      protocol: TCP
      targetPort: 80
    - name: tcp
      nodePort: 30081
      port: 10081
      protocol: TCP
      targetPort: 10081
    - name: udp
      nodePort: 30081
      port: 10081
      protocol: UDP
      targetPort: 10081
  selector:
    k8s.kuboard.cn/name: kuboard-v3
  sessionAffinity: None
  type: NodePort
```


- StorageClass
```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: kuboard

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: kuboard-v3-config
  namespace: kuboard
data:
  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-built-in.html
  # [common]
  KUBOARD_ENDPOINT: 'http://your-node-ip-address:30080'
  KUBOARD_AGENT_SERVER_UDP_PORT: '30081'
  KUBOARD_AGENT_SERVER_TCP_PORT: '30081'
  KUBOARD_SERVER_LOGRUS_LEVEL: info  # error / debug / trace
  # KUBOARD_AGENT_KEY 是 Agent 与 Kuboard 通信时的密钥，请修改为一个任意的包含字母、数字的32位字符串，此密钥变更后，需要删除 Kuboard Agent 重新导入。
  KUBOARD_AGENT_KEY: 32b7d6572c6255211b4eec9009e4a816  

  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-gitlab.html
  # [gitlab login]
  # KUBOARD_LOGIN_TYPE: "gitlab"
  # KUBOARD_ROOT_USER: "your-user-name-in-gitlab"
  # GITLAB_BASE_URL: "http://gitlab.mycompany.com"
  # GITLAB_APPLICATION_ID: "7c10882aa46810a0402d17c66103894ac5e43d6130b81c17f7f2d8ae182040b5"
  # GITLAB_CLIENT_SECRET: "77c149bd3a4b6870bffa1a1afaf37cba28a1817f4cf518699065f5a8fe958889"
  
  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-github.html
  # [github login]
  # KUBOARD_LOGIN_TYPE: "github"
  # KUBOARD_ROOT_USER: "your-user-name-in-github"
  # GITHUB_CLIENT_ID: "17577d45e4de7dad88e0"
  # GITHUB_CLIENT_SECRET: "ff738553a8c7e9ad39569c8d02c1d85ec19115a7"

  # 关于如下参数的解释，请参考文档 https://kuboard.cn/install/v3/install-ldap.html
  # [ldap login]
  # KUBOARD_LOGIN_TYPE: "ldap"
  # KUBOARD_ROOT_USER: "your-user-name-in-ldap"
  # LDAP_HOST: "ldap-ip-address:389"
  # LDAP_BIND_DN: "cn=admin,dc=example,dc=org"
  # LDAP_BIND_PASSWORD: "admin"
  # LDAP_BASE_DN: "dc=example,dc=org"
  # LDAP_FILTER: "(objectClass=posixAccount)"
  # LDAP_ID_ATTRIBUTE: "uid"
  # LDAP_USER_NAME_ATTRIBUTE: "uid"
  # LDAP_EMAIL_ATTRIBUTE: "mail"
  # LDAP_DISPLAY_NAME_ATTRIBUTE: "cn"
  # LDAP_GROUP_SEARCH_BASE_DN: "dc=example,dc=org"
  # LDAP_GROUP_SEARCH_FILTER: "(objectClass=posixGroup)"
  # LDAP_USER_MACHER_USER_ATTRIBUTE: "gidNumber"
  # LDAP_USER_MACHER_GROUP_ATTRIBUTE: "gidNumber"
  # LDAP_GROUP_NAME_ATTRIBUTE: "cn"

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kuboard-etcd
  namespace: kuboard
  labels:
    app: kuboard-etcd
spec:
  serviceName: kuboard-etcd
  replicas: 3
  selector:
    matchLabels:
      app: kuboard-etcd
  template:
    metadata:
      name: kuboard-etcd
      labels:
        app: kuboard-etcd
    spec:
      containers:
      - name: kuboard-etcd
        image: swr.cn-east-2.myhuaweicloud.com/kuboard/etcd:v3.4.14
        ports:
        - containerPort: 2379
          name: client
        - containerPort: 2380
          name: peer
        env:
        - name: KUBOARD_ETCD_ENDPOINTS
          value: >-
            kuboard-etcd-0.kuboard-etcd:2379,kuboard-etcd-1.kuboard-etcd:2379,kuboard-etcd-2.kuboard-etcd:2379
        volumeMounts:
        - name: data
          mountPath: /data
        command:
          - /bin/sh
          - -c
          - |
            PEERS="kuboard-etcd-0=http://kuboard-etcd-0.kuboard-etcd:2380,kuboard-etcd-1=http://kuboard-etcd-1.kuboard-etcd:2380,kuboard-etcd-2=http://kuboard-etcd-2.kuboard-etcd:2380"
            exec etcd --name ${HOSTNAME} \
              --listen-peer-urls http://0.0.0.0:2380 \
              --listen-client-urls http://0.0.0.0:2379 \
              --advertise-client-urls http://${HOSTNAME}.kuboard-etcd:2379 \
              --initial-advertise-peer-urls http://${HOSTNAME}:2380 \
              --initial-cluster-token kuboard-etcd-cluster-1 \
              --initial-cluster ${PEERS} \
              --initial-cluster-state new \
              --data-dir /data/kuboard.etcd
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      # 请填写一个有效的 StorageClass name
      storageClassName: please-provide-a-valid-StorageClass-name-here
      accessModes: [ "ReadWriteMany" ]
      resources:
        requests:
          storage: 5Gi


---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: kuboard-data-pvc
spec:
  storageClassName: please-provide-a-valid-StorageClass-name-here
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi

---
apiVersion: v1
kind: Service
metadata:
  name: kuboard-etcd
  namespace: kuboard
spec:
  type: ClusterIP
  ports:
  - port: 2379
    name: client
  - port: 2380
    name: peer
  selector:
    app: kuboard-etcd

---
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    deployment.kubernetes.io/revision: '9'
    k8s.kuboard.cn/ingress: 'false'
    k8s.kuboard.cn/service: NodePort
    k8s.kuboard.cn/workload: kuboard-v3
  labels:
    k8s.kuboard.cn/name: kuboard-v3
  name: kuboard-v3
  namespace: kuboard
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s.kuboard.cn/name: kuboard-v3
  template:
    metadata:
      labels:
        k8s.kuboard.cn/name: kuboard-v3
    spec:
      containers:
        - env:
            - name: KUBOARD_ETCD_ENDPOINTS
              value: >-
                kuboard-etcd-0.kuboard-etcd:2379,kuboard-etcd-1.kuboard-etcd:2379,kuboard-etcd-2.kuboard-etcd:2379
          envFrom:
            - configMapRef:
                name: kuboard-v3-config
          image: 'swr.cn-east-2.myhuaweicloud.com/kuboard/kuboard:v3'
          imagePullPolicy: Always
          name: kuboard
          volumeMounts:
            - mountPath: "/data"
              name: kuboard-data
      volumes:
      - name: kuboard-data
        persistentVolumeClaim:
          claimName: kuboard-data-pvc

---
apiVersion: v1
kind: Service
metadata:
  annotations:
    k8s.kuboard.cn/workload: kuboard-v3
  labels:
    k8s.kuboard.cn/name: kuboard-v3
  name: kuboard-v3
  namespace: kuboard
spec:
  ports:
    - name: webui
      nodePort: 30080
      port: 80
      protocol: TCP
      targetPort: 80
    - name: agentservertcp
      nodePort: 30081
      port: 10081
      protocol: TCP
      targetPort: 10081
    - name: agentserverudp
      nodePort: 30081
      port: 10081
      protocol: UDP
      targetPort: 10081
  selector:
    k8s.kuboard.cn/name: kuboard-v3
  sessionAffinity: None
  type: NodePort
```