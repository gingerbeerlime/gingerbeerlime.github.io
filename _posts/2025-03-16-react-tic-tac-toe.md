---
title: "React 틱택토 게임 구현하기"

excerpt: "React v19 공식문서-틱택토 게임"

categories:
  - React

tags:
  - [react, react19, react concept, jsx, react hook]

permalink: /categories/react/tic-tac-toe/

toc: true

toc_sticky: true

date: 2025-03-16

last_modified_at: 2025-03-16
---

## 🎮 튜토리얼: 틱택토 게임

2명의 플레이어가 번갈아가며 3x3 격자에 자신의 표시(X/O)를 놓고, 가로, 세로 또는 대각선으로 3개를 연속으로 배열하는 사람이 승리하는 게임

✅ 구현해야하는 기능

- 3x3격자의 보드판 마크업
- 보드판의 칸을 클릭할 때 클릭한 플레이어('X', 'O')가 표시되어야함
- 클릭시 승부를 확인해야하며, 승부가 나지 않은 경우에는 다음 플레이어로 전환
- 승부가 나면 게임 진행을 멈추고 승자를 표시

[리액트v19 공식문서-틱택토 게임](https://ko.react.dev/learn/tutorial-tic-tac-toe)

---

### ✅ 리액트 애플리케이션 기본 구조

`index.js` 앱을 시작하고 <App />을 root에 마운트

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`App.js` 최상위 컴포넌트

```jsx
import React from "react";

function App() {
  return (
    <div className="App">
      <h1>Hello, React!</h1>
    </div>
  );
}

export default App;
```

`index.html` root라는 div에 리액트가 렌더링됨

```jsx
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>  <!-- 여기에 React 컴포넌트가 들어감 -->
</body>
</html>
```

---

### 튜토리얼을 보기 전 앞서 학습한 개념을 토대로 게임을 구현해보았다.

#### 1️⃣ 보드판 마크업 구현

1. index 1~9까지 holder(소유자)가 null인 card 9개 state로 선언하고 map()함수를 이용해 9개의 카드를 3x3 격자 형태로 배치했다.
2. 이길 수 있는 경우들을 winningCases에 나열했다.

```jsx
import { useState } from "react";

export default function Game() {
  const winningCases = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const [cards, setCards] = useState(
    Array.from({ length: 9 }, (_, index) => ({ id: index + 1, holder: null }))
  );

  return (
    <div className="board">
      {cards.map((card) => {
        return (
          <button className="square" key={card.id}>
            {card.holder}
          </button>
        );
      })}
    </div>
  );
}
```

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 34px);
}
.square {
  background: #fff;
  border: 1px solid #999;
  float: left;
  font-size: 24px;
  font-weight: bold;
  line-height: 34px;
  height: 34px;
  margin-right: -1px;
  margin-top: -1px;
  padding: 0;
  text-align: center;
  width: 34px;
}
```

<br>

#### 2️⃣ 플레이어 상태 선언(X와 O)

1. useState로 player와 player값을 업데이트 하는 setPlayer를 선언하고 첫번째 플레이어는 ‘X’로 설정했다.
2. 마크업에 다음 플레이어를 표시

```jsx
import { useState } from "react";

export default function Game() {
  const winningCases = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const [cards, setCards] = useState(
    Array.from({ length: 9 }, (_, index) => ({ id: index + 1, holder: null }))
  );

  const [player, setPlayer] = useState("X");

  return (
    <>
      <div className="board">
        {cards.map((card) => {
          return (
            <button className="square" key={card.id}>
              {card.holder}
            </button>
          );
        })}
      </div>
      <p>Next player: {player}</p>
    </>
  );
}
```

<br>

#### 3️⃣ 이벤트 핸들러 연결

1. 카드 클릭 이벤트 연결 onClick={() ⇒ handleClick(card.id)}
   - onClick={handleClick(card.id)} 로 사용할 수 없음, 클릭시 이벤트가 발생하는게 아니고 바로 호출되어서 무한 루프 발생
2. handleClick 함수에서 클릭한 카드의 holder가 null인 경우에만 카드 소유자를 업데이트하는 함수(updateCardHolder) 실행
3. updateCardHolder에서 prevCards 이전 상태를 받아와 map()함수를 통해 새로운 배열을 업데이트

```jsx
import { useState } from "react";

