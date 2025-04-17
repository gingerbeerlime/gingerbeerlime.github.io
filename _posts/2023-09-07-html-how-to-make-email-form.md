---
title: "Vue 프로젝트에서 이메일 템플릿 만들기"
excerpt: "매주 발송되는 주간 레포트 템플릿 개발하기"

categories:
  - HTML
tags:
  - [vue, html, css, email template]

permalink: /categories/html/how-to-make-email-template/

toc: true
toc_sticky: true

date: 2099-09-07
last_modified_at: 2099-09-08
---

## 이메일 템플릿

주간레포트를 메일로 전송하는 서비스를 개발하려고 한다.
이 서비스의 개요는 사용자가 이메일을 전송받을 수신자를 선택하고
원하는 컨텐츠들을 추가해 이메일 템플릿을 구성하여 수신자에게 매주 이메일이 전송되도록 설정한다.

처음에는 일단 기획된 템플릿 디자인을 토대로 기존 프로젝트에 새 페이지를 파서 마크업을 하는 것부터 시작했다.
기존 프로젝트 코드와 똑같이 vue, vuexy, bootsrap, css, chart.js 등을 마구 쓰며 마크업을 완성했다.
하지만 이메일은 순수 html구조여야한다. 그것도 구식 html코드를 따라서 해야 각종 플랫폼의 메일에서 ui깨짐 현상없이 보일 수 있다는 것이다.

지금 내가 해결해야할 문제는

1. 순수 html 구조로 만들 것, 심지어 div도 안쓰는 것이 좋음, 최대한 table로만 구조짜기
2. css는 인라인이어야함
3. script언어는 이메일에 쓸 수 없기 때문에 script단도 없어야함
4. 고정된 내용의 컨텐츠가 아니라, 매주 배치가 돌며 데이터가 들어가서 이메일 템플릿이 완성되어야하는데, 이를 어떻게 구현할 것인가
5. 차트가 들어가는 컨텐츠가 많은데, chart.js 라이브러리를 사용한 부분을 어떻게 순수 html 구조로 만들것인가

---

### ✅ 이메일 템플릿 요구사항

> **Email Template HTML**<br/>

- Vetur와 Volar은 vue프레임워크에서 코드 작성시 **하이라이팅, 에러체크, 포맷팅, 디버깅, 코드 자동완성**등의 코딩을 편하게 도와주는 기능을 제공한다<br/>
- Vue2에서 Vue3로 업데이트되면서 보조 확장 프로그램도 Vetur에서 Volar로 권장된다<br/>
- Volar은 Typescript 지원이 잘되고, Monorepo 구조에서도 잘 작동한다<br/>
- 하지만 Vue2버전에서는 유지보수에서 여전히 Vetur를 사용하는 것이 좋기 때문에 해당 프로젝트에만 Vetur를 사용하도록 설정할 수 있다(extention 아이콘 마우스 우클릭 > 사용(작업영역)

---

### ✅ 순수 HTML 템플릿

---

### ✅ 인라인 CSS

---

### ✅ Chart.js

---
