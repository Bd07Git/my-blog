# CSR 与 SSR 的深度解析

在现代 Web 开发中，渲染方案的选择直接影响到应用的性能、SEO 和开发体验。本文将深入探讨客户端渲染（CSR）与服务端渲染（SSR）的区别。

---

在开始之前，我们先来回顾一下页面最基本的渲染流程是怎么样的？ 

| 浏览器通过请求得到一个 HTML 文本 |
| :--- |
| 渲染进程解析 HTML 文本，构建 DOM 树 |
| 浏览器解析 HTML 的同时，如果遇到内联样式或者样本样式，则下载并构建样式规则（style rules）。若遇到 JavaScript 脚本，则会下载并执行脚本 |
| DOM 树和样式规则构建完成之后，渲染进程将两者合并成渲染树（render tree） |
| 渲染进程开始对渲染树进行布局，生成布局树（layout tree） |
| 渲染进程对布局树进行绘制，生成绘制记录 |
| 渲染进程对布局树进行分层，分别栅格化每一层并得到合成帧 |
| 渲染进程将合成帧发送给 GPU 进程将图像绘制到页面中 |
可以看到，页面的渲染其实就是浏览器将HTML文本转化为页面帧的过程，下面我们再来看看刚刚提到的技术：

## 1.  客户端渲染
<div class="badge-box">
  <span class="custom-badge">CSR</span>
  <span class="badge-text">Client-Side Rendering</span>
</div>

如今我们大部分 WEB 应用都是使用 JavaScript 框架（Vue、React、Angular）进行页面渲染的，页面中的大部分DOM元素都是通过Javascript插入的。**也就是说，在执行 JavaScript 脚本之前，HTML 页面已经开始解析并且构建 DOM 树了，JavaScript 脚本只是动态的改变 DOM 树的结构，使得页面成为希望成为的样子，这种渲染方式叫动态渲染。**

客户端渲染是指浏览器在请求页面 URL 后，服务端直接返回一个空的静态 HTML 文件，**这个 HTML 文件需要再加载 JavaScript 脚本和 CSS 样式表，浏览器加载和执行这些文件去动态改变 DOM 树的结构，使页面渲染成用户所需要的界面，这种动态渲染的方式就是客户端渲染 （CSR）**

- **过程**：浏览器请求页面 -> 服务器返回一个几乎空的 HTML 和 JS 文件 -> 浏览器执行 JS -> JS 请求数据 -> JS 生成 DOM 并挂载。

- **举例**：HTML 文件初始只包含一个空的 div 元素 **（id为app）**，通过 JavaScript 中的 fetchData 函数模拟从服务器获取数据，然后动态创建 ul 和 li 元素，将数据渲染到页面上
```js
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSR Example</title>
</head>

<body>
    <div id="app"></div>
    <script>
        // 模拟从服务器获取数据
        function fetchData() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(['Item 1', 'Item 2', 'Item 3']);
                }, 1000);
            });
        }

        async function render() {
            const data = await fetchData();
            const app = document.getElementById('app');
            const ul = document.createElement('ul');
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            app.appendChild(ul);
        }

        render();
    </script>
</body>

</html>
```

**CSR返回资源参考**

源码中可以看到仅有一个id为app的div元素,其他均js和css资源需要加载。
![alt text](image-1.png)

### 优点
- 服务器压力小，页面切换流畅
- 局部刷新：无需每次都进行完整页面请求
- 懒加载：首次加载时可以只加载可视区域内的数据
- 丰富的站点交互
- 减轻服务器压力
- 前后端分离

### 缺点

- 不利于 SEO
- **首屏渲染慢**：需要等待 <span style="color: #1e80ff; background: #e8f3ff; padding: 2px 6px; border-radius: 4px;">JavaScript</span> 脚本文件加载完毕后才开始渲染页面

<div class="definition-box">
  <span class="title">SEO</span>
  <div class="content">
    SEO（Search Engine Optimization）：<b>搜索引擎优化</b>，利用搜索引擎的规则提高网站在有关搜索引擎内的自然排名。目的是让其在行业内占据领先地位，获得品牌收益。
  </div>
</div>


## 2.  服务端渲染

<div class="badge-box">
  <span class="custom-badge">SSR</span>
  <span class="badge-text">Server Side Rendering</span>
</div>

