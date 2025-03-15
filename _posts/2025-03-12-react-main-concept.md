---

title: "React 주요 개념 훑어보기"

excerpt: "React 공식문서 읽기 스터디(1주차)-빠르게 시작하기"

  

categories:

- React

tags:

- [react, react19, react concept, jsx, react hook]

  

permalink: /categories/react/react-concept/

  

toc: true

toc_sticky: true

  

date: 2025-03-15

last_modified_at: 2025-03-15

---

## 리액트 핵심 개념

- 리액트 컴포넌트
- JSX
- 조건부 렌더링
- 리스트 렌더링
- useState

[리액트v19 공식문서-빠르게 시작하기](https://ko.react.dev/learn)

***

### 1️⃣ 컴포넌트 만들고 중첩하는 방법

**리액트 컴포넌트 ?** 리액트 앱은 컴포넌트로 구성되며 컴포넌트는 마크업을 반환하는 자바스크립트 함수이다.

```jsx
function MyButton () {
	return (
		<button>I'm a button</button>
	)
}

export default function MyApp () {
	return (
		<div>
			<MyButton />
		</div>
	)
}
```

✅ 리액트 컴포넌트 규칙

- 컴포넌트 이름은 항상 대문자로 시작
- **Export default** 키워드는 파일의 기본 컴포넌트를 의미

### 2️⃣ 마크업과 스타일을 추가하는 방법

**JSX ?** JSX(JavaScript XML)는 리액트의 마크업 문법, JSX를 사용하면 자바스크립트에 마크업을 넣을 수 있으며 코드에 변수를 삽입할 수 있다. css 클래스는 JSX태그에 className이라는 속성으로 지정한다.

✅ 유의사항

- 컴포넌트는 여러 개의 JSX태그를 반환할 수 없다. ⇒ <div>…</div> 또는 <>…</> 처럼 래퍼로 감싸 최상위 태그를 하나만 둬야한다.

### 3️⃣ 데이터를 표시하는 방법

- 중괄호 { } 를 사용해 마크업, jsx 속성, style에 데이터 연결

```jsx
return (
	<div>
		<h1>{user.name}</h1>
		<img
			src={user.imageUrl}
			alt={'Photo of ' + user.name}
			style={{
				width: user.imageSize,
				height: user.imageSize
			}}
		/>
	</div>
)
```

### 4️⃣ 조건과 리스트를 렌더링하는 방법

### 조건부 렌더링

- if 문 사용
- 조건부 삼항 연산자, && 연산자 사용 ⇒ jsx에서 사용

---

### 리스트 렌더링

- for문 또는 map()함수 사용

```jsx
const listItems = products.map(product =>
	<li key={product.id}>
		{product.title}
	</li>
)

return (
	<ul>{listItems}</ul>
)
```

✅ 유의사항

- 리스트 렌더링할 때 반복되는 컴포넌트에 **key** 를 지정
- key는 리액트가 각 컴포넌트를 구별할 수 있게 하여 컴포넌트가 다시 렌더링될 때 리액트가 해당 컴포넌트의 state를 유지할 수 있게 함. 컴포넌트의 key가 변하면 컴포넌트는 제거되고 새로운 state와 함께 다시 생성됨.
- key는 해당 컴포넌트의 형제 컴포넌트 사이에서 고유해야 함.

### 5️⃣ 이벤트에 응답하고 화면을 업데이트 하는 방법

### 이벤트 핸들러 함수

```jsx
function MyButton() {
	function handleClick() {
		alert('click!')
	}
	
	return (
		<button onClick={handleClick}></button>
	)
}
```

✅ 규칙

- 이벤트를 나타내는 prop은 onSomething 포맷으로 사용
- 이벤트를 처리하는 함수는 handleSometing 포맷으로 사용

✅ 유의사항

- onClick={handleClick}  함수를 props로 전달하는 것 (올바른 방법)
- onClick={handleClick(0)} 함수를 호출하는 것 (틀린 방법, 무한 루프)
    - handleClick이 state값을 업데이트하는 로직을 실행시키는 경우 재렌더링되는데 그 때 다시 handleClick(0)이 실행되며 무한 루프에 빠지게 됨
- onClick={() ⇒ handleClick(0)} props로 함수를 전달하되, 클릭 이벤트시 handleClick(0)이 실행되도록 함

---

### 화면 업데이트(useState)

**useState ?** 리액트에서 컴포넌트의 상태(state)를 관리하는 기능. 변할 수 있는 값을 저장하고 업데이트할 때 사용

```jsx
import { useState } from 'react';

function MyButton() {
	const [count, setCount] = useState(0);
}
```

- count 라는 상태를 만들고 초기값을 0으로 설정
- setCount(새로운 값) 함수로 값을 업데이트 함 ⇒ 자동으로 화면도 업데이트
- 현재 상태를 기반으로 새로운 상태를 만들 때는 setCount(prevCount ⇒ prevCount + 1); 과 같이 이전 상태를 가져와서 업데이트할 수 있음

✅ 유의사항

- 같은 컴포넌트를 여러 번 렌더링하면 컴포넌트는 각각의 고유한 state를 갖게된다.
- setState(업데이트 함수)는 비동기로 실행되며 Promise를 반환하지 않는다. ⇒ 값 업데이트 후 실행할 코드가 있다면 useEffect나 setState(prev ⇒ { }) 함수형 업데이트 사용

### 6️⃣ 컴포넌트 간에 데이터를 공유하는 방법

### State 끌어올리기

- 형제 컴포넌트 간에 하나의 state를 공유해야할 때 부모 컴포넌트로 state를 끌어올려 공유할 수 있다. 자식 컴포넌트에서는 부모 컴포넌트로부터 state값을 props로 받아 표시할 수 있다.

```jsx
import { useState } from 'react';

export default function MyApp() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <h1>Counters that update together</h1>
      <MyButton count={count} onClick={handleClick} />
      <MyButton count={count} onClick={handleClick} />
    </div>
  );
}

function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}>
      Clicked {count} times
    </button>
  );
}
```
