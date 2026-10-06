import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Input, Textarea, Select } from '../../components/common/Input';
import { HelpCircle, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'DSA',
  'Java',
  'DBMS',
  'OS',
  'Computer Networks',
  'OOP',
  'SQL',
  'Aptitude',
  'Logical Reasoning',
  'Verbal Ability'
];

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const initialQuestion = {
    id: 1,
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: ''
  };

  const initialForm = {
    title: '',
    category: 'Java',
    difficulty: 'MEDIUM',
    timeLimitMinutes: 10,
    questions: [{ ...initialQuestion }]
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getAllQuizzes();
      setQuizzes(data || []);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to retrieve assessment quizzes.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment quiz?')) return;
    try {
      await quizService.deleteQuiz(id);
      setAlert({ type: 'success', message: 'Quiz deleted successfully.' });
      loadQuizzes();
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to delete quiz.' });
    }
  };

  const handleAddQuestion = () => {
    const nextId = form.questions.length + 1;
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...initialQuestion, id: nextId, options: ['', '', '', ''] }]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateQuestion = (qIdx, field, value) => {
    const newQuestions = [...form.questions];
    newQuestions[qIdx][field] = value;
    setForm(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleUpdateOption = (qIdx, optIdx, value) => {
    const newQuestions = [...form.questions];
    const newOpts = [...newQuestions[qIdx].options];
    newOpts[optIdx] = value;
    newQuestions[qIdx].options = newOpts;
    setForm(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      await quizService.createQuiz(form);
      setAlert({ type: 'success', message: 'Assessment quiz published successfully!' });
      setShowModal(false);
      setForm(initialForm);
      loadQuizzes();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to create quiz.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Assessment Quizzes Management</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Create timed topic assessments and configure multiple-choice answer validation
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => { setForm(initialForm); setShowModal(true); }}>
          Create New Quiz
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Quizzes Table */}
      {loading ? (
        <Loader message="Loading assessment quizzes..." />
      ) : quizzes.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No quizzes available. Click "Create New Quiz" to create one.
          </div>
        </Card>
      ) : (
        <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Quiz Title</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Difficulty</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Questions</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Time Limit</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Created By</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(quiz => (
                  <tr key={quiz.id} style={{ borderBottom: '1px solid #E8DAD4' }}>
                    <td style={{ padding: '0.65rem 1rem' }}><div style={{ fontWeight: 700, color: '#292326' }}>{quiz.title}</div></td>
                    <td style={{ padding: '0.65rem 1rem' }}><span style={{ fontSize: '0.78rem', fontWeight: 650, color: '#C65D3A', background: '#FDF4EC', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #E8DAD4' }}>{quiz.category}</span></td>
                    <td style={{ padding: '0.65rem 1rem' }}><Badge status={quiz.difficulty} /></td>
                    <td style={{ padding: '0.65rem 1rem', color: '#292326' }}><strong>{quiz.questions?.length || 0}</strong> Questions</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#3F373A' }}>{quiz.timeLimitMinutes || 10} Mins</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#746B6D', fontSize: '0.78rem' }}>{quiz.createdBy}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        style={{ background: '#FDF2F2', border: '1px solid #F5CCCC', color: '#BF3B3B', padding: '0.25rem 0.45rem', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quiz Creation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Assessment Quiz"
        maxWidth="750px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Quiz Title"
            placeholder="e.g. Core Java & Multithreading Assessment"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-3">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </Select>

            <Input
              label="Time Limit (Minutes)"
              type="number"
              min="1"
              max="120"
              value={form.timeLimitMinutes}
              onChange={(e) => setForm({ ...form, timeLimitMinutes: parseInt(e.target.value) || 10 })}
              required
            />
          </div>

          {/* Dynamic Questions Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#321A2E', margin: 0 }}>Questions ({form.questions.length})</h4>
              <Button type="button" variant="outline" icon={Plus} onClick={handleAddQuestion} style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem' }}>
                Add Question
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto' }}>
              {form.questions.map((q, qIdx) => (
                <div key={qIdx} style={{ padding: '0.85rem', background: '#FDF4EC', borderRadius: '8px', border: '1px solid #E8DAD4', position: 'relative' }}>
                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', background: 'transparent', border: 'none', color: '#BF3B3B', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <Input
                    label={`Question #${qIdx + 1} Text`}
                    placeholder="Enter question statement..."
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.65rem' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => handleUpdateQuestion(qIdx, 'correctOptionIndex', optIdx)}
                          title="Mark as correct answer"
                          style={{ accentColor: '#C65D3A' }}
                        />
                        <input
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          required
                          style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#292326', fontSize: '0.82rem', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>

                  <Input
                    label="Answer Explanation (Shown during review)"
                    placeholder="Provide the conceptual explanation..."
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem', marginTop: '0.35rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.75rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Assessment Quiz'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
