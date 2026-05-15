import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../api/client';
import StudentSidebar from '../components/StudentSidebar';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      getNotifications(user.id).then(setNotifications).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-surface-container-lowest/80 dark:bg-dark-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-between md:justify-end px-4 md:px-8 py-3 shadow-sm border-b border-outline-variant">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors mr-2"
          >
            <span className="material-symbols-outlined text-xl text-on-surface leading-none">menu</span>
          </button>

          {/* Search bar removed as requested */}

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl text-on-surface leading-none" style={unreadCount > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest dark:bg-dark-surface-container-low rounded-xl shadow-2xl border border-outline-variant overflow-hidden z-50" style={{ animation: 'fadeInUp 0.2s ease-out' }}>
                  <div className="px-4 py-3 bg-surface-container dark:bg-dark-surface-container border-b border-outline-variant flex items-center justify-between">
                    <h4 className="text-sm font-bold text-on-surface">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 block mb-2">notifications_none</span>
                        <p className="text-sm text-on-surface-variant">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkRead(n.id)}
                          className={`px-4 py-3 border-b border-outline-variant/50 cursor-pointer transition-colors hover:bg-surface-container-high/50 ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`material-symbols-outlined text-lg mt-0.5 ${
                              n.type === 'SHORTLISTED' ? 'text-teal-500' : 
                              n.type === 'INTERVIEW_SCHEDULED' ? 'text-blue-500' : 'text-primary'
                            }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                              {n.type === 'SHORTLISTED' ? 'star' : 
                               n.type === 'INTERVIEW_SCHEDULED' ? 'event' : 'info'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${!n.read ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{n.message}</p>
                              <p className="text-[10px] text-on-surface-variant/60 mt-1">{formatTime(n.createdAt)}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-l pl-4 border-outline-variant">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.name || 'Student'}</p>
                <p className="text-xs text-on-surface-variant font-medium leading-tight">{user?.email || ''}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 lg:p-10 flex-1">
          <Outlet />
        </div>
      </main>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
