const URL_SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly'];

const SUSPICIOUS_KEYWORDS = ['login','signin','verify','account','update','secure',
  'banking','confirm','suspend','unlock','alert','winner','password','credential'];

const BRAND_LOOKALIKES = [
  { brand: 'paypal',    lookalikes: ['paypa1','paypai','paypal','p4ypal'] },
  { brand: 'amazon',    lookalikes: ['arnazon','amaz0n','amazom'] },
  { brand: 'google',    lookalikes: ['g00gle','googie','gooogle','g0ogle'] },
  { brand: 'facebook',  lookalikes: ['faceb00k','facebok','faceboook'] },
  { brand: 'microsoft', lookalikes: ['micros0ft','mlcrosoft','microsofl'] },
  { brand: 'netflix',   lookalikes: ['netfl1x','netfiix','netlfix'] },
  { brand: 'apple',     lookalikes: ['app1e','appie','aplle'] },
  { brand: 'instagram', lookalikes: ['lnstagram','instagran','inst4gram'] }
];

function analyzeUrl(rawUrl) {
  const reasons = [];
  let score = 0;

  const trimmed = rawUrl.trim();
  const hasProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://');
  const urlForParsing = hasProtocol ? trimmed : 'https://' + trimmed;

  let parsed;
  try {
    parsed = new URL(urlForParsing);
  } catch (e) {
    return { riskScore: 60, riskLevel: 'suspicious', reasons: ['Malformed URL'] };
  }

  const hostname = parsed.hostname.toLowerCase();
  const parts = hostname.split('.');

  // Rule 1: No HTTPS
  if (hasProtocol && parsed.protocol !== 'https:') {
    score += 20;
    reasons.push('Missing HTTPS — uses insecure HTTP');
  }

  // Rule 2: IP-based URL
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 35;
    reasons.push('IP-based URL — no domain name');
  }

  // Rule 3: Excessive subdomains
  const subdomainCount = parts.length - 2;
  if (subdomainCount > 2) {
    score += 20;
    reasons.push('Excessive subdomains (' + subdomainCount + ' levels deep)');
  }

  // Rule 4: URL shortener
  if (URL_SHORTENERS.some(s => hostname === s || hostname.endsWith('.' + s))) {
    score += 25;
    reasons.push('URL shortener detected — hides real destination');
  }

  // Rule 5: Suspicious keywords
  const keywordsFound = SUSPICIOUS_KEYWORDS.filter(k =>
    hostname.includes(k) || parsed.pathname.toLowerCase().includes(k)
  );
  if (keywordsFound.length > 0) {
    score += Math.min(keywordsFound.length * 10, 30);
    reasons.push('Suspicious keywords: ' + keywordsFound.join(', '));
  }

  // Rule 6: Very long URL
  if (trimmed.length > 100) {
    score += 10;
    reasons.push('Unusually long URL (' + trimmed.length + ' characters)');
  }

  // Rule 7: Many special characters
  const specialChars = (trimmed.match(/[@%=~]/g) || []).length;
  if (specialChars > 4) {
    score += 15;
    reasons.push('High number of special characters — possible obfuscation');
  }

  // Rule 8: Brand with hyphens
  const hyphenBrands = ['paypal','amazon','google','facebook','microsoft','netflix','apple','instagram'];
  const hyphenMatch = hyphenBrands.find(b =>
    hostname.includes(b + '-') || hostname.includes('-' + b)
  );
  if (hyphenMatch) {
    score += 35;
    reasons.push('Brand name "' + hyphenMatch + '" with hyphens — likely spoofing');
  }

  // Rule 9: Lookalike / homograph detection
  const lookalikMatch = BRAND_LOOKALIKES.find(function(entry) {
    return entry.lookalikes.some(function(fake) {
      return hostname.includes(fake);
    });
  });
  if (lookalikMatch) {
    score += 50;
    reasons.push('Lookalike domain — mimics "' + lookalikMatch.brand + '" using character substitution');
  }

  // Rule 10: Brand in subdomain but not real domain
  const registeredDomain = parts.slice(-2).join('.');
  const brandInSubdomain = hyphenBrands.find(function(b) {
    if (!hostname.includes(b)) return false;
    return !registeredDomain.startsWith(b + '.');
  });
  if (brandInSubdomain && !hyphenMatch && !lookalikMatch) {
    score += 30;
    reasons.push('Brand "' + brandInSubdomain + '" in subdomain — not the real domain');
  }

  // Rule 11: Multiple hyphens
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    score += 15;
    reasons.push('Multiple hyphens (' + hyphenCount + ') — common phishing pattern');
  }

  score = Math.min(score, 100);
  const riskLevel = score >= 60 ? 'dangerous' : score >= 25 ? 'suspicious' : 'safe';
  return { riskScore: score, riskLevel: riskLevel, reasons: reasons };
}

module.exports = { analyzeUrl };
