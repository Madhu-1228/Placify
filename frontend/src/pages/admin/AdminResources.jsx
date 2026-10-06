import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Input, Textarea, Select } from '../../components/common/Input';
import { BookOpen, Plus, Trash2, Tag, FileText, ExternalLink } from 'lucide-react';

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
  'Verbal Ability',
  'Interview Preparation'
];

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const initialForm = {
    title: '',
    description: '',
    category: 'DSA',
    difficulty: 'MEDIUM',
    resourceType: 'PDF',
    url: '',
    content: '',
    tags: []
  };

  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getAllResources();
      setResources(data || []);
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to retrieve preparation resources.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this preparation resource?')) return;
    try {
      await resourceService.deleteResource(id);
      setAlert({ type: 'success', message: 'Resource deleted successfully.' });
      loadResources();
    } catch (e) {
      console.error(e);
      setAlert({ type: 'error', message: 'Failed to delete resource.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      await resourceService.createResource(form);
      setAlert({ type: 'success', message: 'Preparation resource published for students!' });
      setShowModal(false);
      setForm(initialForm);
      loadResources();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to create resource.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (t) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#321A2E' }}>Preparation Hub Resources Management</h1>
          <p style={{ color: '#746B6D', fontSize: '0.88rem' }}>
            Publish study materials, notes, curated problem sheets, and interview cheat sheets
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => { setForm(initialForm); setShowModal(true); }}>
          Add Study Resource
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Resources Table */}
      {loading ? (
        <Loader message="Loading preparation resources..." />
      ) : resources.length === 0 ? (
        <Card hover={false}>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#746B6D' }}>
            No resources available. Click "Add Study Resource" to create one.
          </div>
        </Card>
      ) : (
        <Card hover={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FDF4EC', borderBottom: '1px solid #E8DAD4', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Difficulty</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600 }}>Tags</th>
                  <th style={{ padding: '0.65rem 1rem', color: '#746B6D', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid #E8DAD4' }}>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#292326' }}>{res.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#746B6D', maxWidth: '350px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {res.description}
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 650, color: '#C65D3A', background: '#FDF4EC', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #E8DAD4' }}>{res.category}</span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}><Badge status={res.difficulty} /></td>
                    <td style={{ padding: '0.65rem 1rem' }}><span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3F373A' }}>{res.resourceType}</span></td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', maxWidth: '200px' }}>
                        {res.tags?.map(t => (
                          <span key={t} style={{ fontSize: '0.68rem', background: '#FDF4EC', color: '#746B6D', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid #E8DAD4' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(res.id)}
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

      {/* Add Resource Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Preparation Resource"
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input
            label="Resource Title"
            placeholder="e.g. Dynamic Programming Interview Patterns"
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

            <Select
              label="Resource Type"
              value={form.resourceType}
              onChange={(e) => setForm({ ...form, resourceType: e.target.value })}
            >
              <option value="PDF">PDF Document</option>
              <option value="ARTICLE">Article / Guide</option>
              <option value="LINK">External Link</option>
            </Select>
          </div>

          <Input
            label="External Document / Repository URL"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />

          <Textarea
            label="Brief Description"
            placeholder="Summarize key topics covered..."
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {form.resourceType === 'ARTICLE' && (
            <Textarea
              label="In-App Article / Notes Content"
              placeholder="Write detailed notes or code snippets..."
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          )}

          {/* Tags */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#292326', display: 'block', marginBottom: '0.3rem' }}>
              Tags (e.g. algorithms, trees, leetcode)
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.45rem' }}>
              <input
                placeholder="Enter tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.45rem 0.65rem', color: '#292326', fontSize: '0.82rem', outline: 'none' }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>Add</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {form.tags.map(t => (
                <span key={t} style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', color: '#C65D3A', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem', marginTop: '0.5rem', borderTop: '1px solid #E8DAD4', paddingTop: '0.75rem' }}>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
