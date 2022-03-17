declare global {
  interface Window {
    mozIndexedDB: IDBFactory;
    webkitIndexedDB: IDBFactory;
    msIndexedDB: IDBFactory;
  }
}

interface Notes {
  title: string;
}
const DATABASE_NAME = 'nuxtTodo';

export default function () {
  let isSavingRecord = ref(false);
  let notes = ref<Array<Notes>>([]);
  let db: IDBDatabase;

  const setup = () => {
    return new Promise<string>((resolve, reject) => {

      if (!window) {
        return reject('Error, window not available');
      }

      const indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;

      // Let us open our database
      const DBOpenRequest = indexedDB.open(DATABASE_NAME, 4);

      // these two event handlers act on the database being opened successfully, or not
      DBOpenRequest.onerror = function (event) {
        return reject('Error loading database.');
      };

      DBOpenRequest.onsuccess = function (event) {
        // store the result of opening the database in the db variable. This is used a lot below
        db = DBOpenRequest.result;

        return resolve('Database initialised.');
      };

      DBOpenRequest.onupgradeneeded = () => {
        DBOpenRequest.result.onerror = function (event) {
          return reject('Error loading database.');
        };

        DBOpenRequest.result.createObjectStore(DATABASE_NAME, { keyPath: 'title' });
      };
    });
  };

  const create = (title: string) => {
    return new Promise<string>((resolve, reject) => {
      if (!title || !title.trim()) {
        return reject('Error: invalid item title');
      }
      if (isSavingRecord.value) {
        return reject('Error: saving ongoing');
      }

      isSavingRecord.value = true;

      // open a read/write db transaction, ready for adding the data
      const transaction = db.transaction(DATABASE_NAME, 'readwrite');

      // report on the success of the transaction completing, when everything is done
      transaction.oncomplete = function () {
        return resolve('Record saved');
      };

      transaction.onerror = function () {
        return reject(`Error: ${transaction.error}`);
      };

      const objectStore = transaction.objectStore(DATABASE_NAME);
      const objectStoreRequest = objectStore.add({ title });
      objectStoreRequest.onsuccess = function (event) {
        notes.value.unshift({ title });
      };

      isSavingRecord.value = false;
    });
  };

  const read = async (callback?: (data: Array<Notes>) => void) => {
    const objectStore = db.transaction(DATABASE_NAME).objectStore(DATABASE_NAME);
    const objectStoreCursor = objectStore.openCursor();

    objectStoreCursor.onsuccess = () => {
      const cursor = objectStoreCursor.result;
      if (cursor) {
        notes.value.push(cursor.value);
        cursor.continue();
      } else if (typeof callback === 'function') {
        callback(notes.value);
      }
    };
  };

  return {
    setup,
    create,
    read,
    notes: notes.value,
  };
}
