---
title: "React에서 useEffect 사용하기: useEffect 언제, 왜, 어떻게 사용해야할까"

excerpt: "React v19 공식문서-useEffect 동기화, 불필요한 사용, 라이프사이클"

categories:
  - React

tags:
  - [react, react19, jsx, ref]

permalink: /categories/react/how-to-use-effect/

toc: true

toc_sticky: true

date: 2025-06-02

last_modified_at: 2025-06-02
---

## 탈출구(Escape Hatches)

- Effect로 동기화하기
- Effect가 필요하지 않은 경우
- 리액트 Effect의 생명주기

[리액트 v19 공식문서-State 관리하기] <https://ko.react.dev/learn/synchronizing-with-effects>

---

## Effect로 동기화하기

### ✅ 리액트 컴포넌트의 2가지 로직 유형

1. **렌더링 코드**
   1. JSX를 props와 state로 계산하여 화면에 보여줌
   2. 컴포넌트 최상단에 위치
   3. 순수 함수처럼 동작해야 함
2. **이벤트 핸들러**
   1. 버튼 클릭, 입력 등의 사용자 행동으로 실행됨
   2. 사이드 이펙트를 가짐(ex. state 업데이트, API 요청 등)

⇒ 렌더링 로직은 순수해야하기 때문에 사이드 이펙트를 처리할 수 없는데, 특정 이벤트로 인해서가 아닌 렌더링 자체로 사이드 이펙트를 발생시켜야 하는 경우, 리액트의 Effect를 사용할 수 있다.

<br/>

### 리액트 Effect란?

- 특정 이벤트가 아닌 **렌더링 자체로 발생하는 사이드 이펙트 처리 방식**
  - ex) (어떤 버튼을 눌러서 나타났든 상관없이) 채팅방이 나타날 때 서버에 자동 연결되도록
- Effect는 **렌더링 후(화면이 바뀐 직후) 실행**된다

<br/>

### Effect를 작성하는 법

1. Effect 선언
2. Effect 의존성 지정
3. 필요한 경우, 클린업 함수 추가

<br/>

#### (1) Effect 선언하기 : `useEffect` 훅

```jsx
import { useEffect } from "react";
```

```jsx
function MyComponent() {
  useEffect(() => {
    // 렌더링이 모두 완료된 후 실행
  });
}
```

- `useEffect`는 컴포넌트 최상위 레벨에서 호출
- `useEffect`는 **화면에 렌더링이 반영될 때까지** 코드 실행을 지연시킨다

> Effect문 내에서 state를 변경하면 ❌
>
> Effect는 렌더링이 완료된 직후 실행되며, State를 변경하면 렌더링이 트리거 된다. Effect문 안에서 State를 설정하면 무한으로 렌더링을 트리거해 무한 루프를 일으킨다.

<br/>

#### (2) Effect 의존성 지정

- `useEffect`는 기본적으로 모든 렌더링 후마다 실행된다.
- 의존성 배열에 값을 추가함으로써, 특정 값이 바뀔 때만 실행되도록 제한할 수 있다.
  ⇒ `useEffect` 호출의 2번째 인자로 의존성 배열 지정

```jsx
// ❌ 의존성 배열이 없으면, 모든 렌더링 후 실행됨
useEffect(() => {
  connectToChatServer();
});

// ✅ 빈 배열로 지정하면, 처음 마운트될 때만 실행됨
useEffect(() => {
  connectToChatServer();
}, []);

// ✅ data 값이 바뀔 때만 실행됨
useEffect(() => {
  updateExternalSystem(data);
}, [data]);

// ✅ data1 또는 data2의 값이 바뀔 때만 실행됨
useEffect(() => {
  updateExternalSystem(data1);
  updateExternalSystem(data2);
}, [data1, data2]);
```

```jsx
// ⚠️ useEffect안에 props나 state 값을 사용했다면, 반드시 의존성 배열에 포함해야 한다!

useEffect(() => {
  if (isPlaying) {
    console.log("video.play() 호출");
    ref.current.play();
  } else {
    console.log("video.pause() 호출");
    ref.current.pause();
  }
}, []); // 에러 발생
```

