import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'career_platform_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    // Clear user-specific localStorage data so it doesn't leak to
    // a new account that may receive the same student ID
    if (user?.id) {
      localStorage.removeItem(`resumeUploads_${user.id}`);
      localStorage.removeItem(`interviewSessions_${user.id}`);
    }
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'recruiter';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isStudent, isRecruiter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