export default function Game() {
  const winningCases = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const [cards, setCards] = useState(
    Array.from({ length: 9 }, (_, index) => ({ id: index + 1, holder: null }))
  );

  const [player, setPlayer] = useState("X");

  const updateCardHolder = (id) => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        return card.id === id ? { ...card, holder: player } : card;
      })
    );
  };

  const handleClick = (id) => {
    if (!cards.find((card) => card.id === id).holder) {
      updateCardHolder(id);
    }
  };

  return (
    <>
      <div className="board">
        {cards.map((card) => {
          return (
            <button
              className="square"
              key={card.id}
              onClick={() => handleClick(card.id)}
            >
              {card.holder}
            </button>
          );
        })}
      </div>
      <p>Next player: {player}</p>
    </>
  );
}
```

> **리액트의 불변성**<br>
> 리액트에서 불변성을 유지하는 것은 상태 관리의 핵심 원칙이다.<br>
> 리액트는 상태의 변경을 감지할 때, 객체나 배열의 참조를 비교하는데 원본 배열을 직접 변경하게 되면 참조가 동일하게 유지되어 리액트가 변경을 인식하지 못할 수 있다.

<br>

#### 4️⃣ 보드판이 업데이트되면 승부 확인

1. 승자 winner를 초기값 null로 state 선언
2. winner가 있을 땐 더 이상 보드판이 업데이트 되지 않도록 handleClick에 조건 추가
3. 승자가 있는지 체크하는 함수 checkIfWin 선언
   1. 승자가 있으면 setWinner 실행
   2. 승자가 없으면 setPlayer 다음 차례로 이동
4. cards 상태값이 변경되면 승부를 확인하는 checkIfWin 함수 실행(useEffect)

> 🚫setState 함수는 기본적으로 비동기로 실행되며 Promise를 반환하지 않기 때문에 await와 함께 쓸 수 없다. state 값이 변경되고 실행시킬 로직이 있을 때는 useEffect나 함수형 업데이트를 이용해야한다.

<br>
<br>

```jsx
import { useState } from "react";

export default function Game() {
  const winningCases = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  const [cards, setCards] = useState(
    Array.from({ length: 9 }, (_, index) => ({ id: index + 1, holder: null }))
  );

  const [player, setPlayer] = useState("X");

  const [winner, setWinner] = useState(null);

  const checkIfWin = () => {
    const cardsHold = cards
      .filter((card) => card.holder === player)
      .map((card) => card.id);
    const hasWinner = winningCases.some((item) =>
      item.every((id) => cardsHold.includes(id))
    );
    if (hasWinner) {
      setWinner(player);
    } else {
      setPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X"));
    }
  };

  useEffect(() => {
    if (winner) return;
    checkIfWin();
  }, [cards]);

  const updateCardHolder = (id) => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        return card.id === id ? { ...card, holder: player } : card;
      })
    );
  };

  const handleClick = (id) => {
    if (!cards.find((card) => card.id === id).holder && !winner) {
      updateCardHolder(id);
    }
  };

  return (
    <>
      <div className="board">
        {cards.map((card) => {
          return (
            <button
              className="square"
              key={card.id}
              onClick={() => handleClick(card.id)}
            >
              {card.holder}
            </button>
          );
        })}
      </div>
      <p>Next player: {player}</p>
    </>
  );
}
```

---

### 튜토리얼대로 구현하며 배운점

#### ✅ 컴포넌트 분리(Square, Board, Game)

```jsx
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
      </div>
    </>
  );
}

