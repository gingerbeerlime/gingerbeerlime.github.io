---
title: "React 상태 관리를 더 깊게: Reducer와 Context 활용하기"

excerpt: "React v19 공식문서-렌더트리와 state의 관계, reducer와 context로 복잡한 리액트 상태 관리하기"

categories:
  - React

tags:
  - [react, react19, jsx, state management, reducer, context]

permalink: /categories/react/deep-dive-into-react-state-management/

toc: true

toc_sticky: true

date: 2025-05-18

last_modified_at: 2025-05-18
---

## State 관리하기(Managing state)

- State를 보존하고 초기화하기
- State 로직을 리듀서로 작성하기
- Context를 사용해 데이터를 깊게 전달하기
- Reducer와 Context로 앱 확장하기

[리액트 v19 공식문서-State 관리하기] <https://ko.react.dev/learn/preserving-and-resetting-state>

---

## State를 보존하고 초기화하기

### 리액트는 언제 State를 보존하고 언제 State를 초기화할까? ⇒ State는 렌더트리의 위치와 연결된다

```jsx
export default function App() {
  const counter = <Counter />;
  return (
    <div>
      {counter}
      {counter}
    </div>
  );
}

function Counter () {
...
}
```

- `Counter` 컴포넌트는 각각 자기 고유의 위치에서 렌더링된다.
- ⇒ 두 `Counter` 컴포넌트는 **자신만의 독립적인 state를 가지며 작동**한다.

<br/>

### 리액트는 트리의 동일한 컴포넌트를 동일한 위치에서 렌더링하는 동안 상태를 유지한다

```jsx
export default function App() {
  const [showB, setShowB] = useState(true);
  return (
    <div>
      <Counter />
      {showB && <Counter />}
    </div>
  );
}

function Counter() {
  ...
}

```

- `showB`가 `false`가 되어 두번째 `Counter`가 사라질 때 컴포넌트의 `state`도 같이 초기화된다.
- 다시 `showB`가 `true`로 바뀌면 `Counter`의 `state`는 초기값으로 세팅된다.
- ⇒ **리액트에서 컴포넌트가 제거될 때 컴포넌트의 `state`도 함께 제거된다**

<br/>

```jsx
import { useState } from "react";

export default function App() {
  const [isFancy, setIsFancy] = useState(false);
  return (
    <div>
      {isFancy ? <Counter isFancy={true} /> : <Counter isFancy={false} />}
    </div>
  );
}
```

- 삼항연산자를 이용해 `isFancy = true`인 `Counter`와 `isFancy = false`인 `Counter` 컴포넌트를 조건부 렌더링할 때 `isFancy`가 `true`든 `false`든 `Counter` 컴포넌트는 같은 위치(**`App` 컴포넌트가 반환한 `div`의 첫번재 자식**)에 렌더링되어 `state`가 유지된다.
- ⇒ 리액트는 같은 위치에 있는 컴포넌트(타입과 key도 동일해야함)는 같은 컴포넌트로 인식한다.

> 🔴 리액트는 JSX 마크업에서가 아닌 반환된 UI 트리로 판단하여 이전 렌더링과 다음 렌더링 사이 컴포넌트를 연결한다.

### 같은 위치의 다른 컴포넌트는 state를 초기화한다

```jsx
import { useState } from "react";

export default function App() {
  const [isFancy, setIsFancy] = useState(false);
  return (
    <div>
      {isFancy ? (
        <div>
          <Counter isFancy={true} />
        </div>
      ) : (
        <section>
          <Counter isFancy={false} />
        </section>
      )}
    </div>
  );
}
```

- `isFancy` 값에 따라 `div`가 `section`으로 바뀌었을 때 자식 컴포넌트인 `Counter`의 위치가 동일하더라도 모든 하위 트리까지 제거되었다가 새로 생성된다.

