import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { h, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import Busuanzi from './components/Busuanzi.vue'
import MTools from './components/MTools.vue'
import MAiNav from './components/MAiNav.vue'
import BackToTop from './components/BackToTop.vue'
import ClickFireworks from './components/ClickFireworks.vue'
import PageInfo from './components/PageInfo.vue'
import VueDirectory from './components/VueDirectory.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 使用 layout-bottom 插槽
      'layout-bottom': () => h('div', [h(Busuanzi), h(BackToTop), h(ClickFireworks)]),
      // 在文档内容前插入页面信息
      'doc-before': () => h(PageInfo)
    })
  },
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('Busuanzi', Busuanzi)
    app.component('MTools', MTools)
    app.component('MAiNav', MAiNav)
    app.component('BackToTop', BackToTop)
    app.component('ClickFireworks', ClickFireworks)
    app.component('PageInfo', PageInfo)
    app.component('VueDirectory', VueDirectory)
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      // 为所有正文中的图片添加缩放功能
      mediumZoom('.vp-doc img', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  }
}