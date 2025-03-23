---
title: "React 사고하기: 필터링 테이블 구현"

excerpt: "React 공식문서 읽기 스터디(2주차)-리액트로 사고하기"

categories:
  - React

tags:
  - [react, react19, react component, jsx]

permalink: /categories/react/thinking-in-react/

toc: true

toc_sticky: true

date: 2025-03-23

last_modified_at: 2025-03-23
---

## 리액트로 사고하기

간단한 필터링 테이블 구현하기

- 리액트 컴포넌트 쪼개기
- 정적 UI 구현
- State 선언하기
- State 업데이트하기

[리액트v19 공식문서-리액트로 사고하기](https://ko.react.dev/learn/thinking-in-react)

---

### 1️⃣ UI를 컴포넌트 계층으로 쪼개기

- **단일 책임 원칙**을 고려해서 나누기(모든 클래스는 **단 하나의 책임**만 가져야 한다)
  - 컴포넌트가 한 가지 작업만을 수행하도록 컴포넌트를 분리
  - 너무 많은 작업을 수행하는 컴포넌트는 더 작은 컴포넌트로 나눔
  - 주요 컴포넌트 기능과 관련 없는 코드를 별도의 유틸리티 함수로 추출
  - 관련 있는 기능들을 커스텀 Hook으로 캡슐화
- 컴포넌트를 나누고 계층 구조로 정리해보기

🥑 냉장고 재료 관리 테이블

<img src="/assets/images/posts_img/react-thinking-in-react/thinking-in-react-component-tree.png" width="300"/>

```bash
FilterableStockList
└── SearchBar // 검색, 필터링 기능
└── StockList // 필터링된 재료 리스트가 보여지는 뷰
    └── ItemTable // 카테고리별(음료, 야채, 단백질 등) 테이블
    └── ItemRow // 아이템 별 Row 컴포넌트
```

<br>

### 2️⃣ React로 정적인 버전 구현하기

- 기능을 추가하지 않고 데이터 모델로부터 UI를 렌더링하는 정적인 버전 구현
  - props를 이용해 데이터를 넘겨주는 컴포넌트 구현
  - 단방향 데이터 흐름
  - 컴포넌트를 명확히 분리하고 리스트 렌더링같은 경우 간결하고 명확하게 코드를 짜는 것 연습 필요함
- 각 컴포넌트에서 필요한 데이터 생각해보기

```bash
FilterableStockList // 전체 재료 목록
└── SearchBar // 검색 입력값, 체크 여부
└── StockList // 필터링된 재료 목록
    └── ItemTable // 필터링된 재료 목록 + 그룹화 대상 카테고리
    └── ItemRow // 재료 이름, 재고
```

<br>

### 3️⃣ 최소한의 데이터만 이용해서 완벽하기 ui state 표현하기

- 리액트는 state를 통해 사용자가 데이터를 변경할 수 있다.
- state는 앱이 기억해야 하는, 변경할 수 있는 데이터의 최소 집합
- state를 구조화하는데 가장 중요한 원칙은 **중복배제원칙**!
- 애플리케이션이 필요로 하는 가장 최소한의 state를 파악하고 나머지 모든 것들은 필요에 따라 실시간으로 계산하기
  - 시간이 지나도 변하지 않는지?
  - 부모로부터 props를 통해 전달되는지?
  - 컴포넌트 내 다른 state나 props를 가지고 계산할 수 있는 값인지?

```
FilterText(검색 입력값), InStockOnly(체크여부)
=> 사용자가 변경할 수 있는 데이터, 다른 값을 이용해서 계산할 수 없음
=> State로 관리

filteredItems(필터링된 리스트)
=> 전체 리스트를 FilterText와 InStockOnly를 이용해 계산할 수 있는 값
=> State 아님
```

> 📖**Props vs State**<br/><br/>
> 리액트는 props와 state라는 두 개의 데이터 ‘모델’이 존재한다.<br>
> props는 함수를 통해 전달되는 인자 같은 성격을 가진다.<br>
> state는 컴포넌트의 메모리 같은 성격을 가진다.<br>

<br>

### 4️⃣ State가 어디에 있어야 할 지 정하기

✔리액트는 항상 컴포넌트 계층 구조를 따라 부모에서 자식으로 데이터를 전달하는 단방향 데이터 흐름을 사용한다.

1. state값을 사용하는 컴포넌트 모두 찾기 ⇒ `SearchBar` `StockList`
2. 대상 컴포넌트의 공통 부모 찾기 ⇒ `FilterableStockList`
3. 공통 부모 컴포넌트에서 해당 state를 소유하고 관리하며 props로 자식 컴포넌트에 전달

<br>

### 5️⃣ 역 데이터 흐름 추가하기

자식 컴포넌트에서 이벤트(ex. 사용자 입력)에 따라 state를 변경하려면 반대 방향의 데이터 흐름을 만들어야 한다. ⇒ state값을 관리하는 부모 컴포넌트로 부터 setState함수를 전달받아 이벤트 핸들러에 연결한다.

- state 값을 업데이트하는 `onFilterTextChange`, `onInStockOnlyChange` 함수를 `SearchBar` 컴포넌트 에 props로 전달

`FilterableStockList.tsx`

```jsx
function App() {
  const fridgeItems: Inventory[] = [...FRIDGE_ITEMS];
  const [filterText, setFilterText] = useState < string > "";
  const [inStockOnly, setInStockOnly] = useState < boolean > false;

  return (
    <div className="flex flex-col items-center min-h-svh">
      <div className="w-100 mt-20">
        <SearchBar
          filterText={filterText}
          inStockOnly={inStockOnly}
          onFilterTextChange={setFilterText}
          onInStockOnlyChange={setInStockOnly}
        />
        <div>
          <StockList
            fridgeItems={fridgeItems}
            filterText={filterText}
            inStockOnly={inStockOnly}
          />
        </div>
      </div>
    </div>
  );
}
```

`SearchBar.tsx`

```jsx
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface SearchBarProps {
  filterText: string
  inStockOnly: boolean
  onFilterTextChange: (text: string) => void
  onInStockOnlyChange: (checked: boolean) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange,
}) => {
  return (
    <div>
      <Input
        type='text'
        placeholder='재료를 검색하세요'
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
      <div className='mt-2'>
        <Checkbox
          id='showOnlyAvailable'
          checked={inStockOnly}
          onCheckedChange={(checked) => onInStockOnlyChange(!!checked)}
        />
        <label htmlFor='showOnlyAvailable' className='text-sm font-medium ml-1'>
          재고가 있는 것만 보기
        </label>
      </div>
    </div>
  )
}

export default SearchBar
```

<img src="/assets/images/posts_img/react-thinking-in-react/thinking-in-react-stock-only.png" width="300"/>
<img src="/assets/images/posts_img/react-thinking-in-react/thinking-in-react-search.png" width="300"/>