> 🔴 따라서 항상 컴포넌트는 중첩해서 정의하지 않고 최상위 범위에서 정의해야 한다.

```jsx
import { useState } from "react";

export default function MyComponent() {
  const [counter, setCounter] = useState(0);

  function MyTextField() {
    const [text, setText] = useState("");

    return <input value={text} onChange={(e) => setText(e.target.value)} />;
  }

  return (
    <>
      <MyTextField />
      <button
        onClick={() => {
          setCounter(counter + 1);
        }}
      >
        Clicked {counter} times
      </button>
    </>
  );
}
```

- `MyComponent`가 리렌더링 될 때마다 리액트는 `MyTextField` 함수 자체를 새로 정의하고 내부 상태(`text`)를 초기값으로 다시 설정한다.

<br/>

### 같은 위치에서 state를 초기화하고 싶다면?

1. 다른 위치에 컴포넌트 렌더링하기
2. 각 컴포넌트에 key값 명시하기

#### (1) 다른 위치에 컴포넌트 렌더링하기

```jsx
import { useState } from "react";

export default function Scoreboard() {
  const [isPlayerA, setIsPlayerA] = useState(true);
  return (
    // 다른 위치에 렌더링
    <div>
      {isPlayerA && <Counter person="Taylor" />}
      {!isPlayerA && <Counter person="Sarah" />}
      <button
        onClick={() => {
          setIsPlayerA(!isPlayerA);
        }}
      >
        Next player!
      </button>
    </div>
  );
}
```

#### (2) key를 이용해 state를 초기화하기

기본적으로 리액트는 트리 상의 위치, 순서에 따라 컴포넌트를 구별한다.

위치와, 컴포넌트 명이 같을 때 리액트는 `key`를 이용해서 특정 컴포넌트를 구별할 수 있다.

```jsx
{
  isPlayerA ? (
    <Counter key="Taylor" person="Taylor" />
  ) : (
    <Counter key="Sarah" person="Sarah" />
  );
}
```

⇒ `key`를 사용하면 리액트는 부모 내에서의 순서 대신에 `key` 자체를 위치의 일부로 사용한다. 따라서 같은 위치에 렌더링되더라도 리액트는 `key`가 다르면 다른 컴포넌트로 인식한다.

> 🔴 key는 전역적으로 유일하지 않다. 오직 부모 요소 내부에서 각 항목의 위치를 식별하기 위한 용도이다.

<br/>

### 제거된 컴포넌트의 state 보존하기

Q. 컴포넌트가 트리에서 제거되면 `state`도 같이 초기화되는데, 제거된 컴포넌트가 다시 렌더링되었을 때 이전의 `state`값을 기억하고 싶으면 어떻게 해야할까?

A.

1. `css`로 컴포넌트 숨기기 → 트리에서 사라지는 것이 아니기 때문에 `state`를 유지할 수 있다.
2. `state`를 상위로 올리기 → 부모 컴포넌트가 유지되는 한, 자식 컴포넌트가 제거되어도 상관없다.
3. React state 이외의 다른 저장소 사용하기 ex) localStorage, redux, zustand

<br/>

✨ 요약

- 리액트는 같은 컴포넌트가 같은 자리에 렌더링되는 한 state를 유지한다.
- state는 JSX 태그에 저장되지 않는다. state는 JSX로 만든 트리 위치와 연관된다.
- 컴포넌트에 다른 key를 주어 하위 트리를 강제로 초기화할 수 있다.
- 중첩해서 컴포넌트를 정의하면 원치 않게 state가 초기화될 수 있다.

---

### 🚩 챌린지 - 입력 문자열이 사라지는 것 고치기

[`문제`] `show Hint` 버튼을 클릭해도 텍스트 필드의 내용이 사라지지 않도록 고쳐라

