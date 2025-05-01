---
title: "React 상태 업데이트와 비동기 작업: 함수형 업데이트의 중요성"

excerpt: "비동기 작업에서의 배칭 처리 이해하기, 함수형 업데이트를 사용해야 하는 이유"

categories:
  - React

tags:
  - [react, react19, jsx, setState, queueing, batching]

permalink: /categories/react/how-to-manage-state-in-async-function/

toc: true

toc_sticky: true

date: 2025-05-01

last_modified_at: 2025-05-01
---

## React 상태 업데이트와 비동기 작업

리액트 공식문서의 챌린지 문제를 풀다가 비동기 작업에서 리액트가 배칭 처리를 어떻게 하는지 정확히 이해가 가지 않아 좀 더 찾아보았다.

- 비동기 작업에서 리액트가 배칭 처리하는 방식
- 배칭 처리와 리렌더링
- 그래서 함수형 업데이트를 사용하는게 안전한 이유

[챌린지 문제 링크 - React v19 공식문서](https://ko.react.dev/learn/queueing-a-series-of-state-updates#challenges)

## 🚩챌린지 : State 업데이트 큐와 비동기 작업

[`문제 코드`] 요청 카운터를 고쳐보세요.

```jsx
import { useState } from "react";

export default function RequestTracker() {
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);

  async function handleClick() {
    setPending(pending + 1);
    await delay(3000);
    setPending(pending - 1);
    setCompleted(completed + 1);
  }

  return (
    <>
      <h3>Pending: {pending}</h3>
      <h3>Completed: {completed}</h3>
      <button onClick={handleClick}>Buy</button>
    </>
  );
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

- `await delay(3000)` 으로 `setPending(pending -1)`과 `setCompleted(completed + 1)` 이 3초 후에 실행되지만 실행되는 시점의 state값이 아닌 비동기 코드가 예약된 당시의 state 값이 사용되어 버그가 발생한다.

🔽 [`정답 코드`]

```jsx
import { useState } from "react";

export default function RequestTracker() {
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0);

  async function handleClick() {
    setPending((p) => p + 1);
    await delay(3000);
    setPending((p) => p - 1);
    setCompleted((c) => c + 1);
  }

  return (
    <>
      <h3>Pending: {pending}</h3>
      <h3>Completed: {completed}</h3>
      <button onClick={handleClick}>Buy</button>
    </>
  );
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

- 정답은 아래와 같이 `함수형 업데이트`를 사용하는 것이다.

```jsx
setPending((p) => p + 1);
await delay(3000);
setPending((p) => p - 1);
setCompleted((c) => c + 1);
```

---

> 🤔 처음에 모호했던 부분은 `setCompleted((c) => c + 1)`이었는데,, `setCompleted`는 이벤트 핸들러에서 한번만 실행하는 코드인데 꼭 함수형 업데이트를 써야할까? `setCompleted(completed + 1)` 와 같이 값 기반 업데이트도 똑같이 동작하지 않을까?

이때는 함수형 업데이트는 하나의 렌더링 안에서 (한 가지 종류의?)state를 연속적으로 업데이트하고 싶을 때 사용한다고 이해해서, `setCompleted(c ⇒ c + 1)`과 같은 경우는 이벤트 핸들러 내 1번만 실행되는 코드니까 이전 값을 참조할 필요가 없다고 생각했다.

그러나 여기서도 `setCompleted(c ⇒ c + 1)`로 함수형 업데이트를 해야 정확하게 동작하는데 이는 비동기 작업 `await delay(3000)` 때문이다.

3초 안에 연속적으로 3번을 클릭한다고 했을 때 동작 방식은 아래와 같다.

| 시간(ms)     | 이벤트                                                      |
| ------------ | ----------------------------------------------------------- |
| 0ms          | **첫 번째 클릭** - pending +1 예약                          |
| 100ms        | **두 번째 클릭** - pending +1 예약                          |
| 200ms        | **세 번째 클릭** - pending +1 예약                          |
| 0~200ms 동안 | 각 클릭마다 `await delay(3000)`에 걸려서 3초 기다리는 중    |
| 3000ms       | **첫 번째 클릭**의 3초 완료 → pending -1, completed +1 예약 |
| 3100ms       | **두 번째 클릭**의 3초 완료 → pending -1, completed +1 예약 |
| 3200ms       | **세 번째 클릭**의 3초 완료 → pending -1, completed +1 예약 |

리렌더링이 완료되기 전에 `handleClick`이 여러 번 호출되면, `completed + 1`은 현재 렌더링 시점의 `completed`값(`0`)만 계속 참조하게 된다. 그래서 `setCompleted(completed + 1)`을 연속해서 호출해도 모두 옛날 `0`을 기준으로 계산해버려서 예상한 결과가 나오지 않는다.

반면, 함수형 업데이트(`c ⇒ c + 1`)를 사용하면, 가장 최신의 `state`를 매번 받아서 업데이트하기 때문에 여러 번 비동기적으로 호출돼도 정확하게 값이 누적된다.

⇒ 따라서 비동기 작업 중 `state`를 업데이트할 때는 **항상 함수형 업데이트를 사용하는 것이 안전하다**.

---

> 🤔 여기서 해결되지 않은 의문점 2
> **리액트의 배칭처리에 따르면 이벤트 핸들러가 모두 끝날 때까지 기다린 다음에 한 번에 state 업데이트를 처리해서 리렌더링을 요청**한다고 하는데, 어떻게 클릭과 동시에(= `await delay(3000)` 후의 코드가 실행되기 전에) 화면에서 `pending` 값이 `0 → 1 → 2 → 3` **즉각적으로 변한걸까?**

```jsx
async function handleClick() {
  setPending((p) => p + 1); // (1) pending +1 예약
  await delay(3000); // (2) 3초 기다리기 (여기서 "멈춤")
  setPending((p) => p - 1); // (3) 3초 뒤에 실행
  setCompleted((c) => c + 1); // (4) 3초 뒤에 실행
}
```

- `setPending(p ⇒ p + 1)`을 호출하면 곧바로 `pending` state 업데이트를 예약
- 핸들러 함수가 `await delay(3000)`을 만나면서 **일시정지**됨
- ⇒ 리액트는 현재로서 더 이상 실행할 코드가 없다고 판단하고 **리렌더링을 요청**함
- 3초 후, 남은 코드를 이어서 실행(이때 `setPending((p) => p - 1)`와 `setCompleted((c) => c + 1)`은 배칭처리되어 한번에 처리됨) => **다시 렌더링**

간단히 비유하자면,

- `await`가 없으면:
  → "손님 주문 다 받을 때까지 서빙 안 함."
- `await`가 있으면:
  → "주문 하나 받고 잠깐 서빙하고, 다시 돌아와서 나머지 주문 받음."

## ✨결론

```jsx
function handleClick() {
  setPending((p) => p + 1);
  setPending((p) => p - 1);
  setCompleted(completed + 1);
}
```

- 만약 비동기로 동작하는 코드가 아니라면 `setCompleted(completed + 1)`는 함수형 업데이트를 사용하지 않더라도 `handleClick` 내 코드가 다 실행된 후 리렌더링 때 한번에 상태를 업데이트하기 때문에 문제가 없을 것이다.
- 여전히 `pending`은 누적된 값을 처리해야하기 때문에 함수형 업데이트를 사용해야하고, 다만 이 경우에는 배칭처리로 화면상에서는 `0 -> 1 -> 0` 으로 숫자 변화가 보이지 않고 `0`으로 변화가 없는 것처럼 보일 것이다.

```jsx
async function handleClick() {
  setPending((p) => p + 1);
  await delay(3000);
  setPending((p) => p - 1);
  setCompleted((c) => c + 1);
}
```

- 이벤트 핸들러에 비동기로 동작하는 코드가 있다면 비동기 코드를 만나 일시정지가 일어나기 전까지 예약된 `state` 업데이트들은 먼저 처리가 되고(배칭 처리 깨짐) 일시정지가 풀린 이후의 `state` 업데이트들도 한번에 배칭 처리가 되어 리렌더링이 되며 처리가 될 것이다. 주의할 점은 일시정지가 풀린 이후 업데이트 되는 `state`들도 예약된 당시의 `state`값을 참조하기 때문에 이렇게 비동기로 작동하는 코드들은 항상 함수형 업데이트를 사용하는 것이 안전하다.

> **state 업데이트가 이전 값을 기준으로 누적되어야 하거나, 비동기 흐름에서 참조되는 경우에는 반드시 함수형 업데이트를 사용해야 한다.**
