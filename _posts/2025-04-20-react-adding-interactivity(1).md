---
title: "React 상호작용 더하기: 이벤트 사용하기, 상태 업데이트하기"

excerpt: "React v19 공식문서-useState 사용법, 리액트의 렌더링 동작방식"

categories:
  - React

tags:
  - [react, react19, jsx, useState, rendering]

permalink: /categories/react/adding-interactivity/

toc: true

toc_sticky: true

date: 2025-04-20

last_modified_at: 2025-04-20
---

## 상호작용 더하기(Adding interactivity)

- 이벤트에 응답하기
- State: 컴포넌트의 기억 저장소
- 렌더링 그리고 커밋

[리액트v19 공식문서-UI 표현하기] <https://ko.react.dev/learn/adding-interactivity>

---

## 이벤트에 응답하기

### 이벤트 핸들러 추가하기

```jsx
const Button = () => {
  // 이벤트 핸들러 함수 선언
  const handleClick = () => {
    alert("you clicked me!");
  };
  // button에 prop형태로 함수 전달
  return <button onClick={handleClick}>Click me!</button>;
};
```

```jsx
const ButtonInlineEvent = () => {
  return (
    // 짧은 함수들을 정의할 땐 JSX내 인라인으로 이벤트 핸들러 정의할 수 있음
    <button onClick={() => alert("you clicked me!")}>
      Inline Event Handler
    </button>
  );
};
```

<br/>

### **이벤트 핸들러 함수의 특징**

- 주로 컴포넌트 내부에서 정의
- 이벤트 핸들러 명명법 : `handle` **+ 이벤트명**

> 🔴 이벤트 핸들러로 전달한 함수들은 호출이 아닌 전달되어야 한다.

```jsx
<button onClick={handleClick}> // 올바른 사용
<button onClick={handleClick()}> // 잘못된 예시(함수 호출하기)

// 인라인으로 이벤트 핸들러 정의할 때
<button onClick={() => alert('...')}> // 올바른 사용
<button onClick={alert('...')}> // 잘못된 예시(함수 호출하기)
```

리액트에서 `<button onClick={handleClick()}>` 처럼 `()`를 붙여서 함수를 전달하면, 클릭이 없어도 컴포넌트가 렌더링되는 순간 즉시 함수가 실행된다.

이는 JSX가 결국 자바스크립트 코드로 변환되기 때문이고, `handleClick()`은 함수의 ‘리턴값’을 전달하게 되어 실행되어 버리기 때문이다. `handleClick()` 함수에 `state`를 변경하는 로직이 포함되어있으면 무한 렌더링 루프가 발생할 수 있다.

따라서 이벤트 핸들러로 전달할 땐 `onClick={handleClick}`처럼 **함수 참조만 전달**해야 사용자가 클릭 이벤트를 발생시킬 때만 실행된다.

<br/>

### **이벤트 핸들러 내에서 Prop 읽기**

이벤트 핸들러는 컴포넌트 내부에서 선언되기 때문에 해당 컴포넌트의 prop에 접근할 수 있다.

```jsx
const AlertButton = ({ message, children }) => {
  // 이벤트 핸들러 alert에서 prop으로 받은 message 사용
  return <button onClick={() => alert(message)}>{children}</button>;
};

const Toolbar = () => {
  return (
    <div>
      <AlertButton message="Playing!">Play Movie</AlertButton>
      <AlertButton message="Uploading!">Upload Image</AlertButton>
    </div>
  );
};
```

<br/>

### **이벤트 핸들러를 Prop으로 전달**

```jsx
// PlayButton과 UploadButton에서 클릭 이벤트 핸들러를 전달
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

const PlayButton = ({ movieName }) => {
  const handlePlayClick = () => {
    alert(`Playing ${movieName}`);
  };
  // 이벤트 핸들러 전달 handlePlayClick -> <Button>의 onClick prop으로
  return <Button onClick={handlePlayClick}>Play "{movieName}"</Button>;
};

const UploadButton = () => {
  // 이벤트 핸들러 전달 () => alert('Uploading') -> <Button>의 onClick prop으로
  return <Button onClick={() => alert("Uploading!")}>Upload Image</Button>;
};

const Toolbar = () => {
  return (
    <div className="toolbar">
      <PlayButton movieName="Kiki's Delivery Service" />
      <UploadButton />
    </div>
  );
};
```

<br/>

### **이벤트 핸들러를 Prop 명명하기**

- `<button>`과 `<div>` 같은 빌트인 컴포넌트는 `onClick`과 같은 브라우저 이벤트 이름만을 지원
- 사용자 정의 컴포넌트에서는 이벤트 핸들러 prop의 이름을 원하는 대로 명명할 수 있음
  - 이벤트 핸들러 prop의 이름은 `on` **+ 영문 대문자** 시작

```jsx
const MyComponent = ({ onSmash }) => {
  return <button onClick={onSmash} />;
};

const App = () => {
  return <MyComponent onSmash={() => alert("click!")} />;
};
```

<br/>

### 이벤트 전파

#### 리액트 Synthetic Event 시스템

