<template>
  <div class="photo-deleter">
    <!-- 已解锁：显示删除按钮 -->
    <button class="delete-fab" @click="openDeleteModal" title="删除照片">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
      删除照片
    </button>

    <!-- 删除管理弹窗 -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-box delete-modal">
          <div class="modal-header">
            <span class="modal-icon">🗑️</span>
            <h3>删除照片</h3>
            <button class="modal-close" @click="closeDeleteModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- 搜索框 -->
            <div class="search-bar">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索说明、分类或日期..."
                class="search-input"
              />
              <button v-if="searchKeyword" class="clear-search" @click="searchKeyword = ''">✕</button>
            </div>

            <!-- 全选 / 统计 -->
            <div class="select-bar">
              <label class="select-all-label">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                  class="checkbox"
                />
                <span>全选（{{ filteredPhotos.length }} 张）</span>
              </label>
              <span class="selected-count" v-if="selectedSrcs.size > 0">
                已选 {{ selectedSrcs.size }} 张
              </span>
            </div>

            <!-- 照片列表 -->
            <div class="photo-list" v-if="filteredPhotos.length > 0">
              <label
                v-for="photo in filteredPhotos"
                :key="photo.src"
                class="photo-list-item"
                :class="{ selected: selectedSrcs.has(photo.src) }"
              >
                <input
                  type="checkbox"
                  :checked="selectedSrcs.has(photo.src)"
                  @change="toggleSelect(photo.src)"
                  class="checkbox"
                />
                <img :src="photo.src" :alt="photo.alt || ''" class="thumb" />
                <div class="photo-info">
                  <span class="photo-caption">{{ photo.caption || '无说明' }}</span>
                  <div class="photo-tags">
                    <span class="tag tag-alt">{{ photo.alt || '未分类' }}</span>
                    <span class="tag tag-date">{{ photo.date || '' }}</span>
                  </div>
                  <span class="photo-src-hint">{{ photo.src.split('/').pop() }}</span>
                </div>
              </label>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-search">
              <span>🔍 没有找到匹配的照片</span>
            </div>

            <!-- 操作结果 -->
            <div v-if="deleteResult" :class="['delete-result', deleteResult.type]">
              {{ deleteResult.message }}
            </div>

            <!-- 删除进度 -->
            <div v-if="deleting" class="delete-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <p class="progress-text">{{ progressText }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeDeleteModal" :disabled="deleting">取消</button>
            <button
              class="btn-delete"
              @click="confirmDelete"
              :disabled="selectedSrcs.size === 0 || deleting"
            >
              {{ deleting ? '删除中...' : `删除 ${selectedSrcs.size} 张` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 二次确认弹窗 -->
    <Transition name="modal">
      <div v-if="showConfirmModal" class="modal-overlay confirm-overlay">
        <div class="modal-box confirm-box">
          <div class="confirm-icon">⚠️</div>
          <h3 class="confirm-title">确认删除？</h3>
          <p class="confirm-desc">
            即将删除 <strong>{{ selectedSrcs.size }}</strong> 张照片，此操作将直接修改 GitHub 仓库，<strong>无法撤销</strong>，请谨慎操作。
          </p>
          <div class="confirm-preview">
            <img
              v-for="src in confirmPreviewList"
              :key="src"
              :src="src"
              class="confirm-thumb"
            />
            <span v-if="selectedSrcs.size > 5" class="confirm-more">
              +{{ selectedSrcs.size - 5 }} 张
            </span>
          </div>
          <div class="confirm-footer">
            <button class="btn-cancel" @click="showConfirmModal = false">取消</button>
            <button class="btn-delete-confirm" @click="executeDelete">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== GitHub 配置（与 PhotoUploader 保持一致）=====
const GITHUB_OWNER = 'Bd07Git'
const GITHUB_REPO = 'my-blog'
const GITHUB_BRANCH = 'main'
const PHOTOS_MD_PATH = 'photos/index.md'
const PUBLIC_IMAGE_PATH = 'public'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

// ===== 状态 =====
const showDeleteModal = ref(false)
const showConfirmModal = ref(false)
const searchKeyword = ref('')
const selectedSrcs = ref(new Set())
const deleting = ref(false)
const progressPercent = ref(0)
const progressText = ref('')
const deleteResult = ref(null)

// ===== 搜索过滤 =====
const filteredPhotos = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return props.photos
  return props.photos.filter(p =>
    (p.caption || '').toLowerCase().includes(kw) ||
    (p.alt || '').toLowerCase().includes(kw) ||
    (p.date || '').toLowerCase().includes(kw) ||
    (p.src || '').toLowerCase().includes(kw)
  )
})

