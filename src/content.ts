import { contains } from "dowa";

const WARNING_CLASS = 'dowa-warning';
const HIDDEN_CLASS = 'dowa-hidden';

// Settings
let hideCynicalTweets = false;

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({ hideCynicalTweets: false });
    hideCynicalTweets = result.hideCynicalTweets as boolean;
    // Re-analyze all tweets when settings change
    scanAll();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.hideCynicalTweets) {
    hideCynicalTweets = changes.hideCynicalTweets.newValue as boolean;
    scanAll();
  }
});

function createWarning() {
  const div = document.createElement('div');
  div.className = WARNING_CLASS;
  Object.assign(div.style, {
    color: '#7a0410',
    background: '#fff1f0',
    border: '1px solid #ffcccc',
    padding: '6px 8px',
    borderRadius: '6px',
    marginTop: '8px',
    fontWeight: '700',
    fontSize: '13px',
  });
  div.textContent = '⚠️ 冷笑が含まれています！';
  return div;
}

function getTweetText(tweet: HTMLElement) {
  // Find the tweetText element that belongs to this article (not a nested quoted tweet)
  const candidates = Array.from(tweet.querySelectorAll('[data-testid="tweetText"]')) as HTMLElement[];
  const primary = candidates.find(el => el.closest('article') === tweet) || candidates[0] || null;
  if (primary) return primary.innerText.trim();
  return (tweet.innerText || '').trim();
}

function analyzeTweet(tweet: HTMLElement) {
  // Get text and skip re-processing if unchanged
  const candidates = Array.from(tweet.querySelectorAll('[data-testid="tweetText"]')) as HTMLElement[];
  const tweetTextEl = candidates.find(el => el.closest('article') === tweet) as HTMLElement | undefined;
  const text = (tweetTextEl && tweetTextEl.innerText.trim()) || (tweet.innerText || '').trim();
  if (!text) return;
  if (tweet.dataset.dowaText === text && tweet.dataset.dowaHideSetting === String(hideCynicalTweets)) return;
  tweet.dataset.dowaText = text;
  tweet.dataset.dowaHideSetting = String(hideCynicalTweets);

  const existing = tweet.querySelector(`.${WARNING_CLASS}`) as HTMLElement | null;

  try {
    const hasCynicism = contains(text);
    
    if (hasCynicism) {
      // Hide tweet if setting is enabled
      if (hideCynicalTweets) {
        if (!tweet.classList.contains(HIDDEN_CLASS)) {
          tweet.classList.add(HIDDEN_CLASS);
          tweet.style.display = 'none';
        }
      } else {
        // Show tweet and warning
        if (tweet.classList.contains(HIDDEN_CLASS)) {
          tweet.classList.remove(HIDDEN_CLASS);
          tweet.style.display = '';
        }
        if (!existing) {
          const warn = createWarning();
          if (tweetTextEl && tweetTextEl.parentElement) {
            // Insert right after the tweet text for better layout
            tweetTextEl.insertAdjacentElement('afterend', warn);
          } else {
            tweet.appendChild(warn);
          }
        }
      }
    } else {
      // Remove warning and unhide if text no longer matches
      if (existing) existing.remove();
      if (tweet.classList.contains(HIDDEN_CLASS)) {
        tweet.classList.remove(HIDDEN_CLASS);
        tweet.style.display = '';
      }
    }
  } catch (e) {
    console.error('dowa-check error', e);
  }
}

function scanAll() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  tweets.forEach((t) => analyzeTweet(t as HTMLElement));
}

// Observe for dynamically loaded tweets
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of Array.from(m.addedNodes)) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches && node.matches('article[data-testid="tweet"]')) analyzeTweet(node as HTMLElement);
      const articles = node.querySelectorAll && node.querySelectorAll('article[data-testid="tweet"]');
      articles && articles.forEach(a => analyzeTweet(a as HTMLElement));
    }
    // Also watch for subtree changes that may update text inside existing tweets
    if (m.type === 'childList' && m.target && (m.target as HTMLElement).closest) {
      const parent = m.target as HTMLElement;
      const article = parent.closest && parent.closest('article[data-testid="tweet"]');
      if (article) analyzeTweet(article as HTMLElement);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Load settings first
loadSettings();

// Initial scan after a short delay to allow twitter to render
setTimeout(scanAll, 1500);

// Also re-scan periodically (lightweight)
setInterval(scanAll, 5000);
