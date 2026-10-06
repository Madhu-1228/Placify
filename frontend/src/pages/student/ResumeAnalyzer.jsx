import React, { useState, useEffect, useRef } from 'react';
import { resumeService } from '../../services/resumeService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CircularScore from '../../components/common/CircularScore';
import Alert from '../../components/common/Alert';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FolderGit2,
  History,
  Tag,
  Check,
  X,
  Cpu,
  RefreshCw,
  Clock,
  FileCheck,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetSkillsInput, setTargetSkillsInput] = useState('');
  const [targetSkills, setTargetSkills] = useState(['Java', 'React', 'Data Structures', 'SQL', 'Docker']);
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [scanStep, setScanStep] = useState(1);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [latest, hist] = await Promise.all([
        resumeService.getLatest().catch(() => null),
        resumeService.getHistory().catch(() => [])
      ]);
      if (latest) setCurrentAnalysis(latest);
      setHistory(hist || []);
    } catch (e) {
      console.error('Error loading initial resume data:', e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset input value so re-selecting same file triggers event
      e.target.value = '';

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setCurrentAnalysis(null);
        setSelectedFile(null);
        setAlert({ type: 'error', message: 'Only PDF documents (.pdf) are supported for resume evaluation.' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setCurrentAnalysis(null);
        setSelectedFile(null);
        setAlert({ type: 'error', message: 'File size exceeds maximum limit of 10MB.' });
        return;
      }
      setSelectedFile(file);
      setCurrentAnalysis(null);
      setAlert({ type: '', message: '' });

      // Automatically trigger analysis if autoAnalyze is true
      if (autoAnalyze) {
        runAnalysis(file);
      }
    }
  };

  const handleAddSkill = () => {
    if (targetSkillsInput.trim() && !targetSkills.includes(targetSkillsInput.trim())) {
      setTargetSkills([...targetSkills, targetSkillsInput.trim()]);
      setTargetSkillsInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setTargetSkills(targetSkills.filter(s => s !== skill));
  };

  const runAnalysis = async (fileToAnalyze) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) {
      setAlert({ type: 'error', message: 'Please select a PDF resume file from your computer first.' });
      return;
    }

    // Immediately clear previous analysis and score so no stale results are displayed
    setCurrentAnalysis(null);
    setLoading(true);
    setScanStep(1);
    setAlert({ type: '', message: '' });

    // Animated scanner steps
    const step1Timer = setTimeout(() => setScanStep(2), 1200);
    const step2Timer = setTimeout(() => setScanStep(3), 2800);

    try {
      const result = await resumeService.analyzeResume(file, targetSkills);
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);

      setCurrentAnalysis(result);
      setSelectedFile(file);
      setAlert({
        type: 'success',
        message: `✨ "${file.name}" successfully analyzed!`
      });

      // Refresh scan history
      const hist = await resumeService.getHistory();
      setHistory(hist || []);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      console.error(err);
      setCurrentAnalysis(null);
      const errMsg = err.response?.data?.message || 'This document does not appear to be a resume or CV. Please upload a valid resume in PDF format to use the Resume Analyzer.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
      setScanStep(1);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runAnalysis(selectedFile);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '2.25rem 2.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 248, 241, 0.15)', border: '1px solid rgba(255, 248, 241, 0.25)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#FFF8F1', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Sparkles size={14} color="#D4A24C" /> GEMINI AI ATS INTELLIGENCE
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFF8F1', margin: 0 }}>
            AI Resume Analyzer & ATS Readiness
          </h1>
          <p style={{ color: '#F7DDD4', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500, maxWidth: '650px' }}>
            Upload your PDF resume for instant ATS scoring, keyword extraction, and deep Gemini AI placement recommendations.
          </p>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Upload Zone Card */}
      <Card hover={false} title="Upload Resume for Analysis" subtitle="Supports PDF format with selectable text (Max 10MB)" icon={UploadCloud}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
          {/* Drag & Drop File Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: selectedFile ? '2px solid #C65D3A' : '2px dashed #E8DAD4',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? '#FDF4EC' : '#FFF8F1',
              transition: 'all 0.15s ease'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: selectedFile ? '#FBE9DF' : '#FFFFFF',
                color: selectedFile ? '#C65D3A' : '#746B6D',
                border: '1px solid #E8DAD4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={24} />
              </div>

              <div>
                <strong style={{ fontSize: '1rem', color: selectedFile ? '#C65D3A' : '#292326' }}>
                  {selectedFile ? selectedFile.name : 'Choose or Browse PDF Resume'}
                </strong>
                <p style={{ fontSize: '0.8rem', color: '#746B6D', marginTop: '0.15rem' }}>
                  {selectedFile ? 'File attached. Click to change file.' : 'Click to select PDF from local file storage'}
                </p>
              </div>

              <span style={{ fontSize: '0.76rem', color: '#746B6D' }}>
                {selectedFile
                  ? `📄 ${(selectedFile.size / 1024).toFixed(1)} KB — Ready to analyze with Gemini AI`
                  : 'Select file from local storage (.pdf, max 10MB)'}
              </span>
            </div>
          </div>

          {/* Target Skills Tag Selector */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326', display: 'block', marginBottom: '0.35rem' }}>
              Benchmark Against Target Job Skills (Optional)
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.65rem', maxWidth: '420px' }}>
              <input
                placeholder="Add target skill (e.g. Spring Boot, AWS, Kafka)..."
                value={targetSkillsInput}
                onChange={(e) => setTargetSkillsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #E8DAD4',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#292326',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}>
                Add
              </Button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {targetSkills.map(s => (
                <span
                  key={s}
                  style={{
                    background: '#FDF4EC',
                    border: '1px solid #E8DAD4',
                    color: '#C65D3A',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 650,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              type="submit"
              variant="primary"
              icon={Sparkles}
              disabled={loading || !selectedFile}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              {loading
                ? scanStep === 1
                  ? 'Extracting PDF with PDFBox...'
                  : scanStep === 2
                  ? 'Evaluating with Gemini AI...'
                  : 'Computing ATS Compatibility...'
                : selectedFile
                ? `⚡ Analyze "${selectedFile.name}" with Gemini AI`
                : 'Upload PDF to Run AI Analysis'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Real-time Scanning Progress Animation */}
      {loading && (
        <Card hover={false} style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <div className="spinner" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: '#321A2E' }}>
                Analyzing Resume in Real Time
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#C65D3A', fontWeight: 600 }}>
                {scanStep === 1 && 'Step 1/3: Extracting text streams using Apache PDFBox...'}
                {scanStep === 2 && 'Step 2/3: Generating deep intelligence with Google Gemini AI...'}
                {scanStep === 3 && 'Step 3/3: Calculating ATS scores and career placement readiness...'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Analysis Result Report */}
      {currentAnalysis && (
        <div
          ref={resultsRef}
          key={currentAnalysis.id || currentAnalysis.fileName || `${currentAnalysis.overallScore}-${Date.now()}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Summary Score Bar */}
          <div
            style={{
              padding: '1.75rem',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.75rem',
              border: '1px solid #E8DAD4',
              borderRadius: '16px',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(41, 35, 38, 0.05)'
            }}
          >
            <CircularScore score={currentAnalysis.overallScore || 0} size={125} strokeWidth={11} label="Placement Readiness" />
            <CircularScore score={currentAnalysis.atsScore || 0} size={125} strokeWidth={11} label="ATS Compatibility" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#746B6D' }}>
                <FileText size={14} color="#C65D3A" />
                <span style={{ fontWeight: 600, color: '#292326', wordBreak: 'break-all' }}>
                  {currentAnalysis.fileName}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge
                  status={currentAnalysis.overallScore >= 80 ? 'success' : currentAnalysis.overallScore >= 65 ? 'review' : 'rejected'}
                  text={currentAnalysis.readinessVerdict || 'Needs Improvement'}
                />
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: '#FDF4EC',
                  color: '#C65D3A',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  border: '1px solid #E8DAD4'
                }}>
                  {currentAnalysis.analysisSource === 'GEMINI_AI' ? '🤖 Gemini AI' : '⚙️ Heuristic'}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#746B6D', lineHeight: 1.45, marginTop: '0.15rem' }}>
                {currentAnalysis.overallScore >= 80
                  ? 'Your resume possesses strong ATS keyword alignment and technical demonstration suitable for placement drives.'
                  : currentAnalysis.overallScore >= 65
                  ? 'Moderate readiness demonstrated. Address missing technical keywords and improve quantifiable project metrics.'
                  : 'Significant skill and format gaps detected. Review recommendations below before submitting to campus recruiters.'}
              </p>

              {/* Action Link to Personalized Roadmap */}
              <div style={{ marginTop: '0.25rem' }}>
                <Link to="/student/roadmap" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" icon={Compass} style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}>
                    Generate Personalized Roadmap with these Gaps &rarr;
                  </Button>
                </Link>
              </div>

              {currentAnalysis.createdAt && (
                <div style={{ fontSize: '0.72rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> Evaluated: {new Date(currentAnalysis.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-2">
            <Card title="Detected Technical Skills" subtitle="Extracted from your uploaded resume" icon={CheckCircle2}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {currentAnalysis.detectedSkills && currentAnalysis.detectedSkills.length > 0 ? (
                  currentAnalysis.detectedSkills.map(s => (
                    <span key={s} style={{ background: '#F0F8F3', border: '1px solid #C8E6D3', color: '#2E7D56', padding: '0.25rem 0.55rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#746B6D', fontSize: '0.82rem' }}>No technical keywords detected</span>
                )}
              </div>
            </Card>

            <Card title="Skill Gap & Missing Keywords" subtitle="Recommended for target job benchmark" icon={AlertTriangle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {currentAnalysis.missingSkills && currentAnalysis.missingSkills.length > 0 ? (
                  currentAnalysis.missingSkills.map(s => (
                    <span key={s} style={{ background: '#FDF2F2', border: '1px solid #F5CCCC', color: '#BF3B3B', padding: '0.25rem 0.55rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#2E7D56', fontSize: '0.82rem', fontWeight: 600 }}>All benchmark target skills present!</span>
                )}
              </div>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2">
            <Card title="Resume Strengths" icon={CheckCircle2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentAnalysis.strengths && currentAnalysis.strengths.length > 0 ? (
                  currentAnalysis.strengths.map((str, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#3F373A' }}>
                      <CheckCircle2 size={15} color="#2E7D56" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#746B6D', fontSize: '0.82rem' }}>Standard credentials present</span>
                )}
              </div>
            </Card>

            <Card title="Areas for Improvement" icon={AlertTriangle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentAnalysis.weaknesses && currentAnalysis.weaknesses.length > 0 ? (
                  currentAnalysis.weaknesses.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#746B6D' }}>
                      <AlertTriangle size={15} color="#D4A24C" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{w}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ color: '#2E7D56', fontSize: '0.82rem' }}>No major critical weaknesses flagged</span>
                )}
              </div>
            </Card>
          </div>

          {/* Suggestions & Projects */}
          <div className="grid grid-cols-2">
            <Card title="ATS Formatting & Structure Suggestions" icon={Lightbulb}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentAnalysis.formattingSuggestions?.map((sug, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#746B6D' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C65D3A', marginTop: '6px', flexShrink: 0 }} />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Recommended Projects & Architecture" icon={FolderGit2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentAnalysis.projectSuggestions?.map((ps, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#746B6D' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4A24C', marginTop: '6px', flexShrink: 0 }} />
                    <span>{ps}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#321A2E' }}>
            <History size={16} color="#C65D3A" /> Past Resume Scans History ({history.length})
          </h3>
          <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Filename</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Readiness</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>ATS Score</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Verdict</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Date & Time</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr
                      key={item.id}
                      style={{
                        background: currentAnalysis?.id === item.id ? '#FDF4EC' : '#FFFFFF',
                        borderBottom: '1px solid #E8DAD4',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#292326' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileText size={14} color="#C65D3A" />
                          {item.fileName}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#292326' }}><strong>{item.overallScore}</strong> / 100</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#292326' }}><strong>{item.atsScore}</strong> / 100</td>
                      <td style={{ padding: '0.65rem 1rem' }}><Badge status={item.overallScore >= 80 ? 'success' : item.overallScore >= 65 ? 'review' : 'rejected'} text={item.readinessVerdict} /></td>
                      <td style={{ padding: '0.65rem 1rem', color: '#746B6D', fontSize: '0.78rem' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <Button
                          variant={currentAnalysis?.id === item.id ? 'primary' : 'outline'}
                          style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => {
                            setCurrentAnalysis(item);
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {currentAnalysis?.id === item.id ? 'Viewing' : 'View Report'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
