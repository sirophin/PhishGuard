export default function Awareness() {
  const sections = [
    { title:'What is phishing?', icon:'🎣',
      content:'Phishing is a social engineering attack where an attacker impersonates a trusted entity to steal credentials, financial data, or install malware. Attacks arrive via email, SMS (smishing), voice calls (vishing), or fake websites.',
      items:null },
    { title:'Common phishing techniques', icon:'⚙️', content:null, items:[
      'Email phishing — mass emails mimicking trusted brands like banks or PayPal',
      'Spear phishing — targeted attacks researched specifically for one individual',
      'Clone phishing — duplicating a real email and replacing links with malicious ones',
      'Whaling — targeting executives (CEO, CFO) for high-value access',
      'Smishing — phishing delivered via SMS text messages',
      'Vishing — voice calls impersonating bank fraud teams or IT support',
      'QR phishing — malicious QR codes printed on posters or in emails'
    ]},
    { title:'Red flags in emails', icon:'🚩', content:null, items:[
      'Urgent or threatening language — "Your account will be closed in 24 hours"',
      'Generic greetings — "Dear Customer" instead of your actual name',
      'Mismatched sender domain — support@paypa1.com instead of paypal.com',
      'Unexpected attachments especially .exe, .docm, .zip, .iso files',
      'Links where the visible text differs from the actual destination URL',
      'Poor spelling, grammar, or awkward phrasing',
      'Requests for passwords, OTPs, or payment card details by email'
    ]},
    { title:'How to check a suspicious URL', icon:'🔗', content:null, items:[
      'Hover over the link to see the real URL in your browser status bar',
      'Check for HTTPS and verify the domain is spelled correctly',
      'Look for hyphens: paypal-login.com is NOT paypal.com',
      'Watch for character substitutions: paypa1.com, arnazon.com',
      'Use the PhishGuard URL Scanner on this platform',
      'If unsure, navigate directly to the official website instead of clicking'
    ]},
    { title:'Safe browsing practices', icon:'🛡️', content:null, items:[
      'Enable two-factor authentication (2FA) on all important accounts',
      'Use a password manager — never reuse passwords across sites',
      'Keep your browser, OS, and antivirus updated',
      'Use bookmarks for important sites — never search for bank login pages',
      'Check the URL bar before entering any credentials',
      'Never enter passwords on HTTP (non-HTTPS) websites',
      'Be suspicious of any unexpected "free gift" or lottery winner email'
    ]},
    { title:'What to do if you clicked a phishing link', icon:'🚨', content:null, items:[
      '1. Disconnect from the internet immediately',
      '2. Change your password for the affected account from a different device',
      '3. Enable 2FA if you have not already',
      '4. Check for unauthorized logins or transactions',
      '5. Run a full antivirus scan on your device',
      '6. Report the phishing email to your IT team or email provider',
      '7. If banking details were entered, contact your bank immediately'
    ]}
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Security Awareness</h1>
          <p>Learn to identify and avoid phishing attacks</p>
        </div>
      </div>
      <div className="page-body">
        <div className="awareness-grid">
          {sections.map((s, i) => (
            <div key={i} className="card">
              <h2>{s.icon} {s.title}</h2>
              {s.content && <p style={{color:'var(--text-secondary)',lineHeight:'1.7',fontSize:'0.875rem'}}>{s.content}</p>}
              {s.items && s.items.map((item, j) => (
                <div key={j} className="tip-item">
                  <div className="tip-dot"></div>
                  <span style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
