import React, { useState, useEffect, useCallback } from 'react';
import RiskGraph from '../components/RiskGraph'; // Check path!
import fraudController from '../api/fraudController';
import alertsController from '../api/alertsController';
import simulateController from '../api/simulateController';

const Dashboard = () => {
  // --- STATE ---
  const [stats, setStats] = useState({
    total_analyses: 1240, // Default non-zero for better UI
    average_risk_score: 0.12,
    high_risk_analyses: 0,
    active_alerts: 0
  });

  const [graphData, setGraphData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [simulationLog, setSimulationLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notification, setNotification] = useState(null);

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const statsData = await fraudController.getFraudStats();
      // Only overwrite if API returns valid numbers, else keep defaults
      if(statsData && statsData.total_analyses !== undefined) {
         setStats(statsData.data || statsData);
      }
      
      const alertsRes = await alertsController.getRecentAlerts(5);
      setRecentAlerts(alertsRes.alerts || []);
    } catch (error) {
      console.warn("API Error (Using Fallback):", error);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  // --- SIMULATION HANDLER (DEMO MODE) ---
  const handleSimulation = async () => {
    try {
      setNotification({ type: 'info', message: 'Triggering Simulation...' });

      // 1. Call API
      const res = await simulateController.simulateFraud();
      const responseData = res.data || res; // Handle varying response structures

      if (!responseData.fraud_event) throw new Error("Missing fraud_event data");

      // 2. Update UI Log
      setSimulationLog(responseData.fraud_event);

      // 3. [IMPORTANT] Manually update Stats for the Demo
      // Since backend is stateless, we force the numbers up locally
      setStats(prev => ({
        ...prev,
        active_alerts: prev.active_alerts + 1,
        high_risk_analyses: prev.high_risk_analyses + 1,
        total_analyses: prev.total_analyses + 1,
        average_risk_score: 0.85 // Spike the risk score
      }));

      // 4. Add new alert to the list locally
      const newAlert = {
        id: responseData.fraud_event.event_id,
        type: "simulated_attack",
        severity: "critical",
        message: "Simulated Fraud Event Detected",
        repository: "demo-repo",
        created_at: Date.now() / 1000,
        resolved: false
      };

      const existingSims = JSON.parse(localStorage.getItem('simulatedAlerts') || '[]');
    localStorage.setItem('simulatedAlerts', JSON.stringify([newAlert, ...existingSims]));
    
      setRecentAlerts(prev => [newAlert, ...prev].slice(0, 5));

      setNotification({ type: 'success', message: '🚨 Fraud Event Detected!' });

    } catch (err) {
      console.error("Simulation failed:", err);
      setNotification({ type: 'error', message: 'Simulation Failed. Check Console.' });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetchDashboardData, notification]);

  // --- STYLES ---
  const styles = {
    glassCard: {
      background: 'rgba(30, 41, 59, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex', flexDirection: 'column'
    }
  };

  const getRiskColor = (score) => {
    if (score >= 0.7) return '#ef4444';
    if (score >= 0.4) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div style={{ padding: '2rem', background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#22c55e' : '#3b82f6',
          padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, background: 'linear-gradient(135deg, #00d4aa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem' }}>
            🛡️ Security Command Center
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></span>
            System Operational • Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSimulation} style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
          }}>⚡ Simulate Attack</button>
          <button onClick={fetchDashboardData} style={{
            background: '#334155', color: 'white', border: '1px solid #475569',
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer'
          }}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon="📊" title="Total Scans" value={stats.total_analyses.toLocaleString()} color="#3b82f6" />
        <StatCard icon="🛡️" title="Avg Risk Score" value={`${(stats.average_risk_score * 100).toFixed(1)}%`} color={getRiskColor(stats.average_risk_score)} />
        <StatCard icon="🚨" title="High Risk Events" value={stats.high_risk_analyses} color="#ef4444" isAlert={stats.high_risk_analyses > 0} />
        <StatCard icon="🔔" title="Active Alerts" value={stats.active_alerts} color="#f59e0b" />
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Risk Graph Container */}
        <div style={styles.glassCard}>
          <div style={{ height: '350px' }}> {/* Explicit Height Wrapper */}
            <RiskGraph data={graphData} />
          </div>
        </div>

        {/* Right Sidebar: Logs & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Simulation Output Box */}
          {simulationLog && (
            <div style={{ ...styles.glassCard, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ef4444', display:'flex', alignItems:'center', gap:'8px' }}>
                ⚠️ Attack Detected
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                <div>ID: {simulationLog.event_id}</div>
                <div>Risk: <span style={{color:'#ef4444', fontWeight:'bold'}}>{simulationLog.risk_score}</span></div>
                <div>Files: {simulationLog.activity?.changes_detected?.join(', ')}</div>
              </div>
            </div>
          )}

          {/* Recent Alerts List */}
          <div style={{ ...styles.glassCard, flex: 1 }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Recent Threats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '400px' }}>
              {recentAlerts.length === 0 ? (
                <div style={{ textAlign:'center', color:'#64748b', marginTop:'20px' }}>No active threats.</div>
              ) : (
                recentAlerts.map((alert, idx) => (
                  <div key={idx} style={{
                    padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                    borderLeft: `3px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}`
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f1f5f9' }}>{alert.type}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{alert.message}</div>
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

const StatCard = ({ icon, title, value, color, isAlert }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.6)', border: isAlert ? `1px solid ${color}` : '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: isAlert ? `0 0 15px ${color}40` : 'none'
  }}>
    <div style={{ fontSize: '2rem', background: `${color}20`, borderRadius: '12px', padding: '12px', minWidth: '60px', textAlign: 'center' }}>{icon}</div>
    <div>
      <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: 'white' }}>{value}</h3>
      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>{title}</p>
    </div>
  </div>
);

export default Dashboard;