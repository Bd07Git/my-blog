<template>
  <div class="page-info" v-if="show">
    <div class="meta-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>更新: {{ lastUpdated }}</span>
    </div>
    <div class="divider">|</div>
    <div class="meta-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      <span>字数: {{ wordCount }} 字</span>
    </div>
    <div class="divider">|</div>
    <div class="meta-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      <span>时长: {{ readTime }} 分钟</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, theme } = useData()
const route = useRoute()

const show = computed(() => page.value.filePath !== 'index.md')
const wordCount = ref(0)
const readTime = ref(0)
const lastUpdated = ref('')

const calculateInfo = () => {
  // 获取正文内容
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  const text = doc.innerText || ''
  // 粗略计算字数（中文字符 + 英文单词）
  const count = text.replace(/\s/g, '').length
  wordCount.value = count
  // 假设阅读速度为 300 字/分钟
  readTime.value = Math.ceil(count / 300) || 1
  
  // 格式化时间
  if (page.value.lastUpdated) {
    const date = new Date(page.value.lastUpdated)
    lastUpdated.value = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  } else {
    lastUpdated.value = new Date().toLocaleDateString()
  }
}

onMounted(() => {
  calculateInfo()
})

// 路由变化时重新计算
watch(() => route.path, () => {
  setTimeout(calculateInfo, 100)
})
</script>

<style scoped>
.page-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 24px;
  padding: 8px 16px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-gutter);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  color: var(--vp-c-brand-1);
}

.divider {
  color: var(--vp-c-divider);
  font-size: 12px;
}

@media (max-width: 640px) {
  .page-info {
    flex-wrap: wrap;
    gap: 8px;
  }
  .divider {
    display: none;
  }
}
</style>