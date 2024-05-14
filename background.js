let inactivityThreshold = 600000;  // 10 mins threshold for inactivity
let globalLastActiveTime = Date.now();  // Track activity across all tabs

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "resetTimer") {
        globalLastActiveTime = Date.now();  // Reset the global last active time
        console.log("Activity detected in tab " + sender.tab.id + ", resetting global timer.");
    }
});

function checkGlobalActivity() {
    let currentTime = Date.now();
    if (currentTime - globalLastActiveTime > inactivityThreshold) {
        logoutFirstTab();
    }
    setTimeout(checkGlobalActivity, 10000); // Check every 10 seconds
}

function logoutFirstTab() {
    // Define the platform-specific URLs, excluding the login page
    const platformUrls = ["*://app.mews.com/*", "*://app.mews-demo.com/*"];

    // Query all tabs that match the platform URLs, not just active ones
    chrome.tabs.query({url: platformUrls}, function(tabs) {
        // Iterate over all matching tabs
        for (let tab of tabs) {
            // Use the scripting API to check if the tab has the specified element
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                func: () => document.querySelector('[data-test-id="user-menu-avatar"]') !== null
            }, (results) => {
                // results[0].result will be true if the element exists
                if (results && results[0].result) {
                    // Element exists, trigger logout
                    triggerLogout(tab.id);
                    return;  // Stop after the first match to ensure only one logout occurs
                }
            });
        }
        console.log("No eligible tabs for logout found or none have the user menu avatar.");
    });
}

function triggerLogout(tabId) {
    chrome.tabs.sendMessage(tabId, {action: "logout"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error sending logout message:", chrome.runtime.lastError.message);
        } else {
            console.log("Logout command sent and response received:", response);
        }
    });
}


checkGlobalActivity();
