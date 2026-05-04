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
  {
    src: '/my-blog/photo_1776697576609_0.jpg',
    caption: '海屿你',
    date: '2026-04',
    alt: '风景'
  },
  {
    src: '/my-blog/photo_1777003660459_0.jpg',
    caption: 'ai',
    date: '2026-04',
    alt: '千玺'
  },
  {
    src: '/my-blog/photo_1777037789108_0.png',
    caption: 'monica',
    date: '2026-04',
    alt: '千玺'
  },
  {
    src: '/my-blog/photo_1777041537483_0.jpg',
    caption: '不错不错',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777041543187_1.jpg',
    caption: '不错不错',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777041549493_2.jpg',
    caption: '不错不错',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777041555761_3.jpg',
    caption: '不错不错',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777041904404_0.jpg',
    caption: '绝美',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777426112207_0.jpg',
    caption: '典藏',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777426118091_1.jpg',
    caption: '典藏',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777426123557_2.jpg',
    caption: '典藏',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777873861098_0.jpeg',
    caption: '眯眯眼👀第一次拍与被拍都显得有些局促',
    date: '2026-05',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777874071073_0.jpeg',
    caption: '第一张他拍 p的我烦就这样吧我的表情跟照片的表情一样',
    date: '2026-03',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777875172238_0.jpeg',
    caption: '拍照的时候 在人群中只能看见你 耶✌️',
    date: '2026-03',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777875666365_0.jpeg',
    caption: '你留给我是背影 关于爱情只字不提🙈',
    date: '2026-03',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777876015240_0.jpeg',
    caption: '还是经典剪刀手✌️',
    date: '2026-03',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777876103650_0.jpeg',
    caption: '很喜欢在手机镜头前看你的微表情😉',
    date: '2026-03',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777879731674_0.jpeg',
    caption: '头发虽然梳成了大人的模样但是总是摆些奇奇怪怪的pose',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777885674279_0.jpeg',
    caption: '前方是未知 迎面是海风',
    date: '2026-04',
    alt: '合照'
  },
  {
    src: '/my-blog/photo_1777885899442_0.jpeg',
    caption: 'dreamboat🤭',
    date: '2026-04',
    alt: 'solo'
  },
  {
    src: '/my-blog/photo_1777904939427_0.png',
    caption: '测试删除',
    date: '2026-05',
    alt: '风景'
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
