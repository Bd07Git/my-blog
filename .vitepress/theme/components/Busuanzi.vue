<template>
  <div class="busuanzi-wrapper">
    <div class="busuanzi-container">
      <!-- PV 统计 -->
      <div id="busuanzi_container_site_pv" class="busuanzi-item" style="display:none">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        <span class="label">总访问量</span>
        <span id="busuanzi_value_site_pv" class="value"></span>
      </div>
      
      <div class="divider"></div>
      
      <!-- UV 统计 -->
      <div id="busuanzi_container_site_uv" class="busuanzi-item" style="display:none">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span class="label">访客数</span>
        <span id="busuanzi_value_site_uv" class="value"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.busuanzi-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 32px 0;
  margin-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
}

.busuanzi-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 10px 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-gutter);
  transition: all 0.3s ease;
}

.busuanzi-container:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.busuanzi-item {
  display: flex !important; /* 强制覆盖不蒜子可能的 inline 样式 */
  align-items: center;
  gap: 8px;
  white-space: nowrap; /* 防止长数字换行 */
}

.icon {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
}

.label {
  font-size: 13px;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}

.divider {
  width: 1px;
  height: 16px;
  background: var(--vp-c-divider);
}

/* 移动端适配：如果空间不足，依然保持水平但缩小间距，或者改为垂直对齐但保持图标在左侧 */
@media (max-width: 640px) {
  .busuanzi-container {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
    width: auto;
  }
  
  .divider {
    display: none;
  }

  .busuanzi-item {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>