[`문제코드`] 아래 코드는 **div**부터 하위 트리까지 `if/else` 문으로 조건부 렌더링을 하고 있어 `showHint`가 `true`일 때는 **Form**이 **div**의 두번째 자식, `showHint`가 `false`일 때는 **Form**의 첫번재 자식으로 렌더 트리에서 같은 위치의 컴포넌트 타입이 바뀌기 때문에 `state`가 초기화된다.

```jsx
import { useState } from "react";

export default function App() {
  const [showHint, setShowHint] = useState(false);
  if (showHint) {
    return (
      <div>
        <p>
          <i>Hint: Your favorite city?</i>
        </p>
        <Form />
        <button
          onClick={() => {
            setShowHint(false);
          }}
        >
          Hide hint
        </button>
      </div>
    );
  }
  return (
    <div>
      <Form />
      <button
        onClick={() => {
          setShowHint(true);
        }}
      >
        Show hint
      </button>
    </div>
  );
}

function Form() {
  const [text, setText] = useState("");
  return <textarea value={text} onChange={(e) => setText(e.target.value)} />;
}
```

[`정답코드`] **Form**을 항상 같은 위치에서 렌더링하도록 수정하면 텍스트필드의 입력값이 유지된다.

```jsx
import { useState } from "react";

export default function App() {
  const [showHint, setShowHint] = useState(false);
  return (
    <div>
      {showHint && (
        <p>
          <i>Hint: Your favorite city?</i>
        </p>
      )}
      <Form />
      {showHint ? (
        <button
          onClick={() => {
            setShowHint(false);
          }}
        >
          Hide hint
        </button>
      ) : (
        <button
          onClick={() => {
            setShowHint(true);
          }}
        >
          Show hint
        </button>
      )}
    </div>
  );
}

function Form() {
  const [text, setText] = useState("");
  return <textarea value={text} onChange={(e) => setText(e.target.value)} />;
}
```

> 🤔 여기서 `showHint가` `true`일 때 **Form**은 **div**의 두 번째 자식, `false`일 때는 첫 번째 자식처럼 DOM에서의 시각적 위치는 바뀔 수 있지만,
> React는 **Form** 컴포넌트를 동일한 컴포넌트로 인식하고 상태를 유지한다.
> 즉, 조건부로 `p`가 생기거나 사라지는 것은 React가 reconciliation 과정에서 **DOM을** 효율적으로 조정하는 것이며,
> 렌더 트리 상에서 **Form**의 구조적 위치는 바뀌지 않고 그대로 유지된다.

```jsx
return (
  <div>
    {showHint && <p>...</p>} {/* 조건부 자식 1 */}
    <Form /> {/* 항상 있는 자식 2 */}
    {showHint ? <button>...</button> : <button>...</button>}{" "}
    {/* 조건부 자식 3 */}
  </div>
);
```

---

## State 로직을 리듀서로 작성하기

```jsx
function handleAddTask(text) {
  setTasks([
    ...tasks,
    {
      id: nextId++,
      text: text,
      done: false,
    },
  ]);
}

function handleChangeTask(task) {
  setTasks(
    tasks.map((t) => {
      if (t.id === task.id) {
        return task;
      } else {
        return t;
      }
    })
  );
}

function handleDeleteTask(taskId) {
  setTasks(tasks.filter((t) => t.id !== taskId));
}
```

`handleAddTask`, `handleChangeTask`, `handleDeleteTask` 각 이벤트 핸들러에서 `setTasks`를 호출하고 있음

⇒ `state` 업데이트가 여러 이벤트 핸들러로 분산되는 경우, `state` 업데이트 로직을 `reducer`를 사용해 컴포넌트 외부의 **단일 함수로 통합해 관리**할 수 있다.

---

## reducer를 사용해 state 로직 통합하기

1. state를 설정하는 것에서 action을 dispatch 함수로 전달하는 것으로 변경
2. reducer 함수 작성하기
3. 컴포넌트에서 reducer 사용하기

### (1) Setting State → Dispatching Actions

