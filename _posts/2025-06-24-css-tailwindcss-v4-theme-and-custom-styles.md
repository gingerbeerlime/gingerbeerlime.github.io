---
title: "Tailwindcss v4 테마 설정, 커스텀 스타일 정의하기"
excerpt: "Tailwindcss @theme, @layer, @variant 지시어 활용하기"

categories:
  - css
tags:
  - [css, tailwindcss]

permalink: /categories/css/tailwindcss-v4-theme-and-custom-styles/

toc: true
toc_sticky: true

date: 2023-06-24
last_modified_at: 2023-06-24
---

> **Tailwind css v4 공통 테마, 스타일 설정**
>
> - @theme, @layer, @variant 개념과 지시어 활용법
> - 리액트에 tailwind css v4 설치법은 해당 포스팅 참고: [React + TS + Vite 프로젝트 세팅하기](https://gingerbeerlime.github.io/categories/react/installation/)

---

# Theme 변수란?

**`@theme` 지시어를 사용하여 정의되는 특별한 css 변수**

이 변수들은 **프로젝트 내에서 어떤 유틸리티 클래스가 생성될지에 영향을 미친다**. 즉, 디자인 시스템의 저수준 디자인 결정인 디자인 토큰을 저장하고, 이 토큰들이 Tailwind의 유틸리티 클래스로 직접 매핑되도록 지시하는 역할을 한다.

```jsx
@import "tailwindcss";
@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

- 테마 변수는 **항상 최상위에 정의**되어야한다.(다른 선택자나 미디어 쿼리에 중첩되어서는 안됨)

- `--color-mint-500`과 같은 테마 변수를 `@theme` 내에 정의하면, 자동으로 `bg-mint-500`, `text-mint-500`, `fill-mint-500`과 같은 유틸리티 클래스가 생성되어 HTML에서 사용할 수 있다.

```jsx
<div class="bg-mint-500">
  <!-- ... -->
</div>
```

```jsx
<div style="background-color: var(--color-mint-500)">
  <!-- ... -->
</div>
```

<aside>

💡Tailwind는 기본적으로 tailwindcss를 가져올 때 --font-_, --color-_, --shadow-\* 등과 같은 기본 테마 변수들을 포함하는 theme.css 파일을 불러온다. 이 덕분에 bg-red-200, font-serif, shadow-sm과 같은 유틸리티 클래스가 별도로 정의하지 않아도 사용 할 수 있다.

</aside>

### **📌 `theme` 변수를 사용하면 일반 css 변수를 `:root`에 정의하는건 필요없을까?**

그렇지 않다. `@theme`과 달리 `:root`에 정의된 css 변수는 Tailwind 유틸리티 클래스를 생성하지 않는다.

따라서, 유틸리티 클래스와 직접 연결되지 않는 변수를 정의할 때 사용할 수 있다.

`@theme`으로 정의된 테마 변수들도 결국 컴파일될 때 `:root`에 일반 css 변수로 생성된다.

---

# 폰트 설정하기

- Tailwind 의 `theme.css` 에 기본적으로 `—font-sans`, `—font-serif`, `—font-mono`가 정의되어있어 사용할 수 있다. 추가할 커스텀 폰트를 `@theme`에 정의하면 유틸리티 클래스로 사용할 수 있다.

```jsx
@import "tailwindcss";
@theme {
  --font-poppins: Poppins, sans-serif;
}
```

```jsx
<h1 class="font-poppins">This headline will use Poppins.</h1>
```

- 공통 폰트 적용하기 `index.css`

```css
@layer base {
  body {
    @apply font-poppins bg-background text-foreground;
  }
}
```

---

# 사용자 정의 스타일

### **`@theme` 지시어 안에 디자인 토큰을 정의해서 사용자 정의 스타일을 추가할 수 있다.**

```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}
```

- 디폴터로 정의된 변수명으로 쓰면 사용자 정의 스타일로 오버라이드 된다.
- 기본 테마를 완전히 오바리이딩하려면 해당 네임스페이스 전체를 initial로 설정한 후 사용자 정의 값을 추가한다. ex) `—color-*: initial;`

### **자유로운 값 사용하기 - 대괄호(`[]`)표기법**

- 특정 요소에만 자유로운 값을 사용하고 싶으면 디자인 토큰으로 따로 정의하지 않고 `[  ]` 안에 자유롭게 값을 넣어 사용할 수 있다.

```html
<div class="bg-[#bada55] text-[22px] before:content-['Festivus']">
  <!-- ... -->
</div>
```

- Tailwind가 기본적으로 제공하지 않는 css 속성을 사용하라 때는 css 속성과 값을 대괄호 안에 직접 입력해 유틸리티 클래스처럼 사용할 수 있다.: `[속성:값]` 형태로 사용

```html
<div class="[mask-type:luminance] hover:[mask-type:alpha]">
  <!-- ... -->
</div>
```

- 반응형 수정자(variant)와 함께 사용해 특정 조건에서만 해당 속성이 적용되도록 할 때도 유용하다.

```html
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
  <!-- ... -->
</div>
```

- `div:nth-child(even)`과 같은 복잡한 선택자 사용도 가능하다.

```html
<ul role="list">
  {#each items as item}
  <li class="lg:[&:nth-child(-n+3)]:hover:underline">{item}</li>
  {/each}
</ul>
```

## 베이스 스타일 적용하기

- 페이지에 공통 스타일(`text color`, `background color`, `font family` 등)을 적용하고 싶을 때 템플릿 `<html>` 혹은 `<body>`에 직접 유틸리티 클래스를 줄 수 있다.

```html
<!DOCTYPE html>
<html lang="en" class="bg-gray-100 font-serif text-gray-900">
  <!-- ... -->
</html>
```

### `@layer base`

- 특정 엘리먼트 요소에 공통 베이스 스타일을 적용하고 싶다면 css 파일에 `base` 레이어에 스타일을 정의하면 된다.

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-noto-sans-kr bg-background text-foreground;
  }
  h1 {
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
  }
}
```

### `@layer components`

- 컴포넌트에 공통 스타일 적용하기 : 예를 들어 ‘`card`’, ‘`btn`’, ‘`badge`’ 와 같은 것들

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--rounded-lg);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-xl);
  }
}
```

- 템플릿 안에서 다른 클래스명이 중복되는 경우 엘리먼트에 직접 선언한 클래스로 오버라이드 된다.

```css
<!-- border-radius가 0이 됨 -->
<div class="card rounded-none">
  <!-- ... -->
</div>
```

- 외부 UI 컴포넌트(리액트, MUI, Shadcn/ui 등) 를 커스텀할 때도 `@layer components`에 정의할 수 있다.

```css
@layer components {
  .select2-dropdown {
    /* ... */
  }
}
```

### @variant 지시어 사용하기

- `@variant` 지시어는 사용자 정의 css 규칙 내에서 Tailwind의 variants(ex. dark, hover, focus 등)를 적용할 수 있게 한다.
- 이를 통해 css 파일에서 작성하는 스타일이 특정 조건(ex. 다크 모드, 마우스 오버 시)에서만 활성화되도록 제어할 수 있다.

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

⬇️ 컴파일된 CSS

```css
.my-element {
  background: white;
  @media (prefers-color-scheme: dark) {
    background: black;
  }
}
```

- `variant`를 동시에 사용해야 하면 중첩해서 사용

```css
.my-element {
  background: white;
  @variant dark {
    @variant hover {
      background: black;
    }
  }
}
```
