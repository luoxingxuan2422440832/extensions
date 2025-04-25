document.addEventListener('DOMContentLoaded', () => {
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const saveButton = document.getElementById('saveButton');
  const statusElement = document.getElementById('status');
  
  // Load saved speed from storage
  chrome.storage.sync.get('playbackSpeed', (data) => {
    if (data.playbackSpeed) {
      speedSlider.value = data.playbackSpeed;
      speedValue.textContent = data.playbackSpeed;
    }
  });
  
  // Update display when slider changes
  speedSlider.addEventListener('input', () => {
    speedValue.textContent = speedSlider.value;
  });
  
  // Save and apply speed when button clicked
  saveButton.addEventListener('click', () => {
    const speed = parseFloat(speedSlider.value);
    
    // Save to storage
    chrome.storage.sync.set({ playbackSpeed: speed }, () => {
      statusElement.textContent = '设置已保存！';
      
      // Clear status message after 2 seconds
      setTimeout(() => {
        statusElement.textContent = '';
      }, 2000);
    });
    
    // Send message to active tab to apply speed
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'setVideoSpeed', 
        speed: speed 
      });
    });
  });
}); 