export default [
    { text: 'kubernetes', link: '/kubernetes/index', },
    {
        text: '集群高可用',
        collapsed: false,
        items: [
            { text: 'Kubeasz', link: '/kubernetes/kubeasz' },
            { text: 'Kubeadm', link: '/kubernetes/Kubeadm' },
        ]
    },

    {
        text: 'Dashboard',
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
        ]
    }
]