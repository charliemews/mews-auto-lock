function resetTimer() {
    chrome.runtime.sendMessage({ action: "resetTimer" });
}

// Function to handle visibility change
function handleVisibilityChange() {
    if (!document.hidden) {
        resetTimer(); // Reset the timer only if the page is visible
    }
}

// Add event listener for visibility change
document.addEventListener('visibilitychange', handleVisibilityChange);

// Properly add event listeners using window.addEventListener
window.addEventListener('load', resetTimer);
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);
document.addEventListener('click', resetTimer);
document.addEventListener('scroll', resetTimer);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Message received:", message);
    if (message.action === "logout") {
        logoutUser();
        sendResponse({result: "Logging out"});
    }
    return true; // This tells Chrome to keep the message channel open to wait for the response
});


function logoutUser() {
    try {
        // Click the user menu avatar to reveal the logout option
        const userMenuAvatar = document.querySelector('[data-test-id="user-menu-avatar"]');
        let retryCount = 0; // Initialize retry counter
        if (userMenuAvatar) {
            if (retryCount < 10) {
            userMenuAvatar.click(); // Simulate click on user menu avatar
            console.log('User menu avatar clicked');

            

            // Function to attempt clicking the Sign Out button
            function attemptClickLogout() {
                 // Check if retry limit is not reached
                    const signOutButton = document.querySelector('[data-test-textkey="LockSession"]');
                    if (signOutButton) {
                        signOutButton.click(); // Simulate click on Sign Out
                        console.log('Sign out button clicked');
                    } else {
                        console.error('Sign out button not found, retrying...');
                        retryCount++; // Increment the retry counter
                        window.setTimeout(attemptClickLogout, 500); // Retry after 500ms
                    }
                } 
            } else {
                    console.error('Maximum retry attempts reached.');
                }
            

            // Wait a bit before first attempt to allow for menu animation
            window.setTimeout(attemptClickLogout, 500); // Initial delay before attempting to click the logout button
        } else {
            console.error('User menu avatar not found');
        }
    } catch (error) {
        console.error('Error during logout process:', error);
    }
}



(function() {
    // Listen for the custom cleanup event triggered on extension reload
    document.addEventListener('extensionReloaded', cleanup);

    function cleanup() {
        console.log("Cleaning up old content script...");

        // Remove event listeners for user interactions
        window.removeEventListener('load', resetTimer);
        document.removeEventListener('mousemove', resetTimer);
        document.removeEventListener('keypress', resetTimer);
        document.removeEventListener('click', resetTimer);
        document.removeEventListener('scroll', resetTimer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Remove the cleanup event listener itself
        document.removeEventListener('extensionReloaded', cleanup);

        console.log("All event listeners removed.");
    }
})();

