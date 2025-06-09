---
title: "React useEffect 패턴 가이드: 상태 갇힘과 의존성 문제 해결부터 커스텀 훅까지"

excerpt: "React v19 공식문서 useEffect 의존성 관리, useEffectEvent, 커스텀 훅 작성하기"

categories:
  - React

tags:
  - [react, react19, jsx, effect, closure, stale value]

permalink: /categories/react/use-effect-gotchas-patterns/

toc: true

toc_sticky: true

date: 2025-06-08

last_modified_at: 2025-06-08
---

## 탈출구(Escape Hatches)

- Effect에서 이벤트 분리하기
- Effect의 의존성 제거하기
- 커스텀 Hook으로 로직 재사용하기

[리액트 v19 공식문서-State 관리하기] <https://ko.react.dev/learn/separating-events-from-effects>

---

## 이벤트 핸들러와 Effect 중에 선택하기

> 이벤트 핸들러와 Effect 중 무엇을 사용해야할지 모르겠다면 이 코드가 왜 실행되어야하는지 생각해보자.

- 채팅방 컴포넌트는 선택된 채팅방에 자동으로 연결해야 한다.<br/>
  ⇒ 사용자가 **아무런 상호작용을 하지 않아도** 채팅방 컴포넌트는 화면에 보여질 때 선택된 채팅 서버에 연결되어 있어야 한다.<br/>
  ⇒ 동기화가 필요할 때마다 실행된다.<br/>
  ⇒ `Effect`
- **“전송”버튼을 클릭하면** 채팅에 메시지를 전송해야 한다.<br/>
  ⇒ 특정 상호작용(버튼 클릭)에 대한 응답으로 실행되어야 한다.<br/>
  ⇒ `Event Handler`

<br/>

### 반응형 값과 반응형 로직

> **이벤트 핸들러 내부의 로직은 반응형이 아니다.**

- 사용자가 같은 상호작용(ex. 클릭)을 반복하지 않는 한 재실행되지 않는다.
- 이벤트 핸들러는 **변화에 “반응”하지 않으면서**, 반응형 값을 읽을 수 있다.

```jsx
function handleSendClick() {
  sendMessage(message);
}
```

- `message` 값이 변경되었을 때 메세지를 전송해서는 안된다.(Effect❌)
- 사용자가 전송 버튼을 클릭한 경우에만 메세지를 전송해야 한다.(Event Handler✅)

  <br/>

> **Effect 내부의 로직은 반응형이다.**

- `Effect`에서 사용하는 반응형 값은 의존성으로 지정해야 한다.
- 리렌더링이 의존성으로 지정된 반응형 값을 바꾸는 경우 리액트가 새로운 값으로 `Effect` 로직을 다시 실행한다.

```jsx
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => {
    connection.disconnect();
  };
}, [roomId]);
```

- `roomId`를 바꾸는 것은 다른 방에 연결하고 싶다는 의미<br/>
  ⇒ `roomId`라는 **반응형 값을 따라가고**, 그 값이 바뀌면 로직이 실행되어야 함

---

### Effect에서 비반응형 로직 추출하기 - `useEffectEvent`

> 🔺아직 안정된 버전의 React에 출시되지 않은 실험적인 API

- `useEffectEvent`는 리액트의 실험적인 Hook으로 매번 렌더링 시 최신 상태를 유지하면서도 `useEffect` 안에서 클로저가 고정되는 문제를 방지하기 위해 사용된다.
  - `state`나 `props`가 자주 바뀌지만
  - `useEffect` 내부에서 언제나 최신 값을 사용하고 싶을 때
  - 하지만 매번 의존성 배열에 넣어서 `useEffect`를 재실행하고 싶지는 않을 때
    - ⚠️ `eslint-disable-next-line react-hooks/exhaustive-deps` 의존성 배열 검사 린터를 억제하는 것은 권장하지 않는다.

<br/>

> `useEffect` 내부에 사용되는 모든 반응형 값은 의존성 배열에 포함되어야 한다.<br/>
> 그리고 의존성 배열의 값 중 하나라도 변경이 생기면 `effect`는 새로 실행된다.<br/>
> 의존성 배열의 값 중 **특정 값의 변화에는 반응하지 않도록** 하고 싶으면 어떻게 해야할까?

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('연결됨!', theme);
    });
    connection.connect();
    return () => {
      connection.disconnect()
    };
  }, [roomId, theme]); // ✅ 모든 의존성 선언됨
  // ...
```

- [✅]`roomId`가 변경되었을 때 채팅방에 새로 연결해야한다.
- [❌]그러나 테마(`theme`)가 변경되었을 때 채팅방에 다시 연결될 필요가 없다.
  ⇒ `theme`은 반응형 값이지만 `useEffect` 내부에서 이 값의 변화에 반응하지 않도록 처리하고 싶다.

<br/>

⇒ ✨`useEffectEvent` 훅을 사용해 `Effect`에서 **비반응형 로직을 분리**할 수 있다.

```jsx
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  // Effect Event 선언
  const onConnected = useEffectEvent(() => {
    showNotification('연결됨!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected(); // Effect Event 호출
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ 모든 의존성이 선언됨
  // ...
```

- `onConnected`(=`Effect Event`) : **내부의 로직은 반응형이 아니며 항상 `props`와 `state`의 최신 값**을 바라본다.
- 더 이상 `useEffect` 내부에 `theme`이 사용되지 않으므로 의존성 배열에서 제거한다.
- 또한 `Effect Event`도 반응형이 아니므로 `onConnected`를 의존성에 포함시키지 않는다.
- 이벤트 핸들러는 사용자의 상호작용에 대한 응답으로 실행되고 `Effect Event`는 `Effect`에서 직접 트리거 됨!

---

### Effect 이벤트로 최신 props와 state 읽기

```jsx
function Page({ url }) {
  useEffect(() => {
    logVisit(url);
  }, [url]); // ✅ 모든 의존성이 선언됨
  // ...
}
```

- [✅] 방문하는 페이지의 `url`이 변경될 때마다 방문 로그를 기록

```jsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  useEffect(() => {
    logVisit(url, numberOfItems);
  }, [url]); // 🔴 React Hook useEffect has a missing dependency: 'numberOfItems'
  // ...
}
```

- [🔺] 로그에 페이지 `url`과 장바구니 아이템 개수를 같이 기록하고 싶을 때
- 그러나 장바구니 개수(`numberOfItems`)가 변경될 때마다 방문기록이 다시 기록되는건 원하지 않음

<br/>

**⇒ ✨`useEffectEvent` 훅으로 `Visit` 이벤트 분리**

```jsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onVisit = useEffectEvent((visitedUrl) => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // ✅ 모든 의존성 선언됨
  // ...
}
```

- `numberOfItems` 값의 변화가 `useEffect`를 다시 실행시키지 않음. `url` 변경시에만 재실행
- `useEffect`가 재실행될 때마다 `Effect Event`인 `onVisit` 이 호출됨
- `onVisit`은 항상 **최신 `numberOfItems` 값을 읽음**

<br/>

> 📌 `EffectEvent`에 `useEffect`의 의존성 값을 파라미터로 전달해주기

```jsx
const onVisit = useEffectEvent((visitedUrl) => {
  logVisit(visitedUrl, numberOfItems);
});

useEffect(() => {
  onVisit(url);
}, [url]);
```

**📦 파라미터를 명시적으로 넘겨줘야 하는 이유**

- 다른 `url`로 페이지를 방문하는 것이 사용자의 관점에서 **별도의 이벤트임을 명시**적으로 표현할 수 있다
- 실수로 **의존성 배열에서 `url`을 빼먹는 실수를 방지**할 수 있다.
- `useEffect` **내부 로직이 비동기인 경우에는 꼭 파라미터로 넘겨줘야 한다**<br/>

  [❌] `useEffect`에서 `url`을 넘겨주지 않고 `onVisit` 내부에서 `url`을 읽게 되면 `useEffect`가 실행되는 시점이 아닌 5초 후의 최신`url`값을 읽게 된다.

  ```jsx
  const onVisit = useEffectEvent(() => {
    logVisit(url, numberOfItems);
  });

  useEffect(() => {
    setTimeout(() => {
      onVisit(); // 내부에서 url 사용
    }, 5000);
  }, [url]);
  ```

  [✅] `visitedUrl`은 최초에 이 `Effect`를 실행하게 만든 `url`에 해당한다.

  ```jsx
  const onVisit = useEffectEvent((visitedUrl) => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    setTimeout(() => {
      onVisit(url);
    }, 5000);
  }, [url]);
  ```

---

### Effect 이벤트의 한계

- `Effect` 내부에서 호출하기 + `Effect` 이벤트를 해당 `useEffect` 근처에 선언하기
- 절대로 다른 컴포넌트나 Hook에 전달하지 않기

```jsx
// Timer 컴포넌트
function Timer() {
  const [count, setCount] = useState(0);

  const onTick = useEffectEvent(() => {
    setCount(count + 1);
  });

  useTimer(onTick, 1000); // 🔴 금지: Effect 이벤트 전달하기

  return <h1>{count}</h1>;
}

// useTimer 훅
function useTimer(callback, delay) {
  useEffect(() => {
    const id = setInterval(() => {
      callback();
    }, delay);
    return () => {
      clearInterval(id);
    };
  }, [delay, callback]); // 의존성에 "callback"을 지정해야 함
}
```

---

### 🚩 챌린지 : 멈추는 카운터 고치기

[`문제`] 멈추는 카운터 고치기 : 더하기 버튼을 연속적으로 여러 번 클릭할 때 타이머가 잠깐 멈춘 것처럼 보이는 문제 해결하기

```jsx
import { useState, useEffect } from "react";
import { experimental_useEffectEvent as useEffectEvent } from "react";

export default function Timer() {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + increment);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [increment]);

  return (
    <>
      <h1>
        카운터: {count}
        <button onClick={() => setCount(0)}>재설정</button>
      </h1>
      <hr />
      <p>
        초당 증가량:
        <button
          disabled={increment === 0}
          onClick={() => {
            setIncrement((i) => i - 1);
          }}
        >
          –
        </button>
        <b>{increment}</b>
        <button
          onClick={() => {
            setIncrement((i) => i + 1);
          }}
        >
          +
        </button>
      </p>
    </>
  );
}
```

- 버튼을 여러번 클릭할 때 타이머가 잠깐 멈추는 이유
  - `increment` 값이 변경될 때마다 useEffect가 다시 실행되어 `setInterval`을 정지하고 새로 만드는데
  - 이 과정에서 `setInterval → clearInterval → setInterval …` 타이머가 중단되었다가 다시 시작되는 재생성 루프에 빠지며 밀림 현상 발생으로 타이머가 잠깐 멈춘 것 처럼 보임

[`문제풀이`] `Effect Event`를 사용해 `useEffect`가 `increment` 값에 반응하지 않도록 변경

```jsx
const onTick = useEffectEvent(() => {
  setCount((c) => c + increment);
});

useEffect(() => {
  const id = setInterval(() => {
    onTick();
  }, 1000);
  return () => {
    clearInterval(id);
  };
}, []);
```

---

## Effect 린터

`eslint-plugin-react-hooks`는 리액트에서 `useEffect`, `useCallback`, `useMemo`와 같은 Hooks를 사용할 때 올바르게 사용하도록 도와주는 ESLint 플러그인이다. `useEffect`와 관련해서 2가지 주요 규칙을 제공한다.

1. **react-hooks/rules-of-hooks**
   - 모든 Hooks는 컴포넌트 최상단 또는 다른 Hook 안에서만 호출되어야 한다.
2. **react-hooks/exhaustive-deps**
   - `useEffect`, `useCallback`, `useMemo`의 의존성 배열이 올바른지 검사한다.
   - 의존성 배열에 사용된 값이 빠지지 않았는지 알려준다.

<br/>

### eslint-plugin-react-hooks 적용하기

1. `eslint-plugin-react-hooks` 설치

```bash
yarn add -D eslint-plugin-react-hooks
```

<br/>

2. `.eslintrc` 설정에 플러그인 추가

- `.eslintrc.js` 또는 `.eslintrc.json`

```bash
module.exports = {
  // ...
  plugins: [
    "react-hooks",
  ],
  rules: {
    "react-hooks/rules-of-hooks": "error", // Hooks 규칙 강제
    "react-hooks/exhaustive-deps": "warn", // 의존성 배열 검사
  },
};
```

<br/>

3. ESLint가 React, JSX를 이해할 수 있게 하기

- `eslint-plugin-react` 및 관련 preset이 설정되어있는지 체크

```bash
yarn add -D eslint-plugin-react eslint-config-react-app
```

- `.eslintrc.js` 또는 `.eslintrc.json`

```bash
module.exports = {
  extends: [
    "react-app",
    "plugin:react-hooks/recommended"
  ],
};
```

> `plugin:react-hooks/recommended`는 위에서 설정한 두 개의 룰을 자동으로 켜준다.

<br/>

4. TypeScript를 쓰는 경우

```bash
yarn add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

- `.eslintrc.js` 또는 `.eslintrc.json`

```bash
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: [
    "plugin:react-hooks/recommended"
  ],
};
```

<br/>

5. 에디터에서 ESLint 플러그인 켜져있는지 체크(VS Code)

- `settings.json`

```bash
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Effect 의존성 제거하기

> `react-hooks/exhaustive-deps`<br/>
> Effect를 작성하면 린터는 Effect의 의존성 목록에 Effect가 읽는 모든 반응형 값을 포함했는지 확인하고 잘못된 의존성이 지정되었거나 의존성이 누락된 경우 경고한다.<br/>
> Effect의 린트 규칙에 따라 지정해야 하는 의존성 값들 중 의존성 지정을 하고싶지 않은 경우 해결할 수 있는 방안들을 몇 가지 제시하고 있다.

<br/>

### 의존성이 아님을 증명하기

- Effect의 코드에서 사용되는 모든 반응형 값은 의존성 목록에 선언되어야 하므로 **의존성 목록은 주변 코드에 의해 결정된다.**

```jsx
const serverUrl = "https://localhost:1234";

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); // 🔴 React Hook useEffect has a missing dependency: 'roomId'
  // ...
}
```

- `props`인 `roomId`는 **반응형 값**으로 의존성 목록에서 제외시킬 수 없다.
- `roomId`가 의존성이 될 필요가 없다면 그것을 린터에 증명하면 된다.<br/>
  ⇒ `roomId`를 컴포넌트 밖으로 이동시켜 **반응형 값이 아니고 재랜더링 시에도 변경되지 않는 값**임을 보여준다.

  ```jsx
  const serverUrl = "https://localhost:1234";
  const roomId = "music"; // Not a reactive value anymore

  function ChatRoom() {
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      connection.connect();
      return () => connection.disconnect();
    }, []); // ✅ All dependencies declared
    // ...
  }
  ```

<br/>

### 불필요한 의존성 제거하기

`Effect`는 의존성 배열의 값 중 하나라도 변경되면 `Effect`를 다시 실행시키는데 다음과 같은 상황들로 그러지 않기를 원할 수도 있다.

- `Effect` 안의 일부 로직은 어떤 조건에서만 다시 실행되기를 원할 수도 있다.
- 일부 의존성의 변경에 반응하지 않고 단지 최신 값만 읽고 싶을 수도 있다.
- 의존성은 객체나 함수이기 때문에 의도치 않게 너무 자주 변경될 수 있다.

이런 상황에서 다음과 같은 것들을 고려해볼 수 있다.

- 이 코드가 꼭 `Effect`가 되어야 할까?
- `Effect`가 서로 관련 없는 여러 가지 작업을 수행하고 있진 않은가?
- 다음 `State`를 계산하기 위해 어떤 `State`를 읽고 있는가?

<br/>

> 1️⃣ **하나의 `Effect` 내에서 관련 없는 여러 가지 작업을 수행하지 않도록 수정한다.**

✅ 각 `Effect`는 독립적인 동기화 프로세스를 나타낸다. 즉, 하나의 `Effect`를 삭제해도 다른 `Effect`의 로직이 깨지지 않아야 한다.

```jsx
function ShippingForm({ country }) {
  const [cities, setCities] = useState(null);
  const [city, setCity] = useState(null);
  const [areas, setAreas] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setCities(json);
        }
      });
    // 🔴 Avoid: A single Effect synchronizes two independent processes
    if (city) {
      fetch(`/api/areas?city=${city}`)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setAreas(json);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [country, city]); // ✅ All dependencies declared

  // ...
```

- 이 코드는 서로 관련이 없는 **두 가지 프로세스를 동기화**하고 있다.
  - `country` props를 기반으로 `cities` 목록을 가져온다.
  - `city` state를 기반으로 `areas` 목록을 가져온다.
- 이렇게 하면 `city` 값이 바꼈을 때 `fetchCities(country)`를 불필요하게 호출하는 상황이 발생

⇒ 로직을 **2개의 `Effect`로 분할**해 각 `Effect`는 해당 로직에 관련이 있는 `props`에만 반응하도록 수정해야 한다.

<br/>

> 2️⃣ **`Effect` 내에서 `state`를 직접 읽지 말 것**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages([...messages, receivedMessage]);
    });
    return () => connection.disconnect();
  }, [roomId, messages]); // ✅ All dependencies declared
  // ...
```

- `setMessages` 함수에서 직접 `state` 값인 `messages`를 읽는다면 이는 의존성 배열에 포함이 되어야 한다.
- `setMessages`에 의해 `messages` 값이 변경되면 `Effect`의 의존성에 `messages`가 지정되어있으므로 `useEffect`는 다시 동기화된다. ⇒ 새 메세지가 올 때마다 채팅은 다시 연결되게 될 것

**⇒ ✨ 업데이터 함수를 `setMessages`에 전달**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages(msgs => [...msgs, receivedMessage]);
    });
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

- 이제 `Effect`내에서 `messages` 변수를 읽지 않기 때문에 의존성 배열에 `messages`를 넣지 않아도 된다. ⇒ 새 메세지가 와도 채팅방에 다시 연결하지 않음
- `setMessages(msgs => [...msgs, receivedMessage])`
  - 리액트는 업데이터 함수를 대기열에 넣고 다음 렌더링 중에 `msgs` 인수(최신 `messages` 값)를 제공한다.

<br/>

> 3️⃣ **값의 변경에 반응하지 않고 값을 읽고 싶을 때 -** `useEffectEvent`

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages(msgs => [...msgs, receivedMessage]);
      if (!isMuted) {
        playSound();
      }
    });
    return () => connection.disconnect();
  }, [roomId, isMuted]); // ✅ All dependencies declared
  // ...
```

- `isMuted`를 의존성에서 빼버리면 `isMuted`값이 변경되더라도 `useEffect`는 그것을 알지 못함.
- `EffectEvent`를 사용해서 `useEffect`가 `isMuted`값에 반응하지 않으면서도 항상 최신값을 읽을 수 있도록 해야함

```jsx
import { useState, useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const onMessage = useEffectEvent(receivedMessage => {
    setMessages(msgs => [...msgs, receivedMessage]);
    if (!isMuted) {
      playSound();
    }
  });

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      onMessage(receivedMessage);
    });
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

<br/>

> 4️⃣ **일부 반응형 값이 의도치 않게 변경될 때(객체, 함수)**

```jsx
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  const options = {
    serverUrl: serverUrl,
    roomId: roomId
  };

 useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // ✅ All dependencies declared
  // ...
```

- `options`는 컴포넌트 본문에서 선언되므로 반응형 값 → 의존성으로 지정해야 한다.
- `message`가 변경되었을 때 컴포넌트가 리렌더링되면서 사이드 이펙트로 `options` 는 새로운 주소값을 가진 객체로 다시 만들어진다.
- 즉 `message`는 `effect`의 의존성이 아니지만 리렌더링을 트리거하기 때문에 매 렌더링마다 채팅방이 새 연결을 만들고 이전 연결을 끊는 흐름이 반복된다.

<br/>

#### (1) 정적 객체와 함수를 컴포넌트 외부로 이동

```jsx
function createOptions() {
  return {
    serverUrl: 'https://localhost:1234',
    roomId: 'music'
  };
}

function ChatRoom() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const options = createOptions();
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, []); // ✅ All dependencies declared
  // ...
```

<br/>

#### (2) Effect 내에서 동적 객체 및 함수 이동

- 객체가 반응형 값에 의존하는 경우에는 컴포넌트 외부로 끌어낼 수 없다.
  ⇒ **Effect 코드 내부로 이동시키기**

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId
    };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

- `options`가 `Effect` 내부에서 선언되었으므로 의존성 배열에 포함시키지 않는다.

<br/>

#### (3) 객체/함수에서 원시 값 읽기

- `props`로 객체를 받는 경우 부모 컴포넌트가 재렌더링 될 때마다 `Effect`가 다시 연결될 수 있다.<br/>
  ⇒ `Effect` 외부에서 **구조 분해 할당으로 객체 내부 원시값을 읽음**으로 의존성 피하기

```jsx
function ChatRoom({ options }) {
  const [message, setMessage] = useState('');

 // options를 구조분해 할당
  const { roomId, serverUrl } = options;
  useEffect(() => {
    const connection = createConnection({
      roomId: roomId,
      serverUrl: serverUrl
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]); // ✅ All dependencies declared
  // ...
```

- `options.roomId`, `options.serverUrl` 값이 실제로 변경되었을 때만 채팅이 새로 연결
- 함수도 똑같이 `Effect` 외부에서 호출하여 의존성 피하기

  - 부모 컴포넌트가 함수 전달

  ```jsx
  <ChatRoom
    roomId={roomId}
    getOptions={() => {
      return {
        serverUrl: serverUrl,
        roomId: roomId,
      };
    }}
  />
  ```

  - `Effect` 외부에서 함수 호출해 `Effect`에는 원시값 사용

  ```jsx
  function ChatRoom({ getOptions }) {
    const { roomId, serverUrl } = getOptions();
    ...
  ```

---

## 커스텀 Hook으로 로직 재사용하기

### 커스텀 Hook: 컴포넌트간 로직 공유하기

- 여러 컴포넌트에서 네트워크 온라인/오프라인 상태에 따라 다른 UI나 로직을 실행하고 싶을 때 각각의 컴포넌트에서 네트워크 상태를 체크하는 코드를 중복해서 작성해야 한다.
- 이를 공통된 훅으로 분리해서 재사용하고 싶을 때 커스텀 Hook을 직접 작성할 수 있다. ⇒ 컴포넌트 내 로직이 단순해지고 읽기 쉬워진다.

