const params  = new URLSearchParams(window.location.search);
const url     = params.get('url') || '';
const reasons = JSON.parse(params.get('reasons') || '[]');

document.getElementById('blocked-url').textContent = url;

const list = document.getElementById('reasons-list');
reasons.forEach(r => {
  const div = document.createElement('div');
  div.className   = 'reason';
  div.textContent = '⚠ ' + r;
  list.appendChild(div);
});

document.getElementById('proceed-btn').addEventListener('click', () => {
  if (confirm('This site may steal your information. Are you sure you want to continue?')) {
    window.location.href = url;
  }
});
