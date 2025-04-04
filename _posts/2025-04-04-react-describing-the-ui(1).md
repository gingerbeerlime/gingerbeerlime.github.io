---
title: "React UI 표현하기: 리액트 컴포넌트 기본 사용법"

excerpt: "React v19 공식문서-리액트 컴포넌트 구성, 컴포넌트 내보내기, JSX, Props"

categories:
  - React

tags:
  - [react, react19, jsx, props, react component]

permalink: /categories/react/describing-the-ui/

toc: true

toc_sticky: true

date: 2025-04-04

last_modified_at: 2025-04-04
---

## 리액트 UI 표현하기

- 첫 번째 리액트 컴포넌트 작성하기
- 컴포넌트 Import 및 Export 하기
- JSX로 JavaScript에 마크업 추가하기
- JSX에 중괄호를 사용해 JavaScript 기능 이용하기
- Props를 사용하여 컴포넌트 구성하기

[리액트v19 공식문서-UI 표현하기] <https://ko.react.dev/learn/describing-the-ui>

---

## 첫 번째 리액트 컴포넌트 작성하는 방법

### 리액트 컴포넌트

마크업으로 뿌릴 수 있는 JavaScript 함수. 리액트 애플리케이션은 리액트 컴포넌트로 구성된다.
<br />

- 리액트 앱은 루트 컴포넌트에서 시작됨
- 리액트의 모든 UI는 컴포넌트로 구성됨 - 버튼, 사이드바, 리스트, 페이지 전체까지 모두 컴포넌트로 구성됨
- 리액트는 빈 HTML 파일에서 시작하고, JavaScript가 로드되면서 화면을 그려줌
- 단, Next.js 같은 SSR 프레임워크는 HTML을 미리 생성할 수도 있음
- 리액트를 웹사이트의 특정 부분에서만 사용하는 것도 가능 ⇒ 이런 경우, 여러 개의 루트 컴포넌트가 한 페이지에 존재할 수 있음

<br />

### 컴포넌트 정의하기

```jsx
export default function Profile() {
  return <img src="../assets/public/sample.jpg" alt="thumbnail" />;
}
```

(1) 컴포넌트 내보내기 `export default`

(2) 함수 정의하기 `function 함수명() { }`

- 리액트 컴포넌트 함수 이름은 **대문자로 시작**해야함(HTML태그와 구분됨)

(3) 마크업 반환하기 `function 함수명() { return (JSX마크업) }`

<br/>

### 컴포넌트 중첩 및 구성

- 같은 파일에 여러 컴포넌트를 포함할 수 있다. → 컴포넌트가 상대적으로 작거나 서로 밀접하게 관련되어있을 때
- `주의` 컴포넌트는 다른 컴포넌트를 렌더링할 수 있지만, 컴포넌트 안에 다른 컴포넌트를 정의하면 안된다.

```jsx
export default function Gallery() {
  // 절대 컴포넌트 안에 다른 컴포넌트를 정의하면 안됨
  function Profile() {
    //...
  }
  // ...
}
```

- 컴포넌트는 항상 최상위 레벨에서 정의

```jsx
// 부모 컴포넌트
export default function Gallery() {
  // ...
  return (
    <div>
      <h1>Gallery</h1>
      <Profile></Profile>
    </div>
  );
}
// 자식 컴포넌트
function Profile() {
  // ...
}
```

<br/>

### 🧩 컴포넌트 라이브러리

- `Chakra UI` : 리액트 기반의 컴포넌트 라이브러리로 접근성, 스타일링 편의성, 개발 생산성을 중점으로 설계된 UI 라이브러리.
  - 사용하기 쉬운 스타일링 시스템 - props로 스타일을 쉽게 조정
  - 접근성 지원(WCAG 원칙 반영)
  - 확장성 - 기본 테마를 커스터마이징하기 쉬움
  - 다크모드 지원 - useColorMode()훅을 사용해 다크모드 손쉽게 적용
  - 타입스크립트 지원 - 타입 안정성 높음
  - CSS-in-JS 방식 사용으로 SSR 환경에서 성능 저하가 발생할 수 있음
- `Material UI`: 구글의 머티리얼 디자인 시스템 기반으로 한 리액트 UI 라이브러리.
  - 다양한 UI 컴포넌트 제공, 고급 컴포넌트 제공
  - 구글 머티리얼 디자인 기반으로 일관된 UI를 유지하기 좋고 반응형 지원
  - 강력한 테마 시스템(ThemeProvider)
  - 타입스크립트 지원
  - SSR 최적화
  - 커스터마이징이 어렵고 정형화된 디자인
  - CSS-in-JS 방식 사용으로 SSR 환경에서 성능 저하가 발생할 수 있음
