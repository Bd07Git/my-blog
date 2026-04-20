---
layout: page
---

<script setup>
const photos = [
  {
    src: '/my-blog/qingqing1.jpg',
    caption: '🌊 海边',
    date: '2026-04',
    alt: '风景'
  },
  {
    src: '/my-blog/qingqing4.jpg',
    caption: '🌊 海边',
    date: '2026-04',
    alt: '风景'
  },
  {
    src: '/my-blog/qingqing3.jpg',
    caption: '❄️ 第一次会晤',
    date: '2026-02',
    alt: '合照'
  },
  {
    src: '/my-blog/qingqing2.jpg',
    caption: '🍎 再次会晤',
    date: '2026-03',
    alt: '合照'
  },
  {
    src: '/my-blog/qingqing5.jpg',
    caption: 'again 第三次',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/qingqing6.jpg',
    caption: 'again 第三次',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1776676336342_0.jpg',
    caption: '摩天轮',
    date: '2026-04',
    alt: '景'
  },
  {
    src: '/my-blog/photo_1776682540670_0.jpg',
    caption: 'stop',
    date: '2026-04',
    alt: '合照'
  },
  // 在这里继续添加更多图片，格式如下：
  // {
  //   src: '/my-blog/your-image.jpg',
  //   caption: '图片说明',
  //   date: '2026-03',
  //   alt: '图片描述'
  // },
]

const songs = [
  // 填写你的歌曲列表，格式如下：
  // {
  //   name: '歌曲名称',
  //   artist: '歌手名',
  //   src: '/my-blog/music/song.mp3'
  // },
  {
    name: '示例歌曲（请替换）',
    artist: '请上传 mp3 到 public/music/ 目录',
    src: ''
  }
]
</script>

<PhotoGallery
  :photos="photos"
  title="📷 我的相册"
  description="记录生活中的每一个美好瞬间"
  :columns="3"
/>

<BGMPlayer :songs="songs" :autoplay="false" />
