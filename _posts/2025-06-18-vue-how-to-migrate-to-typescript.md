---
title: "Vue3에 TypeScript 적용하기(모노레포 구조 & npm 라이브러리 배포용)"
excerpt: "Vue3 라이브러리에 점진적으로 TypeScript 적용하기"

categories:
  - Vue
tags:
  - [vue, vue3, TypeScript, npm, composition api]

permalink: /categories/vue3/how-to-migrate-to-typescript/

toc: true
toc_sticky: true

date: 2025-06-18
last_modified_at: 2025-06-18
---

> 📌 Vue3 프로젝트에 TypeScript 점진적으로 적용하기
>
> - Vue3 + Composition API(setup)
> - 루트 패키지(vue-pivottable) 와 두 개의 서브 패키지(lazy-table-renderer, plotly-renderer)인 모노레포 구조로 되어있으며 각 패키지는 독립적으로 npm에 배포된다.

---

## 1️⃣ 타입 스크립트 설치

### 루트 패키지(`vue-pivottable`)에 타입스크립트 설치

- `-w` : `—workspace-root`

```bash
pnpm add --save-dev typescript @vue/tsconfig vue-tsc -w
```

<br/>

### 서브 패키지(`plotly-renderer`, `lazy-table-renderer`)에 타입스크립트 설치

- 루트에서만 설치해도 타입스크립트를 공유해서 사용할 수 있으나, 각 패키지가 독립적으로 빌드하고 배포되는 라이브러리이기 때문에 개별 설치한다.

```bash
pnpm add -D typescript vue-tsc @vue/tsconfig --filter @vue-pivottable/plotly-renderer
pnpm add -D typescript vue-tsc @vue/tsconfig --filter @vue-pivottable/lazy-table-renderer
```

---

## 2️⃣ 타입 스크립트 설정 파일 만들기

### tsconfig.json 파일 생성

```bash
npx tsc --init
```

### tsconfig.json 수정

`vue-pivottable`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": false,
    "strictNullChecks": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Vue specific */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"],
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

- `"moduleResolution": "node"` : npm 배포용 라이브러리는 node로 설정
- **점진적 마이그레이션**을 위해 `"strict: false"` 로 세팅하고 필요한 규칙만 개별적으로 true로 설정했다.

> 📌 점진적으로 ts를 적용할 때 세팅해두기 좋은 세팅

- `"noImplicitAny": false` : 타입이 정의되어있지 않으면 암묵적으로 `any` 타입으로 추론
- `“allowJs”: true`: 타입스크립트 프로젝트에서 자바스크립트 파일도 함께 사용
- `“checkJs”: false`: js파일을 타입 검사하지 않음

<br/>

> 💡 `"strict": true` 를 했을 때 자동으로 `true`로 설정되는 옵션들

| 옵션명                             | 설명                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **`strictNullChecks`**             | `null`과 `undefined`를 모든 타입에 포함하지 않음. (null, undefined도 하나의 타입으로 간주한다는 의미), 명시적으로 처리해야 함. |
| **`strictFunctionTypes`**          | 함수 타입 간의 비교를 더 엄격하게 수행.                                                                                        |
| **`strictBindCallApply`**          | `.bind`, `.call`, `.apply`의 인자 타입 검사를 더 엄격하게 수행.                                                                |
| **`strictPropertyInitialization`** | 클래스의 필드가 생성자에서 반드시 초기화되었는지 검사.                                                                         |
| **`noImplicitAny`**                | 타입이 명시되지 않고 추론될 경우 `any` 타입을 허용하지 않음.                                                                   |
| **`noImplicitThis`**               | `this`의 타입이 암시적으로 `any`가 되는 것을 금지.                                                                             |
| **`alwaysStrict`**                 | JS로 출력되는 파일에 `"use strict"`를 자동으로 추가함.                                                                         |

<br/>

