import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resourceService } from '../../services/resourceService';
import { PREPARATION_MODULES } from '../../data/preparationTopics';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ExternalLink,
  FileText,
  Bookmark,
  Check,
  ChevronRight,
  Brain,
  Code2,
  Database,
  Network,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function PreparationHub() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected Section: 'MODULES' or specific module ID ('aptitude', 'java', 'dsa', 'dbms')
  const [activeModuleId, setActiveModuleId] = useState('aptitude');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedTopicIds, setCompletedTopicIds] = useState(() => {
    const saved = localStorage.getItem('placify_completed_topics');
    return saved ? JSON.parse(saved) : ['apt-1', 'java-1'];
  });
  const [search, setSearch] = useState('');

  // Reader Modal for general API resources
  const [activeResource, setActiveResource] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopicComplete = (topicId) => {
    setCompletedTopicIds(prev => {
      const updated = prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId];
      localStorage.setItem('placify_completed_topics', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleResourceComplete = async (id) => {
    try {
      const updated = await resourceService.toggleComplete(id);
      setResources(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e) {
      console.error(e);
    }
  };

  const currentModule = PREPARATION_MODULES.find(m => m.id === activeModuleId) || PREPARATION_MODULES[0];

  const filteredTopics = currentModule.topics.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.overview.toLowerCase().includes(q) || t.keyConcepts.some(c => c.toLowerCase().includes(q));
  });

  const getModuleIcon = (id) => {
    switch (id) {
      case 'aptitude': return Brain;
      case 'java': return Code2;
      case 'dsa': return Network;
      case 'dbms': return Database;
      default: return BookOpen;
    }
  };

  if (loading) {
    return <Loader message="Loading curated placement topics & study notes..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner in Deep Plum & Terracotta */}
      <div className="dashboard-hero" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '2.25rem 2.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 248, 241, 0.15)', border: '1px solid rgba(255, 248, 241, 0.25)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#FFF8F1', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Sparkles size={13} color="#D4A24C" /> PLACEMENT STUDY MASTER
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFF8F1', margin: 0 }}>
            Placement Preparation Hub & Topic Notes
          </h1>
          <p style={{ color: '#F7DDD4', fontSize: '0.9rem', maxWidth: '650px', marginTop: '0.25rem' }}>
            Interactive topics, formula sheets, code patterns, and interview master notes curated for screening assessments and technical rounds.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 248, 241, 0.12)',
          border: '1px solid rgba(255, 248, 241, 0.22)',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#F7DDD4', textTransform: 'uppercase', fontWeight: 700 }}>
            Completed Topics
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4A24C', marginTop: '0.1rem' }}>
            {completedTopicIds.length} Mastery Points
          </div>
        </div>
      </div>

      {/* Module Selector Carousel */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#321A2E', marginBottom: '0.75rem' }}>
          Select Core Preparation Curriculum
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
          {PREPARATION_MODULES.map(mod => {
            const Icon = getModuleIcon(mod.id);
            const isSelected = activeModuleId === mod.id;
            const completedInMod = mod.topics.filter(t => completedTopicIds.includes(t.id)).length;

            return (
              <div
                key={mod.id}
                onClick={() => {
                  setActiveModuleId(mod.id);
                  setSelectedTopic(null);
                }}
                style={{
                  background: isSelected ? '#FDF4EC' : '#FFFFFF',
                  border: isSelected ? '2px solid #C65D3A' : '1px solid #E8DAD4',
                  borderRadius: '14px',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(198, 93, 58, 0.15)' : '0 1px 3px rgba(41, 35, 38, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: isSelected ? '#C65D3A' : '#FBE9DF',
                    color: isSelected ? '#FFFFFF' : '#C65D3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#FBE9DF', color: '#C65D3A', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                    {mod.topicsCount} Topics
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#292326', margin: 0 }}>
                    {mod.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#746B6D', lineHeight: 1.35, marginTop: '0.2rem', margin: 0 }}>
                    {mod.description.substring(0, 75)}...
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.45rem', borderTop: '1px solid #E8DAD4' }}>
                  <span style={{ fontSize: '0.72rem', color: completedInMod === mod.topicsCount ? '#2E7D56' : '#746B6D', fontWeight: 600 }}>
                    {completedInMod}/{mod.topicsCount} Completed
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#C65D3A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Explore Notes &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content: Split Topic List & Interactive Notes Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTopic ? '1fr 1.6fr' : '1fr', gap: '1.25rem', transition: 'all 0.3s ease' }}>
        {/* Left Column: Topics List inside Active Module */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>
                {currentModule.name} &bull; Topics & Formulas
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#746B6D' }}>
                Click any topic below to view in-depth theory, formulas, and solved problems
              </span>
            </div>

            <div style={{ position: 'relative', width: '210px' }}>
              <Search size={15} style={{ position: 'absolute', top: '10px', left: '10px', color: '#746B6D' }} />
              <input
                placeholder="Search in module..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #E8DAD4',
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem 0.5rem 2rem',
                  color: '#292326',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredTopics.map((topic, idx) => {
              const isCompleted = completedTopicIds.includes(topic.id);
              const isSelected = selectedTopic?.id === topic.id;

              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    background: isSelected ? '#FDF4EC' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #C65D3A' : '1px solid #E8DAD4',
                    borderRadius: '10px',
                    padding: '0.9rem 1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(41, 35, 38, 0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTopicComplete(topic.id);
                      }}
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isCompleted ? '#F0F8F3' : '#FDF4EC',
                        border: isCompleted ? '1.5px solid #C8E6D3' : '1px solid #E8DAD4',
                        color: isCompleted ? '#2E7D56' : '#746B6D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} />
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#746B6D', fontWeight: 700 }}>#{idx + 1}</span>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#292326', margin: 0 }}>
                          {topic.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#746B6D', marginTop: '0.15rem', lineHeight: 1.35, margin: 0 }}>
                        {topic.overview.substring(0, 75)}...
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={11} /> {topic.readTime}
                    </span>
                    <Badge status={topic.difficulty} />
                    <ChevronRight size={16} color={isSelected ? '#C65D3A' : '#746B6D'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed In-Depth Topic Notes Viewer */}
        {selectedTopic ? (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8DAD4',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(41, 35, 38, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem',
            maxHeight: '850px',
            overflowY: 'auto'
          }}>
            {/* Topic Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8DAD4', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', background: '#FDF4EC', color: '#C65D3A', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #E8DAD4' }}>
                    {currentModule.name}
                  </span>
                  <Badge status={selectedTopic.difficulty} />
                  <span style={{ fontSize: '0.72rem', color: '#746B6D', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={11} /> {selectedTopic.readTime}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#321A2E', margin: 0 }}>{selectedTopic.title}</h2>
                <p style={{ fontSize: '0.84rem', color: '#746B6D', marginTop: '0.2rem', margin: 0 }}>
                  {selectedTopic.overview}
                </p>
              </div>

              <Button
                variant={completedTopicIds.includes(selectedTopic.id) ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => handleToggleTopicComplete(selectedTopic.id)}
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
              >
                {completedTopicIds.includes(selectedTopic.id) ? 'Mastered ✓' : 'Mark Mastered'}
              </Button>
            </div>

            {/* Section 1: Formulas & Key Equations */}
            {selectedTopic.formulas && selectedTopic.formulas.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#D4A24C', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                  <Flame size={15} /> Key Formulas & Shortcut Cheats
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedTopic.formulas.map((f, i) => (
                    <div key={i} style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#C65D3A', fontWeight: 700 }}>{f.name}</span>
                      <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#292326', marginTop: '0.2rem', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                        {f.math}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Core Concepts & Interview Rules */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#C65D3A', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                <BookOpen size={15} /> Crucial Concepts & Interview Rules
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedTopic.keyConcepts.map((concept, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: '#3F373A', lineHeight: 1.45 }}>
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Solved Placement Problem & Solution */}
            {selectedTopic.sampleQuestion && (
              <div style={{ background: '#FDF4EC', border: '1px solid #E8DAD4', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#C65D3A', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  💡 Frequently Asked Campus Placement Problem
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 650, color: '#292326', marginBottom: '0.5rem' }}>
                  {selectedTopic.sampleQuestion.problem}
                </div>
                <div style={{ background: '#FFFFFF', padding: '0.65rem', borderRadius: '6px', border: '1px solid #E8DAD4', borderLeftWidth: '3px', borderLeftColor: '#2E7D56' }}>
                  <span style={{ fontSize: '0.7rem', color: '#2E7D56', fontWeight: 800 }}>STEP-BY-STEP SOLUTION:</span>
                  <pre style={{ fontFamily: 'inherit', fontSize: '0.8rem', color: '#3F373A', marginTop: '0.2rem', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                    {selectedTopic.sampleQuestion.solution}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            border: '1px dashed #E8DAD4',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            color: '#746B6D'
          }}>
            <BookOpen size={42} color="#C65D3A" style={{ opacity: 0.7 }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#292326' }}>Select Any Topic to Open Study Notes</h3>
              <p style={{ fontSize: '0.82rem', color: '#746B6D', marginTop: '0.2rem', maxWidth: '380px' }}>
                Choose a topic from the {currentModule.name} syllabus on the left to read formulas, key concepts, and solved interview patterns.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedTopic(filteredTopics[0])}
              style={{ fontSize: '0.82rem' }}
            >
              Open Topic #1 ({filteredTopics[0]?.title}) &rarr;
            </Button>
          </div>
        )}
      </div>

      {/* General Downloadable Resources Section */}
      <div style={{ marginTop: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E8DAD4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#321A2E' }}>Downloadable Cheat Sheets & Handbooks</h2>
            <p style={{ color: '#746B6D', fontSize: '0.82rem' }}>
              Handpicked reference PDFs and curated problem sets from top placement repositories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          {resources.map(res => {
            const isCompleted = res.completedUserIds?.includes(user?.id);

            return (
              <Card key={res.id} className="card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#FDF4EC', color: '#C65D3A', fontWeight: 700, border: '1px solid #E8DAD4' }}>
                        {res.category}
                      </span>
                      <Badge status={res.difficulty} />
                    </div>

                    <button
                      onClick={() => handleToggleResourceComplete(res.id)}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      style={{
                        background: isCompleted ? '#F0F8F3' : '#FDF4EC',
                        border: isCompleted ? '1px solid #C8E6D3' : '1px solid #E8DAD4',
                        color: isCompleted ? '#2E7D56' : '#746B6D',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={13} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.35rem 0', color: '#292326' }}>{res.title}</h3>
                  <p style={{ color: '#746B6D', fontSize: '0.8rem', lineHeight: 1.45, marginBottom: '0.65rem' }}>
                    {res.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', paddingTop: '0.65rem', borderTop: '1px solid #E8DAD4' }}>
                  {res.content ? (
                    <Button variant="outline" style={{ flex: 1, fontSize: '0.78rem' }} onClick={() => setActiveResource(res)}>
                      <FileText size={14} /> Read Guide
                    </Button>
                  ) : null}

                  {res.url ? (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="primary" style={{ width: '100%', fontSize: '0.78rem' }}>
                        <ExternalLink size={14} /> Open Material
                      </Button>
                    </a>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reader Modal */}
      <Modal
        isOpen={!!activeResource}
        onClose={() => setActiveResource(null)}
        title={activeResource?.title || 'Study Guide'}
      >
        {activeResource && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#FDF4EC', color: '#C65D3A', fontWeight: 700 }}>
                {activeResource.category}
              </span>
              <Badge status={activeResource.difficulty} />
            </div>

            <div style={{ background: '#FFF8F1', padding: '1rem', borderRadius: '8px', border: '1px solid #E8DAD4', whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: '0.84rem', color: '#292326', fontFamily: 'var(--font-mono)' }}>
              {activeResource.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
              <Button variant="primary" onClick={() => setActiveResource(null)}>Done Reading</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
