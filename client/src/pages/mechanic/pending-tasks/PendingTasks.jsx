// client/src/pages/mechanic/pending-tasks/PendingTasks.jsx
import { useEffect, useState } from 'react';
import { getPendingTasks, acceptPendingTask, declinePendingTask } from '../../../services/mechanic.services';
import { Link } from 'react-router-dom';

export default function PendingTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingTasks()
      .then(res => setTasks(res.data.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    if (!confirm('Accept this inspection task?')) return;
    await acceptPendingTask(id);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const handleDecline = async (id) => {
    if (!confirm('Decline this task?')) return;
    await declinePendingTask(id); 
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading pending tasks...</p>
        </div>
      </div>
    );
  }

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
          { top: '20%', left: '10%', size: 150, color: 'rgba(245,158,11,0.08)', delay: '0s' },
          { top: '50%', left: '70%', size: 200, color: 'rgba(251,191,36,0.07)', delay: '1s' },
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
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
                padding: '6px 14px', borderRadius: 100, marginBottom: 16,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Requests</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 12 }}>
                Pending <span style={{ color: '#f59e0b', fontStyle: 'italic' }}>Inspections</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 420, lineHeight: 1.7 }}>
                Review and accept new vehicle inspection assignments
              </p>
            </div>

            {/* Right: stat pills */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{tasks.length}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(251,191,36,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Pending</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(245,158,11,0.2)' }} />
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24, color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-12">
        {/* Pending Tasks Grid */}
        <section>
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500">There are no new inspection assignments waiting for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.map(t => {
                const v = t.vehicle;
                return (
                  <div key={t._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Link to={`/mechanic/car-details/${v._id}`}>
                        <img src={v.vehicleImage} alt={v.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </Link>
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          NEW REQUEST
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4 truncate group-hover:text-amber-600 transition-colors">{v.vehicleName}</h3>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Owner</p>
                          <p className="text-sm font-black text-gray-900 truncate">{t.ownerName || 'Unknown'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Mileage</p>
                          <p className="text-lg font-black text-gray-900">{(v.mileage || 0).toLocaleString()} <span className="text-xs text-gray-500 font-medium">km</span></p>
                        </div>
                      </div>
                      
                      <div className="mt-auto border-t border-gray-100 pt-4 flex gap-3">
                        <button
                          onClick={() => handleAccept(t._id)}
                          className="flex-1 inline-flex justify-center items-center py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition duration-300"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(t._id)}
                          className="flex-1 inline-flex justify-center items-center py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition duration-300"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}