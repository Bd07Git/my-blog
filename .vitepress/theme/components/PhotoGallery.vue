<template>
  <div class="photo-gallery-wrapper">
    <!-- 左侧分类导航栏 -->
    <aside class="category-sidebar">
      <div class="sidebar-title">📂 分类</div>
      <ul class="category-list">
        <li>
          <button
            :class="['category-item', { active: activeCategory === 'all' }]"
            @click="activeCategory = 'all'"
          >
            <span class="cat-icon">🌟</span>
            <span class="cat-name">全部</span>
            <span class="cat-count">{{ photos.length }}</span>
          </button>
        </li>
        <li v-for="cat in categories" :key="cat">
          <button
            :class="['category-item', { active: activeCategory === cat }]"
            @click="activeCategory = cat"
          >
            <span class="cat-icon">{{ getCatIcon(cat) }}</span>
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ photosByCategory[cat].length }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <!-- 右侧主内容 -->
    <div class="photo-gallery">
      <!-- 顶部标题区 -->
      <div class="gallery-header">
        <h1 class="gallery-title">{{ title }}</h1>
        <p class="gallery-desc">{{ description }}</p>
        <!-- 布局切换 -->
        <div class="layout-switcher">
          <button 
            :class="['layout-btn', { active: layout === 'masonry' }]"
            @click="layout = 'masonry'"
            title="瀑布流"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="6" height="9" rx="1"/>
              <rect x="9" y="0" width="6" height="6" rx="1"/>
              <rect x="0" y="11" width="6" height="5" rx="1"/>
              <rect x="9" y="8" width="6" height="8" rx="1"/>
            </svg>
          </button>
          <button 
            :class="['layout-btn', { active: layout === 'grid' }]"
            @click="layout = 'grid'"
            title="网格"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7" rx="1"/>
              <rect x="9" y="0" width="7" height="7" rx="1"/>
              <rect x="0" y="9" width="7" height="7" rx="1"/>
              <rect x="9" y="9" width="7" height="7" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 当前分类标签 -->
      <div class="active-category-tag" v-if="activeCategory !== 'all'">
        <span>{{ getCatIcon(activeCategory) }} {{ activeCategory }}</span>
        <button class="clear-cat" @click="activeCategory = 'all'">✕</button>
      </div>

      <!-- 瀑布流布局 -->
      <div v-if="layout === 'masonry'" class="masonry-layout">
        <div 
          v-for="(col, ci) in masonryColumns" 
          :key="ci" 
          class="masonry-col"
        >
          <div 
            v-for="photo in col" 
            :key="photo.src"
            class="photo-item"
            @click="openLightbox(photo)"
          >
            <img 
              :src="photo.src" 
              :alt="photo.alt || ''"
              loading="lazy"
              @load="onImgLoad"
            />
            <div class="photo-overlay">
              <span class="photo-caption">{{ photo.caption }}</span>
              <span class="photo-date">{{ photo.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 网格布局 -->
      <div v-else class="grid-layout">
        <div 
          v-for="photo in filteredPhotos" 
          :key="photo.src"
          class="grid-item"
          @click="openLightbox(photo)"
        >
          <img 
            :src="photo.src" 
            :alt="photo.alt || ''"
            loading="lazy"
          />
          <div class="photo-overlay">
            <span class="photo-caption">{{ photo.caption }}</span>
            <span class="photo-date">{{ photo.date }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredPhotos.length === 0" class="empty-state">
        <span>📭 该分类暂无照片</span>
      </div>

      <!-- Lightbox 灯箱 -->
      <Transition name="lightbox">
        <div v-if="lightboxPhoto" class="lightbox" @click.self="closeLightbox">
          <div class="lightbox-content">
            <button class="lb-close" @click="closeLightbox">✕</button>
            <button class="lb-prev" @click="prevPhoto" v-if="filteredPhotos.length > 1">‹</button>
            <button class="lb-next" @click="nextPhoto" v-if="filteredPhotos.length > 1">›</button>
            <img :src="lightboxPhoto.src" :alt="lightboxPhoto.alt || ''" />
            <div class="lb-info" v-if="lightboxPhoto.caption || lightboxPhoto.date">
              <span class="lb-caption">{{ lightboxPhoto.caption }}</span>
              <span class="lb-date">{{ lightboxPhoto.date }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
    // 每项格式: { src, alt, caption, date }
  },
  title: {
    type: String,
    default: '📷 相册'
  },
  description: {
    type: String,
    default: '记录生活中的美好瞬间'
  },
  columns: {
    type: Number,
    default: 3
  }
})

const layout = ref('masonry')
const lightboxPhoto = ref(null)
const currentIndex = ref(0)
const activeCategory = ref('all')

// 从 alt 字段提取所有分类（去重）
const categories = computed(() => {
  const cats = props.photos
    .map(p => p.alt)
    .filter(Boolean)
  return [...new Set(cats)]
})

// 每个分类对应的图片列表
const photosByCategory = computed(() => {
  const map = {}
  categories.value.forEach(cat => {
    map[cat] = props.photos.filter(p => p.alt === cat)
  })
  return map
})

// 当前筛选后的图片列表
const filteredPhotos = computed(() => {
  if (activeCategory.value === 'all') return props.photos
  return photosByCategory.value[activeCategory.value] || []
})

// 分类 icon 映射
const catIconMap = {
  '风景': '🏞️',
  '合照': '🤝',
  '美食': '🍜',
  '旅行': '✈️',
  '生活': '🌿',
  '自拍': '🤳',
  '夜景': '🌃',
  '动物': '🐾',
}

const getCatIcon = (cat) => catIconMap[cat] || '📁'

// 将图片分配到各列（瀑布流）
const masonryColumns = computed(() => {
  const cols = Array.from({ length: props.columns }, () => [])
  filteredPhotos.value.forEach((photo, i) => {
    cols[i % props.columns].push(photo)
  })
  return cols
})

const openLightbox = (photo) => {
  currentIndex.value = filteredPhotos.value.indexOf(photo)
  lightboxPhoto.value = photo
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxPhoto.value = null
  document.body.style.overflow = ''
}

const prevPhoto = () => {
  currentIndex.value = (currentIndex.value - 1 + filteredPhotos.value.length) % filteredPhotos.value.length
  lightboxPhoto.value = filteredPhotos.value[currentIndex.value]
}

const nextPhoto = () => {
  currentIndex.value = (currentIndex.value + 1) % filteredPhotos.value.length
  lightboxPhoto.value = filteredPhotos.value[currentIndex.value]
}

const onImgLoad = () => {}

// 键盘导航
const handleKey = (e) => {
  if (!lightboxPhoto.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKey)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKey)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* 整体布局：侧边栏 + 内容区 */
.photo-gallery-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px 0;
}

