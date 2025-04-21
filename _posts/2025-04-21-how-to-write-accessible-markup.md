---
title: "접근성을 위한 마크업 작성법"

excerpt: "접근성이 좋은 HTML 작성하기: 시맨틱 마크업, 대체 텍스트"

categories:
  - HTML

tags:
  - [html, markup, semantic, page layout, screen reader]

permalink: /categories/html/how-to-write-accessible-markup/

toc: true

toc_sticky: true

date: 2025-04-21

last_modified_at: 2025-04-21
---

## 접근성을 위한 마크업 작성법

[참고 문서-MDN Web Docs] <https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Accessibility/HTML>

---

## 올바른 HTML 요소 사용하기 : `시맨틱 마크업`

```html
<div>Play video</div>
// 버튼에는 button 태그 사용하기
<button>Play video</button>
```

`<button>` 태그는 기본 스타일이 적용되어 있을 뿐 아니라, 키보드 접근성도 내장되어있다.

- `Tab`키를 사용해서 버튼 사이를 이동할 수 있음
- `Space`, `Return`, `Enter` 키를 사용해 버튼을 활성화시킬 수 있음

- 시맨틱 마크업의 장점
  - 쉬운 개발 : 내장된 기능 사용 & 이해하기 쉬움
  - 모바일 환경에서의 이점 : 시맨틱 HTML은 파일 사이즈가 가볍고 반응형으로 만들기 쉽다
  - SEO에 좋음 : 검색엔진은 `<div>`와 같은 태그보다 헤딩, 링크 등 태그 내부 키워드에 더 많은 가중치 부여

---

## 좋은 시맨틱

### (1) 문자 컨텐츠

- `heading(<h1>)`, `paragraph(<p>)`, `list(<ol>, <li>)` 등으로 이루어진 콘텐츠 구조는 **스크린 리더** 사용자에세 좋은 접근성을 지원한다.

```html
<h1>My heading</h1>

<p>This is the first section of my document.</p>

<p>I'll add another paragraph here too.</p>

<ol>
  <li>Here is</li>
  <li>a list for</li>
  <li>you to read</li>
</ol>

<h2>My subheading</h2>

<p>
  This is the first subsection of my document. I'd love people to be able to
  find this content!
</p>

<h2>My 2nd subheading</h2>

<p>
  This is the second subsection of my content, which I think is more interesting
  than the last one.
</p>
```

- **명확한 언어 사용하기** : 스크린리더가 똑바로 읽을 수 없는 언어나 문자의 사용을 지양해야 한다.
  - 가능하다면 대시를 사용하지 말 것. `5-7` 로 쓰는 대신 `5 to 7` 과 같이 작성
  - 약어보단 실제 표현 그대로 쓰기. `Jan` 대신 `January`
  - 두문자어(ex. UN, KTX, AI 등 여러 단어의 앞 글자들만 따서 만든 단어)는 적어도 한 번에서 두 번은 본 표현으로 사용. 설명을 위해 `<abbr>` 태그 사용

<br/>

### (2) 페이지 레이아웃

```html
<header>
  <h1>Header</h1>
</header>

<nav>
  <!-- main navigation in here -->
</nav>

<!-- Here is our page's main content -->
<main>
  <!-- It contains an article -->
  <article>
    <h2>Article heading</h2>

    <!-- article content in here -->
  </article>

  <aside>
    <h2>Related</h2>

    <!-- aside content in here -->
  </aside>
</main>

<!-- And here is our main footer that is used across all the pages of our website -->

<footer>
  <!-- footer content in here -->
</footer>
```

- 페이지 레이아웃을 구성할 때 적절한 섹션 요소들을 사용해야 한다.
- 잘 구성된 레이아웃과 함께 콘텐츠의 내용 또한 논리적인 순서에 따라 배치되면 이해하기 쉬운 페이지가 될 것이다.

<br/>

### (3) UI 컨트롤

**UI 컨트롤이란?** 웹 문서에서 사용자와 상호작용하는 주요 영역들을 의미한다. 일반적으로 `button`, `links`, `form` 컨트롤 요소들을 포함한다.

- 브라우저가 기본적으로 키보드로 조작할 수 있도록 한다.
  - ex) `<select>`요소는 위 아래 방향키를 옵션을 보여주고 순회할 수 있음

```html
<div data-message="This is from the first button" tabindex="0" role="button">
  Click me!
</div>
<div data-message="This is from the second button" tabindex="0" role="button">
  Click me too!
</div>
<div data-message="This is from the third button" tabindex="0" role="button">
  And me!
</div>
```

- `tabIndex`는 탭 키로 접근 가능한 요소들의 탭 선택 순서를 양수로 표현해 정해진 순서 외로 커스텀할 때 사용
  - `tabIndex=”0`” 탭 키로 접근이 불가능한 요소들을 접근이 가능하게 만듦
  - `tabIndex=”-1”` 탭 키로 접근이 불가능한 요소에 프로그래밍적으로 포커스가 잡히도록 함

**의미있는 텍스트 라벨 :** 맥락 밖에서도 이해 가능한 라벨 사용

```html
// [GOOD]좋은 링크 텍스트 예시
<p>
  Whales are really awesome creatures.
  <a href="whales.html">Find out more about whales</a>.
</p>
// [BAD]나쁜 예시
<p>
  Whales are really awesome creatures. To find out more about whales,
  <a href="whales.html">click here</a>.
</p>
```

