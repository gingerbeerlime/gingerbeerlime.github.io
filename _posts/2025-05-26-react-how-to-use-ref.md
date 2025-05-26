---
title: "React 상태 관리를 더 깊게: Ref 사용하기"

excerpt: "React v19 공식문서-Ref로 값 참조하기, Ref로 DOM 조작하기"

categories:
  - React

tags:
  - [react, react19, jsx, ref]

permalink: /categories/react/how-to-use-ref/

toc: true

toc_sticky: true

date: 2025-05-26

last_modified_at: 2025-05-26
---

## 탈출구(Escape Hatches)

- Ref로 값 참조하기
- Ref로 DOM 조작하기

[리액트 v19 공식문서-State 관리하기] <https://ko.react.dev/learn/referencing-values-with-refs>

---

## Ref로 값 참조하기

> 💡 컴포넌트가 어떤 정보를 기억해야 하지만, 그 정보가 새로운 렌더링을 발생시키지 않도록 하고 싶을 때

<br/>

### `useRef` 훅 사용하기

```jsx
import { useRef } from "react";

export default function Counter() {
  const ref = useRef(0);

  function handleClick() {
    ref.current = ref.current + 1;
  }

  return <Button onClick={handleClick}>Click me!</Button>;
}
```

- `useRef`는 `{ current: 0 }` 과 같은 객체를 반환한다 → `ref.current = 0`
- `ref`값은 읽고 편집할 수 있으며, **리액트가 추적하지 않는 컴포넌트의 비밀포켓**과 같은 역할을 한다 ⇒ 값이 변경되더라도 **컴포넌트를 다시 렌더링하지 않음**
- `ref`는 모든 종류의 값을 가리킬 수 있다.

<br/>

### Ref와 State를 함께 사용하기 : 스톱워치 예시

```jsx
import { useState, useRef } from "react";
import { Button } from "@/components/common/Button";

const Stopwatch = () => {
  // startTime은 secondsPassed를 계산하기 위한 기준값
  const [startTime, setStartTime] = (useState < number) | (null > null);
  const [now, setNow] = (useState < number) | (null > null);
  const intervalRef = (useRef < NodeJS.Timeout) | (undefined > undefined);

  const handleStart = () => {
    // 스톱워치 시작
    setStartTime(Date.now());
    setNow(Date.now());

    // 기존 Interval ID가 있다면 취소
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  };

  const handleStop = () => {
    // 스톱워치 종료: Interval 제거
    clearInterval(intervalRef.current);
  };

  let secondsPassed = 0;

  // 흐른 시간 계산
  if (startTime !== null && now !== null) {
    secondsPassed = (now - startTime) / 1000;
  }

  return (
    <>
      <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
      <Button onClick={handleStart}>Start!</Button>
      <Button onClick={handleStop}>Stop!</Button>
    </>
  );
};

export default Stopwatch;
```

```jsx
const [startTime, setStartTime] = useState<number | null>(null)
const [now, setNow] = useState<number | null>(null)

const intervalRef = useRef<NodeJS.Timeout | undefined>()
```

- **렌더링에 사용되는 정보**들은 변경될 때 UI에 반영이 되어야하므로 `State`로 관리
- 스톱워치를 새로 시작하거나 정지할 때 `setInterval` 호출로 반환된 `Interval ID` 필요 ⇒ `Interval ID`는 **렌더링에 사용되는 값이 아니기 때문에** `Ref`로 저장할 수 있다.
  - ⇒ 이벤트 핸들러에게만 필요한 정보이고 변경이 일어날 때 리렌더링이 필요하지 않다면, `Ref`를 사용하는 것이 더 효율적

<br/>

> ### 🤔 스톱워치에서 `startTime`은 `handleStart` 이벤트가 실행될 때 한 번만 세팅되고 그 이후로는 변하지 않는 값인데 `State`말고 `Ref`로 관리하는 것이 더 효율적이지 않을까?
>
> - `now`가 변경될 때마다 UI 리렌더링이 트리거됨
> - `startTime`은 `secondsPassed = now - startTime` 계산을 위한 기준값이므로, 자체적으로는 리렌더링을 발생시킬 필요가 없어 보임
> - 실제로 `ref`로 바꿔도 동작에는 문제 없음
>
> ### ⇒ 그러나 아래 이유들로 `startTime`도 `state`로 관리하는 것 적절함
>
> 1. `handleStart` 실행시 화면이 반드시 리렌더링되어야 함
>    1. 버튼을 클릭해 `startTime`과 `now` 모두 새로 설정되면, 이 변경 사항을 기반으로 화면에 새로운 시간 정보가 즉시 반영되어야 함
> 2. `secondsPassed`가 `now - startTime`으로 계산되는 값이기 때문에 **UI결과에 영향을 주는 값**
> 3. `now`와 `state`는 둘 다 시간값을 다루며, 함께 `secondsPassed` 계산에 사용되기 때문에 동일하게 `state`로 관리하는 것이 이벤트 흐름과 상태 변화를 명확히 표현할 수 있다.
> 4. `ref` 사용은 마지막 수단이 되어야 함. 기본적으로는 리액트의 기본 흐름(state, props, effects)을 따라야 한다.

