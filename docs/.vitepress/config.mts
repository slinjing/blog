import { defineConfig } from 'vitepress'
//导入侧边栏配置文件
import sidebar from './sidebar.mts'
//导入导航栏
import nav from './nav.mjs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  //数学方程
  // markdown: {
  //   math: true
  // },
  title: "Jingshulin",
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
    nav: nav,

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