/* ===== 左侧分类导航 ===== */
.category-sidebar {
  width: 160px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px 12px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-left: 4px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.category-item:hover {
  background: var(--vp-c-bg-alt);
}

.category-item.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.cat-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.cat-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-count {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  padding: 1px 6px;
  border-radius: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.category-item.active .cat-count {
  background: var(--vp-c-brand-1);
  color: #fff;
}

/* ===== 右侧主内容 ===== */
.photo-gallery {
  flex: 1;
  min-width: 0;
}

/* 顶部标题 */
.gallery-header {
  text-align: center;
  margin-bottom: 32px;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #ff6eb4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* 修复渐变文字上下被裁剪的问题 */
  padding: 6px 4px;
  line-height: 1.3;
  margin-bottom: 8px;
  display: inline-block;
}

.gallery-desc {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  margin-bottom: 16px;
}

/* 布局切换按钮 */
.layout-switcher {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.layout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.layout-btn:hover {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
}

.layout-btn.active {
  background: var(--vp-c-brand-1);
  color: #fff;
}

/* 当前分类标签 */
.active-category-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 6px 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.clear-cat {
  border: none;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.clear-cat:hover { opacity: 1; }

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--vp-c-text-3);
  font-size: 15px;
}

/* 瀑布流 */
.masonry-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.masonry-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 网格布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 每张图片 */
.photo-item,
.grid-item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  /* 白色内边框 + 阴影装饰 */
  box-shadow:
    0 0 0 3px var(--vp-c-bg),
    0 0 0 4px var(--vp-c-divider),
    0 6px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--vp-c-bg-soft);
}

.photo-item:hover,
.grid-item:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow:
    0 0 0 3px var(--vp-c-bg),
    0 0 0 4px var(--vp-c-brand-1),
    0 16px 36px rgba(0, 0, 0, 0.2);
}

.grid-item {
  aspect-ratio: 1 / 1;
}

.photo-item img,
.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.grid-item img {
  position: absolute;
  inset: 0;
}

.photo-item:hover img,
.grid-item:hover img {
  transform: scale(1.05);
}

/* 悬浮遮罩 */
.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 12px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay,
.grid-item:hover .photo-overlay {
  opacity: 1;
}

.photo-caption {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.photo-date {
  color: rgba(255,255,255,0.7);
  font-size: 11px;
}

/* Lightbox 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-content img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.lb-close {
  position: fixed;
  top: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.lb-close:hover { background: rgba(255,255,255,0.3); }

.lb-prev, .lb-next {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.3); }

.lb-info {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lb-caption {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.lb-date {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
}

/* 灯箱过渡动画 */
.lightbox-enter-active, .lightbox-leave-active {
  transition: opacity 0.3s ease;
}
.lightbox-enter-from, .lightbox-leave-to {
  opacity: 0;
}
.lightbox-enter-active .lightbox-content,
.lightbox-leave-active .lightbox-content {
  transition: transform 0.3s ease;
}
.lightbox-enter-from .lightbox-content {
  transform: scale(0.9);
}
.lightbox-leave-to .lightbox-content {
  transform: scale(0.9);
}

/* 响应式 */
@media (max-width: 768px) {
  .photo-gallery-wrapper {
    flex-direction: column;
  }

  .category-sidebar {
    width: 100%;
    position: static;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px;
    overflow-x: auto;
  }

  .sidebar-title {
    margin-bottom: 0;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .category-list {
    flex-direction: row;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .category-item {
    white-space: nowrap;
    padding: 6px 10px;
  }

  .cat-count {
    display: none;
  }

  .masonry-layout {
    gap: 12px;
  }
  .masonry-col {
    gap: 12px;
  }
  .grid-layout {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .gallery-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
