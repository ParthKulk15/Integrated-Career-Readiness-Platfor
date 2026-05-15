import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/recruiter/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: 'work', label: 'Job' },
  { to: '/recruiter/candidates', icon: 'group', label: 'Candidates' },
];

export default function RecruiterSidebar({ isOpen, onClose }) {
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
        flex flex-col h-screen w-72 fixed left-0 top-0 py-8 rounded-r-[3rem] z-50
        bg-surface-container-lowest dark:bg-dark-surface-container-lowest
        border-r border-outline-variant
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="px-8 mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-on-surface leading-tight">Recruiter Pro</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold mt-1">Talent Intelligence</p>
          </div>
          {/* Mobile close button */}
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface rounded-full shadow-sm ml-4 mr-2 py-3 px-5 z-10 transition-all font-semibold'
                  : 'flex items-center gap-3 text-on-surface-variant py-3 px-8 hover:translate-x-1 transition-transform hover:text-on-surface'
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-xl leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {link.icon}
                  </span>
                  <span className="text-sm font-medium">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 mt-auto pt-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.companyName?.charAt(0) || user?.name?.charAt(0) || 'R'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface leading-tight truncate">{user?.companyName || user?.name || 'Recruiter'}</p>
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