- `Radix UI`: 헤드리스 UI 라이브러리
  - 대형 프로젝트에 적합
  - 접근성 지원 뛰어남(WAI-ARIA 표준 따름)
  - 서버 친화적(직접 스타일 적용 필요)
  - 고급 컴포넌트 많음
  - 상태 관리를 위한 Unstyled 컴포넌트 제공
- `Shadcn/ui`: 헤드리스 UI 라이브러리. Tailwind와 결합해 더 쉽게 사용할 수 있도록 최적화된 라이브러리
  - 디자인이 있는 컴포넌트도 제공되지만, 필요하면 스타일을 제거하고 원하는 대로 수정 가능
  - 대부분의 UI 컴포넌트를 제공하며, 필요한 컴포넌트만 가져올 수 있음
  - 자동 다크 모드 & 테마 지원
  - 서버 친화적(React Server Components 지원)
- **헤드리스 컴포넌트?**
  - UI를 제공하지 않음 → 스타일이나 마크업 없이 로직만 포함
  - 완전한 재사용성 → 다양한 UI라이브러리나 스타일링 방식과 조합 가능
  - Render Props 또는 Hooks 사용 → 자유로운 UI 커스터마이징

---

## 컴포넌트 Import 및 Export 하기

### Default vs Name Export

| Syntax             | Default export                                                                                   | Named export                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **export 하는 법** | `export default function Button() {}`                                                            | `export function Button() {}`                                                         |
| **import 하는 법** | `import Button from './button.js'`                                                               | `import { Button } from './button.js'`                                                |
| **역할**           | 파일에서 기본 컴포넌트임을 명시                                                                  | 여러 컴포넌트를 export할 때 사용                                                      |
| **특징**           | - 파일 내 Default export는 하나만 존재할 수 있음 <br> - import할 때 다른 이름으로 가져올 수 있음 | - 파일 내 여러 개의 named export를 사용할 수 있음 <br> - import할 때 이름이 같아야 함 |

<br/>

### 🤔 컴포넌트를 다른 파일로 분리할 때 고려할 것

- 단일 책임 원칙
- 재사용 가능성
- 가독성
- 상태와 라이프사이클
- UI요소 : 서로 다른 UI 요소는 별도의 컴포넌트로 분리

---

## JSX로 마크업 작성하기

**JSX란?** 리액트 컴포넌트에서 마크업을 표현하는 확장된 문법으로, HTML과 유사하지만 더 엄격하고 JavaScript의 동적인 표현식을 표현할 수 있다.

<br/>

### JSX 규칙

(1) 하나의 루트 엘리먼트로 반환할 것

- JSX는 내부적으로 일반 JavaScript 객체로 변환되기 때문에 하나의 함수에서 두 개의 객체를 반환할 수 없다. → 따라서 여러 엘리먼트를 반환할 때, `<div>...</div>` 또는 `<>...</>` 등 하나의 부모 태그로 감싸서 반환해야한다.

(2) 모든 태그는 명시적으로 닫혀있어야 함 `<img />` `<li></li>`

(3) 캐멀 케이스로 작성할 것

- JSX에서 작성된 어트리뷰트는 JavaScript 객체의 키가 되는데, **JavaScript 변수명에는 대시를 포함하거나 `class`와 같은 예약어를 사용할 수 없기 때문에,** **HTML, SVG 어트리뷰트 대부분을 캐멀 케이스로 작성**해야 한다.
  - ex) stroke-width → storkeWidth, class → className
- 예외적으로 `data-*` 와 `aria-*` 속성은 그대로 사용할 수 있음
  - `data-*` 개발자가 HTML요소에 추가 정보를 저장하는 용도, 브라우저는 이를 무시하고 작동
  - `aria-*` 장애가 있는 사용자를 위한 보조 기술(스크린 리더 등)을 지원하기 위해 사용. ARIA(Accessible Rich Internet Applications) 웹 접근성을 높이는 표준

---

## JSX에서 중괄호 이용하여 JavaScript 사용하기

JSX를 사용해 마크업 내부에 JavaScript를 추가하거나 동적인 프로퍼티를 참조할 수 있다.

### ✅ 문자열 속성, 자바스크립트 변수 참조하기

```jsx
// 문자열 어트리뷰트는 작은따옴표('') 또는 큰따옴표("")로 묶어서 전달
// 자바스크립트 변수는 중괄호({ })로 감싸서 전달
export default function Avatar() {
  const imgUrl = "https://i.imgur.com/avatar.jpg";
  return <img className="avatar" src={imgUrl} alt="Gregorio Y. Zara" />;
}
```