```jsx
function handleAddTask(text) {
  dispatch({
    type: "added",
    id: nextId++,
    text: text,
  });
}

function handleChangeTask(task) {
  dispatch({
    type: "changed",
    task: task,
  });
}

function handleDeleteTask(taskId) {
  dispatch({
    type: "deleted",
    id: taskId,
  });
}
```

- `Action`은 `dispatch` 함수에 넣어준 객체를 의미한다.
- `dispatch` 함수는 **사용자의 `action`을 `reducer` 함수에 전달하는 역할**을 한다.
- `Action` 객체의 포맷 : 정해진 포맷은 없으나 `type`에 액션의 종류를 담고, 이외의 정보는 다른 필드에 담아서 전달하는게 일반적이다

```jsx
dispatch({
  type: "발생한 액션의 type", // ex) 'added', 'added_task' 등과 같이 설명
  // 이외의 정보들은 자유로운 포맷으로 전달
});
```

<br/>

### (2) reducer 함수 작성하기

**`reducer` 함수?** `state`에 대한 로직을 작성하는 곳

```jsx
// state값, action객체 두 개의 인자를 받는다
function yourReducer(state, action) {
  // React가 설정하게될 다음 state 값을 반환한다
}
```

`reducer` 함수 예시

```jsx
function tasksReducer(tasks, action) {
  switch (action.type) {
    // action 종류가 'added'일 때
    case "added": {
      // 다음 state 값
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case "changed": {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
```

- `reducer` 함수는 `state`(`tasks`)를 인자로 받고 있기 때문에, 이를 **컴포넌트 외부에서 선언할 수 있다.**
- `reducer` 함수 안에서는 **switch 문을 사용하는 것이 규칙**이다.

> 📖 `reducer` 함수는 `reduce()` 연산의 이름을 따 명명되었음. `reduce` 함수는 지금까지의 결과와 현재 아이템을 인자로 받고 다음 결과를 반환하는 함수인데 **React의** `reducer` 역시 현재 상태(**state**)와 새로운 입력(**action**)을 인자로 받아 다음 상태(**state**)를 반환하는 방식으로 작동하므로, 로직의 구조가 유사하다.

<br/>

### (3) 컴포넌트에서 reducer 사용하기

- `useReducer` 훅 사용하기

```jsx
import { useReducer } from "react";
```

- `useState` 대신 **`useReducer` 사용하기**

```jsx
// const [tasks, setTasks] = useState(initialTasks);
// useReducer(reducer 함수, 초기 state 값)
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

- `useReducer` 훅은 **reducer 함수**, **초기 state 값** 두 개의 인자를 받고
- **state를 담을 수 있는 값(tasks), dispatch 함수를 반환**한다.

```jsx
import { useReducer } from 'react';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId
    });
  }
