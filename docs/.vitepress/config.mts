import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/vitepress-docs/",
  title: "Docs",
  description: "A VitePress Site",
  //文章更新时间
  lastUpdated: true,
  themeConfig: {
    //目录
    outlineTitle: "目录",
    outline: [2, 6],
    //搜索
    search: {
      provider: 'local'
    },

    // https://vitepress.dev/reference/default-theme-config
    // 导航栏
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docker', link: '/docker/index' },
      { text: 'Linux', link: '/linux/index' },
      { text: 'Kubernetes', link: '/kubernetes/index' },
      { text: 'Examples', link: '/markdown-examples' },
      {
        text: '中间件',
        items: [
          { text: 'MySQL', link: '/mysql/index' },
          { text: 'Nginx', link: '/nginx/index' },
        ]
      },
      { text: '其他', link: '/other/tools' }
    ],

    //侧边栏
    sidebar: {
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
              text: 'kubernetes',
              collapsed: false,
              items: [
                { text: '安装工具', link: '/kubernetes/install' },

              ]
            }
            ],

          '/other': [
            {
              text: '其他',
              collapsed: false,
              items: [
                { text: '常用工具', link: '/other/tools' },
                { text: 'Hexo搭建博客', link: '/other/hexo' },
                { text: 'Kafka集群部署', link: '/other/kafka' },
                { text: 'Harbor部署', link: '/other/harbor' },
              ]
            }
            ],

      '/': [
        {
          text: 'Examples',
          items: [
            { text: 'Markdown Examples', link: '/markdown-examples' },
            { text: 'Runtime API Examples', link: '/api-examples' }
          ]
        }
      ],  

    },

    //页脚
    footer: {
      // message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021 jingshulin. All rights reserved'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/slinjing' }
    ]
  }
})
