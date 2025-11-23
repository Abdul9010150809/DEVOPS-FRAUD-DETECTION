import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';

// --- STYLES ---
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
    color: '#e2e8f0',
    minHeight: '100vh'
  },
  header: {
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
  },
  gridHeader: {
    display: 'grid',
    gridTemplateColumns: '80px 1.5fr 1fr 1fr 120px 100px',
    background: '#1e293b',
    padding: '12px 16px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottom: '1px solid #334155',
    color: '#94a3b8',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  row: (severity, resolved, isExpanded) => ({
    display: 'grid',
    gridTemplateColumns: '80px 1.5fr 1fr 1fr 120px 100px',
    padding: '16px',
    alignItems: 'center',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    background: isExpanded ? 'rgba(59, 130, 246, 0.05)' : resolved ? 'rgba(30, 41, 59, 0.3)' : 'transparent',
    opacity: resolved ? 0.5 : 1,
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderLeft: isExpanded ? '4px solid #3b82f6' : '4px solid transparent'
  }),
  severityBadge: (severity) => {
    const map = {
      critical: { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d' },
      high:     { bg: '#431407', color: '#fdba74', border: '#7c2d12' },
      medium:   { bg: '#422006', color: '#fde047', border: '#713f12' },
      low:      { bg: '#064e3b', color: '#6ee7b7', border: '#065f46' }
    };
    const s = map[severity] || map.low;
    return {
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem',
      fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', width: 'fit-content'
    };
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('unresolved');

  // --- DATA SYNC ---
  const fetchAlerts = async () => {
    try {
      // 1. Get IDs of resolved alerts from storage
      const resolvedIDs = JSON.parse(localStorage.getItem('resolvedAlertIDs') || '[]');

      // 2. Fetch API Alerts
      let apiAlerts = [];
      try {
        const res = await apiClient.getRecentAlerts(50);
        apiAlerts = res.alerts || [];
      } catch (e) {
        console.warn("API Error, using fallback");
      }

      // 3. Fetch Simulated Alerts
      const simAlerts = JSON.parse(localStorage.getItem('simulatedAlerts') || '[]');

      // 4. Merge & Filter
      const allAlerts = [...simAlerts, ...apiAlerts].map(a => ({
        ...a,
        // Force 'resolved' if ID is in our local blacklist
        resolved: a.resolved || resolvedIDs.includes(a.id)
      }));

      // Remove duplicates
      const uniqueAlerts = Array.from(new Map(allAlerts.map(item => [item.id, item])).values());
      
      // Sort: Unresolved first, then by date
      uniqueAlerts.sort((a, b) => {
        if (a.resolved === b.resolved) return b.created_at - a.created_at;
        return a.resolved ? 1 : -1;
      });

      setAlerts(uniqueAlerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const handleResolve = (e, alert) => {
    e.stopPropagation(); // Prevent row expand
    if (!window.confirm("Mark this threat as mitigated?")) return;

    // Save ID to "Resolved List" in LocalStorage
    const resolvedIDs = JSON.parse(localStorage.getItem('resolvedAlertIDs') || '[]');
    if (!resolvedIDs.includes(alert.id)) {
      resolvedIDs.push(alert.id);
      localStorage.setItem('resolvedAlertIDs', JSON.stringify(resolvedIDs));
    }

    // Update UI immediately
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, resolved: true } : a));
  };

  const getRemediation = (type) => {
    switch (type) {
      case 'hardcoded_secret':
      case 'suspicious_file_change':
        return {
          action: "Rotate Credentials immediately.",
          cmd: "aws iam update-access-key --access-key-id X --status Inactive",
          desc: "Hardcoded secrets detected in commit history. Revoke keys and use Secrets Manager."
        };
      case 'dependency_vuln':
        return {
          action: "Update Package Version.",
          cmd: "npm audit fix --force",
          desc: "Critical CVE found in dependencies. Upgrade to patched version."
        };
      case 'suspicious_ip':
        return {
          action: "Block IP Address.",
          cmd: "iptables -A INPUT -s <IP_ADDR> -j DROP",
          desc: "Login attempt from non-allowlisted region."
        };
      default:
        return {
          action: "Investigate Logs.",
          cmd: "kubectl logs -f deployment/backend",
          desc: "Anomaly detected. Manual investigation required."
        };
    }
  };

  // --- RENDER ---
  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'unresolved') return alerts.filter(a => !a.resolved);
    return alerts.filter(a => a.severity === filter && !a.resolved);
  }, [alerts, filter]);

  const stats = {
    total: alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc' }}>🛡️ Threat Response Console</h2>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Environment: <span style={{ color: '#22c55e' }}>PRODUCTION</span> • Region: <span style={{ color: '#3b82f6' }}>us-east-1</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'center', background: '#334155', padding: '8px 16px', borderRadius: '6px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>ACTIVE ISSUES</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.critical}</div>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>CRITICAL</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        {['unresolved', 'critical', 'high', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#3b82f6' : 'transparent',
              border: filter === f ? '1px solid #3b82f6' : '1px solid #475569',
              color: filter === f ? 'white' : '#94a3b8',
              padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={styles.gridHeader}>
          <span>Severity</span>
          <span>Alert Type</span>
          <span>Affected Asset</span>
          <span>Time Detected</span>
          <span>Status</span>
          <span style={{textAlign:'right'}}>Action</span>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>System Secure. No active threats.</div>
          ) : (
            filtered.map(alert => {
              const remediation = getRemediation(alert.type);
              const isExpanded = expandedId === alert.id;

              return (
                <div key={alert.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  {/* MAIN ROW */}
                  <div 
                    style={styles.row(alert.severity, alert.resolved, isExpanded)}
                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  >
                    <div style={styles.severityBadge(alert.severity)}>{alert.severity}</div>
                    
                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{alert.type}</div>
                    
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                      📁 {alert.repository || 'backend-api'}
                    </div>
                    
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {new Date(alert.created_at * 1000).toLocaleTimeString()}
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: alert.resolved ? '#22c55e' : '#f59e0b' }}>
                      {alert.resolved ? 'MITIGATED' : 'OPEN'}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {!alert.resolved && (
                        <button 
                          onClick={(e) => handleResolve(e, alert)}
                          style={{
                            background: '#22c55e', color: '#0f172a', border: 'none',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer'
                          }}
                        >
                          RESOLVE
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDED DETAILS (REMEDIATION) */}
                  {isExpanded && (
                    <div style={{ padding: '20px', background: '#020617', borderTop: '1px dashed #334155' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <h4 style={{ color: '#94a3b8', marginTop: 0 }}>📋 Incident Details</h4>
                          <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{alert.message}</p>
                          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                            <div><strong>Commit ID:</strong> {alert.commit_id || 'N/A'}</div>
                            <div><strong>Author:</strong> unknown_user</div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ color: '#f59e0b', marginTop: 0 }}>🛠️ Suggested Remediation</h4>
                          <div style={{ background: '#1e293b', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #334155' }}>
                            <div style={{ color: '#22c55e', marginBottom: '5px' }}># {remediation.action}</div>
                            <div style={{ color: '#e2e8f0' }}>$ {remediation.cmd}</div>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
                            {remediation.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;