<br/>

### Ref와 State의 차이

| Ref                                                                                 | State                                                                                    |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| useRef(initialValue)는 `{ current: initialValue }` 반환                             | useState(initialValue)는 State 변수의 현재 값과 Setter 함수 `[value, setValue]`를 반환   |
| 값 변경 시 **리렌더링 트리거 X**                                                    | 값 변경 시 **리렌더링 트리거 O**                                                         |
| **Mutable**: 렌더링 프로세스 외부에서 `current`값 업데이트 가능                     | **Immutable**: State를 수정하기 위해서는 `setState`를 사용해 리렌더링 대기열에 넣어햐 함 |
| 렌더링 중에는 `current` 값을 읽거나 쓰면 안됨(이벤트 핸들러나 useEffect안에서 변경) | 언제든지 `State`를 읽을 수 있음. 각 렌더링마다 변경되지 않는 **State의 스냅샷**이 있음   |

<br/>

### useRef의 작동방식

```jsx
// Inside of React
function useRef(initialValue) {
  const [ref, unused] = useState({ current: initialValue });
  return ref;
}
```

`useRef`는 항상 `{ current : initialValue }`를 반환하므로 **state setter 함수가 없는** `state` 변수라고 생각할 수 있다.

<br/>

### Ref 잘 사용하기

#### (1) Ref는 마지막 수단처럼 사용

- Ref는 외부 시스템이나 브라우저 API로 작업할 때 유용한 도구이다.
- 앱의 주요 로직이나 데이터 흐름에 ref를 남용해서는 안된다.

> ✅ 대표적인 ref 사용 예시
>
> - DOM에 직접 접근해야 할 때 ex) input에 포커스 주기
> - 외부 라이브러리와 연결할 때 ex) chart.js, map API 등
> - 특정 값을 렌더링과 상관없이 기억하고싶을 때 ex) 이전 값을 기억하거나 타이머 ID 저장 등

<br/>

#### (2) 렌더링 중엔 `ref.current`를 읽거나 쓰지 말 것

- `ref.current`을 렌더 중에 사용하거나 바꾸면, React 입장에서 예측이 어려워짐 → 렌더링 중에 필요한 값은 `useState`로 관리
- `if (!ref.current) ref.current = new Thing()`과 같은 코드는 첫 번째 렌더링 중에 Ref를 한 번만 설정하는 경우라 예외

<br/>

#### (3) `ref`는 즉시 값이 바뀜

- `useState`는 값이 바로 안 바뀌고, 다음 렌더에 반영되지만 `ref`는 일반 객체처럼 동작해 즉시 값이 바뀜

```jsx
ref.current = 5;
console.log(ref.current); // 5
```

<br/>

#### (4) `ref` 내부 값을 마음대로 바꿔도 괜찮음

- 리액트는 변형하는 객체를 렌더링에 사용하지 않는 한, `ref`를 어떻게 처리하든 신경쓰지 않음

---

## Ref로 DOM 조작하기

### Input에 포커스 이동하기

```jsx
import { useRef } from "react";

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      // input의 DOM노드를 inputRef.current에 넣어줌
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  );
}
```

<br/>

### 한 컴포넌트는 여러 개의 ref를 가질 수 있다

- 그러나 `useRef`는 React Hook이므로 **컴포넌트의 최상단에서만 호출**해야 하며, 반복문, 조건문, `map()` 함수 안에서는 호출할 수 없다
- **ref 콜백**을 사용하여 ref 리스트 관리하기

  ```jsx
  function getMap() {
    if (!itemsRef.current) {
      itemsRef.current = new Map();
    }
    return itemsRef.current;
  }
  ```

  ```jsx
    <ul>
      {catList.map((cat) => (
       {/* ref로 함수 전달 */}
        <li
          key={cat}
          ref={(node) => {
            const map = getMap();
            map.set(cat, node);

            return () => {
              map.delete(cat);
            };
          }}
        >
          <img src={cat} />
        </li>
      ))}
    </ul>
  ```

  - `key - cat` / `value - DOM 노드(<li>)` 형태로 **Map**에 저장 → itemsRef는 여러개의 DOM 노드 정보를 가짐
    - DOM 요소가 **마운트**될 때 → `map.set(cat, node)`
    - DOM 요소가 **언마운트**될 때 → `map.delete(cat)`(클린업 함수) → node는 null이 됨
  - `const node = map.get(cat)`으로 해당 고양이 이미지 노드를 찾아 스크롤할 수 있다.