> 🔴 **React Hook useEffect has a missing dependency: 'isPlaying'. Either include it or remove the dependency array.**

- `useEffect`에 `isPlaying` **prop**값을 사용했는데 의존성 배열에 지정하지 않으면 `isPlaying` 값 변화에 반응하지 않게 되어 버그가 생긴다
- **“의존성을 선택할 수 없다는 점에 유의해라”**
  ⇒ `useEffect` **내부에서 쓰는 모든 변수는 의존성 배열에 추가**해야 한다
  - `ref`의 경우 부모에서 전달받는 `ref`는 의존성 배열에 명시하되(항상 동일한 ref를 전달하는지 알 수 없기 때문에),
  - 해당 컴포넌트 내부에서 선언된 `ref`는 값이 바뀌지 않는 안정된 식별성을 갖기 때문에 의존성 배열에 넣지 않아도 된다.

<br/>

#### (3) Clean-up 함수

```jsx
useEffect(() => {
  const connection = createConnection();
  connection.connect();
  return () => {
    connection.disconnect();
  };
}, []);
```

- `connection.connect()` 만 있다면 컴포넌트가 마운트될 때마다 이전 연결이 해제되지 않고 계속 쌓일 것임
  ⇒ **컴포넌트가 언마운트될 때 연결을 끊어주는 클린업 함수를 반환**해주어야 한다
- 리액트는 **Effect가 다시 실행되기 전마다** 클린업 함수를 호출하고(이전 렌더의 Effect를 먼저 정리), **컴포넌트가 언마운트될 때**에도 마지막으로 호출한다

---

### 개발 중에 Effect가 두 번 실행되는 경우를 다루는 방법

= 어떻게 `Effect`가 다시 마운트된 후에도 작동하도록 고칠 것인가?

= 클린업 함수의 중요성!

- 리액트의 `Strict Mode`에서는 개발 중 `useEffect`를 의도적으로 두 번 실행시켜서 **클린업이 제대로 되는지 검증**한다
  - 버그를 찾기 위한 리액트의 기능 : 컴포넌트 마운트 → 언마운트(클린업) → 컴포넌트 마운트 순서 간에 차이가 없어야 함
  - 실제 프로덕션 환경에서는 `useEffect`는 한 번만 실행됨
- `Effect`는 항상 정상적으로 정리(`cleanup`)되도록 구현해야 하며, `ref`등을 이용해 개발 모드의 이중 실행을 억지로 막으려 하면 안된다

<br/>

### 🧹 클린업 함수 적용하기 예제

#### (1) 리액트로 작성되지 않은 위젯 제어하기

🌏 [`예시1`] 지도 컴포넌트

```jsx
useEffect(() => {
  const map = mapRef.current;
  map.setZoomLevel(zoomLevel);
}, [zoomLevel]);
```

- ⚠️ 이 경우는 같은 `zoomLevel` 값을 갖고 연속 호출되어도 문제가 되지 않으니 클린업 함수가 필요하지 않다

🫒 [`예시2`] 모달 컴포넌트

```jsx
useEffect(() => {
  const dialog = dialogRef.current;
  dialog.showModal();
  return () => dialog.close();
}, []);
```

- `showModal()` 연속 호출 시 에러 발생 → 클린업에서 `close()`호출

**(2) 이벤트 구독하기**

- 이벤트를 구독(`addEventListener`)했다면, 클린업에서 반드시 구독 해지(`removeEventListener`)

**(3) 애니메이션 트리거**

- 어떤 요소를 애니메이션으로 표시하는 경우, 클린업에서 애니메이션을 초기값으로 재설정

**(4) 데이터 페칭(`ignore`)**

