---
layout: page
---

<script setup>
const photos = [
  {
    src: '/my-blog/qingqing1.jpg',
    caption: 'ð æµ·è¾¹',
    date: '2026-04',
    alt: 'é£æ¯'
  },
  {
    src: '/my-blog/qingqing4.jpg',
    caption: 'ð æµ·è¾¹',
    date: '2026-04',
    alt: 'é£æ¯'
  },
  {
    src: '/my-blog/qingqing3.jpg',
    caption: 'âï¸ ç¬¬ä¸æ¬¡ä¼æ¤',
    date: '2026-02',
    alt: 'åç§'
  },
    {
    src: '/my-blog/qingqing2.jpg',
    caption: 'ð åæ¬¡ä¼æ¤',
    date: '2026-03',
    alt: 'åç§'
  },
    {
    src: '/my-blog/qingqing5.jpg',
    caption: 'again ç¬¬ä¸æ¬¡',
    date: '2026-04',
    alt: 'åç§'
  },
   {
    src: '/my-blog/qingqing6.jpg',
    caption: 'again ç¬¬ä¸æ¬¡',
    date: '2026-04',
    alt: 'åç§'
  },
  {
    src: '/my-blog/photo_1776614351689_0.png',
    caption: '招笑',
    date: '2026-04',
    alt: '合照'
  },
]

const songs = [
  // å¡«åä½ çæ­æ²åè¡¨ï¼æ ¼å¼å¦ä¸ï¼
  // {
  //   name: 'æ­æ²åç§°',
  //   artist: 'æ­æå',
  //   src: '/my-blog/music/song.mp3'
  // },
  {
    name: 'ç¤ºä¾æ­æ²ï¼è¯·æ¿æ¢ï¼',
    artist: 'è¯·ä¸ä¼  mp3 å° public/music/ ç®å½',
    src: ''
  }
]
</script>

<PhotoGallery
  :photos="photos"
  title="ð· æçç¸å"
  description="è®°å½çæ´»ä¸­çæ¯ä¸ä¸ªç¾å¥½ç¬é´"
  :columns="3"
/>

<BGMPlayer :songs="songs" :autoplay="false" />
