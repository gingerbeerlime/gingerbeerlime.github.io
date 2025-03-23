---
title: "React 설치하기: React + Vite + Typescript 프로젝트 셋업"

excerpt: "React 공식문서 읽기 스터디(2주차)-설치하기"

categories:
  - React

tags:
  - [react, react19, react component, jsx]

permalink: /categories/react/installation/

toc: true

toc_sticky: true

date: 2025-03-23

last_modified_at: 2025-03-23
---

## 설치하기

[리액트v19 공식문서-설치하기](https://ko.react.dev/learn/installation)

---

### 1️⃣ 프로젝트 성격에 맞는 프레임워크 선택하기

`Next.js`

- 서버 사이드 렌더링(SSR) 또는 정적 사이트 생성(SSG)이 필요한 경우
- 장점
  - SSR, SSG, ISR(증분 정적 생성) 지원 → 성능 최적화
  - 내장 API 라우트 기능 → 백엔드 없이 간단한 API 작성 가능
  - App Router(서버 컴포넌트) 지원 → 최신 React 기능 활용 가능

`Vite + React`

- 클라이언트 사이드 렌더링(CSR)이 필요한 경우
- 장점
  - CRA보다 훨씬 빠른 개발 서버 및 빌드 속도
  - 최신 ES모듈을 활용한 빠른 HMR(핫 모듈 교체)

`Remix`

- 데이터 중심의 애플리케이션 (풀스택 프레임워크) => Remix
- 장점
  - 표준 웹 API 활용 (React Router 기반)
  - 서버와 클라이언트 간의 데이터를 최적화하여 빠른 인터랙션 제공
  - SEO 및 접근성이 뛰어난 SSR 지원

`Gatsby`

- 정적 웹사이트 생성(SSG)/블로그 & 마케팅 페이지 => Gatsby
- 장점
  - GraphQL 기반 데이터 핸들링 지원
  - 정적 파일을 미리 생성하여 매우 빠른 페이지 로딩
  - 다양한 플러그인을 활용한 유연한 확장성

`Electron + React`

- Electron 기반의 데스크톱 앱 개발
- 장점
  - 웹 기술로 데스크톱 앱 개발 가능
  - 윈도우, 맥, 리눅스 크로스 플랫폼 지원

---

### 2️⃣ 프로젝트 세팅

<aside>
📌

**react + vite + typescript 프로젝트 셋업하기**

- - 스타일 & ui 관련 tailwind css + shadcn/ui
- - eslint & prettier 설정
  </aside>

🙇‍♀️ 참고

[https://velog.io/@odada/React-Vite-TypeScript-Tailwind-shadcnui-프로젝트-셋업-가이드](https://velog.io/@odada/React-Vite-TypeScript-Tailwind-shadcnui-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%85%8B%EC%97%85-%EA%B0%80%EC%9D%B4%EB%93%9C)

https://ui.shadcn.com/docs/installation/vite

https://shawnkim.tistory.com/132

#### (1) React + Vite 프로젝트 생성

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

![image.png](../assets/images/posts_img/attachment/react-vite-project-init.png)

<br>

#### (2) tailwind CSS 설치 및 설정(에러 해결)

- 에러 발생 + 해결
  ⚠️ 2025/01/22 tailwindcss가 최신 버전이 4버전 방식으로 바뀌어 현재 이 방식은 에러 발생

  ```bash
  npm install -D tailwindcss postcss autoprefixer
  ```

  `-D` 는 `—save-dev`의 줄임말로 개발 의존성(`devDependencies`)으로 패키지를 설치하는 옵션
  ⇒ 배포할 때는 필요하지 않고 개발 환경에서만 필요한 패키지 설치할 때 사용

  1. `tailwindcss`
     1. Tailwind CSS 프레임워크 핵심 패키지
     2. 유틸리티 클래스 기반으로 빠르게 UI를 스타일링할 수 있게 해줌
  2. `postcss`
     1. CSS를 변환하고 최적화하는 도구
     2. Tailwind CSS는 postcss를 사용하여 CSS를 컴파일하고 처리함
  3. `autoprefixer`

     1. CSS 속성에 자동으로 공급업체 접두사를 추가하는 PostCSS 플러그인
     2. 브라우저 호환성을 자동으로 맞춰줌

     ```css
     display: flex;
     /* autoprefixer 적용 후 */
     display: -webkit-box;
     display: -ms-flexbox;
     display: flex;
     ```

  ```json
  npx tailwindcss init -p
  ```

  ⇒ tailwindcss 설치 후 **Tailwind 설정 파일**(tailwind.config.js, postcss.config.js)을 생성하는 명령어

  ```bash
  ➜  my-app npx tailwindcss init -p
  npm ERR! could not determine executable to run
  ```

  ❗️tailwind 설정 파일 생성 명령에서 에러 발생
  ⇒ 이유 3버전에서 4버전으로 업그레이드 되면서 ./nodemodules/.bin에 tailwindcss 파일이 없어짐
  🔅해결1) 3버전으로 명시해서 설치

  ```bash
  npm install -D tailwindcss@3 postcss autoprefixer
  npx tailwindcss init -p
  ```

  🔅해결2) 최신 4버전으로 설치

  - 4버전 설치 방식 https://tailwindcss.com/docs/installation/using-vite

