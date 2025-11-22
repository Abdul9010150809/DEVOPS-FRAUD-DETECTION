import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Area, ComposedChart, AreaChart
} from 'recharts';

const RiskGraph = ({ data }) => {
  const [chartType, setChartType] = useState('area');

  // Generate mock data if no data provided
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;

    // Generate mock data for standalone usage
    const mockData = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const baseRisk = 0.3 + Math.sin(i / 5) * 0.2;
      const finalRisk = Math.min(1, Math.max(0, baseRisk + (Math.random() - 0.5) * 0.3));
      mockData.push({
        date: date.toISOString().split('T')[0],
        riskScore: finalRisk,
        analyses: Math.floor(Math.random() * 20) + 5,
        alerts: Math.floor(finalRisk * 10)
      });
    }
    return mockData;
  }, [data]);

  // Memoize summary stats
  const summary = useMemo(() => {
    if (!chartData.length) return { avg: 0, peak: 0, alerts: 0, highRisk: 0 };
    return {
      avg: (chartData.reduce((sum, item) => sum + item.riskScore, 0) / chartData.length * 100).toFixed(1),
      peak: (Math.max(...chartData.map(item => item.riskScore)) * 100).toFixed(1),
      alerts: chartData.reduce((sum, item) => sum + item.alerts, 0),
      highRisk: chartData.filter(item => item.riskScore > 0.7).length
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#1e293b', padding: '10px', border: '1px solid #334155', borderRadius: '4px' }}>
          <p className="tooltip-date" style={{ color: '#94a3b8', marginBottom: '5px' }}>{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: entry.color, fontSize: '0.9rem' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {entry.dataKey === 'riskScore' ? entry.value.toFixed(2) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="risk-graph card" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div className="graph-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #334155'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem'
          }}>
            📈 Risk Analysis Over Time
          </h3>
          <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>
            30-day risk trend analysis with interactive charts
          </small>
        </div>
        <div className="chart-controls" style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'area', label: 'Area Chart', icon: '📊' },
            { key: 'bar', label: 'Bar Chart', icon: '📋' }
          ].map(type => (
            <button
              key={type.key}
              style={{
                padding: '10px 16px',
                background: chartType === type.key ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                border: '1px solid #334155',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: chartType === type.key ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => setChartType(type.key)}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="graph-container" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="riskScore" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorRisk)" 
                name="Risk Score" 
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="analyses" fill="#3b82f6" name="Analyses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alerts" fill="#f59e0b" name="Alerts" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="graph-summary" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        {[
          {
            label: 'Average Risk',
            value: `${summary.avg}%`,
            color: summary.avg > 70 ? '#ef4444' : summary.avg > 40 ? '#f59e0b' : '#22c55e',
            icon: '📊',
            desc: '30-day average'
          },
          {
            label: 'Peak Risk',
            value: `${summary.peak}%`,
            color: '#f59e0b',
            icon: '🔺',
            desc: 'Highest recorded'
          },
          {
            label: 'Total Alerts',
            value: summary.alerts.toLocaleString(),
            color: '#3b82f6',
            icon: '🚨',
            desc: 'Security events'
          },
          {
            label: 'High Risk Days',
            value: summary.highRisk,
            color: summary.highRisk > 5 ? '#ef4444' : '#22c55e',
            icon: '⚠️',
            desc: 'Days >70% risk'
          }
        ].map((item, idx) => (
          <div key={idx} className="summary-item" style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #475569',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: `${item.color}20`,
              borderRadius: '50%',
              transform: 'translate(20px, -20px)'
            }}></div>

            <div style={{
              fontSize: '1.5rem',
              marginBottom: '8px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}>
              {item.icon}
            </div>

            <div style={{
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '4px',
              fontWeight: '500'
            }}>
              {item.label}
            </div>

            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: item.color,
              marginBottom: '4px',
              textShadow: `0 1px 2px ${item.color}40`
            }}>
              {item.value}
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: '#64748b'
            }}>
              {item.desc}
            </div>

            <div style={{
              width: '100%',
              height: '3px',
              background: `linear-gradient(90deg, ${item.color}40, ${item.color})`,
              borderRadius: '2px',
              marginTop: '12px'
            }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskGraph;