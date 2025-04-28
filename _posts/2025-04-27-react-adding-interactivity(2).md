---
title: "React 상호작용 더하기: setState의 동작 방식"

excerpt: "React v19 공식문서-setState와 리렌더링, State 업데이트 큐, 객체/배열 state 업데이트 하기"

categories:
  - React

tags:
  - [react, react19, jsx, setState, queueing, rendering]

permalink: /categories/react/adding-interactivity-2/

toc: true

toc_sticky: true

date: 2025-04-27

last_modified_at: 2025-04-27
---

## 상호작용 더하기(Adding interactivity)

- 스냅샷으로서의 State
- State 업데이트 큐
- 객체 State 업데이트하기
- 배열 State 업데이트하기

[리액트v19 공식문서-상호작용 더하기] <https://ko.react.dev/learn/state-as-a-snapshot>

---

## 스냅샷으로서의 State

### State를 설정하면 새 렌더링을 요청한다

```jsx
import { useState } from "react";

const Form = () => {
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState("Hi");
  if (isSent) {
    return <h1>Your message is on its way!</h1>;
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setIsSent(true);
        setMessage(message);
      }}
    >
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default Form;
```

`Send` 버튼을 클릭

⇒ `onSubmit` 이벤트 핸들러 실행

⇒ `setIsSent(true)`가 `isSent`를 `true`로 설정

⇒ 새로운 렌더링을 큐에 넣음

⇒ 리액트는 새로운 `isSent` 값에 따라 컴포넌트 다시 렌더링

<br/>

### 렌더링은 그 시점의 스냅샷을 찍는다

- 리액트 컴포넌트 함수에서 반환하는 JSX는 “**시간상 UI의 스냅샷**”과 같다.
- `useState`를 호출하면 리액트는 해당 렌더링에 대한 `state의 스냅샷`을 제공한다.
- `prop`, `이벤트 핸들러`, `로컬 변수`는 모두 **렌더링 당시의** `state`를 사용해 새로 계산된다.

> **🔁 리액트 재렌더링 순서**
>
> 1. 리액트가 함수를 다시 호출<br/>
> 2. 함수가 새로운 **JSX 스냅샷** 반환<br/>
> 3. 리액트가 반환된 **JSX 스냅샷**과 일치하도록 화면을 업데이트

<br/>

```jsx
import { useState } from "react";

const Counter = () => {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(number + 1); // 현재 number : 0, 다음 렌더링에서 number 1로 변경할 준비
          setNumber(number + 1); // 현재 number : 0, 다음 렌더링에서 number 1로 변경할 준비
          setNumber(number + 1); // 현재 number : 0, 다음 렌더링에서 number 1로 변경할 준비
        }}
      >
        +3
      </button>
    </>
  );
};

export default Counter;
```

⇒ state를 업데이트하면 다음 렌더링에 대해서만 변경된다.

- `onClick`에서 `setNumber(number + 1)`을 **3번** 호출해도 다음 렌더링에서 `number`는 `1`이 되는데, 이는 현재의 렌더링에서는 `setNumber(number+1)` 실행 후에도 `number`가 여전히 `0`이기 때문이다.
  ⇒ ‘`0 + 1`’ 을 **3번** 한 것과 같은 결과

<br/>

### 시간 경과에 따른 State

```jsx
import { useState } from "react";

const Counter = () => {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber(number + 5);
          setTimeout(() => {
            alert(number);
          }, 3000);
        }}
      >
        +5
      </button>
    </>
  );
};

export default Counter;
```

- `setNumber(number + 5)`를 실행하고 **3초 후** `alert(number)`를 실행해, 리렌더링 된 후 alert창이 뜨더라도 `alert`는 숫자 `0`을 표시함
- ⇒ 과거에 생성된 이벤트 핸들러는 **그것이 생성된 렌더링 시점의** `state`**값을 갖는다**

---

## State 업데이트 큐

### React state batches 업데이트

**batching?** 리액트는 이벤트 핸들러가 모두 끝날 때까지 기다린 다음에, 한 번에 `state` 업데이트를 처리한다.

- 핸들러 안에서 여러 번 `setState`를 해도, 그 중 마지막 값이 반영된다.
- 렌더링이 핸들러가 끝나고 한 번에 일어나기 때문에 더 빠르고 효율적이다.
- 중간에 반쯤 업데이트된 혼란스러운 상태를 보여주는 걸 방지한다.

### 다음 렌더링 전에 동일한 state 변수를 여러 번 업데이트 하기

#### 함수형 업데이트 사용하기

`setNumber(number + 1)` 대신 `setNumber(n ⇒ n + 1)` 과 같이 **이전 큐의 `state`를 기반으로** 다음 `state`를 계산하는 함수를 전달할 수 있다.

```jsx
import { useState } from "react";

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button
        onClick={() => {
          setNumber((n) => n + 1);
          setNumber((n) => n + 1);
          setNumber((n) => n + 1);
        }}
      >
        +3
      </button>
    </>
  );
}
```

- 코드 동작 방식 : `setNumber(n ⇒ n + 1)` : `n ⇒ n + 1` 함수를 큐에 추가한다.

| 큐에 추가된 업데이트 함수 | n   | 반환값    |
| ------------------------- | --- | --------- |
| n ⇒ n + 1                 | 0   | 0 + 1 = 1 |
| n ⇒ n + 1                 | 1   | 1 + 1 = 2 |
| n ⇒ n + 1                 | 2   | 2 + 1 = 3 |

⇒ 리액트는 최종 결과인 `3`을 `useState`에서 반환한다.

```jsx
<button
  onClick={() => {
    setNumber(number + 5); // 5
    setNumber((n) => n + 1); // 6
  }}
/>
```

⇒ number : 6

- `setNumber(number + 5)` 는 `setNumber(n ⇒ 5)`처럼 동작해서 `n`(이전 값)을 무시하고 사용하지 않는다.

```jsx
<button onClick={() => {
  setNumber(number + 5); // 5
  setNumber(n => n + 1); // 6
  setNumber(42); // 42
}}>
```

⇒ number : 42

#### 함수형 업데이트 처리 방식

- 이벤트 핸들러가 다 끝나고 나서 리액트가 다시 렌더링할 때 큐에 등록된 `state` 업데이트를 처리한다
- `setState(n ⇒ n + 1)`과 같은 업데이터 함수는 **렌더링 중에 실행**된다
- 업데이터 함수 안에서는 새 값만 리턴해야 하고, 다른 작업(side effect)은 하면 안된다
- `Strict Mode`에서는 디버깅을 돕기 위해 업데이터 **함수를 2번 실행**해서 결과 값이 같은지(**순수성**)를 체크한다.

#### 업데이터 함수 명명 규칙

```jsx
// 변수 첫 글자 약어 사용(가장 보편적)
setEnabled((e) => !e);
setLastName((ln) => ln.reverse());
setFriendCount((fc) => fc * 2);
// 변수 풀네임 사용
setEnabled((enabled) => !enabled);
// 접두사 사용
setEnabled((preEnabled) => !preEnabled);
```

---

## 객체 State 업데이트하기

### Mutation(변경)

- 자바스크립트에서 `string`, `number`, `boolean`과 같은 원시값들은 변경할 수 없다.
  - ex. `x` state가 `0`에서 `5`로 바뀌더라도 숫자 `0` 자체는 바뀌지않음을 의미한다.
- 다만 객체는 객체 자체의 내용을 바꿀 수 있고 이를 변경(`mutation`)이라고 한다.

  ```jsx
  const [position, setPosition] = useState({ x: 0, y: 0 });
  ```

  - ex. position.x = 5

- 리액트에서는 `state`의 객체들이 기술적으로 변경(`mutation`)이 가능할지라도 원시값인 `string`, `number`, `boolean`과 같이 불변성을 가진 것처럼 다루어야 한다
  ⇒ 객체를 변경하는 대신 **새로운 객체를 만들어 교체**

<br/>

### 새 객체를 생성하여 state 업데이트하기

```jsx
export default function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
    >
    ...
  )
 }
```

- `setPosition`은 `position`을 **새로운 객체로 교체** → 컴포넌트를 **다시 렌더링**

<br/>

#### (1) 전개 문법으로 객체 복사하기

❌ 잘못된 방식: `state` 내 객체 직접 수정

```jsx
const [person, setPerson] = useState({
  firstName: "Barbara",
  lastName: "Hepworth",
  email: "bhepworth@sculpture.com",
});

function handleFirstNameChange(e) {
  person.firstName = e.target.value;
}
```

✅ 올바른 방식: `스프레드 연산자`로 객체를 복사해 일부분만 업데이트하기

```jsx
function handleFirstNameChange(e) {
  setPerson({
    ...person,
    firstName: e.target.value,
  });
}
```

✅ 올바른 방식: 객체 내 여러 필드를 하나의 이벤트 핸들러로 업데이트하기

```jsx
import { useState } from "react";

export default function Form() {
  const [person, setPerson] = useState({
    firstName: "Barbara",
    lastName: "Hepworth",
    email: "bhepworth@sculpture.com",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPerson({
      ...person,
      // []안에 동적인 프로퍼티를 명시할 수 있다
      [e.target.name]: e.target.value,
    });
  }

  return (
    <>
      <label>
        First name:
        <input
          name="firstName"
          value={person.firstName}
          onChange={handleChange}
        />
      </label>
      ...
    </>
  );
}
```

> 🔴 스프레드 연산자는 한 레벨 깊이의 내용만 복사한다.<br/>
>
> - 중첩된 객체의 프로퍼티를 업데이트하고 싶을 때는 스프레드 연산자를 여러번 사용하거나 Immer과 같은 라이브러리를 이용할 수 있다.

<br/>

#### (2) 중첩된 객체 갱신하기

```jsx
const [person, setPerson] = useState({
  name: "Niki de Saint Phalle",
  artwork: {
    title: "Blue Nana",
    city: "Hamburg",
    image: "https://i.imgur.com/Sd1AgUOm.jpg",
  },
});
```

artwork 객체 내 city 속성을 변경하고 싶다면,

```jsx
const nextArtwork = { ...person.artwork, city: "New Delhi" };
const nextPerson = { ...person, artwork: nextArtwork };
setPerson(nextPerson);
```

또는,

```jsx
setPerson({
  ...person,
  artwork: {
    ...person.artwork,
    city: "New Delhi",
  },
});
```

이런식으로 한 레벨의 객체마다 스프레드 연산자를 사용해 복사해서 업데이트 할 수 있다.

<br/>

#### ✨ Immer 라이브러리를 사용하여 중첩된 객체 간결하게 업데이트하기

```jsx
updatePerson((draft) => {
  draft.artwork.city = "Lagos";
});
```

- `draft`는 Immer이 제공하는 `Proxy`라고 하는 특별한 객체 타입
- 객체를 자유롭게 변경하더라도 Immer은 내부적으로 `draft`의 어느 부분이 변경되었는지 알아내어, 변경사항을 포함한 **완전히 새로운 객체를 생성한다**

<br/>

- 설치 & 사용

```bash
npm install immer
```

```jsx
import { useState } from 'react'
import { produce } from 'immer'

export default function Form() {
  const [person, setPerson] = useState({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    },
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPerson(
      produce((draft) => {
        draft.name = e.target.value
      }),
    )
  }
  ...
}

```

- `produce`는 상태의 복사본(`draft`)를 만들고 그 복사본에서만 직접 변경을 해 불변성 유지

---

## 배열 State 업데이트하기

