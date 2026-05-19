# NPM 入门知识：命令、依赖与脚本核心

> 原文：[【NPM 笔记（一）】NPM 入门知识：命令、依赖与脚本核心](https://juejin.cn/post/7531669753774309418)，作者：叶叶子

## npm 介绍

npm 是前端项目和 Node.js 项目的包管理工具，从项目开发到更新维护都发挥着重要作用。

- **下载依赖**：下载、卸载、更新项目所需的第三方依赖包，并管理依赖版本（如锁定版本、处理冲突）。
- **执行脚本**：执行项目中预定义的脚本命令（如 `package.json` 中 `scripts` 配置），方便项目启动、打包构建等操作。
- **发布包**：将自己开发的第三方依赖包发布到 npm 仓库，供其他开发者使用和维护。

---

## npm 命令

### 初始化项目

```bash
# 交互式逐步填写项目信息（name、version、description 等）
npm init

# 跳过所有问题，使用默认值快速生成 package.json
npm init -y
```

执行后会在当前目录生成 `package.json`，这是 npm 项目的核心配置文件，记录项目名称、版本、依赖、脚本等信息。

### 安装项目所有依赖包

```bash
# 方式一（完整写法）
npm install
# 方式二（简写）
npm i
```

执行 `npm install` 时：

**存在 `package-lock.json`**：
1. 严格按照其中锁定的**精确版本**安装依赖（如 `vue@2.6.12`）
2. **无视** `package.json` 中的版本范围符号（如 `^`、`~`）
3. 即使远程仓库有更新版本，只要 `package-lock.json` 未修改，就不会安装新版本

**不存在 `package-lock.json`**：
1. 根据 `package.json` 中的**版本范围**安装最新可用版本（如 `vue: "^2.6.12"` 会安装 `vue@2.7.16`）
2. 自动生成新的 `package-lock.json`，锁定当前安装的版本
3. **不会修改** `package.json` 中的版本声明（仍保留 `vue: "^2.6.12"`）

### 安装依赖包

执行 `npm install <package>` 时，**无论是否存在 `package-lock.json`**，npm 都会：

1. 根据 `package.json` 中的**版本范围**安装最新可用版本。
2. 更新 `package.json` 和 `package-lock.json` 中的版本记录。

```bash
npm install vue
# 简写
npm i vue
```

#### 安装生产依赖（dependencies）

用于生产环境，最终会打包进产物。

```bash
npm install vue          # 默认
npm install vue --save   # 完整写法
npm install vue -S       # 简写
```

```json
{
  "dependencies": {
    "vue": "^2.7.16"
  }
}
```

#### 安装开发依赖（devDependencies）

仅用于开发阶段（编译、测试、打包工具等），不会随应用发布。

```bash
npm install webpack --save-dev
npm install webpack -D   # 简写
```

```json
{
  "devDependencies": {
    "webpack": "^5.88.2"
  }
}
```

#### 补充说明

`dependencies` 与 `devDependencies` 的划分只是一种**语义约定**，并不强制决定哪些包最终会被打包到产物中。

决定打包结果的核心因素：
- 是否在项目代码中被直接引用（通过 `import` 或 `require` 引入）
- 是否被构建工具通过 `external` 配置排除

### 卸载依赖包

```bash
npm uninstall vue
npm r vue        # 简写
npm remove vue   # 别名
```

执行后会：
1. 移除 `node_modules` 中的依赖包
2. 在 `package.json` 的 `dependencies` 或 `devDependencies` 中移除对应记录

### 执行脚本

```bash
# 执行 package.json 中 scripts 定义的命令
npm run dev
npm run build
npm run test

# 查看当前项目所有可用脚本
npm run
```

`start`、`test`、`stop`、`restart` 是 npm 内置脚本名，可以省略 `run` 直接执行：

```bash
npm start    # 等同于 npm run start
npm test     # 等同于 npm run test
npm stop     # 等同于 npm run stop
npm restart  # 等同于 npm run restart
```

除此之外，其他所有自定义脚本（如 `dev`、`build`、`lint`）都**必须加 `run`**：

```bash
npm run dev    # ✅ 正确
npm dev        # ❌ 报错：Unknown command "dev"

npm run build  # ✅ 正确
npm build      # ❌ 报错
```

> **为什么这四个能省略？** 因为它们是 npm 在设计时就内置的生命周期钩子命令，npm 对这几个名称有特殊处理。`start` 还有一个默认行为：如果 `package.json` 里没有定义 `start` 脚本，npm 会自动执行 `node server.js`。

### 更新依赖包

```bash
# 更新所有依赖到 package.json 版本范围内的最新版本
npm update

# 更新指定包
npm update vue
```

> **注意**：`npm update` 只会更新到 `package.json` 版本范围内的最新版（如 `"^2.6.12"` 只会更新到 `2.x.x` 的最新版，不会跨大版本升级）。若要跨大版本升级，需手动修改 `package.json` 或使用 `npm install vue@latest`。

### 查看已安装的包

```bash
# 查看当前项目的所有包（树形结构，含子依赖）
npm list

# 只看直接依赖（不展开子依赖，更清晰）
npm list --depth=0

# 查看全局安装的包
npm list -g --depth=0
```

输出示例：

```
my-project@1.0.0
├── vue@3.5.18
└── vite@5.2.0
```

### 清理缓存

```bash
# 清除 npm 本地缓存
npm cache clean --force
```

缓存目录默认在 `~/.npm`，遇到以下情况可以尝试清缓存：
- `npm install` 报奇怪的错误
- 安装的包版本不符合预期
- 安装过程卡住不动

> **注意**：必须加 `--force`，否则 npm 会拒绝执行并提示"需要强制清理"。清缓存不会影响已安装到 `node_modules` 的包，下次 `npm install` 时会重新从远程下载。

### 其他常用命令

```bash
# 查看 npm 配置
npm config list

# 查看包的基本信息
npm info vue

# 检查项目包是否过期（列出 Current / Wanted / Latest 三列版本）
npm outdated
```

---

## npm 的不足

### 占用空间

多个项目的 `node_modules` 中的依赖包是独立存储的，导致同一版本、同一名称的依赖包会在磁盘的不同位置重复出现，极大浪费磁盘空间。

### 幽灵依赖

```json
{
  "dependencies": {
    "vue": "^3.5.18"
  }
}
```

```js
import { nanoid } from 'nanoid'  // ← 项目中没有声明这个依赖！
console.log(nanoid())
```

`nanoid` 并非项目在 `package.json` 中直接声明的依赖，而是 `vue` 内部依赖的包。由于 npm 会将所有依赖（包括子依赖）尽可能"提升"到 `node_modules` 顶层（扁平化处理），项目代码中可以直接引入并使用它。

**隐患**：
- 若 `vue` 后续升级时移除了对 `nanoid` 的依赖，项目中直接使用 `nanoid` 的代码会突然报错（依赖断裂）
- 项目依赖关系不透明，开发者难以从 `package.json` 中清晰判断哪些包是"真正被依赖"的

---

## npm 开发脚手架

### 创建全局模块软链接（npm link）

`npm link` 是 npm 提供的用于**本地模块开发与调试**的工具，允许你在不发布到 npm 仓库的情况下，将本地开发的模块实时应用到其他项目中。

**使用步骤**：

1. 创建项目并配置 `package.json`：

```json
{
  "name": "a-p-dev",
  "bin": {
    "a-p-dev": "bin/index.js"
  },
  "main": "bin/index.js"
}
```

2. 在项目目录中执行：

```bash
npm link
```

- 在全局 `node_modules` 目录下创建一个指向当前项目的软链接
- 若 `package.json` 中存在 `bin` 字段，npm 会自动在全局 `nodejs` 目录创建可执行文件
  - Windows：`a-p-dev.cmd`、`a-p-dev.ps1`
  - Linux/macOS：`a-p-dev`（符号链接）

3. 在任意目录执行 `a-p-dev`，即可触发本地项目中 `bin/index.js` 的执行。

> **关键特性**：软链接指向本地真实路径，原项目代码修改后**无需重新执行 `npm link`**，全局引用会实时同步最新代码。

### 解除全局模块软链接

```bash
npm unlink a-p-dev -g
```

- 删除全局 `node_modules` 目录下的软链接目录
- 删除全局 `nodejs` 目录下的可执行文件

---

## npm 执行命令

### 三种执行本地 .bin 工具的方式

当使用 `npm install` 安装带有命令行工具的依赖包（如 `less`、`eslint`）时，这些工具会被安装到项目的 `node_modules/.bin` 目录中。

#### 方式一：进入 .bin 目录执行（了解即可）

```bash
cd ./node_modules/.bin
lessc -v
```

#### 方式二：npx 指令（推荐）

```bash
npx lessc -v
```

**核心特点**：
- **自动路径查找**：优先检索项目 `node_modules/.bin`，无需手动指定路径
- **临时安装能力**：若本地未安装目标命令，`npx` 会临时下载并执行，执行结束后自动清理
- **版本隔离**：确保使用的是当前项目依赖的版本，而非全局版本

#### 方式三：添加 scripts 脚本

```json
{
  "scripts": {
    "less-version": "lessc -v"
  }
}
```

```bash
npm run less-version
```

**特点**：
- **简化调用**：将长命令封装为简短脚本（如 `npm run build`）
- **自动路径解析**：`npm run` 会自动从 `node_modules/.bin` 中查找可执行文件
- **支持命令组合**：可串联多个命令（如 `"build": "lessc src/style.less dist/style.css && uglifyjs src/index.js -o dist/index.min.js"`）

---

## NPM 发布第三方包

1. 创建基础项目（初始化 `package.json`）

2. 注册 npm 账号：[https://www.npmjs.com/signup](https://www.npmjs.com/signup)

3. 切换到官方镜像：

```bash
# 推荐（需提前安装 nrm）
nrm use npm
# 或直接配置
npm config set registry https://registry.npmjs.org
```

4. 登录：

```bash
npm login
# 依次输入用户名、密码、邮箱、一次性验证码
npm whoami  # 确认登录成功
```

5. 发布：

```bash
npm publish  # 在根目录执行
```

6. 测试：

```bash
npm i yeizi
```

```js
import yeizi from 'yeizi'
yeizi() // 就算失败，我也想知道，自己倒在距离终点多远的地方。
```

### 避坑指南

- **镜像源必须切换**：发布前务必切回官方源，否则会发布到非官方仓库（如淘宝源）导致失败
- **版本号手动维护**：更新包功能后，需手动修改 `package.json` 中的 `version` 字段，否则无法重复发布
- **包名冲突检查**：发布前在 [npm 官网](https://www.npmjs.com/) 搜索包名，确保未被占用

---

## 疑难问题

### `npm create vite` 实际做了什么？

1. 尝试执行 `npx @npmcli/create-vite`（官方脚手架前缀）
2. 由于 `@npmcli/create-vite` 不存在，回退到 `npx create-vite`

```bash
# 交互式选择模板
npm create vite my-app

# 直接指定模板（非交互式）
npm create vite my-app -- --template react
```

> `--` 的作用是**划清界限**：让前半部分命令只处理自己的选项，后半部分参数原封不动地传递给被调用的程序，避免歧义或错误解析。在需要向嵌套命令传参时几乎都需要用到 `--`。
