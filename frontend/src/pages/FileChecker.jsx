import { useState, useRef } from 'react';

const DANGEROUS_EXTENSIONS = [
  '.exe','.bat','.cmd','.com','.scr','.pif','.msi','.vbs','.vbe',
  '.js','.jse','.wsf','.wsh','.ps1','.ps2','.reg','.hta','.cpl',
  '.jar','.dll','.sys','.drv'
];
const SUSPICIOUS_EXTENSIONS = [
  '.docm','.xlsm','.pptm','.doc','.xls','.ppt',
  '.zip','.rar','.7z','.gz','.tar',
  '.iso','.img','.dmg',
  '.lnk','.url','.html','.htm','.php'
];
const SAFE_EXTENSIONS = [
  '.txt','.pdf','.png','.jpg','.jpeg','.gif','.bmp','.svg',
  '.mp4','.mp3','.wav','.avi','.mov',
  '.csv','.json','.xml','.md'
];

const EXT_INFO = {
  '.exe': 'Windows executable — can run any code on your system',
  '.bat': 'Batch script — executes system commands',
  '.cmd': 'Command script — similar to .bat, runs shell commands',
  '.vbs': 'VBScript — often used in malware droppers',
  '.ps1': 'PowerShell script — frequently abused by attackers',
  '.js':  'JavaScript file — can execute system commands via WSH',
  '.hta': 'HTML Application — runs with elevated privileges',
  '.jar': 'Java Archive — can run arbitrary code if Java is installed',
  '.docm': 'Word document with macros — common malware delivery method',
  '.xlsm': 'Excel sheet with macros — used in phishing attachments',
  '.iso':  'Disk image — used to bypass email attachment filters',
  '.lnk':  'Windows shortcut — can execute hidden commands',
  '.zip':  'Archive — often contains malicious files to bypass AV',
  '.scr':  'Screen saver — actually an executable, highly suspicious'
};

function analyzeFile(filename) {
  const lower = filename.toLowerCase();
  const dotIndex = lower.lastIndexOf('.');
  const ext = dotIndex !== -1 ? lower.substring(dotIndex) : '';
  const reasons = [];
  let riskLevel = 'safe';
  let riskScore = 0;

  if (!ext) {
    reasons.push('No file extension — extension may be hidden');
    riskScore += 30; riskLevel = 'suspicious';
  } else if (DANGEROUS_EXTENSIONS.includes(ext)) {
    riskLevel = 'dangerous';
    riskScore = 85;
    reasons.push('Dangerous file type: ' + ext + ' — executable file');
    if (EXT_INFO[ext]) reasons.push(EXT_INFO[ext]);
  } else if (SUSPICIOUS_EXTENSIONS.includes(ext)) {
    riskLevel = 'suspicious';
    riskScore = 45;
    reasons.push('Potentially risky file type: ' + ext);
    if (EXT_INFO[ext]) reasons.push(EXT_INFO[ext]);
  } else if (SAFE_EXTENSIONS.includes(ext)) {
    riskScore = 5;
    reasons.push('Generally safe file type: ' + ext);
  } else {
    riskScore = 20;
    riskLevel = 'suspicious';
    reasons.push('Unknown file extension: ' + ext);
  }

  // Double extension check: invoice.pdf.exe
  const parts = lower.split('.');
  if (parts.length > 2) {
    const fakeExt = '.' + parts[parts.length - 2];
    if (SAFE_EXTENSIONS.includes(fakeExt)) {
      riskScore = Math.min(riskScore + 30, 100);
      riskLevel = 'dangerous';
      reasons.push('Double extension detected — disguised as ' + fakeExt + ' but is actually ' + ext);
    }
  }

  // Unicode / RTLO trick (right-to-left override)
  if (filename.includes('\u202e') || filename.charCodeAt(0) === 0x202e) {
    riskScore = 100; riskLevel = 'dangerous';
    reasons.push('Right-to-left override character detected — filename is being disguised');
  }

  // Very long filename
  if (filename.length > 60) {
    riskScore = Math.min(riskScore + 10, 100);
    reasons.push('Unusually long filename — may be trying to hide the real extension');
  }

  // Spaces before extension: "invoice.pdf          .exe"
  if (filename.includes('   ')) {
    riskScore = Math.min(riskScore + 25, 100);
    riskLevel = 'dangerous';
    reasons.push('Multiple spaces before extension — extension hiding technique');
  }

  return { ext, riskLevel, riskScore, reasons };
}

