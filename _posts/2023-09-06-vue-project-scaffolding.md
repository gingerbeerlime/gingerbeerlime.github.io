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

- **Typescript Vue Plugin(Volar)** : Vue에서 TypeSript를 지원하는 공식 VSCode 확장 플러그인
- **Vue3 snippets** : 코드 자동 완성
- **HTML CSS Support** : css에 정의되어있는 선택자 자동완성

저는 이 3개를 설치했습니다

***

#### 2. Vuetify 프로젝트 생성

🔽 Vuetify3 공식사이트

<a href="[https://www.google.com/](https://vuetifyjs.com/en/getting-started/installation/)" target="_blank">Get started with Vuetify 3</a>

{% raw %}

```bash
npm create vuetify
```

{% endraw %}

##### option 선택

![vuetify옵션선택](https://github.com/gingerbeerlime/gingerbeerlime.github.io/assets/89768065/f09ad55d-d87c-4868-b4df-ea9c4656e947)

##### 프로젝트 생성완료

![vuetify프로젝트로컬실행](https://github.com/gingerbeerlime/gingerbeerlime.github.io/assets/89768065/14da1ee7-4ed7-455c-83c9-528967011276)

로컬 실행했을 때 이 화면이 뜨면 성공이다<br/>
이렇게 하니 vue3, vite, vuetify, typescript, pinia 원하는 옵션들로 프로젝트가 완성되었다<br/>
vuetify프로젝트를 먼저 깔고 시작하니 간단했다!<br/>

***

#### 3. typescript 에러수정

로컬실행은 잘되나 HelloWorld 컴포넌트를 갖고오는 import구문에서 에러표시가 난다<br>
에러 내용은 **Module ~~ has no default export(Vetur 1192)**였는데<br>
새로 설치한 Typescript Vue Plugin(Volar)와 기존에 설치되어있던 Vetur가 충돌하면서 생긴 에러인듯하다<br>
**Vetur를 비활성화하니 에러가 없어졌다!**<br>

Vetur와 Volar은 vue프레임워크에서 코드 작성시 하이라이팅, 에러체크, 포맷팅, 디버깅, 코드 자동완성 등의 코딩을 편하게 도와주는 기능을 제공한다<br>
알아보니 Vue2에서 Vue3로 업데이트되면서 보조 확장 프로그램도 Vetur에서 Volar로 권장된다고 한다<br>
Volar은 Typescript 지원이 잘되고, Monorepo 구조에서도 잘 작동한다<br>
하지만 Vue2버전에서는 유지보수에서 여전히 Vetur를 사용하는 것이 좋기 때문에 해당 프로젝트에만 Vetur를 사용하도록 설정할 수 있다<br>

***
