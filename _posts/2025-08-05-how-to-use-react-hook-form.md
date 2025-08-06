---
title: "React Hook Form + Zod 사용법: 간단한 회원가입 폼 상태 관리, 유효성 검증"

excerpt: "React Hook Form 기본 사용법, Zod 같이 사용하면 좋은 점, Zod v4에서 달라진 점"

categories:
  - React

tags:
  - [react, react19, jsx, form, react hook form, zod]

permalink: /categories/react/how-to-use-react-hook-form/

toc: true

toc_sticky: true

date: 2025-08-05

last_modified_at: 2025-08-05
---

## React Hook Form 으로 회원가입 폼 만들기

- React Hook Form 설치, 사용법
- Zod 사용의 이점, 사용법
- 회원가입 폼 구현하기

[React Hook Form 공식문서] <https://ko.react.dev/learn/separating-events-from-effects><br/>
[Zod 공식문서] <https://zod.dev/>

---

## React Hook Form

> 리액트에서 폼 상태를 관리하고 검증을 간단하게 할 수 있도록 도와주는 라이브러리<br/>
> ⇒ **리렌더링 최소화 + 간단하게 폼 상태와 유효성 검사 처리**

### React Hook Form을 사용하면 좋은 점

#### (1) 불필요한 리렌더링 줄여 성능이 좋음

기본적으로 `DOM` 상태를 활용하고 필요할 때만 리액트 상태 업데이트, 각 `input`은 독립적으로 동작하므로 다른 필드가 바뀌어도 전체 컴포넌트가 리렌더링되지 않음

#### (2) 간단한 사용법

`useForm`훅을 사용하고 `register`를 `Input`에 연결하면 동작

⇒ `onChange`, `useState` 없이도 폼 데이터 관리 가능

#### (3) 유효성 검사 지원

`HTML5` 기본 `required`, `minLength`, `pattern` 등을 쉽게 적용

`Yup`, `Zod` 와 같은 스키마 기반 라이브러리와도 쉽게 연동 가능

---

### 설치

```bash
pnpm add react-hook-form
```

### 기본 사용법

```jsx
import React from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  email: string;
  password: string;
};

export default function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log(data); // { email: "...", password: "..." }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        placeholder="Email"
        {...register("email", { required: "이메일은 필수입니다" })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        placeholder="Password"
        {...register("password", { minLength: { value: 6, message: "6글자 이상" } })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}

```

- `useForm()` : 폼 상태를 관리하는 훅
- `register(”name”, options)` : `input`을 `react-hook-form`에 등록 + 유효성 검증 옵션 설정
  - `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` 규칙 지원
- `handleSubmit(onSubmit)` : 제출 시 검증 후 `onSubmit` 실행
- `errors`: 유효성 검사 실패 시 에러 메시지 확인 가능

---

### 커스텀 컴포넌트와 사용하기

**(1) 내부에서 `register` 호출**

```jsx
// 커스텀 컴포넌트에서 register 바로 호출
const Select = ({ label, register }) => (
  <select {...register(label)}>
    <option value="20">20</option>
    <option value="30">30</option>
  </select>
);

// props로 register 함수 전달
<Select label="Age" register={register} />;
```

- 코드가 간단하고 `forwardRef` 불필요
- 커스텀 컴포넌트가 RHF에 종속되고 다른 폼 라이브러리에서 재사용 어려움

**(2) 외부에서 `register(”name”)`호출 후 반환값을 `props`로 전달**

```jsx
const Select = React.forwardRef(({ onChange, onBlur, name }, ref) => (
  <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
    <option value="20">20</option>
    <option value="30">30</option>
  </select>
));

<Select {...register("Age")} />;
```

- RHF과 분리 → 재사용성 높음
- `forwardRef`로 전달해야 함(react v19부터는 일반 `props` 처럼 넘겨도 무방)

---

### 외부 UI 라이브러리(제어 컴포넌트)와 사용하기

#### (1) Uncontrolled Input vs Controlled Input

- **Uncontrolled Input (비제어 컴포넌트)**
  - `<input>` 자체가 값을 관리 → `useState` 안 써도 됨
  - `RHF`가 권장하는 방식 → `register`만으로 관리 가능
  - ex) 기본 HTML `input`, `textarea`, `select`
- **Controlled Input (제어 컴포넌트)**
  - 리액트 `state`로만 관리되는 컴포넌트
  - ex) `MUI TextField`, `React-Select`, `Switch`, `Checkbox`

#### (2) Controller 사용해 외부 UI 라이브러리와 연결하기

`Controller`는 외부 제어(Controlled) 컴포넌트를 RHF와 연결하는 도우미

```jsx
<Controller
  name="checkbox" // 필드 이름
  control={control} // useForm()에서 꺼낸 control 객체
  rules={{ required: true }} // 유효성 검증
  render={({ field }) => <Checkbox {...field} />}
/>
```

- `Controller`가 이 필드를 `RHF`에 등록하고
- `render` 안에서 `field`를 외부 컴포넌트에 전달
- `field` 안에는 `RHF`가 관리하는 값과 이벤트가 들어있음
  ```javascript
  {
    value: boolean,
    onChange: (e) => void,
    onBlur: (e) => void,
    ref: React.Ref
  }
  ```
- `<Checkbox {…field} />` 처럼 전달하면 `RHF`가 `value`, `onChange` 등 상태들을 자동 관리

---

## 스키마 기반 라이브러리와 사용하기 - Zod

### Zod