리액트는 모든 DOM 이벤트를 루트에서 한 번만 등록하고, 그걸 SyntheticEvent로 감싸서 버블링 처리한다.

SyntheticEvent 시스템은 이벤트 위임(event delegation)방식으로 동작하고, 대부분의 이벤트는 버블링(bubbling)을 통해 부모로 전파된다(onScroll 이벤트 예외).

```jsx
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

const Toolbar = () => {
  return (
    <div
      className="Toolbar"
      onClick={() => alert("You clicked on the toolbar!")}
    >
      // 버튼 클릭시 alert('Playing!') -> alert('You clicked on the toolbar!')
      순으로 실행
      <Button onClick={() => alert("Playing!")}>Play Movie</Button>
    </div>
  );
};

export default Toolbar;
```

⇒ `주의` 컴포넌트 내에서만이 아닌 **컴포넌트 간에도 이벤트 전파가 이루어짐**

- `e.stopPropagation()` : 이벤트가 더 이상 bubbling 되지 않도록 함
- `e.preventDefault()` : 이벤트의 기본 브라우저 동작 실행 방지

<br/>

#### 💡 단계별 이벤트 캡처 - 이벤트 전파는 3단계로 진행된다

1. **캡처 단계(Capture Phase)** : 이벤트가 최상위 요소부터 클릭된 요소까지 내려가면서 `onClickCapture` 와 같은 **Capture 이벤트 핸들러**를 호출한다.
2. **타겟 단계(Target Phase)** : 실제로 클릭한 요소의 `onClick` 핸들러가 실행된다.
3. **버블링 단계(Bubbling Phase)** : 이벤트가 클릭된 요소에서 다시 위로 올라가면서 `onClick` 같은 일반 핸들러들이 호출된다.

```jsx
<div
  onClickCapture={() => {
    console.log("캡처 - div");
  }}
>
  <button onClick={(e) => e.stopPropagation()}>버튼</button>
</div>
```

- `onClickCapture`는 이벤트가 내려올 때 실행됨
- `button`에서 `e.stopPropagation()`을 써서 이벤트 전파를 막아도, 캡처 단계에서 이미 실행된 핸들러는 막을 수 없음 ⇒ `onClickCapture` 와 같은 Capture 이벤트 핸들러는 전파가 막히든 말든 무조건 먼저 실행됨

<br/>

---

## State: 컴포넌트의 기억 저장소

컴포넌트 내 지역 변수는 렌더링 간에 유지되지 않고, 지역변수를 변경하더라도 리액트는 렌더링을 다시 하지 않기 때문에 리액트의 컴포넌트별 메모리인 state가 필요하다.

### `useState` 훅

useState 훅은 `state` 변수, `state setter` 함수를 제공한다.

1. `state` 변수는 렌더링 간에 데이터를 유지한다.
2. `state setter` 함수는 변수를 업데이트하고 리액트가 컴포넌트를 다시 렌더링하도록 유발한다.

#### (1) useState 사용하기

```jsx
import { useState } from "react";
```

- useState는 `state` 변수와 `state setter` 함수 두 가지를 반환한다.

```jsx
const [index, setIndex] = useState(0);
```

- `const [something, setSomething]` 과 같이 지정하는 것이 규칙
- `useState`의 유일한 인수는 `state` 변수의 초깃값이다. 여기서 `index`의 초깃값은 `useState(0)`에 의해 `0`으로 설정된다.

<br/>

#### (2) useState의 작동방식

```jsx
const [index, setIndex] = useState(0);
```

1. 컴포넌트가 처음 렌더링 된다.
   1. `index`의 초깃값으로 `0`을 전달했으므로 `[0, setIndex]`를 반환한다.
2. state를 업데이트한다.
   1. 사용자가 버튼을 클릭하면 `setIndex(index + 1)`을 호출한다.
   2. index가 0이므로 `setIndex(1)`이다.
   3. 리액트는 최신 `index`값을 `1`로 기억하고 **또 다른 렌더링을 유발한다.**
3. 컴포넌트가 두 번째로 렌더링된다.
   1. 리액트는 `index`를 `1`로 설정한 것을 기억하고 있어 이번에는 `[1, setIndex]`를 반환한다.

<br/>

> 🔅 **컴포넌트 내 state가 여러 가지일 때 리액트는 어떻게 상태들을 추적하고 관리할 수 있을까?**<br/>
> ⇒ 리액트는 내부적으로 상태를 `순서` 기반 배열로 추적한다.<br/>
> ⇒ `useState()`는 호출 순서에 따라 각각의 상태를 기억한다.<br/>
> ⇒ 따라서 `useState`는 컴포넌트 최상단에서 항상 같은 순서로 호출되어야한다.

```jsx
function MyComponent() {
  const [count, setCount] = useState(0); // 1번째 상태 => count용 상태
  const [name, setName] = useState(""); // 2번째 상태 => name용 상태
}
```

- `useState`의 작동원리 : 렌더가 시작되면, 상태값을 초기값으로 초기화하고 useState()가 호출될 때마다 다음 인덱스로 넘어가며 상태를 꺼내준다.

