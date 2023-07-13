---
title: "Vue3 Teleport"
excerpt: "Vue Teleport:: Vue3 내장 컴포넌트, Modal에 teleport 이용하기"

categories:
  - Vue
tags:
  - [vue, vue3, built-in components, teleport, DOM hierarchy]

permalink: /categories/vue3/teleport/

toc: true
toc_sticky: true

date: 2023-07-05
last_modified_at: 2023-07-06
---

## Teleport?

Vue3에서 새롭게 등장한 내장 컴포넌트로 돔 요소를 원하는 위치로 이동시킬 수 있다.<br>
예를 들어, 로직상으로는 특정 컴포넌트 내부에 있어야하지만, UI상으로는 독립적으로 존재해야하는 요소의 경우, 특정 컴포넌트 내부에 코드를 작성하더라도 렌더링될 때는 원하는 위치에서 보여지도록 **Teleport**를 사용할 수 있다.

***

### ✅ Modal에서 Teleport 사용하기

컴포넌트의 논리적 계층 구조는 유지하면서 렌더링되는 돔 구조만 변경시킨다.<br>
Modal을 특정 컴포넌트 내부에 위치시킬 때 발생할 수 있는 css문제(ex. position, overlay)를 컴포넌트 외부에 독립적으로 이동시켜 쉽게 해결할 수 있다.

#### 1. Modal in Teleport

{% raw %}

```vue
    <template>
        <button @click="open=true">Open</button>

        <Teleport to="#modal">
            <div v-if="open" class="modal">
                <p>Modal contents~</p>
                <button @click="open=false">Close</button>
            </div>
        </Teleport>
    </template>
```

{% endraw %}

- index.html(modal을 이동시킬 곳)

{% raw %}

```html
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teleport</title>
        </head>
        <body>
            <div id="app"></div>
            <!-- modal 이동 -->
            <div id="modal"></div>
            <script type="module" src="/src/main.js"></script>
        </body>
    </html>
```

{% endraw %}

- 아래처럼 렌더링됨

{% raw %}

```html
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teleport</title>
        </head>
        <body>
            <div id="app"></div>
            <!-- modal이 여기로 이동됨 -->
            <div id="modal">
                <div v-if="open" class="modal">
                    <p>Modal contents~</p>
                    <button @click="open=false">Close</button>
                </div>
            </div>
            <script type="module" src="/src/main.js"></script>
        </body>
    </html>
```

{% endraw %}

***

### ✅ Teleport 특징

- **Mutliple Telports** : 같은 위치(대상)에 여러개의 teleport문을 사용할 수 있다.
- **Disabling Teleport** : 조건에 따라 Teleport를 disable 시킬 수 있다.