// ===== 全选状态 =====
const isAllSelected = computed(() =>
  filteredPhotos.value.length > 0 &&
  filteredPhotos.value.every(p => selectedSrcs.value.has(p.src))
)

const isIndeterminate = computed(() =>
  filteredPhotos.value.some(p => selectedSrcs.value.has(p.src)) && !isAllSelected.value
)

const toggleSelectAll = () => {
  const newSet = new Set(selectedSrcs.value)
  if (isAllSelected.value) {
    filteredPhotos.value.forEach(p => newSet.delete(p.src))
  } else {
    filteredPhotos.value.forEach(p => newSet.add(p.src))
  }
  selectedSrcs.value = newSet
}

const toggleSelect = (src) => {
  const newSet = new Set(selectedSrcs.value)
  if (newSet.has(src)) {
    newSet.delete(src)
  } else {
    newSet.add(src)
  }
  selectedSrcs.value = newSet
}

// 确认弹窗预览（最多展示5张）
const confirmPreviewList = computed(() =>
  [...selectedSrcs.value].slice(0, 5)
)

// ===== 弹窗控制 =====
const openDeleteModal = () => {
  showDeleteModal.value = true
  selectedSrcs.value = new Set()
  searchKeyword.value = ''
  deleteResult.value = null
}

const closeDeleteModal = () => {
  if (deleting.value) return
  showDeleteModal.value = false
}

const confirmDelete = () => {
  if (selectedSrcs.value.size === 0 || deleting.value) return
  showConfirmModal.value = true
}

