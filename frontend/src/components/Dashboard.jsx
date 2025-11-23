import React, { useState, useEffect, useCallback } from 'react';
import RiskGraph from './RiskGraph';

import fraudController from '../api/fraudController';
import alertsController from '../api/alertsController';
import simulateController from '../api/simulateController';   // ✅ NEW IMPORT

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_analyses: 0,
    average_risk_score: 0,
    high_risk_analyses: 0,
    active_alerts: 0
  });

  const [graphData, setGraphData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ⭐ NEW: Simulate Fraud Event
  const handleSimulation = async () => {
    try {
      const res = await simulateController.simulateFraud();
      console.log("Simulated Fraud Event:", res.data);

      alert("⚡ Fraud Simulation Triggered!\nCheck console for full event details.");
    } catch (err) {
      console.error("Simulation failed:", err);
      alert("Simulation failed. Check console.");
    }
  };

  // ⭐ Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    // 1. Fetch stats
    try {
      const statsData = await fraudController.getFraudStats();
      setStats(statsData.data);
    } catch (error) {
      console.warn("Using fallback stats", error);
      setStats({
        total_analyses: 0,
        average_risk_score: 0,
        high_risk_analyses: 0,
        active_alerts: 0
      });
    }

    // 2. Generate synthetic graph data
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const baseRisk = Math.max(
        0.1,
        Math.min(0.8, 0.3 + Math.sin(i / 5) * 0.2 + (Math.random() - 0.5) * 0.2)
      );

      data.push({
        date: date.toISOString().split("T")[0],
        riskScore: baseRisk,
        analyses: Math.floor(Math.random() * 15) + 3,
        alerts: Math.floor(baseRisk * 8)
      });
    }

    setGraphData(data);

    // 3. Fetch recent alerts
    try {
      const alertsData = await alertsController.getRecentAlerts(5);
      setRecentAlerts(alertsData.alerts || []);
    } catch (error) {
      console.warn("Failed fetching alerts", error);

      setRecentAlerts([
        {
          id: 1,
          type: "secret_leak",
          severity: "critical",
          message: "AWS Key detected",
          created_at: Date.now() / 1000 - 300
        },
        {
          id: 2,
          type: "anomaly",
          severity: "medium",
          message: "Unusual commit time",
          created_at: Date.now() / 1000 - 3600
        }
      ]);
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Call on load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Risk Color Helper
  const getRiskColor = (score) => {
    if (score >= 0.7) return '#ef4444';
    if (score >= 0.4) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="dashboard container">

      {/* ===== HEADER ===== */}
      <div className="dashboard-header header">
        <div>
          <h2 style={{
            margin: 0,
            background: 'linear-gradient(135deg, #00d4aa, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🛡️ Security Command Center
          </h2>

          <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#00d4aa',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></span>

            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--'}
          </small>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          <button
            onClick={handleSimulation}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}
          >
            ⚡ Simulate Fraud
          </button>

          <button
            className="btn-primary"
            onClick={fetchDashboardData}
            disabled={loading}
            style={{
              background: loading ? '#374151'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="stats-grid dashboard-grid">
        {/* TOTAL ANALYSES */}
        <div className="card stat-card" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '12px',
            padding: '12px'
          }}>📊</div>

          <div>
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stats.total_analyses.toLocaleString()}
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Total Scans</p>
          </div>
        </div>

        {/* AVERAGE RISK */}
        <div className="card stat-card" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '2.5rem',
            background: `linear-gradient(135deg, ${getRiskColor(stats.average_risk_score)}, ${getRiskColor(stats.average_risk_score)}dd)`,
            borderRadius: '12px',
            padding: '12px'
          }}>🛡️</div>

          <div>
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              margin: 0,
              color: getRiskColor(stats.average_risk_score)
            }}>
              {(stats.average_risk_score * 100).toFixed(1)}%
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Avg Risk Score</p>
          </div>
        </div>

        {/* HIGH RISK EVENTS */}
        <div className="card stat-card" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '2.5rem',
            background: stats.high_risk_analyses > 0
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '12px',
            padding: '12px'
          }}>🚨</div>

          <div>
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              margin: 0,
              color: stats.high_risk_analyses > 0 ? '#ef4444' : '#22c55e'
            }}>
              {stats.high_risk_analyses}
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>High Risk Events</p>
          </div>
        </div>

        {/* ACTIVE ALERTS */}
        <div className="card stat-card" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '2.5rem',
            background: stats.active_alerts > 0
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            borderRadius: '12px',
            padding: '12px'
          }}>🔔</div>

          <div>
            <h3 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              margin: 0,
              color: stats.active_alerts > 0 ? '#f59e0b' : '#94a3b8'
            }}>
              {stats.active_alerts}
            </h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>Active Alerts</p>
          </div>
        </div>
      </div>

      {/* ===== GRAPH SECTION ===== */}
      <div className="dashboard-content dashboard-grid" style={{ marginTop: '20px' }}>
        <div className="chart-section" style={{ gridColumn: 'span 2' }}>
          <RiskGraph data={graphData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
