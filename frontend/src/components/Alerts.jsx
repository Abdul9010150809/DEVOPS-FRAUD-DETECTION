import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';

// --- STYLES ---
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace', // Tech font
    color: '#e2e8f0'
  },
  header: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(12px)'
  },
  tableContainer: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)'
  },
  tableHeader: {
    background: '#1e293b',
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr',
    fontWeight: '600',
    color: '#94a3b8',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  row: (severity, resolved) => ({
    display: 'grid',
    gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr',
    padding: '16px',
    alignItems: 'center',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    background: resolved ? 'rgba(30, 41, 59, 0.3)' : 'transparent',
    opacity: resolved ? 0.6 : 1,
    transition: 'all 0.2s'
  }),
  badge: (severity) => {
    const colors = {
      critical: { bg: '#450a0a', text: '#fca5a5', border: '#7f1d1d' },
      high:     { bg: '#431407', text: '#fdba74', border: '#7c2d12' },
      medium:   { bg: '#422006', text: '#fde047', border: '#713f12' },
      low:      { bg: '#064e3b', text: '#6ee7b7', border: '#065f46' }
    };
    const c = colors[severity] || colors.low;
    return {
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
      fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', width: 'fit-content'
    };
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [filter, setFilter] = useState('unresolved');

  // --- DATA FETCHING ---
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Alerts from API
      const apiRes = await apiClient.getRecentAlerts(50);
      let combinedAlerts = apiRes.alerts || [];

      // 2. Fetch Simulated Alerts from LocalStorage (Fixing the count issue)
      const simulated = JSON.parse(localStorage.getItem('simulatedAlerts') || '[]');
      
      // Merge: Avoid duplicates if ID conflicts
      const apiIds = new Set(combinedAlerts.map(a => a.id));
      const uniqueSimulated = simulated.filter(s => !apiIds.has(s.id));
      
      combinedAlerts = [...uniqueSimulated, ...combinedAlerts];

      // Sort by newest first
      combinedAlerts.sort((a, b) => b.created_at - a.created_at);

      setAlerts(combinedAlerts);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 5s to check for new simulations
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id, isSimulated) => {
    setResolvingId(id);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));

    // Update Local State
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    
    // If it was a simulation, update localStorage too so it stays resolved on refresh
    if (isSimulated) {
      const sims = JSON.parse(localStorage.getItem('simulatedAlerts') || '[]');
      const updatedSims = sims.map(s => s.id === id ? { ...s, resolved: true } : s);
      localStorage.setItem('simulatedAlerts', JSON.stringify(updatedSims));
    }

    setResolvingId(null);
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filter === 'all') return true;
      if (filter === 'unresolved') return !a.resolved;
      return a.severity === filter;
    });
  }, [alerts, filter]);

  const stats = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    high: alerts.filter(a => a.severity === 'high' && !a.resolved).length,
    total: alerts.filter(a => !a.resolved).length
  }), [alerts]);

  return (
    <div style={styles.container}>
      
      {/* === TOP METRICS HEADER === */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#f8fafc' }}>🛡️ Incident Response Console</h2>
          <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Vulnerability Management & Threat Detection
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <MetricBox label="Active Threats" value={stats.total} color="#f8fafc" />
          <MetricBox label="Critical" value={stats.critical} color="#ef4444" glow />
          <MetricBox label="High Priority" value={stats.high} color="#f97316" />
        </div>
      </div>

      {/* === FILTER BAR === */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['unresolved', 'critical', 'high', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#3b82f6' : 'rgba(30, 41, 59, 0.5)',
              color: 'white',
              border: filter === f ? '1px solid #60a5fa' : '1px solid #334155',
              padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
              textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            {f} {f === 'unresolved' && `(${stats.total})`}
          </button>
        ))}
        
        <button onClick={fetchAlerts} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Sync
        </button>
      </div>

      {/* === ALERTS TABLE === */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span>Severity</span>
          <span>Detection / Message</span>
          <span>Source / Repository</span>
          <span>Time Detected</span>
          <span style={{textAlign: 'right'}}>Action</span>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No alerts matching current filters.</div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} style={styles.row(alert.severity, alert.resolved)}>
                
                {/* 1. Badge */}
                <div>
                  <div style={styles.badge(alert.severity)}>
                    {alert.severity}
                  </div>
                </div>

                {/* 2. Message */}
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: '600' }}>{alert.type}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                    {alert.message}
                  </div>
                </div>

                {/* 3. Source */}
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    📁 {alert.repository || 'System'}
                  </div>
                  {alert.commit_id && (
                    <code style={{ background:'rgba(0,0,0,0.3)', padding:'2px 4px', borderRadius:'4px', fontSize:'0.75rem', marginTop:'4px', display:'inline-block' }}>
                      Commit: {alert.commit_id.substring(0,7)}
                    </code>
                  )}
                </div>

                {/* 4. Time */}
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {formatTime(alert.created_at)}
                </div>

                {/* 5. Action */}
                <div style={{ textAlign: 'right' }}>
                  {alert.resolved ? (
                    <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ MITIGATED</span>
                  ) : (
                    <button
                      onClick={() => handleResolve(alert.id, alert.isSimulation)}
                      disabled={resolvingId === alert.id}
                      style={{
                        background: resolvingId === alert.id ? '#475569' : '#22c55e',
                        border: 'none', color: '#000',
                        padding: '6px 16px', borderRadius: '4px',
                        cursor: resolvingId === alert.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold', fontSize: '0.8rem',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      {resolvingId === alert.id ? '...' : 'RESOLVE'}
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---
const MetricBox = ({ label, value, color, glow }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      fontSize: '1.8rem', fontWeight: 'bold', color: color,
      textShadow: glow ? `0 0 10px ${color}` : 'none'
    }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
  </div>
);

const formatTime = (ts) => {
  const date = new Date(ts * 1000);
  const now = new Date();
  const diff = (now - date) / 1000; // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

export default Alerts;