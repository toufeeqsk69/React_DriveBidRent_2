// client/src/pages/mechanic/current-tasks/CurrentTasks.jsx
import { useEffect, useState } from 'react';
import { getCurrentTasks } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CurrentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentTasks()
      .then(res => {
        // Filter to only show pending review status (not completed)
        const activeTasks = (res.data.data.assignedVehicles || []).filter(
          task => task.reviewStatus === 'pending'
        );
        setTasks(activeTasks);
      })
      .catch(() => setTasks([]))
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
          { top: '20%', left: '10%', size: 150, color: 'rgba(59,130,246,0.08)', delay: '0s' },
          { top: '50%', left: '70%', size: 200, color: 'rgba(249,115,22,0.07)', delay: '1s' },
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
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Tasks</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 12 }}>
                Current <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>Assignments</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Active vehicle inspection assignments
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{tasks.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(96,165,250,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Active Tasks</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(59,130,246,0.2)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24, color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">
        {/* Tasks Grid */}
        <section>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles assigned</h3>
              <p className="text-gray-500">You currently have no tasks assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}