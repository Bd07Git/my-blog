<template>
  <div class="photo-uploader">
    <!-- 未解锁：显示锁图标，点击弹出密码输入 -->
    <div v-if="!unlocked" class="lock-trigger">
      <button class="lock-btn" @click="showPasswordModal = true" title="管理员上传">
        🔒
      </button>
    </div>

    <!-- 已解锁：显示上传按钮 -->
    <div v-else class="upload-trigger">
      <button class="upload-fab" @click="showUploadModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        上传照片
      </button>
    </div>

    <!-- 密码弹窗 -->
    <Transition name="modal">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-icon">🔐</span>
            <h3>管理员验证</h3>
            <button class="modal-close" @click="showPasswordModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-tip">请输入管理员密码以解锁上传功能</p>
            <div class="input-group">
              <input
                ref="pwdInput"
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                @keyup.enter="verifyPassword"
                class="pwd-input"
                :class="{ error: pwdError }"
              />
              <button class="toggle-pwd" @click="showPwd = !showPwd">
                {{ showPwd ? '🙈' : '👁️' }}
              </button>
            </div>
            <p v-if="pwdError" class="error-msg">❌ 密码错误，请重试</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showPasswordModal = false">取消</button>
            <button class="btn-confirm" @click="verifyPassword">确认</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 上传弹窗 -->
    <Transition name="modal">
      <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
        <div class="modal-box upload-modal">
          <div class="modal-header">
            <span class="modal-icon">📤</span>
            <h3>上传照片</h3>
            <button class="modal-close" @click="closeUploadModal">✕</button>
          </div>
          <div class="modal-body">
            <!-- Token 配置区（首次或未配置时展示） -->
            <div v-if="!tokenConfigured" class="token-section">
              <p class="section-label">🔑 首次使用需配置 GitHub Token</p>
              <input
                v-model="githubToken"
                type="password"
                placeholder="GitHub Personal Access Token (repo 权限)"
                class="token-input"
              />
              <p class="token-tip">Token 仅保存在本地浏览器，不会上传到任何服务器</p>
              <button class="btn-save-token" @click="saveToken" :disabled="!githubToken.trim()">
                保存 Token
              </button>
            </div>

            <template v-else>
              <!-- 拖拽上传区 -->
              <div
                class="drop-zone"
                :class="{ 'drag-over': isDragging, 'has-files': previewFiles.length > 0 }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
                @click="fileInput.click()"
              >
                <template v-if="previewFiles.length === 0">
                  <div class="drop-icon">🖼️</div>
                  <p class="drop-text">点击或拖拽图片到此处</p>
                  <p class="drop-hint">支持 JPG、PNG、WebP、GIF，单张最大 10MB</p>
                </template>
                <div v-else class="preview-grid">
                  <div
                    v-for="(file, i) in previewFiles"
                    :key="i"
                    class="preview-item"
                    :class="{ uploading: file.status === 'uploading', done: file.status === 'done', error: file.status === 'error' }"
                  >
                    <img :src="file.preview" :alt="file.name" />
                    <div class="preview-status">
                      <span v-if="file.status === 'uploading'" class="status-uploading">⏳</span>
                      <span v-else-if="file.status === 'done'" class="status-done">✅</span>
                      <span v-else-if="file.status === 'error'" class="status-error" :title="file.errorMsg">❌</span>
                    </div>
                    <button
                      class="remove-file"
                      @click.stop="removeFile(i)"
                      v-if="file.status !== 'uploading'"
                    >✕</button>
                  </div>
                  <div class="add-more" @click.stop="fileInput.click()">
                    <span>＋</span>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden-input"
                  @change="handleFileChange"
                />
              </div>

              <!-- 图片信息填写 -->
              <div class="photo-meta" v-if="previewFiles.length > 0">
                <!-- 分类选择 -->
                <div class="meta-row">
                  <label class="meta-label">📂 分类（alt）</label>
                  <div class="category-selector">
                    <button
                      v-for="cat in allCategories"
                      :key="cat"
                      :class="['cat-chip', { active: selectedCategory === cat }]"
                      @click="selectedCategory = cat; isNewCategory = false; newCategoryName = ''"
                    >
                      {{ getCatIcon(cat) }} {{ cat }}
                    </button>
                    <button
                      :class="['cat-chip new-cat', { active: isNewCategory }]"
                      @click="isNewCategory = true; selectedCategory = ''"
                    >
                      ＋ 新分类
                    </button>
                  </div>
                  <input
                    v-if="isNewCategory"
                    v-model="newCategoryName"
                    type="text"
                    placeholder="输入新分类名称，如：旅行"
                    class="new-cat-input"
                    @input="selectedCategory = newCategoryName"
                  />
                </div>

                <!-- 说明 caption -->
                <div class="meta-row">
                  <label class="meta-label">✏️ 说明（caption）</label>
                  <input
                    v-model="caption"
                    type="text"
                    placeholder="图片说明，如：🌊 海边漫步"
                    class="meta-input"
                  />
                </div>

                <!-- 日期 -->
                <div class="meta-row">
                  <label class="meta-label">📅 日期</label>
                  <input
                    v-model="photoDate"
                    type="month"
                    class="meta-input"
                  />
                </div>
              </div>

              <!-- 上传进度 -->
              <div v-if="uploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <p class="progress-text">{{ progressText }}</p>
              </div>

              <!-- 上传结果 -->
              <div v-if="uploadResult" :class="['upload-result', uploadResult.type]">
                {{ uploadResult.message }}
              </div>

              <!-- Token 重置 -->
              <button class="btn-reset-token" @click="tokenConfigured = false; githubToken = ''">
                🔑 重新配置 Token
              </button>
            </template>
          </div>

          <div class="modal-footer" v-if="tokenConfigured">
            <button class="btn-cancel" @click="closeUploadModal">取消</button>
            <button
              class="btn-confirm"
              @click="startUpload"
              :disabled="!canUpload || uploading"
            >
              {{ uploading ? '上传中...' : `上传 ${previewFiles.length} 张照片` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// ===== 配置 =====
const GITHUB_OWNER = 'Bd07Git'
const GITHUB_REPO = 'my-blog'
const GITHUB_BRANCH = 'main'
const PHOTOS_MD_PATH = 'photos/index.md'
const PUBLIC_IMAGE_PATH = 'public'
// 密码的 SHA-256 哈希值，默认密码是 "admin123"，请修改后替换
// 生成方法：在浏览器控制台运行：
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的密码')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
const PASSWORD_HASH = 'a81ffb258bff4eddc4512f0935683e007c06fb4cc176864cb7b425d8b8ca1aae'

// ===== 状态 =====
const unlocked = ref(false)
const showPasswordModal = ref(false)
const showUploadModal = ref(false)
const password = ref('')
const showPwd = ref(false)
const pwdError = ref(false)
const pwdInput = ref(null)

const githubToken = ref('')
const tokenConfigured = ref(false)

const fileInput = ref(null)
const previewFiles = ref([])
const isDragging = ref(false)
const caption = ref('')
const photoDate = ref(new Date().toISOString().slice(0, 7))
const selectedCategory = ref('')
const isNewCategory = ref(false)
const newCategoryName = ref('')

const uploading = ref(false)
const progressPercent = ref(0)
const progressText = ref('')
const uploadResult = ref(null)

// 从 props 接收已有分类列表
const props = defineProps({
  existingCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:unlocked'])

const allCategories = computed(() => props.existingCategories)

const catIconMap = {
  '风景': '🏞️', '合照': '🤝', '美食': '🍜', '旅行': '✈️',
  '生活': '🌿', '自拍': '🤳', '夜景': '🌃', '动物': '🐾',
}
const getCatIcon = (cat) => catIconMap[cat] || '📁'

const finalCategory = computed(() => {
  if (isNewCategory.value) return newCategoryName.value.trim()
  return selectedCategory.value
})

const canUpload = computed(() => {
  return previewFiles.value.length > 0 &&
    finalCategory.value !== '' &&
    caption.value.trim() !== '' &&
    photoDate.value !== ''
})

// ===== 密码验证 =====
onMounted(() => {
  // 检查 localStorage 里是否已解锁
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('blog_admin_unlocked')
    if (saved === 'true') {
      unlocked.value = true
      emit('update:unlocked', true)
    }

    const savedToken = localStorage.getItem('blog_github_token')
    if (savedToken) {
      githubToken.value = savedToken
      tokenConfigured.value = true
    }
  }
})

const verifyPassword = async () => {
  if (!password.value) return
  try {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password.value)
    )
    const hashHex = [...new Uint8Array(hashBuffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')

    if (hashHex === PASSWORD_HASH) {
      unlocked.value = true
      localStorage.setItem('blog_admin_unlocked', 'true')
      emit('update:unlocked', true)
      showPasswordModal.value = false
      password.value = ''
      pwdError.value = false
    } else {
      pwdError.value = true
      password.value = ''
      await nextTick()
      pwdInput.value?.focus()
    }
  } catch (e) {
    console.error('密码验证失败', e)
  }
}

const lockOut = () => {
  unlocked.value = false
  localStorage.removeItem('blog_admin_unlocked')
  emit('update:unlocked', false)
}

// 暴露给父组件调用
defineExpose({ lockOut })

// ===== Token 配置 =====
const saveToken = () => {
  if (!githubToken.value.trim()) return
  localStorage.setItem('blog_github_token', githubToken.value.trim())
  tokenConfigured.value = true
}

// ===== 文件处理 =====
const handleFileChange = (e) => {
  addFiles(Array.from(e.target.files))
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  addFiles(files)
}

const addFiles = (files) => {
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} 超过 10MB 限制，已跳过`)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      previewFiles.value.push({
        file,
        name: file.name,
        preview: e.target.result,
        base64: e.target.result.split(',')[1],
        mimeType: file.type,
        status: 'pending',
        errorMsg: ''
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  previewFiles.value.splice(index, 1)
}

// ===== 上传逻辑 =====
const startUpload = async () => {
  if (!canUpload.value || uploading.value) return
  uploading.value = true
  uploadResult.value = null
  progressPercent.value = 0

  const token = localStorage.getItem('blog_github_token')
  const total = previewFiles.value.length

  try {
    // 第一步：逐张上传图片到 GitHub public 目录
    const uploadedImages = []
    for (let i = 0; i < previewFiles.value.length; i++) {
      const fileObj = previewFiles.value[i]
      fileObj.status = 'uploading'
      progressText.value = `上传图片 ${i + 1}/${total}：${fileObj.name}`
      progressPercent.value = Math.round((i / total) * 70)

      const ext = fileObj.name.split('.').pop().toLowerCase()
      const timestamp = Date.now()
      const fileName = `photo_${timestamp}_${i}.${ext}`
      const filePath = `${PUBLIC_IMAGE_PATH}/${fileName}`

      try {
        // 检查文件是否已存在（获取 SHA）
        let existingSha = null
        try {
          const checkRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
            { headers: { Authorization: `token ${token}` } }
          )
          if (checkRes.ok) {
            const checkData = await checkRes.json()
            existingSha = checkData.sha
          }
        } catch (_) {}

        const body = {
          message: `📷 上传照片：${fileName}`,
          content: fileObj.base64,
          branch: GITHUB_BRANCH,
        }
        if (existingSha) body.sha = existingSha

        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        )

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.message || `上传失败 (${res.status})`)
        }

        fileObj.status = 'done'
        // GitHub Pages base 是 /my-blog/，图片放在 public 下访问路径是 /my-blog/xxx.jpg
        uploadedImages.push({
          src: `/my-blog/${fileName}`,
          caption: caption.value.trim(),
          date: photoDate.value,
          alt: finalCategory.value,
        })
      } catch (err) {
        fileObj.status = 'error'
        fileObj.errorMsg = err.message
        console.error(`上传 ${fileObj.name} 失败:`, err)
      }
    }

    if (uploadedImages.length === 0) {
      throw new Error('所有图片上传失败，请检查 Token 是否有效')
    }

    // 第二步：读取并更新 photos/index.md
    progressText.value = '正在更新相册数据...'
    progressPercent.value = 75

    // 获取当前 photos/index.md 的内容和 SHA
    const mdRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PHOTOS_MD_PATH}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${token}` } }
    )
    if (!mdRes.ok) throw new Error('读取 photos/index.md 失败')
    const mdData = await mdRes.json()
    // 正确解码 Base64 → UTF-8（支持中文）