export default function FileChecker() {
  const [filename, setFilename] = useState('');
  const [result, setResult]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const handleCheck = (name) => {
    const target = name || filename;
    if (!target.trim()) return;
    setResult({ filename: target, ...analyzeFile(target) });
  };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFilename(file.name); setResult({ filename: file.name, ...analyzeFile(file.name) }); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setFilename(file.name); setResult({ filename: file.name, ...analyzeFile(file.name) }); }
  };

  const meterColor = (score) => score >= 60 ? '#f05252' : score >= 25 ? '#f5a623' : '#3dd68c';

  const examples = [
    'invoice.pdf', 'setup.exe', 'document.pdf.exe',
    'photo.jpg', 'report.docm', 'update.bat'
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>File Extension Checker</h1>
          <p>Detect malicious file types and extension tricks</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card mb-md">
          <h2>Check a file</h2>

          <div
            className={"drop-zone" + (dragOver ? " drag-over" : "")}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current.click()}
            style={{marginBottom:'1rem'}}
          >
            <div className="drop-zone-icon">📁</div>
            <div className="drop-zone-text">
              <strong style={{color:'var(--text-primary)'}}>Drop a file here</strong> or click to browse
            </div>
            <div className="text-muted text-sm" style={{marginTop:'0.5rem'}}>
              The file is not uploaded — only the filename is analyzed
            </div>
            <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={handleFileSelect} />
          </div>

          <div style={{textAlign:'center',color:'var(--text-muted)',marginBottom:'1rem',fontSize:'0.8rem'}}>
            — or type a filename manually —
          </div>

          <div className="input-row">
            <input type="text" placeholder="e.g. invoice.pdf.exe or document.docm"
              value={filename} onChange={e => setFilename(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()} />
            <button onClick={() => handleCheck()}>Check</button>
          </div>

          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            <span className="text-muted text-sm" style={{lineHeight:'28px'}}>Examples:</span>
            {examples.map((ex,i) => (
              <button key={i} className="btn-ghost btn-sm" onClick={() => { setFilename(ex); handleCheck(ex); }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className={"result-card risk-" + result.riskLevel}>
            <div className="result-header">
              <span className="mono" style={{fontSize:'1rem',fontWeight:600}}>{result.filename}</span>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <span className="tag">{result.ext || 'no extension'}</span>
                <span className={"badge badge-" + result.riskLevel}>{result.riskLevel.toUpperCase()}</span>
              </div>
            </div>

            <div className="risk-meter">
              <span className="text-sm text-muted">Risk score</span>
              <div className="risk-meter-bar">
                <div className="risk-meter-fill"
                  style={{width: result.riskScore + '%', background: meterColor(result.riskScore)}} />
              </div>
              <span style={{fontWeight:700,color: meterColor(result.riskScore)}}>{result.riskScore}/100</span>
            </div>

            <hr className="divider" />
            <h3>Analysis</h3>
            {result.reasons.map((r, i) => (
              <div key={i} className="reason-item">
                <span className="reason-icon">{i === 0 && result.riskLevel === 'safe' ? '✓' : '⚠'}</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{marginTop:'1rem'}}>
          <h2>Extension reference</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'0.75rem'}}>
            <div>
              <h3 style={{color:'#f05252',marginBottom:'0.5rem'}}>🔴 Dangerous</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {DANGEROUS_EXTENSIONS.map(e => <span key={e} className="tag" style={{color:'#f05252'}}>{e}</span>)}
              </div>
            </div>
            <div>
              <h3 style={{color:'#f5a623',marginBottom:'0.5rem'}}>🟡 Suspicious</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {SUSPICIOUS_EXTENSIONS.map(e => <span key={e} className="tag" style={{color:'#f5a623'}}>{e}</span>)}
              </div>
            </div>
            <div>
              <h3 style={{color:'#3dd68c',marginBottom:'0.5rem'}}>🟢 Generally safe</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {SAFE_EXTENSIONS.map(e => <span key={e} className="tag" style={{color:'#3dd68c'}}>{e}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