`tailwindcss v4.0 설치`

```bash
npm install tailwindcss @tailwindcss/vite
```

`src/index.css`

```css
@import "tailwindcss";
```

`tsconfig.json` `tsconfig.app.json` baseUrl, paths 속성 추가

```json
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
```

올바른 경로 설정을 위해 vite.config.ts 업데이트

```bash
npm install -D @types/node
```

`vite.config.ts`

```bash
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

✅ 3버전에서는 tailwind.config.js 파일에서 테마 설정을 정의했는데 4버전에는 별도의 설정 파일 없이css파일에서 @theme 블록으로 사용한다.

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* 추가적인 설정... */
}
```

<br>

#### (3) shadcn/ui 설치 및 설정

`tailwindcss v4용`

```bash
npx shadcn@latest init
```

**npm과 npx 차이?**

- npm(Node Package Manager)
  - 주로 패키지를 설치하고 관리하는 데 사용됨
  - package.json에 패키지를 추가하고, 의존성을 관리하는 역할
- npx(Node Package eXecute)

  - 패키지를 설치하지 않고 즉시 실행하는 용도로 사용됨
  - 한번만 실행할 패키지에 사용하거나 특정 버전의 패키지를 실행할 때

- 컴포넌트 설치하기 - (테스트)버튼 컴포넌트

```bash
npx shadcn@latest add button
```

⇒ @/components/ui 폴더에 저장됨

![image.png](../assets/images/posts_img/attachment/react-installation-shadcn-test.png)

<br>

#### **(4) ESLint + Prettier 설정**

`참고` https://shawnkim.tistory.com/132

**ESLint?** 코드의 품질을 검사해주는 도구

**Prettier?** 설정한 규칙에 맞게 코드를 포맷팅 해주는 도구

- prettier 설치

```bash
npm install --save-dev --save-exact prettier
```

Vite의 경우 설치될 때 ESLint도 같이 포함돼서 설치되기 때문에 따로 설치할 필요 없음, Prettier는 따로 설치해야한다.

- `eslint-config-prettier` 설치

```bash
npm install --save-dev eslint-config-prettier
```

- ESLint에서 Prettier와 충돌할 수 있는 규칙을 무시함으로써 포맷팅할 때 Prettier의 규칙이 우선시 하도록함.
- Prettier가 ESLint처럼 오류를 출력해 주는 하게 하고 싶으면 `eslint-puglin-prettier` 라이브러리를 같이 사용할 수 있다.

  ```bash
  npm install --save-dev eslint-plugin-prettier
  ```

- 프로젝트 루트에 `.prettierrc` 파일 생성 및 규칙 추가

```json
{
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "printWidth": 100
}
```

- `eslint.config.js` prettier 플러그인 활성화

```jsx
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      "plugin:prettier/recommended", // Prettier 설정 추가
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier, // Prettier 플러그인 추가
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "prettier/prettier": "warn", // Prettier 룰 적용
    },
  }
);
```