- 예를 들어, `useEffect` 안에서 데이터를 페칭해올 때 `userId`가 바뀌면 이전 요청의 응답이 나중에 도착할 수 있음 → 이 경우, 오래된 응답이 최신 상태를 덮어쓰면 안됨
  ⇒ `ignore` 플래그 사용

  ```jsx
  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      const json = await fetchTodos(userId);
      if (!ignore) {
        setTodos(json); // ⛔ 오래된 요청이면 무시
      }
    }

    startFetching();

    return () => {
      ignore = true; // cleanup 시 오래된 요청 무시
    };
  }, [userId]);
  ```

  - API 요청을 취소할 순 없지만, 결과를 무시할 수 있음
  - `userId`가 **‘Alice’ → ‘Bob’**으로 바뀌었을 때 `useEffect`가 새로 실행되고 **이전 `useEffect`**(**Alice 때의 useEffect**)는 클린업 함수가 실행되어 `ignore = true`로 바뀌고, Bob으로 바뀌고 나서 Alice의 `useEffect`에서 호출된 api 응답이 도착하더라도 setTodos를 실행하지 않음.
  - 여기서 중요한 점은 `useEffect`가 새로 실행될 때 새로 실행되는 useEffect의 클린업 함수가 아닌 **이전 Effect의 클린업 함수가 실행된다**는 점!

    - `ignore`은 항상 `false`로 시작하며, 해당 Effect 내에서만 유효한 변수이다.

      | 순서 | userId            | Effect 동작                                       |
      | ---- | ----------------- | ------------------------------------------------- |
      | 1    | Alice             | 요청 시작 (`ignore = false`)                      |
      | 2    | Bob               | cleanup 실행 (`ignore = true` for Alice's effect) |
      | 3    | Bob               | 새 요청 시작 (`ignore = false` for Bob's effect)  |
      | 4    | Alice의 응답 도착 | 무시됨 (Alice’s Effect의 `ignore = true`)         |
      | 5    | Bob의 응답 도착   | 처리됨 (`ignore = false`)                         |

> ⚠️ `useEffect` 안에서 직접 `fetch()` 호출 방식의 단점

1. 서버에서 실행되지 않음
2. 네트워크 폭포 발생(부모 → 자식 순으로 순차 요청)으로 느림
3. 캐싱 안됨(컴포넌트 다시 마운트 시 재요청)
4. 보일러 플레이트 많음(경쟁 상태 방지, 로딩 상태 등 처리 필요)

⇒ ✨프로젝트 규모가 클 때 좋은 대안들

- Next.js같은 리액트 프레임워크를 사용하여 데이터를 미리 받아와서 화면에 같이 보내주는 방식
- TanStack Query, SWR, React Router 6.4+ 등은 데이터를 가져와서 저장을 해주기 때문에 같은 데이터를 다시 받지 않아도 됨

> `TanStack Query`
>
> - 서버에서 데이터를 가져오고 자동으로 캐시하고, 자동으로 재시도, 자동으로 갱신까지 해줌
> - `useEffect + useState + fetch`를 직접 안 써도 됨
> - 경쟁 상태 자동 처리
>
> `SWR`
>
> - 데이터는 캐시에서 먼저 보여주고(이전에 본 데이터는 바로 보여줌), 백그라운드에서 갱신하는 방식(서버에서 최신 데이터 받아옴)
> - 경쟁 상태 자동 처리
> - `TanStack Query`보다 단순, 아주 **기본적인 캐시 + 재요청**만 필요할 때 사용하기 좋음

---

### 각 렌더링 시점마다 다른 Effect가 실행될 수 있다

| 상황                          | `useEffect` 실행         | 클린업 실행(`return () ⇒ {}`) |
| ----------------------------- | ------------------------ | ----------------------------- |
| 처음 렌더링될 때              | ✅ 실행                  | ❌ 없음                       |
| 같은 의존성으로 재렌더링될 때 | ❌ 건너뜀                | ❌ 없음                       |
| 의존성이 변경되면             | ✅ 실행                  | ✅ 이전 렌더 클린업 실행      |
| 컴포넌트가 사라질 때          | ❌ 실행 안 함            | ✅ 마지막 클린업 실행         |
| 개발 모드(Strict Mode)        | ✅ 의도적으로 2번 실행됨 | ✅ 실행                       |

---

## Effect가 필요하지 않은 경우

> 렌더링 로직이나 사용자 이벤트 처리에는 Effect가 필요 없다.<br/>
> 외부와의 동기화가 필요한 경우에만 Effect를 사용해야 한다.<br/>
> ex) 네트워크 요청, 타이머, DOM 조작, 로컬 스토리지, 분리된 이벤트 소스 등

<br/>

### 비용이 많이 드는 계산 캐싱하기 - `useMemo`

❌ `visibleTodos`를 따로 `state`로 선언하고 `useEffect`안에서 계산하는건 비효율적

```jsx
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState("");

  // 필터링된 todos
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);

  // ...
}
```

✅ State와 Effect 없이 **렌더링 중에 바로 계산**하기

```jsx
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState("");
  const visibleTodos = getFilteredTodos(todos, filter);
  // ...
}
```

✅ `getFilteredTodos` 계산이 오래 걸린다면 → `useMemo` 사용해 값비싼 계산 캐시하기

```jsx
import { useMemo, useState } from "react";

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState("");
  const visibleTodos = useMemo(() => {
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```

⇒ `todos`나 `filter`가 변경되지 않는 한 `getFilteredTodos`를 다시 실행하지 않고 `useMemo`는 마지막으로 저장한 결과를 반환한다

<br/>

### prop 변경 시 모든 state 초기화 - `key`

❌ prop으로 전달된 `userId`가 변경될 때 `useEffect`에서 `state` 초기화 → 복잡성 증가 & 불필요한 리렌더링

```jsx
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState("");

  // 🔴 피하세요: Effect에서 prop 변경 시 state 초기화
  useEffect(() => {
    setComment("");
  }, [userId]);
  // ...
}
```

✅ `key`를 사용해 컴포넌트의 고유한 식별성을 부여하기 → 같은 위치의 같은 컴포넌트라도 `key`가 달라지면 리액트는 다른 컴포넌트로 인식해 컴포넌트를 새로 마운트하고 `state`도 초기화된다.

```jsx
export default function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />;
}

function Profile({ userId }) {
  const [comment, setComment] = useState("");
  // ...
}
```

<br/>

### prop이 변경될 때 일부 state 조정하기

❌ `useEffect`에서 `state` 값인 `selection`을 변경하게 되면 변경될 때 마다 `List` 컴포넌트와 자식 컴포넌트들은 오래된 `selection`값으로 처음 렌더링된다. 그 후 리액트가 DOM을 업데이트한 후 Effect가 실행되면서 값이 바뀌게 되고 그러면 렌더링이 다시 일어나서 비효율적이다.

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 피하세요: Effect에서 prop 변경 시 state 조정하기
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```

🔺 렌더링 중 state 조정하기

- 렌더링 중 `setSelection`을 호출하면 아직 리액트가 DOM을 업데이트하기 전이기 때문에 오래된 `selection` 값의 렌더링을 건너뛸 수 있음
- ⚠️ 렌더링 중이 `state` 값을 변경하게 되면 오래된 `selection` 값의 렌더링을 건너뛸 수 있다는 성능상 장점은 있지만 리액트는 렌더링 중 `state` 값을 변경하는 것을 권장하지 않음

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 더 좋습니다: 렌더링 중 state 조정
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

✅ 렌더링 중 `state` 조정할 필요 없이! `key`를 사용하거나 렌더링 중 모든 `state` 계산

- `items` 값이 변경되더라도 선택된 항목 `state`를 업데이트 할 필요가 없음. `selectedId`를 사용해 렌더링 중 계산

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // ✅ 최고예요: 렌더링 중에 모든 것을 계산
  const selection = items.find((item) => item.id === selectedId) ?? null;
  // ...
}
```

<br/>

### 이벤트 핸들러 간 로직 공유

❌ 두 개의 버튼을 클릭했을 때 모두 같은 알림이 표시되어야하는걸 `useEffect`에서 처리

✅ **사용자의 상호작용(이벤트)**으로 알림이 표시되어야하는 경우에는 **이벤트핸들러에서 처리**하기

⇒ 컴포넌트가 이벤트가 아닌 **“사용자에게 표시되었기 때문”**에 실행되어야 하는 코드에만 `Effect`를 사용

<br/>

### 연쇄 계산(Effects Chain)

- `state` 간 연쇄 관계가 내부적으로 계산 가능한 경우 → `이벤트 핸들러`에서 처리
- `state` 변화에 따른 외부 비동기 동작 또는 사이드 이펙트가 필요한 경우 → `useEffect`에서 처리
  - ex) 셀렉트 박스에서 나라를 선택했을 때 다음 셀렉트 박스에 도시 목록 옵션을 서버에서 받아오는 경우