<br/>

### ✅ JSX안에서 JavaScript 함수 호출하기

```jsx
const today = new Date();

const formatDate(date) = () => {
 return new Intl.DateTimeFormat(
  'en-US',
  { weekday: 'long' }
 ).format(date);
}

export default function TodoList() {
 return (
  <h1>To Do List for {formatDate(today)}</h1>
 )
}
```

> 🚫중괄호 사용할 때 주의
>
> - JSX태그 내 컨텐츠에서 중괄호를 사용할 수 있지만 태그에 직접 사용할 수는 없다.
> - src=”{imgUrl}” 로 쓰면 “{imgUrl}”문자열로 전달된다

<br/>

### ✅ JSX안에서 JavaScript 객체 사용하기

```jsx
export default function TodoList() {
  return (
   // style 어트리뷰트와 같이 객체를 전달할 때는 {{ }} 중괄호를 쌍으로 감싸야함
   // 인라인 스타일 프로퍼티는 캐멀케이스로 작성
    <ul style={{
      backgroundColor: 'black',
      color: 'pink'
    }}>
      <li>Improve the videophone</li>
      <li>Prepare aeronautics lectures</li>
      <li>Work on the alcohol-fuelled engine</li>
    </ul>
  );
```

```jsx
const person = {
  name: "ginger",
  theme: {
    backgroundColor: "green",
    color: "orange",
  },
};
// 객체를 따로 정의하고 중괄호 안에서 참조
export default function TodoList() {
  return (
    <div style={person.theme}>
      <h1>{person.name}</h1>
    </div>
  );
}
```

---

## 컴포넌트에 Props 전달하기

리액트 컴포넌트 함수는 하나의 인자, `props` 객체를 받는다

<br/>

### 자식 컴포넌트에 props 전달하기

```jsx
export default function Profile() {
  return <Avatar person={{ name: "ginger", imgId: "abc123" }} size={100} />;
}
```

<br/>

### 자식 컴포넌트에서 props 읽기

```jsx
// size = 200 으로 디폴트값을 설정할 수 있다
// size prop이 없거나 undefined로 전달될 때 디폴트값으로 설정됨
function Avatar({ person, size = 200 }) {
  return (
    <div>
      <img
        width={size}
        src={"./images/" + person.imgId + ".jpg"}
        alt="profile"
      />
      <h1>{person.name}</h1>
    </div>
  );
}
```

- props가 반복적으로 전달될 때 spread 문법을 사용하면 간결하게 표현 가능

```jsx
function Profile(props) {
  return (
    <div className="card">
      <Avatar {...props} />
    </div>
  );
}
```

<br/>

### 자식을 JSX로 전달하기

JSX 태그 내에 콘텐츠를 중첩하면, 부모 컴포넌트는 해당 콘텐츠를 `children`이라는 prop으로 받는다

- 콘텐츠의 형식에는 제한 없이 중첩된 JSX는 어느 것이든 다 `children` prop으로 받아 렌더링할 수 있다.(다른 컴포넌트가 될 수도, 일반 텍스트가 될 수도 있음)

```jsx
const MyProfile = () => {
  return (
    <div>
      <h1>Photo</h1>
      <img
        className="avatar"
        src="https://i.imgur.com/OKS67lhm.jpg"
        alt="Aklilu Lemma"
        width={70}
        height={70}
      />
    </div>
  );
};

const Card = ({ children }) => {
  return (
    <div className="card">
      <div className="card-content">{children}</div>
    </div>
  );
};

export default function Profile() {
  return (
    <div>
      <Card>
        <MyProfile />
      </Card>
      <Card>
        <h1>About</h1>
        <p>
          Aklilu Lemma was a distinguished Ethiopian scientist who discovered a
          natural treatment for schistosomiasis.
        </p>
      </Card>
    </div>
  );
}
```

<br/>

### 시간에 따라 Props가 변하는 방식

```jsx
export default function Clock({ color, time }) {
  return (
    // 시간의 흐름에 따라 보여지는 time도 계속 바뀜(props의 time이 갱신되기 때문)
    <h1 style={{ color: color }}>{time}</h1>
  );
}
```

- 부모 컴포넌트에서 props로 전달하는 데이터가 변경되면 이전의 props는 버려지고(기존 props가 차지했던 메모리 회수) 새로운 props객체를 전달한다.
- props는 읽기 전용 스냅샷으로 props가 연결된 state를 변경해야한다

<br/>
