const indexedDB = window.indexedDB || window.mozIndexedDB;
let db;
const requestObject = indexedDB.open('budget-tracker', 1);

requestObject.onsuccess = ({target}) => {
    let db = target.result;
    console.log(db.result);

    if (navigator.onLine) {
        checkForIndexedDb();
    }
};

requestObject.onupgradeneeded = ({target}) => {
    let db = target.result;
    db.createObjectStore('new_transaction', {
        autoIncrement: true,
    });
};

requestObject.onerror = function (e) {
    console.log('There was an error' + e.target.errorCode);
};

function saveRecord(recordToBeSaved) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    store.add(recordToBeSaved);
}

function checkForIndexedDb() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    const response = store.getAll();

    // Process and purge waiting data from indexedDb to the API
    response.onsuccess = function () {
        if (response && response.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'post',
                body: JSON.stringify(response.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((dataResponse) => {
                    return dataResponse.json();
                })
                .then(() => {
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const store = transaction.objectStore('new_transaction');

                    store.clear()
                });
        }
    };
}

window.addEventListener('online', checkForIndexedDb);