<br/>

### 애플리케이션 초기화

```jsx
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ 앱 로드당 한 번만 실행
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}
```

- 앱이 로드될 때 딱 한 번만 실행되어야 하는 로직은 `useEffect`내에서 이미 실행되었는지 체크하는 로직 필요

```jsx
if (typeof window !== "undefined") {
  // 브라우저에서 실행 중인지 확인합니다.
  // ✅ 앱 로드당 한 번만 실행
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

- 앱이 렌더링 되기 전에 한 번 실행할 수도 있으나, 이 방법은 컴포넌트를 `import`할 때 렌더링되지 않더라도 한 번 실행되기 때문에 주의해야 한다
- app 전체 초기화 로직은 `App.js`와 같은 루트 컴포넌트 모듈이나 애플리케이션의 엔트리 포인트에 둬야한다

<br/>

### 부모에게 데이터 전달하기

❌ 자식 컴포넌트의 `useEffect`에서 부모 컴포넌트에게 데이터를 전달하거나 `state`를 변경하게 되면 데이터 흐름을 추적하기 어려워짐

✅ 데이터는 항상 부모 컴포넌트에서 자식 컴포넌트로 흐르도록 하기

<br/>

### 외부 저장소 구독하기 - `useSyncExternalStore`

`useSyncExternalStore()`는 리액트 외부에 있는 값이나 이벤트를 안정적으로 리액트와 동기화할 때 쓰는 공식 Hook

```jsx
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe, // 변화가 생기면 React한테 알려주는 함수
    () => navigator.onLine, // 현재 상태를 확인하는 함수 (브라우저용)
    () => true // 서버에서는 그냥 true라고 알려줘 (서버는 이걸 모르니까!)
  );
}
```

```jsx
function ChatIndicator() {
  const isOnline = useOnlineStatus();
}
```

- 컴퓨터가 인터넷에 연결되어있는지 여부를 리액트랑 동기화시키고 싶을 때
  - `useEffect`문에서 수동으로 브라우저의 `navigator.onLine` API를 구독하는 것보다 `useSyncExternalStore` 훅을 사용한 커스텀 훅을 작성해서 사용하는 것이 안정적으로 사용할 수 있다.

---

### 🚩 챌린지 : Effect 없이 계산하기

[`문제풀이`] `useEffect`를 없애고 렌더링 중 계산 + `useMemo`로 `todos` 나 `showActive`가 변경되지 않았을 땐 캐시된 값 사용하기

```jsx
export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos);
  const [showActive, setShowActive] = useState(false);
  const [text, setText] = useState('');

  const visibleTodos = useMemo(() => {
	  return getVisibleTodos(todos, showActive)
  }, [todos, showActive]);

  ...
}
```

✨<strong>더 좋은 방식 : `NewForm` 분리하기(state 분리)</strong>

- `NewTodo` 폼을 분리하게 되면 `text` 상태값 변경에 영향을 받지 않으므로 `useMemo`를 사용하지 않아도 불필요한 계산을 하지 않는다

```jsx
import { useState } from 'react'
import { initialTodos, createTodo } from '@/utils/todos'
import type { TodoType } from '@/types'
interface TodoProps {
  onAdd: (todo: TodoType) => void
}

