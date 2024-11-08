export default [
    {
        items: [
            {
                text: 'kubernetes ', link: '/kubernetes/index',
                collapsed: false,
                items: [
                    { text: '准备部署环境', link: '/kubernetes/01' },
                    { text: '部署负载均衡器', link: '/kubernetes/ha' },
                    { text: '部署 ETCD', link: '/kubernetes/etcd' },
                    { text: '部署 apiserver', link: '/kubernetes/apiserver' },
                    { text: '部署 kubectl', link: '/kubernetes/kubectl' },
                    { text: '部署 controller-manager', link: '/kubernetes/controller-manager' },
                    { text: '部署 kube-scheduler', link: '/kubernetes/kube-scheduler' },
                    { text: '部署 runtiame', link: '/kubernetes/runtiame' },
                    { text: '部署 kubelet', link: '/kubernetes/kubelet' },
                    { text: '部署 kube-proxy', link: '/kubernetes/kube-proxy' },
                    { text: '部署网络插件', link: '/kubernetes/calico' },
                    { text: '部署 coredns', link: '/kubernetes/coredns' },
                    { text: '集群验证', link: '/kubernetes/02' },
                    
                ]
            },
            {
                text: '部署工具 ', 
                collapsed: false,
                items: [
                    { text: 'Kubeasz', link: '/kubernetes/kubeasz' },
                    { text: 'Kubeadm', link: '/kubernetes/kubeadm' },
                ]
            },
            {
                text: 'Web UI',
                collapsed: false,
                items: [
                    { text: 'Kuboard', link: 'kubernetes/kuboard' },
                    { text: 'Dashboard', link: '/kubernetes/dashboard' },
                ]
            },

            {
                text: '资源对象',
                collapsed: false,
                items: [
                    { text: 'Pod', link: '/kubernetes/pod' },
                    { text: 'ConfigMap', link: '/kubernetes/configmap' },
                    { text: 'Ingress', link: '/kubernetes/Ingress' },
                ]
            },
            { text: '使用 Harbor', link: '/kubernetes/harbor' },
        ]
    }
]