```html
// [GOOD]좋은 링크 텍스트 예시
<div>
  <label for="name">Fill in your name:</label>
  <input type="text" id="name" name="name" />
</div>
// [BAD]나쁜 예시 Fill in your name: <input type="text" id="name" name="name" />
```

- 사용자에게 인풋과 라벨을 명확하게 연관짓고 입력 영역을 어떻게 채워야 하는지 알려줌

---

## 접근성 있는 데이터 테이블

- 테이블 헤더가 <th> 요소를 통해 정의되어 있어야 함.
- scope 속성을 통해 행을 위한 헤더인지 열을 위한 헤더인지 명시
- <caption>요소와 <table>요소의 summary 속성은 둘 다 테이블의 대체 텍스트로서 비슷한 기능을 함

---

## 대체 텍스트

### (1) `<img>` 요소의 접근성

```html
// [BAD]나쁜 예시
<img src="dinosaur.png" />

// [GOOD]좋은 예시
<img
  src="dinosaur.png"
  alt="A red Tyrannosaurus Rex: A two legged dinosaur standing upright like a human, with small arms, and a large head with lots of sharp teeth."
/>
```

- `alt` 속성 값은 항상 이미지와 이미지가 시각적으로 나타내는 내용에 대한 직접적인 표현을 제공해야 한다.
- 대체 텍스트는 짧고 간결해야 하며 이미지가 전달하는 정보 중 주위 텍스트와 중복되지 않는 모든 정보를 포함해야 한다.
- 단, 이미지가 단순히 장식 요소라면 `alt` 속성에 빈 문자열을 작성하거나 `CSS background(best!)`로 페이지에 포함시키는 편이 좋다.
  - `alt` 속성을 아예 생략해버리면 스크린리더는 img URL 자체를 알려준다
  - `alt` 속성을 빈 문자열로 설정해야 이미지를 인식해도 설명을 시도하지 않는다
  - 또는, `role=”presentation”`설정으로 스크린 리더가 대체 텍스트를 읽지 않도록 할 수 있다.

```html
<img
  src="dinosaur.png"
  alt="A red Tyrannosaurus Rex: A two legged dinosaur standing upright like a human, with small arms, and a large head with lots of sharp teeth."
  title="The Mozilla red dinosaur"
/>
```

- 추가로 맥락 정보를 제공하고 싶다면, 이미지 주변 텍스트나 `title` 속성 내부에 작성한다. `title` 속성은 스크린 리더가 읽을 뿐 아니라 브라우저가 마우스 오버에 `title` 텍스트를 툴팁으로 제공한다.

```html
<img src="dinosaur.png" aria-labelledby="dino-label" />

<p id="dino-label">
  The Mozilla red Tyrannosaurus Rex: A two legged dinosaur standing upright like
  a human, with small arms, and a large head with lots of sharp teeth.
</p>
```

- `alt` 속성을 이용하지 않고도 `aria-labelledby` 속성과 `id`를 연결시켜 대체 텍스트/라벨로 사용할 수 있다.
- 이런 방식은 여러 개의 이미지에 대해 같은 텍스트 라벨을 사용하고 싶을 때 유용하다.

---

## 피규어와 피규어 캡션

HTML에는 `<figure>`와 어떤 종류의 피규어를 그 캡션과 연동하는 `<figcaption>`태그가 있다.

```html
<figure>
  <img
    src="dinosaur.png"
    alt="The Mozilla Tyrannosaurus"
    aria-describedby="dinodescr"
  />
  <figcaption id="dinodescr">
    A red Tyrannosaurus Rex: A two legged dinosaur standing upright like a
    human, with small arms, and a large head with lots of sharp teeth.
  </figcaption>
</figure>
```

---

## 링크 요소

- 링크 텍스트의 색은 배경 색상과 시각적인 차이를 가져야 한다.
- 또, 링크는 링크가 아닌 텍스트와도 시각적인 차이를 가져야 한다.
- 링크 텍스트와 주위 텍스트, 기본 상태, 포커스/활성화 상태 사이에는 각각 적어도 3:1의 대비가 요구된다. 모든 상태 색상 값과 배경 색상 사이에는 4.5:1의 대비가 요구된다

### (1) `onClick` 이벤트

- `<a>`태그와 `<button>` 태그 올바르게 사용하기

```html
// [BAD]나쁜 예시 <a href="#" onclick="doSomething()">Click me</a>
```

- 이런식으로 작성하면 버튼처럼 작동하지만 여러 문제가 생길 수 있음
  - 링크를 새 탭에서 열거나 복사하기 같은 기능 잘못 작동
  - JavaScript가 느리게 로드되거나 꺼져있으면 클릭해도 아무 동작도 일어나지 않음
  - 스크린 리더가 링크로 인식해서 잘못된 정보를 줄 수 있음

⇒ 버튼처럼 동작하는건 `<button>` 사용, 링크 `<a>`는 페이지 이동용으로만 쓰기

- `target=”_blank”` 새 탭이나 창에서 열리는 링크

```html
<a target="_blank" href="https://www.wikipedia.org/"
  >Wikipedia (opens in a new window)</a
>
<a target="_blank" href="2017-annual-report.ppt"
  >2017 Annual Report (PowerPoint)</a
>
```

- 링크가 활성화 되었을 때 어떤 동작이 일어나는지 표시를 포함해야 한다.
