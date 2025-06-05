---
title: "React useEffect에서 발생하는 오래된 값(Stale value) 버그: 클로저로 인한 상태 갇힘 현상과 해결 방법"

excerpt: "React v19 공식문서 useEffect 챌린지로 배우는 클로저와 상태 관리의 핵심"

categories:
  - React

tags:
  - [react, react19, jsx, effect, closure, stale value]

permalink: /categories/react/how-to-solve-stale-value-bug/

toc: true

toc_sticky: true

date: 2025-06-02

last_modified_at: 2025-06-02
---

## 리액트에서 발생하는 "오래된 값 버그(stale value bug)" 해결하기

이 포스팅은 리액트 공식문서에서 `useEffect` 챕터의 챌린지 문제(오래된 값 버그 조사하기)에서 등장하는 클로저와 `stale value`(오래된 상태) 문제에 대한 분석을 하고, 해결책을 안내합니다. 꼭 useEffect를 쓰지 않더라도 리액트로 개발을 하다 분명히 상태를 바꿨는데도 이벤트 핸들러에서 여전히 예전 값을 쓰는 이상한 현상을 마주해본 적이 있다면 이 글이 도움이 될 것 같습니다.

[챌린지 문제 링크 - React v19 공식문서](https://ko.react.dev/learn/lifecycle-of-reactive-effects#challenges)

---

### 클로저는 "기억 상자"

클로저는 외부 함수의 변수에 접근할 수 있는 내부 함수이다. 자바스크립트에서 함수는 생성될 때 **자신이 선언된 렉시컬 스코프(lexical scope)**를 기억한다.

```javascript
function outer() {
  let count = 0;
  return function inner() {
    console.log(count);
  };
}
const fn = outer();
fn(); // 0
```

<br/>

### useEffect안에서의 클로저

useEffect는 컴포넌트가 렌더링된 후 실행되는 사이드 이펙트를 등록하는 함수이다. 이 때 내부에서 사용되는 변수들이 클로저로 캡처된다.

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 이 count는 클로저로 캡처됨
    }, 1000);

    return () => clearInterval(id);
  }, []);
}
```

- 위 코드에서 `setInterval` 안의 `console.log(count)`는 `useEffect`가 처음 실행될 당시의 `count` 값을 클로저로 기억합니다. `count`가 나중에 바뀌어도, 이 클로저는 예전 값을 계속 참조한다.
- 특히 이 코드는 의존성 배열이 `[]`이기 때문에, `count`가 처음 렌더링 시점의 값으로만 클로저에 캡처되어 이후에 `count`가 바뀌어도 `setInterval` 안에서는 감지하지 못한다.<br/>
  => 의존성 배열을 명확히 작성해야함!

<br/>

### 리액트에서의 클로저

클로저의 개념은 자바스크립트나 리액트에서나 동일하다. 다만 리액트 컴포넌트는 상태가 바뀔 때마다 전체 컴포넌트 함수가 다시 호출되고, 이때마다 `useEffect`, `event handler`, `callback` 등이 새로운 클로저를 만든다. 이는 의도하지 않은 "이전 값에 갇힘(`stale closure`)" 문제를 일으킬 수 있기 때문에 클로저 개념을 정확히 알고 상태 관리를 해야 한다.

---

###  🚩챌린지: 오래된 값 버그 조사하기(Stale Value Bug)

🧪 체크박스를 꺼도 동작이 포인터가 계속 움직이는 문제 해결하기

{% raw %}

```jsx
import { useState, useEffect } from "react";

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  function handleMove(e) {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }

  useEffect(() => {
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={canMove}
          onChange={(e) => setCanMove(e.target.checked)}
        />
        The dot is allowed to move
      </label>
      <hr />
      <div
        style={{
          position: "absolute",
          backgroundColor: "pink",
          borderRadius: "50%",
          opacity: 0.6,
          transform: `translate(${position.x}px, ${position.y}px)`,
          pointerEvents: "none",
          left: -20,
          top: -20,
          width: 40,
          height: 40,
        }}
      />
    </>
  );
}
```

{% endraw %}

**🐞 `문제원인`**

- `useEffect`는 컴포넌트가 처음 렌더링될 때 딱 한 번 실행됨
- 그 때 `handleMove`가 이벤트 리스너로 등록됨
- `handleMove`는 컴포넌트가 렌더링될 때 정의되고, 이 때의 `canMove` 값을 클로저로 캡처함<br/>
  => `canMove` 값이 갱신되더라도 `handleMove`는 컴포넌트가 처음 마운트되어 등록될 때의 `canMove`값을 기억하고 있음
  => `stale value bug`

<br/>

⇒ [`🔺해결1`] **유지보수 측면에서 잠재적 위험이 있음**

```jsx
function handleMove(e) {
  setPosition({ x: e.clientX, y: e.clientY }); // ✅ canMove 체크 없음
}

