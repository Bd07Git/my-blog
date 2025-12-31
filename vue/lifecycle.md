<style>
table th:nth-child(1) { /* 针对第 1 列：描述 */
  width: 100px;
}
</style>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 建议稍微延迟一下，确保 VitePress 的样式渲染完成
  setTimeout(() => {
    const firstCell = document.querySelector('.vp-doc table th:first-child')
    if (firstCell) {
      const width = firstCell.getBoundingClientRect().width
      console.log('第一列实际渲染宽度为: ' + width + 'px')
      // 你也可以在这里把宽度存入 ref 变量供页面使用
    }
  }, 100)
})
</script>
# 生命周期

Vue 组件的生命周期是指从组件创建到销毁的过程。

## 生命周期钩子

| 序号 | 生命周期 | 描述 |
| :--- | :--- | :--- |
| 1 | `beforeCreate` 创建前 | vue 实例初始化阶段，不可以访问 data,methods；此时打印出的 this 是 undefined； |
| 2 | `created` 创建后 | vue 实例初始化完成，可以访问 data, methods，但是节点尚未挂载，不能获取 dom 节点； |
| 3 | `beforeMount` 挂载前 | 实际上与 created 阶段类似，同样的节点尚未挂载，此时模板已经编译完成，但还没有被渲染至页面中（即为虚拟 dom 加载为真实 dom）注意的是这是在视图渲染前最后一次可以更改数据的机会，不会触发其他的钩子函数； |
| 4 | `mounted` 挂载完成 | 这个阶段说明模板已经被渲染成真实 DOM，实例已经被完全创建好了； |
| 5 | `beforeUpdate` 更新前 | data 里面的数据改动会触发 vue 的响应式数据更新，也就是对比真实 dom 进行渲染的过程； |
| 6 | `updated` 更新完成 | data 中的数据更新完成，dom 节点替换完成； |
| 7 | `activated` | 在组件被激活时调用（使用了 `<keep-alive>` 的情况下）； |
| 8 | `deactivated` | 在组件被销毁时调用（使用了 `<keep-alive>` 的情况下）； |
| 9 | `beforeDestroy` 销毁前 | 销毁前执行（$destroy 方法被调用的时候就会执行），一般在这里善后：清除计时器、监听等； |
| 10 | `destroyed` 销毁后 | 销毁后（Dom 元素存在，只是不再受 vue 控制），卸载 watcher，事件监听，子组件； |

## 父子组件生命周期执行顺序

```js
->父beforeCreate
->父created
->父beforeMount
->子beforeCreate
->子created
->子beforeMount
->子mounted
->父mounted