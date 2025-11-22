import React, { useState, useEffect } from 'react';

const PipelineMonitor = () => {
  const [pipelines, setPipelines] = useState([]);
  const [lastPoll, setLastPoll] = useState(null);

  useEffect(() => {
    fetchPipelineData();
    // Polling every 5 seconds
    const interval = setInterval(fetchPipelineData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPipelineData = () => {
    // Mock Data with slight randomization to simulate movement
    const mockPipelines = [
      {
        id: 101, name: 'Backend-CI', status: 'running', branch: 'main', commit: 'a1b2c3d',
        stages: [
          { name: 'Build', status: 'success' },
          { name: 'Test', status: 'success' },
          { name: 'Security Scan', status: 'running' },
          { name: 'Deploy', status: 'pending' }
        ]
      },
      {
        id: 102, name: 'Frontend-Deploy', status: 'failed', branch: 'feat/ui-update', commit: '9876543',
        stages: [
          { name: 'Build', status: 'success' },
          { name: 'Lint', status: 'failed' },
          { name: 'Deploy', status: 'skipped' }
        ]
      },
      {
        id: 103, name: 'ML-Model-Train', status: 'success', branch: 'dev', commit: 'def456',
        stages: [
          { name: 'Data Prep', status: 'success' },
          { name: 'Train', status: 'success' },
          { name: 'Eval', status: 'success' }
        ]
      }
    ];
    setPipelines(mockPipelines);
    setLastPoll(new Date());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'running': return '#3b82f6';
      default: return '#64748b'; // Pending/Skipped
    }
  };

  // Helper to render a visual progress bar
  const renderProgressBar = (stages) => {
    const total = stages.length;
    return (
      <div style={{ display: 'flex', height: '8px', width: '100%', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
        {stages.map((stage, idx) => (
          <div 
            key={idx} 
            title={`${stage.name}: ${stage.status}`}
            style={{ 
              flex: 1, 
              backgroundColor: getStatusColor(stage.status),
              borderRight: idx !== total -1 ? '1px solid #0f172a' : 'none'
            }} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="card pipeline-monitor" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #334155'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem'
          }}>
            🔧 CI/CD Pipeline Monitor
          </h3>
          <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: '#06b6d4', borderRadius: '50%' }}></span>
            Last updated: {lastPoll ? lastPoll.toLocaleTimeString() : '--'}
          </small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { status: 'success', count: pipelines.filter(p => p.status === 'success').length, color: '#22c55e' },
              { status: 'running', count: pipelines.filter(p => p.status === 'running').length, color: '#3b82f6' },
              { status: 'failed', count: pipelines.filter(p => p.status === 'failed').length, color: '#ef4444' }
            ].map(item => (
              <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                <span style={{ width: '8px', height: '8px', background: item.color, borderRadius: '50%' }}></span>
                <span style={{ color: '#94a3b8' }}>{item.count}</span>
              </div>
            ))}
          </div>
          <span className="badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            <span style={{ height: '6px', width: '6px', background: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
            LIVE
          </span>
        </div>
      </div>

      <div className="pipelines-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pipelines.map((p) => (
          <div key={p.id} style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '20px',
            borderRadius: '12px',
            borderLeft: `4px solid ${getStatusColor(p.status)}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `radial-gradient(circle, ${getStatusColor(p.status)}20 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#f1f5f9' }}>{p.name}</h4>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🌿 {p.branch}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>🔗 {p.commit}</span>
                </div>
              </div>
              <div style={{
                background: `${getStatusColor(p.status)}20`,
                color: getStatusColor(p.status),
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                border: `1px solid ${getStatusColor(p.status)}40`
              }}>
                {p.status}
              </div>
            </div>

            {/* Enhanced Visual Progress Bar */}
            <div style={{ marginBottom: '12px', position: 'relative', zIndex: 1 }}>
              {renderProgressBar(p.stages)}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '0.8rem',
                color: '#64748b'
              }}>
                <span>🚀 {p.stages[0].name}</span>
                <span>🏁 {p.stages[p.stages.length-1].name}</span>
              </div>
            </div>

            {/* Stage Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px',
              fontSize: '0.8rem',
              position: 'relative',
              zIndex: 1
            }}>
              {p.stages.map((stage, idx) => (
                <div key={idx} style={{
                  background: '#0f172a',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  border: `1px solid ${getStatusColor(stage.status)}40`
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{stage.name}</div>
                  <div style={{
                    color: getStatusColor(stage.status),
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {stage.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineMonitor;