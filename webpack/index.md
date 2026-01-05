# Webpack 基础与进阶

## 1. 什么是 Webpack？

Webpack 是一个现代 JavaScript 应用程序的**静态模块打包工具**。

当 Webpack 处理应用程序时，它会递归地构建一个**依赖关系图 (Dependency Graph)**，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 **bundle**。

### 核心概念
- **Entry (入口)**：指示 Webpack 应该使用哪个模块作为构建其内部依赖图的开始。
- **Output (输出)**：告诉 Webpack 在哪里输出它所创建的 bundle，以及如何命名这些文件。
- **Loader (加载器)**：让 Webpack 能够去处理那些非 JavaScript 文件（Webpack 自身只理解 JS 和 JSON）。
- **Plugin (插件)**：用于执行范围更广的任务，如打包优化、资源管理、环境变量注入等。
- **Mode (模式)**：通过选择 `development`, `production` 或 `none`，可以启用 Webpack 内置在相应环境下的优化。

---

## 2. 核心配置的作用

### Loader
Loader 用于对模块的源代码进行转换。例如，你可以使用 `babel-loader` 将 ES6 转换为 ES5，或者使用 `css-loader` 和 `style-loader` 来处理 CSS 文件。

```javascript
module.exports = {
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  }
};
```

### Plugin
插件可以解决 Loader 无法实现的其他事。例如 `HtmlWebpackPlugin` 可以自动生成 HTML 文件并引入打包后的 JS。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' })
  ]
};
```

---

## 3. 什么是 SourceMap？

**SourceMap** 是一种映射技术，它将编译、打包、压缩后的代码映射回**源代码**。

### 为什么需要它？
在开发过程中，我们编写的代码通常会经过压缩、混淆或转换（如 TS 转 JS）。如果代码报错，浏览器默认只会显示压缩后代码的错误位置（例如：`bundle.js:1:500`），这让调试变得极其困难。SourceMap 可以让浏览器直接定位到源代码的位置（例如：`src/index.ts:10:5`）。

### 如何配置？
在 Webpack 中，通过 `devtool` 属性进行配置。

```javascript
module.exports = {
  // 开发环境推荐：eval-cheap-module-source-map
  // 生产环境推荐：none 或 source-map (如果需要监控系统定位错误)
  devtool: 'source-map'
};
```

### 常用配置项对比
| 配置项 | 构建速度 | 调试友好度 | 说明 |
| :--- | :--- | :--- | :--- |
| `eval` | 极快 | 差 | 映射到生成的代码，不产生 .map 文件 |
| `source-map` | 最慢 | 最好 | 产生完整的 .map 文件 |
| `eval-source-map` | 慢 | 好 | 映射到源代码，但集成在 eval 中 |
| `cheap-module-source-map` | 较快 | 较好 | 只有行映射，不包含列映射，调试效率高 |

---

## 4. 总结建议
- **开发环境**：追求构建速度和较好的调试体验，建议使用 `eval-cheap-module-source-map`。
- **生产环境**：通常为了安全和包体积，建议设置为 `false` (none)，或者使用 `hidden-source-map` 配合错误监控系统。