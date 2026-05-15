import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadResume } from '../../api/client';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(f.type)) {
      return 'Only PDF, DOC, and DOCX files are accepted.';
    }
    if (f.size > MAX_SIZE) {
      return 'File size must be under 5MB.';
    }
    return null;
  };

  const handleFileSelect = (f) => {
    setError('');
    setUploadResult(null);
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setUploadResult(null);
    try {
      const sid = user?.id || user?.studentId;
      const result = await uploadResume(file, sid);
      setUploadResult(result);
      // Save to localStorage for Reports page — only if we have a valid student ID
      if (sid != null && sid !== '' && sid !== undefined) {
        const storageKey = `resumeUploads_${sid}`;
        const resumeHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
        resumeHistory.unshift({
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          result,
        });
        localStorage.setItem(storageKey, JSON.stringify(resumeHistory.slice(0, 20)));
      }
      setFile(null);

    } catch {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-secondary font-bold text-sm tracking-widest uppercase mb-1">Document Hub</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Resume Analyzer</h1>
        <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">Upload your resume to have it analyzed for skills and market alignment.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-8">
            <h3 className="text-lg font-bold text-primary mb-6 leading-tight">
              Upload Your Resume
            </h3>

            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-secondary bg-secondary-container/10 scale-[1.01]'
                  : file
                    ? 'border-secondary/40 bg-secondary-container/5'
                    : 'border-outline-variant/40 hover:border-primary/30 hover:bg-surface-container-low/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleInputChange}
              />

              {!file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  </div>
                  <div>
                    <p className="text-on-surface font-bold text-sm">Drag and drop your resume here</p>
                    <p className="text-on-surface-variant text-xs mt-1">or click to browse files</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    Browse File
                  </button>
                  <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">PDF, DOC, DOCX — Max 5MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-5 text-left">
                  <div className="w-14 h-14 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-2xl">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-sm truncate">{file.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{formatSize(file.size)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-secondary text-xs">check_circle</span>
                      <span className="text-[10px] text-secondary font-bold">Ready to upload</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="p-2 rounded-full hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-all cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload button */}
            {file && (
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Upload Resume
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-error text-sm font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {uploadResult && (
              <div className="mt-6 bg-secondary-container/20 rounded-xl p-6 border border-secondary/10" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  <span className="font-bold text-primary text-sm">Resume analyzed successfully!</span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Skills Found</p>
                    <p className="text-xl font-black text-primary mt-0.5">{uploadResult.totalSkillsDetected || 0}</p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Alignment</p>
                    <p className="text-xl font-black text-primary mt-0.5">{uploadResult.alignmentScore?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Level</p>
                    <p className="text-xl font-black text-secondary mt-0.5">{uploadResult.level || '—'}</p>
                  </div>
                </div>

                {/* Extracted Skills */}
                {uploadResult.extractedSkills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-3">Extracted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {uploadResult.extractedSkills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-secondary-container/30 text-secondary rounded-full text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-3">
                      ✦ These skills will be used to generate interview questions in the <b>Interview Practice</b> page.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Upload History */}
          {(() => {
            const sid = user?.id || user?.studentId;
            if (!sid) return null;
            const history = JSON.parse(localStorage.getItem(`resumeUploads_${sid}`) || '[]');
            if (history.length === 0) return null;
            return (
              <section className="bg-surface-container-low rounded-xl p-8 mt-5">
                <h3 className="text-lg font-bold text-primary mb-4 leading-tight">Upload History</h3>
                <div className="space-y-3">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-xl">
                      <span className="material-symbols-outlined text-primary text-lg">description</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{h.fileName}</p>
                        <p className="text-[10px] text-on-surface-variant">{formatSize(h.fileSize)} — {new Date(h.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-primary rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-secondary/40" />
            <h4 className="text-on-primary font-bold text-lg mb-2 relative z-10 leading-tight">How it Works</h4>
            <p className="text-on-primary/70 text-sm mb-4 relative z-10 leading-relaxed">
              Upload your resume file and we'll extract skills, compute alignment scores, and save results to your profile.
            </p>
            <div className="relative z-10 space-y-2 text-sm text-on-primary/80">
              <p>✦ Supported formats: PDF, DOC, DOCX</p>
              <p>✦ Skills are matched against industry keywords</p>
              <p>✦ Skills power interview questions generation</p>
              <p>✦ Results appear in your Reports page</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
