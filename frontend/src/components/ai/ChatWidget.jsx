import { useState, useRef, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import StatusStamp from '../common/StatusStamp';

const SUGGESTIONS = [
  'What blockers is the team facing right now?',
  'Summarize workload across projects',
  'What did the team work on this week?',
];

// Renders **bold** spans inside a line of text.
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

const STATUS_KEYS = ['submitted', 'late', 'pending', 'draft'];
const EMPTY_VALUE = /^(none|no|n\/a|-|—)$/i;

// "**Week of 2026-07-13**:" style line with nothing else on it -> card header
function isCardHeader(text) {
  return /^\*\*[^*]+\*\*:?\s*$/.test(text.trim());
}
// "**Label**: value" -> a field row
function parseField(text) {
  const m = text.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);
  return m ? { label: m[1].trim(), value: m[2].trim() } : null;
}

function ReportCard({ title, fields }) {
  return (
    <div className="border border-line rounded-sm overflow-hidden bg-paper-card">
      <div className="bg-paper-dim px-3 py-1.5 border-b border-line">
        <p className="text-xs font-display text-ink">{title}</p>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {fields.map((f, i) => {
          const statusKey = f.label.toLowerCase() === 'status' ? f.value.toLowerCase().trim() : null;
          if (statusKey && STATUS_KEYS.includes(statusKey)) {
            return (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-widest text-ink-faint font-mono">{f.label}</span>
                <StatusStamp status={statusKey} size="sm" />
              </div>
            );
          }
          const isBlocker = f.label.toLowerCase() === 'blockers' && f.value && !EMPTY_VALUE.test(f.value.trim());
          return (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-3 ${isBlocker ? 'bg-danger/10 -mx-1 px-1.5 py-0.5 rounded-sm' : ''}`}
            >
              <span className="text-[10px] uppercase tracking-widest text-ink-faint font-mono shrink-0">
                {f.label || '—'}
              </span>
              <span className={`text-sm text-right ${isBlocker ? 'text-danger font-medium' : 'text-ink'}`}>
                {f.value || '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lightweight markdown renderer for assistant replies. Handles:
// - **bold** text
// - "* " bullets (with indentation for nesting)
// - report-style blocks ("**Week of X**:" header + indented "**Label**: value"
//   lines) which get rendered as clean cards, with status fields using the
//   app's real StatusStamp badge instead of plain text.
function MarkdownLite({ text }) {
  const lines = text.split('\n');
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  lines.forEach((line) => {
    const bulletMatch = line.match(/^(\s*)[*-]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      const indent = Math.min(Math.floor(bulletMatch[1].length / 2), 3);
      blocks.push({ type: 'li', indent, text: bulletMatch[2] });
    } else if (!line.trim()) {
      flushParagraph();
      blocks.push({ type: 'gap' });
    } else {
      paragraph.push(line.trim());
    }
  });
  flushParagraph();

  // Collapse consecutive gaps and drop leading/trailing gaps.
  const cleaned = blocks.filter((b, i) => {
    if (b.type !== 'gap') return true;
    return i !== 0 && i !== blocks.length - 1 && blocks[i - 1]?.type !== 'gap';
  });

  // Group a top-level "**Header**:" li followed by indented "**Label**: value"
  // li's into a single card block.
  const grouped = [];
  let i = 0;
  while (i < cleaned.length) {
    const b = cleaned[i];
    if (b.type === 'li' && b.indent === 0 && isCardHeader(b.text)) {
      const fields = [];
      let j = i + 1;
      while (j < cleaned.length && cleaned[j].type === 'li' && cleaned[j].indent >= 1) {
        fields.push(parseField(cleaned[j].text) || { label: '', value: cleaned[j].text });
        j += 1;
      }
      if (fields.length) {
        grouped.push({ type: 'card', title: b.text.replace(/\*\*/g, '').replace(/:\s*$/, ''), fields });
        i = j;
        continue;
      }
    }
    grouped.push(b);
    i += 1;
  }

  return (
    <div className="space-y-2">
      {grouped.map((b, i) => {
        if (b.type === 'gap') return <div key={i} className="h-1.5" />;
        if (b.type === 'card') return <ReportCard key={i} title={b.title} fields={b.fields} />;
        if (b.type === 'p') {
          return (
            <p key={i} className="leading-relaxed">
              {renderInline(b.text, i)}
            </p>
          );
        }
        return (
          <div
            key={i}
            className="flex items-start gap-2 leading-relaxed"
            style={{ marginLeft: `${b.indent * 14}px` }}
          >
            <span className="mt-2 w-1 h-1 rounded-full bg-accent-dark shrink-0" />
            <span>{renderInline(b.text, i)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role, content} for display
  const [apiHistory, setApiHistory] = useState([]); // full Anthropic-format history
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const question = text ?? input;
    if (!question.trim() || loading) return;
    setInput('');
    setError('');
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/ai/chat', { message: question, history: apiHistory });
      setApiHistory(data.history);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the assistant.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-ink text-paper rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-ink-soft transition-colors"
        aria-label="Open team assistant"
      >
        <span className="font-display text-xl text-accent">?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[26rem] h-[34rem] max-h-[80vh] bg-paper-card border border-line rounded-sm shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-ink text-paper rounded-t-sm">
        <div>
          <p className="font-display text-sm leading-none">Team Assistant</p>
          <p className="text-[10px] text-paper/50 mt-0.5 font-mono">reads live report data</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-paper/70 hover:text-paper text-sm" aria-label="Close">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div>
            <p className="text-xs text-ink-faint mb-3">Ask about your team's reports, blockers, or workload.</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-3 py-2 border border-line rounded-sm text-ink-faint hover:border-ink hover:text-ink transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] text-sm px-3 py-2 rounded-sm bg-ink text-paper whitespace-pre-wrap'
                  : 'max-w-[95%] w-full text-sm px-3 py-2.5 rounded-sm bg-paper-dim/40 border border-line-soft text-ink'
              }
            >
              {m.role === 'user' ? m.content : <MarkdownLite text={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-paper-dim border border-line rounded-sm px-3 py-2 text-xs text-ink-faint flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-ink-faint rounded-full animate-pulse" />
              Checking the reports…
            </div>
          </div>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the team…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-ink-faint/60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="text-xs font-medium px-3 py-1.5 bg-accent text-ink rounded-sm hover:bg-accent-dark disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
