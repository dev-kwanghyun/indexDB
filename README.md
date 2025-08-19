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

생성자
constructor({ dbName: string, storeName: string });
DB 데이터 추가
const DATA = {offset: 0, ...} as yourType;
indexDb.addData(DATA);

DB 데이터 업데이트
indexDb.updateStateByOffset({
...DATA,
["KEY"]: updateData,
});

DB 데이터 추출 -  특정키로 처음 검색된 데이터 추출
const key = "your key"
indexDb.getDataFromState(key)