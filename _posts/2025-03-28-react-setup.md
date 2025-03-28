---
title: "React 개발 환경 설정하기: 에디터, 타입스크립트, 리액트 컴파일러"

excerpt: "React 공식문서 읽기 스터디(3주차)-리액트 환경 설정"

categories:
  - React

tags:
  - [react, react19, eslint, prettier, typescript, compiler]

permalink: /categories/react/set-up/

toc: true

toc_sticky: true

date: 2025-03-30

last_modified_at: 2025-03-30
---

## 리액트 설정하기

[리액트v19 공식문서-설정하기](https://ko.react.dev/learn/setup)

---

## 1️⃣ 에디터 설정하기

### 에디터 종류

- VS Code
- WebStorm
- Sublime Text
- Vim

### 에디터 기능 - Linting & Formatting

1. 린팅(ESLint)

`eslint-config-react-app`

Create React App 에서 기본적으로 적용하는 ESLint 규칙 모음

React 관련 권장 설정 포함 (eslint-plugin-react, eslint-plugin-react-hooks)

- 꼭 eslint-config-react-app 이 아닌 airbnb, standard, prettier 등의 설정하거나 .eslintrc.json 을 직접 커스텀해서 프로젝트에 맞는 룰을 설정할 수 있다.

`eslint-plugin-react-hooks`

React Hooks의 올바른 사용을 보장하는 ESLint 플러그인으로 **리액트 프로젝트에서 필수적**이다. `useState`, `useEffect`, `useMemo` 와 같은 Hooks를 사용할 때 잘못된 사용 패턴을 감지하고 경고해준다.

- rules-of-hooks
  - Hooks는 반드시 컴포넌트 최상위에서 호출해야한다.
  - 조건문, 반복문, 중첩 함수 내부에서 사용하면 안된다.
- exhaustive-deps
  - useEffect, useCallback, useMemo의 의존성 배열이 올바르게 설정되어있는지 검사

1. **포매팅(Prettier)**

- 저장 시점에 포매팅하기
  설정에서 기본 포매터가 **prettier - code formatter** 로 설정되어있는지 확인
  ⇒ 설정에서 **format on save** 옵션 활성화
- `eslint-config-prettier`
  ESLint 규칙과 Prettier 규칙의 충돌 방지를 위해 ESLint 프리셋의 모든 포매팅 규칙을 비활성화하고 Prettier 규칙을 우선시한다.

---

## 2️⃣ 타입스크립트 사용하기

### 타입스크립트 설치

- 기존 리액트 프로젝트에 타입스크립트 추가하기

```bash
npm install @types/react @types/react-dom
```

<br>

### 타입스크립트 관련 설정

- 컴파일러 옵션 설정

  - dom은 lib에 포함되어야함(기본값, 별도로 지정X)
  - jsx를 유효한 옵션 중 하나로 설정

- React + Vite + Typescript 프로젝트 설정

`tsconfig.json` 기본 설정 및 공통 설정 관리

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`tsconfig.app.json` 리액트 애플리케이션을 위한 구체적인 컴파일러 설정

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 브라우저 환경을 위한 라이브러리 설정
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler", // 번들러(Vite/Webpack 등)와 호환성 강화
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true, // 별도 .js파일을 생성하지 않고 번들러가 트랜스파일 담당
    "jsx": "react-jsx", // React 최신 JSX 변환 방식 사용(React 17+)

    /* Linting */
    "strict": true, // 타입 검사 강화
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json` Node.js 실행 파일을 위한 설정 관리

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"] // Vite 설정 파일은 Node.js 환경에서 실행됨
}
```

> **tsconfig.json + tsconfig.app.json + tsconfig.node.json** 구조의 장점<br>
>
> - 다양한 빌드 환경 지원
>   - tsconfig.app.json → React 클라이언트 코드 전용
>   - tsconfig.node.json → Node.js 관련 코드
> - 공통 설정과 개별 설정 분리 가능
>   - tsconfig.json에서 공통적인 설정을 관리
>   - 각 환경에 맞는 세부 설정 적용
> - 빠른 빌드 및 모노레포 지원
>   - tsconfig.json이 여러 설정을 참조하므로 프로젝트 빌드 속도 최적화
>   - 대규모 프로젝트에서는 tsconfig.app.json과 tsconfig.node.json을 분리해 독립적으로 타입 검사 수행 가능

<br>

### 리액트 컴포넌트에서 타입스크립트 사용하기

- jsx를 포함하는 모든 파일은 `.tsx` 파일 확장자 사용

<br>

#### props

```jsx
interface MyButtonProps {
 title: string;
 disabled: boolean
}

function MyButton({ title, disabled }: MyButtonProps) {
 return (...)
}
```

#### useState

- `@types/react` 타입 정의에 내장 Hooks에 대한 타입이 포함되어 있어 추가 설정 없이 추론된 타입을 얻을 수 있다.

  ```jsx
  // enabled는 'boolean'으로 추론됨
  // setEnabled는 boolean 인수나 boolean을 반환하는 함수를 받도록 추론
  const [enabled, setEnabled] = useState(false);
  ```

- state에 대한 타입을 명시적으로 제공해야할 때 ex)유니언 타입일 때

  ```jsx
  type Status = "loading" | "success" | "error";

  const [status, setStatus] = useState < Status > "idle";
  ```

#### useReducer

