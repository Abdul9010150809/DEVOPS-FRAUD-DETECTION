import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import PipelineMonitor from './components/PipelineMonitor';
import RiskGraph from './components/RiskGraph';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_analyses: 0,
    high_risk_analyses: 0,
    active_alerts: 0,
    average_risk_score: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Fetch initial stats
    fetchStats();

    // Set up periodic updates
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/fraud/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        setLastUpdate(new Date());
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsOnline(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} onStatsUpdate={fetchStats} />;
      case 'alerts':
        return <Alerts />;
      case 'pipelines':
        return <PipelineMonitor />;
      case 'risk':
        return <RiskGraph />;
      default:
        return <Dashboard stats={stats} onStatsUpdate={fetchStats} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.svg" alt="DevOps Fraud Shield" className="logo-icon" />
            <div className="logo-text">
              <h1>DevOps Fraud Shield</h1>
              <div className="status-indicator">
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                <span className="status-text">
                  {isOnline ? 'System Online' : 'Backend Offline'}
                </span>
                <span className="last-update">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <nav className="main-nav">
            <button
              className={activeTab === 'dashboard' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button
              className={activeTab === 'alerts' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveTab('alerts')}
            >
              <span className="nav-icon">🚨</span>
              Alerts
              {stats.active_alerts > 0 && (
                <span className="alert-badge">{stats.active_alerts}</span>
              )}
            </button>
            <button
              className={activeTab === 'pipelines' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveTab('pipelines')}
            >
              <span className="nav-icon">🔧</span>
              Pipelines
            </button>
            <button
              className={activeTab === 'risk' ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveTab('risk')}
            >
              <span className="nav-icon">📈</span>
              Risk Analysis
            </button>
            <button
              className="nav-button refresh-btn"
              onClick={fetchStats}
              title="Refresh Data"
            >
              <span className="nav-icon">🔄</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 DevOps Fraud Shield. Monitoring CI/CD pipelines for security threats.</p>
      </footer>
    </div>
  );
}

export default App;