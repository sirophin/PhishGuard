const axios = require('axios');
let phishingList = new Set();
let lastFetched = 0;
const CACHE_DURATION = 60 * 60 * 1000;

async function refreshFeed() {
  if (Date.now() - lastFetched < CACHE_DURATION) return;
  try {
    const res = await axios.get('https://openphish.com/feed.txt', { timeout: 8000 });
    phishingList = new Set(
      res.data.split('\n').map(u => u.trim().toLowerCase()).filter(Boolean)
    );
    lastFetched = Date.now();
    console.log(`OpenPhish feed loaded: ${phishingList.size} entries`);
  } catch (err) {
    console.error('OpenPhish fetch failed:', err.message);
  }
}

function isPhishing(url) {
  return phishingList.has(url.trim().toLowerCase());
}

module.exports = { refreshFeed, isPhishing };