服务端渲染是指浏览器在请求页面 URL 时，服务端将我们需要显示的 HTML 文本组装好，并返回给浏览器，这个 HTML 文本被浏览器解析之后， **不需要经过 JavaScript 脚本的下载过程**，就能直接构建出我们所希望的 DOM 树并展示到页面中。这个服务端组装 HTML 的过程就叫做服务端渲染（SSR）

以下是一个使用 Node.js 和 Express 框架实现的简单 SSR 

```js
const express = require('express');
const app = express();

// 模拟数据
const data = ['Item A', 'Item B', 'Item C'];

// 定义路由
app.get('/', (req, res) => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSR Example</title>
</head>
<body>
    <ul>
`;
    data.forEach(item => {
        html += `<li>${item}</li>`;
    });
    html += `
    </ul>
</body>
</html>
`;
    res.send(html);
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

**SSR返回资源参考**

源码中可以看到完整的html内容都被返回了
![alt text](image.png)




## 3. 对比

### 渲染流程对比

| 阶段 | CSR (客户端渲染) | SSR (服务端渲染) |
| :--- | :--- | :--- |
| **1. 响应请求** | 服务器返回空的 HTML 骨架 | 服务器返回**包含完整内容**的 HTML |
| **2. 浏览器解析** | 构建空 DOM 树，显示白屏 | **构建完整 DOM 树，直接显示内容** |
| **3. 资源加载** | 下载并执行庞大的 JS 文件 | 下载 JS（仅用于交互绑定） |
| **4. 数据获取** | 浏览器端发起 API 请求获取数据 | 服务器端已预先获取并填入 HTML |
| **5. 最终呈现** | JS 执行完并生成 DOM 后才看到内容 | **解析 HTML 后瞬间看到内容** |
| **6. 交互激活** | 渲染完成后即可交互 | 需等待 JS 下载执行完成 (Hydration) |



### 详细对比
| 维度 | CSR (客户端渲染) | SSR (服务端渲染) |
| :--- | :--- | :--- |
| **渲染位置** | 浏览器端，JavaScript 在浏览器中动态创建 DOM 元素完成页面渲染。 | 服务器端，服务器生成完整 HTML 页面后发送给浏览器。 |
| **首屏加载速度** | 较慢（需下载执行 JS）再由 JavaScript 动态构建页面，期间页面可能空白 | **快**  服务器直接返回渲染好的 HTML 页面，浏览器可立即显示内容（直接显示 HTML） |
| **SEO (搜索引擎优化)** | **差**（爬虫难以抓取动态内容） | **好**（爬虫直接读取完整 HTML） |
| **服务器压力** | 小（渲染在客户端） | **大**（实时渲染每个请求） |
| **用户体验** | 初始白屏长，后续切换快 | 初始显示快，响应受服务器性能影响 |
| **开发成本** | 较低，逻辑集中在前端 | 较高，需处理同构代码 |


## 4. 实际案例演示

### 案例 A：企业级后台管理系统 (CSR)
- **场景**：公司内部使用的 ERP 系统。
- **需求**：不需要 SEO，交互极其复杂，数据实时性高。
- **表现**：用户登录后，页面显示 Loading。JS 异步请求 10 个报表接口，数据返回后动态绘制图表。虽然初次进入稍慢，但内部菜单切换无需刷新页面，体验极佳。

### 案例 B：新闻门户或个人博客 (SSR/SSG)
- **场景**：今日头条、知乎、或者VitePress 博客。
- **需求**：SEO 极其重要，希望用户从搜索引擎点击后能秒开页面。
- **表现**：服务器直接返回带有新闻标题 and 正文的 HTML。搜索引擎爬虫可以轻松索引内容，用户在弱网环境下也能快速看到文字内容。

---

## 5. 总结与建议
目前主流还是使用CSR多一点。
- **选择 CSR**：如果应用是工具类、后台管理系统、或者对 SEO 没有要求的私有应用。
- **选择 SSR**：如果应用是内容驱动型（博客、新闻、电商首页）、对 SEO 有强需求、或者追求极致的首屏打开速度。

> **提示**：现在的 VitePress 采用的是 **SSG (静态站点生成)**，它在构建时完成 SSR 的工作，既保证了 SEO 和速度，又在运行时具备 CSR 的流畅感，是目前内容类网站的最优解。