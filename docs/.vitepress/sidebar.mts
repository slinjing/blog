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
            { text: '镜像加速', link: '/docker/debug' },
          ]
        }
      ],
      '/prometheus': [
        {
          text: 'Prometheus', link: '/prometheus/index',
          collapsed: false,
          items: [
            { text: 'PromQL', link: '/prometheus/PromQL' },
          ]
        }
      ],
      '/linux': [
        {
          text: 'Linux', link: '/linux/index',
          // collapsed: false,
          items: [
            // { text: '文件目录', link: '/linux/file-dir' },
            // { text: '系统管理', link: '/linux/system' },
            { text: '常用命令 ', link: '/linux/command' },
            // { text: '文本编辑', link: '/linux/vim' },
            // { text: 'Shell 脚本', link: '/linux/shell' },
            // { text: '时间同步', link: '/linux/ntp' },
            { text: '配置网卡', link: '/linux/network' },
            { text: '时间同步', link: '/linux/ntp' },
            { text: '磁盘管理', link: '/linux/disk' },
            { text: 'Shell 脚本', link: '/linux/shell' },
          ]
        },
        // {
        //   text: '配置', 
        //   // collapsed: false,
        //   items: [
        //     { text: '配置网卡', link: '/linux/network' },
        //     { text: '时间同步', link: '/linux/ntp' },
        //     { text: '磁盘管理', link: '/linux/disk' },
        //   ]
        // }
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

      'elk': [
        {
          text: 'ELK', link: '/elk/index',
          collapsed: false,
          items: [
            { text: 'ELK安装', link: '/elk/index' },

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
            { text: 'Yaml', link: '/other/yaml' },
            { text: 'Hexo', link: '/other/hexo' },
            { text: 'RAID', link: '/other/raid' },
            { text: 'Tools', link: '/other/tools' },
            { text: 'Harbor', link: '/other/harbor' },
            { text: 'Markdown', link: '/other/markdown' },
            { text: 'SSR', link: '/other/ssr' },
            { text: '交换机 NTP 时钟同步', link: '/other/net' },
            
          ]
        }
      ],

      '/gitlab': [
        {
          text: 'Gitlab', link: '/gitlab/index',
          // collapsed: false,
          items: [
            // { text: 'Gitlab', link: '/gitlab/index' },
          ]
        }
      ],    

      '/python': [
        {
          text: 'Python', link: '/python/index',
          items: [
            { text: 'psutil', link: '/python/psutil' },
          ]
        }
      ],      
}