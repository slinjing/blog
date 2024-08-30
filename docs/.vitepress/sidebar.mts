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
          text: 'Linux',
          collapsed: false,
          items: [
            // { text: 'Linux', link: '/linux/index' },
            { text: '部署NTP服务', link: '/linux/ntp' },
            { text: 'Linux排错', link: '/linux/debug' },
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
          text: '部署工具', link: '/kubernetes/deploy',
          collapsed: false,
          items: [
            { text: 'Kubeasz', link: '/kubernetes/deploy' },
            { text: 'Kubeadm', link: '/kubernetes/deploy' },
          ]
        },
        {
          text: '资源对象', link: '/kubernetes/objects',
          collapsed: false,
          items: [
            { text: 'ConfigMap', link: '/kubernetes/deploy' },
          ]
        }
      ],

      '/other': [
        {
          text: '其他',
          items: [
            { text: '常用工具', link: '/other/tools' },
            { text: 'Hexo 博客部署', link: '/other/hexo' },
            { text: 'Kafka 集群部署', link: '/other/kafka' },
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