// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default playback speed if not set
  chrome.storage.sync.get('playbackSpeed', (data) => {
    if (!data.playbackSpeed) {
      chrome.storage.sync.set({ playbackSpeed: 1.0 });
    }
  });
});

// Listen for tab updates to ensure content script is running
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Get the saved playback speed
    chrome.storage.sync.get('playbackSpeed', (data) => {
      if (data.playbackSpeed) {
        // Send the saved speed to the content script
        chrome.tabs.sendMessage(tabId, {
          action: 'setVideoSpeed',
          speed: data.playbackSpeed
        }).catch(() => {
          // Error handling - content script may not be ready yet
          // This is normal and can be ignored
        });
      }
    });
  }
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  // Wait a moment for the tab to initialize
  setTimeout(() => {
    chrome.storage.sync.get('playbackSpeed', (data) => {
      if (data.playbackSpeed && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'setVideoSpeed',
          speed: data.playbackSpeed
        }).catch(() => {
          // Error handling - content script may not be ready yet
          // This is normal and can be ignored
        });
      }
    });
  }, 1000);
}); 