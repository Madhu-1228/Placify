import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../services/aiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  User,
  Lightbulb,
  Building2,
  Code2,
  BookOpen,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export default function PlacifyAi() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 **Hello! I'm Placify AI**, your personal placement & preparation assistant.\n\nAsk me anything from technical doubts (*\"Explain HashMap in Java\"*, *\"Explain binary search\"*) to live placement queries (*\"Which drives am I eligible for?\"*, *\"What is my latest ATS score?\"*, *\"Give me 10 SQL interview questions\"*).\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Explain a difficult concept',
    'Create a DSA study plan',
    'Give me Java interview questions',
    'How should I prepare for placements?',
    'Which drives am I eligible for?',
    'What resources should I study?'
  ]);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadInitialSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInitialSuggestions = async () => {
    try {
      const data = await aiService.getSuggestions();
      if (data && data.length > 0) {
        setSuggestions(data);
      }
    } catch (e) {
      console.warn('Using default suggestions:', e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setAlert({ type: '', message: '' });

    // Format conversation history for backend
    const historyPayload = newMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

    try {
      const response = await aiService.sendMessage(query, historyPayload);
      const botMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        text: response?.reply || "I couldn't process that query. Please try again.",
        source: response?.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

      if (response?.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setSuggestions(response.suggestedFollowUps);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: "⚠️ I encountered a temporary connection issue. Please make sure the backend server is running and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "👋 Chat reset. What would you like to learn or prepare for next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Comprehensive Markdown Parser for Assistant messages
  const renderFormattedText = (content) => {
    if (!content) return null;

    // 1. Split content into code blocks and normal markdown segments
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const segments = content.split(codeBlockRegex);

    return segments.map((segment, segIdx) => {
      if (segment.startsWith('```')) {
        // Code Block
        const lines = segment.split('\n');
        const firstLine = lines[0].replace('```', '').trim();
        const language = firstLine || 'code';
        const codeLines = lines.slice(1);
        if (codeLines.length > 0 && codeLines[codeLines.length - 1].endsWith('```')) {
          codeLines[codeLines.length - 1] = codeLines[codeLines.length - 1].replace(/```$/, '');
        }
        const code = codeLines.join('\n').trim();

        return (
          <div key={segIdx} style={{
            margin: '0.85rem 0',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #3F373A',
            background: '#24151F'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.35rem 0.85rem',
              background: '#321A2E',
              borderBottom: '1px solid rgba(232, 218, 212, 0.1)',
              fontSize: '0.72rem',
              color: '#E8DAD4',
              fontFamily: 'monospace'
            }}>
              <span>{language.toUpperCase()}</span>
              <button
                onClick={() => copyToClipboard(code, `code-${segIdx}`)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#E9826E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem'
                }}
              >
                {copiedId === `code-${segIdx}` ? <Check size={13} /> : <Copy size={13} />}
                {copiedId === `code-${segIdx}` ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{
              padding: '0.85rem 1rem',
              margin: 0,
              color: '#FFF8F1',
              fontSize: '0.82rem',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              lineHeight: 1.45,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // 2. Parse text lines and tables
      const rawLines = segment.split('\n');
      const elements = [];
      let i = 0;

      while (i < rawLines.length) {
        const line = rawLines[i];
        const trimmed = line.trim();

        // Check for Table: line starts with | and next line has | --- |
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < rawLines.length && rawLines[i + 1].includes('---')) {
          const tableRows = [];
          while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
            tableRows.push(rawLines[i].trim());
            i++;
          }

          if (tableRows.length >= 2) {
            const headerCells = tableRows[0].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            const bodyRows = tableRows.slice(2).map(r => r.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));

            elements.push(
              <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '0.75rem 0', borderRadius: '8px', border: '1px solid #E8DAD4' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#FBE9DF', borderBottom: '1px solid #E8DAD4' }}>
                      {headerCells.map((h, hIdx) => (
                        <th key={hIdx} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 750, color: '#321A2E' }}>
                          {formatInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#FFF8F1', borderBottom: '1px solid #F0E4DE' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '0.45rem 0.75rem', color: '#292326' }}>
                            {formatInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            continue;
          }
        }

        // Headings
        if (trimmed.startsWith('# ')) {
          elements.push(<h2 key={i} style={{ fontSize: '1.2rem', fontWeight: 850, color: '#321A2E', margin: '0.9rem 0 0.4rem' }}>{trimmed.replace('# ', '')}</h2>);
        } else if (trimmed.startsWith('## ')) {
          elements.push(<h3 key={i} style={{ fontSize: '1.08rem', fontWeight: 800, color: '#321A2E', margin: '0.85rem 0 0.35rem' }}>{trimmed.replace('## ', '')}</h3>);
        } else if (trimmed.startsWith('### ')) {
          elements.push(<h4 key={i} style={{ fontSize: '0.98rem', fontWeight: 750, color: '#C65D3A', margin: '0.75rem 0 0.3rem' }}>{trimmed.replace('### ', '')}</h4>);
        } else if (trimmed.startsWith('#### ')) {
          elements.push(<h5 key={i} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D4A24C', margin: '0.65rem 0 0.25rem' }}>{trimmed.replace('#### ', '')}</h5>);
        } else if (trimmed.startsWith('##### ')) {
          elements.push(<h6 key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#746B6D', margin: '0.55rem 0 0.2rem' }}>{trimmed.replace('##### ', '')}</h6>);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          elements.push(
            <div key={i} style={{ display: 'flex', gap: '0.45rem', marginLeft: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#C65D3A', fontWeight: 800 }}>•</span>
              <span>{formatInlineMarkdown(trimmed.substring(2))}</span>
            </div>
          );
        } else if (/^\d+\.\s/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+\.)\s(.*)/);
          elements.push(
            <div key={i} style={{ display: 'flex', gap: '0.45rem', marginLeft: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#D4A24C', fontWeight: 700 }}>{numMatch ? numMatch[1] : '•'}</span>
              <span>{formatInlineMarkdown(numMatch ? numMatch[2] : trimmed)}</span>
            </div>
          );
        } else if (trimmed.startsWith('> ')) {
          elements.push(
            <blockquote key={i} style={{
              margin: '0.5rem 0',
              padding: '0.4rem 0.85rem',
              borderLeft: '3px solid #C65D3A',
              background: '#FFF8F1',
              color: '#746B6D',
              fontSize: '0.84rem',
              borderRadius: '0 6px 6px 0'
            }}>
              {formatInlineMarkdown(trimmed.substring(2))}
            </blockquote>
          );
        } else if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #E8DAD4', margin: '0.75rem 0' }} />);
        } else if (trimmed === '') {
          elements.push(<div key={i} style={{ height: '0.35rem' }} />);
        } else {
          elements.push(<p key={i} style={{ margin: '0 0 0.35rem' }}>{formatInlineMarkdown(line)}</p>);
        }

        i++;
      }

      return <div key={segIdx} style={{ lineHeight: 1.6 }}>{elements}</div>;
    });
  };

  const formatInlineMarkdown = (text) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} style={{ color: '#292326' }}>{seg.substring(2, seg.length - 2)}</strong>;
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return <em key={i}>{seg.substring(1, seg.length - 1)}</em>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={i} style={{
            background: '#FDF4EC',
            color: '#C65D3A',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            fontSize: '0.84em',
            border: '1px solid #E8DAD4',
            fontFamily: 'monospace'
          }}>
            {seg.substring(1, seg.length - 1)}
          </code>
        );
      }
      return seg;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 120px)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #321A2E 0%, #C65D3A 100%)',
            color: '#FFF8F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(198, 93, 58, 0.25)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#321A2E', margin: 0 }}>PLACIFY AI</h1>
              <span style={{
                background: '#FEF9ED',
                color: '#D4A24C',
                border: '1px solid #F3E3B6',
                fontSize: '0.68rem',
                fontWeight: 750,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Sparkles size={11} /> Gemini 3.6 Flash & Live Context
              </span>
            </div>
            <p style={{ color: '#746B6D', fontSize: '0.84rem', margin: '0.15rem 0 0' }}>
              Your personal placement & preparation assistant.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={Trash2}
          onClick={handleClearChat}
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
        >
          Clear Chat
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Main Chat Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E8DAD4',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(50, 26, 46, 0.04)',
        minHeight: 0
      }}>
        {/* Messages Stream */}
        <div style={{
          flex: 1,
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  maxWidth: isUser ? '80%' : '88%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Avatar Icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isUser ? '#321A2E' : '#C65D3A',
                  color: '#FFF8F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    background: isUser ? 'linear-gradient(135deg, #321A2E 0%, #4D2644 100%)' : '#FFF8F1',
                    color: isUser ? '#FFF8F1' : '#3F373A',
                    padding: '0.85rem 1.15rem',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    border: isUser ? 'none' : '1px solid #E8DAD4',
                    fontSize: '0.88rem',
                    boxShadow: isUser ? '0 3px 8px rgba(50, 26, 46, 0.2)' : '0 2px 6px rgba(50, 26, 46, 0.03)'
                  }}>
                    {isUser ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.text}</div>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>

                  {/* Metadata & Copy Action */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.7rem',
                    color: '#746B6D',
                    padding: '0 0.35rem',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#746B6D',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: 0,
                          fontSize: '0.7rem'
                        }}
                      >
                        {copiedId === msg.id ? <Check size={11} color="#2E7D56" /> : <Copy size={11} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: '#C65D3A',
                color: '#FFF8F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={16} />
              </div>
              <div style={{
                background: '#FFF8F1',
                border: '1px solid #E8DAD4',
                padding: '0.75rem 1rem',
                borderRadius: '4px 16px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C65D3A', animation: 'pulse 1s infinite alternate' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E9826E', animation: 'pulse 1s infinite alternate 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4A24C', animation: 'pulse 1s infinite alternate 0.4s' }} />
                <span style={{ fontSize: '0.78rem', color: '#746B6D', marginLeft: '0.35rem' }}>Placify AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {suggestions.length > 0 && (
          <div style={{
            padding: '0.65rem 1.25rem',
            background: '#FFF8F1',
            borderTop: '1px solid #E8DAD4',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#746B6D', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
              <Lightbulb size={13} color="#D4A24C" /> Suggested:
            </div>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={loading}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8DAD4',
                  borderRadius: '9999px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.76rem',
                  color: '#321A2E',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C65D3A';
                  e.currentTarget.style.color = '#C65D3A';
                  e.currentTarget.style.background = '#FDF4EC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E8DAD4';
                  e.currentTarget.style.color = '#321A2E';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: '#FFFFFF',
          borderTop: '1px solid #E8DAD4',
          display: 'flex',
          gap: '0.65rem',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Ask anything on DSA, Java, SQL, placement drives, eligibility, or interview prep..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              background: '#FFF8F1',
              border: '1px solid #E8DAD4',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#292326',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#C65D3A'}
            onBlur={(e) => e.target.style.borderColor = '#E8DAD4'}
          />

          <Button
            variant="primary"
            icon={Send}
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', borderRadius: '10px' }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
