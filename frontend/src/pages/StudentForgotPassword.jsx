import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { resetStudentPassword } from '../api/client';

export default function StudentForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await resetStudentPassword(email, newPassword);
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setDone(true);
    } catch { setError('No account found with this email address.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#040918] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
      </div>
      <div className="flex-1 flex items-center justify-center relative z-10 p-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                <span className="material-symbols-outlined text-white text-3xl">lock_reset</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Reset Password</h2>
              <p className="text-white/40 text-sm">Enter your email and choose a new password</p>
            </div>
            {message && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">{message}</div>}
            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}
            {!done ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all" placeholder="you@university.edu" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all" placeholder="Re-enter password" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">{loading ? 'Resetting...' : 'Reset Password'}</button>
              </form>
            ) : (
              <Link to="/student/login" className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-center shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all">Go to Sign In</Link>
            )}
            <div className="mt-6 text-center">
              <Link to="/student/login" className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">← Back to Sign In</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
