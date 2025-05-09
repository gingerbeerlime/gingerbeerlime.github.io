---
title: "Vue2에서 Vue3로"
excerpt: "Vue2에서 Vue3 달라진 점 살펴보기:: composition api, fragments(다중 루트 노드 컴포넌트), creatingApp, watch, emit"

categories:
  - Vue
tags:
  - [vue, vue3, vue3 basic]

permalink: /categories/vue3/how-to-start-vue3/

toc: true
toc_sticky: true

date: 2023-05-25
last_modified_at: 2023-05-25
---

## Vue3?

Vue2에서 Vue3로 버전이 업데이트 되면서 몇 가지 달라진 특징이 있다.<br>
Composition API, setup함수, creatingApp, multiple root node, watch에 대해 알아보자.

***

### ✅ API 스타일

뷰 인스턴스에서 정의한 속성들을 화면에 표시하는 방법
Reactivity 특성 반영, 데이터 변화를 감지하여 업데이트됨.

#### 1. Options API

Vue2의 디폴트 api 스타일

{% raw %}
```vue
    <template>
        <button @click="increase">Num is: {{ num }}</button>
    </template>

    <script>
    export default {
        data () {
            return {
                num: 0
            }
        },
        methods: {
            increase () {
                this.num++
            }
        },
        created () {
            console.log(`The initial num is ${ this.num }.`)
        }
    }
    </script>
```
{% endraw %}

#### 🌟2. Composition API

논리 단위로 코드를 분리할 수 있어 가독성이 좋고,
각 기능을 함수로 묶어 처리하기 때문에 유지보수가 편하다.
보다 복잡하고 규모가 큰 애플리케이션을 구축할 때는 Composition API + Single-File Components를 사용하는 것이 좋다.

##### setup 함수

{% raw %}
```vue
<template>
    <button @click="increase">Num is: {{ num }}</button>
</template>
<script setup>
    import { ref, onMounted } from 'vue'

    // reactive state
    const num = ref(0)

    // methods
    function increase () {
        num.value++
    }

    // lifecycle hooks
    onMounted(() => {
        console.log(`The initial num is ${num.value}.`)
    })
</script>
```
{% endraw %}

***

### ✅ 애플리케이션 생성(Creating App)

#### Vue2

{% raw %}
```vue
<script>
    import Vue from 'vue'
    import App from './App.vue'

    Vue.config.productionTip = false

    new Vue({
        render: h => h(App),
    }).$mount('#app')
</script>
```
{% endraw %}

#### Vue3

{% raw %}
```vue
<script>
    import { createApp } from 'vue'
    import App from './App.vue'
    import './index.css'

    createApp(App).mount('#app')
</script>
```
{% endraw %}

***

### ✅ 다중 루트 노드(Fragments)

#### Vue2

template태그 안에 root node 하나만 있어야함

{% raw %}
```vue
<template>
    <div>
        <header></header>
        <main></main>
        <footer></footer>
    </div>
</template>
```
{% endraw %}

#### Vue3

template태그 안에 root node 여러 개 작성가능

{% raw %}

```vue
<template>
    <header></header>
    <main></main>
    <footer></footer>
</template>
```

{% endraw %}

***

### ✅ Watch & WatchEffect 사용법

#### Vue2

{% raw %}

```vue
<script>
    export default {
        data () {
            return {
                num: 0
            }
        },
        watch: {
            num (newVal, oldVal) {
                console.log(`${newVal} ${oldVal}`)
            }
        }
    }
</script>
```

{% endraw %}

#### Vue3 - watchEffect()

watch 사용법은 동일, watchEffect는 함수 내에 포함된 모든 데이터에 반응성으로 작동한다.

{% raw %}

```vue
<script setup>
    const num = ref('')
    watchEffect(() => {
        console.log(num.value)
    })
</script>
```

{% endraw %}
