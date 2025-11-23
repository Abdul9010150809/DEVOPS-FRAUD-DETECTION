import React, { useState, useEffect } from 'react';

// --- STYLES ---
const styles = {
  glassContainer: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    minHeight: '60vh',
    color: 'white'
  },
  headerText: {
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: 0
  },
  stageNode: (status) => {
    const colors = {
      success: '#22c55e',
      failed: '#ef4444',
      running: '#3b82f6',
      pending: '#475569',
      skipped: '#94a3b8'
    };
    const color = colors[status] || colors.pending;
    return {
      width: '12px', height: '12px', borderRadius: '50%',
      background: status === 'running' ? 'white' : color,
      border: `2px solid ${color}`,
      boxShadow: status === 'running' ? `0 0 10px ${color}` : 'none',
      position: 'relative', zIndex: 2,
      transition: 'all 0.3s ease'
    };
  },
  stageLine: (status) => ({
    flex: 1, height: '2px',
    background: status === 'success' ? '#22c55e' : '#334155',
    margin: '0 4px'
  })
};

const PipelineMonitor = () => {
  const [pipelines, setPipelines] = useState([]);
  const [lastPoll, setLastPoll] = useState(null);

  // --- DATA MOCKING ---
  const fetchPipelineData = () => {
    // Randomized Mock Data
    const mockPipelines = [
      {
        id: 101, name: 'Backend-CI', status: 'running', branch: 'main', commit: 'a1b2c3d',
        author: 'devops-bot', duration: '2m 14s',
        stages: [
          { name: 'Build', status: 'success' },
          { name: 'Test', status: 'success' },
          { name: 'Sec-Scan', status: 'running' },
          { name: 'Deploy', status: 'pending' }
        ]
      },
      {
        id: 102, name: 'Frontend-Deploy', status: 'failed', branch: 'feat/ui-update', commit: '9876543',
        author: 'sarah_j', duration: '4m 30s',
        stages: [
          { name: 'Build', status: 'success' },
          { name: 'Lint', status: 'failed' },
          { name: 'Unit Tests', status: 'skipped' },
          { name: 'Deploy', status: 'skipped' }
        ]
      },
      {
        id: 103, name: 'ML-Model-Train', status: 'success', branch: 'research/v2', commit: 'def456',
        author: 'data_team', duration: '12m 05s',
        stages: [
          { name: 'Data Prep', status: 'success' },
          { name: 'Training', status: 'success' },
          { name: 'Evaluation', status: 'success' },
          { name: 'Registry', status: 'success' }
        ]
      }
    ];
    setPipelines(mockPipelines);
    setLastPoll(new Date());
  };

  useEffect(() => {
    fetchPipelineData();
    const interval = setInterval(fetchPipelineData, 3000); // Fast polling for "Live" feel
    return () => clearInterval(interval);
  }, []);

  // --- HELPERS ---
  const getStatusIcon = (status) => {
    if (status === 'success') return '✅';
    if (status === 'failed') return '❌';
    if (status === 'running') return '⏳';
    return '⏹️';
  };

  const getStatusColor = (status) => {
    if (status === 'success') return '#22c55e';
    if (status === 'failed') return '#ef4444';
    if (status === 'running') return '#3b82f6';
    return '#64748b';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={styles.glassContainer}>
        
        {/* === HEADER === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div>
            <h3 style={styles.headerText}>🔧 CI/CD Pipeline Monitor</h3>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></span>
              Live Polling • Last update: {lastPoll ? lastPoll.toLocaleTimeString() : '--'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
             {/* Simple Stats */}
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#22c55e' }}>{pipelines.filter(p => p.status === 'success').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Passing</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#3b82f6' }}>{pipelines.filter(p => p.status === 'running').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Active</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ef4444' }}>{pipelines.filter(p => p.status === 'failed').length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Failed</div>
             </div>
          </div>
        </div>

        {/* === PIPELINES LIST === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pipelines.map((p) => (
            <div key={p.id} style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${getStatusColor(p.status)}40`,
              borderLeft: `4px solid ${getStatusColor(p.status)}`,
              borderRadius: '12px',
              padding: '20px',
              position: 'relative',
              transition: 'transform 0.2s',
            }}>
              
              {/* Top Row: Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>{p.name}</h4>
                    <span style={{ 
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {p.branch}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', fontFamily: 'monospace' }}>
                    #{p.id} • {p.commit} • by {p.author}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                   <div style={{ 
                     display: 'inline-flex', alignItems: 'center', gap: '6px',
                     padding: '6px 12px', borderRadius: '20px',
                     background: `${getStatusColor(p.status)}20`, color: getStatusColor(p.status),
                     fontWeight: 'bold', fontSize: '0.8rem'
                   }}>
                     {p.status === 'running' && <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}>⏳</span>}
                     {p.status.toUpperCase()}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                     ⏱️ {p.duration}
                   </div>
                </div>
              </div>

              {/* Visualization: Node Diagram */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
                {p.stages.map((stage, idx) => (
                  <React.Fragment key={idx}>
                    
                    {/* The Line (Connection) */}
                    {idx > 0 && (
                      <div style={{ 
                        flex: 1, height: '2px', 
                        background: p.stages[idx-1].status === 'success' ? '#22c55e' : '#334155',
                        margin: '0 5px'
                      }}></div>
                    )}

                    {/* The Node (Circle) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      <div style={styles.stageNode(stage.status)}>
                        {stage.status === 'running' && (
                          <div style={{
                            position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                            borderRadius: '50%', border: '2px solid #3b82f6', opacity: 0.5,
                            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                          }}></div>
                        )}
                      </div>
                      
                      {/* Stage Label */}
                      <div style={{ 
                        position: 'absolute', top: '20px', width: '80px', textAlign: 'center', 
                        fontSize: '0.75rem', color: stage.status === 'skipped' ? '#475569' : '#cbd5e1', fontWeight: '500'
                      }}>
                        {stage.name}
                      </div>
                    </div>

                  </React.Fragment>
                ))}
              </div>
              
              {/* Spacer for labels */}
              <div style={{ height: '25px' }}></div>

            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation Injection for "Ping" effect on running nodes */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PipelineMonitor;