export default function Game() {
  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
    </div>
  );
}
```

하나의 사각형 칸을 나타내는 Square 컴포넌트, 여러 Square가 모인 보드판을 렌더링하는 Board 컴포넌트, 전체적인 게임 상태와 히스토리를 관리하는 Game 컴포넌트로 분리하여 게임의 계층적인 구조를 명확하게 표현했다.
<br>
<br>

#### ✅ 원본 데이터 불변성 유지

```jsx
function Board({ xIsNext, squares, onPlay }) {
  const handleClick = (i) => {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  };

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
    </>
  );
}
```

slice()함수를 사용해 매 이동마다 squares 배열의 새 복사본 `nextSquares`을 만들어 업데이트함으로써 원본 데이터의 불변성을 유지한다.
<br>
<br>

#### ✅ 시간 여행 기능 - 히스토리 관리

```jsx
export default function Game () {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const handlePlay = (nextSquares) => {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        ...
      </div>
    </div>

```

state값을 업데이트할 때 이전 값을 변경하지 않지 않고 새로운 배열을 만들기 떄문에 게임의 히스토리를 관리하기가 용이해졌다. `history`라는 state값에 게임 매 회차의 상태를 누적하고 `currentMove` 값을 이용해 현재 상태를 보여주고 과거의 상태로 돌리는 기능까지 구현할 수 있다.

#### ✅ 리팩토링

- 컴포넌트 분리(Card, Board, Game)
- 시간여행 구현(Game 컴포넌트)
- 승부 계산 함수 분리 및 로직 변경(checkIfWin)

```jsx
import { useState, useEffect } from "react";

export function Card({ id, holder, onCardClick }) {
  return (
    <button className="square" onClick={() => onCardClick(id)}>
      {holder}
    </button>
  );
}

export function Board({ cards, onPlay, winner, player }) {
  const updateCardHolder = (id) => {
    const nextCards = cards.map((card) => {
      return card.id === id ? { ...card, holder: player } : card;
    });
    onPlay(nextCards);
  };

  const handleClick = (id) => {
    if (!cards.find((card) => card.id === id).holder && !winner) {
      updateCardHolder(id);
    }
  };

  return (
    <>
      <div className="board">
        {cards.map((card) => {
          return (
            <Card
              key={card.id}
              id={card.id}
              holder={card.holder}
              onCardClick={handleClick}
            />
          );
        })}
      </div>
      <p>Next player: {player}</p>
      <p>Winner: {winner ? winner : "-"}</p>
    </>
  );
}

export default function Game() {
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([
    Array.from({ length: 9 }, (_, index) => ({ id: index, holder: null })),
  ]);
  const [currentMove, setCurrentMove] = useState(0);

  const nextPlayer = currentMove % 2 === 0 ? "X" : "O";
  const currentCards = history[currentMove];

  useEffect(() => {
    if (!winner) {
      const newWinner = checkIfWin(currentCards);
      if (newWinner) setWinner(newWinner);
    }
  }, [history]);

  const handlePlay = (nextCards) => {
    const nextHistory = [...history.slice(0, currentMove + 1), nextCards];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  };

  const jumpTo = (nextMove) => {
    setCurrentMove(nextMove);
    if (nextMove !== currentMove) setWinner(null);
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board
          cards={currentCards}
          onPlay={handlePlay}
          winner={winner}
          player={nextPlayer}
        />
      </div>
      <div className="game-info">
        <ol>
          {history.map((cards, move) => {
            return (
              <li key={move}>
                <button onClick={() => jumpTo(move)}>
                  {move > 0 ? "Go to move #" + move : "Go to game start"}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

const checkIfWin = (cards) => {
  const winningCases = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let caseSet of winningCases) {
    const [a, b, c] = caseSet;
    if (
      cards[a].holder &&
      cards[a].holder === cards[b].holder &&
      cards[a].holder === cards[c].holder
    ) {
      return cards[a].holder;
    }
  }
  return null;
};
```