// ===== 执行删除 =====
const executeDelete = async () => {
  showConfirmModal.value = false
  deleting.value = true
  deleteResult.value = null
  progressPercent.value = 0

  const token = localStorage.getItem('blog_github_token')
  if (!token) {
    deleteResult.value = { type: 'error', message: '❌ 未找到 GitHub Token，请先在上传功能中配置 Token' }
    deleting.value = false
    return
  }

  const toDelete = props.photos.filter(p => selectedSrcs.value.has(p.src))
  const total = toDelete.length

  try {
    // ===== 第一步：从 public 目录删除图片文件 =====
    const deletedSrcs = []
    for (let i = 0; i < toDelete.length; i++) {
      const photo = toDelete[i]
      progressText.value = `删除图片 ${i + 1}/${total}...`
      progressPercent.value = Math.round((i / total) * 60)

      // 从 src 解析出文件名，如 /my-blog/photo_xxx.jpg → photo_xxx.jpg
      const fileName = photo.src.replace(/^\/my-blog\//, '')
      const filePath = `${PUBLIC_IMAGE_PATH}/${fileName}`

      try {
        // 获取文件 SHA（删除时必须提供）
        const checkRes = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
          { headers: { Authorization: `token ${token}` } }
        )
        if (!checkRes.ok) {
          // 文件不存在，跳过（只从 md 中移除记录）
          deletedSrcs.push(photo.src)
          continue
        }
        const fileData = await checkRes.json()

        const delRes = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `🗑️ 删除照片：${fileName}`,
              sha: fileData.sha,
              branch: GITHUB_BRANCH,
            }),
          }
        )

        if (delRes.ok) {
          deletedSrcs.push(photo.src)
        } else {
          const err = await delRes.json()
          console.warn(`删除文件 ${fileName} 失败：`, err.message)
          // 文件删除失败时仍继续，后续从 md 中移除记录
          deletedSrcs.push(photo.src)
        }
      } catch (e) {
        console.warn(`处理 ${fileName} 时出错：`, e)
        deletedSrcs.push(photo.src)
      }
    }

    // ===== 第二步：更新 photos/index.md，移除对应记录 =====
    progressText.value = '正在更新相册数据...'
    progressPercent.value = 65

    const mdRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PHOTOS_MD_PATH}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${token}` } }
    )
    if (!mdRes.ok) throw new Error('读取 photos/index.md 失败')
    const mdData = await mdRes.json()

    // 解码内容（支持中文）
    const base64 = mdData.content.replace(/\n/g, '')
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    let currentContent = new TextDecoder('utf-8').decode(bytes)
    const fileSha = mdData.sha

    // 从 photos 数组中逐条删除目标记录
    // 匹配形如：  {\n    src: '/my-blog/xxx.jpg',\n    ...\n  },
    for (const src of deletedSrcs) {
      // 转义 src 中的特殊字符用于正则
      const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // 匹配整个图片对象块（从 { 到 },）
      const blockRegex = new RegExp(
        `\\s*\\{[^}]*src:\\s*'${escapedSrc}'[^}]*\\},?`,
        'gs'
      )
      currentContent = currentContent.replace(blockRegex, '')
    }

    progressPercent.value = 80
    progressText.value = '正在提交更改...'

    // 编码为 Base64（支持中文）
    const encodeUTF8Base64 = (str) => {
      const bytes = new TextEncoder().encode(str)
      let binary = ''
      bytes.forEach(b => binary += String.fromCharCode(b))
      return btoa(binary)
    }

    const updateRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PHOTOS_MD_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `🗑️ 删除 ${deletedSrcs.length} 张照片`,
          content: encodeUTF8Base64(currentContent),
          sha: fileSha,
          branch: GITHUB_BRANCH,
        }),
      }
    )

    if (!updateRes.ok) {
      const errData = await updateRes.json()
      throw new Error(errData.message || '更新 index.md 失败')
    }

    progressPercent.value = 100
    progressText.value = '完成！'

    deleteResult.value = {
      type: 'success',
      message: `✅ 成功删除 ${deletedSrcs.length} 张照片！GitHub Actions 将在 1~2 分钟内自动更新部署。`
    }

    selectedSrcs.value = new Set()

    setTimeout(() => {
      closeDeleteModal()
    }, 3000)

  } catch (err) {
    deleteResult.value = {
      type: 'error',
      message: `❌ 删除失败：${err.message}`
    }
    console.error('删除错误:', err)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
/* ===== 触发按钮 ===== */
.delete-fab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(238, 90, 36, 0.3);
  transition: all 0.2s;
}

.delete-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(238, 90, 36, 0.4);
}

/* ===== 弹窗通用 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: var(--vp-c-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.delete-modal {
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  position: sticky;
  top: 0;
  background: var(--vp-c-bg);
  z-index: 1;
}

.modal-icon { font-size: 20px; }

.modal-header h3 {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.modal-close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--vp-c-bg-mute); }

.modal-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: sticky;
  bottom: 0;
  background: var(--vp-c-bg);
}

/* ===== 搜索框 ===== */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus { border-color: var(--vp-c-brand-1); }

.clear-search {
  position: absolute;
  right: 10px;
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  display: flex;
  align-items: center;
}
.clear-search:hover { color: var(--vp-c-text-1); }

/* ===== 全选栏 ===== */
.select-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  user-select: none;
}

.selected-count {
  font-size: 12px;
  font-weight: 600;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #ff6b6b;
  flex-shrink: 0;
}

/* ===== 照片列表 ===== */
.photo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
}

.photo-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
}

.photo-list-item:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.photo-list-item.selected {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.06);
}

.thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--vp-c-bg-mute);
}

.photo-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.photo-caption {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 500;
}

.tag-alt {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.tag-date {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.photo-src-hint {
  font-size: 10px;
  color: var(--vp-c-text-3);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 空状态 ===== */
.empty-search {
  text-align: center;
  padding: 32px 0;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

/* ===== 删除进度 ===== */
.delete-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ee5a24);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* ===== 操作结果 ===== */
.delete-result {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.delete-result.success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.delete-result.error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

/* ===== 按钮 ===== */
.btn-cancel {
  padding: 9px 20px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover:not(:disabled) { background: var(--vp-c-bg-soft); }
.btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-delete {
  padding: 9px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-delete:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* ===== 二次确认弹窗 ===== */
.confirm-overlay { z-index: 10001; }

.confirm-box {
  max-width: 380px;
  padding: 32px 28px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.confirm-icon { font-size: 40px; }

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
}

.confirm-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

.confirm-desc strong { color: #ff6b6b; }

.confirm-preview {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 8px 0;
}

.confirm-thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ff6b6b;
}

.confirm-more {
  font-size: 12px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  padding: 4px 8px;
  border-radius: 6px;
}

.confirm-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 4px;
}

.btn-delete-confirm {
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
}

.btn-delete-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(238, 90, 36, 0.4);
}

/* ===== 弹窗动画 ===== */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.25s ease; }
.modal-enter-from .modal-box { transform: translateY(20px) scale(0.96); }
.modal-leave-to .modal-box { transform: translateY(10px) scale(0.96); }

/* ===== 暗色模式 ===== */
.dark .delete-result.success {
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.3);
}
.dark .delete-result.error {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}
</style>
