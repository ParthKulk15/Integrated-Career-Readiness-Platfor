const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(options.headers || {}),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getCandidates() {
  return request('/candidates');
}

export function getJobs() {
  return request('/jobs');
}

export function createJob(job) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });
}

export function deleteJob(jobId) {
  return request(`/jobs/${jobId}`, { method: 'DELETE' });
}

export function getApplicationsByJob(jobId) {
  return request(`/applications/job/${jobId}`);
}

export function getStudentApplications(studentId) {
  return request(`/applications/student/${studentId}`);
}

export function createApplication(studentId, jobId) {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify({ studentId, jobId }),
  });
}

export function deleteApplication(applicationId) {
  return request(`/applications/${applicationId}`, { method: 'DELETE' });
}

export function getRecentApplications() {
  return request('/applications/recent');
}


export function verifyCertificate(payload) {
  return request('/certificates/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function studentLogin(email, password) {
  return request('/students/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function recruiterLogin(email, password) {
  return request('/recruiters/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getStudentScore(studentId) {
  return request(`/students/${studentId}/score`);
}

export function analyzeResume(resumeText, studentId) {
  return request('/resume/analyze', {
    method: 'POST',
    body: JSON.stringify({ resumeText, studentId }),
  });
}

/** Upload resume as file (FormData) */
export function uploadResume(file, studentId) {
  const formData = new FormData();
  formData.append('file', file);
  if (studentId != null) {
    formData.append('studentId', studentId);
  }
  return request('/resume/upload', {
    method: 'POST',
    body: formData,
  });
}

export function startInterview(studentId, category) {
  return request(`/interview/start/${studentId}`, {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
}

export function getInterviewHistory(studentId) {
  return request(`/interview/${studentId}`);
}

/** Get interview questions generated from student's resume skills */
export function getInterviewQuestions(studentId, countPerSkill = 2) {
  return request(`/interview/questions/${studentId}?count=${countPerSkill}`);
}

export function getDashboardStats() {
  return request('/dashboard/stats');
}

export function getStudent(studentId) {
  return request(`/students/${studentId}`);
}

export function updateStudent(studentId, updates) {
  return request(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function resetStudentPassword(email, newPassword) {
  return request('/students/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
}

export function resetRecruiterPassword(email, newPassword) {
  return request('/recruiters/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
}

export function getCandidate(candidateId) {
  return request(`/candidates/${candidateId}`);
}



/** Get skill-based quiz questions for a student (from their extracted resume skills) */
export function getStudentQuestions(studentId, countPerSkill = 2) {
  return request(`/resume/questions/${studentId}?count=${countPerSkill}`);
}

/** Generate questions for arbitrary skill list */
export function generateQuestions(skills, countPerSkill = 2) {
  return request('/resume/questions', {
    method: 'POST',
    body: JSON.stringify({ skills, count: countPerSkill }),
  });
}

/** Get jobs posted by a specific recruiter */
export function getJobsByRecruiter(recruiterId) {
  return request(`/jobs/recruiter/${recruiterId}`);
}

/** Shortlist a candidate — sends notification to the student */
export function shortlistCandidate(studentId, recruiterId, message) {
  return request('/notifications/shortlist', {
    method: 'POST',
    body: JSON.stringify({ studentId, recruiterId, message }),
  });
}

/** Get notifications for a student */
export function getNotifications(studentId) {
  return request(`/notifications/student/${studentId}`);
}

/** Get notifications for a recruiter */
export function getRecruiterNotifications(recruiterId) {
  return request(`/notifications/recruiter/${recruiterId}`);
}

/** Mark a notification as read */
export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

/** Schedule an interview for an application */
export function scheduleInterview(applicationId, details) {
  return request(`/applications/${applicationId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

