---
layout: page
---

<script setup>
const photos = [
  {
    src: '/my-blog/qingqing1.jpg',
    caption: 'Ã°ÂÂÂ Ã¦ÂµÂ·Ã¨Â¾Â¹',
    date: '2026-04',
    alt: 'Ã©Â£ÂÃ¦ÂÂ¯'
  },
  {
    src: '/my-blog/qingqing4.jpg',
    caption: 'Ã°ÂÂÂ Ã¦ÂµÂ·Ã¨Â¾Â¹',
    date: '2026-04',
    alt: 'Ã©Â£ÂÃ¦ÂÂ¯'
  },
  {
    src: '/my-blog/qingqing3.jpg',
    caption: 'Ã¢ÂÂÃ¯Â¸Â Ã§Â¬Â¬Ã¤Â¸ÂÃ¦Â¬Â¡Ã¤Â¼ÂÃ¦ÂÂ¤',
    date: '2026-02',
    alt: 'Ã¥ÂÂÃ§ÂÂ§'
  },
    {
    src: '/my-blog/qingqing2.jpg',
    caption: 'Ã°ÂÂÂ Ã¥ÂÂÃ¦Â¬Â¡Ã¤Â¼ÂÃ¦ÂÂ¤',
    date: '2026-03',
    alt: 'Ã¥ÂÂÃ§ÂÂ§'
  },
    {
    src: '/my-blog/qingqing5.jpg',
    caption: 'again Ã§Â¬Â¬Ã¤Â¸ÂÃ¦Â¬Â¡',
    date: '2026-04',
    alt: 'Ã¥ÂÂÃ§ÂÂ§'
  },
   {
    src: '/my-blog/qingqing6.jpg',
    caption: 'again Ã§Â¬Â¬Ã¤Â¸ÂÃ¦Â¬Â¡',
    date: '2026-04',
    alt: 'Ã¥ÂÂÃ§ÂÂ§'
  },
  {
    src: '/my-blog/photo_1776614351689_0.png',
    caption: 'æç¬',
    date: '2026-04',
    alt: 'åç§'
  },
  {
    src: '/my-blog/photo_1776676336342_0.jpg',
    caption: '摩天轮',
    date: '2026-04',
    alt: '景'
  },
]
]

const songs = [
  // Ã¥Â¡Â«Ã¥ÂÂÃ¤Â½Â Ã§ÂÂÃ¦Â­ÂÃ¦ÂÂ²Ã¥ÂÂÃ¨Â¡Â¨Ã¯Â¼ÂÃ¦Â Â¼Ã¥Â¼ÂÃ¥Â¦ÂÃ¤Â¸ÂÃ¯Â¼Â
  // {
  //   name: 'Ã¦Â­ÂÃ¦ÂÂ²Ã¥ÂÂÃ§Â§Â°',
  //   artist: 'Ã¦Â­ÂÃ¦ÂÂÃ¥ÂÂ',
  //   src: '/my-blog/music/song.mp3'
  // },
  {
    name: 'Ã§Â¤ÂºÃ¤Â¾ÂÃ¦Â­ÂÃ¦ÂÂ²Ã¯Â¼ÂÃ¨Â¯Â·Ã¦ÂÂ¿Ã¦ÂÂ¢Ã¯Â¼Â',
    artist: 'Ã¨Â¯Â·Ã¤Â¸ÂÃ¤Â¼Â  mp3 Ã¥ÂÂ° public/music/ Ã§ÂÂ®Ã¥Â½Â',
    src: ''
  }
]
</script>

<PhotoGallery
  :photos="photos"
  title="Ã°ÂÂÂ· Ã¦ÂÂÃ§ÂÂÃ§ÂÂ¸Ã¥ÂÂ"
  description="Ã¨Â®Â°Ã¥Â½ÂÃ§ÂÂÃ¦Â´Â»Ã¤Â¸Â­Ã§ÂÂÃ¦Â¯ÂÃ¤Â¸ÂÃ¤Â¸ÂªÃ§Â¾ÂÃ¥Â¥Â½Ã§ÂÂ¬Ã©ÂÂ´"
  :columns="3"
/>

<BGMPlayer :songs="songs" :autoplay="false" />
