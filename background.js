let storedFields = [];
let activeTabId = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("UploadEase extension installed.");
    // Set default settings
    chrome.storage.sync.set({
        defaultFormat: 'png',
        defaultWidth: '',
        defaultHeight: '',
        autoDetect: true,
        showNotifications: true
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SAVE_FIELDS") {
        storedFields = message.data;
        activeTabId = sender.tab.id;
        chrome.storage.local.set({ uploadEaseFields: storedFields }, () => {
            console.log("Fields saved:", storedFields);
        });
    } else if (message.type === "SHOW_ASSISTANCE_PROMPT") {
        // Show assistance prompt when file upload is detected
        chrome.action.setBadgeText({ text: "!", tabId: sender.tab.id });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: sender.tab.id });
        
        if (message.showNotification) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'UploadEase',
                message: 'File upload detected! Click the extension icon for assistance.'
            });
        }
    } else if (message.type === "CLEAR_BADGE") {
        chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    } else if (message.type === "GET_FIELDS") {
        sendResponse({ fields: storedFields, tabId: activeTabId });
    }
});

chrome.action.onClicked.addListener((tab) => {
    // Open popup when clicked
    chrome.action.openPopup();
});

// Listen for tab updates to clear badge when leaving upload pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tabId === activeTabId) {
        chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
});
