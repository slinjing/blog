import docker from './sidebar/docker.mts'
import kubernetes from './sidebar/kubernetes.mts'
import python from './sidebar/python.mts'
import linux from './sidebar/linux.mts'
import librenms from './sidebar/librenms.mts'

export default{
    '/docker': docker,
    '/kubernetes': kubernetes,
    '/python': python,
    '/linux': linux,
    '/librenms': librenms,
    '/prometheus': [
        {
          text: 'Prometheus', link: '/prometheus/index',
          collapsed: false,
          items: [
            { text: 'PromQL', link: '/prometheus/PromQL' },
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

      'elk': [
        {
          text: 'ELK', link: '/elk/index',
          collapsed: false,
          items: [
            { text: 'ELK安装', link: '/elk/index' },

          ]
        }
      ],

      'etcd': [
        {
          text: '简介', link: '/etcd/index',
          items: [
            { text: '安装', link: '/etcd/install' },
            { text: '命令', link: '/etcd/command' },

          ]
        }
      ],
      

      '/other': [
        {
          text: '更多',
          items: [
            { text: 'LibreNMS', link: '/other/librenms' },
            // { text: 'Yaml', link: '/other/yaml' },
            // { text: 'Hexo', link: '/other/hexo' },
            // { text: 'RAID', link: '/other/raid' },
            // { text: 'Tools', link: '/other/tools' },
            // { text: 'Harbor', link: '/other/harbor' },
            // { text: 'Markdown', link: '/other/markdown' },
            // { text: 'SSR', link: '/other/ssr' },
            // { text: '交换机 NTP 时钟同步', link: '/other/net' },
            
          ]
        }
      ],

      '/cicd': [
        {
          items: [
            { text: 'CI/CD', link: '/cicd/index' },
            {
              text: 'Gitlab', 
              collapsed: false,
              items: [
                { text: '容器', link: '/docker/container' },
              ]
            },
            {
              text: 'Ansible', 
              collapsed: false,
              items: [
                { text: 'CentOS', link: '/docker/install-centos' },
                { text: 'Ubuntu', link: '/docker/install_ubuntu' },
              ]
            },
            {
              text: 'Jenkins', 
              collapsed: false,
              items: [
                { text: 'CentOS', link: '/docker/install-centos' },
                { text: 'Ubuntu', link: '/docker/install_ubuntu' },
              ]
            },              
          ]
        }
      ],       
}