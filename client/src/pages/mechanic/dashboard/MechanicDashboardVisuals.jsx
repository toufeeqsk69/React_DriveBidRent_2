import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { PieChart, Activity, Wrench, CheckCircle2, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MechanicDashboardVisuals({ currentTasks = [], completedTasks = [] }) {
  const dataCounts = useMemo(() => {
    let pending = 0;
    let inProgress = 0;

    currentTasks.forEach(task => {
      if (task.status === 'assignedMechanic') pending++;
      else inProgress++;
    });

    return {
      pending: pending || (currentTasks.length > 0 ? currentTasks.length : 0),
      inProgress: inProgress,
      completed: completedTasks.length
    };
  }, [currentTasks, completedTasks]);

  const chartData = {
    labels: ['Assigned (Pending)', 'In Progress', 'Completed'],
    datasets: [{
      data: [dataCounts.pending, dataCounts.inProgress, dataCounts.completed],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      borderWidth: 4,
      hoverOffset: 4,
    }],
  };

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13, weight: 'bold' },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
      }
    },
    maintainAspectRatio: false,
  };

  const timelineActivities = useMemo(() => {
    const activities = [];

    currentTasks.forEach(task => {
      activities.push({
        id: task._id,
        vehicleName: task.vehicleName,
        type: task.status === 'assignedMechanic' ? 'assigned' : 'in-progress',
        date: new Date(task.updatedAt || task.createdAt),
        link: `/mechanic/car-details/${task._id}`
      });
    });

    completedTasks.forEach(task => {
      activities.push({
        id: task._id,
        vehicleName: task.vehicleName,
        type: 'completed',
        date: new Date(task.mechanicReview?.reviewDate || task.updatedAt || task.createdAt),
        link: `/mechanic/past-tasks`
      });
    });

    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [currentTasks, completedTasks]);

  const getTimeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return 'Recently';
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
  };

  const hasData = currentTasks.length > 0 || completedTasks.length > 0;

  const s = {
    card: {
      background: '#fff',
      borderRadius: 20,
      padding: 32,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    sectionIcon: {
      width: 32, height: 32, borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: 17, fontWeight: 800, color: '#111827',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    sectionSub: {
      fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2,
    },
    legendItem: {
      textAlign: 'center', padding: '10px 0', borderRadius: 14,
      border: '1px solid transparent',
    },
    legendDot: {
      width: 10, height: 10, borderRadius: '50%',
      margin: '0 auto 6px',
    },
    legendCount: { fontSize: 20, fontWeight: 800, color: '#111827' },
    legendLabel: { fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
    // Timeline
    timelineRow: {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 14,
      background: '#f9fafb', border: '1px solid #f3f4f6',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
    timelineIcon: {
      width: 38, height: 38, borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    timelineBadge: {
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    timelineTime: {
      fontSize: 11, fontWeight: 600, color: '#9ca3af',
      marginLeft: 'auto', whiteSpace: 'nowrap',
    },
    timelineName: {
      fontSize: 14, fontWeight: 700, color: '#111827',
      textDecoration: 'none',
    },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 48 }}
         className="mechanic-visuals-grid">
      <style>{`
        @media (max-width: 1024px) {
          .mechanic-visuals-grid { grid-template-columns: 1fr !important; }
        }
        .tl-row:hover {
          background: #fff !important;
          border-color: #e5e7eb !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
      `}</style>

      {/* ── DOUGHNUT CHART CARD ── */}
      <div style={s.card}>
        <div style={{ marginBottom: 24 }}>
          <div style={s.sectionTitle}>
            <div style={{ ...s.sectionIcon, background: '#eef2ff', color: '#6366f1' }}>
              <PieChart size={16} />
            </div>
            Task Distribution
          </div>
          <p style={s.sectionSub}>Breakdown of your workload</p>
        </div>

        {!hasData ? (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '6px solid #e5e7eb', margin: '0 auto 16px',
            }} />
            <p style={{ fontWeight: 700, color: '#9ca3af' }}>No task data available</p>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', width: '100%', maxHeight: 200, aspectRatio: '1', margin: '0 auto 24px' }}>
              <Doughnut data={chartData} options={chartOptions} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: '#111827' }}>
                  {currentTasks.length + completedTasks.length}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ ...s.legendItem, background: '#eff6ff', borderColor: '#dbeafe' }}>
                <div style={{ ...s.legendDot, background: '#3b82f6' }} />
                <div style={s.legendCount}>{dataCounts.pending}</div>
                <div style={s.legendLabel}>Assigned</div>
              </div>
              <div style={{ ...s.legendItem, background: '#fffbeb', borderColor: '#fef3c7' }}>
                <div style={{ ...s.legendDot, background: '#f59e0b' }} />
                <div style={s.legendCount}>{dataCounts.inProgress}</div>
                <div style={s.legendLabel}>Progress</div>
              </div>
              <div style={{ ...s.legendItem, background: '#ecfdf5', borderColor: '#d1fae5' }}>
                <div style={{ ...s.legendDot, background: '#10b981' }} />
                <div style={s.legendCount}>{dataCounts.completed}</div>
                <div style={s.legendLabel}>Done</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RECENT ACTIVITY CARD ── */}
      <div style={{ ...s.card, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 24,
          paddingBottom: 20, borderBottom: '1px solid #f3f4f6',
        }}>
          <div>
            <div style={s.sectionTitle}>
              <div style={{ ...s.sectionIcon, background: '#fff7ed', color: '#f97316' }}>
                <Activity size={16} />
              </div>
              Recent Activity
            </div>
            <p style={s.sectionSub}>Your latest inspection events</p>
          </div>
          {hasData && timelineActivities.length > 0 && (
            <Link to="/mechanic/current-tasks" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 700, color: '#6b7280',
              textDecoration: 'none', padding: '6px 12px',
              borderRadius: 10, border: '1px solid #e5e7eb',
              background: '#fff', transition: 'all 0.2s',
            }}>
              View All <ArrowUpRight size={13} />
            </Link>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {!hasData || timelineActivities.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: 40,
              background: '#f9fafb', borderRadius: 16,
              border: '1px dashed #e5e7eb', height: '100%',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color: '#d1d5db',
              }}>
                <Clock size={24} />
              </div>
              <p style={{ fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>
                No recent activity
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>
                Assignments and completed inspections will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {timelineActivities.map((activity, idx) => {
                const isCompleted = activity.type === 'completed';
                const isAssigned = activity.type === 'assigned';

                let iconBg, iconColor, badgeColor, actionText, Icon;

                if (isCompleted) {
                  iconBg = '#ecfdf5'; iconColor = '#10b981';
                  badgeColor = '#10b981'; actionText = 'Completed';
                  Icon = CheckCircle2;
                } else if (isAssigned) {
                  iconBg = '#eff6ff'; iconColor = '#3b82f6';
                  badgeColor = '#3b82f6'; actionText = 'Assigned';
                  Icon = AlertCircle;
                } else {
                  iconBg = '#fffbeb'; iconColor = '#f59e0b';
                  badgeColor = '#f59e0b'; actionText = 'In Progress';
                  Icon = Wrench;
                }

                return (
                  <Link
                    key={`${activity.id}-${idx}`}
                    to={activity.link}
                    className="tl-row"
                    style={{ ...s.timelineRow, textDecoration: 'none' }}
                  >
                    <div style={{ ...s.timelineIcon, background: iconBg, color: iconColor }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...s.timelineBadge, color: badgeColor }}>{actionText}</div>
                      <div style={s.timelineName}>{activity.vehicleName}</div>
                    </div>
                    <span style={s.timelineTime}>{getTimeAgo(activity.date)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
