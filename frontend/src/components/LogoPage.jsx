import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/signup');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;

  const logoStyles = {
    animation: 'pulse 2s infinite',
    width: '300px',
    height: '300px',
   
    objectFit: 'contain',
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        border: '30px solid #2f2f4f',
        padding: '30px',
        boxSizing: 'border-box',
      }}
    >
      <style>{pulseKeyframes}</style>

      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/assets/logo.png"
          alt="App Logo"
          style={logoStyles}
        />
      </div>

      <div style={{
       
        fontSize: '24px',
        fontWeight: 'bold',
        letterSpacing: '1px'
      }}>
        <span style={{ color: '#2f2f4f' }}>Click</span>{' '}
        <span style={{ color: '#B5651D' }}>.</span>{' '}
        <span style={{ color: '#2f2f4f' }}>Match</span>{' '}
        <span style={{ color: '#B5651D' }}>.</span>{' '}
        <span style={{ color: '#2f2f4f' }}>Ride</span>
      </div>
    </div>
  );
};

export default LogoPage;
