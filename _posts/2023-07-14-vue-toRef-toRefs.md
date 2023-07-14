---
title: "toRef와 toRefs"
excerpt: "toRef, toRefs 사용하기:: reactive 반응성을 잃지 않고 데이터 전달하기"

categories:
  - Vue
tags:
  - [vue, vue3, toRef, toRefs, reactive, composable parameter]

permalink: /categories/vue/vue-toref-torefs/

toc: true
toc_sticky: true

date: 2023-07-14
last_modified_at: 2023-07-14
---

## toRef? toRefs?

Composition API를 사용해 특정 기능이나 논리의 단위로 코드를 구분해 여러 컴포넌트에서 재사용성을 높인다.<br>
이 중 **ref**와 **reactive**를 활용하면 composition api에서 사용하는 **데이터를 반응형**으로 만들 수 있다.

***

### ✅ toRef

반응형 데이터를 파라미터로 전달하거나 다른 변수에 할당할 때,<br>
복사하려는 값이 원시타입이면 자바스크립트는 value값만 복사하기 때문에 반응성을 잃어버리게 된다.<br>
이럴 때 반응형 객체의 속성을 하나의 ref객체로 만들어 사용하면 반응성을 유지할 수 있다.<br>
- toRef는 하나의 프로퍼티에 대해 부모 object와의 연결성은 유지한채 reactive를 반환한다.<br>
- 생성된 ref객체는 원본 반응형 객체의 속성과 동기화되어 속성의 변화에 따라 양쪽 다 업데이트된다.

#### ref 사용법

{% raw %}

```vue
<script setup>
  import { reactive, toRef } from 'vue'

  const itemList = reactive({ item: 'apple', price: 2000, stock: 30 })
  // const appleStock = itemList.stock (숫자 자체가 복사되어 반응성 잃음)
  const appleStock = toRef(itemList, 'stock')
</script>

<template>
  <h1>apple 남은 재고 = {{ appleStock }}</h1>
  <input v-model="appleStock" />
</template>
```

{% endraw %}

> toRef()활용하기<br>
- Composable 함수에 props 참조를 전달하려는 경우

***

### ✅ toRefs

reactive의 모든 프로퍼티에 대해 toRef를 적용하여 반환한다.<br>
구조분해할당을 사용할 수 있고 구조분해 할당 후에도 반응형을 그대로 유지한다.<br>
- toRefs를 사용하면 reactive 객체 각각의 속성이 ref값으로 변환된다.

#### reactive 사용법

{% raw %}

```vue
<script setup>
  import { reactive, toRefs } from 'vue'

  const itemList = reactive({ item: 'apple', price: 2000, stock: 30 })
  const { item, price, stock } = toRefs(itemList)
</script>

<template>
  <h1>apple 남은 재고 = {{ stock }}</h1>
  <input v-model="stock" />
</template>
```

{% endraw %}

> toRefs()활용하기<br>
- 일반 함수나 Comosable 함수에서 Reactive 객체를 반환받는 경우

***

### ✅ toRef와 toRefs

> **toRef**<br/>
- String, Number, Object 등 어떤 타입에서든 사용 가능<br/>
- .value를 붙여 데이터값에 접근할 수 있음(template 태그 안에서는 붙이지 않아도됨.)

> **toRefs**<br/>
- Object, Array, Map, Set과 같은 타입에서만 사용 가능<br/>
- .value를 붙이지 않고 접근할 수 있음<br/>
- String, Number의 값을 초기에 지정하여 사용할 경우 원시값에 대해서는 반응형을 가지지 않음
