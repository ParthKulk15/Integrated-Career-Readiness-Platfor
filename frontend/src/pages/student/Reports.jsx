import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentScore, getStudent } from '../../api/client';

const EMOTION_COLORS = {
  neutral: '#64748b',
  happy: '#22c55e',
  sad: '#3b82f6',
  angry: '#ef4444',
  fearful: '#f59e0b',
  disgusted: '#a855f7',
  surprised: '#06b6d4',
};

export default function Reports() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  // LocalStorage data
  const [resumeHistory, setResumeHistory] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getStudent(user.id), getStudentScore(user.id)])
      .then(([s, sc]) => { setStudent(s); setScore(sc); })
      .catch(console.error).finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    try { setResumeHistory(JSON.parse(localStorage.getItem(`resumeUploads_${user.id}`) || '[]')); } catch { setResumeHistory([]); }
    try { setInterviewSessions(JSON.parse(localStorage.getItem(`interviewSessions_${user.id}`) || '[]')); } catch { setInterviewSessions([]); }
  }, [user?.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant">Loading reports...</span></div>;

  const readiness = Math.round(score?.readinessScore || 0);
  const confidence = Math.round(score?.confidenceScore || 0);
  const skillCount = score?.skillCount || 0;

  // Compute aggregated emotion data across all sessions
  const allEmotions = {};
  let totalFrames = 0;
  interviewSessions.forEach(s => {
    if (s.emotionBreakdown) {
      Object.entries(s.emotionBreakdown).forEach(([emotion, pct]) => {
        allEmotions[emotion] = (allEmotions[emotion] || 0) + (pct * (s.totalFrames || 1));
      });
      totalFrames += (s.totalFrames || 1);
    }
  });
  const avgEmotions = {};
  if (totalFrames > 0) {
    Object.entries(allEmotions).forEach(([k, v]) => { avgEmotions[k] = Math.round(v / totalFrames); });
  }

  const avgSessionConfidence = interviewSessions.length > 0
    ? Math.round(interviewSessions.reduce((a, s) => a + (s.avgConfidence || 0), 0) / interviewSessions.length)
    : 0;

  const formatTime = (s) => {
    if (!s) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const clearInterviewData = () => {
    if (user?.id) localStorage.removeItem(`interviewSessions_${user.id}`);
    setInterviewSessions([]);
  };

  const clearResumeData = () => {
    if (user?.id) localStorage.removeItem(`resumeUploads_${user.id}`);
    setResumeHistory([]);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1">Analytics Hub</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Reports</h1>
        <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">Your complete career readiness report based on platform activity.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">

        {/* ─── Resume Report Card ─── */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-4 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
              </div>
              <h3 className="font-bold text-lg text-primary">Resume Report</h3>
            </div>
            {resumeHistory.length > 0 && (
              <button onClick={clearResumeData} className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer uppercase tracking-wider">Clear</button>
            )}
          </div>

          {resumeHistory.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">upload_file</span>
              <p className="text-sm text-on-surface-variant">No resume uploaded yet.</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Go to Resume Analyzer to upload your resume.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumeHistory.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-secondary text-lg">description</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{r.fileName}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {(r.fileSize / 1024).toFixed(1)} KB — {new Date(r.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                </div>
              ))}
              <div className="pt-3 border-t border-surface-container">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Total Uploads</span>
                  <span className="font-bold text-primary tabular-nums">{resumeHistory.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Interview Practice Report Card ─── */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-4 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl">videocam</span>
              </div>
              <h3 className="font-bold text-lg text-primary">Interview Practice</h3>
            </div>
            {interviewSessions.length > 0 && (
              <button onClick={clearInterviewData} className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer uppercase tracking-wider">Clear</button>
            )}
          </div>

          {interviewSessions.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20 mb-2 block">videocam_off</span>
              <p className="text-sm text-on-surface-variant">No interview sessions yet.</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Go to Interview Practice to start a session.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-surface-container-low rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Sessions</p>
                  <p className="text-xl font-black text-primary mt-0.5">{interviewSessions.length}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Avg Confidence</p>
                  <p className="text-xl font-black text-primary mt-0.5">{avgSessionConfidence}%</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Questions</p>
                  <p className="text-xl font-black text-primary mt-0.5">{interviewSessions.reduce((a,s) => a + (s.totalQuestions || 0), 0)}</p>
                </div>
              </div>

              {/* Latest session with per-question breakdown */}
              {interviewSessions[0]?.questionResults?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Latest Session — Per Question</h4>
                  <div className="space-y-2">
                    {interviewSessions[0].questionResults.map((qr, i) => (
                      <div key={i} className="p-3 bg-surface-container-low rounded-lg">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-secondary">{qr.skill}</span>
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-[10px] font-bold" style={{ color: EMOTION_COLORS[qr.dominantEmotion] }}>{qr.dominantEmotion}</span>
                            <span className="text-sm font-black text-primary">{qr.avgConfidence}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-primary leading-relaxed truncate">{qr.question}</p>
                        <div className="h-1 bg-surface-container rounded-full overflow-hidden mt-2">
                          <div className="h-full rounded-full" style={{ width: `${qr.avgConfidence}%`, backgroundColor: qr.avgConfidence >= 70 ? '#22c55e' : qr.avgConfidence >= 40 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Emotion Analysis (from CV) ─── */}
        {interviewSessions.length > 0 && Object.keys(avgEmotions).length > 0 && (
          <div className="col-span-12 bg-surface-container-lowest rounded-xl p-4 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">face</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">Emotion & Confidence Analysis</h3>
                <p className="text-xs text-on-surface-variant">Aggregated across {interviewSessions.length} practice sessions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Emotion bars */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4">Emotion Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(avgEmotions).sort((a, b) => b[1] - a[1]).map(([emotion, pct]) => (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="text-xs font-bold capitalize w-20 text-right text-on-surface-variant">{emotion}</span>
                      <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: EMOTION_COLORS[emotion] }} />
                      </div>
                      <span className="text-xs font-black text-primary w-10 tabular-nums">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence trend */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4">Confidence Trend</h4>
                {interviewSessions.length > 1 ? (
                  <div className="h-40 flex items-end gap-2">
                    {interviewSessions.slice(0, 10).reverse().map((s, i) => (
                      <div key={s.id} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">{s.avgConfidence}%</span>
                        <div
                          className="w-full rounded-t-lg transition-all cursor-pointer hover:opacity-80"
                          style={{
                            height: `${s.avgConfidence}%`,
                            backgroundColor: s.avgConfidence >= 70 ? '#22c55e' : s.avgConfidence >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                        <span className="text-[9px] text-on-surface-variant">#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-4xl font-black text-primary">{avgSessionConfidence}%</p>
                      <p className="text-xs text-on-surface-variant mt-1">Average Confidence</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Overall Performance Summary ─── */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-4 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">monitoring</span>
            </div>
            <h3 className="font-bold text-lg text-primary">Overall Performance Summary</h3>
          </div>

          <div className="space-y-3">
            {[
              { icon: 'school', label: 'Career Readiness Score', desc: 'Based on skills, interviews, and resume', value: `${readiness}%` },
              { icon: 'psychology', label: 'Backend Confidence Score', desc: 'From interview performance data', value: `${confidence}%` },
              { icon: 'face', label: 'Camera Confidence Score', desc: 'From facial expression analysis', value: `${avgSessionConfidence}%` },
              { icon: 'code', label: 'Skills Detected', desc: 'From resume analysis', value: skillCount },
              { icon: 'videocam', label: 'Practice Sessions', desc: 'Total camera practice attempts', value: interviewSessions.length },
              { icon: 'upload_file', label: 'Resumes Uploaded', desc: 'Total resume submissions', value: resumeHistory.length },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary text-xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-primary text-sm">{item.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-primary tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className="bg-primary text-white rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Your Profile</h3>
              <p className="text-primary-fixed opacity-70 text-sm mb-3">{student?.name || user?.name || 'Student'}</p>
              <div className="space-y-2 text-sm text-primary-fixed opacity-80">
                <p>Target: {student?.targetRole || 'Not set'}</p>
                <p>Location: {student?.location || 'Not set'}</p>
                <p>Skills: {skillCount} detected</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
