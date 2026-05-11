import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage({ homeRoute = "/" }) {
  const styles = {
    container: {
      width: '100%',
      minHeight: '100%',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      margin: 0,
      overflow: 'hidden',
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    content: {
      textAlign: 'center',
      position: 'relative',
      maxWidth: '500px',
      width: '100%',
    },

    errorCode: {
      fontSize: 'clamp(2.5rem, 8vw, 4rem)',
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      userSelect: 'none',
      zIndex: 2,
    },

    carScene: {
      position: 'relative',
      height: 100,
      margin: '1rem auto 1.5rem',
      width: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    car: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      animation: 'bounce 3.4s infinite ease-in-out',
    },

    carBody: {
      width: 120,
      height: 48,
      background: 'linear-gradient(135deg, #f97316, #c2410c)',
      borderRadius: '12px 40px 12px 12px',
      position: 'relative',
      boxShadow: '0 10px 20px rgba(0,0,0,0.55)',
    },

    window: {
      position: 'absolute',
      top: 9,
      left: 24,
      width: 46,
      height: 25,
      background: '#0f172a',
      borderRadius: 6,
      boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.65)',
    },

    headlight: {
      position: 'absolute',
      top: 15,
      right: -6,
      width: 18,
      height: 18,
      background: '#fef08a',
      borderRadius: '50%',
      boxShadow:
        '0 0 18px #fef08a, 0 0 30px #fef08a, 0 0 45px #fef08a',
      filter: 'blur(1.5px)',
    },

    wheel: {
      width: 34,
      height: 34,
      background: '#111827',
      borderRadius: '50%',
      position: 'absolute',
      bottom: -17,
      border: '6px solid #1e293b',
      boxShadow: 'inset 0 4px 9px #000',
    },

    wheelFront: { left: 14 },
    wheelRear: { right: 14 },

    exhaust: {
      position: 'absolute',
      bottom: 6,
      left: -14,
      width: 20,
      height: 9,
      background: '#4b5563',
      borderRadius: '16px 4px 4px 16px',
      animation: 'puff 2.6s infinite',
    },

    road: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 280,
      height: 3,
      background:
        'repeating-linear-gradient(90deg, #475569 0, #475569 18px, transparent 18px, transparent 36px)',
      animation: 'move-road 7s linear infinite',
    },

    title: {
      fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
      fontWeight: 800,
      margin: '0.25rem 0 0.75rem',
      letterSpacing: '-0.025em',
    },

    message: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
      color: '#94a3b8',
      margin: '0 0 1.5rem',
    },

    homeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.75rem 1.5rem',
      fontSize: '0.95rem',
      fontWeight: 600,
      color: 'white',
      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
      borderRadius: 999,
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(59,130,246,0.4)',
    },

    homeButtonHover: {
      // Cannot do :hover in inline style → use CSS or styled-components for true hover
      // For now we simulate with onMouseEnter/Leave or just leave basic
    },
  };

  // Because inline styles don't support :hover / :active / pseudo-classes well,
  // here's a simple hover state using React state (optional)
  const [hovered, setHovered] = React.useState(false);

  const buttonStyle = {
    ...styles.homeButton,
    ...(hovered
      ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(59,130,246,0.55)',
          background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
        }
      : {}),
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>

        <div style={styles.carScene}>
          <div style={styles.car}>
            <div style={styles.carBody}>
              <div style={styles.window} />
              <div style={styles.headlight} />
              <div style={{ ...styles.wheel, ...styles.wheelFront }} />
              <div style={{ ...styles.wheel, ...styles.wheelRear }} />
            </div>
            <div style={styles.exhaust} />
          </div>
          <div style={styles.road} />
        </div>

        <h1 style={styles.title}>Page Not Found</h1>

        <p style={styles.message}>
          This road seems to have disappeared...
          <br />
          The ride you're looking for isn't here right now.
        </p>

        <Link
          to={homeRoute}
          style={buttonStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span>Drive Back Home</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ width: 18, height: 18, strokeWidth: 2.5 }}
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Global keyframes — unfortunately must still be in <style> tag */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-9px); }
        }
        @keyframes puff {
          0%   { transform: translateX(0) scale(1);   opacity: 0.8; }
          100% { transform: translateX(-35px) scale(1.8); opacity: 0; }
        }
        @keyframes move-road {
          0%   { background-position: 0 0; }
          100% { background-position: -72px 0; }
        }
      `}</style>
    </div>
  );
}