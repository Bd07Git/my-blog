# img 的加载：onload、complete、decode()

`img` 元素的图片加载过程涉及几个容易混淆但非常实用的 API，几乎每个前端都会在某个时刻踩坑。

## 1. `complete` 属性

`img.complete` 是一个**只读布尔值**，表示图片是否已经加载完成。

```js
const img = document.querySelector('img')
console.log(img.complete) // true / false
```

**为 `true` 的条件**（满足任意一个）：
- 没有设置 `src` 属性
- `src` 为空字符串
- 图片资源已完全下载并解码完成
- 图片加载失败（注意！加载失败也是 `true`）

**常见踩坑**：

```js
// ❌ 错误：页面刚加载，图片还没加载完，complete 是 false
window.onload = () => {} // 太晚了
document.addEventListener('DOMContentLoaded', () => {
  const img = document.querySelector('img')
  console.log(img.complete) // 可能还是 false！
})

// ✅ 正确：先判断 complete，再决定要不要监听 onload
function waitForImage(img) {
  return new Promise((resolve, reject) => {
    if (img.complete) {
      img.naturalWidth === 0 ? reject() : resolve()
      return
    }
    img.onload = resolve
    img.onerror = reject
  })
}
```

> **注意**：`complete` 为 `true` 但 `naturalWidth === 0`，说明图片加载失败了。

---

## 2. `onload` 事件

图片**成功加载完成**后触发，此时可以安全读取图片尺寸。

```js
const img = new Image()
img.onload = () => {
  console.log(img.naturalWidth, img.naturalHeight) // 真实宽高
}
img.onerror = () => {
  console.log('图片加载失败')
}
img.src = 'photo.jpg'
```

**经典踩坑：先赋值 src 再绑定 onload**

```js
// ❌ 危险写法：如果图片已缓存，onload 在赋值 src 时就触发了，
// 此时 onload 还没绑上，事件丢失！
const img = new Image()
img.src = 'photo.jpg'  // 可能立刻触发
img.onload = () => {}  // 太晚了，错过了

// ✅ 正确写法：先绑事件，再赋值 src
const img = new Image()
img.onload = () => {}
img.src = 'photo.jpg'
```

**与 `window.onload` 的区别**：

| | `img.onload` | `window.onload` |
|--|--|--|
| 触发时机 | 单张图片加载完成 | 页面所有资源（含所有图片）加载完成 |
| 用途 | 监听某张图片 | 页面整体加载完毕 |

---

## 3. `decode()` 方法

`img.decode()` 返回一个 **Promise**，在图片**解码完成**（可以安全渲染到画面）后 resolve。

```js
const img = new Image()
img.src = 'large-photo.jpg'

img.decode().then(() => {
  document.body.appendChild(img) // 插入时不会导致页面卡顿/闪烁
}).catch(() => {
  console.log('解码失败或图片不存在')
})

// async/await 写法
async function loadImage(src) {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}
```

**和 `onload` 的区别**：

| | `onload` | `decode()` |
|--|--|--|
| 触发时机 | 图片数据下载完成 | 图片数据下载 **且解码** 完成 |
| 返回值 | 事件回调 | Promise |
| 场景 | 需要读取尺寸 | 需要插入 DOM 不卡顿 |

**为什么需要 `decode()`？**

浏览器下载图片后，还需要将压缩格式（JPEG/PNG）解码成位图才能渲染。大图解码可能阻塞主线程导致页面卡顿。`decode()` 会在后台线程完成解码，resolve 后插入 DOM 就是零延迟渲染。

---

## 4. 三者的完整使用场景

### 场景一：判断图片是否加载完（兼容缓存）

```js
function isImageLoaded(img) {
  // complete 为 true 且 naturalWidth > 0，才是真正加载成功
  return img.complete && img.naturalWidth > 0
}

function onImageReady(img, callback) {
  if (isImageLoaded(img)) {
    callback()  // 已缓存，直接执行
  } else {
    img.addEventListener('load', callback, { once: true })
  }
}
```

### 场景二：预加载图片列表

```js
function preloadImages(urls) {
  return Promise.all(
    urls.map(url => {
      const img = new Image()
      img.src = url
      return img.decode().catch(() => null) // 单张失败不影响整体
    })
  )
}

await preloadImages(['/photo1.jpg', '/photo2.jpg', '/photo3.jpg'])
console.log('所有图片加载完毕，可以展示了')
```

### 场景三：懒加载图片无闪烁插入

```js
async function lazyLoad(container, src) {
  const img = new Image()
  img.src = src
  try {
    await img.decode()
    container.appendChild(img) // 解码完再插入，不闪烁
  } catch {
    container.innerHTML = '<span>图片加载失败</span>'
  }
}
```

---

## 总结

| API | 类型 | 触发条件 | 主要用途 |
|-----|------|----------|----------|
| `img.complete` | 属性（布尔） | 同步读取 | 判断是否已加载（注意失败也为 true） |
| `img.onload` | 事件 | 下载完成 | 获取图片尺寸、监听单张图片 |
| `img.onerror` | 事件 | 加载失败 | 错误处理、替换占位图 |
| `img.decode()` | Promise | 下载 + 解码完成 | 大图无闪烁插入 DOM |
| `img.naturalWidth/Height` | 属性 | 加载后可用 | 获取图片真实尺寸 |
