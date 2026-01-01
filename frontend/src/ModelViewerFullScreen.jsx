import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModelViewer from './ModelViewer';

export default function ModelViewerFullScreen({ data }) {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', position: 'relative' }}>
      {/* ✅ Exit Fullscreen Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
      >
        ✕ Exit Fullscreen
      </button>

      <ModelViewer
        data={data}
        className="fullscreen-viewer"
        style={{ width: '100%', height: '100%', borderRadius: 0, border: 'none' }}
        showFullscreenBtn={false} // hide inner fullscreen button
      />
    </div>
  );
}

