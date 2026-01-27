const DB_NAME = 'hookhook_storyedit';
const DB_VERSION = 1;
const STORE_NAME = 'cuts';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('by_user_template', ['userId', 'templateId'], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 개별 컷 저장
 */
export async function saveCut(userId, templateId, cutId, { videoBlob, thumbnail, subtitle, isCompleted }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.put({
      key: `${userId}_${templateId}_${cutId}`,
      userId,
      templateId,
      cutId,
      videoBlob: videoBlob || null,
      thumbnail: thumbnail || null,
      subtitle: subtitle || '',
      isCompleted: !!isCompleted,
    });

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * 모든 컷 + 메타 정보를 단일 트랜잭션으로 저장
 */
export async function saveAllCuts(userId, templateId, cutsArray, currentCutIndex) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    cutsArray.forEach(cut => {
      store.put({
        key: `${userId}_${templateId}_${cut.id}`,
        userId,
        templateId,
        cutId: cut.id,
        videoBlob: cut._videoBlob || null,
        thumbnail: cut.thumbnail || null,
        subtitle: cut.subtitle || '',
        isCompleted: !!cut.isCompleted,
      });
    });

    // 세션 메타 저장
    store.put({
      key: `meta_${userId}_${templateId}`,
      userId,
      templateId,
      cutId: '__meta__',
      currentCutIndex,
      savedAt: new Date().toISOString(),
    });

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * 저장된 모든 컷 + 메타 정보 로드
 */
export async function loadAllCuts(userId, templateId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_user_template');
    const request = index.getAll([userId, templateId]);

    request.onsuccess = () => {
      const results = request.result || [];
      let meta = null;
      const cuts = [];

      results.forEach(item => {
        if (item.cutId === '__meta__') {
          meta = { currentCutIndex: item.currentCutIndex || 0 };
        } else {
          cuts.push(item);
        }
      });

      db.close();
      resolve({ cuts, meta });
    };

    request.onerror = () => { db.close(); reject(request.error); };
  });
}

/**
 * 특정 유저+템플릿의 모든 데이터 삭제
 */
export async function deleteAllCuts(userId, templateId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_user_template');
    const request = index.getAllKeys([userId, templateId]);

    request.onsuccess = () => {
      (request.result || []).forEach(key => store.delete(key));
    };

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
