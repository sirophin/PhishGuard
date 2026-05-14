import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/scan/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Dashboard</h1><p>Threat overview</p></div>
      </div>
      <div className="page-body" style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <div className="loader"></div> <span className="text-muted">Loading stats...</span>
      </div>
    </div>
  );

  if (!stats) return <div className="page-body"><p className="error-msg">Failed to load stats.</p></div>;

  const barData = [
    { name: 'Safe',       value: stats.safe,       fill: '#3dd68c' },
    { name: 'Suspicious', value: stats.suspicious,  fill: '#f5a623' },
    { name: 'Dangerous',  value: stats.dangerous,   fill: '#f05252' }
  ];

  const pieData = [
    { name: 'Safe',       value: stats.safe || 1,       fill: '#3dd68c' },
    { name: 'Suspicious', value: stats.suspicious || 0,  fill: '#f5a623' },
    { name: 'Dangerous',  value: stats.dangerous || 0,   fill: '#f05252' }
  ];

  const phishRate = stats.total > 0
    ? Math.round((stats.dangerous / stats.total) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Real-time threat overview</p>
        </div>
        <div className="header-badge">
          <span className="live-dot"></span>
          System active
        </div>
      </div>

      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total scanned</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Safe</div>
            <div className="stat-value" style={{color:'#3dd68c'}}>{stats.safe}</div>
            <div className="stat-sub">No threats</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Suspicious</div>
            <div className="stat-value" style={{color:'#f5a623'}}>{stats.suspicious}</div>
            <div className="stat-sub">Needs review</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Dangerous</div>
            <div className="stat-value" style={{color:'#f05252'}}>{stats.dangerous}</div>
            <div className="stat-sub">Blocked</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Phish rate</div>
            <div className="stat-value" style={{color: phishRate > 20 ? '#f05252' : '#f5a623'}}>{phishRate}%</div>
            <div className="stat-sub">Of total scans</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
          <div className="card">
            <h2>Threat distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{top:5,right:5,left:-20,bottom:5}}>
                <XAxis dataKey="name" stroke="#555f70" fontSize={12} />
                <YAxis stroke="#555f70" fontSize={12} />
                <Tooltip contentStyle={{background:'#181c26',border:'1px solid #252a3a',borderRadius:'8px',fontSize:'12px'}} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {barData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2>Risk breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                     paddingAngle={3} dataKey="value">
                  {pieData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#181c26',border:'1px solid #252a3a',borderRadius:'8px',fontSize:'12px'}} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-md">
            <h2 style={{margin:0}}>Recent detections</h2>
            <a href="/logs" style={{fontSize:'0.8rem',color:'var(--accent)',textDecoration:'none'}}>View all →</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>URL</th><th>Risk</th><th>Score</th><th>Source</th><th>Time</th></tr>
              </thead>
              <tbody>
                {(stats.recent || []).map(log => (
                  <tr key={log._id}>
                    <td className="td-url" title={log.url}>{log.url}</td>
                    <td><span className={"badge badge-" + log.riskLevel}>{log.riskLevel}</span></td>
                    <td style={{fontWeight:600}}>{log.riskScore}</td>
                    <td><span className="tag">{log.source || 'dashboard'}</span></td>
                    <td className="text-muted text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {(!stats.recent || stats.recent.length === 0) && (
                  <tr><td colSpan="5" style={{textAlign:'center',color:'var(--text-muted)',padding:'2rem'}}>
                    No scans yet. Try scanning a URL.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
