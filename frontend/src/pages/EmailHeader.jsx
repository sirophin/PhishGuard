import { useState } from 'react';

function parseHeaders(raw) {
  const results = [];
  const warnings = [];
  const lines = raw.split('\n');
  const headers = {};

  let currentKey = '';
  for (const line of lines) {
    if (/^\s/.test(line) && currentKey) {
      headers[currentKey] += ' ' + line.trim();
    } else {
      const match = line.match(/^([\w-]+):\s*(.*)/i);
      if (match) {
        currentKey = match[1].toLowerCase();
        headers[currentKey] = match[2].trim();
      }
    }
  }

  // Check From vs Reply-To mismatch
  const from = headers['from'] || '';
  const replyTo = headers['reply-to'] || '';
  if (replyTo && from && replyTo !== from) {
    warnings.push({
      severity: 'high',
      field: 'Reply-To mismatch',
      detail: 'From: ' + from + ' but Reply-To: ' + replyTo + ' — replies go to a different address'
    });
  }

  // Check SPF
  const authResults = headers['authentication-results'] || '';
  const received_spf = headers['received-spf'] || '';
  if (received_spf.toLowerCase().includes('fail') || authResults.toLowerCase().includes('spf=fail')) {
    warnings.push({ severity: 'high', field: 'SPF Failed', detail: 'Sender Policy Framework check failed — email may be spoofed' });
  } else if (received_spf.toLowerCase().includes('softfail') || authResults.toLowerCase().includes('spf=softfail')) {
    warnings.push({ severity: 'medium', field: 'SPF Softfail', detail: 'SPF soft fail — sender not fully authorized' });
  }

  // Check DKIM
  if (authResults.toLowerCase().includes('dkim=fail')) {
    warnings.push({ severity: 'high', field: 'DKIM Failed', detail: 'Email signature verification failed — content may have been tampered' });
  }

  // Check DMARC
  if (authResults.toLowerCase().includes('dmarc=fail')) {
    warnings.push({ severity: 'high', field: 'DMARC Failed', detail: 'DMARC policy check failed — high risk of spoofing' });
  }

  // Check for suspicious X-Mailer
  const mailer = headers['x-mailer'] || headers['user-agent'] || '';
  const suspiciousMailers = ['massmailer','bulk','blaster','sender','phpmailer'];
  if (suspiciousMailers.some(m => mailer.toLowerCase().includes(m))) {
    warnings.push({ severity: 'medium', field: 'Suspicious Mailer', detail: 'X-Mailer: ' + mailer + ' — associated with bulk/spam sending' });
  }

  // Urgency keywords in subject
  const subject = headers['subject'] || '';
  const urgencyWords = ['urgent','immediately','suspended','verify','confirm','unusual','alert','warning','limited time'];
  const foundUrgency = urgencyWords.filter(w => subject.toLowerCase().includes(w));
  if (foundUrgency.length > 0) {
    warnings.push({ severity: 'medium', field: 'Urgency in subject', detail: 'Subject contains urgency triggers: ' + foundUrgency.join(', ') });
  }

  // Return path mismatch
  const returnPath = headers['return-path'] || '';
  if (returnPath && from && !returnPath.includes(from.replace(/.*@/, ''))) {
    warnings.push({ severity: 'medium', field: 'Return-Path mismatch', detail: 'Return-Path domain differs from From domain' });
  }

  // Hop count
  const receivedCount = lines.filter(l => /^Received:/i.test(l)).length;
  if (receivedCount > 8) {
    warnings.push({ severity: 'low', field: 'Many hops', detail: receivedCount + ' Received headers — unusually long routing path' });
  }

  // Build display fields
  const DISPLAY_FIELDS = ['from','to','subject','date','reply-to','return-path',
    'received-spf','authentication-results','x-mailer','message-id','mime-version'];

  for (const key of DISPLAY_FIELDS) {
    if (headers[key]) {
      results.push({ key, value: headers[key] });
    }
  }

  const riskScore = warnings.reduce((acc, w) =>
    acc + (w.severity === 'high' ? 35 : w.severity === 'medium' ? 20 : 10), 0);
  const clamped = Math.min(riskScore, 100);
  const riskLevel = clamped >= 60 ? 'dangerous' : clamped >= 25 ? 'suspicious' : 'safe';

  return { fields: results, warnings, riskScore: clamped, riskLevel };
}

