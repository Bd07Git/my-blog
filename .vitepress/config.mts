import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/my-blog/',
  title: "day-day-up",
  description: "hl go go go",
  head: [
    // 1. 修复图标路径（使用带 base 的绝对路径最稳妥）
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/my-blog/favicon.svg' }],
    // 2. 显式声明视口，确保响应式
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ],
  themeConfig: {
    // 3. 修复 Logo 路径
    logo: '/favicon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})