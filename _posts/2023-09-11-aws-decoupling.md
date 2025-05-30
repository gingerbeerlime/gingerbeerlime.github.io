---
title: "SQS, SNS, Kinesis"
excerpt: "AWS-SAA C03 스터디:: 디커플링(Decoupling)애플리케이션"

categories:
  - AWS
tags:
  - [aws, aws saa-c03, decoupling, sqs, sns, kinesis]

permalink: /categories/aws/decoupling-application/

toc: true
toc_sticky: true

date: 2023-09-11
last_modified_at: 2023-09-11
---

## 디커플링(Decoupling) 애플리케이션?

서비스의 트래픽 급증으로 인한 처리 과부하문제를 해결하기 위해<br>
서비스는 최대한 디커플링 = 분리시켜 처리의 흐름을 관리하는 것이 좋다<br>
>
**생산자** : 메세지를 생성하는 주체 = 메세지를 대기열에 등록시키는 주체<br>
**소비자** : 메세지를 수신하여 처리하는 주체 = 메세지를 폴링하는 주체<br>
**미들웨어(ex. SQS, SNS, Kinesis)** : 생산자와 소비자를 연결하는 역할

***

### ✅ SQS

<U>Message Queue=메세지 대기열</U>

#### 1. SQS의 특징

- 메세지 수 및 처리량이 무제한
- 메세지 보관기간은 **기본 4일** : 1분에서 ~ 14일 선택
- 소비자가 메세지를 폴링해 처리하면 대기열에 등록된 메세지를 삭제시킨다.
- 낮은 메세지 용량 최대 256KB


#### 2. 메세지 가시성 시간 초과

- 메세지가 폴링되는 시간(처리되는 시간)동안 다른 소비자들은 해당 메세지를 폴링할 수 없다. 대기열에서 해당 메세지를 보이지않는 상태이기 때문이다.
- 메세지가 처리되고 그 메세지 삭제되지 않으면 이제 같은 소비자, 다른 소비자들이 해당 메세지를 수신할 수 있다.
- 적절한 메세지 가시성 시간을 정하는 것이 중요하다.


#### 3. 롱 폴링

- 소비자가 대기열에 메세지를 요청할 때, 대기열에 메세지가 없다면 일단 대기하도록 할 수 있다.
- 비어있는 대기열에 메세지가 등록되면 롱폴링 중인 수신자에게로 바로 전송이된다.
- 롱 폴링을 하는 목적
  - 지연시간 감소
  - API 호출 횟수 감소
- 롱폴링 구성
  - 1초 ~ 20초 설정
  - WaitTimeSeconds


#### 4. FIFO 대기열

- 대기열 메세지 처리 순서 보장


#### 5. SQS + ASG(오토 스케일링 그룹)

- 작동 흐름
  - SQS Queue 에 많은 메세지가 대기중인 상태
  - **CloudWatch Metric - Queue Length** : 클라우드 와치가 대기열 길이를 감지해 ClouWatch Alarm으로 경보를 보냄
  - Cloud Watch는 SQS Queue의 지연이 EC2수의 부족이라고 판단하고 ASG를 이용해 EC2 수를 증가시켜 SQS 대기열에 지연된 메세지를 빠르게 처리함

- 시나리오(서비스 활용 예시)
  - 애플리케이션 => 데이터베이스(Write)
    - 쇼핑몰 이벤트로 인해 동시에 엄청난 트래픽의 구매가 이루어질 때 데이터베이스에 요청된 트랜잭션이 누락될 수 있음
    - SQS Queue를 이용하면 대기열에 일단 다 등록시키고 순차적으로 처리하기 때문에 요청이 유실되는 걱정을 하지 않아도됨. 처리된 후에는 대기열에서 메세지를 삭제시킬 수도 있음

***

### ✅ SNS

__Pub/Sub패턴__ : Pub(게시자)가 SNS에 주제를 게시하면 복수의 Sub(수신자)가 메세지를 수신하는 패턴

#### 1. SNS의 특징

