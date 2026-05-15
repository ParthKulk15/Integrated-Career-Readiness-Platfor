import { useEffect, useMemo, useState } from 'react';
import { getCandidates, shortlistCandidate } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  new: { label: 'New', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-tertiary-fixed', text: 'text-tertiary' },
};

export default function CandidatesList() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('readiness');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [shortlistSuccess, setShortlistSuccess] = useState('');

  useEffect(() => {
    getCandidates()
      .then(data => {
        setCandidates(data);
        // Pre-populate shortlistedIds from backend data so already-shortlisted
        // candidates stay marked after page refresh
        const alreadyShortlisted = new Set(
          data.filter(c => c.status === 'shortlisted').map(c => c.candidateId)
        );
        setShortlistedIds(alreadyShortlisted);
      })
      .catch(() => setError('Unable to load candidates.'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const totals = { all: candidates.length };
    candidates.forEach(c => {
      totals[c.status] = (totals[c.status] || 0) + 1;
    });
    return totals;
  }, [candidates]);

  const filtered = useMemo(() => candidates
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'readiness' ? b.readiness - a.readiness : a.name.localeCompare(b.name)), [candidates, filter, search, sortBy]);

  const renderStatus = status => {
    const config = statusConfig[status] || statusConfig.new;
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleShortlist = async (candidate) => {
    try {
      const message = `Congratulations! You have been shortlisted by ${user?.companyName || 'a recruiter'}. Please prepare for the next steps in the hiring process.`;
      await shortlistCandidate(candidate.candidateId, user?.id, message);
      setShortlistedIds(prev => new Set([...prev, candidate.candidateId]));
      setShortlistSuccess(`${candidate.name} has been shortlisted!`);
      setTimeout(() => setShortlistSuccess(''), 4000);
    } catch {
      setError('Failed to shortlist candidate.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Candidates Pipeline</h1>
          <p className="text-on-surface-variant text-sm">{candidates.length} total candidates across all stages</p>
        </div>
      </div>

      {error && <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium">{error}</div>}
      {shortlistSuccess && (
        <div className="bg-secondary-container/30 border border-secondary/20 rounded-xl p-4 text-secondary text-sm font-medium flex items-center gap-2" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
          {shortlistSuccess}
        </div>
      )}

      {/* Status filter pills */}
      <section className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          All ({counts.all})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {cfg.label} ({counts[key] || 0})
          </button>
        ))}
      </section>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center bg-surface-container-lowest px-4 py-2.5 rounded-full flex-1 max-w-md border border-surface-container">
          <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
          <input className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-on-surface-variant/50" placeholder="Search by name or role..." type="text" value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')} className="ml-2 text-on-surface-variant hover:text-primary cursor-pointer">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-surface-container-lowest border border-surface-container rounded-full px-4 py-2 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
          <option value="readiness">Sort: Readiness</option>
          <option value="name">Sort: Name A-Z</option>
        </select>
      </div>

      {loading ? (
        <section className="bg-surface-container-lowest rounded-xl p-8 text-sm text-on-surface-variant">Loading candidates...</section>
      ) : filtered.length === 0 ? (
        <section className="bg-surface-container-lowest rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 block mb-3">person_off</span>
          <p className="text-sm text-on-surface-variant">No candidates match your filters.</p>
        </section>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div className="col-span-4">Candidate</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1 text-center">Readiness</div>
            <div className="col-span-2">Skills</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Candidate Rows */}
          <div className="divide-y divide-surface-container">
            {filtered.map(c => (
              <div key={c.candidateId}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 sm:px-8 py-4 items-center hover:bg-surface-container-low/50 transition-colors group">
                  <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-secondary/10 bg-surface-container-lowest p-0.5 shrink-0">
                      {c.img ? (
                        <img alt={c.name} className="w-full h-full object-cover rounded-full" src={c.img} />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-xs">{c.name?.[0]}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary text-sm truncate">{c.name}</h3>
                      <p className="text-[10px] text-on-surface-variant truncate">{c.location}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-on-surface-variant font-medium truncate">{c.role}</div>
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-black ${c.readiness >= 90 ? 'text-secondary' : c.readiness >= 80 ? 'text-primary' : 'text-on-tertiary-container'}`}>{c.readiness}%</span>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {c.skills?.slice(0, 2).map(s => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 bg-surface-container rounded-full text-on-surface-variant font-medium">{s}</span>
                    ))}
                    {c.skills?.length > 2 && <span className="text-[9px] px-1.5 py-0.5 bg-surface-container rounded-full text-on-surface-variant font-medium">+{c.skills.length - 2}</span>}
                  </div>
                  <div className="col-span-1">{renderStatus(c.status)}</div>
                  <div className="col-span-2 flex justify-center gap-2">
                    <button
                      onClick={() => toggleExpand(c.candidateId)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        expandedId === c.candidateId
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-primary hover:bg-primary-fixed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{expandedId === c.candidateId ? 'expand_less' : 'person'}</span>
                      {expandedId === c.candidateId ? 'Close' : 'View'}
                    </button>
                    {!shortlistedIds.has(c.candidateId) ? (
                    <button
                      onClick={() => handleShortlist(c)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/20"
                    >
                      <span className="material-symbols-outlined text-xs">star</span>
                      Shortlist
                    </button>
                    ) : (
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container/30 text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Shortlisted
                    </span>
                    )}
                  </div>
                </div>

                {/* Expanded Profile Panel */}
                {expandedId === c.candidateId && (
                  <div className="px-4 sm:px-8 pb-6 border-t border-surface-container bg-surface-container-low/30" style={{ animation: 'slideDown 0.3s ease-out' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                      {/* Profile Info */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-primary mb-3">Profile Details</h4>
                        <div className="space-y-2">
                          {[
                            { label: 'Name', value: c.name },
                            { label: 'Email', value: c.email || 'Not provided' },
                            { label: 'Role', value: c.role },
                            { label: 'Location', value: c.location },
                            { label: 'Applied', value: c.applied },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between">
                              <span className="text-xs text-on-surface-variant">{item.label}</span>
                              <span className="text-xs font-bold text-primary">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="text-sm font-bold text-primary mb-3">Skills ({c.skills?.length || 0})</h4>
                        <div className="flex flex-wrap gap-2">
                          {(c.skills || []).map(s => (
                            <span key={s} className="px-3 py-1.5 bg-secondary-container/30 text-secondary rounded-full text-xs font-bold">{s}</span>
                          ))}
                          {(!c.skills || c.skills.length === 0) && <p className="text-xs text-on-surface-variant">No skills listed</p>}
                        </div>
                      </div>

                      {/* Readiness & Status */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-primary mb-3">Readiness Score</h4>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black ${c.readiness >= 90 ? 'text-secondary' : c.readiness >= 80 ? 'text-primary' : 'text-on-tertiary-container'}`}>{c.readiness}%</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden mt-2">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${c.readiness >= 90 ? 'bg-secondary' : c.readiness >= 80 ? 'bg-primary' : 'bg-on-tertiary-container'}`}
                              style={{ width: `${c.readiness}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-primary mb-2">Status</h4>
                          {renderStatus(c.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
      `}</style>
    </div>
  );
}
