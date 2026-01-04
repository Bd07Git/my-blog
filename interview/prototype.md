# 原型与原型链

在 JavaScript 中，原型和原型链是实现继承和对象共享属性的核心机制。

## 1. 基本概念

### 原型 (Prototype)
- **每个函数**都有一个 `prototype` 属性，它指向一个对象，这个对象被称为**原型对象**。
- 原型对象包含可以由该特定类型的所有实例共享的属性和方法。

### 原型隐式引用 (`__proto__`)
- **每个对象**（除了 `null`）都有一个内部属性 `[[Prototype]]`，在浏览器中通常通过 `__proto__` 访问。
- 它指向创建该对象的构造函数的 `prototype`。

### 构造函数 (Constructor)
- 原型对象默认有一个 `constructor` 属性，指向关联的构造函数。

<div class="custom-box">
    实例对象的隐式原型指向其构造函数的原型对象。
</div>

```javascript
function Person(name) {
  this.name = name;
}
const p = new Person('Alice');

console.log(p.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true
```

## 2. 原型链 (Prototype Chain)

当访问一个对象的属性时，JavaScript 引擎会执行以下步骤：
1. 先在对象**自身**寻找该属性。
2. 如果找不到，则通过 `__proto__` 找到它的**原型对象**寻找。
3. 如果还找不到，就继续沿着 `__proto__` 向上寻找，直到找到 `Object.prototype`。
4. 如果到 `Object.prototype` 还没找到，则返回 `undefined`（因为 `Object.prototype.__proto__ === null`）。

这种链式结构就称为**原型链**。

### 原型链结构图

<div class="custom-box">
  <span class="title">Prototype Chain</span>
  <div class="content">
    <pre style="background: transparent; padding: 0; margin: 0; color: inherit;">
p (实例) 
  └── <b>__proto__</b> ──▶ Person.prototype
                    └── <b>__proto__</b> ──▶ Object.prototype
                                      └── <b>__proto__</b> ──▶ null

Person (构造函数)
  └── <b>prototype</b> ──▶ Person.prototype
                    └── <b>constructor</b> ──▶ Person
    </pre>
  </div>
</div>

## 3. 核心 API

- `Object.getPrototypeOf(obj)`: 获取对象的原型（推荐替代 `__proto__`）。
- `Object.create(proto)`: 创建一个新对象，并将其原型设置为指定的对象。
- `isPrototypeOf()`: 检查一个对象是否存在于另一个对象的原型链中。

## 4. 面试常考点

### `instanceof` 的原理
`instanceof` 用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。

```javascript
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left);
  let prototype = right.prototype;
  while (true) {
    if (!proto) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}
```

### 为什么需要原型？
1. **属性共享**：不需要在每个实例上都创建相同的方法，节省内存。
2. **实现继承**：通过原型链可以方便地实现对象间的继承关系。

### `Object.create(null)` 有什么作用？
创建一个没有任何原型的对象（没有 `__proto__`，也没有 `toString` 等方法）。常用于创建纯粹的数据字典，避免原型污染。