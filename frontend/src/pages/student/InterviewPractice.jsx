import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInterviewQuestions } from '../../api/client';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

function calcConfidence(expr) {
  if (!expr) return 0;
  const c = (expr.neutral||0)*30 + (expr.happy||0)*40 + (expr.surprised||0)*10
          - (expr.fearful||0)*15 - (expr.angry||0)*10 - (expr.sad||0)*10 - (expr.disgusted||0)*5;
  return Math.max(0, Math.min(100, Math.round(c)));
}

function getDominant(expr) {
  if (!expr) return 'neutral';
  return Object.entries(expr).sort((a,b) => b[1]-a[1])[0][0];
}

const ECOLORS = { neutral:'#64748b', happy:'#22c55e', sad:'#3b82f6', angry:'#ef4444', fearful:'#f59e0b', disgusted:'#a855f7', surprised:'#06b6d4' };

export default function InterviewPractice() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [emotion, setEmotion] = useState('neutral');
  const [expressions, setExpressions] = useState(null);
  const [error, setError] = useState('');

  // Questions
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  // Per-question tracking
  const [questionResults, setQuestionResults] = useState([]);
  const frameBuffer = useRef([]);

  // Speech to Text tracking
  const [answers, setAnswers] = useState({});
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef(null);

  // Session
  const [sessionDone, setSessionDone] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user?.id) {
      try {
        const stored = JSON.parse(localStorage.getItem(`interviewSessions_${user.id}`) || '[]');
        setSessions(stored);
      } catch { setSessions([]); }
    }
  }, [user?.id]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswers(prev => ({
            ...prev,
            [currentQ]: (prev[currentQ] || '') + ' ' + finalTranscript.trim()
          }));
        }
      };

      recognition.onerror = (e) => console.error('Speech recognition error:', e);
      recognition.onend = () => setIsDictating(false);
      recognitionRef.current = recognition;
    }
  }, [currentQ]);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      recognitionRef.current?.start();
      setIsDictating(true);
    }
  };

  // Load models
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;
    setModelsLoading(true);
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch { setError('Failed to load face analysis models.'); }
    finally { setModelsLoading(false); }
  }, [modelsLoaded]);

  // Fetch questions from backend (uses student's resume skills)
  const fetchQuestions = async () => {
    setQLoading(true); setError('');
    try {
      const qs = await getInterviewQuestions(user?.id, 2);
      if (qs.length === 0) {
        setError('No skills found on your profile. Please upload your resume first.');
      }
      setQuestions(qs);
    } catch {
      setError('Could not load interview questions. Upload your resume to extract skills first.');
    } finally { setQLoading(false); }
  };

  // Start camera
  const startCamera = async () => {
    setError('');
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraActive(true);
    } catch { setError('Unable to access camera/microphone.'); }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false); setRecording(false);
  };

  // Start interview session
  const startInterview = async () => {
    setQLoading(true); setError('');
    try {
      const qs = await getInterviewQuestions(user?.id, 2);
      if (!qs || qs.length === 0) {
        setError('No skills found on your profile. Please upload your resume first.');
        setQLoading(false);
        return;
      }
      setQuestions(qs);
      setCurrentQ(0); setQuestionResults([]); setSessionDone(false); frameBuffer.current = []; setAnswers({}); setIsDictating(false);
      setRecording(true); setTimer(0);
    } catch {
      setError('Could not load interview questions. Upload your resume to extract skills first.');
    } finally { setQLoading(false); }
  };

  // Move to next question
  const nextQuestion = () => {
    const frames = [...frameBuffer.current];
    const avgConf = frames.length > 0 ? Math.round(frames.reduce((a,f) => a+f.confidence, 0) / frames.length) : 0;
    const emotionCounts = {};
    frames.forEach(f => { emotionCounts[f.emotion] = (emotionCounts[f.emotion]||0) + 1; });
    const dominant = Object.entries(emotionCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'neutral';

    const q = questions[currentQ];
    const userAnswer = (answers[currentQ] || '').trim();

    setQuestionResults(prev => [...prev, {
      question: q?.question || '',
      skill: q?.skill || '',
      avgConfidence: avgConf,
      dominantEmotion: dominant,
      frames: frames.length,
      expectedAnswer: q?.expectedAnswer || '',
      userAnswer: userAnswer,
    }]);

    frameBuffer.current = [];
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  // Finish interview
  const finishInterview = () => {
    setRecording(false);
    const frames = [...frameBuffer.current];
    const avgConf = frames.length > 0 ? Math.round(frames.reduce((a,f) => a+f.confidence, 0) / frames.length) : 0;
    const emotionCounts = {};
    frames.forEach(f => { emotionCounts[f.emotion] = (emotionCounts[f.emotion]||0) + 1; });
    const dominant = Object.entries(emotionCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'neutral';

    const q = questions[currentQ];
    const userAnswer = (answers[currentQ] || '').trim();

    const allResults = [...questionResults, {
      question: q?.question || '',
      skill: q?.skill || '',
      avgConfidence: avgConf,
      dominantEmotion: dominant,
      frames: frames.length,
      expectedAnswer: q?.expectedAnswer || '',
      userAnswer: userAnswer,
    }];

    const overallConf = Math.round(allResults.reduce((a,r) => a+r.avgConfidence, 0) / allResults.length);

    const session = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: timer,
      avgConfidence: overallConf,
      dominantEmotion: dominant,
      totalQuestions: questions.length,
      questionResults: allResults,
    };

    const updated = [session, ...sessions].slice(0, 50);
    setSessions(updated);
    if (user?.id) {
      localStorage.setItem(`interviewSessions_${user.id}`, JSON.stringify(updated));
    }
    setQuestionResults(allResults);
    setSessionDone(true);
  };

  // Face detection loop
  useEffect(() => {
    if (!recording || !modelsLoaded || !videoRef.current) return;
    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.readyState < 2) return;
      try {
        const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })).withFaceExpressions();
        if (det) {
          const expr = det.expressions;
          const c = calcConfidence(expr);
          const d = getDominant(expr);
          setConfidence(c); setEmotion(d); setExpressions(expr);
          frameBuffer.current.push({ confidence: c, emotion: d, timestamp: Date.now() });

          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const box = det.detection.box;
            ctx.strokeStyle = ECOLORS[d] || '#22c55e';
            ctx.lineWidth = 2; ctx.setLineDash([6,4]);
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.setLineDash([]);
            ctx.fillStyle = ECOLORS[d]; ctx.fillRect(box.x, box.y-22, 100, 22);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillText(`${d} ${c}%`, box.x+6, box.y-7);
          }
        }
      } catch {}
    };
    const id = setInterval(detect, 500);
    return () => clearInterval(id);
  }, [recording, modelsLoaded]);

  // Timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setTimer(t => t+1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => { return () => stopCamera(); }, []);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Interview Practice</h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl text-sm leading-relaxed">
          Questions are generated from your resume skills. Answer on camera — we'll analyze your confidence and emotions in real-time.
        </p>
      </header>

      {error && <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{error}</div>}

      <div className="grid grid-cols-12 gap-6">
        {/* Camera + Question Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            {/* Video */}
            <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
              <video ref={videoRef} className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} muted playsInline />
              <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${cameraActive && recording ? 'block' : 'hidden'}`} />
              {!cameraActive && (
                <div className="text-center text-white/60 p-8">
                  <span className="material-symbols-outlined text-6xl mb-4 block text-white/20">videocam</span>
                  <p className="font-bold text-lg text-white/40">Camera Preview</p>
                  <p className="text-sm mt-1 text-white/25">Start camera, then begin interview</p>
                </div>
              )}
              {recording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-bold">{fmt(timer)}</span>
                </div>
              )}
              {recording && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Confidence</span>
                      <span className="text-sm font-black text-white">{confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confidence}%`, backgroundColor: confidence >= 70 ? '#22c55e' : confidence >= 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center shrink-0">
                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Emotion</span>
                    <span className="text-sm font-black capitalize" style={{ color: ECOLORS[emotion] }}>{emotion}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Question Display */}
            {recording && questions.length > 0 && (
              <div className="p-4 sm:p-6 bg-primary/5 border-t-2 border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-secondary">{questions[currentQ]?.skill}</span>
                </div>
                <p className="text-primary font-bold text-base leading-relaxed">{questions[currentQ]?.question}</p>
                {questions[currentQ]?.tip && (
                  <p className="text-on-surface-variant text-xs mt-2 italic">💡 Tip: {questions[currentQ]?.tip}</p>
                )}

                {/* Voice Input Textarea */}
                <div className="mt-5 relative">
                  <textarea
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-primary placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none min-h-[120px]"
                    placeholder="Click the microphone button to start dictating your answer..."
                    value={answers[currentQ] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ]: e.target.value }))}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {recognitionRef.current && (
                      <button
                        onClick={toggleDictation}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                          isDictating 
                            ? 'bg-error text-white animate-pulse shadow-error/30' 
                            : 'bg-surface-container-lowest text-secondary border border-outline-variant/30 hover:bg-secondary-container hover:text-secondary-dark hover:border-secondary/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isDictating ? 'mic' : 'mic_none'}
                        </span>
                        {isDictating ? 'Listening...' : 'Dictate'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    questions[currentQ]?.difficulty === 'Hard' ? 'bg-error-container text-error' :
                    questions[currentQ]?.difficulty === 'Medium' ? 'bg-primary-fixed text-primary' :
                    'bg-secondary-container text-secondary'
                  }`}>{questions[currentQ]?.difficulty}</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="p-4 sm:p-6 flex flex-wrap items-center gap-3">
              {!cameraActive ? (
                <button onClick={startCamera} disabled={modelsLoading} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  {modelsLoading ? 'Loading Models...' : 'Start Camera'}
                </button>
              ) : !recording && !sessionDone ? (
                <button onClick={startInterview} disabled={qLoading} className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">{qLoading ? 'hourglass_empty' : 'play_arrow'}</span>
                  {qLoading ? 'Loading Questions...' : 'Start Interview'}
                </button>
              ) : recording ? (
                <>
                  <button onClick={nextQuestion} className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{currentQ + 1 < questions.length ? 'skip_next' : 'stop'}</span>
                    {currentQ + 1 < questions.length ? 'Next Question' : 'Finish Interview'}
                  </button>
                </>
              ) : null}
              {cameraActive && !recording && (
                <button onClick={stopCamera} className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">videocam_off</span>Stop Camera
                </button>
              )}
              {sessionDone && (
                <button onClick={() => { setSessionDone(false); setQuestions([]); setCurrentQ(0); setQuestionResults([]); setAnswers({}); setIsDictating(false); }} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">replay</span>New Session
                </button>
              )}
            </div>
          </div>

          {/* Session Results */}
          {sessionDone && questionResults.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-8 border-2 border-secondary/20" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-xl">analytics</span>
                <h3 className="text-lg font-bold text-primary">Session Results — Per Question</h3>
              </div>
              <div className="space-y-4">
                {questionResults.map((r, i) => (
                  <div key={i} className="bg-surface-container-low rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Q{i+1} — {r.skill}</span>
                        <p className="text-sm font-medium text-primary mt-1 leading-relaxed">{r.question}</p>
                      </div>
                      <div className="text-center shrink-0 space-y-1">
                        <div><p className="text-xl font-black text-primary">{r.avgConfidence}%</p><p className="text-[9px] text-on-surface-variant">confidence</p></div>
                      </div>
                    </div>
                    {r.userAnswer && (
                      <div className="mt-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">🎤 Your Answer</span>
                        <p className="text-xs text-primary leading-relaxed whitespace-pre-wrap">{r.userAnswer}</p>
                      </div>
                    )}
                    {r.expectedAnswer && (
                      <div className="mt-2 p-3 bg-secondary-container/20 rounded-lg border border-secondary/20">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1">✅ Expected Answer</span>
                        <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">{r.expectedAnswer}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.avgConfidence}%`, backgroundColor: r.avgConfidence >= 70 ? '#22c55e' : r.avgConfidence >= 40 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="text-xs font-bold capitalize" style={{ color: ECOLORS[r.dominantEmotion] }}>{r.dominantEmotion}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Overall */}
              <div className="mt-6 pt-6 border-t border-surface-container flex items-center justify-center">
                <div className="text-center"><span className="text-sm font-bold text-primary block">Avg Confidence</span><span className="text-2xl font-black text-primary">{Math.round(questionResults.reduce((a,r) => a+r.avgConfidence, 0) / questionResults.length)}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Live emotions during recording */}
          {recording && expressions && (
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-secondary/20">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Live Analysis</h3>
              <div className="space-y-2">
                {Object.entries(expressions).sort((a,b) => b[1]-a[1]).map(([e, s]) => (
                  <div key={e} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold capitalize w-16 text-right" style={{ color: ECOLORS[e] }}>{e}</span>
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.round(s*100)}%`, backgroundColor: ECOLORS[e] }} />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant w-8 tabular-nums">{Math.round(s*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="bg-primary text-white rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">How it Works</h3>
              <div className="space-y-2 text-sm text-on-primary/80">
                <p>1. Upload resume to extract your skills</p>
                <p>2. Start camera and begin interview</p>
                <p>3. Questions generated from your skills</p>
                <p>4. Answer each question on camera</p>
                <p>5. Get per-question confidence analysis</p>
                <p>6. View full report in Reports page</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>

          {/* Past Sessions */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-bold text-primary mb-4">Past Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No sessions yet.</p>
            ) : (
              <div className="space-y-2.5">
                {sessions.slice(0,5).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary">{fmt(s.duration)} — {s.avgConfidence}% conf</p>
                      <p className="text-[10px] text-on-surface-variant">{s.totalQuestions || '?'} questions • {new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <span className="capitalize text-xs font-bold" style={{ color: ECOLORS[s.dominantEmotion] }}>{s.dominantEmotion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
