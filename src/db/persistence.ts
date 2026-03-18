const DB_FILE_NAME = "climbing-journal.sqlite";
const IDB_DB_NAME = "climbing-journal";
const IDB_STORE_NAME = "database";
const IDB_KEY = "main";

/**
 * Check if OPFS is available in the current browser.
 */
async function isOpfsAvailable(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage) return false;
    const root = await navigator.storage.getDirectory();
    // Try to create and immediately remove a test file
    const testName = "__opfs_test__";
    const handle = await root.getFileHandle(testName, { create: true });
    // If we got here, OPFS is available
    void handle;
    await root.removeEntry(testName);
    return true;
  } catch {
    return false;
  }
}

// --- OPFS ---

async function saveToOpfs(data: Uint8Array): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(DB_FILE_NAME, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(data as unknown as ArrayBuffer);
  await writable.close();
}

async function loadFromOpfs(): Promise<Uint8Array | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(DB_FILE_NAME);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

// --- IndexedDB ---

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIdb(data: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);
    store.put(data, IDB_KEY);
    tx.oncomplete = () => {
      idb.close();
      resolve();
    };
    tx.onerror = () => {
      idb.close();
      reject(tx.error);
    };
  });
}

async function loadFromIdb(): Promise<Uint8Array | null> {
  try {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE_NAME, "readonly");
      const store = tx.objectStore(IDB_STORE_NAME);
      const request = store.get(IDB_KEY);
      request.onsuccess = () => {
        idb.close();
        const result = request.result;
        resolve(result ? new Uint8Array(result) : null);
      };
      request.onerror = () => {
        idb.close();
        reject(request.error);
      };
    });
  } catch {
    return null;
  }
}

// --- Public API ---

let useOpfs: boolean | null = null;

async function shouldUseOpfs(): Promise<boolean> {
  if (useOpfs === null) {
    useOpfs = await isOpfsAvailable();
  }
  return useOpfs;
}

/**
 * Load the database from browser storage (OPFS or IndexedDB).
 * Returns null if no database is stored.
 */
export async function loadFromStorage(): Promise<Uint8Array | null> {
  if (typeof window === "undefined") return null;

  if (await shouldUseOpfs()) {
    return loadFromOpfs();
  }
  return loadFromIdb();
}

/**
 * Save the database to browser storage (OPFS or IndexedDB).
 */
export async function saveToStorage(data: Uint8Array): Promise<void> {
  if (typeof window === "undefined") return;

  if (await shouldUseOpfs()) {
    await saveToOpfs(data);
  } else {
    await saveToIdb(data);
  }
}
