import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudent, updateStudent } from '../../api/client';

export default function Settings() {
  const { user, login } = useAuth();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', skills: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getStudent(user.id).then(s => {
      setStudent(s);
      setForm({
        name: s.name || '',
        email: s.email || '',
        skills: (s.skills || []).join(', '),
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      const skillsArray = form.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const updated = await updateStudent(user.id, {
        name: form.name,
        email: form.email,
        skills: skillsArray,
      });
      setStudent(updated);
      login({ ...user, name: updated.name, email: updated.email });
      setSaveMsg('Profile saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    const skills = form.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== skillToRemove);
    setForm({ ...form, skills: skills.join(', ') });
  };

  const currentSkills = form.skills
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-on-surface-variant">Loading...</span></div>;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1">Preferences</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Settings</h1>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Form */}
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-8">
            <h3 className="text-lg font-bold text-primary mb-6">Profile Information</h3>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm opacity-60 cursor-not-allowed"
                />
                <p className="text-[10px] text-on-surface-variant/50 mt-1">Email cannot be changed.</p>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Skills</label>

                {/* Skill Chips */}
                {currentSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container/30 text-secondary rounded-full text-xs font-bold">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-error transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="Enter skills separated by commas (e.g. React, Java, Python)"
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <p className="text-[10px] text-on-surface-variant/50 mt-1">Separate skills with commas. They will be saved as tags on your profile.</p>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Changes
                    </>
                  )}
                </button>
                {saveMsg && (
                  <span className={`text-sm font-bold ${saveMsg.includes('success') ? 'text-secondary' : 'text-error'}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* Profile Preview Card */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <div className="bg-surface-container-low rounded-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary/10">
              {(form.name || student?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <h4 className="font-bold text-primary text-lg">{form.name || student?.name || 'Student'}</h4>
            <p className="text-sm text-on-surface-variant mt-0.5">{form.email || student?.email || ''}</p>
            <div className="mt-4 pt-4 border-t border-surface-container">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Skills ({currentSkills.length})</p>
              {currentSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {currentSkills.slice(0, 8).map(s => (
                    <span key={s} className="px-2 py-1 bg-primary/5 rounded-full text-[10px] font-bold text-primary">{s}</span>
                  ))}
                  {currentSkills.length > 8 && <span className="text-[10px] text-on-surface-variant/50">+{currentSkills.length - 8} more</span>}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant/50">No skills added</p>
              )}
            </div>
          </div>

          <div className="bg-primary rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-on-primary font-bold text-lg mb-2">Quick Tips</h4>
              <div className="space-y-2 text-sm text-on-primary/70">
                <p>✦ Keep your profile up to date</p>
                <p>✦ Add relevant skills for better matching</p>
                <p>✦ Upload your latest resume</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