useEffect(() => {
  if (!canMove) return; // ✅ 여기서만 판단

  window.addEventListener("pointermove", handleMove);
  return () => window.removeEventListener("pointermove", handleMove);
}, [canMove]); // ✅ 의존성 배열에 canMove 포함
```

- `handleMove`에서 `canMove`를 체크하지 않기 때문에 반드시 이벤트 등록 자체를 상태로 컨트롤해야 하는데 의존성 배열에 `canMove`가 누락되면 위험해짐
- `useEffect는` 처음 실행될 떄의 `handleMove를` 클로저로 캡처하여 등록하며, 이후 `canMove가` 바뀌더라도 이 핸들러는 갱신되지 않음
- 이 코드도 작동은 잘 되지만 `handleMove` 내부에서 나중에 다른 상태를 참조하게 된다면, **버그 발생 가능성이 커짐**

<br/>

⇒ [`💡해결2`] **더 안전하고 리액트의 동작 방식에 맞음!**

```jsx
useEffect(() => {
  function handleMove(e) {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }

  window.addEventListener("pointermove", handleMove);
  return () => window.removeEventListener("pointermove", handleMove);
}, [canMove]);
```

- `handleMove`를 `useEffect` 안에서 선언하고 바로 이벤트에 등록
- `canMove`값을 직접 내부에서 사용
- 최신 `canMove`값에 안전하게 접근 가능 : `handleMove` 함수는 `useEffect` 실행 시점에 함께 정의되므로, 그 클로저에는 항상 최신 `canMove`가 포함됨
- 의존성 관리가 명확 : `canMove`가 바뀌면 `useEffect`도 다시 실행되고, 그 안의 `handleMove`도 재정의 및 재등록되므로 클로저가 새로 갱신됨

<br/>

⇒ [`💡해결3`] **useCallback 사용하기**

```jsx
const handleMove = useCallback(
  (e) => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  },
  [canMove]
);

useEffect(() => {
  window.addEventListener("pointermove", handleMove);
  return () => window.removeEventListener("pointermove", handleMove);
}, [handleMove]);
```

- `useCallback`은 `canMove`가 바뀔 때마다 새로운 `handleMove`함수를 생성
- 이렇게 생성된 `handleMove`는 최신 `canMove` 값을 포함하는 클로저가 되고,
- `useEffect`는 `handleMove를` 의존성으로 가지므로 리스너도 자동으로 교체된다.

<br/>

⇒ [`💡해결4`] **Effect Event 사용하기**

> 🔴 아직 안정된 버전의 React에 출시되지 않은 실험적인 API <br/>
> [리액트 공식문서 - Effect Event](https://ko.react.dev/learn/separating-events-from-effects)

```jsx
const onMove = useEffectEvent((e) => {
  if (canMove) {
    setPosition({ x: e.clientX, y: e.clientY });
  }
});

useEffect(() => {
  window.addEventListener("pointermove", onMove);
  return () => window.removeEventListener("pointermove", onMove);
}, []);
```

- `useEffectEvent`는 매번 렌더링 시 최신 상태를 유지하면서도 `useEffect` 안에서 클로저가 고정되는 문제를 방지하기 위해 사용된다.
- `Effect Event`로 선언된 onMove 함수는 내부의 로직은 반응형이 아니면서 항상 최신 `state`값(`canMove`)을 바라본다.
