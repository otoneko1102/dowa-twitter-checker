// Options page script for chrome.storage API
const hideCynicalTweetsCheckbox = document.getElementById('hideCynicalTweets') as HTMLInputElement;
const statusMessage = document.getElementById('statusMessage') as HTMLDivElement;

// Load saved settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({ hideCynicalTweets: false });
    hideCynicalTweetsCheckbox.checked = result.hideCynicalTweets as boolean;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save settings
async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      hideCynicalTweets: hideCynicalTweetsCheckbox.checked
    });
    showStatus('設定を保存しました');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Show status message
function showStatus(message: string) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message success show';
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 2000);
}

// Event listeners
hideCynicalTweetsCheckbox.addEventListener('change', saveSettings);

// Initialize
loadSettings();
