export default{
    '/docker': [
        {
          text: 'Docker',
          collapsed: false,
          items: [
            // { text: 'Docker', link: '/docker/index' },
            { text: 'Docker安装', link: '/docker/install-docker' },
            { text: 'Docker网络', link: '/docker/docker-network' },
            { text: 'Docker存储', link: '/docker/docker-storage' },
            { text: 'Dockerfile', link: '/docker/docker-file' },
            { text: 'Docker Compose', link: 'docker/docker-compose' },
            { text: 'Portainer', link: '/docker/portainer' },
            { text: 'Docker排错', link: '/docker/debug' },
          ]
        }
      ],
      '/linux': [
        {
          text: 'Linux', link: '/linux/index',
          // collapsed: false,
          // items: [
          //   { text: '目录管理', link: '/linux/ntp' },
          //   { text: '用户管理 ', link: '/linux/debug' },
          // ]
        },
        {
          text: '服务部署', 
          // collapsed: false,
          items: [
            { text: '时间同步', link: '/linux/ntp' },
            // { text: 'Linux排错', link: '/linux/debug' },
          ]
        }
      ],

      '/mysql': [
        {
          text: 'MySQL',
          collapsed: false,
          items: [
            { text: 'MySQL安装', link: '/mysql/install' },
            { text: 'MySQL监控', link: '/mysql/monitor' },
            { text: 'MySQL排错', link: '/mysql/debug' },
          ]
        }
      ],

      '/kubernetes': [
        {
          text: 'kubernetes', link: '/kubernetes/index',
        },
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
      ],

      '/other': [
        {
          text: '其他',
          items: [
            { text: 'Tools', link: '/other/tools' },
            { text: 'Hexo', link: '/other/hexo' },
            { text: 'ShadowsocksR', link: '/other/ssr' },
          ]
        }
      ],

      '/cicd': [
        {
          text: 'CI/CD',
          collapsed: false,
          items: [
            { text: 'Gitlab', link: '/cicd/gitlab' },
            { text: 'Harbor', link: '/cicd/harbor' },
            { text: 'Jenkins', link: '/cicd/jenkins' },
          ]
        }
      ],    
}