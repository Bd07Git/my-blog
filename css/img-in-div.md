# div 里的 img 经典 CSS 问题

在一个 `div` 里使用 `img` 标签，看似简单，却藏着几个几乎每个前端都踩过的经典坑。

## 1. 底部神秘间隙（最经典）

```html
<div class="box">
  <img src="photo.jpg" />
</div>
```

`img` 下面会多出 **3-5px 的空白**，`div` 比图片高。

**原因**：`img` 是 `inline` 元素，默认 `vertical-align: baseline`，基线下方要留空间给字母的下行部分（如 g、y、p 的尾巴）。

**解决方案**（三选一）：

```css
/* 方案 1：改变对齐方式（推荐）*/
img { vertical-align: block; }
/* 或 */
img { vertical-align: bottom; }

/* 方案 2：改为块级元素 */
img { display: block; }

/* 方案 3：父元素设置 line-height */
.box { line-height: 0; }
```

---

## 2. 图片被拉伸 / 变形

```html
<div class="box" style="width: 200px; height: 200px;">
  <img src="photo.jpg" />
</div>
```

当容器是固定宽高，图片比例和容器不一致时，默认会被拉伸变形。

**解决方案**：

```css
/* 方案 1：object-fit 裁剪（推荐）*/
img {
  width: 100%;
  height: 100%;
  object-fit: cover;    /* 保持比例，裁剪多余部分 */
  /* object-fit: contain; 保持比例，留白 */
}

/* 方案 2：只限制一个方向 */
img {
  width: 100%;
  height: auto; /* 高度自适应，不变形 */
}
```

---

## 3. 图片宽度超出容器

父容器设了 `max-width` 或者宽度有限，但图片本身很宽，会溢出去。

**解决方案**：

```css
/* 全局加上这一条，一劳永逸 */
img {
  max-width: 100%;
  height: auto;
}
```

---

## 4. 图片之间有默认间距

多张 `img` 并排放，它们之间会有莫名其妙的 3-4px 间距。

```html
<div>
  <img src="a.jpg" />
  <img src="b.jpg" />
  <img src="c.jpg" />
</div>
```

**原因**：`img` 是 `inline` 元素，HTML 中换行符/空格会被渲染成一个空格。

**解决方案**：

```css
/* 方案 1：父元素 font-size 归 0 */
div { font-size: 0; }
img { font-size: 14px; } /* 如果 img 内部有文字需要恢复 */

/* 方案 2：改为 flex/grid 布局（推荐）*/
div {
  display: flex;
  gap: 8px;
}

/* 方案 3：float */
img { float: left; }
```

---

## 5. 加载失败时显示难看的破图标

图片加载失败时，浏览器默认显示一个丑陋的破图标。

**解决方案**：

```css
/* 隐藏破图标，用背景色占位 */
img {
  background-color: #f0f0f0;
}

/* 也可以用 onerror 替换为占位图 */
```

```html
<img src="photo.jpg" onerror="this.src='/placeholder.jpg'" />
```

---

## 总结对照表

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 底部 3-5px 间隙 | `inline` 元素基线对齐 | `display: block` 或 `vertical-align: bottom` |
| 图片变形 | 宽高固定但比例不一致 | `object-fit: cover` |
| 图片溢出容器 | 图片原始尺寸过大 | `max-width: 100%; height: auto` |
| 并排图片有间距 | `inline` 元素空白折叠 | `display: flex` 或 `font-size: 0` |
| 破图标难看 | 加载失败默认样式 | `onerror` 替换占位图 |
