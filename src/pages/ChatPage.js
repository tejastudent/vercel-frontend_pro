import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI, clientsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  "Summarize the portfolio of my highest-risk client",
  "Which clients need portfolio rebalancing?",
  "What's the current market sentiment and its impact?",
  "Suggest diversification strategies for medium-risk clients",
  "Identify clients most affected by recent market volatility",
  "Generate a compliance risk report"
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-in`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
        isUser ? 'bg-primary-600 text-white' : 'bg-surface-600 text-primary-400'
      }`}>
        {isUser ? 'A' : '✦'}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-primary-500/20 border border-primary-500/30 text-slate-200'
          : 'bg-surface-700 border border-surface-600 text-slate-300'
      }`}>
        {isUser ? (
          <p className="text-sm">{msg.content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className="text-xs text-slate-600 mt-1">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        
        {msg.compliance && !msg.compliance.isSafe && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs font-bold text-red-400 flex items-center gap-1">
              <span>⚠️</span> Compliance Warning (Score: {msg.compliance.score})
            </p>
            <p className="text-[10px] text-red-300 mt-1">
              Restricted keywords detected: {msg.compliance.flaggedKeywords?.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    clientsAPI.getAll({ limit: 100 }).then(r => setClients(r.data.clients || [])).catch(() => {});
    chatAPI.getSessions().then(r => setSessions(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = { role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatAPI.sendMessage({
        message: msgText,
        sessionId,
        clientId: selectedClient || undefined
      });

      const aiMsg = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date(),
        compliance: data.compliance 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'AI request failed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please check your AI API configuration and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const loadSession = async (session) => {
    try {
      const { data } = await chatAPI.getSession(session.sessionId);
      setMessages(data.messages || []);
      setActiveSession(session.sessionId);
      if (data.activeClient) setSelectedClient(data.activeClient._id || data.activeClient);
    } catch (e) {
      toast.error('Failed to load session');
    }
  };

  return (
    <div className="h-full flex font-body">
      {/* Sessions sidebar */}
      <div className="w-56 bg-surface-800 border-r border-surface-600 flex flex-col">
        <div className="p-4 border-b border-surface-600">
          <button
            onClick={() => { setMessages([]); setActiveSession(null); setSelectedClient(''); }}
            className="w-full bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 text-primary-400 text-xs font-medium rounded-lg py-2 transition-colors"
          >
            ✦ New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <button
              key={session.sessionId}
              onClick={() => loadSession(session)}
              className={`w-full text-left p-3 rounded-lg text-xs transition-colors ${
                activeSession === session.sessionId
                  ? 'bg-surface-600 text-slate-200'
                  : 'text-slate-400 hover:bg-surface-700 hover:text-slate-300'
              }`}
            >
              <p className="font-medium truncate">{session.title}</p>
              <p className="text-slate-600 truncate mt-0.5">{session.lastMessage}</p>
              <p className="text-slate-600 mt-0.5">{session.messageCount} msgs</p>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-surface-600 bg-surface-800">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <span className="text-primary-400 text-sm">✦</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-sm">AI Financial Assistant</h1>
            <p className="text-xs text-slate-500">Powered by Groq / Gemini</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              className="bg-surface-700 border border-surface-500 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-primary-500"
            >
              <option value="">No client context</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mb-4">
                <span className="text-primary-400 text-2xl">✦</span>
              </div>
              <h2 className="font-display font-bold text-white text-lg mb-2">AI Financial Assistant</h2>
              <p className="text-slate-500 text-sm max-w-md mb-8">
                Ask me anything about your clients, portfolios, market conditions, or get AI-powered investment recommendations.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-xl p-3 text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-3 animate-slide-in">
              <div className="w-7 h-7 rounded-full bg-surface-600 flex items-center justify-center text-primary-400 text-xs font-bold">✦</div>
              <div className="bg-surface-700 border border-surface-600 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-primary-500/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                  <span className="text-xs text-slate-500 ml-2">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-surface-600 bg-surface-800">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about a client's portfolio, market risks, rebalancing suggestions..."
              rows={2}
              className="flex-1 bg-surface-700 border border-surface-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="self-end bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-95"
            >
              Send ↑
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
