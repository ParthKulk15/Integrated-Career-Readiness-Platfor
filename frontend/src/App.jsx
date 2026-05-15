import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import StudentLogin from './pages/StudentLogin'
import RecruiterLogin from './pages/RecruiterLogin'
import StudentForgotPassword from './pages/StudentForgotPassword'
import RecruiterForgotPassword from './pages/RecruiterForgotPassword'
import StudentSignup from './pages/StudentSignup'
import RecruiterSignup from './pages/RecruiterSignup'
import StudentLayout from './layouts/StudentLayout'
import RecruiterLayout from './layouts/RecruiterLayout'

// Student Pages
import JobOpportunities from './pages/student/JobOpportunities'
import ResumeAnalyzer from './pages/student/ResumeAnalyzer'
import InterviewPractice from './pages/student/InterviewPractice'
import Reports from './pages/student/Reports'
import Settings from './pages/student/Settings'

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import CandidatesList from './pages/recruiter/CandidatesList'
import Jobs from './pages/recruiter/Jobs'

/** Route guard — redirects to login if not authenticated with the correct role */
function RequireAuth({ role, children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={role === 'recruiter' ? '/recruiter/login' : '/student/login'} replace />
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Login routes — redirect to dashboard if already authenticated */}
      <Route
        path="/student/login"
        element={isAuthenticated && user?.role === 'student' ? <Navigate to="/student/dashboard" replace /> : <StudentLogin />}
      />
      <Route
        path="/recruiter/login"
        element={isAuthenticated && user?.role === 'recruiter' ? <Navigate to="/recruiter/dashboard" replace /> : <RecruiterLogin />}
      />
      <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
      <Route path="/recruiter/forgot-password" element={<RecruiterForgotPassword />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/recruiter/signup" element={<RecruiterSignup />} />

      {/* Student routes — protected */}
      <Route path="/student" element={<RequireAuth role="student"><StudentLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<JobOpportunities />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="interview-practice" element={<InterviewPractice />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Recruiter routes — protected */}
      <Route path="/recruiter" element={<RequireAuth role="recruiter"><RecruiterLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="candidates" element={<CandidatesList />} />
      </Route>
    </Routes>
  )
}

export default App
