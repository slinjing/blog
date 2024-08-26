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
      { text: 'Examples', link: '/markdown-examples' },
    ],

    //侧边栏
    sidebar: {
      '/docker': [
        {
          text: 'Docker',
          collapsed: false,
          items: [
            { text: 'Docker', link: '/docker/index' },
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
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/slinjing' }
    ]
  }
})
