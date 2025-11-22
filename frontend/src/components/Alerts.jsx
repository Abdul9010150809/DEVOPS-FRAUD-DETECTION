import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved'); // Default to showing actionable items
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRecentAlerts(50);
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setError('Failed to load alerts. Please try again.');
      // Fallback to mock data for demo
      setAlerts([
        { id: 1, type: 'hardcoded_secret', severity: 'critical', message: 'AWS Access Key detected in main.py', repository: 'backend-repo', resolved: false, created_at: Date.now()/1000 },
        { id: 2, type: 'suspicious_ip', severity: 'high', message: 'Login from unknown IP (Russia)', repository: 'auth-service', resolved: false, created_at: Date.now()/1000 - 3600 },
        { id: 3, type: 'dependency_vuln', severity: 'medium', message: 'Lodash version vulnerable', repository: 'frontend-repo', resolved: true, created_at: Date.now()/1000 - 8000 },
        { id: 4, type: 'policy_violation', severity: 'low', message: 'Commit message too short', repository: 'utils', resolved: false, created_at: Date.now()/1000 - 12000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resolveAlert = async (alertId) => {
    // Optimistic Update: Update UI immediately for better UX
    const originalAlerts = [...alerts];
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));

    try {
      // Call actual API to resolve alert
      await apiClient.resolveAlert(alertId);
      console.log(`Alert ${alertId} resolved successfully.`);

      // Refresh alerts after a short delay to ensure backend is updated
      setTimeout(() => {
        fetchAlerts();
      }, 500);

    } catch (error) {
      // Revert if failed
      console.error('Resolution failed', error);
      setAlerts(originalAlerts);
      alert("Failed to resolve alert. Please try again.");
    }
  };

  // Memoize filtered list
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filter === 'all') return true;
      if (filter === 'unresolved') return !alert.resolved;
      if (filter === 'resolved') return alert.resolved;
      return alert.severity === filter;
    });
  }, [alerts, filter]);

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', icon: '🚨' },
      high: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', icon: '⚠️' },
      medium: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', icon: '🔔' },
      low: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', icon: 'ℹ️' }
    };
    const style = colors[severity] || colors.low;
    
    return (
      <span style={{ 
        backgroundColor: style.bg, color: style.text, 
        padding: '4px 8px', borderRadius: '4px', 
        fontSize: '0.75rem', fontWeight: 'bold',
        display: 'flex', alignItems: 'center', gap: '5px', width: 'fit-content'
      }}>
        {style.icon} {severity.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="card alerts-page" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div className="alerts-header header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #334155'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem'
          }}>
            🚨 Security Alerts
          </h2>
          <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }}></span>
            {filteredAlerts.length} {filter === 'unresolved' ? 'active' : ''} alerts
          </small>
        </div>
        <div className="filter-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: alerts.length },
            { key: 'unresolved', label: 'Active', count: alerts.filter(a => !a.resolved).length },
            { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
            { key: 'high', label: 'High', count: alerts.filter(a => a.severity === 'high').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #334155',
                background: filter === f.key ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: filter === f.key ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {f.label}
              <span style={{
                background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '0.8rem'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Loading threat intelligence...</div>
        ) : filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: '8px' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p>No alerts found for this filter.</p>
            {error && (
              <small style={{ color: '#94a3b8', display: 'block', marginTop: '10px' }}>
                Showing demo data - backend connection issue
              </small>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} style={{
              background: alert.resolved ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              padding: '20px',
              borderRadius: '12px',
              borderLeft: `4px solid ${alert.resolved ? '#22c55e' : getSeverityBadge(alert.severity).props.style.background.split(',')[0].replace('rgba(', '').replace(',', '')}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              opacity: alert.resolved && filter !== 'resolved' ? 0.7 : 1,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {getSeverityBadge(alert.severity)}
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>
                    {new Date(alert.created_at * 1000).toLocaleString()}
                  </span>
                  {alert.resolved && (
                    <span style={{
                      background: '#22c55e',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      ✓ RESOLVED
                    </span>
                  )}
                </div>

                <div style={{
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  marginBottom: '8px',
                  color: '#f1f5f9',
                  lineHeight: '1.4'
                }}>
                  {alert.message}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📁 <strong>{alert.repository || 'Unknown'}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🏷️ {alert.type.replace('_', ' ')}
                  </span>
                  {alert.commit_id && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
                      🔗 {alert.commit_id.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>

              {!alert.resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✅ Resolve
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;