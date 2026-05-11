// client/src/pages/mechanic/past-tasks/PastTasks.jsx
import { useEffect, useState } from 'react';
import { getPastTasks } from '../../../services/mechanic.services';
import PastTaskCard from '../components/PastTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PastTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPastTasks()
      .then(res => setTasks(res.data.data.completedTasks || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>
      {/* ── HERO — Premium dark banner ── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0c1220 0%, #111827 50%, #0c1628 100%)',
        paddingTop: 60,
        paddingBottom: 60,
        overflow: 'hidden',
      }}>
        {/* Floating orbs */}
        {[
          { top: '20%', left: '10%', size: 150, color: 'rgba(16,185,129,0.08)', delay: '0s' },
          { top: '50%', left: '70%', size: 200, color: 'rgba(52,211,153,0.07)', delay: '1s' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', top: orb.top, left: orb.left,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: orb.color, filter: 'blur(40px)',
            animationDelay: orb.delay, pointerEvents: 'none',
          }} />
        ))}
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            {/* Left: title */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.18em' }}>History</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 12 }}>
                Completed <span style={{ color: '#10b981', fontStyle: 'italic' }}>Inspections</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                History of completed vehicle inspections
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{tasks.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(52,211,153,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Completed</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(16,185,129,0.2)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24, color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">
        {/* Completed Tasks Grid */}
        <section>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No past inspections</h3>
              <p className="text-gray-500">Your completed inspection reports will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}