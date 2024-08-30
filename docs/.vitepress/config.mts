import { defineConfig } from 'vitepress'
//导入侧边栏配置文件
import sidebar from './sidebar.mts'


// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/vitepress-docs/",

  title: "Docs",
  description: "A VitePress Site",
  //文章更新时间
  lastUpdated: true,
  themeConfig: {
    //文章更新时间
    lastUpdated: {
      text: '最后更新于',
      // formatOptions: {
      //   dateStyle: 'full',
      //   timeStyle: 'medium'
      // }
    },
    //编辑链接
    editLink: {
      pattern: 'https://github.com/slinjing/vitepress-docs/tree/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },
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
      { text: 'Linux', link: '/linux/index' },
      { text: 'Python', link: '/python/index' },
      {
        text: 'Cloud Native',
        items: [
          { text: 'Docker', link: '/docker/index' },
          { text: 'Kubernetes', link: '/kubernetes/index' },
          { text: 'Prometheus', link: '/prometheus/index' },
        ]
      },
      {
        text: 'CI/CD',
        items: [
          { text: 'Gitlab', link: '/cicd/gitlab' },
          { text: 'Harbor', link: '/cicd/harbor' },
          { text: 'Jenkins', link: '/cicd/jenkins' },
        ]
      },
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
    sidebar: sidebar,

    //页脚
    // footer: {
    //   // message: 'Released under the MIT License.',
    //   copyright: 'Copyright © 2021 jingshulin. All rights reserved'
    // },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/slinjing' }
    ]
  }
})
