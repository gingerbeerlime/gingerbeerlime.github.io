---
title: "타입 별칭과 인터페이스의 차이점"
excerpt: "Typescript 기본 개념"

categories:
  - TypeScript
tags:
  - [typescript]

permalink: /categories/typescript/type-alias-vs-interface/

toc: true
toc_sticky: true

date: 2025-04-07
last_modified_at: 2025-04-07
---

## 타입 별칭과 인터페이스의 차이점과 사용법

- 타입 별칭이란
- 타입 별칭과 인터페이스의 차이점
- 어떨 때 타입 별칭/인터페이스를 사용해야할까?

---

## 타입 별칭(type alias)

**타입 별칭이란?** 특정 타입이나 인터페이스 등을 참조할 수 있는 `타입 변수`. 타입에 의미를 부여해서 별도의 이름을 부르는 것이다.

---

### 타입 별칭의 장점

- 반복되는 타입 코드를 줄일 수 있다.
- `sting | number` 타입을 가지는 타입 별칭을 사용해 타입 코드를 간단하게 명시하고 의미를 부여해 재사용할 수 있다.

```ts
type MyMessage = string | number;
function logText(text: MyMessage) {
  // ...
}

var message: MyMessage = "Hello";
logText(message);
```

> ❌ 타입을 선언하고 다시 다른 타입을 할당할 수 없다.

```ts
type MyName = string;
type MyName = number; // 에러 발생
```

---

### 타입 별칭과 인터페이스의 차이점

(1) 코드 에디터에서 표기 방식 차이

- 인터페이스
  <img src="/assets/images/posts_img/typescript-type-alias-vs-interface/interface-preview.png" alt="인터페이스 사용시 타입 미리보기" width="300"/>

- 타입 별칭 : 변수에 연결된 타입의 구체적인 모양을 확인할 수 있음
  <img src="/assets/images/posts_img/typescript-type-alias-vs-interface/type-alias-preview.png" alt="타입 별칭 사용시 타입 미리보기" width="300"/>

<br/>

(2) 사용할 수 있는 타입의 차이

- 인터페이스, 타입 별칭 모두 객체의 타입을 정의하는데 사용할 수 있지만, 타입 별칭은 일반 타입, 유니언 타입, 인터섹션 타입 등에도 사용할 수 있다.
- 또한 타입 별칭은 제네릭이나 유틸리티 타입에도 사용할 수 있다.

<br/>

(3) 타입 확장 관점에서의 차이

- **인터페이스의 확장** : 인터페이스는 `상속`으로 타입을 확장한다.

```ts
interface Person {
  name: string;
  age: number;
}

interface Developer extends Person {
  skill: string;
}

var ginger:  = {
  name: 'ginger',
  age: 20,
  skill: '프론트'
}
```

- **인터페이스의 선언 병합(declaration merging)**: 인터페이스는 동일 이름으로 인터페이스를 재선언하면 인터페이스 내용을 합치는 특징이 있다.

```ts
interface Person {
  name: string;
  age: number;
}

interface Person {
  address: string;
}

var ginger: Person = {
  name: "ginger",
  age: 20,
  address: "Seoul",
};
```

- **타입 별칭의 확장** : 인터섹션 타입(&)을 타입 별칭으로 정의함으로서 확장의 효과는 낼 수 있으나, 타입 별칭은 새 속성을 추가하거나 확장은 불가능하다.

```ts
type Person = {
  name: string;
  age: number;
};

type Skill = {
  skill: string;
};

// 인터섹션 타입을 타입 별칭으로 정의
type Developer = Person & Skill;

var ginger: Developer = {
  name: "ginger",
  age: 20,
  skill: "프론트",
};
```

<br/>

---

### 인터페이스/타입 별칭은 언제 쓰는게 좋을까?

> **타입 별칭으로만 타입 정의가 가능한 곳에는 타입 별칭을 사용하고 백엔드와 인터페이스를 정의하는 곳에는 인터페이스를 사용하자**

(1) 타입 별칭으로만 정의할 수 있는 타입들

- 일반 데이터 타입
- 인터섹션
- 유니언 타입
- 유틸리티 타입
- 맵드 타입

```ts
// 일반 데이터 타입, 인터섹션, 유니언 타입은 인터페이스로 정의할 수 없다
type MyString = string;
type StringOrNumber = string | number;
type Admin = Person & Developer;
```

(2) 백엔드와 인터페이스의 정의

- 타입 별칭으로 API 함수의 응답 형태를 정의

```ts
type User = {
  id: string;
  name: string;
};

function fetchData(): User {
  return axios.get("http://localhost:3000/user/1");
}
```

- 인터페이스로 API 함수의 응답 형태를 정의

```ts
interface User {
  id: string;
  name: string;
}

function fetchData(): User {
  return axios.get("http://localhost:3000/user/1");
}
```

- **API의 응답 형태가 변할 수 있다는 점을 고려할 때 타입 확장이 유연한 인터페이스를 사용하는 것이 더 유리하다**

```ts
interface Admin {
  role: string;
  department: string;
}

// 상속을 통한 타입 확장
interface User extends Admin {
  id: string;
  name: string;
}

// 선언 병합을 통한 타입 확장
interface User {
  skill: string;
}
```

```ts
// 결과적으로 User 인터페이스는 아래와 같은 형태를 가짐
interface User {
  role: string;
  department: string;
  id: string;
  name: string;
  skill: string;
}
```