- 이벤트 생산자는 오직 하나의 SNS 주제에만 메시지를 보낸다.
- 이벤트 수신자(=구독자) 는 원하는 SNS주제를 구독할 수 있다. 이는 해당 SNS 주제에 게시되는 모든 알림을 받게된다는 의미이다.
- 주제당 대략 12만 구독자를 가질 수 있다.
- 계정당 대략 10만개의 주제를 게시할 수 있다.
- SNS 서비스를 이용해 구독자들은 이메일, SMS, 모바일 알림, HTTP 엔드포인트, SQS, 람다, Firehose를 통해 s3, redshift에 데이터 전송 등을 할 수 있다.
- AWS에서 알림을 발생하면 지정된 SNS주제로 알림을 보낼 수 있다.


#### 2. SNS 게시방법

- **SDK**를 통해 주제 게시 : 주제 생성 ⇒ 구독자 등록 ⇒ 발행
- 모바일 전용 SDK ‘Direct publish’ : 플랫폼 애플리케이션 생성 ⇒ 엔드포인트 생성 ⇒ 엔드포인트 배포
  - ex. Google GCM, Aplle APNS, Amazon ADM

#### 3. 보안

- SQS랑 SNS 동일
  - **HTTP API**를 이용한 전송중 암호화
  - **KMS 키**를 이용한 저장데이터 암호
  - **클라이언트측 암호화**
- Access Control : IAM
  - IAM 정책으로 SNS API 규제
- SNS Access Policies
  - S3 버킷 정책과 유사
  - SNS 주제에 교차 계정 접근을 할 경우 유용
  - 다른 aws 서비스가 SNS 주제를 게시할  있도록 할 경우 유용

***

### ✅ 팬아웃 패턴(SQS, SNS)

#### Fan-Out 패턴이란?

메세지 생산자가<br>
하나의 SNS 주제를 발행하고<br>
여러 개의 SQS 대기열이 해당 SNS 주제를 구독하도록 하여<br>
각각의 서비스(메세지 수신자)가 각자의 SQS 대기열에서 모든 메세지를 읽어들여 처리하는 것

#### 1. 팬아웃 패턴의 장점

- 완전히 분리된 모델이며 데이터 손실이 없다.
- SQS로 작업을 다시 시도하도록 할 수 있고, 데이터 지속성, 지연 처리도 수행할 수 있다.
- 해당 SNS 주제에 대한 SQS 대기열을 늘릴 수 있어 융통성있게 운영할 수 있다.
- 크로스 리전 딜리버리 : 한 리전의 SNS 주제에서 다른 리전의 SQS 대기열로 메세지를 전송할 수 있다.


#### 2. 팬아웃 패턴을 실행할 때 주의점

SQS 액세스 정책을 활용해 __SNS에 write 작업이 가능하도록__ 해야한다.


#### 3. 시나리오(팬아웃 패턴 활용하기)

1. 같은 S3 이벤트를 다수의 SQS 대기열로 보내고 싶을 때
  - S3 버킷에 이벤트를 형성한다.
  - 이 이벤트를 SNS 주제로 전송한다.
  - 팬아웃 패턴을 이용해 많은 SQS 대기열이 해당 SNS 주제를 구독하게한다.(SNS 말고 다른 유형의 애플리케이션, 이메일, 람다 함수 등도 구독 가능)
  - ⇒ S3에서 발생하는 이벤트 메세지가 여러 다른 목적지에 도달하도록 할 수 있다.
2. SNS → S3 로 데이터 전송
  - 서비스(이벤트 생산자) => SNS 주제 => KDF(Kinesis Data Firehorse) => S3 or 다른 KDF
3. SQS FIFO 대기열을 SNS주제의 구독자로 설정
  - 메세지 처리 순서 보장
  - 처리량이 제한적
  - 메세지 필터링
    - json 정책
    - 구매 중 발주요청된 구매에 대한 메세지만 받고 싶을 때 필터링 기능을 이용할 수 있다.

***
