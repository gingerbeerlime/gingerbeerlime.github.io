---
title: "Ref vs Reactive"
excerpt: "Ref와 Reactive의 개념과 사용법"

categories:
  - Vue
tags:
  - [vue, vue3, ref, reactive]

permalink: /categories/vue/vue-ref-reactive/

toc: true
toc_sticky: true

date: 2023-05-25
last_modified_at: 2023-05-25
---

## Composition API_ref, reactive?

Composition API를 사용해 특정 기능이나 논리의 단위로 코드를 구분해 여러 컴포넌트에서 재사용성을 높인다.<br>
이 중 **ref**와 **reactive**를 활용하면 composition api에서 사용하는 **데이터를 반응형**으로 만들 수 있다.

***

### ✅ ref

Vue2에서는 뷰 템플릿의 DOM 또는 컴포넌트를 가리키는 속성이였지만,<br>
Vue3에서는 <strong>reactive reference</strong>를 의미한다.

#### ref 사용법

{% raw %}
```vue
<template>
    <div>
        <span>count: {{ num }}</span>
        <button @click="increase">Click</button>
    </div>
</template>
<script>
    import { ref } from 'vue'

    export default {
        setup () {
            const num = ref(0)

            const increase = () => {
                num.value++
            }

            return {
                num,
                increase
            }
        }
    }
</script>
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
- .value를 붙여 데이터값에 접근할 수 있음(template 태그 안에서는 붙이지 않아도됨.)

> **Reactive**<br/>
- Object, Array, Map, Set과 같은 타입에서만 사용 가능<br/>
- .value를 붙이지 않고 접근할 수 있음<br/>
- String, Number의 값을 초기에 지정하여 사용할 경우 원시값에 대해서는 반응형을 가지지 않음