<br/>

### 다른 컴포넌트의 DOM 노드 접근하기

- 컴포넌트는 기본적으로 자신의 DOM 노드를 외부에 노출하지 않는다.
- ⇒ `ref` **prop**을 사용하여 DOM노드를 노출하도록 선택할 수 있다

> ⚠️ React 18까지는 `forwardRef`를 반드시 사용해야했지만, React 19부**터는** 필요하지 않음(향후 deprecated 예정)

<br/>

```jsx
import { useRef } from "react";

function MyInput({ ref }) {
  // 3. 실제 DOM 요소에 props로 받은 ref 전달
  return <input ref={ref} />;
}

export default function MyForm() {
  // 1. 부모 컴포넌트에 ref 선언
  const inputRef = useRef(null);

  // 4. 이벤트 핸들러에서 다른 컴포넌트의 DOM 조작 가능
  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      {/* 2. props로 ref 전달 */}
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  );
}
```

<br/>

🔴 **다른 컴포넌트의 DOM 노드의 일부만 조작 가능하도록 제한하기** - `useImperativeHandle` 훅

```jsx
import { useRef, useImperativeHandle } from "react";

function MyInput({ ref }) {
  const realInputRef = useRef(null);
  // props로 전달된 ref에 조작 제한
  useImperativeHandle(ref, () => ({
    focus() {
      realInputRef.current.focus();
    },
  }));
  return <input ref={realInputRef} />;
}

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus(); // OK
    // inputRef.current.style.color = 'red' -> CANNOT
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  );
}
```

- `useImperativeHandle(ref, createHandle)`로 사용
- `createHandle()`함수는 객체를 반환하고, 그 객체가 부모에서 `ref.current`로 접근 가능한 값이 됨
- 이 값은 일반적으로 DOM 노드가 아닌 **직접 정의한 메서드나 속성**만 포함
- 이 코드에서 `ref.current`는 `focus()`만 가진 객체 => 부모 컴포넌트는 `inputRef.current.focus()`는 가능하지만 `inputRef.current.style.color = ‘red’`와 같은 조작은 할 수 없다

<br/>

### **🔁 리액트가 업데이트를 처리하는 2단계**

1. **렌더 단계**(render phase)
   1. 컴포넌트를 실행해서 어떻게 보여야 할지 계산(설계도 그림)
   2. 이 때 DOM은 건드리지 않음
   3. **ref.current = null** 인 상태
2. **커밋 단계**(commit phase)
   1. 계산된 결과를 바탕으로 실제 DOM에 적용
   2. 이 때 **ref.current에 실제 DOM이 들어감**

```jsx
function MyComponent() {
  const inputRef = useRef(null);
  // ❌ 렌더링 중에는 inputDOM이 아직 들어지지 않았기 때문에 null
  console.log(inputRef.current);

  return <input ref={inputRef} />;
}
```

- **⇒ Ref는 이벤트 핸들러나 `useEffect` 안에서 사용**

<br/>

> 🔴 **리액트가 관리하는 DOM노드를 직접 변경하는 것을 주의!**
>
> - 꼭 리액트가 관리하는 DOM을 직접 수정해야 한다면, 리액트가 업데이트할 이유가 없는 부분만 수정해야 한다

<br/>

### `flushSync`로 `state` 변경을 동적으로 플러시하기

```jsx
function handleAdd() {
  const newTodo = { id: nextId++, text: text };
  setText("");
  setTodos([...todos, newTodo]);
  listRef.current.lastChild.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}
```

⇒ 상태 변경 함수(`setTodos`)는 비동기적이며, 리렌더링은 `handleAdd()`의 실행이 끝났을 때 일어나기 때문에 스크롤 이동은 `state`가 실제로 변경되기 전에 발생한다.

⇒ 마지막 항목이 아닌 마지막 직전 항목으로 스크롤 이동

🔫 `flushSync`를 사용하면 감싼 코드가 실행된 직후 리액트가 **즉시 리렌더링 및 DOM 업데이트** 수행

```jsx
function handleAdd() {
  const newTodo = { id: nextId++, text: text };
  flushSync(() => {
    setText("");
    setTodos([...todos, newTodo]); // => 리렌더링 + DOM 업데이트 후 다음 코드 실행
  });
  listRef.current.lastChild.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}
```
