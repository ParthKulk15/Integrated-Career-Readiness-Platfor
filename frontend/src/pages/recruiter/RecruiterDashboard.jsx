import { useEffect, useState } from 'react';
import { getCandidates, getJobsByRecruiter } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCandidates(), user?.id ? getJobsByRecruiter(user.id) : Promise.resolve([])])
      .then(([candidateData, jobData]) => {
        setCandidates(candidateData);
        setJobs(jobData);
      })
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant">Loading dashboard...</span></div>;

  const shortlisted = candidates.filter(c => c.status === 'shortlisted').length;

  const stats = [
    {
      label: 'Total Candidates',
      value: candidates.length,
      icon: 'groups',
      borderColor: 'border-primary',
      description: 'All registered candidates',
    },
    {
      label: 'Shortlisted Candidates',
      value: shortlisted,
      icon: 'star',
      borderColor: 'border-secondary',
      description: 'Ready for interview stage',
    },
    {
      label: 'Active Jobs',
      value: jobs.length,
      icon: 'work',
      borderColor: 'border-on-tertiary-container',
      description: 'Currently open positions',
    },
  ];

  return (
    <div className="space-y-8">
      {error && <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium">{error}</div>}

      <header>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1">Overview</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Recruiter Dashboard</h1>
        <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">Key metrics from your talent pipeline.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((m, idx) => (
          <div
            key={m.label}
            className={`bg-surface-container-lowest p-4 sm:p-8 rounded-xl shadow-sm border-l-4 ${m.borderColor} hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
            style={{ animationDelay: `${idx * 100}ms`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider leading-tight">{m.label}</p>
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>
            </div>
            <h3 className="text-4xl font-black text-primary leading-none tabular-nums">{m.value}</h3>
            <p className="text-on-surface-variant text-xs mt-3">{m.description}</p>
          </div>
        ))}
      </section>

      {/* Quick Summary */}
      <section className="bg-primary text-white rounded-xl p-4 sm:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Pipeline Summary</h2>
          <p className="text-primary-fixed opacity-70 text-sm leading-relaxed mb-6">
            You have {candidates.length} candidates across {jobs.length} active job openings. {shortlisted} candidates have been shortlisted.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(
              candidates.reduce((acc, c) => {
                const s = c.status || 'new';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {})
            ).map(([status, count]) => (
              <div key={status} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed opacity-60 mb-1">{status}</p>
                <p className="text-2xl font-black">{count}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
      </section>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