- reducer 함수의 타입은 state 초기값에서 추론됨

  ```jsx
  import { useReducer } from 'react'

  interface State {
   count: number
  }

  type CounterAction =
   | { type: 'reset' }
   | { type: 'setCount'; value: State['count'] }

  const initialState = { count: 0 };

  function stateReducer(state: State, action: CounterAction): State {
   switch (action.type) {
    case 'reset':
     return initialState;
    case 'setCount':
     return { ...state, count: action.value };
    default:
     throw new Error('Unknow action');
   }
  }

  export default function App() {
   const [state, dispatch] = useReducer<State>(stateReducer, initialState);
   ...
  }
  ```

> 📌 interface는 객체 타입 정의에 적합
>
> - 객체의 구조를 정의하는데 주로 사용
> - 확장(extends)가능 → 기존 타입을 확장해서 사용 가능
> - 중복 선언 가능(같은 이름의 interface를 여러번 선언하면 병합됨)
>   type은 더 유연하게 사용 가능
> - 객체 뿐 아니라 유니온 타입, 튜플, 기본 타입 등 다양한 형태로 정의 가능
> - 확장이 필요하지 않은 경우 주로 사용

#### useContext

- context에서 제공한 값의 타입은 createContext 호출에서 전달된 값에서 추론됨
- Context는 기본적으로 아무 값도 없기 때문에 `ContextShape | null` 을 명시적으로 설정
- ⇒ Provider없이 useContext() 를 사용하는 오류 방지

  ```jsx
  const UserContext = createContext<{ name: string; age: number } | null>(null);
  ```

#### useMemo

- useMemo를 호출한 결과는 첫번째 매개변수에 있는 함수의 반환값에서 추론됨

  ```jsx
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  ```

#### useCallback

- Strict 모드에서는 useCallback에 매개변수를 위한 타입 추가
- ⇒ 콜백의 타입은 함수의 반환 값에서 추론되고 매개변수 없이는 타입을 완전히 이해할 수 없기 때문

  ```jsx
  const handleChange =
    useCallback <
    React.ChangeEventHandler <
    HTMLInputElement >>
      ((event) => {
        setValue(event.currentTarget.value);
      },
      [setValue]);
  ```

#### DOM 이벤트

#### Children

- `React.ReactNode` : jsx에서 자식으로 전달할 수 있는 모든 가능한 타입의 조합
- `React.ReactElement`: jsx 엘리먼트, 원시값 포함 안함

#### Style Props

- `React.CSSProperties` : 리액트 컴포넌트에 인라인 스타일 정의할 때

---

## 3️⃣ 리액트 컴파일러(React Compiler)

**리액트 컴파일러?** 빌드 타입 전용 도구로 **리액트 앱을 자동으로 최적화**하는 컴파일러. 아직 **베타 단계**이며 리액트 17버전 이상에서 사용할 수 있다.

### 리액트 컴파일러의 역할

- 자바스크립트와 리액트 규칙을 활용해 자동으로 컴포넌트와 Hook 내부의 값을 메모이제이션 ⇒ `useMemo`, `useCallback`, `React.memo` 와 같은 역할을 컴파일러가 알아서 판단하여 해주는 것임
- 리액트 규칙에 위반될 경우 해당 컴포넌트/Hook 은 최적화하지 않고 건너뜀(코드 전체를 최적화X)

### 리액트 컴파일러의 주요 기능

- 리렌더링 최적화
  - 부모 컴포넌트만 변경되었음에도 컴포넌트 트리 내 여러 컴포넌트가 리렌더링 되는 경우
  - ⇒ 상태 변경 시 앱에서 관련된 부분만 리렌더링되도록 자동으로 적용
- 리액트 외부에서 비용이 많이 드는 계산 건너뛰기
  - `주의` **리액트 컴포넌트와 Hook만 메모제이션** 하며, 모든 함수를 메모제이션 하지 않음
  - 리액트 컴파일러의 메모제이션은 여러 컴포넌트와 Hook사이에서 공유되지 않음

### 리액트 컴파일러 설치

- `babel-plugin-react-compiler` `eslint-plugin-react-compiler` 설치

```bash
npm install -D babel-plugin-react-compiler@beta eslint-plugin-react-compiler@beta
```

- ESLint 설정 `eslint.config.js`

에디터에서 리액트 규칙 위반 사항 표시

```jsx
import reactCompiler from "eslint-plugin-react-compiler";

export default [
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
];
```

- Babel 설정(Vite 프로젝트) `vite.config.js`

```jsx
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- 코드베이스에 컴파일러 적용하기

일부 디렉토리에만 컴파일러 실행해보기

```jsx
const ReactCompilerConfig = {
  sources: (filename) => {
    return filename.indexOf("src/path/to/dir") !== -1;
  },
};
```

새로운 프로젝트에 컴파일러 사용하기

- 리액트 v17-18 버전에서 최적화된 코드를 실행하기 위해서는 아래 패키지 추가 설치 필요

```bash
npm install react-compiler-runtime@beta
```

- `babel.config.js` 타겟 버전 명시
  - 리액트 버전에 따라 올바른 API를 적용하고, 필요한 경우 누락된 API를 폴리필한다.

```bash
const ReactCompilerConfig = {
  target: '18' // '17' | '18' | '19'
};

module.exports = function () {
  return {
    plugins: [
      ['babel-plugin-react-compiler', ReactCompilerConfig],
    ],
  };
};
```
