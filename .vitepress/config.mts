import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/my-blog/',
  title: "x不是y的解",
  description: "Web Developer Blog",
  lastUpdated: true, // 开启最后更新时间
  cleanUrls: true, // 开启自动清理 URL 中的 #，.html 符号
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/my-blog/favicon.svg' }],
    ['script', { async: '', src: '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js' }]
  ],

  themeConfig: {
    logo: '/favicon.svg',
    
    // 1. 导航栏配置
    nav: [
      { text: '首页', link: '/' },
      { text: 'React', link: '/react/' },
      { text: 'Vue', link: '/vue/index' },
      { text: 'Next.js', link: '/nextjs/' },
      { text: 'Node.js', link: '/nodejs/' },
      { text: 'Python', link: '/python/' },
      { 
        text: '更多', 
        items: [
          { text: '前端生态', link: '/ecosystem/' },
          { text: '踩坑记录', link: '/pitfalls/' }
        ]
      }
    ],

    // 2. 侧边栏配置 (以 Vue 为例)
    sidebar: {
      '/vue/': [
        {
          text: '基础',
          items: [
            { text: '生命周期', link: '/vue/lifecycle' },
            { text: '计算属性', link: '/vue/computed' },
            { text: '类与样式绑定', link: '/vue/class-style' },
          ]
        },
        {
          text: '深入组件',
          items: [
            { text: 'Props', link: '/vue/props' },
            { text: 'Event', link: '/vue/event' },
          ]
        }
      ],
      '/ecosystem/': [
        {
          text: '前端生态',
          items: [
            { text: 'CSR vs SSR', link: '/ecosystem/csr-vs-ssr' },
          ]
        }
      ]
    },

    // 3. 本地搜索配置 (类似 Algolia 效果)
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },

    // 4. 右侧目录标题
    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdatedText: '最后更新'
  }
})