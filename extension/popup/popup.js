chrome.storage.local.get(['lastScan'], (data) => {
  const statusEl    = document.getElementById('status');
  const resultBox   = document.getElementById('result-box');
  const urlText     = document.getElementById('url-text');
  const riskBadge   = document.getElementById('risk-badge');
  const scoreText   = document.getElementById('score-text');
  const reasonsList = document.getElementById('reasons-list');

  if (!data.lastScan) {
    statusEl.textContent = 'No scans yet. Browse a URL to get started.';
    return;
  }

  statusEl.classList.add('hidden');
  resultBox.classList.remove('hidden');

  const scan = data.lastScan;
  urlText.textContent   = scan.url;
  riskBadge.textContent = scan.riskLevel.toUpperCase();
  riskBadge.className   = `risk-badge ${scan.riskLevel}`;
  scoreText.textContent = `Risk score: ${scan.riskScore}/100`;

  reasonsList.innerHTML = '';
  (scan.reasons || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = '⚠ ' + r;
    reasonsList.appendChild(li);
  });
});
