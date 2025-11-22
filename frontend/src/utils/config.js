// Frontend configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  APP_NAME: 'DevOps Fraud Shield',
  VERSION: '1.0.0',

  // UI settings
  THEME: 'dark',
  REFRESH_INTERVAL: 30000, // 30 seconds
  ALERT_POLL_INTERVAL: 60000, // 1 minute

  // Chart settings
  CHART_COLORS: {
    primary: '#ff4444',
    secondary: '#44aa88',
    warning: '#ffaa44',
    info: '#4488ff'
  },

  // Risk thresholds
  RISK_THRESHOLDS: {
    low: 0.4,
    medium: 0.7,
    high: 0.9
  }
};

export default config;