배열도 객체와 마찬가지로 `state` 내 배열을 직접 변경해서는 안되며 업데이트할 때마다 새 배열을 `setState` 함수에 전달해야 한다.

|      | ❌ 배열을 변경           | ✅ 새 배열을 반환   |
| ---- | ------------------------ | ------------------- |
| 추가 | `push`, `unshift`        | `concat`, `[…arr]`  |
| 제거 | `pop`, `shift`, `splice` | `filter`, `slice`   |
| 교체 | `splice`, `arr[i] = …`   | `map`               |
| 정렬 | `reverse`, `sort`        | 배열 복사한 후 처리 |

<br/>

### (1) 배열에 항목 추가하기 : `[…arr]` 전개 연산자

```jsx
setArtists([
  ...artists,
  { id: nextId++, name: name }, // 새 항목을 추가
]);
```

<br/>

### (2) 배열에서 항목 제거하기: `filter`

```jsx
setArtists(
  artists.filter((a) => a.id !== artist.id) // 새로운 배열 반환
);
```

<br/>

### (3) 배열 변환하기: `map`

```jsx
const nextShapes = shapes.map((shape) => {
  // Square는 변경하지 않고 Circle 만 변경
  if (shape.type === "square") {
    return shape;
  } else {
    return {
      ...shape,
      y: shape.y + 50,
    };
  }
});
// 새로운 배열로 교체
setShapes(nextShapes);
```

<br/>

### (4) 배열 내 항목 교체하기: `map`

```jsx
const nextCounters = counters.map((c, i) => {
  if (i === index) {
    return c + 1;
  } else {
    return c;
  }
});
setCounters(nextCounters);
```

<br/>

### (5) 배열에 항목 삽입하기: `slice`

```jsx
const insertAt = 1;
const nextArtists = [
  // 삽입 지점 이전 항목
  ...artists.slice(0, insertAt),
  // 새 항목
  { id: nextId++, name: name },
  // 삽입 지점 이후 항목
  ...artists.slice(insertAt),
];
setArtists(nextArtists);
```

<br/>

### (5) 배열 재 정렬하기: 배열 복사한 뒤 `reverse`, `sort`

- 비변경 함수가 따로 없다면 배열을 복사한 뒤 복사본에 변경 작업을 해서 `setState`에 전달

```jsx
const [list, setList] = useState(initialList);

function handleClick() {
  // 복사본 생성
  const nextList = [...list];
  nextList.reverse();
  setList(nextList);
}
```

<br/>

### (6) 배열 내부의 객체 업데이트하기: `map`

> 🔴 배열을 복사하더라도 배열 내부의 기존 항목을 변경해서는 안된다

```jsx
import { useState } from 'react';

const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [myList, setMyList] = useState(initialList);
  const [yourList, setYourList] = useState(
    initialList
  );

  function handleToggleMyList(artworkId, nextSeen) {
    const myNextList = [...myList];
    // [얕은복사]MyNextList는 새로운 배열이지만 내부의 항목들은 myList 원본 배열과 동일
    const artwork = myNextList.find(
      a => a.id === artworkId
    );
    // 원본 배열의 항목도 같이 변경된다
    artwork.seen = nextSeen;
    setMyList(myNextList);
  }
  ...
 }
```

⇒ `map`과 `스프레드 연산자`를 사용해 원본 배열의 항목 변경 없이 업데이트된 버전으로 교체

```jsx
setMyList(
  myList.map((artwork) => {
    if (artwork.id === artworkId) {
      // 새 객체를 만들어 반환
      return { ...artwork, seen: nextSeen };
    } else {
      // 변경시키지 않고 그대로 반환
      return artwork;
    }
  })
);
```

- 또는 객체 업데이트와 마찬가지로 `Immer` 라이브러리를 사용해 간단히 업데이트할 수 있다
  ⇒ Immer 라이브러리를 사용하면 복사본을 만들어 알아서 처리해주기 때문에 `push`, `pop`과 같은 배열 변경 함수들도 사용 가능하다.
