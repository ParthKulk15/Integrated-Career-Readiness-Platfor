import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getJobs, createApplication, getStudentApplications, deleteApplication } from '../../api/client';

export default function JobOpportunities() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    if (user?.id) {
      try {
        const stored = JSON.parse(localStorage.getItem(`savedJobs_${user.id}`) || '[]');
        setSavedJobs(stored);
      } catch { setSavedJobs([]); }
    }
  }, [user?.id]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      getJobs(),
      user?.id ? getStudentApplications(user.id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([jobData, appData]) => { setJobs(jobData || []); setApplications(appData || []); })
      .catch(() => setError('Unable to load job opportunities.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const applyNow = async (job) => {
    setMessage(''); setError('');
    try {
      await createApplication(user?.id, job.id);
      setMessage(`Application submitted for ${job.title}!`);
      // Refresh applications
      if (user?.id) {
        const updated = await getStudentApplications(user.id).catch(() => []);
        setApplications(updated || []);
      }
    } catch {
      setError('Unable to submit application right now.');
    }
  };

  const withdrawApplication = async (appId) => {
    setMessage(''); setError('');
    try {
      await deleteApplication(appId);
      setMessage('Application withdrawn successfully.');
      if (user?.id) {
        const updated = await getStudentApplications(user.id).catch(() => []);
        setApplications(updated || []);
      }
    } catch {
      setError('Unable to withdraw application right now.');
    }
  };

  const toggleSave = (jobId) => {
    const updated = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    setSavedJobs(updated);
    if (user?.id) {
      localStorage.setItem(`savedJobs_${user.id}`, JSON.stringify(updated));
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant">Loading opportunities...</span></div>;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1">Opportunity Engine</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Job Opportunities</h1>
        <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">Browse and apply to openings that match your career goals.</p>
      </header>

      {message && <div className="bg-secondary-container text-on-secondary-container rounded-xl p-4 text-sm font-bold animate-fade-in">{message}</div>}
      {error && <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium">{error}</div>}

      {/* Search Bar */}
      <div className="flex items-center bg-surface-container-lowest px-5 py-3 rounded-full w-full sm:max-w-lg border border-surface-container focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
        <span className="material-symbols-outlined text-on-surface-variant text-base mr-3">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full placeholder:text-on-surface-variant/50"
          placeholder="Search by title, company, or location..."
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="ml-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Job Cards */}
        <div className="col-span-12 lg:col-span-8">
          {filteredJobs.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">work_off</span>
              <p className="text-on-surface-variant text-sm font-medium">No job opportunities found.</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Check back later for new openings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((j, idx) => (
                <div
                  key={j.id}
                  className="bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-secondary-container/40"
                  style={{ animationDelay: `${idx * 60}ms`, animation: 'fadeInUp 0.4s ease-out forwards', opacity: 0 }}
                >
                  {/* Company icon */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-primary text-xl">apartment</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-primary group-hover:text-secondary transition-colors leading-tight truncate">{j.title}</h3>
                      <p className="text-on-surface-variant text-xs mt-1 truncate">{j.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span>{j.location}</span>
                  </div>

                  {/* Description */}
                  {j.description && (
                    <p className="text-xs text-on-surface-variant mb-4 line-clamp-3 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {j.description}
                    </p>
                  )}

                  {/* Skills */}
                  {j.skills?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {j.skills.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-surface-container rounded-full text-[10px] font-bold text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    {applications.find(a => a.jobId === j.id) ? (
                      <div className="flex-1 flex gap-2">
                        <button
                          disabled
                          className="flex-1 bg-surface-container text-primary py-2.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-default"
                        >
                          Applied
                        </button>
                        <button
                          onClick={() => withdrawApplication(applications.find(a => a.jobId === j.id).id)}
                          className="w-10 h-10 shrink-0 bg-error/10 text-error rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-all cursor-pointer"
                          title="Withdraw Application"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => applyNow(j)}
                        className="flex-1 bg-primary text-white py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                      >
                        Apply Now
                      </button>
                    )}
                    <button
                      onClick={() => toggleSave(j.id)}
                      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer ${savedJobs.includes(j.id) ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'}`}
                    >
                      <span className="material-symbols-outlined text-sm" style={savedJobs.includes(j.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>bookmark</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Application Status */}
          <div className="bg-primary text-white rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 leading-tight">Application Tracker</h3>
              <div className="mt-4 space-y-3">
                {(() => {
                  const statusCounts = { applied: 0, reviewing: 0, interview: 0, offered: 0 };
                  applications.forEach(a => {
                    const s = (a.status || 'applied').toLowerCase();
                    if (statusCounts[s] !== undefined) statusCounts[s]++;
                    else statusCounts.applied++;
                  });
                  return [
                    { l: 'Applied', v: statusCounts.applied || applications.length },
                    { l: 'In Review', v: statusCounts.reviewing },
                    { l: 'Interview', v: statusCounts.interview },
                    { l: 'Offered', v: statusCounts.offered },
                  ].map(s => (
                    <div key={s.l} className="flex justify-between items-center">
                      <span className="text-sm text-primary-fixed opacity-80">{s.l}</span>
                      <span className="text-lg font-black leading-none tabular-nums">{s.v}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>

          {/* Saved Jobs */}
          <div className="bg-surface-container-low rounded-xl p-8">
            <h3 className="font-bold text-primary mb-4 leading-tight">Saved Jobs</h3>
            <div className="space-y-2.5">
              {savedJobs.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No saved jobs yet. Click the bookmark icon to save.</p>
              ) : (
                jobs.filter(j => savedJobs.includes(j.id)).map(j => (
                  <div key={j.id} className="flex items-center justify-between gap-3 p-3 bg-surface-container-lowest rounded-lg">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-primary truncate block">{j.title}</span>
                      <span className="text-[10px] text-on-surface-variant">{j.company}</span>
                    </div>
                    <button onClick={() => toggleSave(j.id)} className="shrink-0 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-base leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
