---
title: "Vue3 플러그인"
excerpt: "Vue3에 플러그인 사용하기"

categories:
  - Vue
tags:
  - [vue, vue3, plugin]

permalink: /categories/vue/plugin/

toc: true
toc_sticky: true

date: 2023-07-06
last_modified_at: 2023-07-06
---

## Plugins

**플러그인**은 Vue에 전역 수준의 기능을 추가할 때 사용하는 기능이다.

***

### ✅ Plugin 활용

- ==app.component()== : 메서드를 사용해 전역 컴포넌트 등록할 때
- ==app.directive()== : 메서드를 사용해 커스텀 디렉티브 등록할 때
- ==app.provide()== : 앱 전체에 리소스(메서드 or 데이터)를 주입할 때
- 전역 애플리케이션 인스턴스에 속성 또는 메서드를 추가하고자 할 때 ==app.config.globalProperties==에 연결하여 추가할 수 있다.

### ✅ Plugin 작성

#### install() 메서드를 갖는 객체로 만들기

{% raw %}
```javascript
const objectPlugin = {
  install(app, options) {

  }
}
```
{% endraw %}

#### 설치 함수로 만들기

{% raw %}
```javascript
function fuctionPlugin(app, options) {

}
```
{% endraw %}

#### 작성한 플러그인 사용하기

==app.use()==메서드를 사용해 플러그인을 전역 수준의 기능으로 추가할 수 있다.

```javascript
function fuctionPlugin(app, options) {

}
```
{% endraw %}

***

### ✅ reactive

#### reactive 사용법

{% raw %}
```vue
<template>
    <div>
        <span>My name: {{ name }}</span>
        <button @click="updateInfo">Click</button>
    </div>
</template>
<script>
    import { reactive } from 'vue'

    export default {
        setup () {
            const myInfo = reactive({ name: "Gingerbeer", subject: "vue", age: 28 })

            const updateInfo = () => {
                MyInfo.name = "Lemonlime"
                MyInfo.age++
            }

            return {
                myInfo,
                updateInfo
            }
        }
    }
</script>
```
{% endraw %}

***

### ✅ ref와 reactive 차이점

> **Ref**<br/>
- String, Number, Object 등 어떤 타입에서든 사용 가능<br/>
- .value를 붙여 데이터값에 접근할 수 있음(teplate 태그 안에서는 붙이지 않아도됨.)

> **Reactive**<br/>
- Object, Array, Map, Set과 같은 타입에서만 사용 가능<br/>
- .value를 붙이지 않고 접근할 수 있음<br/>
- String, Number의 값을 초기에 지정하여 사용할 경우 원시값에 대해서는 반응형을 가지지 않음
