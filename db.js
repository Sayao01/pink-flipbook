const DB_NAME = "PinkFlipbookDB";
const DB_VERSION = 1;
const BOOK_STORE = "books";

function openPinkDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(BOOK_STORE)) {
        const store = db.createObjectStore(BOOK_STORE, {
          keyPath: "id"
        });

        store.createIndex("userName", "userName", {
          unique: false
        });

        store.createIndex("createdAtNumber", "createdAtNumber", {
          unique: false
        });
      }
    };
  });
}

async function saveBookToDB(book) {
  const db = await openPinkDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOK_STORE, "readwrite");
    const store = transaction.objectStore(BOOK_STORE);

    const request = store.put(book);

    request.onsuccess = () => {
      resolve(book);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getBooksByUser(userName) {
  const db = await openPinkDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOK_STORE, "readonly");
    const store = transaction.objectStore(BOOK_STORE);
    const index = store.index("userName");

    const request = index.getAll(userName);

    request.onsuccess = () => {
      const books = request.result || [];

      books.sort((a, b) => {
        return (b.createdAtNumber || 0) - (a.createdAtNumber || 0);
      });

      resolve(books);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getBookById(bookId) {
  const db = await openPinkDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOK_STORE, "readonly");
    const store = transaction.objectStore(BOOK_STORE);

    const request = store.get(bookId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function deleteBookFromDB(bookId) {
  const db = await openPinkDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOK_STORE, "readwrite");
    const store = transaction.objectStore(BOOK_STORE);

    const request = store.delete(bookId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function getCurrentUser() {
  return localStorage.getItem("pinkFlipbookCurrentUser") || "";
}

function requireLogin() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "login.html";
    return "";
  }

  return currentUser;
}

function logoutUser() {
  localStorage.removeItem("pinkFlipbookCurrentUser");
  window.location.href = "login.html";
}

function getShelfNameKey(userName) {
  return "pinkFlipbookShelfName_" + userName;
}

function getShelfName(userName) {
  return localStorage.getItem(getShelfNameKey(userName)) || "";
}

function saveShelfName(userName, shelfName) {
  localStorage.setItem(getShelfNameKey(userName), shelfName);
}
