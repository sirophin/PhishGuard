import { useState } from 'react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

const EXAMPLES = [
  'http://192.168.1.1/login',
  'paypa1.com',
  'https://paypal-secure-login.verify-account.com',
  'bit.ly/3xFakeURL',
  'https://google.com'
];

export default function Scanner() {
  const [url, setUrl]         = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [history, setHistory] = useState([]);

  const handleScan = async (scanUrl) => {
    const target = scanUrl || url;
    if (!target.trim()) return setError('Please enter a URL');
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await axios.post('/scan/url', { url: target });
      setResult(res.data);
      setHistory(h => [{ url: target, riskLevel: res.data.riskLevel, ts: new Date() }, ...h.slice(0,4)]);
      if (res.data.riskLevel === 'dangerous') toast.error('Dangerous URL detected!');
      else if (res.data.riskLevel === 'suspicious') toast('Suspicious URL — proceed with caution', { icon: '⚠️' });
      else toast.success('URL appears safe');
    } catch {
      setError('Scan failed. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const meterColor = (score) => {
    if (score >= 60) return '#f05252';
    if (score >= 25) return '#f5a623';
    return '#3dd68c';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>URL Scanner</h1>
          <p>Analyze URLs for phishing indicators</p>
        </div>
        {result && <span className={"badge badge-" + result.riskLevel} style={{fontSize:'0.8rem'}}>
          Last scan: {result.riskLevel}
        </span>}
      </div>

      <div className="page-body">
        <div className="card mb-md">
          <h2>Scan a URL</h2>
          <div className="input-row">
            <input
              type="text"
              placeholder="Enter URL — e.g. http://suspicious-login.com or paypa1.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
            />
            <button onClick={() => handleScan()} disabled={loading} style={{minWidth:'120px'}}>
              {loading ? <span className="loader"></span> : '🔍 Scan'}
            </button>
          </div>

          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            <span className="text-muted text-sm" style={{lineHeight:'28px'}}>Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button key={i} className="btn-ghost btn-sm"
                onClick={() => { setUrl(ex); handleScan(ex); }}>
                {ex.length > 30 ? ex.substring(0,30) + '...' : ex}
              </button>
            ))}
          </div>

          {error && <p className="error-msg" style={{marginTop:'0.75rem'}}>{error}</p>}
        </div>

        {result && (
          <div className={"result-card risk-" + result.riskLevel}>
            <div className="result-header">
              <span className="result-url">{result.url}</span>
              <span className={"badge badge-" + result.riskLevel}>
                {result.riskLevel.toUpperCase()}
              </span>
            </div>

            <div className="risk-meter">
              <span className="text-sm text-muted">Risk score</span>
              <div className="risk-meter-bar">
                <div className="risk-meter-fill"
                  style={{width: result.riskScore + '%', background: meterColor(result.riskScore)}} />
              </div>
              <span style={{fontWeight:700, fontSize:'1rem', color: meterColor(result.riskScore)}}>
                {result.riskScore}/100
              </span>
            </div>

            <hr className="divider" />

            <h3>Detection reasons</h3>
            {result.reasons.length === 0
              ? <div className="reason-item"><span style={{color:'#3dd68c'}}>✓</span> No threats detected — URL appears safe</div>
              : result.reasons.map((r, i) => (
                  <div key={i} className="reason-item">
                    <span className="reason-icon">⚠</span>
                    <span>{r}</span>
                  </div>
                ))
            }

            {result.virusTotal && (
              <>
                <hr className="divider" />
                <h3>VirusTotal results</h3>
                <div className="vt-grid">
                  <div className="vt-cell">
                    <div className="vt-cell-value" style={{color:'#f05252'}}>{result.virusTotal.malicious}</div>
                    <div className="vt-cell-label">Malicious</div>
                  </div>
                  <div className="vt-cell">
                    <div className="vt-cell-value" style={{color:'#f5a623'}}>{result.virusTotal.suspicious}</div>
                    <div className="vt-cell-label">Suspicious</div>
                  </div>
                  <div className="vt-cell">
                    <div className="vt-cell-value" style={{color:'#3dd68c'}}>{result.virusTotal.harmless}</div>
                    <div className="vt-cell-label">Clean</div>
                  </div>
                  <div className="vt-cell">
                    <div className="vt-cell-value">{result.virusTotal.undetected}</div>
                    <div className="vt-cell-label">Undetected</div>
                  </div>
                </div>
              </>
            )}

            {result.openPhishMatch && (
              <div style={{marginTop:'0.75rem',padding:'0.6rem 1rem',background:'#200808',
                           border:'1px solid #3a1010',borderRadius:'8px',fontSize:'0.85rem',color:'#f05252'}}>
                🔴 This URL is listed in the OpenPhish phishing database
              </div>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="card" style={{marginTop:'1rem'}}>
            <h3>Session history</h3>
            {history.map((h, i) => (
              <div key={i} className="flex-between" style={{padding:'0.4rem 0',
                borderBottom: i < history.length-1 ? '1px solid var(--border)' : 'none'}}>
                <span className="mono text-sm" style={{color:'var(--text-secondary)',flex:1,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%'}}>
                  {h.url}
                </span>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
                  <span className={"badge badge-" + h.riskLevel}>{h.riskLevel}</span>
                  <span className="text-muted text-sm">{h.ts.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
