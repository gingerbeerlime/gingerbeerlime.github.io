---
title: "Vue3 플러그인"
excerpt: "Vue3에 플러그:: 전역 수준의 공통 함수 작성하고 등록하기"

categories:
  - Vue
tags:
  - [vue, vue3, plugin, reusability, writing-a-plugin]

permalink: /categories/vue/plugin/

toc: true
toc_sticky: true

date: 2023-07-06
last_modified_at: 2023-07-13
---

## Plugins

**플러그인**은 Vue에 **전역 수준의 기능을 추가**할 때 사용하는 기능이다.

***

### ✅ Plugin 활용

- 전역 메서드나 전역 속성을 추가할 때
- 글로벌 에셋을 추가할 때(directive, filter, transition 등)
- Composable을 전역으로 주입할 때
- vue.prototype의 인스턴스 메서드를 연결할 때
- 기존의 api를 조합하는 라이브러리를 등록할 때

>
- <span style="background-color: #F7DDBE; font-weight: bold">app.component()</span> : 메서드를 사용해 전역 컴포넌트 등록할 때
- <span style="background-color: #F7DDBE; font-weight: bold">app.directive()</span> : 메서드를 사용해 커스텀 디렉티브 등록할 때
- <span style="background-color: #F7DDBE; font-weight: bold">app.provide()</span> : 앱 전체에 리소스(메서드 or 데이터)를 주입할 때(provide & inject)
- <span style="background-color: #F7DDBE; font-weight: bold">app.config.globalProperties</span> : 전역 애플리케이션 인스턴스에 속성 또는 메서드를 추가하고자 할 때 app.config.globalProperties에 연결하여 추가

***

### ✅ Plugin 작성

#### install() 메서드를 갖는 객체로 만들기

{% raw %}

```javascript
const objectPlugin = {
  install(app, options) {
    // app.provide, app.component 등 사용할 수 있는 전역 인스턴스
    // app.use(plugin, { options }) 호출 시 전달한 두 번째 파라미터
  }
}
```

{% endraw %}

#### 설치 함수로 만들기

{% raw %}

```javascript
function fuctionPlugin(app, options) {
    // app.provide, app.component 등을 사용할 수 있는 전역 인스턴스
    // app.use(plugin, { options }) 호출 시 전달한 두 번째 파라미터
}
```

{% endraw %}

***

### ✅ 작성한 Plugin 사용

- <span style="background-color: #F7DDBE">app.use()</span>메서드를 사용해 플러그인을 전역 수준의 기능으로 추가할 수 있다.
- <span style="background-color: #F7DDBE">app.use()</span>메서드로 플러그인을 설치하면 플러그인의 매개변수로 **app instance**와 **options**이 전달된다.

{% raw %}

```javascript
import { createApp } from 'vue';
import router from '@/router';
import { funcPlugin } from './plugins/func';
import { objPlugin } from './plugins/obj';

const app = createApp(App);
app.use(router);
app.use(funcPlugin, { options });
app.use(objPlugin, {options});
app.mount('#app');
```

{% endraw %}