```jsx
let stateArray = [0, ""];
let currentIndex = 0;

function useState(initialValue) {
  const index = currentIndex;
  if (stateArray[index] === undefined) {
    stateArray[index] = initialValue;
  }
  const setState = (newValue) => {
    stateArray[index] = newValue;
    render(); // 다시 렌더링
  };
  currentIndex++;
  return [stateArray[index], setState];
}
```

<br/>

#### (3) State is `isolated` and `private`

- `Isolated`: 컴포넌트의 `state`는 **다른 컴포넌트와 공유되지 않는다**. 즉, 컴포넌트의 state는 부모 컴포넌트나 형제 컴포넌트와 같이 다른 컴포넌트에서 직접 접근하거나 수정할 수 없다.
- `Private`: `state`는 **컴포넌트 내부에서만 관리되고 사용된다**. 외부에서 직접 볼 수도, 바꿀 수도 없다.

```jsx
export default function Page() {
  return (
    <div className="Page">
      <Gallery />
      <Gallery />
    </div>
  );
```

- 같은 `Gallery` 컴포넌트를 여러번 사용하더라도 **각 `Gallery` 컴포넌트는 자기만의 `state`를 갖고 서로 영향을 주지 않는다.**
  ⇒ 여러 개의 `Gallery` 컴포넌트가 같은 값을 공유하길 원한다면 부모 컴포넌트인 `Page` 컴포넌트의 `state`값을 prop으로 전달받아 사용해야 한다.

<br/>

### ⛳️ 챌린지 - 불필요한 state 제거하기

```jsx
import { useState } from "react";

export default function FeedbackForm() {
  const [name, setName] = useState("");

  function handleClick() {
    setName(prompt("What is your name?"));
    alert(`Hello, ${name}!`);
  }

  return <button onClick={handleClick}>Greet</button>;
}
```

- `name`은 이벤트 핸들러 내에서 일회성으로 사용하는 변수이기 때문에 **다시 렌더링될 때 상태값을 유지할 필요가 없다.**

```jsx
export default function FeedbackForm() {
  function handleClick() {
    const name = prompt("What is your name?");
    alert(`Hello, ${name}!`);
  }

  return <button onClick={handleClick}>Greet</button>;
}
```

- `주의` 컴포넌트가 다시 렌더링 될 때 정보를 유지하기 위해 `state` 변수가 필요한 것임을 잊지않기
  ⇒ 일반 변수로도 잘 작동할 때 state 변수를 사용하지 않도록 한다.

---

## 렌더링 그리고 커밋

리액트의 렌더링 동작은 3가지 단계를 거친다.

1. 렌더링 `트리거` (손님의 주문을 주방으로 전달)
2. 컴포넌트 `렌더링` (주방에서 주문 준비하기
3. DOM에 `커밋` (테이블에 주문한 요리 내놓기)

### 1단계: 트리거

컴포넌트 렌더링이 일어나는 2가지 이유

1. 컴포넌트의 **초기 렌더링인 경우**
2. 컴포넌트의 **state가 업데이트된 경우**

<br/>

#### (1) 초기 렌더링

- `createRoot`호출 후 `render` 메서드 호출

```jsx
import Image from "./Image.js";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<Image />);
```

<br/>

#### (2) state 업데이트 시 리렌더링

`setState`함수를 통해 상태를 업데이트하여 추가적인 렌더링 트리거

⇒ 컴포넌트 상태를 업데이트하면 자동으로 렌더링 대기열에 추가된다.

<br/>

### 2단계: React 컴포넌트 렌더링

**렌더링?** 리액트에서 컴포넌트를 호출하는 것

- **초기 렌더링**에서 리액트는 `루트 컴포넌트`를 호출한다.
- **이후 렌더링**에서는 리액트는 `state 업데이트가 일어나 렌더링을 트리거한 컴포넌트`를 호출한다.
- 업데이트된 컴포넌트가 다른 컴포넌트를 반환하면, 리액트는 다음으로 해당 컴포넌트를 렌더링하는 식으로 중첩된 컴포넌트가 더 이상 없을 때까지 재귀적으로 렌더링을 처리한다.

<br/>

### 3단계: React가 DOM에 변경사항을 커밋

컴포넌트를 호출한 후 리액트는 DOM을 수정한다.

- **초기 렌더링**에서 리액트는 `appendChild()` DOM API를 사용하여 생성한 모든 DOM 노드를 화면에 표시한다.
- **리렌더링**의 경우 필요한 최소한의 작업을 적용해 DOM이 최신 렌더링 출력과 일치하도록 한다.
  ⇒ **리액트는 렌더링 간에 차이가 있는 경우에만 DOM 노드를 변경한다.**

  ```jsx
  export default function Clock({ time }) {
    return (
      <>
        <h1>{time}</h1>
        <input />
      </>
    );
  }
  ```

  - `time`이 업데이트된 경우 `<h1>`의 내용만 새로 업데이트하고 `<input>`과 `<input>의 value`는 건드리지 않는다

<br/>