```jsx
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? "✅ 온라인" : "❌ 연결 안 됨"}</h1>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log("✅ 진행사항 저장됨");
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? "진행사항 저장" : "재연결 중..."}
    </button>
  );
}
```

- `useOnlineStatus` 라는 커스텀 훅을 사용해 네트워크 상태를 공유하기

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return isOnline;
}
```

<br/>

### 커스텀 Hook 작명 규칙

- Hook의 이름은 항상 `use`로 시작해야 한다.
- Hook의 이름은 `use` 뒤에 대문자로 시작해야 한다.
  - ex) `useState`, `useOnlineStatus`

> 🔺 함수가 어떠한 Hook도 호출하지 않는다면, 이름을 use로 시작하지 말고 일반 함수로 작성해야 한다.

```jsx
// 🔴 안 좋은 예시 : Hook을 사용하고 있지 않는 Hook.
function useSorted(items) {
  return items.slice().sort();
}

// ✅ 좋은 예시 : Hook을 사용하지 않는 일반 함수.
function getSorted(items) {
  return items.slice().sort();
}

// ✅ 좋은 예시 : Hook을 사용하는 Hook
function useAuth() {
  return useContext(Auth);
}
```

⇒ 일반 함수는 Hook 함수와 다르게 어디서든 사용할 수 있으므로 일반함수와 Hook을 확실히 구분시키는 것이 좋다

```jsx
function List({ items, shouldSort }) {
  let displayedItems = items;
  if (shouldSort) {
    // ✅ getSorted()가 Hook이 아니기 때문에 조건에 따라 호출할 수 있습니다.
    displayedItems = getSorted(items);
  }
  // ...
}
```

---

### 일반함수와 Hook 비교

| 구분                        | 일반 함수                      | Hook                                           |
| --------------------------- | ------------------------------ | ---------------------------------------------- |
| ❓ 목적                     | 어떤 계산이나 로직을 실행      | **React 컴포넌트의 상태, 생명주기 등을 제어**  |
| 🔁 상태 기억                | 기억 X (호출될 때마다 새 결과) | **컴포넌트가 리렌더되어도 상태를 유지**        |
| ⏱ 생명주기 접근             | 불가능                         | `useEffect` 등으로 접근 가능                   |
| 💡 React 내부 시스템과 연결 | 불가능                         | 연결됨 (렌더링, 상태관리, 의존성 추적 등)      |
| 예시                        | `formatDate(date)`             | `useTimer()` → 1초마다 시간이 바뀌는 상태 관리 |

---

### 커스텀 Hook은 state 자체를 공유 X, state 저장 로직을 공유 O

<br/>

`useFormInput` 커스텀 Hook

```jsx
import { useState } from "react";

