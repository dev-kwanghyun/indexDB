# pandatv helper 에 사용한 indexDB class 간소화 버전

TypeScript로 작성된 IndexedDB를 쉽게 사용할 수 있는 래퍼 클래스입니다.

## 특징

- **연결 재사용**: 한 번 연결된 DB를 인스턴스 내에서 재사용
- **완전한 CRUD 지원**: 생성, 읽기, 수정, 삭제 기능 완비
- **인덱스 기반 검색**: state 필드를 기반으로 한 효율적인 데이터 조회
- **iframe 통신**: 부모 창과의 postMessage를 통한 실시간 데이터 동기화
- **비동기 처리**: Promise 기반의 모든 비동기 작업
- **TypeScript 지원**: 완전한 타입 안정성

## 사용법

- **생성자**  
  `constructor({ dbName: string, storeName: string })`  
  → 데이터베이스 이름(`dbName`)과 스토어 이름(`storeName`)을 지정하여 객체를 생성합니다.

- **DB 데이터 추가**  
  `addData(data)`  
  → `data` 객체를 IndexedDB에 추가합니다.

- **DB 데이터 업데이트**  
  `updateStateByOffset(data)`  
  → 특정 `offset` 값을 기준으로 기존 데이터를 찾아 원하는 필드를 수정합니다.

- **DB 데이터 추출 (특정 키 기준)**  
  `getDataFromState(key)`  
  → 지정한 `key` 값과 일치하는 첫 번째 데이터를 조회합니다.

# 관련 로직 도입 전
![before](https://github.com/user-attachments/assets/9fa7b15b-b6db-4d8d-9b52-0dcf6b9a3dc1)


# 관련 로직 도입 후
![after](https://github.com/user-attachments/assets/91cd5e9a-6c99-475d-9192-812b9fce53b5)
