<template>
  <div class="bgm-player" :class="{ expanded: isExpanded, playing: isPlaying }">
    <!-- 主按钮（唱片） -->
    <div class="bgm-disc" :class="{ 'waiting': !isPlaying && props.autoplay }" @click="toggleExpand" :title="isExpanded ? '收起' : '展开播放器'">
      <div class="disc-inner">
        <svg v-if="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
        </svg>
      </div>
      <!-- 旋转唱片纹路 -->
      <div class="disc-ring ring-1"></div>
      <div class="disc-ring ring-2"></div>
      <div class="disc-ring ring-3"></div>
    </div>

    <!-- 展开面板 -->
    <Transition name="panel">
      <div v-if="isExpanded" class="bgm-panel">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <div class="song-name">{{ currentSong.name }}</div>
          <div class="song-artist">{{ currentSong.artist }}</div>
        </div>

        <!-- 进度条 -->
        <div class="progress-bar" @click="seekTo">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="progress-time">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
          <button class="ctrl-btn" @click="prevSong" title="上一首">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn" @click="togglePlay">
            <svg v-if="!isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
            </svg>
          </button>
          <button class="ctrl-btn" @click="nextSong" title="下一首">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14l5.09 3.64-5.09 3.64v-7.28zM16 6h2v12h-2z"/>
            </svg>
          </button>
        </div>
        <!-- 音量控制行 -->
        <div class="volume-row">
          <button class="ctrl-btn ctrl-btn-sm" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
            <svg v-if="!isMuted" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <input 
            type="range" 
            class="volume-slider"
            min="0" max="1" step="0.05"
            v-model="volume"
            @input="onVolumeChange"
          />
        </div>

        <!-- 歌单列表 -->
        <div class="playlist" v-if="songs.length > 1">
          <div 
            v-for="(song, i) in songs" 
            :key="song.src"
            class="playlist-item"
            :class="{ active: i === currentIndex }"
            @click="playSong(i)"
          >
            <span class="pl-index">{{ i + 1 }}</span>
            <span class="pl-name">{{ song.name }}</span>
            <span class="pl-artist">{{ song.artist }}</span>
            <span class="pl-playing" v-if="i === currentIndex && isPlaying">♫</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 隐藏的 audio 元素 -->
    <audio
      ref="audioRef"
      :src="currentSong.src"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetaLoaded"
      @ended="nextSong"
      @error="onError"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  songs: {
    type: Array,
    default: () => []
    // 每项格式: { name, artist, src }
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

const audioRef = ref(null)
const isExpanded = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)

const currentSong = computed(() => props.songs[currentIndex.value] || { name: '暂无歌曲', artist: '', src: '' })
const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  // 展开时同步触发自动播放（利用用户交互解除浏览器限制）
  if (isExpanded.value && !isPlaying.value && props.autoplay && currentSong.value.src) {
    audioRef.value?.play().then(() => {
      isPlaying.value = true
    }).catch(() => {})
  }
}

