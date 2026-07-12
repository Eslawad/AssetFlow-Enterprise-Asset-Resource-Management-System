import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const SUGGESTIONS = [
  'How many assets are available?',
  'Which assets are under maintenance?',
  'Show me upcoming bookings',
  'What is the overall utilization rate?',
  'Which assets have warranty expiring soon?',
  'Show top maintenance costs',
  'How many assets are allocated?',
  'What categories do we have?',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role:'bot', text:"👋 Hi! I'm your AssetFlow AI Assistant. Ask me anything about your assets, allocations, maintenance, or utilization." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role:'user', text: q }]);
    setLoading(true);

    try {
      const answer = await resolveQuery(q.toLowerCase());
      setMessages(m => [...m, { role:'bot', text: answer }]);
    } catch {
      setMessages(m => [...m, { role:'bot', text:'⚠️ Sorry, I had trouble fetching that data. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>AI Asset Assistant</h2>
          <p style={s.sub}>Ask questions about your assets in plain English</p>
        </div>
        <div style={s.botBadge}>🤖 Powered by AssetFlow AI</div>
      </div>

      <div style={s.layout}>
        {/* Chat window */}
        <div style={s.chatWrap}>
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{...s.msgRow, justifyContent: m.role==='user' ? 'flex-end' : 'flex-start'}}>
                {m.role === 'bot' && <div style={s.botAvatar}>🤖</div>}
                <div style={{...s.bubble, ...(m.role==='user' ? s.userBubble : s.botBubble)}}>
                  {m.text.split('\n').map((line, j) => <p key={j} style={{margin: j>0?'0.3rem 0 0':0}}>{line}</p>)}
                </div>
                {m.role === 'user' && <div style={s.userAvatar}>👤</div>}
              </div>
            ))}
            {loading && (
              <div style={{...s.msgRow, justifyContent:'flex-start'}}>
                <div style={s.botAvatar}>🤖</div>
                <div style={s.botBubble}><span style={s.typing}>●●●</span></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={s.inputRow}>
            <input style={s.input} placeholder="Ask about your assets…" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && send()} />
            <button style={{...s.sendBtn, opacity: loading ? 0.6 : 1}} onClick={() => send()} disabled={loading}>
              ➤
            </button>
          </div>
        </div>

        {/* Suggestions panel */}
        <div style={s.suggestions}>
          <h4 style={{marginBottom:'0.75rem', color:'var(--text2)'}}>💡 Try asking</h4>
          {SUGGESTIONS.map(q => (
            <button key={q} style={s.suggBtn} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Query resolver ────────────────────────────────────────────────────────────
async function resolveQuery(q) {
  // Fetch data lazily based on what's needed
  if (q.includes('available') || q.includes('how many') || q.includes('total') || q.includes('allocated') || q.includes('maintenance') || q.includes('status')) {
    const stats = (await api.get('/reports/stats')).data;

    if (q.includes('available'))
      return `✅ There are currently **${stats.available}** available assets out of ${stats.total} total.`;

    if (q.includes('allocated') && !q.includes('never'))
      return `📦 **${stats.allocated}** assets are currently allocated to users.`;

    if ((q.includes('maintenance') || q.includes('repair')) && !q.includes('cost') && !q.includes('upcoming'))
      return `🔧 **${stats.underMaintenance}** assets are currently under maintenance.`;

    if (q.includes('total') || q.includes('how many asset'))
      return `🖥 You have **${stats.total}** total assets:\n• Available: ${stats.available}\n• Allocated: ${stats.allocated}\n• Under Maintenance: ${stats.underMaintenance}`;

    if (q.includes('upcoming booking') || q.includes('booking'))
      return stats.upcomingBookings?.length > 0
        ? `📅 **${stats.upcomingBookings.length}** upcoming bookings in the next 7 days:\n` +
          stats.upcomingBookings.map(b => `• ${b.assetName} → ${b.userName} (${b.startDate} to ${b.endDate})`).join('\n')
        : '📅 No upcoming bookings in the next 7 days.';

    if (q.includes('upcoming maintenance'))
      return stats.upcomingMaintenance?.length > 0
        ? `🔧 **${stats.upcomingMaintenance.length}** maintenance tasks in the next 7 days:\n` +
          stats.upcomingMaintenance.map(m => `• ${m.assetName}: ${m.description} on ${m.scheduledDate}`).join('\n')
        : '🔧 No upcoming maintenance in the next 7 days.';

    if (q.includes('warranty'))
      return stats.warrantyExpiring?.length > 0
        ? `⚠️ **${stats.warrantyExpiring.length}** assets have warranty expiring in 30 days:\n` +
          stats.warrantyExpiring.map(a => `• ${a.name} (expires ${a.warrantyExpiry})`).join('\n')
        : '✅ No warranties expiring in the next 30 days.';

    if (q.includes('categor'))
      return `📂 Asset categories:\n` +
        Object.entries(stats.byCategory || {}).map(([k,v]) => `• ${k}: ${v} assets`).join('\n');
  }

  if (q.includes('utilization') || q.includes('rate') || q.includes('cost') || q.includes('most used') || q.includes('never')) {
    const util = (await api.get('/reports/utilization')).data;

    if (q.includes('utilization') || q.includes('rate'))
      return `📊 Overall utilization rate is **${util.overallUtilizationRate}%**.\n` +
        `Category breakdown:\n` +
        (util.categoryUtilization || []).map(c => `• ${c.category}: ${c.utilizationRate}% (${c.allocated}/${c.total})`).join('\n');

    if (q.includes('cost') || q.includes('expensive'))
      return `💰 Total maintenance cost: **$${Number(util.totalMaintenanceCost).toLocaleString()}**\n` +
        `Top assets by cost:\n` +
        (util.topMaintenanceCost || []).map((a,i) => `${i+1}. ${a.asset}: $${a.cost}`).join('\n');

    if (q.includes('most used'))
      return `🏆 Most used assets:\n` +
        (util.mostUsedAssets || []).map((a,i) => `${i+1}. ${a.asset} — ${a.count} allocations`).join('\n');

    if (q.includes('never'))
      return `📦 **${util.neverAllocated}** assets have never been allocated.`;

    if (q.includes('warranty'))
      return `⚠️ **${util.warrantyExpiringSoon}** assets have warranty expiring in the next 30 days.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
    return "👋 Hello! I can help you with asset counts, allocations, maintenance, bookings, utilization rates, and warranty info. What would you like to know?";

  if (q.includes('help') || q.includes('what can you'))
    return "🤖 I can answer questions like:\n• How many assets are available?\n• What is the utilization rate?\n• Show upcoming bookings\n• Which assets have warranty expiring?\n• Show top maintenance costs\n• Which assets are most used?";

  return "🤔 I'm not sure about that. Try asking about asset counts, allocations, maintenance, bookings, utilization rates, or warranty expiry. Type **help** to see what I can do!";
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  sub: { color:'var(--text3)', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  botBadge: { background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', padding:'0.4rem 1rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600 },
  layout: { display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' },
  chatWrap: { flex:1, minWidth:'320px', background:'var(--surface)', borderRadius:'16px', boxShadow:'var(--shadow)', display:'flex', flexDirection:'column', overflow:'hidden' },
  messages: { flex:1, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', minHeight:'480px', maxHeight:'560px', overflowY:'auto' },
  msgRow: { display:'flex', alignItems:'flex-end', gap:'0.6rem' },
  botAvatar: { fontSize:'1.4rem', flexShrink:0 },
  userAvatar: { fontSize:'1.2rem', flexShrink:0 },
  bubble: { maxWidth:'75%', padding:'0.75rem 1rem', borderRadius:'12px', fontSize:'0.875rem', lineHeight:1.55 },
  botBubble: { background:'var(--surface2)', color:'var(--text2)', borderRadius:'12px 12px 12px 2px', border:'1px solid var(--border)' },
  userBubble: { background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', borderRadius:'12px 12px 2px 12px' },
  typing: { color:'var(--text4)', letterSpacing:'3px', fontSize:'1.1rem' },
  inputRow: { display:'flex', gap:'0.5rem', padding:'1rem 1.25rem', borderTop:'1px solid var(--border)' },
  input: { flex:1, padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:'8px', fontSize:'0.875rem', background:'var(--input-bg)', color:'var(--text)' },
  sendBtn: { padding:'0.7rem 1.1rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'1rem', fontWeight:700 },
  suggestions: { width:'260px', background:'var(--surface)', borderRadius:'16px', boxShadow:'var(--shadow)', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' },
  suggBtn: { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.6rem 0.85rem', fontSize:'0.8rem', color:'var(--text2)', cursor:'pointer', textAlign:'left', fontWeight:500, transition:'all 0.18s' },
};
