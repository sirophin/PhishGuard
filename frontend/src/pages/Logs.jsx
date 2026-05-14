import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Logs() {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter) params.riskLevel = filter;
    axios.get('/logs', { params })
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); })
      .catch(e => { console.error(e); toast.error('Failed to load logs'); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchLogs, [page, filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this log?')) return;
    await axios.delete('/logs/' + id);
    toast.success('Log deleted');
    fetchLogs();
  };

  const handleExport = () => {
    window.open('/api/logs/export/csv', '_blank');
    toast.success('CSV export started');
  };

  const riskColor = { safe: '#3dd68c', suspicious: '#f5a623', dangerous: '#f05252' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Scan Logs</h1>
          <p>{total} total records</p>
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
            style={{width:'auto',padding:'0.5rem 0.875rem'}}>
            <option value="">All levels</option>
            <option value="safe">Safe only</option>
            <option value="suspicious">Suspicious only</option>
            <option value="dangerous">Dangerous only</option>
          </select>
          <button onClick={handleExport} className="btn-ghost btn-sm">⬇ Export CSV</button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'2rem'}}>
              <div className="loader"></div>
              <span className="text-muted">Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📋</div>
              No scan logs found. Scan some URLs to see results here.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>URL</th><th>Risk</th><th>Score</th>
                    <th>Reasons</th><th>Source</th><th>Time</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td className="td-url" title={log.url}>{log.url}</td>
                      <td><span className={"badge badge-" + log.riskLevel}>{log.riskLevel}</span></td>
                      <td>
                        <span style={{fontWeight:700, color: riskColor[log.riskLevel] || '#888'}}>
                          {log.riskScore}
                        </span>
                      </td>
                      <td style={{maxWidth:'200px',fontSize:'0.75rem',color:'var(--text-secondary)'}}>
                        {(log.reasons || []).slice(0,2).join(' · ')}
                        {log.reasons && log.reasons.length > 2 && ' ...'}
                      </td>
                      <td><span className="tag">{log.source || 'dashboard'}</span></td>
                      <td className="text-muted text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(log._id)}
                          className="btn-ghost btn-sm" style={{padding:'0.3rem 0.6rem',color:'var(--dangerous)'}}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex-between" style={{marginTop:'1rem',paddingTop:'0.75rem',
            borderTop:'1px solid var(--border)',fontSize:'0.8rem',color:'var(--text-muted)'}}>
            <span>Showing {logs.length} of {total}</span>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="btn-ghost btn-sm">← Prev</button>
              <span style={{padding:'0 0.5rem'}}>Page {page}</span>
              <button onClick={() => setPage(p => p+1)} disabled={logs.length < 20}
                className="btn-ghost btn-sm">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