...
}
```

- `reducer` 함수를 컴포넌트 외부로 분리

```jsx
export default function tasksReducer(tasks, action) {
  switch (action.type) {
    case "added": {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case "changed": {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
```

⇒ **`state`를 업데이트하는 로직이 다양하고 복잡할 때 `reducer`를 사용**하면 컴포넌트의 로직을 더 읽기 쉽게 작성할 수 있다.

---

## reducer 함수 잘 사용하기

> 🔴 무조건 useReducer를 쓴다고 좋은 것이 아님! 컴포넌트의 로직구조에 맞게 useState, useReducer 적절한 방식을 선택해서 사용해야 한다.
>
> - **간단한 state 업데이트**의 경우? → `useState`를 쓰는 것이 낫다
>   - 미리 작성해야 하는 코드가 적고 간단한 로직에서는 오히려 useReducer보다 가독성이 좋다
> - **state 업데이트가 복잡한 구조인** 경우 ? → `useReducer`를 쓰는 것이 좋다
>   - 업데이트 로직이 어떻게 동작하는지, 이벤트 핸들러를 통해 무엇이 발생했는지 명확히 구분할 수 있다.
>   - `reducer`에 콘솔 로그를 추가해 단계별로 디버깅하기 좋다
>   - `reducer`는 컴포넌트에 의존하지 않는 순수 함수로, `reducer`를 독립적으로 테스트할 수 있다.
> - useState, useReducer 혼합해서 사용하는 것도 괜찮다.
> - useImmerReducer를 사용해 reducer를 더 간결하게 사용할 수도 있다.

<br/>

> 🔴 Reducer 함수 작성할 때 주의할 점
>
> - **Reducer는 반드시 순수해야 한다.**
>   - 네트워크 요청, 스케쥴링, 사이드 이펙트를 수행해서는 안된다
>   - 객체와 배열을 변경하지 않고 업데이트해야 한다
> - 각 `action`은 데이터 안에서 여러 변경들이 있더라도 **하나의 사용자 상호작용을 설명해야 한다** - ex) 5개의 필드가 있는 폼에서 재설정을 클릭할 때, 5개의 개별 action(`set_field`)이 아닌 **하나의 action(`reset_form` )**을 전송하는 것이 좋다

---

### 🚩 챌린지 - message 전송 시, input 입력 값 지우기

[`문제`] 전송 버튼을 클릭했을 때 ‘이메일 + 메시지’를 담은 alert를 띄우고 input창 초기화하기

[`문제풀이`] `onClick` 이벤트 핸들러 안에서 `alert()` 호출 후 `dispatch`로 메시지 초기화. `reducer` 함수는 순수해야하기 때문에 `reducer` 함수 안에서 사이드 이펙트를 일으키는 alert를 작성하지 않도록 주의해야 한다

```jsx
<Button
  onClick={() => {
    // alert는 이벤트 핸들러에서 처리
    alert(contact.email + " " + message);
    dispatch({
      type: "edited_message",
      message: "",
    });
  }}
>
  Send to {contact.email}
</Button>
```

[✨`더 좋은 코드`] 리듀서에 `sent_message` 액션 타입 추가

사용자 관점에서 봤을 때 ‘**message를 전송하는** 것’과 ‘**Input 필드에 텍스트를 입력하는 것**’은 다른 행위이기 때문에 이를 구분해서 `sent_message`라는 액션 타입을 별도로 만들어주는 것이 **‘사용자가 무엇을 했는지’** 명확하게 설명할 수 있다.

```jsx
export function messengerReducer(
  state: MessengerState,
  action: MessengerAction
) {
  switch (action.type) {
    case "changed_selection": {
      return {
        ...state,
        selectedId: action.contactId,
        message: "",
      };
    }
    case "edited_message": {
      return {
        ...state,
        message: action.message,
      };
    }
    // 'sent_message' action 타입 추가
    case "sent_message": {
      return {
        ...state,
        message: "",
      };
    }
    default: {
      const _exhaustiveCheck: never = action;
      throw Error("Unknown action");
    }
  }
}
```

```jsx
<Button
  onClick={() => {
    alert(contact.email + " " + message);
    dispatch({
      type: "sent_message",
    });
  }}
/>
```

---

## Context를 사용해 데이터를 깊게 전달하기

부모 컴포넌트에서 자식 컴포넌트로 props를 통해 데이터를 전달할 때

- 중간에 많은 컴포넌트를 거쳐야 하거나
- 많은 컴포넌트에서 동일한 데이터가 필요한 경우

`Context`를 사용해 부모 컴포넌트가 **트리 아래에 있는 모든 컴포넌트에** 깊이와 상관없이 `props`를 통하지 않고 데이터를 전달할 수 있다.

---

## Context 사용하기

1. Context 생성하기
2. 데이터가 필요한 컴포넌트에서 context 사용하기
3. 데이터를 지정하는 컴포넌트에서 context 제공하기

### (1) Context 생성하기

```jsx
import { createContext } from "react";

export const LevelContext = createContext(1);
```

- `createContext`의 유일한 인자는 **기본값**. 모든 종류의 값을 전달할 수 있다.
- `context`를 제공하지 않고 사용하면 지정된 기본값 `1`을 사용한다.

<br/>

### (2) Context 사용하기

```jsx
import { useContext } from "react";
import { LevelContext } from "./LevelContext.js";

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  // ...
}
```

- `prop`으로 level을 받아오는 대신 `context`에서 값을 읽도록 함
- `useContext` 훅
  - 리액트에게 `Heading` 컴포넌트가 `LevelContext`를 읽으려 한다는 것을 알리는 역할
  - 컴포넌트 내부 최상단에서 호출해야 함.(조건문,반복문 내부 호출❌)

<br/>

### (3) Context 제공하기

```jsx
export default function Section({ children }) {
  return <section className="section">{children}</section>;
}
```

🔽 `LevelContext`를 자식들에게 제공하기 위해 `context provider`로 감싸준다.

```jsx
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
  return (
    <section className="section">
     // [Context명].Provider 형태로 제공
      <LevelContext.Provider value={level}>
        {children}
      </LevelContext.Provider>
    </section>a
  );
}
```

- `<section>` 하위 트리에 포함된 모든 컴포넌트는 `LevelContext`를 사용할 수 있다.
- 만약 하위 트리에 `LevelContext`가 중첩되어 제공되고 있는 경우, 자식 컴포넌트는 **UI 트리에서 가장 가까운 `LevelContext`의 값을 사용**한다.

  ```jsx
  export default function Page() {
    return (
      <Section level={1}>
        ... // 여기 포함된 컴포넌트는 level 1을 사용
        <Section level={2}>
          ... // 여기 포함된 컴포넌트는 level 2를 사용
          <Section level={3}>
            ... // 여기 포함된 컴포넌트는 level 3을 사용
  ```

---

### 같은 컴포넌트에서 context를 사용하며 제공하기

```jsx
// context를 사용하며
import { useContext } from 'react';
// context 제공하기
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
 // context 읽기: 가장 가까운 상위 context 값을 읽음
 const level = useContext(LevelContext);
  return (
    <section className="section">
      <LevelContext.Provider value={level + 1}>
        {children}
      </LevelContext.Provider>
    </section>a
  );
}
```

- 각 `Section`은 위의 `Section`에서 `level`을 읽고 자동으로 `level + 1`을 전달할 수 있다

```jsx
export default function Page() {
  return (
   // context를 제공하지 않았기에 기본값 1 사용 -> level + 1 -> level = 2
    <Section>
      ...
     // 위의 LevelContext 가 2이므로 level=3
      <Section>
        ...
        // 위의 LevelContext 가 3이므로 level=4
        <Section>
          ...
```

> 📍 Context는 위의 예시 말고도 **전역 상태 관리가 필요한 곳**에 주로 사용된다.
>
> - **인증 정보** : 로그인 여부, 사용자 정보 등을 앱 전체에서 공유할 때
> - **라우팅**: 대부분의 라우팅 솔루션은 현재 경로를 유지하기 위해 내부적으로 context를 사용
> - **다국어 처리** : 현재 언어 설정 및 다국어 번역 함수 등
> - `테마` : 다크모드/라이트모드 같은 테마 상태를 전체 앱에서 공유할 때
> - **글로벌 상태 공유**: React Query, Zustand, Redux를 쓰지 않고 간단한 전역 상태가 필요할 때(모달 열림 여부, 알림 메시지, 필터 값 등)
> - **설정 정보**: API URL, 기능 ON/OFF 설정, 앱의 전역 설정값 등

---

### Context로 중간 컴포넌트 지나치기

`Context`의 작동방식은 **`CSS`의 속성 상속**과 비슷한 구조를 가진다.

- 리액트에서 위에서 가져온 어떤 `context`를 **재정의** 하는 유일한 방법은 자식들을 다른 값을 가진 `context provider`로 래핑하는 것이다
- 그러나 `css`에서 `color`와 `background-color`와 같이 다른 속성들은 서로 영향을 주지 않는 것 처럼 **서로 다른 `React context`는 영향을 주지 않는다**

`createContext()`로 만든 각각의 `context`는 완벽히 분리되어 있고 특정 `context`를 사용 및 제공하는 컴포넌트끼리 묶여 있다. 하나의 컴포넌트는 서로 다른 다수의 `context`를 사용하거나 제공할 수 있다.

---

### Context를 남용하지 말 것

1. **`Props` 전달하기로 시작하기** : 기본적으로 `props`는 어떤 컴포넌트가 어떤 데이터를 사용하는지 **데이터 흐름을 명확히 보여주므로** `context`는 꼭 필요한 곳에 사용하는 것이 좋다.
2. 컴포넌트를 추출하고 **JSX를 `children`으로 전달하기** : 데이터를 여러 컴포넌트를 거쳐서 `props` 전달하고 있다면 구조가 제대로 짜여져있는지 다시 검토해보는 것이 좋다. 중간 컴포넌트가 그 데이터를 쓰지 않는다면 컴포넌트를 나눠서 구조를 개선해볼 수 있다.

   ```jsx
   function App() {
     const posts = [...]; // 게시물 데이터

     return <Layout posts={posts} />;
   }

   function Layout({ posts }) {
     return (
       <Main posts={posts} />
     );
   }

   function Main({ posts }) {
     return (
       <Posts posts={posts} />
     );
   }

   function Posts({ posts }) {
     return (
       <ul>
         {posts.map(post => <li>{post.title}</li>)}
       </ul>
     );
   }
   ```

   - `Layout`과 `Main`은 `posts` 데이터를 사용하지 않고 단지 전달만 해주고 있음

     - ⇒ 이럴 때 무조건 Context 사용? ❌
     - ⇒ 컴포넌트 분리 + `children` 으로 구조 개선 ✅

       ```jsx
       function App() {
         const posts = [...];

         return (
           <Layout>
             <Posts posts={posts} />
           </Layout>
         );
       }

       function Layout({ children }) {
         return (
           <div className="layout">
             <Header />
             {children}
           </div>
         );
       }

       function Posts({ posts }) {
         return (
           <ul>
             {posts.map(post => <li>{post.title}</li>)}
           </ul>
         );
       }
       ```

> 🤔 이 챕터의 예시코드와 챌린지 문제 코드를 보면 모두 Context의 데이터를 지정하는 곳에 `.Provider`를 붙이지 않고 있는데 작동도 잘 되고 있다. 그래서 `.Provider`를 붙이는 것과 아닌 것에는 무슨 차이가 있을까?

> `<ImageSizeContext value={imageSize}>`이렇게 작성해도 JSX에서 자동으로 `.Provider`를 인식해서 `<ImageSizeContext.Provider value={imageSize}>`로 암묵적으로 자동 해석한다고 한다. 실제로 콘솔에 ImageSizeContext를 찍어봐도 자동으로 Provider로 인식하고 있음을 알 수 있다. 하지만 `.Provider`를 붙여서 명확하게 작성하는 것이 명확성, 가독성 측면에서 좋다.
> <img src="/assets/images/posts_img/react-deep-dive-into-react-state-management/react-context-provider-config.png" width="300"/>

---

## Reducer와 Context로 앱 확장하기

### Reducer와 Context를 함께 사용하면 좋은 경우

1. **상태와 상태 변경 로직을 여러 컴포넌트에서 공유해야 할 때**
   1. 여러 레벨을 거쳐서 여러 컴포넌트가 상태를 읽거나 변경시켜야할 때 → `props drilling`을 피하기 위해 `context` 활용
2. **전역처럼 동작하는 상태가 필요할 때**
   1. 로그인 정보, 테마 설정, 장바구니 등 앱 전역에서 접근이 필요할 때
3. **상태 변경 로직과 데이터를 함께 추상화해서 재사용하고 싶을 때**
   1. 상태를 어떻게 바꾸는지(`dispatch`)와 현재 상태(`state`)를 함께 `context`로 추출하면, 다른 UI 계층에서도 같은 방식으로 쉽게 접근 가능

---

### Context와 Reducer 결합하기

1. Context 생성하기
2. State와 Dispatch 함수를 context에 넣기
3. 트리 안에서 context 사용하기

#### (1) Context 생성

```jsx
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

- useReducer 훅은 **현재 상태인 `tasks`**와 **업데이트 함수 `dispatch` 함수**를 2가지를 반환
  ⇒ tasks, dispatch **각각의 context를 생성**해야 함

  ```jsx
  import { createContext } from "react";

  // 기본값은 null로 설정
  export const TasksContext = createContext(null);
  export const TasksDispatchContext = createContext(null);
  ```

#### (2) State와 Dispatch 함수를 context에 넣기

```jsx
import { TasksContext, TasksDispatchContext } from "./TasksContext.js";

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  // ...
  return (
    // state값 context 제공
    <TasksContext.Provider value={tasks}>
      // dispatch 함수 context 제공
      <TasksDispatchContext.Provider value={dispatch}>
        ...
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}
```

#### (3) 트리 안에서 context 사용하기

```jsx
return (
  <TasksContext.Provider value={tasks}>
    <TasksDispatchContext.Provider value={dispatch}>
      <h1>Day off in Kyoto</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </TasksDispatchContext.Provider>
  </TasksContext.Provider>
);
```

🔽 더 이상 props로 전달하지 않음

```jsx
return (
  <TasksContext.Provider value={tasks}>
    <TasksDispatchContext.Provider value={dispatch}>
      <h1>Day off in Kyoto</h1>
      <AddTask />
      <TaskList />
    </TasksDispatchContext.Provider>
  </TasksContext.Provider>
);
```

- tasks `state` 읽어오기

```jsx
export default function TaskList() {
  const tasks = useContext(TasksContext);
}
```

- `dispatch` 함수 사용하기

```jsx
export default function AddTask({ onAddTask }) {
  const [text, setText] = useState('');
  const dispatch = useContext(TasksDispatchContext);
  // ...
  return (
    // ...
    <button onClick={() => {
      setText('');
      dispatch({
        type: 'added',
        id: nextId++,
        text: text,
      });
    }}>Add</button>
    // ...
```

---

### Context와 Reducer를 하나의 파일로 관리하기

1. `reducer`로 state를 관리하고
2. 두 `context`를 하위 컴포넌트에 제공
3. `children` prop으로 하위 트리를 전달

```jsx
import { createContext, useContext, useReducer } from 'react'

export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);

// 필요에 따라 context를 사용하기 위한 use함수(사용자 정의 Hook) 추가
export function useTasks() {
 return useContext(TasksContext);
}
export function useTasksDispatch() {
 return useContext(TasksDispatchContext);
}

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

function tasksReducer(tasks, action) {
 ...
}

const initialTasks = [...];
```

- 컴포넌트에서 `TasksProvider` 사용

```jsx
import AddTask from "./AddTask.js";
import TaskList from "./TaskList.js";
import { TasksProvider } from "./TasksContext.js";

export default function TaskApp() {
  return (
    <TasksProvider>
      <h1>Day off in Kyoto</h1>
      <AddTask />
      <TaskList />
    </TasksProvider>
  );
}
```

- 컴포넌트에서 `state`, `dispatch` 사용

```jsx
import { useTasks, useTasksDispatch } from "./TasksContext.js";

const tasks = useTasks();
const dispatch = useTasksDispatch();
```
