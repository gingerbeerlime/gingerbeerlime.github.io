---
title: "Vue3 Composable"
excerpt: "Vue Composable:: 상태 저장 관리 로직 캡슐화, 재사용성"

categories:
  - Vue
tags:
  - [vue, vue3, vue3 basic, composable]

permalink: /categories/vue3/composable-basic/

toc: true
toc_sticky: true

date: 2023-07-05
last_modified_at: 2023-07-06
---

## Composable?

Vue2에서 Vue3로 버전이 업데이트 되면서 몇 가지 달라진 특징이 있다.<br>
Composition API, setup함수, creatingApp, multiple root node, watch에 대해 알아보자.

***

### ✅ API 스타일

뷰 인스턴스에서 정의한 속성들을 화면에 표시하는 방법
Reactivity 특성 반영, 데이터 변화를 감지하여 업데이트됨.
