export function saveFields(fields) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ uploadEaseFields: fields }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

export function getFields() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["uploadEaseFields"], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data.uploadEaseFields || []);
            }
        });
    });
}