> JS/TS용 데이터 스키마 선언 및 검증 라이브러리,<br/>
> 이 데이터는 이런 구조, 이런 타입이어야 한다고 선언하고, 실제 데이터가 그 규칙에 맞는지 검사해주는 도구

### 기본 사용법

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email(), // 이메일 형식
  password: z.string().min(8), // 최소 8자 이상
  age: z.number().int().positive(), // 양의 정수
});

// 데이터 검증
schema.parse({
  email: "zod@schema.com",
  password: "zodpassword",
  age: 12,
}); // 문제 없으면 통과, 아니면 에러 발생
```

- 데이터마다 타입, 규칙을 선언
- 런타임 검증과 타입 안정성 제공

### React Hook Form에 Zod를 같이 쓰면 좋은 점

#### (1) RHF 만 사용했을 때 한계

- **교차 필드 검증** : `RHF`만 쓰면 `watch`나 `getValues`를 이용해 커스텀 검증을 직접 작성해야 한다
  - ex) `password`와 `confirmPassword`의 일치 여부
- **복잡한 조건부/배열/객체 검증** : `RHF`의 `register` 옵션은 주로 개별 필드 단위 검증만 가능하기 때문에 커스텀 `validate`를 직접 작성해야 한다
- **타입 안정성** : `RHF`만 쓰면 런타임 검증과 타입스크립트 타입을 별도로 관리해야 한다

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <input
    {...register("email", {
      required: "이메일은 필수입니다",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 패턴 직접 작성
        message: "이메일 형식이 아닙니다",
      },
    })}
  />
  {errors.email && <p>{errors.email.message}</p>}
</form>;
```

#### (2) Zod를 함께 사용하면 좋은점

- `RHF`의 `resolver` 옵션을 사용해 `Zod`의 검증 스키마와 쉽게 연결할 수 있다
- **검증 로직 재사용** : `loginSchema`, `registerSchema` 처럼 스키마로 관리하면 검증 로직과 타입 정의를 한 곳에 관리할 수 있어 재사용성이 높다
- **복잡한 검증 쉽게 표현** : 교차 필드, 조건부 필드, 배열/객체 구조 검증도 간단히 작성 가능하다
- **타입스크립트와 완벽 연동** : `z.infer<typeof schema>` 로 폼 데이터 타입을 자동 생성
  - 런타입 검증 + 타입 검증 일치 -> 타입 안정성 좋음
- **깔끔한 코드** : JSX 안에서 긴 정규식, 조건식이 사라지고, 검증은 스키마로 관리
- **자동 에러처리** : `Zod`는 입력값 검증 결과를 자동으로 `formState.errors`에 반영해준다.

```tsx
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("유효한 이메일을 입력하세요"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
```

> 💡 zod v4부터는 이메일 검증 스키마를 `z.string().email()` 이 아니라 `z.email()`로 작성

**(+참고) 그외 zod v4부터 지원되는 새로운 Top-level 포맷들**

- **이메일**: `z.email()`
- **UUID**: `z.uuidv4()`, `z.uuidv7()`, `z.uuidv8()`
- **IP 주소**: `z.ipv4()`, `z.ipv6()`
- **CIDR 블록**: `z.cidrv4()`, `z.cidrv6()`
- **URL**: `z.url()`
- **전화번호(E.164)**: `z.e164()`
- **Base64**: `z.base64()`, `z.base64url()`
- **JWT**: `z.jwt()`
- **소문자 문자열**: `z.lowercase()`
- **ISO 표준 날짜/시간**:
  - `z.iso.date()`
  - `z.iso.datetime()`
  - `z.iso.duration()`
  - `z.iso.time()`

---

### 간단한 회원가입 폼 구현하기

> 📌 react v19, react-hook-form v7, zod v4, typescript v5 환경

- `RegisterPage.tsx`

```tsx
import { Link } from "react-router-dom";
import { Button, Input, Card } from "@/shared/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "../model/validationSchema";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600">
            새로운 계정을 만들어보세요
          </p>
        </div>

        <Card variant="default" className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="이메일 주소"
              placeholder="이메일을 입력해주세요"
              {...register("email")}
              state={errors.email ? "error" : undefined}
              errorMessage={errors.email?.message}
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              {...register("password")}
              state={errors.password ? "error" : undefined}
              errorMessage={errors.password?.message}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해주세요"
              {...register("confirmPassword")}
              state={errors.confirmPassword ? "error" : undefined}
              errorMessage={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              회원가입
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              이미 계정이 있으신가요? 로그인하기
            </Link>
            <br />
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- 스키마 정의 `validationSchema.ts`

```tsx
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email({ message: "유효한 이메일을 입력하세요" }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
```

- 커스텀 인풋 컴포넌트 `Input.tsx`

```tsx
import React from "react";
import clsx from "clsx";
import { type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { inputVariants } from "./input.style";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  errorMessage?: string;
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  state,
  size,
  errorMessage,
  label,
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={twMerge(clsx(inputVariants({ state, size }), className))}
        {...props}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};
```

<div>
  <img src="/assets/images/posts_img/react-how-to-use-react-hook-form/rhf-example(1).png" width="400" style="display: inline-block" />
  <img src="/assets/images/posts_img/react-how-to-use-react-hook-form/rhf-example(2).png" width="400" style="display: inline-block" />
  <img src="/assets/images/posts_img/react-how-to-use-react-hook-form/rhf-example(3).png" width="400" style="display: inline-block" />
</div>
