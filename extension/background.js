const API_BASE = 'http://localhost:5000/api'\;

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

  try {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, source: 'extension' })
    });
    const result = await res.json();
    chrome.storage.local.set({ lastScan: result });

    if (result.riskLevel === 'dangerous') {
      const warningUrl = chrome.runtime.getURL('warning/warning.html') +
        '?url=' + encodeURIComponent(url) +
        '&reasons=' + encodeURIComponent(JSON.stringify(result.reasons));
      chrome.tabs.update(details.tabId, { url: warningUrl });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Phishing Detected!',
        message: `Blocked: ${url.substring(0, 60)}`
      });
    }
  } catch (err) {
    console.error('PhishGuard scan failed:', err);
  }
});
