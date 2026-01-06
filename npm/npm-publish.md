## 如何发布一个npm包

本指南详细介绍了如何从零开始创建一个 TypeScript 工具库，并将其发布到美团内部私有仓库（mnpm）。

1. 环境准备
在开始之前，请确保您的 Shell（如 .zshrc）已配置好 mnpm 别名，并完成登录。

```sh
# 1. 登录 mnpm (SSO 授权)
mnpm login --auth-type=sso

# 2. 验证登录状态
mnpm whoami
```

2. 项目初始化
创建一个新文件夹并初始化工程环境。
```sh
# 创建并进入目录
mkdir math-utils && cd math-utils

# 初始化 package.json
mnpm init -y

# 安装开发依赖 (TypeScript 及 打包工具 tsup)
mnpm install typescript tsup -D

# 初始化 TypeScript 配置
npx tsc --init
```
![alt text](7a202de1-31fb-4d24-a30e-f122d6ce805d.png)

3. 核心代码开发
创建 src/index.ts 并编写您的功能逻辑。
```ts
// src/index.ts

/**
 * 计算两数之和
 * @param a 第一个加数
 * @param b 第二个加数
 * @returns 相加结果
 */
export const add = (a: number, b: number): number => {
  return a + b;
};
```

4. 配置 package.json (关键)
修改 package.json 以支持多格式产物输出（ESM 和 CommonJS）以及类型定义。

```json
{
  "name": "@fdfe/math-utils",
  "version": "1.0.0",
  "description": "两数之和工具库",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --watch --dts",
    "prepublishOnly": "mnpm run build"
  }
}
```

字段说明：
name: 必须以 @fdfe/ 开头（美团金融前端 Scope）。
main/module: 分别对应 Node.js 和 现代浏览器/构建工具的入口。
types: 提供 TypeScript 类型支持。
files: 限制发布到 npm 的文件，仅包含构建后的 dist 目录。
prepublishOnly: 发布钩子，确保发布前代码是最新的且构建成功。


5. 构建与发布
执行发布流程。
```bash
# 1. 本地构建测试 (可选)
mnpm run build

# 2. 执行发布
# 系统会自动触发 prepublishOnly 脚本进行构建
mnpm publish
```
![alt text](467f9f9a-f851-45a4-bde8-76a75679646d.png)
![alt text](2efa2272-67e1-4c7f-ac06-66d4cb21bad2.png)

6. 在其他项目中使用
发布成功后，即可在其他业务项目中安装使用。

```bash
# 安装
mnpm install @fdfe/math-utils


# 使用
import { add } from '@fdfe/math-utils';
console.log(add(10, 20)); // 30
```
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)


7. 常见问题
403 Forbidden: 检查包名是否已存在，或您是否有该 Scope (@fdfe) 的发布权限。
版本冲突: 每次发布必须修改 package.json 中的 version 字段。
类型丢失: 确保 tsup 命令带上了 --dts 参数。