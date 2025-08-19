import type type = require("./type");

/* eslint-disable @typescript-eslint/no-explicit-any */
const sucConsole = "background:blue; color:white";
const erronsole = "background:red; color:black";
const isInIframe = window.self !== window.top;
class IndexDb {
  private dbName: string;
  private storeName: string;
  private version = 1;
  private db: IDBDatabase | null = null; // 열린 DB를 저장

  constructor({ dbName, storeName }: { dbName: string; storeName: string }) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  //  IndexedDB 연결 (DB를 한 번만 열고 유지)
  private async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db; // 이미 열려 있으면 재사용

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "offset",
          });

          store.createIndex("stateIndex", "state", { unique: false }); //  인덱스 생성
        }
      };

      request.onsuccess = () => {
        console.log("%c database 연결... 성공", sucConsole);
        this.db = request.result;
        if (isInIframe) {
          const tx = request.result.transaction(this.storeName, "readonly");
          const store = tx.objectStore(this.storeName);
          const result = store.getAll();

          result.onsuccess = () => {
            const data = result.result;
            window.parent.postMessage(
              { type: "init_get_all_list", list: data },
              "*"
            );
          };
        }
        resolve(this.db);
      };

      request.onerror = () => {
        console.log("%c database 연결... 실패", erronsole);

        reject(request.error);
      };
    });
  }

  async addData(data: type.SSponAlertParse | type.SSponAlertRecommendParse) {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    store.put(data);
    return new Promise<number>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`%c 데이터  add 완료`, sucConsole);
        if (isInIframe)
          window.parent.postMessage({ type: "spon_add", data: data }, "*");

        resolve(new Date().getTime());
      };

      tx.onerror = () => {
        console.error(`%c 데이터 add 실패`, erronsole);
        reject(0);
      };
    });
  }

  async getDataFromId(id: string): Promise<any> {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    return store.get(id);
  }

  async getDataFromState(): Promise<any> {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const index = store.index("stateIndex");

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only("pending"));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(null);
      };
    });
  }

  async getAllData(): Promise<IDBRequest<type.SSponAlertParse[]>> {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    return store.getAll();
  }

  async updateStateByOffset(newState: type.SSponAlertParse) {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    store.put(newState);
    if (isInIframe)
      window.parent.postMessage({ type: "spon_update", data: newState }, "*");
    console.log(`%c 상태 변경 완료 ${newState.offset}`, sucConsole);
  }

  async deleteData(id: string) {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    store.delete(id);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`%c 데이터 ${id} 삭제 완료`, sucConsole);
        if (isInIframe)
          window.parent.postMessage({ type: "spon_id_delete", data: id }, "*");
        resolve();
      };

      tx.onerror = () => {
        console.error(`%c 데이터 ${id} 삭제 실패`);
        reject(tx.error);
      };
    });
  }

  // 데이터 모두 삭제
  async clearData() {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    store.clear();
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`%c 데이터  삭제 완료`);
        if (isInIframe)
          window.parent.postMessage(
            { type: "spon_all_delete", data: null },
            "*"
          );
        resolve();
      };

      tx.onerror = () => {
        console.error(`%c 데이터 삭제 실패`);
        reject(tx.error);
      };
    });
  }

  async updateAllPlayingToComplete() {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const index = store.index("stateIndex");

    const request = index.openCursor(IDBKeyRange.only("playing"));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const data = cursor.value;
        data.state = "complete";
        cursor.update(data);
        cursor.continue();
      } else {
        if (isInIframe)
          window.parent.postMessage(
            { type: "spon_all_playing_to_complete", data: null },
            "*"
          );
        console.log(
          "%c 모든 'playing' 상태를 'complete'로 변경 완료",
          sucConsole
        );
      }
    };

    request.onerror = () => {
      console.log("%c데이터 업데이트 실패", erronsole);
    };
  }
  async updateAllPendingToComplete() {
    const db = await this.connect();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const index = store.index("stateIndex");

    const request = index.openCursor(IDBKeyRange.only("pending"));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const data = cursor.value;
        data.state = "complete";
        cursor.update(data);
        cursor.continue();
      } else {
        if (isInIframe)
          window.parent.postMessage(
            { type: "spon_all_pending_to_complete", data: null },
            "*"
          );

        console.log(
          "%c 모든 'pending' 상태를 'complete'로 변경 완료",
          sucConsole
        );
      }
    };

    request.onerror = () => {
      console.log("%c데이터 업데이트 실패", erronsole);
    };
  }
}

module.exports = IndexDb;
