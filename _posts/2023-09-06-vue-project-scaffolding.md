---
title: "Vue3 + Vuetify 프로젝트 세팅하기"
excerpt: "Vue3 프로젝트 시작하기:: Vue3 + Vuetify3 + Vite + Pinia + Typescript 기반 환경구성"

categories:
  - Vue
tags:
  - [vue, vue3, vue3 config]

permalink: /categories/vue3/how-to-start-vue3-vuetify-project/

toc: true
toc_sticky: true

date: 2023-09-06
last_modified_at: 2023-09-06
---

## Vue3 + Vuetify3 + Vite + Pinia + Typescript

Vue2 기반으로 운영중인 프로젝트를 새로 개편하면서<br/>
Vue3 기반으로 프로젝트 구조를 새롭게 세팅하기로 했다.<br/>
기존에는 디자인이 더 세련된 Vuexy 템플릿을 사용했는데<br/>
우리 팀에 디자이너 분이 들어오시면서<br/>
지속적으로 업데이트가 되고있는 Vuetify3 프레임워크를 사용하여 개발하기로 했다.<br/>

Vue3 프로젝트 생성 후 Vuetify 설치를 해보았으나 Vuetify component를 가져오지 못했다.<br/>
여러가지 순서로 시도를 해보았는데<br/>
처음부터 Vuetify 프로젝트로 생성했을 때 내가 원하는 환경 구성이 세팅되었다.

***

### ✅ 환경구성 요구사항

|---|---|
|Script 프레임워크|Vue3|
|UI 프레임워크|Vuetify 3|
|빌드도구|Vite|
|상태관리|Pinia|
|Node|18.16.0|
|타입스크립트|적용|
|구동방식|CSR|

***

### ✅ Vue 프로젝트 세팅하기

#### 1. Node, Vue, Vue CLI, VSCode Plugin

vscode, node, vue, vue cli가 설치되어 있어야합니다

🔽vscode extention 설치

- Typescript Vue Plugin(Volar) : Vue에서 TypeSript 지원을 제공하는 공식 VSCode 확장 플러그인
- Vue3 snippets : 코드 자동 완성
- HTML CSS Support : css에 정의되어있는 선택자 자동완성

저는 이 3개를 설치했습니다

#### 2. Vuetify 프로젝트 생성

🔽 Vuetify3 공식사이트

[Get started with Vuetify 3](https://vuetifyjs.com/en/getting-started/installation/)

{% raw %}

```bash
npm create vuetify
```

{% endraw %}

option 선택

![vuetify옵션선택](https://github.com/gingerbeerlime/gingerbeerlime.github.io/assets/89768065/f09ad55d-d87c-4868-b4df-ea9c4656e947)


***

![vuetify프로젝트로컬실행](https://github.com/gingerbeerlime/gingerbeerlime.github.io/assets/89768065/14da1ee7-4ed7-455c-83c9-528967011276)

npm run dev 했을 때 이 화면이 뜨면 성공이다
이렇게 하니 vue3, vite, vuetify, typescript, pinia 원하는 옵션들로 프로젝트가 완성되었다
vuetify프로젝트를 깔고 시작하니 간단했던 vue3프로젝트 세팅

- 실행은 잘되나 파일에서 에러나는 부분은 수정

***
