// Initialize - apply saved speed to existing videos
let savedSpeed = 1.0;
let speedOverrideActive = false;

// Function to set speed for all videos on the page
function setVideoSpeed(speed) {
  savedSpeed = speed;
  
  // Apply to all existing videos
  const videos = document.querySelectorAll('video');
  videos.forEach(applySpeedToVideo);
  
  // Set flag to indicate override is active
  speedOverrideActive = true;
}

// Function to apply speed to a specific video
function applySpeedToVideo(video) {
  // Set the initial playback rate
  video.playbackRate = savedSpeed;
  
  // Remove any existing listeners to avoid duplicates
  video.removeEventListener('ratechange', handleRateChange);
  
  // Add event listener to catch speed changes
  video.addEventListener('ratechange', handleRateChange);
}

// Event handler for ratechange events
function handleRateChange(event) {
  // Only override if our speed control is active
  if (speedOverrideActive && event.target.playbackRate !== savedSpeed) {
    event.target.playbackRate = savedSpeed;
  }
}

// Get saved speed from storage and apply to existing videos
chrome.storage.sync.get('playbackSpeed', (data) => {
  if (data.playbackSpeed) {
    savedSpeed = data.playbackSpeed;
    setVideoSpeed(savedSpeed);
  }
});

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setVideoSpeed') {
    setVideoSpeed(message.speed);
    if (sendResponse) {
      sendResponse({ status: 'success' });
    }
    return true;
  }
});

// Create a MutationObserver to detect new videos added to the page
const observer = new MutationObserver((mutations) => {
  let newVideosFound = false;
  
  mutations.forEach((mutation) => {
    // Check if new nodes were added
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // Check if any of the added nodes are videos or contain videos
      mutation.addedNodes.forEach((node) => {
        // Check if the node itself is a video
        if (node.nodeName === 'VIDEO') {
          applySpeedToVideo(node);
          newVideosFound = true;
        }
        // Check if the node contains videos
        else if (node.querySelectorAll) {
          const videos = node.querySelectorAll('video');
          if (videos.length > 0) {
            videos.forEach(applySpeedToVideo);
            newVideosFound = true;
          }
        }
      });
    }
  });
  
  // If we found new videos, report back to background script
  if (newVideosFound && speedOverrideActive) {
    chrome.runtime.sendMessage({
      action: 'videosDetected',
      count: document.querySelectorAll('video').length
    }).catch(() => {
      // Ignore errors - background script might not be listening
    });
  }
});

// Start observing changes to the DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && speedOverrideActive) {
    // Re-apply speeds when page becomes visible again
    const videos = document.querySelectorAll('video');
    videos.forEach(applySpeedToVideo);
  }
}); 