const togglePlay = () => {
  if (!audioRef.value || !currentSong.value.src) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(() => {})
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

const playSong = (index) => {
  currentIndex.value = index
  isPlaying.value = true
  setTimeout(() => {
    if (audioRef.value) {
      audioRef.value.play().catch(() => {})
    }
  }, 100)
}

const prevSong = () => {
  currentIndex.value = (currentIndex.value - 1 + props.songs.length) % props.songs.length
  if (isPlaying.value) {
    setTimeout(() => audioRef.value?.play().catch(() => {}), 100)
  }
}

const nextSong = () => {
  currentIndex.value = (currentIndex.value + 1) % props.songs.length
  if (isPlaying.value) {
    setTimeout(() => audioRef.value?.play().catch(() => {}), 100)
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

const onMetaLoaded = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
    audioRef.value.volume = volume.value
  }
}

const onVolumeChange = () => {
  if (audioRef.value) audioRef.value.volume = volume.value
}

const onError = () => {
  isPlaying.value = false
}

const seekTo = (e) => {
  if (!audioRef.value || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  audioRef.value.currentTime = ratio * duration.value
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 「首次交互后自动播放」：监听用户第一次与页面的任意交互
const tryAutoplay = () => {
  if (!props.autoplay || !props.songs.length || !currentSong.value.src) return
  audioRef.value?.play().then(() => {
    isPlaying.value = true
    // 自动展开面板提示用户
    isExpanded.value = true
    setTimeout(() => { isExpanded.value = false }, 4000)
  }).catch(() => {})
}

const INTERACTION_EVENTS = ['click', 'touchstart', 'keydown', 'scroll']
let interactionBound = false

const onFirstInteraction = () => {
  if (isPlaying.value) return
  tryAutoplay()
  // 移除所有监听，只触发一次
  INTERACTION_EVENTS.forEach(e => window.removeEventListener(e, onFirstInteraction))
  interactionBound = false
}

onMounted(() => {
  if (!props.autoplay || !props.songs.length) return

  // 先尝试直接 autoplay（部分浏览器允许静音 / 用户已与站点交互过）
  setTimeout(() => {
    audioRef.value?.play().then(() => {
      isPlaying.value = true
      isExpanded.value = true
      setTimeout(() => { isExpanded.value = false }, 4000)
    }).catch(() => {
      // 被浏览器阻止，退而求其次：等用户首次交互后再播
      if (typeof window !== 'undefined') {
        INTERACTION_EVENTS.forEach(e => window.addEventListener(e, onFirstInteraction, { once: false, passive: true }))
        interactionBound = true
      }
    })
  }, 800)
})

onUnmounted(() => {
  audioRef.value?.pause()
  if (interactionBound && typeof window !== 'undefined') {
    INTERACTION_EVENTS.forEach(e => window.removeEventListener(e, onFirstInteraction))
  }
})
</script>

<style scoped>
.bgm-player {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  user-select: none;
}

/* 唱片主按钮 */
.bgm-disc {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #ff6eb4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.3s;
  overflow: hidden;
}

.bgm-disc:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
}

.playing .bgm-disc {
  animation: spin 4s linear infinite;
}

/* 等待用户交互时的脉冲提示 */
.bgm-disc.waiting {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(0,0,0,0.2), 0 0 0 0 rgba(255,110,180,0.5); }
  50% { box-shadow: 0 4px 16px rgba(0,0,0,0.2), 0 0 0 10px rgba(255,110,180,0); }
}

.disc-inner {
  position: relative;
  z-index: 3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
}

.disc-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
}

.ring-1 { inset: 6px; }
.ring-2 { inset: 12px; }
.ring-3 { inset: 18px; }

/* 展开面板 */
.bgm-panel {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 16px;
  width: 260px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
}

/* 歌曲信息 */
.song-info {
  text-align: center;
  margin-bottom: 12px;
}

.song-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}

/* 进度条 */
.progress-bar {
  cursor: pointer;
  margin-bottom: 12px;
}

.progress-track {
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), #ff6eb4);
  border-radius: 2px;
  transition: width 0.2s linear;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--vp-c-text-3);
}

/* 控制按钮 */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
}

.ctrl-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.play-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #ff6eb4);
  color: #fff;
}

.play-btn:hover {
  background: linear-gradient(135deg, #ff6eb4, var(--vp-c-brand-1));
  color: #fff;
  transform: scale(1.05);
}

/* 音量控制行 */
.volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.ctrl-btn-sm {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

/* 音量滑块 */
.volume-slider {
  flex: 1;
  height: 4px;
  flex-shrink: 0;
  appearance: none;
  background: var(--vp-c-divider);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
}

/* 播放列表 */
.playlist {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 10px;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 12px;
}

.playlist-item:hover {
  background: var(--vp-c-bg-soft);
}

.playlist-item.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.pl-index {
  color: var(--vp-c-text-3);
  min-width: 16px;
  text-align: center;
}

.pl-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.pl-artist {
  color: var(--vp-c-text-2);
  font-size: 11px;
  white-space: nowrap;
}

.pl-playing {
  color: var(--vp-c-brand-1);
  animation: bounce 0.8s ease infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

/* 面板过渡动画 */
.panel-enter-active, .panel-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.panel-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@media (max-width: 768px) {
  .bgm-player {
    bottom: 80px;
    right: 16px;
  }
  .bgm-panel {
    width: calc(100vw - 48px);
    max-width: 280px;
    min-width: 200px;
  }
  .controls {
    gap: 4px;
  }
  .volume-slider {
    width: 48px;
  }
}
</style>
