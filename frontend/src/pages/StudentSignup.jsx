import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function StudentSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/.test(password)) {
      setError('Password must contain at least 1 uppercase letter and 1 special character');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Signup failed');
      }
      const student = await res.json();
      login({
        id: student.studentId,
        name: student.name,
        email: student.email,
        role: 'student',
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message?.includes('409') || err.message?.includes('Conflict')
        ? 'This email is already registered. Please sign in.'
        : err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#040918] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 p-16">
        <div className="max-w-lg">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Link to="/" className="inline-flex items-center gap-2 text-white/40 text-sm mb-12 hover:text-white/60 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to home
            </Link>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30">
              <span className="material-symbols-outlined text-white text-3xl">school</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Start Your<br/>Career Journey
            </h1>
            <p className="text-white/40 text-lg leading-relaxed">
              Create your account to access resume analysis, AI-powered interview practice, and career readiness tracking.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-md">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
              <p className="text-white/40 text-sm">Sign up as a student</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="Your full name" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="Min 6 characters" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="Repeat password" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-white/30 text-sm">
                Already have an account? <Link to="/student/login" className="text-blue-400 font-semibold hover:text-blue-300">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
