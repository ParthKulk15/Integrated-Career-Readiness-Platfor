import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/student/dashboard', icon: 'work', label: 'Job Opportunities' },
  { to: '/student/resume-analyzer', icon: 'description', label: 'Resume Analyzer' },
  { to: '/student/interview-practice', icon: 'videocam', label: 'Interview Practice' },
  { to: '/student/reports', icon: 'assessment', label: 'Reports' },
  { to: '/student/settings', icon: 'settings', label: 'Settings' },
];

export default function StudentSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        flex flex-col h-screen w-72 fixed left-0 top-0 py-8 z-50
        bg-surface-container-lowest dark:bg-dark-surface-container-lowest
        border-r border-outline-variant
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="px-8 mb-8 flex items-center justify-between">
          <a href="/student/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-xl leading-none">architecture</span>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tighter text-on-surface leading-tight">Intelligence Layer</div>
              <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase leading-tight mt-0.5">Career Platform</div>
            </div>
          </a>
          {/* Mobile close button */}
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface rounded-xl border-l-4 border-primary font-bold py-2.5 pl-5 pr-4 transition-all'
                  : 'flex items-center gap-3 text-on-surface-variant hover:text-on-surface py-2.5 px-5 transition-colors hover:bg-surface-container-high/50 dark:hover:bg-dark-surface-container-high/50 rounded-xl'
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-xl leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {link.icon}
                  </span>
                  <span className="font-['Manrope'] text-[13px] font-semibold tracking-tight">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 mt-auto pt-4 border-t border-outline-variant space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface leading-tight truncate">{user?.name || 'Student'}</p>
              <p className="text-[10px] text-on-surface-variant leading-tight truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-lg transition-colors w-full"
          >
            <span className="material-symbols-outlined text-base leading-none">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-[13px] font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg leading-none">logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
