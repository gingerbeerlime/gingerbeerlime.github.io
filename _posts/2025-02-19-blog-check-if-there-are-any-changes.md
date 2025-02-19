---
title: "변경된 내용이 있을 경우, 컨펌창 띄우기"
excerpt: "원본 데이터와 수정된 데이터를 비교하는 간단한 방법"

categories:
  - Error log
tags:
  - [vue, vue3, devlog]

permalink: /categories/blog/check-if-there-are-any-changes/

toc: true
toc_sticky: true

date: 2025-02-19
last_modified_at: 2025-02-19
---

## ✅ 이슈사항

알림 수정 페이지에서 알림 설정 정보를 변경하게 되면, 월 최대 1회 발송되어야하는 월비용 알림이 재설정되면서 새로운 기준으로 다시 발송될 수 있다.<br/>
알림을 수정하는 사람(관리자)과 이메일 수신자는 다를 수 있기 때문에, 수정 버튼을 클릭할 때 미리 컨펌창을 통해 해당 내용을 알리는 것이 필요하다.<br/>
실제로 변경된 내용이 없을 때에도 서버에서는 변경된 데이터 여부에 대한 검증없이 알림을 재설정하기 때문에, 이 케이스에 대한 예외처리가 추가적으로 필요하다.<br/>
<br/>
다른 것보다 유저가 실제로 수정한 내용없이 저장하는 경우 똑같은 내용의 알림이 다시 발송될 수 있다는 점이 애매했는데,
백엔드 개발자님이 요청하신 부분은, 프론트쪽에서 수정사항이 없는 경우에는 api요청을 아예 하지 않는 쪽이었다.
따라서, "월비용 알림 + 변경된 데이터가 있음" => 컨펌창 띄움<br/>"월비용 알림 + 변경된 데이터가 없음 => '저장되었습니다' 토스트 메시지와 함께 알림 목록 페이지로 이동"(실제 api요청은  하지 않음) 으로 구현하려고 한다.

***

### ✅ 해결방안

#### 방법1. Dirty Flag 설정

<U>사용자 폼 입력값 변경 감지</U>
<br/>
- 각각의 데이터에서 값 변화가 일어날 때 원본과 다르면 'isModified' 값을 업데이트한다.

{% raw %}
```vue
    <script setup>
        const isModified = ref(false);

        const isConfirmVisible = ref(false);

        const updateFilter = (arr) => {
            editing.aFilter = [...arr];
            if (original.aFilter.some(oldVal => !arr.some(newVal => newVal === oldVal))) {
                isModified.value = true;
            }
        }

        const checkValidation = async () => {
            const { errors } = await form.value.validate();
            if(!errors.length) {
                if (alarmType.value = 'monthly') {
                    if (isModified.value) {
                        isConfirmVisible.value = true;
                    } else {
                        router.push({ name: 'alarm-view', parmas: { id: props.id } });
                    }
                } else {
                    updateAlarm();
                }
            }
        }

        const updateAlarm = () => {
            // 알림 저장
        }
    </script>
```
{% endraw %}

>
장점
- 실시간으로 변경을 감지하기 때문에 저장 버튼 클릭 후 로딩이 빠르다.
단점
- 한번 수정이 일어나면 isModified가 true로 바뀌어, 최종적으로 다시 원본 내용과 같아지더라도 알 수 있는 방법이 없다.
- 데이터마다 포맷이 다르기 때문에 일일이 비교하는 로직을 넣기가 복잡함.

#### 방법2. 저장버튼 클릭시 원본과 변경된 데이터를 한번에 비교

checkValidation 통과 => 원본/수정본 비교 => 같으면 api요청x, 다르면 컨펌창 띄운 후 api요청(saveAlarm)

{% raw %}
```vue
    <script setup>
        const isModified = ref(false);

        const isConfirmVisible = ref(false);

        const checkIfModified = () => {
            if (JSON.stringify(original) !== JSON.stringify(editing)) {
                isModified.value = true;
            }
            // 또는 값 하나씩 꺼내서 비교
        }

        checkValidation = async () => {
            const { errors } = await form.value.validate();
            if(!errors.length) {
                if (alarmType.value = 'monthly') {
                    await checkIfModified();
                    if (isModified.value) {
                        isConfirmVisible.value = true;
                    } else {
                        router.push({ name: 'alarm-view', parmas: { id: props.id } });
                    }
                } else {
                    updateAlarm();
                }
            }
        }

        const updateAlarm = () => {
            // 알림 저장
        }
    </script>
```
{% endraw %}

>
장점
- 원본과 비교해 변경된 내용이 있는지 정확한 비교가 가능하다.
단점
- 복잡한 필터 설정이 되어있는 알림의 경우 저장버튼을 클릭할때 로딩 속도가 오래걸릴 수 있다.
- JSON.stringify()를 쓰면 간단하게 비교할 수 있지만, 배열의 순서가 보장되지 않는 경우 다르다고 판단할 수 있고, 그렇다고 값 하나씩 비교하면 로직이 복잡해진다.

#### 🌟내가 선택한 방법. 방법1과 2를 섞어서

저장시에 모든 데이터를 한번에 비교하게 되면 로딩이 너무 길어질 것 같아서,<br/>
배열을 속성값으로 가지는 객체 타입의 필터들은 update시 바로 dirty 체크를 하고,<br/>
나머지 단순 string 타입의 데이터와(ex. 알림명, 설정시간), 1차원 배열(ex. 수신자 이메일 리스트) 값은 저장 버튼 클릭시 비교 로직을 타도록 했다.

***

##### 느낀점

정확한 의도를 구현하기 위해서는 저장 시 데이터 값을 일일이 비교하는 방법이 맞는 것 같은데,
변경된 내용이 없이 수정버튼을 누르는 케이스에 대한 예외처리를 하기 위해 이정도의 작업이 굳이 필요한 것인가에 대한 의문이 들었다.
처음 요구사항과 최대한 맞게 구현하려고 했지만 중요도에 비해 코드가 너무 많이 추가된다는 느낌이 들어서
다음에 한다면 해당 처리의 중요도가 높지 않다면 어느정도 타협안을 찾아 간단하게 구현할 것 같다.
