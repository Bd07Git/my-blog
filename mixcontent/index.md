# 大杂烩

### 1. 如何进入到node交互式命令行
在终端输入 `node` 即可进入，输入后可以看到提示符 `>`。
比如我现在要读取一个json文件。
```
const fs = require('fs');
const data = fs.readFileSync('data.json', 'utf8');
console.log(JSON.parse(data));
```
值得一提的是，文件路径可以直接将文件本身拖拽到终端中，路径会自动识别到。


## 2. 退出node交互式命令行
在终端输入 `ctrl + c` 即可退出或者输入 .exit 回车退出。


## 3. 通过vite构建的typescirpt项目，默认只是编译，不会校验
举个例子, 假如在a.ts文件定义如下
``` js
interface Student {
    name: string
}

export const a:Student={
    name: 'jack',
    age: 15
}
```
在b.ts文件使用
``` js
import { a } from '/a.ts'
console.log(a.name)
```
虽然在a.ts文件中会有静态类型提示没有age属性，但是并不会报错。这个时候为了安全考虑,需要做校验，可以在package.json中配置类型检查。
比如 "build": "tsc --noEmit && vite build".  **noEmit**表示只进行类型检查不生成js文件

## 4.