const SAMPLE = `From: security@paypa1-alerts.com
To: victim@gmail.com
Subject: URGENT: Your account has been suspended - verify immediately
Date: Mon, 13 May 2024 09:23:11 -0400
Reply-To: collect@malicious-domain.net
Return-Path: <bounce@totally-different.com>
Received-SPF: fail (domain of paypa1-alerts.com does not designate sender)
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail
X-Mailer: PHPMailer 5.2.7
Message-ID: <abc123@paypa1-alerts.com>`;

export default function EmailHeader() {
  const [raw, setRaw]       = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!raw.trim()) return;
    setResult(parseHeaders(raw));
  };

  const meterColor = (score) => score >= 60 ? '#f05252' : score >= 25 ? '#f5a623' : '#3dd68c';
  const severityColor = { high: '#f05252', medium: '#f5a623', low: '#6c8ef5' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Email Header Analyzer</h1>
          <p>Detect spoofing, SPF/DKIM failures, and phishing indicators</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card mb-md">
          <div className="flex-between mb-md">
            <h2 style={{margin:0}}>Paste email headers</h2>
            <button className="btn-ghost btn-sm" onClick={() => setRaw(SAMPLE)}>
              Load sample
            </button>
          </div>
          <textarea value={raw} onChange={e => setRaw(e.target.value)}
            placeholder={"Paste raw email headers here...\n\nFrom: sender@example.com\nTo: you@example.com\nSubject: ..."}
            style={{minHeight:'160px',fontFamily:'monospace',fontSize:'0.8rem'}} />
          <div style={{marginTop:'0.75rem',display:'flex',justifyContent:'flex-end'}}>
            <button onClick={handleAnalyze}>🔍 Analyze Headers</button>
          </div>
        </div>

        {result && (
          <>
            <div className={"result-card risk-" + result.riskLevel} style={{marginBottom:'1rem'}}>
              <div className="result-header">
                <span style={{fontWeight:600}}>Header Analysis Result</span>
                <span className={"badge badge-" + result.riskLevel}>{result.riskLevel.toUpperCase()}</span>
              </div>
              <div className="risk-meter">
                <span className="text-sm text-muted">Risk score</span>
                <div className="risk-meter-bar">
                  <div className="risk-meter-fill"
                    style={{width: result.riskScore + '%', background: meterColor(result.riskScore)}} />
                </div>
                <span style={{fontWeight:700,color: meterColor(result.riskScore)}}>{result.riskScore}/100</span>
              </div>

              {result.warnings.length > 0 && (
                <>
                  <hr className="divider" />
                  <h3>Warnings ({result.warnings.length})</h3>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="reason-item">
                      <span style={{color: severityColor[w.severity], flexShrink:0, fontWeight:600, fontSize:'0.72rem',
                        textTransform:'uppercase', letterSpacing:'0.5px', minWidth:'50px'}}>
                        {w.severity}
                      </span>
                      <div>
                        <div style={{fontWeight:500}}>{w.field}</div>
                        <div style={{fontSize:'0.8rem',color:'var(--text-secondary)',marginTop:'2px'}}>{w.detail}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {result.warnings.length === 0 && (
                <div className="reason-item">
                  <span style={{color:'#3dd68c'}}>✓</span>
                  No suspicious indicators found in the email headers
                </div>
              )}
            </div>

            <div className="card">
              <h2>Parsed fields</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Header</th><th>Value</th></tr></thead>
                  <tbody>
                    {result.fields.map((f, i) => (
                      <tr key={i}>
                        <td style={{fontFamily:'monospace',fontSize:'0.8rem',color:'var(--accent)',
                          whiteSpace:'nowrap',width:'180px'}}>{f.key}</td>
                        <td style={{fontFamily:'monospace',fontSize:'0.78rem',color:'var(--text-secondary)',
                          wordBreak:'break-all'}}>{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
