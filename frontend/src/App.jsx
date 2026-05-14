import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard   from './pages/Dashboard';
import Scanner     from './pages/Scanner';
import Logs        from './pages/Logs';
import Quiz        from './pages/Quiz';
import Awareness   from './pages/Awareness';
import FileChecker from './pages/FileChecker';
import EmailHeader from './pages/EmailHeader';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#181c26', color: '#e8eaf0', border: '1px solid #252a3a' }
      }} />
      <div className="layout">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-text">🛡 PhishGuard</div>
            <div className="sidebar-logo-sub">Security Platform</div>
          </div>

          <div className="sidebar-section">Detection</div>
          <NavLink to="/"            end><span className="sidebar-icon">📊</span> Dashboard</NavLink>
          <NavLink to="/scanner">       <span className="sidebar-icon">🔍</span> URL Scanner</NavLink>
          <NavLink to="/file-checker">  <span className="sidebar-icon">📁</span> File Checker</NavLink>
          <NavLink to="/email-header">  <span className="sidebar-icon">📧</span> Email Header</NavLink>
          <NavLink to="/logs">          <span className="sidebar-icon">📋</span> Scan Logs</NavLink>

          <div className="sidebar-section">Awareness</div>
          <NavLink to="/quiz">          <span className="sidebar-icon">🧠</span> Phishing Quiz</NavLink>
          <NavLink to="/awareness">     <span className="sidebar-icon">📚</span> Learn</NavLink>

          <div className="sidebar-footer">
            PhishGuard v1.0 · Final Year Project
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/scanner"      element={<Scanner />} />
            <Route path="/file-checker" element={<FileChecker />} />
            <Route path="/email-header" element={<EmailHeader />} />
            <Route path="/logs"         element={<Logs />} />
            <Route path="/quiz"         element={<Quiz />} />
            <Route path="/awareness"    element={<Awareness />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