export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos)
  const [showActive, setShowActive] = useState(false)

  const activeTodos = todos.filter((todo) => !todo.completed)
  const visibleTodos = showActive ? activeTodos : todos

  return (
    <div>
      <label>
        <input
          type='checkbox'
          checked={showActive}
          onChange={(e) => setShowActive(e.target.checked)}
        />
        Show only active todos
      </label>
      <NewTodo onAdd={(newTodo: TodoType) => setTodos([...todos, newTodo])} />
      ...
    </div>
  )
}

function NewTodo({ onAdd }: TodoProps) {
  const [text, setText] = useState('')

  function handleAddClick() {
    setText('')
    onAdd(createTodo(text))
  }

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAddClick}>Add</Button>
    </>
  )
}

```

---

## 리액트 Effect의 생명주기

### 리액트 컴포넌트 생명주기와의 차이

- `Mount` : 컴포넌트가 화면에 추가됨
- `Update` : 새로운 props나 state를 수신
- `Unmount` : 컴포넌트가 화면에서 제거

`effects`는 리액트 컴포넌트의 생명주기처럼 항상 마운트 될 때 동기화를 시작하고 마운트 해제될 때 동기화가 중지되는 것은 아니다.<br/>
`effects`는 `props`나 `state` 와 같은 **반응형 값의 변화에 반응해서 동작**한다.

<br/>

### 동기화가 두 번 이상 수행되어야 하는 이유

1️⃣ ”`general`” 채팅방에 연결

```jsx
function ChatRoom({ roomId /* "general" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // "general" 방에 연결
    connection.connect();
    return () => {
      connection.disconnect(); // "general" 방에서 연결 해제
    };
  }, [roomId]);
  // ...
```

2️⃣ 사용자가 `roomId`를 “`travel`”로 변경

```jsx
function ChatRoom({ roomId /* "travel" */ }) {
  // ...
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

**⚙️ 이 때 일어나는 일**

1. 이전 `roomId`와의 동기화 중지(”`general`” 방에서 연결 끊기) : `roomId`가 `general`일 때 실행되었던 `useEffect`에서 반환한 cleanup 함수를 실행

   1. → 해당 effects의 `roomId` = “`general`” 이기 때문에 cleanup 함수는 “`general`”방에서 연결을 끊음

   ```jsx
   function ChatRoom({ roomId /* "general" */ }) {
     useEffect(() => {
       ...
       return () => {
   	    connection.disconnect();
       }
      }
   ```

2. 새 `roomId`와 동기화 시작(”`travel`”방에 연결)

   ```jsx
   function ChatRoom({ roomId /* "travel" */ }) {
     useEffect(() => {
       const connection = createConnection(serverUrl, roomId); // "travel" 방에 연결
       connection.connect();
       // ...
   ```

**✨ 리액트는 컴포넌트가 바뀌거나 사라질 때,**

- useEffect가 안에서 정해준 **시작 코드**(`connect`),
- useEffect에서 return으로 정해준 **정리 코드**(`disconnect`)

⇒ 즉, 어떻게 연결하고 끊는지만 알려주면 리액트가 알아서 처리한다.

<br/>

### 리액트가 effect를 다시 동기화해야 한다는 것을 인식하는 방법

```jsx
function ChatRoom({ roomId }) { // roomId prop은 시간이 지남에 따라 변경될 수 있습니다.
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // 이 effect는 roomId를 읽습니다.
    connection.connect();
    return () => {
      connection.disconnect();
    };

  }, [roomId]); // 따라서 React에 이 effect가 roomId에 "의존"한다고 알려줍니다.
  // ...
```

- `Effect`는 의존성 배열의 값 중 하나라도 이전 렌더링에서의 값과 다르면 다시 동기화한다.
- `roomId`가 `general → travel` 로 바뀌면 `effect`는 다시 동기화 함
- 반면에 컴포넌트가 다시 렌더링 되더라도 `roomId`가 변경되지 않았다면, `useEffect`는 실행되지 않는다(현재 연결 상태 그대로 유지)

<br/>

### 각 effect는 독립적인 동기화 프로세스를 나타낸다

❌ 채팅방에 연결하는 `useEffect`에 방문 기록 이벤트 추가하기

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    logVisit(roomId);
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

- 만약 의존성 배열에 `roomId` 외의 다른 값이 추가된다면, 의도하지 않게 동일한 채팅방에서 `logVisit(roomId)`를 여러 번 실행하게 될 것이다
  ⇒ “채팅방에 연결(`connect`)”과 “방문을 기록하는 것(`logVisit`)”은 별개의 프로세스이다. 2개의 개별 `effect`로 작성하는 것이 좋다

  ```jsx
  function ChatRoom({ roomId }) {
    useEffect(() => {
      logVisit(roomId);
    }, [roomId]);

    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      // ...
    }, [roomId]);
    // ...
  }
  ```

<br/>

### 반응형 값에 “반응”하는 effect

```jsx
const serverUrl = "https://localhost:1234";

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

- `useEffect`에서 사용하는 `state`, `props`와 같은 반응형 값은 반드시 의존성 배열에 포함시켜야 한다.
- 하지만 `serverUrl`과 같이 변하지 않는 값은 의존성에 포함시키지 않아도 된다.

<br/>

### 빈 종속성이 있는 effect의 의미

- 의존성 배열이 빈 배열인 경우에는, `useEffect`는 컴포넌트가 처음 화면에 나타날 때 한 번만 실행되고, 컴포넌트가 사라질 때 클린업 함수가 실행된다.
  ⇒ 값의 변화가 없기 때문에 동기화를 다시 할 필요가 없음

<br/>

### 컴포넌트 본문에서 선언된 모든 변수는 반응형이다

- **컴포넌트 내부의 모든 값은 반응형** : `props`, `state` 외에 `props와 state로 부터 계산되는 값`도 반응형이다.
- 따라서 `effect`에서 사용하는 컴포넌트 본문의 모든 변수들을 `effect` 의존성 배열에 있어야 한다.
- `eslint-plugin-react-hook`가 의존성 배열 관련 문제를 자동으로 검사해준다.

> 🔴 리액트 외부에서 변할 수 있는 값(`mutable`), 특히 전역 변수나 `ref.current`같은 값은 `useEffect`훅의 의존성 배열에 넣지 않아야 한다.
>
> ⇒ 리액트는 그런 값이 변해도 알아채지 못해서 다시 렌더링을 안 하기 때문에

<br/>

### 다시 동기화하지 않으려는 경우는 어떻게 해야 할까?

- 반응형 값이 아니라면 **상수로 선언**하기
  - 컴포넌트 외부 선언, `useEffect` 내부 선언 모두 가능
- 의존성 값을 <strong>"선택"</strong>할 수 없기 때문에 `effect`가 **너무 자주 다시 동기화되거나 무한루프가 발생**한다면 아래 항목들을 체크해보기
  - 그 `effect`가 정말 필요한지 확인
  - `effect` 분리하기
    - 하나의 `effect`는 한 가지 프로세스만 담당하도록
  - 값이 바뀌어도 다시 실행되면 안 되는 경우라면 `Effect Event` 사용
  - 의존성 배열에 함수나 객체 넣지 말 것 : 리렌더링마다 다른 값으로 생성되어 `useEffect`가 계속 실행됨
- ⚠️ **Lint 경고를 무시하지 말 것** : 구조를 바꾸거나 값을 옮겨서 리액트가 헷갈리지 않도록 하기

```jsx
useEffect(() => {
  // ...
  // 🔴 이런 식으로 린트를 억누르지 마세요.
  // eslint-ignore-next-line react-hooks/exhaustive-deps
}, []);
```
