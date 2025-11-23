import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';

// --- STYLES & HELPERS ---
const styles = {
  glassContainer: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    minHeight: '80vh'
  },
  headerText: {
    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '2rem',
    fontWeight: '800'
  },
  severityBadge: (severity) => {
    const map = {
      critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '#ef4444' },
      high:     { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', border: '#f97316' },
      medium:   { bg: 'rgba(234, 179, 8, 0.15)',  color: '#eab308', border: '#eab308' },
      low:      { bg: 'rgba(34, 197, 94, 0.15)',  color: '#22c55e', border: '#22c55e' }
    };
    const s = map[severity] || map.low;
    return {
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center', gap: '6px'
    };
  }
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const Alerts = () => {
  // --- STATE ---
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null); // Track which specific alert is resolving
  const [filter, setFilter] = useState('unresolved'); 

  // --- API CALLS ---
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getRecentAlerts(50);
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      // Fallback Data for Demo
      setAlerts([
        { id: 101, type: 'hardcoded_secret', severity: 'critical', message: 'AWS Access Key detected in config.py', repository: 'backend-core', resolved: false, created_at: Date.now() / 1000 - 120 },
        { id: 102, type: 'suspicious_ip', severity: 'high', message: 'Login attempt from unnusal IP (Russia)', repository: 'auth-service', resolved: false, created_at: Date.now() / 1000 - 3600 },
        { id: 103, type: 'dependency_vuln', severity: 'medium', message: 'Lodash v4.17 vulnerable to prototype pollution', repository: 'frontend-dash', resolved: true, created_at: Date.now() / 1000 - 8000 },
        { id: 104, type: 'policy_violation', severity: 'low', message: 'Commit message "fix" is too short', repository: 'utils-lib', resolved: false, created_at: Date.now() / 1000 - 15000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // --- ACTIONS ---
  const handleResolve = async (alertId) => {
    setResolvingId(alertId); // Show loading state on button
    
    // Optimistic UI Update
    setTimeout(async () => {
      try {
        await apiClient.resolveAlert(alertId);
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
      } catch (e) {
        alert("Failed to resolve alert.");
      } finally {
        setResolvingId(null);
      }
    }, 600); // Fake small delay for UX "feeling"
  };

  // --- FILTERING ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filter === 'all') return true;
      if (filter === 'unresolved') return !alert.resolved;
      if (filter === 'resolved') return alert.resolved;
      return alert.severity === filter;
    });
  }, [alerts, filter]);

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={styles.glassContainer}>
        
        {/* === HEADER === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
          <div>
            <h2 style={{ ...styles.headerText, margin: 0 }}>🚨 Threat Intelligence</h2>
            <p style={{ color: '#94a3b8', margin: '8px 0 0 0' }}>Real-time security events and vulnerability scanning.</p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
              {alerts.filter(a => !a.resolved).length}
            </div>
            <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Threats</div>
          </div>
        </div>

        {/* === FILTERS === */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
          {[
            { id: 'unresolved', label: '⚡ Active', color: '#3b82f6' },
            { id: 'critical', label: '🚨 Critical', color: '#ef4444' },
            { id: 'high', label: '🔥 High', color: '#f97316' },
            { id: 'all', label: '📋 All History', color: '#64748b' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              style={{
                background: filter === btn.id ? btn.color : 'rgba(30, 41, 59, 0.5)',
                color: 'white',
                border: filter === btn.id ? `1px solid ${btn.color}` : '1px solid rgba(255,255,255,0.1)',
                padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: filter === btn.id ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                boxShadow: filter === btn.id ? `0 0 15px ${btn.color}40` : 'none'
              }}
            >
              {btn.label} <span style={{ opacity: 0.6, fontSize: '0.8em', marginLeft: '4px' }}>
                ({btn.id === 'all' ? alerts.length : alerts.filter(a => btn.id === 'unresolved' ? !a.resolved : a.severity === btn.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* === ALERTS LIST === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Scanning repositories...</div>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed #475569' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</div>
              <h3 style={{ color: 'white', margin: 0 }}>All Clear</h3>
              <p style={{ color: '#64748b' }}>No threats found matching this filter.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} style={{
                background: alert.resolved ? 'rgba(6, 78, 59, 0.4)' : 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderLeft: `4px solid ${alert.resolved ? '#22c55e' : styles.severityBadge(alert.severity).border}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'transform 0.2s',
                opacity: alert.resolved && filter !== 'resolved' ? 0.6 : 1
              }}>
                
                {/* Left Side: Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={styles.severityBadge(alert.severity)}>
                       {alert.severity}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {formatTimeAgo(alert.created_at)}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {alert.repository}</span>
                  </div>
                  
                  <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: '500' }}>
                    {alert.message}
                  </div>
                  
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '15px' }}>
                    <span>Type: {alert.type}</span>
                    {alert.commit_id && <span>Commit: <code style={{ background:'rgba(0,0,0,0.3)', padding:'2px 4px', borderRadius:'4px'}}>{alert.commit_id.substring(0,7)}</code></span>}
                  </div>
                </div>

                {/* Right Side: Action */}
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolvingId === alert.id}
                    style={{
                      background: resolvingId === alert.id ? '#475569' : 'linear-gradient(135deg, #22c55e, #15803d)',
                      color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: '8px',
                      cursor: resolvingId === alert.id ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      minWidth: '100px'
                    }}
                  >
                    {resolvingId === alert.id ? 'Fixing...' : '✅ Resolve'}
                  </button>
                )}
                {alert.resolved && (
                   <span style={{ color: '#22c55e', fontWeight: 'bold', border: '1px solid #22c55e', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
                     RESOLVED
                   </span>
                )}

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;