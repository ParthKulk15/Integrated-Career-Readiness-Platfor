import { useEffect, useState } from 'react';
import { getJobsByRecruiter, deleteJob, getApplicationsByJob, scheduleInterview, createJob } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Job Listing State
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicants, setApplicants] = useState({}); // { jobId: [applicants] }
  
  // Post Job State
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({
    jobRole: '',
    companyName: user?.companyName || '',
    location: '',
    department: '',
    description: '',
    openings: 1,
    skills: '',
  });

  // Interview Modal State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '', link: '' });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  const fetchJobs = async () => {
    try {
      const data = await getJobsByRecruiter(user.id);
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  // --- Job Management ---
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job posting? This action cannot be undone.')) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
      setSuccessMsg('Job posting removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to delete job.');
    }
  };

  const toggleJobExpand = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }

    setExpandedJobId(jobId);
    if (!applicants[jobId]) {
      try {
        const apps = await getApplicationsByJob(jobId);
        setApplicants(prev => ({ ...prev, [jobId]: apps }));
      } catch (err) {
        console.error('Failed to load applicants', err);
      }
    }
  };

  // --- Post Job Logic ---
  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    try {
      const skillsList = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const newJobRaw = await createJob({
        jobRole: form.jobRole,
        companyName: form.companyName || user?.companyName || 'Unknown',
        location: form.location,
        department: form.department,
        description: form.description,
        openings: parseInt(form.openings) || 1,
        requiredSkills: skillsList,
        recruiterId: user?.id,
        featured: false,
      });

      // Map back to JobResponse structure if necessary, though createJob usually returns the created entity
      // Backend returns Job entity which we might need to map to JobResponse style
      const newJob = {
        id: newJobRaw.jobId,
        title: newJobRaw.jobRole,
        company: newJobRaw.companyName,
        location: newJobRaw.location,
        department: newJobRaw.department,
        openings: newJobRaw.openings,
        applicants: 0,
        skills: newJobRaw.requiredSkills || skillsList,
        featured: newJobRaw.featured || false,
      };

      setJobs(prev => [newJob, ...prev]);
      setForm({ jobRole: '', companyName: user?.companyName || '', location: '', department: '', description: '', openings: 1, skills: '' });
      setShowPostForm(false);
      setSuccessMsg('Job posted successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Failed to post job. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // --- Interview Scheduling ---
  const openInterviewModal = (app) => {
    setSelectedApp(app);
    setShowInterviewModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const dateTime = `${interviewDetails.date}T${interviewDetails.time}:00`;
      await scheduleInterview(selectedApp.id, {
        interviewDate: dateTime,
        interviewLink: interviewDetails.link,
        recruiterId: user.id
      });
      
      // Update local applicants state
      setApplicants(prev => {
        const jobApps = prev[expandedJobId].map(a => 
          a.id === selectedApp.id ? { ...a, status: 'interview', interviewDate: dateTime, interviewLink: interviewDetails.link } : a
        );
        return { ...prev, [expandedJobId]: jobApps };
      });

      setSuccessMsg('Interview scheduled successfully!');
      setShowInterviewModal(false);
      setInterviewDetails({ date: '', time: '', link: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant">Loading jobs...</span></div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Job Management</h1>
          <p className="text-on-surface-variant text-sm">Post new roles and manage existing applications.</p>
        </div>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.97] cursor-pointer ${
            showPostForm 
              ? 'bg-surface-container-high text-on-surface-variant' 
              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-teal-500/20 hover:shadow-teal-500/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg leading-none">{showPostForm ? 'close' : 'add'}</span>
          {showPostForm ? 'Cancel' : 'Post New Job'}
        </button>
      </header>

      {error && <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium animate-fadeIn">{error}</div>}
      {successMsg && <div className="bg-secondary-container/30 text-secondary border border-secondary/20 rounded-xl p-4 text-sm font-medium animate-fadeIn">{successMsg}</div>}

      {/* --- Post Job Form --- */}
      {showPostForm && (
        <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-8 shadow-xl border border-outline-variant animate-fadeInDown">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500">edit_note</span>
            Create New Job Posting
          </h2>
          <form onSubmit={handlePostSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Job Title *</label>
                <input name="jobRole" value={form.jobRole} onChange={handleFormChange} required
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Company Name</label>
                <input name="companyName" value={form.companyName} onChange={handleFormChange}
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder={user?.companyName || 'Your company'} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Location *</label>
                <input name="location" value={form.location} onChange={handleFormChange} required
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder="e.g. Remote, Mumbai" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Department</label>
                <input name="department" value={form.department} onChange={handleFormChange}
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder="e.g. Engineering, Sales" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Openings</label>
                <input name="openings" type="number" min="1" value={form.openings} onChange={handleFormChange}
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Required Skills (comma separated)</label>
                <input name="skills" value={form.skills} onChange={handleFormChange}
                  className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder="React, Node.js, SQL" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} required rows="4"
                className="w-full border border-surface-container-high bg-surface-container-lowest rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
                placeholder="Detail the role responsibilities and requirements..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowPostForm(false)}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={posting}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-teal-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-lg leading-none">publish</span>
                {posting ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Jobs List --- */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-16 text-center border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">work_history</span>
            <p className="text-on-surface-variant font-bold text-lg">No active job listings</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">Ready to find talent? Post your first job today.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-primary truncate">{job.title}</h3>
                    {job.featured && <span className="bg-tertiary-fixed text-tertiary text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-tertiary/20">Featured</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-surface-variant font-semibold">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-teal-500">business</span>{job.company}</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-teal-500">location_on</span>{job.location}</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-teal-500">groups</span>{job.applicants || 0} Applicants</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg text-teal-500">category</span>{job.department}</span>
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-lg">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-surface-container">
                  <button 
                    onClick={() => toggleJobExpand(job.id)}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      expandedJobId === job.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-primary/5 text-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{expandedJobId === job.id ? 'expand_less' : 'person_search'}</span>
                    {expandedJobId === job.id ? 'Close' : 'Applicants'}
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-3 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-2xl transition-all"
                    title="Remove Posting"
                  >
                    <span className="material-symbols-outlined text-2xl">delete_sweep</span>
                  </button>
                </div>
              </div>

              {/* Expandable Applicants Section */}
              {expandedJobId === job.id && (
                <div className="bg-surface-container-lowest border-t border-surface-container p-6 md:p-8 animate-fadeInDown">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Candidate Pipeline</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant/60">{applicants[job.id]?.length || 0} Total</span>
                  </div>
                  
                  {!applicants[job.id] ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                  ) : applicants[job.id].length === 0 ? (
                    <div className="py-10 text-center bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant">
                      <p className="text-xs text-on-surface-variant font-medium italic">No applications received yet for this role.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {applicants[job.id].map(app => (
                        <div key={app.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:border-teal-500/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">
                              {app.name[0]}
                            </div>
                            <div>
                              <p className="text-base font-bold text-primary leading-none mb-1.5">{app.name}</p>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                                  app.status === 'interview' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                                }`}>
                                  {app.status}
                                </span>
                                <span className="text-[10px] font-bold text-on-surface-variant">Match: <span className="text-secondary">{app.score}%</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {app.status === 'interview' ? (
                              <div className="px-5 py-2.5 bg-secondary-container/30 text-secondary rounded-xl text-[11px] font-bold border border-secondary/20 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">verified</span>
                                Interview Scheduled
                              </div>
                            ) : (
                              <button 
                                onClick={() => openInterviewModal(app)}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                                Schedule Interview
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- Schedule Interview Modal --- */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border border-outline-variant">
            <div className="bg-primary p-4 sm:p-8 text-white relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black tracking-tight">Schedule Interview</h2>
                <button onClick={() => setShowInterviewModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-bold">
                  {selectedApp?.name[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedApp?.name}</p>
                  <p className="text-primary-fixed opacity-70 text-xs font-medium uppercase tracking-widest">{selectedApp?.role}</p>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="p-4 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Date</label>
                  <input 
                    required 
                    type="date" 
                    value={interviewDetails.date}
                    onChange={e => setInterviewDetails({...interviewDetails, date: e.target.value})}
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Time</label>
                  <input 
                    required 
                    type="time" 
                    value={interviewDetails.time}
                    onChange={e => setInterviewDetails({...interviewDetails, time: e.target.value})}
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">Meeting Link</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">link</span>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://meet.google.com/..."
                    value={interviewDetails.link}
                    onChange={e => setInterviewDetails({...interviewDetails, link: e.target.value})}
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl pl-14 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Discard
                </button>
                <button 
                  disabled={scheduling}
                  className="flex-[2] bg-primary text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {scheduling ? 'Scheduling...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
