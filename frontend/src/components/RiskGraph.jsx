import React, { useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Area, AreaChart
} from 'recharts';

// --- STYLES ---
const styles = {
  glassContainer: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  headerText: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', // Amber to Red
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0
  }
};

const RiskGraph = ({ data }) => {
  const [chartType, setChartType] = useState('area');

  // --- DATA PROCESSING ---
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;

    // Fallback Mock Data
    const mockData = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const baseRisk = 0.3 + Math.sin(i / 5) * 0.2; // Sine wave pattern
      const finalRisk = Math.min(1, Math.max(0, baseRisk + (Math.random() - 0.5) * 0.3));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        riskScore: Number(finalRisk.toFixed(2)),
        analyses: Math.floor(Math.random() * 20) + 5,
        alerts: Math.floor(finalRisk * 10)
      });
    }
    return mockData;
  }, [data]);

  // Summary Stats Calculation
  const summary = useMemo(() => {
    if (!chartData.length) return { avg: 0, peak: 0, alerts: 0, highRisk: 0 };
    return {
      avg: (chartData.reduce((sum, item) => sum + item.riskScore, 0) / chartData.length * 100).toFixed(1),
      peak: (Math.max(...chartData.map(item => item.riskScore)) * 100).toFixed(1),
      alerts: chartData.reduce((sum, item) => sum + item.alerts, 0),
      highRisk: chartData.filter(item => item.riskScore > 0.7).length
    };
  }, [chartData]);

  // --- CUSTOM TOOLTIP COMPONENT ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ color: '#94a3b8', margin: '0 0 8px 0', fontSize: '0.85rem' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></span>
              <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{entry.name}:</span>
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                {entry.dataKey === 'riskScore' ? entry.value : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.glassContainer}>
      
      {/* === HEADER & CONTROLS === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={styles.headerText}>📈 Risk Analysis</h3>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
            30-day security trend monitoring
          </p>
        </div>

        {/* Chart Toggle Buttons */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
          {[
            { key: 'area', icon: '📉', label: 'Trend' },
            { key: 'bar', icon: '📊', label: 'Volume' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setChartType(type.key)}
              style={{
                background: chartType === type.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: chartType === type.key ? 'white' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* === CHART AREA === */}
      <div style={{ flex: 1, minHeight: '250px', marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="riskScore" 
                name="Risk Score" 
                stroke="#ef4444" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRisk)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="analyses" name="Scans" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="alerts" name="Alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* === SUMMARY FOOTER === */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <SummaryItem label="Avg Risk" value={`${summary.avg}%`} color={summary.avg > 70 ? '#ef4444' : '#22c55e'} />
        <SummaryItem label="Peak" value={`${summary.peak}%`} color="#f59e0b" />
        <SummaryItem label="Alerts" value={summary.alerts} color="#3b82f6" />
        <SummaryItem label="Critical Days" value={summary.highRisk} color={summary.highRisk > 0 ? '#ef4444' : '#94a3b8'} />
      </div>

    </div>
  );
};

// Sub-component for clean code
const SummaryItem = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: color }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
  </div>
);

export default RiskGraph;