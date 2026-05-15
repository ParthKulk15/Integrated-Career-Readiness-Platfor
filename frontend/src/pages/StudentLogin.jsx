import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { studentLogin } from '../api/client';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await studentLogin(email, password);
      login(data); // { id, name, email, role: "student" }
      navigate('/student/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#040918] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel - Branding */}
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
              Architect Your<br/>Career Path
            </h1>
            <p className="text-white/40 text-lg leading-relaxed">
              Track your readiness score, practice AI-powered interviews, and align your skills with real market demands.
            </p>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <span className="material-symbols-outlined text-blue-400 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                ML-Based Scoring
              </div>
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <span className="material-symbols-outlined text-blue-400 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                Real-time Analytics
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-white/40 text-sm">Sign in to your student account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="arjun@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white text-sm placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="password123"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/40 cursor-pointer">
                  <input type="checkbox" className="rounded bg-white/5 border-white/20 text-blue-500 focus:ring-blue-500/30" />
                  Remember me
                </label>
                <Link to="/student/forgot-password" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Forgot password?</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-white/30 text-sm">
                Don't have an account? <Link to="/student/signup" className="text-blue-400 font-semibold hover:text-blue-300">Sign up</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
