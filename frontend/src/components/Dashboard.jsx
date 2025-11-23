import React, { useState, useEffect, useCallback } from 'react';
import RiskGraph from './RiskGraph';
import fraudController from '../api/fraudController';
import alertsController from '../api/alertsController';
import simulateController from '../api/simulateController';

// --- STYLES (Kept inline for easy copy-paste, ideally move to CSS) ---
const styles = {
  glassCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #00d4aa, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
};

const Dashboard = () => {
  // --- STATE ---
  const [stats, setStats] = useState({
    total_analyses: 0,
    average_risk_score: 0,
    high_risk_analyses: 0,
    active_alerts: 0
  });

  const [graphData, setGraphData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [simulationLog, setSimulationLog] = useState(null); // To show simulation result on screen
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notification, setNotification] = useState(null); // For custom toast messages

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsData = await fraudController.getFraudStats();
      setStats(statsData.data || statsData); // Handle potential structure diffs

      // 2. Fetch Recent Alerts
      const alertsRes = await alertsController.getRecentAlerts(5);
      setRecentAlerts(alertsRes.alerts || []);
      
    } catch (error) {
      console.warn("Using fallback data due to API error:", error);
    } finally {
      // 3. Generate Graph Data (Client-side simulation for demo)
      generateGraphData();
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  const generateGraphData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const baseRisk = Math.max(0.1, Math.min(0.8, 0.3 + Math.sin(i / 5) * 0.2 + (Math.random() - 0.5) * 0.2));
      data.push({
        date: date.toISOString().split("T")[0],
        riskScore: baseRisk,
        analyses: Math.floor(Math.random() * 15) + 3,
        alerts: Math.floor(baseRisk * 8)
      });
    }
    setGraphData(data);
  };

 const handleSimulation = async () => {
    try {
      setNotification({ type: 'info', message: 'Triggering Simulation...' });
      
      const res = await simulateController.simulateFraud();
      
      // FIX: Check if 'res' is the full response OR just the data
      // If res.data exists, use it. Otherwise, assume res IS the data.
      const responseData = res.data || res;

      if (!responseData.fraud_event) {
        throw new Error("Response missing 'fraud_event' data");
      }
      
      // Show result on UI
      setSimulationLog(responseData.fraud_event);
      
      setNotification({ type: 'success', message: '🚨 Fraud Event Detected!' });
      
      // Auto-refresh stats
      fetchDashboardData(); 
      
    } catch (err) {
      console.error("Simulation failed:", err);
      setNotification({ type: 'error', message: 'Simulation Failed. Check Console.' });
    }
  };

  // --- EFFECT ---
  useEffect(() => {
    fetchDashboardData();
    // Auto-clear notification after 3s
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetchDashboardData, notification]);

  // --- HELPERS ---
  const getRiskColor = (score) => {
    if (score >= 0.7) return '#ef4444'; // Red
    if (score >= 0.4) return '#f59e0b'; // Amber
    return '#22c55e'; // Green
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      
      {/* === TOAST NOTIFICATION === */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#22c55e' : '#3b82f6',
          padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          fontWeight: 'bold', animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* === HEADER === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ ...styles.gradientText, fontSize: '2rem', margin: 0 }}>🛡️ Security Command Center</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></span>
            System Operational • Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSimulation} className="btn-hover" style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white',
            border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            ⚡ Simulate Attack
          </button>
          <button onClick={fetchDashboardData} style={{
            background: '#334155', color: 'white', border: '1px solid #475569',
            padding: '12px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '🔄 ...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* === STATS GRID === */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon="📊" title="Total Scans" value={stats.total_analyses.toLocaleString()} color="#3b82f6" />
        <StatCard icon="🛡️" title="Avg Risk Score" value={`${(stats.average_risk_score * 100).toFixed(1)}%`} color={getRiskColor(stats.average_risk_score)} />
        <StatCard icon="🚨" title="High Risk Events" value={stats.high_risk_analyses} color="#ef4444" isAlert={stats.high_risk_analyses > 0} />
        <StatCard icon="🔔" title="Active Alerts" value={stats.active_alerts} color="#f59e0b" />
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* LEFT: GRAPH */}
        <div style={styles.glassCard}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Risk Trend Analysis</h3>
          <div style={{ height: '300px' }}>
            <RiskGraph data={graphData} />
          </div>
        </div>

        {/* RIGHT: ALERTS & LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SIMULATION RESULT BOX */}
          {simulationLog && (
            <div style={{ ...styles.glassCard, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>⚠️ Simulated Attack Detected</h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                <p style={{margin: '4px 0'}}><strong>ID:</strong> {simulationLog.event_id}</p>
                <p style={{margin: '4px 0'}}><strong>Risk:</strong> {simulationLog.risk_score}</p>
                <p style={{margin: '4px 0'}}><strong>Files:</strong> {simulationLog.activity?.changes_detected?.join(', ')}</p>
              </div>
            </div>
          )}

          {/* RECENT ALERTS LIST */}
          <div style={styles.glassCard}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Recent Threats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAlerts.length === 0 ? (
                <p style={{ color: '#64748b' }}>No active threats detected.</p>
              ) : (
                recentAlerts.map((alert, idx) => (
                  <div key={idx} style={{
                    padding: '10px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', borderLeft: `4px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}`
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{alert.type || "Alert"}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{alert.message || "Anomaly detected"}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SIMPLE COMPONENT FOR STAT CARDS ---
const StatCard = ({ icon, title, value, color, isAlert }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.7)',
    border: isAlert ? `1px solid ${color}` : '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: isAlert ? `0 0 15px ${color}40` : 'none'
  }}>
    <div style={{ fontSize: '2rem', background: `${color}20`, borderRadius: '12px', padding: '12px', width: '60px', height: '60px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'white' }}>{value}</h3>
      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>{title}</p>
    </div>
  </div>
);

export default Dashboard;