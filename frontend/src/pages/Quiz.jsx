import { useState } from 'react';

const QUIZ_DATA = [
  { id:'q1', difficulty:'beginner',
    question:'Which of the following is a common sign of a phishing email?',
    options:['Email from your manager asking to review a document',
      'Urgent request to verify your account immediately or it will be closed',
      'A newsletter you subscribed to','An invoice from a regular vendor'],
    correct:1,
    explanation:'Urgency is a classic phishing tactic to bypass critical thinking.' },
  { id:'q2', difficulty:'beginner',
    question:'You get an email from support@paypa1.com. What is suspicious?',
    options:['It asks to reset your password','The domain uses number 1 instead of letter l',
      'It mentions account security','It came from a support team'],
    correct:1,
    explanation:'Homograph attacks replace letters with visually similar numbers. paypa1.com is NOT PayPal.' },
  { id:'q3', difficulty:'intermediate',
    question:'What does URL spoofing involve?',
    options:['Creating a lookalike website at a similar-looking domain','Sending emails with no subject',
      'Using very long email signatures','Attaching large files to emails'],
    correct:0,
    explanation:'URL spoofing creates lookalike domains (e.g. arnazon.com) to deceive victims.' },
  { id:'q4', difficulty:'intermediate',
    question:'Which is a red flag in an email link?',
    options:['Link text matches the actual URL','The URL uses HTTPS',
      'Visible text says PayPal but URL points to a different domain',
      'The link leads to the official domain'],
    correct:2,
    explanation:'Always hover links before clicking. If display text and actual URL differ, it is phishing.' },
  { id:'q5', difficulty:'advanced',
    question:'What is spear phishing?',
    options:['Phishing using fake QR codes',
      'A targeted attack customised for a specific individual or organisation',
      'Bulk phishing sent to random addresses','Phishing targeting only mobile users'],
    correct:1,
    explanation:'Spear phishing is highly targeted — attackers research victims to craft convincing messages.' },
  { id:'q6', difficulty:'advanced',
    question:'An email attachment is named "invoice.pdf.exe". What is happening?',
    options:['Normal double-extension naming','A double extension attack — it is actually an executable disguised as a PDF',
      'A compressed PDF file','A PDF with a backup copy'],
    correct:1,
    explanation:'Double extension attacks hide the real extension. Windows hides known extensions by default, making .pdf.exe look like .pdf.' },
  { id:'q7', difficulty:'beginner',
    question:'What should you do before clicking a link in an unexpected email?',
    options:['Click it to see where it goes','Hover over it to see the real URL in the status bar',
      'Forward it to a friend','Reply to the sender to verify'],
    correct:1,
    explanation:'Hovering reveals the real destination URL without navigating to it. Never click suspicious links.' }
];

export default function Quiz() {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_DATA[current];

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= QUIZ_DATA.length) { setFinished(true); return; }
    setCurrent(c => c + 1); setSelected(null); setSubmitted(false);
  };

  const handleRetry = () => {
    setCurrent(0); setScore(0); setFinished(false); setSubmitted(false); setSelected(null);
  };

  const pct = Math.round((score / QUIZ_DATA.length) * 100);

  if (finished) return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Phishing Quiz</h1><p>Results</p></div>
      </div>
      <div className="page-body">
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}
          </div>
          <h2 style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>Quiz Complete!</h2>
          <div style={{fontSize:'3rem',fontWeight:700,margin:'1rem 0',
            color: pct >= 80 ? '#3dd68c' : pct >= 50 ? '#f5a623' : '#f05252'}}>
            {score}/{QUIZ_DATA.length}
          </div>
          <div style={{width:'200px',margin:'0 auto 1.5rem',height:'8px',
            background:'var(--border)',borderRadius:'4px',overflow:'hidden'}}>
            <div style={{width: pct + '%', height:'100%', borderRadius:'4px',
              background: pct >= 80 ? '#3dd68c' : pct >= 50 ? '#f5a623' : '#f05252'}} />
          </div>
          <p style={{color:'var(--text-secondary)',marginBottom:'2rem'}}>
            {pct >= 80 ? 'Excellent! You have strong phishing awareness.' :
             pct >= 50 ? 'Good effort. Review the Awareness section to improve.' :
             'Keep practising. Visit the Learn page for tips and explanations.'}
          </p>
          <button onClick={handleRetry}>Try again</button>
        </div>
      </div>
    </div>
  );

  const diffColor = { beginner:'#3dd68c', intermediate:'#f5a623', advanced:'#f05252' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Phishing Quiz</h1>
          <p>Test your security awareness</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',fontSize:'0.8rem',color:'var(--text-muted)'}}>
          <span>{current + 1} / {QUIZ_DATA.length}</span>
          <div style={{width:'100px',height:'4px',background:'var(--border)',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{width: ((current+1)/QUIZ_DATA.length*100) + '%',height:'100%',
              background:'var(--accent)',borderRadius:'2px',transition:'width 0.3s'}} />
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="flex-between mb-md">
            <span style={{fontSize:'0.72rem',fontWeight:600,textTransform:'uppercase',
              letterSpacing:'0.5px',color: diffColor[q.difficulty]}}>
              {q.difficulty}
            </span>
            <span className="text-muted text-sm">Score: {score}</span>
          </div>

          <p style={{fontSize:'1rem',fontWeight:500,lineHeight:'1.6',marginBottom:'1.5rem'}}>
            {q.question}
          </p>

          {q.options.map((opt, i) => (
            <button key={i}
              className={"quiz-option" +
                (selected === i && !submitted ? " selected" : "") +
                (submitted && i === q.correct ? " correct" : "") +
                (submitted && selected === i && i !== q.correct ? " wrong" : "")}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}>
              <span style={{marginRight:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>
                {String.fromCharCode(65+i)}.
              </span>
              {opt}
            </button>
          ))}

          {submitted && (
            <div className={"explanation " + (selected === q.correct ? "correct" : "wrong")}>
              <strong>{selected === q.correct ? '✓ Correct!' : '✗ Incorrect'}</strong>
              <p style={{marginTop:'0.4rem'}}>{q.explanation}</p>
            </div>
          )}

          <div style={{marginTop:'1rem',display:'flex',justifyContent:'flex-end'}}>
            {!submitted
              ? <button onClick={handleSubmit} disabled={selected === null}>Submit answer</button>
              : <button onClick={handleNext}>
                  {current + 1 >= QUIZ_DATA.length ? 'See results' : 'Next →'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