export function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const inputProps = {
    value: value,
    onChange: handleChange,
  };

  return inputProps;
}
```

```jsx
function Form() {
  const firstNameProps = useFormInput('Mary');
  const lastNameProps = useFormInput('Poppins');
  // ...
```

- 커스텀 훅은 각각 독립적인 `state`와 `useEffect`를 갖고 동작한다.

---

### Hook사이에 상호작용하는 값 전달하기

<br/>

`useChatRoom` 커스텀 훅

```jsx
export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId,
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on("message", (msg) => {
      showNotification("New message: " + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

`ChatRoom` 컴포넌트

```jsx
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState("https://localhost:1234");

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl,
  });

  return (
    <>
      <label>
        Server URL:
        <input
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}
```

- `roomId`가 바뀔 때마다 `ChatRoom` 컴포넌트가 재렌더링된다.
- 컴포넌트가 재렌더링되면 `useChatRoom({ roomId, serverUrl })`이 다시 호출된다. → 최신값이 훅으로 전달됨
- `useChatRoom` 안의 `useEffect`는 `roomId`, `serverUrl`을 의존성으로 갖고 있어, 값이 바뀌면 새로운 connection을 연결한다.

---

### 커스텀 Hook에 이벤트 핸들러 넘겨주기

```jsx
export function useChatRoom({ serverUrl, roomId }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId,
    };
    const connection = createConnection(options);
    connection.connect();
    // 커스텀 Hook을 사용하는 컴포넌트마다 다른 이벤트를 실행하고 싶다면?
    connection.on("message", (msg) => {
      showNotification("New message: " + msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}
```

- 메세지가 도착했을 때 어느 컴포넌트에서든 `showNotification` 이벤트를 실행하게 됨

```jsx
export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl,
    onReceiveMessage(msg) {
      showNotification('New message: ' + msg);
    }
  });
  // ...
```

```jsx
export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  useEffect(() => {
    const options = {
      serverUrl: serverUrl,
      roomId: roomId,
    };
    const connection = createConnection(options);
    connection.connect();
    connection.on("message", (msg) => {
      onReceiveMessage(msg);
    });
    return () => connection.disconnect();
  }, [roomId, serverUrl, onReceiveMessage]);
}
```

- `onReceiveMessage` props에 컴포넌트마다 다른 이벤트 핸들러를 전달함으로써 각 컴포넌트마다 새 메세지가 도착했을 때 다른 이벤트를 실행할 수 있음

  > 🔺 그러나 `onReceiveMessage`를 의존성 지정함으로써 의도치 않은 재동기화가 발생할 수 있다.(함수이기 때문에 리렌더링 시 새 주소값으로 변경되는 문제)
  > ⇒ `useEffectEvent`로 분리

  ```jsx
  import { useEffect, useEffectEvent } from "react";
  // ...

  export function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
    const onMessage = useEffectEvent(onReceiveMessage);

    useEffect(() => {
      const options = {
        serverUrl: serverUrl,
        roomId: roomId,
      };
      const connection = createConnection(options);
      connection.connect();
      connection.on("message", (msg) => {
        onMessage(msg);
      });
      return () => connection.disconnect();
    }, [roomId, serverUrl]); // ✅ 모든 의존성이 정의됨.
  }
  ```

---

### 언제 커스텀 Hook을 사용해야 할까?

```jsx
function ShippingForm({ country }) {
  const [cities, setCities] = useState(null);
  // 이 Effect는 나라별 도시를 불러옵니다.
  useEffect(() => {
    let ignore = false;
    fetch(`/api/cities?country=${country}`)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setCities(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [country]);

  const [city, setCity] = useState(null);
  const [areas, setAreas] = useState(null);
  // 이 Effect 선택된 도시의 구역을 불러옵니다.
  useEffect(() => {
    if (city) {
      let ignore = false;
      fetch(`/api/areas?city=${city}`)
        .then(response => response.json())
        .then(json => {
          if (!ignore) {
            setAreas(json);
          }
        });
      return () => {
        ignore = true;
      };
    }
  }, [city]);

  // ...
```

- 하나는 나라별 도시 목록을 가져오는 api를 호출, 다른 하나는 도시별 구역 목록을 가져오는 api를 호출한다.
- 이 두 개의 effect는 각각 다른 프로세스를 갖기 때문에 별도의 `Effect`로 분리하는게 맞지만, api를 호출하고 받아온 데이터를 `state`를 저장하는 로직 흐름은 똑같다.
- ⇒ 이런 경우 `useData`라는 커스텀 Hook을 통해 공통된 로직을 추출하고 코드를 간소화할 수 있다.

```jsx
function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (url) {
      let ignore = false;
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          if (!ignore) {
            setData(json);
          }
        });
      return () => {
        ignore = true;
      };
    }
  }, [url]);
  return data;
}
```

```jsx
function ShippingForm({ country }) {
  const cities = useData(`/api/cities?country=${country}`);
  const [city, setCity] = useState(null);
  const areas = useData(city ? `/api/areas?city=${city}` : null);
  // ...
```

- `ShippingForm` 컴포넌트 내에서 같은 커스텀 훅을 사용했지만 각각 독립적인 `Effect`로서 동작한다.

<br/>

> 🧪 리액트가 데이터 패칭을 위한 내부 해결책을 제공할 예정
> `useData`와 같은 커스텀 훅을 만들지 않아도 `use` 키워드로 데이터를 쉽게 페칭해오는 기능을 제공할 예정이라고 한다.

```jsx
import { use } from 'react'; // 아직 사용 불가능

function ShippingForm({ country }) {
  const cities = use(fetch(`/api/cities?country=${country}`));
  const [city, setCity] = useState(null);
  const areas = city ? use(fetch(`/api/areas?city=${city}`)) : null;
  // ...
```

<br/>

### 커스텀 Hook 올바르게 사용하기

좋은 커스텀 Hook은 호출 코드가 하는 일을 제한하면서 좀 더 선언적으로 만들 수 있다.

> ✅ useData(url), useImpressionLog(eventName, extraData), useChatRoo(options), useMediaQuery(query), useSocket(url) 등..

- 이름만 봐도 무엇을 하는지 알 수 있도록 작성
- 기능이 명확하고 한 가지 목적에 집중하도록 작성

> ❌ useMount(fn), useEffectOnce(fn), useUpdateEffect(fn) 등…

- “마운트 시에만 동작”과 같이 커스텀 생명 주기 Hook을 만드는 것은 피해야 한다.
- 이는 단순히 useEffect를 한번 감싸는 역할밖에 안하기 때문에 기능적인 목적이 없음

---

### 커스텀 Hook은 더 나은 패턴으로 변경할 수 있도록 도와준다

`Effect`는 최후의 수단같은 것이다. “리액트에서 벗어나”는 것이 필요할 때 사용하는 것으로 `Effect`를 남용하는 것은 좋지 않다.

> 커스텀 Hook으로 Effect를 감싸는 것이 유용할 때

1. 매우 명확하게 Effect로 주고받는 데이터 흐름을 만들 때
2. 컴포넌트가 Effect의 정확한 실행보다 목적에 집중하도록 할 때
3. 리액트가 새 기능을 추가할 때, 다른 컴포넌트의 변경 없이 이 Effect를 삭제할 수 있을 때

---

### ✨ 요약

- 커스텀 Hook을 사용하면 컴포넌트 간 로직을 공유할 수 있다.
- 커스텀 Hook은 state 자체가 아닌 state 저장 로직만 공유한다.
- 하나의 Hook에서 다른 Hook으로 반응형 값을 전달할 수 있고, 값은 최신 상태로 유지된다.
- 모든 Hook은 컴포넌트가 재렌더링될 때마다 재실행된다.
- 커스텀 Hook의 코드는 컴포넌트 코드처럼 순수해야 한다.
- 커스텀 Hook을 통해 받는 이벤트 핸들러는 Effect로 감싸야 한다.
- useMount같은 커스텀 Hook은 생성하면 안된다. 기능적인 용도가 명확한 Hook을 작성해야 한다.
- Hook이 꼭 필요하지 않을 수 있다.

---

### 🚩챌린지 : 엇갈린 움직임 구현하기

[문제] useDelayedValue 훅 완성하기. 점들이 앞의 점을 간격을 두고 따라가는 움직임 구현하기

`usePointerPosition` 훅

- 현재 포인터의 좌표 반환 `{ x: 0, y: 0 }`

```jsx
import { useState, useEffect } from "react";

export function usePointerPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);
  return position;
}
```

`App`

```jsx
import { usePointerPosition } from "./usePointerPosition.js";

function useDelayedValue(value, delay) {
  // TODO: 이 Hook 실행하기
  return value;
}

export default function Canvas() {
  const pos1 = usePointerPosition();
  const pos2 = useDelayedValue(pos1, 100);
  const pos3 = useDelayedValue(pos2, 200);
  const pos4 = useDelayedValue(pos3, 100);
  const pos5 = useDelayedValue(pos3, 50);
  return (
    <>
      <Dot position={pos1} opacity={1} />
      <Dot position={pos2} opacity={0.8} />
      <Dot position={pos3} opacity={0.6} />
      <Dot position={pos4} opacity={0.4} />
      <Dot position={pos5} opacity={0.2} />
    </>
  );
}

function Dot({ position, opacity }) {
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "pink",
        borderRadius: "50%",
        opacity,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: "none",
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }}
    />
  );
}
```

<br/>

[`문제풀이`]

```jsx
import { useState, useEffect } from "react";
import { usePointerPosition } from "./usePointerPosition.js";

function useDelayedValue(value, delay) {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    setTimeout(() => {
      setDelayedValue(value);
    }, delay);
  }, [value, delay]);

  return delayedValue;
}
```

- `useDelayedValue`훅을 사용해 뒤에 점들의 위치 값을 `delay`만큼 지연시켜 갱신시켜줌
- => 지연된 값 업데이트가 뒤에 점들이 앞의 점을 따라가는 모양으로 움직이는 것처럼 보이게 함

- ⚠️ 여기선 cleanup 함수를 호출하면 안됨
  - `value`가 바뀔 때마다 `useEffect`가 실행되고 이전에 걸려 있던 `clearTimeout()`으로 취소되어 `setDelayedValue()`가 실행되지 않음
  - `setTimeout`은 단 한 번만 실행되기 때문에 일반적으로 클린업할 필요가 없음
  - `useEffect`에서 항상 cleanup이 필요한건 아니기 때문에 로직에 따라 필요성을 생각하고 작성해야 함

```jsx
useEffect(() => {
  const timeout = setTimeout(() => {
    setDelayedValue(value);
  }, delay);

  return () => clearTimeout(timeout); // cleanup ❌
}, [value, delay]);
```
