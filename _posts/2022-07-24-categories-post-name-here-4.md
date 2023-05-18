---
title: "Vue 템플릿 문법"
excerpt: "뷰로 화면 조작하기::데이터 바인딩 & 데이터 디렉티브"

categories:
  - Categories4
tags:
  - [vue, template, tag1, tag2]

permalink: /frontend/vue/test1

toc: true
toc_sticky: true

date: 2023-05-18
last_modified_at: 2023-05-18
---

## 뷰 템플릿 문법이란?

뷰로 화면을 조작하는 방법. 데이터 바인딩과 디렉티브로 나뉜다.

***

### :herb: 데이터 바인딩

뷰 인스턴스에서 정의한 속성들을 화면에 표시하는 방법
Reactivity 특성 반영, 데이터 변화를 감지하여 업데이트됨.

#### 1. 콧수염 괄호(Mustach tag): 가장 기본적인 데이터 바인딩 방식

```html
<body>
    <div id="app">
        <p>{{ num }}</p>
        <p>{{ doubleNum }}</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script>
        new Vue({
            el: '#app',
            data: {
                num: 10,
            },
            computed: {
                doubleNum: function() {
                    return this.num * 2
                }
            }
        });
    </script>
</body>
```

#### 2. v-bind: 뷰 인스턴스 데이터 속성과 HTML 태그를 연결한다.

뷰 인스턴스 데이터 속성과 HTML 태그를 연결한다.

***

### 뷰 디렉티브

HTML 태그 안에 'v-' 접두사를 가지는 모든 속성. 뷰로 화면의 요소를 더 쉽게 조작하기 위한 문법이다.

- **ex)** v-if, v-for, v-show, v-bind, v-on, v-model

```html
<body>
    <div id="app">
        <div v-if="loading">
            Loading...
        </div>
        <div v-else>
            test user has been logged in
        </div>
        <div v-show="loading">
            Loading...
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script>
        new Vue({
            el: '#app',
            data: {
                loading: true
            }
        });
    </script>
</body>
```

#### 1. v-if & v-else 와 v-show의 차이점

v-if & v-else 는 상태에 따라 조건에 맞는 태그 자체를 존재/삭제 시키고 
v-show는 조건이 맞지 않을 때 display="none"으로 보이지 않게된다(코드는 존재)

#### 2. v-model

2-way 바인딩 모델
form에서 사용자의 입력 이벤트에 따라 자동으로 양방향으로 데이터가 업데이트됨.
input, select, textarea 태그에만 사용 가능하다.

```html
<body>
    <div id="app">
        <input v-model="message" placeholder="edit me"/>
        <p>Message is: {{ message }}</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script>
        new Vue({
            el: '#app',
            data: {
                message: ''
            }
        });
    </script>
</body>
```

#### 3. v-on을이용한 이벤트 핸들링

**ex)** v-on:keyup.enter: keyup이벤트가 일어나는 것중 enter키인 것에만 메서드 실행

***

### computed, watch 속성

#### 1. computed

- data 속성 값의 변화에 따라 자동으로 다시 연산한다.
- **캐싱**: 동일한 연산의 반복을 없애기 위해 연산의 결과값을 미리 저장하고 있다가 필요할 때 불러오는 동작

> **computed vs methods**<br/><br/>
  computed는 대상 데이터의 값이 변경되면 자동적으로 수행됨. methods는 호출할 때만 수행됨.<br/>
  computed 속성을 method를 이용해서 비슷하게 구현할 수 있으나, computed는 참조하고 있는 데이터의 변화가 일어나지 않으면 실행되지 않는 점, method는 re-rendering이 일어날 때마다 실행되는 점의 차이를 고려해서 코드를 작성한다.

> **computed vs watch**<br/><br/>
  computed 속성은 내장 API를 활용한 단순 연산에 사용하고(**watch가 꼭 필요한 경우가 아니면 computed를 사용해서 해결**),<br/>
  watch는 상대적으로 시간이 많이 사용되는 무거운 로직이나 데이터 갱신에 따라 데이터를 요청하는 등 **비동기 처리**에 적합하다.

```html
<body>
  <div id="app">
      <p v-bind:class="errorTextColor">Hello</p>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script>
      new Vue({
          el: '#app',
          data: {
              isError: false
          },
          computed: {
              errorTextColor: function() {
                  return this.isError? 'warning' : null;
              }
          }
      });
  </script>
</body>
```
