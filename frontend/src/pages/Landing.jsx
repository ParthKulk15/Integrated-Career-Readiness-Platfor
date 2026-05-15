import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import BlurText from '../components/BlurText';

export default function Landing() {
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#040918]">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0a1628]/80 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl">

        {/* Main animated heading */}
        <BlurText
          text="Integrated Career Readiness Platform"
          delay={150}
          className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 sm:mb-8"
          animateBy="words"
          direction="top"
          stepDuration={0.4}
          onAnimationComplete={() => setShowButtons(true)}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showButtons ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm sm:text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-light px-2"
        >
          AI-powered intelligence for students seeking career mastery and recruiters discovering top talent.
        </motion.p>

        {/* Role Selection Buttons */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-stretch"
            >
              {/* Student Button */}
              <motion.button
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/student/login')}
                className="group relative w-full sm:w-72 h-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 hover:border-white/30 rounded-2xl p-6 sm:p-8 text-left backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                    <span className="material-symbols-outlined text-white text-2xl">school</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2 tracking-tight">I'm a Student</h3>
                  <p className="text-white/40 text-sm leading-relaxed">Track readiness, practice interviews, and align with the market.</p>
                </div>
              </motion.button>

              {/* Recruiter Button */}
              <motion.button
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/recruiter/login')}
                className="group relative w-full sm:w-72 h-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 hover:border-white/30 rounded-2xl p-6 sm:p-8 text-left backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                    <span className="material-symbols-outlined text-white text-2xl">business_center</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2 tracking-tight">I'm a Recruiter</h3>
                  <p className="text-white/40 text-sm leading-relaxed">Discover top talent with ML-powered matching and analytics.</p>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 text-white/20 text-xs uppercase tracking-[0.3em] font-semibold"
      >
        The Curated Architect
      </motion.div>
    </div>
  );
}
