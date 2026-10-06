import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CircularScore from '../../components/common/CircularScore';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  History,
  Award
} from 'lucide-react';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz Taking State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: optionIdx }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    loadQuizData();
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (activeQuiz && timeLeft > 0 && !quizResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft, quizResult]);

  const loadQuizData = async () => {
    setLoading(true);
    try {
      const [qList, aList] = await Promise.all([
        quizService.getAllQuizzes(),
        quizService.getMyAttempts()
      ]);
      setQuizzes(qList || []);
      setAttempts(aList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    try {
      const fullQuiz = await quizService.getQuizById(quiz.id);
      setActiveQuiz(fullQuiz);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setQuizResult(null);
      setTimeLeft((fullQuiz.timeLimitMinutes || 10) * 60);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const result = await quizService.submitQuiz(activeQuiz.id, answers);
      setQuizResult(result);
      // Refresh attempts
      const aList = await quizService.getMyAttempts();
      setAttempts(aList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <Loader message="Loading placement assessment quizzes and history..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Placement Assessment Quizzes</h1>
        <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
          Test your technical proficiency in Java, DSA, DBMS, and Aptitude under simulated test conditions
        </p>
      </div>

      {/* Quiz Catalog Grid */}
      <div className="grid grid-cols-3">
        {quizzes.map(quiz => (
          <Card key={quiz.id} className="card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#FDF4EC', color: '#C65D3A', fontWeight: 700, border: '1px solid #E8DAD4' }}>
                  {quiz.category}
                </span>
                <Badge status={quiz.difficulty} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 750, margin: '0.4rem 0', color: '#292326' }}>{quiz.title}</h3>

              <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.82rem', color: '#746B6D', margin: '0.65rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <HelpCircle size={14} color="#C65D3A" />
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} color="#D4A24C" />
                  <span>{quiz.timeLimitMinutes || 10} Minutes</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              icon={Play}
              onClick={() => startQuiz(quiz)}
              style={{ width: '100%', marginTop: '0.85rem', fontSize: '0.82rem' }}
            >
              Start Assessment Test
            </Button>
          </Card>
        ))}
      </div>

      {/* Attempt History Section */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 750, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#321A2E' }}>
          <History size={18} color="#C65D3A" />
          Your Assessment History
        </h3>

        {attempts.length === 0 ? (
          <Card hover={false}>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#746B6D', fontSize: '0.88rem' }}>
              You haven't attempted any assessment tests yet. Choose a quiz above to evaluate your readiness!
            </div>
          </Card>
        ) : (
          <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Assessment Title</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Score</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Percentage</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Result</th>
                    <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(att => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #E8DAD4' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#292326' }}>{att.quizTitle}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#746B6D' }}>{att.quizCategory}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#292326' }}><strong>{att.score}</strong> / {att.totalQuestions}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#292326' }}><strong>{att.percentage}%</strong></td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <Badge status={att.passed ? 'success' : 'rejected'} text={att.passed ? 'PASSED' : 'NEEDS PRACTICE'} />
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#746B6D', fontSize: '0.78rem' }}>
                        {new Date(att.attemptedAt).toLocaleDateString()} {new Date(att.attemptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Quiz Taker & Result Modal */}
      <Modal
        isOpen={!!activeQuiz}
        onClose={() => { if (quizResult || window.confirm('Exit the quiz? Unsaved progress will be lost.')) setActiveQuiz(null); }}
        title={quizResult ? `Assessment Result — ${activeQuiz?.title}` : `${activeQuiz?.title} (${formatTime(timeLeft)})`}
        maxWidth="720px"
      >
        {activeQuiz && (
          <div>
            {!quizResult ? (
              /* Active Quiz Questions */
              <div>
                {/* Timer Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid #E8DAD4' }}>
                  <div style={{ fontSize: '0.82rem', color: '#746B6D' }}>
                    Question <strong>{currentQuestionIdx + 1}</strong> of {activeQuiz.questions.length}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: timeLeft < 60 ? '#BF3B3B' : '#D4A24C', fontWeight: 700, fontSize: '0.84rem' }}>
                    <Clock size={15} />
                    <span>Time Remaining: {formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Question */}
                {activeQuiz.questions && activeQuiz.questions[currentQuestionIdx] && (
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.45, marginBottom: '1rem', color: '#292326' }}>
                      {activeQuiz.questions[currentQuestionIdx].questionText}
                    </h3>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {activeQuiz.questions[currentQuestionIdx].options.map((option, optIdx) => {
                        const qId = activeQuiz.questions[currentQuestionIdx].id;
                        const isSelected = answers[qId] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qId, optIdx)}
                            style={{
                              padding: '0.75rem 0.95rem',
                              borderRadius: '10px',
                              background: isSelected ? '#FDF4EC' : '#FFF8F1',
                              border: isSelected ? '1.5px solid #C65D3A' : '1px solid #E8DAD4',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? '5px solid #C65D3A' : '2px solid #E8DAD4',
                              background: '#FFFFFF'
                            }} />
                            <span style={{ fontSize: '0.86rem', color: isSelected ? '#C65D3A' : '#3F373A', fontWeight: isSelected ? 650 : 400 }}>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid #E8DAD4' }}>
                  <Button
                    variant="outline"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  >
                    Previous
                  </Button>

                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={submitting}
                      onClick={handleSubmitQuiz}
                    >
                      {submitting ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Result Review */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', background: '#FDF4EC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E8DAD4' }}>
                  <CircularScore score={Math.round(quizResult.percentage)} size={100} label="Score Percentage" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <Badge status={quizResult.passed ? 'success' : 'rejected'} text={quizResult.passed ? 'QUALIFIED / PASSED' : 'NEEDS IMPROVEMENT'} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#292326' }}>
                      Correct Answers: {quizResult.score} / {quizResult.totalQuestions}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#746B6D', margin: 0 }}>
                      {quizResult.passed ? 'Outstanding! You have demonstrated strong grasp in this module.' : 'Review explanations below to clarify concepts and retry.'}
                    </p>
                  </div>
                </div>

                {/* Itemized Questions Review */}
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.65rem', color: '#292326' }}>Detailed Answer Review</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {quizResult.reviews?.map((r, idx) => (
                      <div key={idx} style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: '8px', border: `1px solid ${r.correct ? '#C8E6D3' : '#F5CCCC'}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', marginBottom: '0.4rem' }}>
                          {r.correct ? <CheckCircle2 size={16} color="#2E7D56" style={{ flexShrink: 0, marginTop: '2px' }} /> : <XCircle size={16} color="#BF3B3B" style={{ flexShrink: 0, marginTop: '2px' }} />}
                          <strong style={{ fontSize: '0.86rem', color: '#292326' }}>{idx + 1}. {r.questionText}</strong>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#746B6D', marginLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div>Your Choice: <span style={{ color: r.correct ? '#2E7D56' : '#BF3B3B', fontWeight: 600 }}>{r.selectedOption !== null ? r.options[r.selectedOption] : 'Not Answered'}</span></div>
                          {!r.correct && (
                            <div>Correct Answer: <span style={{ color: '#2E7D56', fontWeight: 600 }}>{r.options[r.correctOption]}</span></div>
                          )}
                          {r.explanation && (
                            <div style={{ marginTop: '0.25rem', padding: '0.4rem', background: '#FDF4EC', borderRadius: '4px', border: '1px solid #E8DAD4', color: '#746B6D' }}>
                              <em>Explanation: {r.explanation}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="outline" onClick={() => setActiveQuiz(null)}>Close</Button>
                  <Button variant="primary" icon={RotateCcw} onClick={() => startQuiz(activeQuiz)}>Retake Quiz</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