`plotly-renderer`, `lazy-table-renderer`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "vue-pivottable": ["../../src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- 서브 패키지에서는 루트패키지의 `tsconfig` 설정을 `extends`로 확장해서 사용하는 방식으로 구성한다.
- `"noEmit": false` → 타입 검사 후 `.js`와 `.d.ts` 모두 생성
- ⚠️ 여기서는 `"noEmit": true` 로 설정했는데 `vite.config.ts`에서 `vite-plugin-dts` 플러그인을 사용하고 있기 때문에 `vite` 플러그인이 타입 정의 파일을 생성한다.

---

## 3️⃣ 타입 정의 패키지 설치

```bash
pnpm add -D @types/node -w
```

- `vite.config.ts` 에서 `__dirname`, `process.env`, `path`, `fs` 같은 **Node.js 전역 객체**를 사용하는 경우 설치

```bash
pnpm add -D @types/papaparse -w
```

- `papaparse`라는 javascript 라이브러리를 사용하고 있어서 ts 패키지를 따로 설치함

---

## 4️⃣ Vite 설정 업데이트

`vue-pivottable` : `vite.config.js` → `vite.config.ts`

```json
// 🔧 파일 확장자 변경: .js → .ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// ✅ Vite 타입 인식 가능하도록 TypeScript 구성
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/vue-pivottable.css',
          dest: '.'
        }
      ]
    }),
    dts({
      // 🔧 더 간결한 경로 지정 및 출력 디렉토리 변경
      include: ['src'], // 기존: ['src/**/*.{js,ts,vue,d.ts}']
      outDir: 'dist/types', // 기존: 'dist'
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      // 🔧 진입점 파일 확장자 변경: index.js → index.ts
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VuePivottable',
      fileName: (format) => `vue-pivottable.${format}.js`,
      formats: ['es', 'umd'] // ✅ 명시적으로 추가
    },
    rollupOptions: {
      external: ['vue', 'vue-draggable-next', 'papaparse'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-draggable-next': 'VueDraggableNext',
          papaparse: 'Papa'
        }
      }
    },
    sourcemap: true,
    target: 'es2015'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

`plotly-renderer`, `lazy-table-renderer` : `vite.config.js` → `vite.config.ts`

```bash
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      dts({
        include: ['src'],
        outDir: 'dist/types',
        staticImport: false,
        insertTypesEntry: true,
        rollupTypes: true
      })
    ],
    publicDir: false,
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'PlotlyRenderer',
        fileName: (format) => `plotly-renderer.${format}.js`,
        formats: ['es', 'umd']
      },
      ...
    },
    resolve: {
      alias: {
        'vue-pivottable': resolve(__dirname, '../../src'),
        'vue-plotly': resolve(__dirname, 'node_modules/vue-plotly')
      }
    }
  }
})
```

---

## 5️⃣ TypeScript 린트 설정하기

### 타입스크립트 린트 패키지 설치

```bash
pnpm add -D eslint @eslint/js typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript-eslint
```

- `@eslint/js`: Flat config용 ESLint 기본 룰셋
- `typescript`: 타입스크립트
- `@typescript-eslint/parser`/`eslint-plugin`: TypeScript 코드를 ESLint가 이해할 수 있도록 파싱해주는 parser
- `@typescript-eslint`: Flat config 전용 preset을 불러오기 위해 필요

<br/>

### ESLint 설정 파일 생성

`eslint.config.js`

```javascript
{
  ...
  files: ['**/*.{js,mjs,cjs,vue,ts}', 'eslint.config.js'], // ts 확장자 추가
  extends: [
    ...standardjs.configs.base,
    ...tseslint.configs.recommended, // tseslint config 추가
    ...pluginVue.configs['flat/strongly-recommended']
  ],
}
```

--

## 6️⃣ 테스트 및 빌드

### ts 린트 테스트

```bash
pnpm exec eslint . --ext .ts,.vue
```

<br/>

`package.json`

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts,.vue"
  }
}
```

```bash
pnpm lint
```

### 라이브러리 빌드

```bash
pnpm build
```

- `dist/types/index.d.ts` 파일 생성되는지 확인
