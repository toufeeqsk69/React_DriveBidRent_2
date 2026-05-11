// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import MechanicDashboardVisuals from './MechanicDashboardVisuals';
import {
  Wrench, Settings, CheckCircle2, BarChart3, Search,
  ClipboardList, AlertTriangle, Calendar, ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!data) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: '#fff', borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          padding: 48, textAlign: 'center', maxWidth: 400,
          border: '1px solid #fecaca',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#fef2f2', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertTriangle size={28} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Connection Error</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Failed to load dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%', padding: '14px 24px',
              background: '#111827', color: '#fff',
              border: 'none', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            <RefreshCw size={15} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  const upcomingInspections = displayedVehicles.filter(v => {
    if (v.inspectionStatus !== 'scheduled' || !v.inspectionDate) return false;
    const inspectDate = new Date(v.inspectionDate);
    const now = new Date();
    const diffHours = (inspectDate - now) / (1000 * 60 * 60);
    return diffHours >= -24 && diffHours <= 48;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 80, paddingBottom: 60, overflow: 'hidden',
      }}>
        {/* Floating orbs */}
        {[
          { top: '20%', left: '5%', size: 200, color: 'rgba(59,130,246,0.08)' },
          { top: '55%', left: '65%', size: 260, color: 'rgba(249,115,22,0.07)' },
          { top: '10%', left: '80%', size: 130, color: 'rgba(16,185,129,0.05)' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: orb.color, filter: 'blur(40px)', pointerEvents: 'none',
          }} />
        ))}
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>

          {showApprovalPopup && (
            <div style={{
              marginBottom: 28, padding: '16px 20px',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 14,
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{
                padding: 8, background: 'rgba(249,115,22,0.2)', borderRadius: 12,
                color: '#fb923c', flexShrink: 0,
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ color: '#fb923c', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Account Under Review</h3>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>Your profile is being verified by the admin team. You'll receive full access once approved.</p>
              </div>
            </div>
          )}

          {upcomingInspections.length > 0 && (
            <div style={{
              marginBottom: 28, padding: '16px 20px',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 14,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 3,
                height: '100%', background: '#3b82f6',
              }} />
              <div style={{
                padding: 8, background: 'rgba(59,130,246,0.2)', borderRadius: 12,
                color: '#60a5fa', flexShrink: 0,
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Upcoming Inspections ({upcomingInspections.length})
                </h3>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
                  You have vehicle inspections scheduled soon.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {upcomingInspections.map(v => (
                    <Link key={v._id} to={`/mechanic/car-details/${v._id}`}
                      style={{
                        padding: '4px 12px', background: 'rgba(255,255,255,0.1)',
                        color: '#93c5fd', fontSize: 11, fontWeight: 700,
                        borderRadius: 8, textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                      {v.vehicleName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Title + Stats row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'flex-end', justifyContent: 'space-between', gap: 32,
          }}>
            {/* Left: Title */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Mechanic Portal</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#fff',
                letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 12,
              }}>
                Mechanic{' '}
                <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>Dashboard</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Manage your assigned vehicle inspections and view completed reports.
              </p>
            </div>

            {/* Right: Stat pills */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { count: displayedVehicles.length, label: 'Current Tasks', color: '#60a5fa', bg: 'rgba(59,130,246,0.14)', border: 'rgba(59,130,246,0.3)', Icon: Settings },
                { count: completedTasks.length, label: 'Completed', color: '#34d399', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', Icon: CheckCircle2 },
                { count: displayedVehicles.length + completedTasks.length, label: 'Total Tasks', color: '#fbbf24', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', Icon: BarChart3 },
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', borderRadius: 16,
                  background: stat.bg, border: `1px solid ${stat.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{stat.label}</div>
                  </div>
                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
                  <stat.Icon size={18} color={stat.color} strokeWidth={1.8} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px 96px' }}>

        {/* Visual Analytics */}
        <MechanicDashboardVisuals currentTasks={displayedVehicles} completedTasks={completedTasks} />

        {/* ── CURRENT ASSIGNMENTS ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 28,
            padding: '0 8px',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Current Assignments</h2>
            {displayedVehicles.length > 0 && (
              <Link to="/mechanic/current-tasks" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: '#f3f4f6',
                color: '#374151', fontSize: 13, fontWeight: 700,
                borderRadius: 12, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
              >
                View All <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {displayedVehicles.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 24, padding: 48,
              textAlign: 'center', border: '1px dashed #d1d5db',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#f9fafb', color: '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Search size={28} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>No vehicles assigned</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>You currently have no tasks assigned to you.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 24,
            }}>
              {displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

        {/* ── COMPLETED INSPECTIONS ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 28,
            padding: '0 8px',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Completed Inspections</h2>
            {completedTasks.length > 0 && (
              <Link to="/mechanic/past-tasks" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: '#f3f4f6',
                color: '#374151', fontSize: 13, fontWeight: 700,
                borderRadius: 12, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
              >
                View All <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {completedTasks.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 24, padding: 48,
              textAlign: 'center', border: '1px dashed #d1d5db',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#f9fafb', color: '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <ClipboardList size={28} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 6 }}>No completed tasks yet</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Your completed inspection reports will appear here.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 24,
            }}>
              {completedTasks.slice(0, 6).map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}