const base64 = mdData.content.replace(/\n/g, '')
const binary = atob(base64)
const bytes = new Uint8Array(binary.length)
for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
const currentContent = new TextDecoder('utf-8').decode(bytes)
    const fileSha = mdData.sha

    // 在 photos 数组末尾（// 在这里继续添加 之前）插入新图片
    const newEntries = uploadedImages.map(img =>
      `  {\n    src: '${img.src}',\n    caption: '${img.caption}',\n    date: '${img.date}',\n    alt: '${img.alt}'\n  },`
    ).join('\n')

    const insertMarker = '  // 在这里继续添加更多图片，格式如下：'
    let newContent
    if (currentContent.includes(insertMarker)) {
      newContent = currentContent.replace(
        insertMarker,
        `${newEntries}\n${insertMarker}`
      )
    } else {
      // 兜底：在数组闭合 ] 前插入
      newContent = currentContent.replace(
        /(\n\][\s\S]*?const songs)/,
        `\n${newEntries}\n]$1`
      )
    }

    progressPercent.value = 85
    progressText.value = '正在提交更改...'

    // 提交 photos/index.md
    const updateRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PHOTOS_MD_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `📷 新增 ${uploadedImages.length} 张照片`,
          // 正确编码 UTF-8 → Base64（支持中文）
content: (() => {
  const bytes = new TextEncoder().encode(newContent)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
})(),
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

    uploadResult.value = {
      type: 'success',
      message: `✅ 成功上传 ${uploadedImages.length} 张照片！GitHub Actions 将在 1~2 分钟内自动部署更新。`
    }

    // 3 秒后关闭弹窗
    setTimeout(() => {
      closeUploadModal()
    }, 3000)

  } catch (err) {
    uploadResult.value = {
      type: 'error',
      message: `❌ 上传失败：${err.message}`
    }
    console.error('上传错误:', err)
  } finally {
    uploading.value = false
  }
}

const closeUploadModal = () => {
  if (uploading.value) return
  showUploadModal.value = false
  previewFiles.value = []
  caption.value = ''
  photoDate.value = new Date().toISOString().slice(0, 7)
  selectedCategory.value = ''
  isNewCategory.value = false
  newCategoryName.value = ''
  uploadResult.value = null
  progressPercent.value = 0
  progressText.value = ''
}
</script>

<style scoped>
/* ===== 触发按钮 ===== */
.lock-trigger,
.upload-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.lock-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--vp-c-text-2);
}

.lock-btn:hover {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

.upload-fab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #ff6eb4);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.upload-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
  max-width: 420px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.upload-modal {
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.modal-icon {
  font-size: 20px;
}

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

.modal-close:hover {
  background: var(--vp-c-bg-mute);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== 密码输入 ===== */
.modal-tip {
  color: var(--vp-c-text-2);
  font-size: 13px;
  margin: 0 0 4px;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pwd-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.pwd-input:focus {
  border-color: var(--vp-c-brand-1);
}

.pwd-input.error {
  border-color: #f56c6c;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.toggle-pwd {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-msg {
  color: #f56c6c;
  font-size: 12px;
  margin: 0;
}

/* ===== Token 配置 ===== */
.token-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.token-input {
  padding: 10px 14px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  outline: none;
  font-family: monospace;
}

.token-input:focus {
  border-color: var(--vp-c-brand-1);
}

.token-tip {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin: 0;
}

.btn-save-token {
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-start;
}

.btn-save-token:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-reset-token {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  align-self: flex-start;
}

/* ===== 拖拽上传区 ===== */
.drop-zone {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.drop-zone.has-files {
  padding: 16px;
}

.drop-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.drop-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.drop-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}

.hidden-input {
  display: none;
}

/* ===== 预览网格 ===== */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--vp-c-divider);
  transition: border-color 0.2s;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item.done {
  border-color: #67c23a;
}

.preview-item.error {
  border-color: #f56c6c;
}

.preview-item.uploading {
  opacity: 0.7;
}

.preview-status {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 14px;
  line-height: 1;
}

.remove-file {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-more {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px dashed var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.2s;
}

.add-more:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ===== 图片信息 ===== */
.photo-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.meta-input {
  padding: 9px 12px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.meta-input:focus {
  border-color: var(--vp-c-brand-1);
}

/* ===== 分类选择器 ===== */
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cat-chip {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.cat-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cat-chip.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.cat-chip.new-cat {
  border-style: dashed;
}

.new-cat-input {
  padding: 8px 12px;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  outline: none;
  margin-top: 4px;
}

/* ===== 进度条 ===== */
.upload-progress {
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
  background: linear-gradient(90deg, var(--vp-c-brand-1), #ff6eb4);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* ===== 上传结果 ===== */
.upload-result {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.upload-result.success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.upload-result.error {
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

.btn-cancel:hover {
  background: var(--vp-c-bg-soft);
}

.btn-confirm {
  padding: 9px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #ff6eb4);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ===== 弹窗动画 ===== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}

.modal-enter-from .modal-box {
  transform: translateY(20px) scale(0.96);
}

.modal-leave-to .modal-box {
  transform: translateY(10px) scale(0.96);
}

/* ===== 暗色模式适配 ===== */
.dark .upload-result.success {
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.3);
}

.dark .upload-result.error {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}
</style>
