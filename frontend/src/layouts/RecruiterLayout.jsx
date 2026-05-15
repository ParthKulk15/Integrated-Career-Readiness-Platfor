import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecruiterSidebar from '../components/RecruiterSidebar';

export default function RecruiterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-surface">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col min-w-0">
        <header className="bg-surface-container-lowest/80 dark:bg-dark-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex justify-between items-center w-full px-4 md:px-8 py-3 sticky top-0 z-20 border-b border-outline-variant">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-on-surface leading-none">menu</span>
            </button>
            <div className="text-xl font-black text-on-surface leading-none">Intelligence Layer</div>
            {/* Search bar removed as requested */}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.companyName?.charAt(0) || user?.name?.charAt(0) || 'R'}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
