---
title: "Vue3 Composable"
excerpt: "Vue Composable:: 상태 저장 관리 로직 캡슐화, 재사용성"

categories:
  - Vue
tags:
  - [vue, vue3, composable, reusability, stateful-logic]

permalink: /categories/vue3/composable/

toc: true
toc_sticky: true

date: 2023-07-05
last_modified_at: 2023-07-12
---

## Composable?

Vue Composition API를 활용하여 상태 저장 로직을 캡슐화하고 재사용하는 함수이다.

***

### ✅ Composable 예제(데이터 가져오기-로딩,성공,에러 상태 관리)

비동기 데이터를 가져올 때 로드, 성공, 에러와 같은 상태를 처리하는 경우 아래와 같이 똑같은 코드가 페이지마다 반복해서 사용된다.

{% raw %}

```vue
    <template>
      <div v-if="error">{{ error.message }}</div>
      <div v-else-if="data">
        <pre>{{ data }}</pre>
      </div>
      <div v-else>loading...</div>
    </template>

    <script setup>
      import { ref } from 'vue'

      const data = ref(null)
      const error = ref(null)

      fetch('...')
        .then((res) => res.json())
        .then((json) => (data.value = json))
        .catch((err) => (error.value = err))
    </script>
```

{% endraw %}

:arrow_down:컴포저블 함수로 만들기

{% raw %}

```javascript
  import { ref } from 'vue'

  export function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    fetch(url)
      .then((res) => res.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))

    return { data, error }
  }
```

{% endraw %}

:arrow_down:컴포넌트에서 컴포저블 함수 사용하기

{% raw %}

```vue
    <script setup>
      import { useFetch } from './fetch.js'

      const { data, error } = useFetch('...')
    </script>
```

{% endraw %}

- option api를 사용하는 경우, 컴포저블 함수는 setup()내에서 호출되어야하면 반환된 바인딩도 setup()에서 반환되어야한다.

:heavy_exclamation_mark:URL이 변경될 때 다시 데이터를 **FETCH**해오기 위해서는 **ref**를 사용해야한다.

{% raw %}

```javascript
  import { ref, isRef, unref, watchEffect } from 'vue'

  export function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    function doFetch() {
      // 데이터 가져오기 전에 상태 초기화
      data.value = null
      error.value = null

      // unref() : ref의 래핑을 해제
      // unref()의 역할 : 파라미터(url)가 ref라면 url.value를 반환하고, ref가 아니라면 url 있는 그대로 반환시킨다. 여러 개발자가 협업하는 경우 ref가 넘어올지, 원시값이 넘어올지 알 수 없기 때문에 unref()를 사용해 두 케이스 모두 처리하는 것이 좋다.
      fetch(unref(url))
        .then((res) => res.json())
        .then((json) => data.value = json)
        .catch((err) => error.value = err)
    }

    if (isRef(url)) {
      // 입력 URL이 ref인 경우 반응성으로 다시 fetch해오기
      watchEffect(doFetch)
    } else {
      // 입력 url이 ref가 아닌 경우 한 번만 fetch 해오기
      doFetch()
    }

    return { data, error }
  }
```

{% endraw %}
