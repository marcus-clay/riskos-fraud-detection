import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ShieldAlert, AlertTriangle, Activity, Smartphone, Globe,
  CreditCard, ChevronRight, Check, Zap, Lock, Phone, Eye, Menu,
  ArrowUpRight, ArrowLeft, Filter, Search, ChevronDown, ArrowRight,
  Trophy, Download, MessageSquare, Database, Wifi, FileText
} from 'lucide-react';

// ─── AUDIO ───

const playConfidenceChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    if (navigator.vibrate) navigator.vibrate(50);
  } catch (_) {}
};

const playQueueClearChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.15, 0.3].forEach((d, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine';
      o.frequency.setValueAtTime([660, 880, 1100][i], ctx.currentTime + d);
      g.gain.setValueAtTime(0.06, ctx.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.3);
      o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.3);
    });
  } catch (_) {}
};

// ─── DATA ───

const INITIAL_CASES = [
  { id: '4521', risk: 78, amount: 8900, user: 'Alex Lemaire', type: 'Transfer', status: 'open', time: '12m ago', factors: ['Velocity', 'Geo'] },
  { id: '4520', risk: 92, amount: 12450, user: 'Sarah Connor', type: 'Withdrawal', status: 'open', time: '15m ago', factors: ['Device', 'IP'] },
  { id: '4519', risk: 45, amount: 450, user: 'Jean Dujardin', type: 'Payment', status: 'open', time: '1h ago', factors: ['Velocity'] },
  { id: '4518', risk: 88, amount: 24000, user: 'Ellen Ripley', type: 'Transfer', status: 'open', time: '2h ago', factors: ['Geo', 'Amount'] },
  { id: '4517', risk: 12, amount: 120, user: 'Marty McFly', type: 'Payment', status: 'resolved', time: '3h ago', factors: [] },
  { id: '4516', risk: 65, amount: 3200, user: 'James Bond', type: 'Transfer', status: 'open', time: '4h ago', factors: ['Device'] },
];

const CASE_DETAILS = {
  '4521': {
    timeline: [
      { label: "Login IP", subLabel: "192.168.44.12", status: "neutral", timestamp: "10:42:01" },
      { label: "Amount", subLabel: "$8,900", status: "neutral", timestamp: "10:42:05" },
      { label: "Device", subLabel: "iPhone 15 Pro", status: "warning", timestamp: "10:42:12" },
      { label: "Geo", subLabel: "Lagos, NG", status: "alert", timestamp: "10:42:13" },
      { label: "Velocity", subLabel: "142ms", status: "alert", timestamp: "10:42:13" },
    ],
    factors: [
      { label: "Velocity Anomaly", value: "24", intensity: 24, icon: 'zap' },
      { label: "Unrecognized Device", value: "18", intensity: 18, icon: 'smartphone' },
      { label: "Geo Mismatch", value: "15", intensity: 15, icon: 'globe' },
      { label: "Amount Deviation", value: "12", intensity: 12, icon: 'activity' },
    ],
    profile: { tenure: '3 Years', avgMonthly: '$2.4k', email: 'alex.lemaire@example.com' },
    comparison: { avgAmount: '$850', thisAmount: '$8,900', avgGeo: 'Paris, FR', thisGeo: 'Lagos, NG', avgDevice: 'MacBook Pro', thisDevice: 'iPhone 15 Pro' },
  },
  '4520': {
    timeline: [
      { label: "Login", subLabel: "New session", status: "neutral", timestamp: "10:28:00" },
      { label: "Device", subLabel: "Android (Kyiv)", status: "alert", timestamp: "10:28:03" },
      { label: "IP Check", subLabel: "VPN detected", status: "alert", timestamp: "10:28:04" },
      { label: "Amount", subLabel: "$12,450", status: "warning", timestamp: "10:28:10" },
      { label: "Withdraw", subLabel: "ATM request", status: "alert", timestamp: "10:28:11" },
    ],
    factors: [
      { label: "Device Mismatch", value: "28", intensity: 28, icon: 'smartphone' },
      { label: "IP Anomaly (VPN)", value: "26", intensity: 26, icon: 'globe' },
      { label: "Amount Deviation", value: "22", intensity: 22, icon: 'activity' },
      { label: "Session Velocity", value: "16", intensity: 16, icon: 'zap' },
    ],
    profile: { tenure: '5 Years', avgMonthly: '$1.8k', email: 'sarah.connor@example.com' },
    comparison: { avgAmount: '$1,200', thisAmount: '$12,450', avgGeo: 'San Francisco, US', thisGeo: 'Kyiv, UA', avgDevice: 'MacBook Pro', thisDevice: 'Android (unknown)' },
  },
  '4519': {
    timeline: [
      { label: "Login", subLabel: "Known IP", status: "neutral", timestamp: "09:15:00" },
      { label: "Device", subLabel: "MacBook Air", status: "neutral", timestamp: "09:15:02" },
      { label: "Payment", subLabel: "$450", status: "neutral", timestamp: "09:15:30" },
      { label: "Velocity", subLabel: "28s", status: "warning", timestamp: "09:15:30" },
    ],
    factors: [
      { label: "Velocity Pattern", value: "18", intensity: 18, icon: 'zap' },
      { label: "Merchant Category", value: "12", intensity: 12, icon: 'activity' },
      { label: "Time of Day", value: "8", intensity: 8, icon: 'globe' },
    ],
    profile: { tenure: '1 Year', avgMonthly: '$890', email: 'jean.dujardin@example.com' },
    comparison: { avgAmount: '$320', thisAmount: '$450', avgGeo: 'Lyon, FR', thisGeo: 'Lyon, FR', avgDevice: 'MacBook Air', thisDevice: 'MacBook Air' },
  },
  '4518': {
    timeline: [
      { label: "Login IP", subLabel: "41.203.x.x", status: "warning", timestamp: "08:30:01" },
      { label: "Geo", subLabel: "Lagos, NG", status: "alert", timestamp: "08:30:02" },
      { label: "Amount", subLabel: "$24,000", status: "alert", timestamp: "08:30:15" },
      { label: "Recipient", subLabel: "New account", status: "alert", timestamp: "08:30:16" },
      { label: "2FA", subLabel: "SMS verified", status: "neutral", timestamp: "08:30:45" },
    ],
    factors: [
      { label: "Geo Mismatch", value: "26", intensity: 26, icon: 'globe' },
      { label: "Amount Deviation (10x)", value: "24", intensity: 24, icon: 'activity' },
      { label: "New Recipient", value: "22", intensity: 22, icon: 'smartphone' },
      { label: "Time Pattern", value: "16", intensity: 16, icon: 'zap' },
    ],
    profile: { tenure: '7 Years', avgMonthly: '$2.1k', email: 'ellen.ripley@example.com' },
    comparison: { avgAmount: '$2,100', thisAmount: '$24,000', avgGeo: 'Paris, FR', thisGeo: 'Lagos, NG', avgDevice: 'iPhone 14', thisDevice: 'iPhone 14' },
  },
  '4517': {
    timeline: [
      { label: "Login", subLabel: "Known IP", status: "neutral", timestamp: "07:00:00" },
      { label: "Payment", subLabel: "$120", status: "neutral", timestamp: "07:02:00" },
    ],
    factors: [],
    profile: { tenure: '2 Years', avgMonthly: '$340', email: 'marty.mcfly@example.com' },
    comparison: { avgAmount: '$150', thisAmount: '$120', avgGeo: 'Hill Valley, US', thisGeo: 'Hill Valley, US', avgDevice: 'DeLorean OS', thisDevice: 'DeLorean OS' },
  },
  '4516': {
    timeline: [
      { label: "Login", subLabel: "Mobile app", status: "neutral", timestamp: "06:12:00" },
      { label: "Device", subLabel: "New Pixel 9", status: "warning", timestamp: "06:12:01" },
      { label: "Transfer", subLabel: "$3,200", status: "neutral", timestamp: "06:14:30" },
      { label: "Recipient", subLabel: "Known account", status: "neutral", timestamp: "06:14:31" },
    ],
    factors: [
      { label: "New Device", value: "22", intensity: 22, icon: 'smartphone' },
      { label: "Registration Timing", value: "18", intensity: 18, icon: 'zap' },
      { label: "Transfer Pattern", value: "14", intensity: 14, icon: 'activity' },
    ],
    profile: { tenure: '4 Years', avgMonthly: '$3.1k', email: 'james.bond@example.com' },
    comparison: { avgAmount: '$2,800', thisAmount: '$3,200', avgGeo: 'London, UK', thisGeo: 'London, UK', avgDevice: 'iPhone 16 Pro', thisDevice: 'Pixel 9' },
  },
};

const AI_INSIGHTS = {
  '4521': { lines: ['Analyzing transaction pattern...', 'This pattern matches 3 previous fraud cases.', 'While credentials are valid, the velocity (142ms) implies script automation.', 'Recommendation: block card and contact customer for verification.'], confidence: 87, similarCases: 3 },
  '4520': { lines: ['Scanning device fingerprint...', 'Device not recognized. Last known device: MacBook Pro, San Francisco.', 'Current session originates from unregistered Android device in Kyiv, Ukraine.', 'Recommendation: immediate card freeze and identity verification call.'], confidence: 94, similarCases: 7 },
  '4519': { lines: ['Reviewing payment velocity...', 'Transaction speed is slightly elevated but within acceptable range for this merchant category.', 'Account history shows consistent payment patterns with this vendor.', 'Recommendation: mark as safe, no action required.'], confidence: 72, similarCases: 2 },
  '4518': { lines: ['Cross-referencing geolocation data...', 'Transfer initiated from Lagos, NG. Account holder located in Paris, FR.', 'Amount ($24,000) exceeds 10x the monthly average ($2.1k). New recipient account detected.', 'Recommendation: escalate to Level 2 for manual review.'], confidence: 91, similarCases: 5 },
  '4516': { lines: ['Evaluating device risk...', 'New device registered 2 hours before transaction.', 'Transfer amount ($3,200) is within historical range but device trust score is low.', 'Recommendation: monitor transaction and flag for next login verification.'], confidence: 62, similarCases: 1 },
};

const AI_FOLLOWUPS = {
  '4521': [
    'The sender IP (192.168.44.12) was flagged in 2 other fraud rings last quarter. Consider cross-referencing with cases #4301 and #4387.',
    'Customer Alex Lemaire has never initiated a transfer above $2,000 in 3 years. This transaction is 4.4x the historical maximum.',
  ],
  '4520': [
    'The Android device IMEI matches a batch associated with SIM-swap fraud in Eastern Europe. Recommend mandatory 2FA reset.',
    'Sarah Connor reported a lost wallet 3 days ago. This withdrawal may be linked to physical credential theft.',
  ],
  '4519': [
    'Merchant category (online gaming) has a 12% higher chargeback rate than average. Flag for monitoring if frequency increases.',
    'Jean Dujardin has 4 similar transactions this month with the same vendor. Pattern looks legitimate but worth noting.',
  ],
  '4518': [
    'The recipient account was created 48 hours ago and has received 3 other high-value transfers from different senders. Potential mule account.',
    'Ellen Ripley is a long-tenure client (7 years). Consider a courtesy call before hard block to avoid false positive friction.',
  ],
  '4516': [
    'Pixel 9 was registered via the mobile app at 04:12 AM local time. Unusual registration hour for this customer profile.',
    'James Bond has a history of device upgrades (3 in 2 years). New device alone may not be sufficient for escalation.',
  ],
};

// ─── HIGHLIGHT TOKENS ───

const HIGHLIGHT_PATTERNS = [
  { regex: /\$[\d,]+/g, className: 'text-amber-400 font-mono text-xs' },
  { regex: /\d+ms/g, className: 'text-red-400 font-mono text-xs' },
  { regex: /\d+x\b/g, className: 'text-red-400 font-mono text-xs' },
  { regex: /\b(?:Lagos|Kyiv|San Francisco|Paris|London|Hill Valley)[^.]*?(?:NG|UA|US|FR|UK)\b/g, className: 'text-red-400' },
  { regex: /\b(?:MacBook Pro|iPhone \d+\s?\w*|Android|Pixel \d+)\b/g, className: 'text-amber-300' },
  { regex: /\b(?:block card|card freeze|escalate|monitor|mark as safe)\b/gi, className: 'text-zinc-100 font-medium' },
];

function highlightText(text) {
  if (!text) return null;
  const allMatches = [];
  HIGHLIGHT_PATTERNS.forEach(({ regex, className }) => {
    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) allMatches.push({ start: m.index, end: m.index + m[0].length, text: m[0], className });
  });
  allMatches.sort((a, b) => a.start - b.start);
  const filtered = [];
  for (const m of allMatches) { if (filtered.length === 0 || m.start >= filtered[filtered.length - 1].end) filtered.push(m); }
  const segs = [];
  let last = 0;
  filtered.forEach((match, i) => {
    if (match.start > last) segs.push(<span key={`t${i}`}>{text.slice(last, match.start)}</span>);
    segs.push(<span key={`h${i}`} className={match.className}>{match.text}</span>);
    last = match.end;
  });
  if (last < text.length) segs.push(<span key="tail">{text.slice(last)}</span>);
  return segs.length > 0 ? segs : text;
}

// ─── UTILITY COMPONENTS ───

const ICON_MAP = { zap: Zap, smartphone: Smartphone, globe: Globe, activity: Activity };

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900/40 border border-zinc-800/60 md:rounded-lg backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 ${className}`}>{children}</div>
);

const CardHeader = ({ title, action }) => (
  <div className="px-4 py-3 md:px-5 md:py-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-900/20">
    <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-zinc-500 font-mono">{title}</h3>
    {action && <div>{action}</div>}
  </div>
);

const Badge = ({ children, color = "zinc", className = "" }) => {
  const c = { zinc: "bg-zinc-800 text-zinc-300 border-zinc-700", red: "bg-red-500/10 text-red-400 border-red-500/20", amber: "bg-amber-500/10 text-amber-400 border-amber-500/20", green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", purple: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ${c[color] || c.zinc} ${className}`}>{children}</span>;
};

const Button = ({ children, variant = "secondary", icon: Icon, onClick, shortcut, className = "", disabled = false, ...props }) => {
  const base = "h-9 md:h-8 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 touch-manipulation";
  const v = { primary: "bg-zinc-100 text-zinc-950 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-transparent", secondary: "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600", danger: "bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/50", ghost: "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50" };
  return (<button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`} {...props}>{Icon && <Icon size={14} />}{children}{shortcut && <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-zinc-500 ml-1 font-mono bg-zinc-800 px-1 rounded border border-zinc-700/50">{shortcut}</span>}</button>);
};

const ProgressBar = ({ value, max = 100 }) => { const p = Math.min(100, Math.max(0, (value / max) * 100)); return (<div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-out ${p > 70 ? 'bg-gradient-to-r from-amber-600 to-red-500' : 'bg-zinc-500'}`} style={{ width: `${p}%` }} /></div>); };

const RiskFactorRow = ({ label, value, icon: Icon, intensity }) => (<div className="flex items-center justify-between py-2.5 group cursor-default hover:bg-zinc-800/30 px-2 -mx-2 rounded transition-colors"><div className="flex items-center gap-3 text-zinc-400 group-hover:text-zinc-300 transition-colors"><div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-zinc-400 transition-colors"><Icon size={14} /></div><span className="text-xs md:text-sm font-medium">{label}</span></div><div className="flex items-center gap-3"><div className="hidden md:block h-1 w-12 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full ${intensity > 20 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${(parseInt(value) / 30) * 100}%` }} /></div><span className={`font-mono text-xs md:text-sm ${intensity > 20 ? 'text-red-400' : 'text-amber-400'}`}>+{value}</span></div></div>);

const ComparisonRow = ({ label, normal, current, isAnomaly }) => (<div className="flex items-center justify-between py-1.5"><span className="text-[10px] text-zinc-500 uppercase tracking-wider w-16">{label}</span><span className="text-xs text-zinc-600 font-mono">{normal}</span><ArrowRight size={10} className="text-zinc-700" /><span className={`text-xs font-mono ${isAnomaly ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>{current}</span></div>);

const Timeline = ({ items }) => (<div className="w-full"><div className="hidden md:flex items-center justify-between w-full px-4 relative"><div className="absolute top-2 left-4 right-4 h-[1px] bg-zinc-800 z-0" />{items.map((item, idx) => (<div key={idx} className="flex flex-col items-center relative z-10 group cursor-pointer"><div className={`w-4 h-4 rounded-full border-2 bg-black transition-all duration-300 ${item.status === 'alert' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : item.status === 'warning' ? 'border-amber-500' : 'border-zinc-700 group-hover:border-zinc-500'}`} /><div className="mt-4 text-center opacity-80 group-hover:opacity-100 transition-opacity"><div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${item.status === 'alert' ? 'text-red-400' : 'text-zinc-400'}`}>{item.label}</div><div className="text-[10px] text-zinc-600 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 inline-block">{item.subLabel}</div></div></div>))}</div><div className="flex md:hidden flex-col space-y-0 relative pl-2"><div className="absolute top-2 bottom-2 left-[15px] w-[1px] bg-zinc-800 z-0" />{items.map((item, idx) => (<div key={idx} className="flex items-start gap-4 py-2 relative z-10"><div className={`mt-1 w-3 h-3 rounded-full border-2 bg-black shrink-0 ${item.status === 'alert' ? 'border-red-500 bg-red-900/20' : item.status === 'warning' ? 'border-amber-500' : 'border-zinc-700'}`} /><div className="flex-1 border-b border-zinc-800/50 pb-2"><div className="flex justify-between items-center"><span className={`text-xs font-medium uppercase tracking-wide ${item.status === 'alert' ? 'text-red-400' : 'text-zinc-300'}`}>{item.label}</span><span className="text-[10px] font-mono text-zinc-500">{item.timestamp}</span></div><div className="text-xs text-zinc-500 font-mono mt-1">{item.subLabel}</div></div></div>))}</div></div>);

const Toast = ({ message, type, visible }) => (<div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}><div className="bg-zinc-900 text-zinc-100 px-4 py-2 rounded-full border border-zinc-800 shadow-2xl flex items-center gap-2 text-sm font-medium">{type === 'success' ? <Check size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />}{message}</div></div>);

const ConnectedSources = () => {
  const sources = [
    { icon: Database, label: 'Core Banking API', color: 'text-blue-400', latency: '12ms' },
    { icon: Wifi, label: 'Device Fingerprint', color: 'text-amber-400', latency: '8ms' },
    { icon: Globe, label: 'Geo Intelligence', color: 'text-emerald-400', latency: '23ms' },
  ];
  return (
    <div className="flex items-center gap-3 mt-4 ml-0 md:ml-10">
      <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Sources:</span>
      {sources.map(({ icon: I, label, color, latency }) => (
        <div key={label} className="group relative flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 cursor-default">
          <I size={10} className={color} />
          <span className="hidden md:inline">{label}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-emerald-400 font-mono">{latency}</span> latency
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── STREAMING AI INSIGHT ───

const StreamingInsight = ({ caseId, onStreamComplete }) => {
  const insight = AI_INSIGHTS[caseId] || AI_INSIGHTS['4521'];
  const fullText = insight.lines.join(' ');
  const [displayedChars, setDisplayedChars] = useState(0);
  const [phase, setPhase] = useState('scanning');
  const intervalRef = useRef(null);

  useEffect(() => { setDisplayedChars(0); setPhase('scanning'); const t = setTimeout(() => setPhase('streaming'), 400); return () => { clearTimeout(t); if (intervalRef.current) clearInterval(intervalRef.current); }; }, [caseId]);
  useEffect(() => { if (phase !== 'streaming') return; intervalRef.current = setInterval(() => { setDisplayedChars(prev => { if (prev >= fullText.length) { clearInterval(intervalRef.current); setTimeout(() => setPhase('confidence'), 150); return prev; } return prev + 2; }); }, 8); return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [phase, fullText.length]);
  useEffect(() => { if (phase === 'confidence') { playConfidenceChime(); const t = setTimeout(() => { setPhase('actions'); if (onStreamComplete) onStreamComplete(); }, 300); return () => clearTimeout(t); } }, [phase, onStreamComplete]);

  const displayedText = fullText.slice(0, displayedChars);

  return (
    <div className="flex gap-4">
      <div className="hidden md:block mt-1 min-w-[24px]">
        <div className={`h-6 w-6 rounded border flex items-center justify-center transition-all duration-500 ${phase === 'scanning' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}><Zap size={14} /></div>
      </div>
      <div className="flex-1">
        {phase === 'scanning' && (<div className="flex items-center gap-3 text-purple-400 text-sm"><div className="flex gap-1"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div><span className="font-mono text-xs uppercase tracking-wider">Analyzing case data</span></div>)}
        {(phase === 'streaming' || phase === 'confidence' || phase === 'actions') && (
          <p className="text-zinc-300 leading-relaxed text-sm">
            {phase === 'streaming' ? <>{displayedText}<span className="inline-block w-[2px] h-[14px] bg-purple-400 ml-0.5 align-middle animate-pulse" /></> : highlightText(fullText)}
          </p>
        )}
        {(phase === 'confidence' || phase === 'actions') && (
          <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
              <div className={`h-2 w-2 rounded-full ${insight.confidence > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Confidence: <span className={`${insight.confidence > 80 ? 'text-emerald-400' : 'text-amber-400'} font-medium`}>{insight.confidence}%</span></span>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">Based on {insight.similarCases} similar case{insight.similarCases > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── FOLLOW-UP INSIGHT ───

const FollowUpInsight = ({ caseId }) => {
  const followups = AI_FOLLOWUPS[caseId] || AI_FOLLOWUPS['4521'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [completed, setCompleted] = useState([]);
  const intervalRef = useRef(null);

  const startStreaming = () => {
    if (currentIdx >= followups.length) return;
    setDisplayedChars(0);
    setStreaming(true);
  };

  useEffect(() => {
    if (!streaming) return;
    const text = followups[currentIdx];
    intervalRef.current = setInterval(() => {
      setDisplayedChars(prev => {
        if (prev >= text.length) {
          clearInterval(intervalRef.current);
          setStreaming(false);
          setCompleted(p => [...p, text]);
          setCurrentIdx(i => i + 1);
          return prev;
        }
        return prev + 2;
      });
    }, 8);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [streaming, currentIdx, followups]);

  useEffect(() => { setCurrentIdx(0); setCompleted([]); setStreaming(false); setDisplayedChars(0); }, [caseId]);

  const hasMore = currentIdx < followups.length;
  const currentText = streaming ? followups[currentIdx]?.slice(0, displayedChars) : '';

  return (
    <div className="mt-4 ml-0 md:ml-10 space-y-3">
      {completed.map((text, i) => (
        <div key={i} className="flex gap-2 items-start animate-in fade-in duration-200">
          <div className="mt-1 h-4 w-4 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0"><Zap size={8} className="text-purple-400" /></div>
          <p className="text-xs text-zinc-400 leading-relaxed">{highlightText(text)}</p>
        </div>
      ))}
      {streaming && (
        <div className="flex gap-2 items-start">
          <div className="mt-1 h-4 w-4 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 animate-pulse"><Zap size={8} className="text-purple-300" /></div>
          <p className="text-xs text-zinc-400 leading-relaxed">{currentText}<span className="inline-block w-[2px] h-[12px] bg-purple-400 ml-0.5 align-middle animate-pulse" /></p>
        </div>
      )}
      {!streaming && hasMore && (
        <button onClick={startStreaming} className="flex items-center gap-1.5 text-[10px] text-purple-400 hover:text-purple-300 transition-colors font-mono uppercase tracking-wider">
          <MessageSquare size={10} />
          {completed.length === 0 ? 'Ask for more context' : 'Ask another question'}
        </button>
      )}
      {!hasMore && completed.length > 0 && (
        <span className="text-[10px] text-zinc-600 font-mono">No more insights available for this case.</span>
      )}
    </div>
  );
};

// ─── ESCALATION NOTE ───

const EscalationNote = ({ caseData, insightText, onConfirm, onCancel }) => {
  const [note, setNote] = useState(`Case #${caseData.id}: ${insightText}`);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare size={14} className="text-amber-400" /><h3 className="text-sm font-medium text-white">Note for Level 2</h3></div><Badge color="amber">Escalation</Badge></div>
        <div className="p-5">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono leading-relaxed focus:outline-none focus:border-zinc-600 resize-none" />
          <p className="text-[10px] text-zinc-600 mt-2">AI insight pre-filled. Edit or add context before escalating.</p>
        </div>
        <div className="px-5 py-4 border-t border-zinc-800 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon={ArrowUpRight} onClick={() => onConfirm(note)}>Escalate with Note</Button>
        </div>
      </div>
    </div>
  );
};

// ─── INTEGRATION COMPONENTS ───

const ExportButton = ({ onExport }) => {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const handleClick = () => {
    if (done) return;
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); onExport(); }, 1200);
  };
  return (
    <button onClick={handleClick} disabled={exporting}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border rounded text-[10px] transition-all duration-300 ${
        done ? 'border-emerald-500/20 text-emerald-400' : exporting ? 'border-zinc-700 text-zinc-500' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
      }`}>
      {exporting ? (
        <><div className="h-2.5 w-2.5 border border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />Generating PDF...</>
      ) : done ? (
        <><Check size={10} />Report saved</>
      ) : (
        <><Download size={10} />Export Report</>
      )}
    </button>
  );
};

const SlackPreview = ({ caseData, escalationNote }) => {
  const insightSummary = (AI_INSIGHTS[caseData.id] || AI_INSIGHTS['4521']).lines.slice(1, 3).join(' ');
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-zinc-800/80">
        <div className="px-4 py-2.5 border-b border-zinc-800/60 flex items-center gap-2 bg-zinc-900/30">
          <div className="h-4 w-4 rounded bg-[#4A154B] flex items-center justify-center">
            <MessageSquare size={8} className="text-white" />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">Sent to #fraud-ops</span>
          <Check size={10} className="text-emerald-500 ml-auto" />
          <span className="text-[10px] text-zinc-600 font-mono">just now</span>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={12} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-zinc-200 font-medium">RiskOS Bot</span>
                <span className="text-[10px] text-zinc-600 font-mono">10:43 AM</span>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                <span className="text-amber-400 font-medium">Escalation</span> Case #{caseData.id} ({caseData.user}) escalated by analyst. Risk score: <span className="font-mono text-red-400">{caseData.risk}/100</span>.
              </div>
              {escalationNote && (
                <div className="mt-2 pl-3 border-l-2 border-zinc-700 text-[11px] text-zinc-500 leading-relaxed italic">
                  {escalationNote.length > 120 ? escalationNote.slice(0, 120) + '...' : escalationNote}
                </div>
              )}
              <div className="mt-2 text-[10px] text-zinc-600">
                AI summary: {insightSummary.length > 100 ? insightSummary.slice(0, 100) + '...' : insightSummary}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── ACTION CONFIRMATION ───

const ActionConfirmation = ({ action, caseData, reviewDuration, nextCase, queueStats, escalationNote, onReviewNext, onBackToInbox, onExportReport }) => {
  const labels = { escalate: { label: 'Escalated to Level 2', icon: ArrowUpRight, color: 'amber', desc: 'Case will be reviewed by a senior analyst within 15 minutes.' }, resolve: { label: 'Case Marked Safe', icon: Check, color: 'green', desc: 'Case closed. No further action required.' }, block: { label: 'Account Frozen', icon: Lock, color: 'red', desc: 'Card blocked and customer notification sent via SMS and email.' } };
  const info = labels[action] || labels.resolve;
  const Ic = info.icon;
  const cMap = { amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' }, green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' }, red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' } };
  const c = cMap[info.color];
  const [slackSent, setSlackSent] = useState(false);
  useEffect(() => { if (action === 'escalate') { const t = setTimeout(() => setSlackSent(true), 1500); return () => clearTimeout(t); } }, [action]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${c.bg} ${c.border} border mb-6`}><Ic size={28} className={c.text} /></div>
        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-2">{info.label}</h2>
        <p className="text-sm text-zinc-500">{info.desc}</p>
      </div>
      <Card className="mb-4"><div className="p-5"><div className="grid grid-cols-4 gap-4 text-center">
        <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Case</div><div className="text-zinc-200 font-mono text-sm">#{caseData.id}</div></div>
        <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">User</div><div className="text-zinc-200 text-sm">{caseData.user}</div></div>
        <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Action</div><div className={`text-sm font-medium ${c.text}`}>{action.charAt(0).toUpperCase() + action.slice(1)}</div></div>
        <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Reviewed in</div><div className="text-zinc-200 font-mono text-sm">{reviewDuration}s</div></div>
      </div></div></Card>

      {/* Integration feedback */}
      <div className="space-y-2 mb-6">
        <div className="flex flex-wrap gap-2">
          <ExportButton onExport={onExportReport} />
          {action === 'escalate' && escalationNote && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-amber-500/20 rounded text-[10px] text-amber-400 animate-in fade-in duration-300">
              <FileText size={10} />Ticket FRAUD-{1200 + parseInt(caseData.id.slice(-2))} created
            </div>
          )}
        </div>
        {action === 'escalate' && slackSent && (
          <SlackPreview caseData={caseData} escalationNote={escalationNote} />
        )}
      </div>

      {nextCase ? (
        <Card className="border-zinc-700/50 hover:border-zinc-600 transition-colors cursor-pointer group" onClick={onReviewNext}>
          <div className="p-5"><div className="flex items-center justify-between">
            <div><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-mono">Next in queue <span className="text-zinc-600">({queueStats.remaining} remaining)</span></div>
              <div className="flex items-center gap-3"><div className={`h-2 w-2 rounded-full ${nextCase.risk > 70 ? 'bg-red-500' : nextCase.risk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} /><span className="text-white font-medium">{nextCase.user}</span><span className="font-mono text-xs text-zinc-500">#{nextCase.id}</span><span className={`font-mono text-xs ${nextCase.risk > 70 ? 'text-red-400' : 'text-zinc-400'}`}>Risk {nextCase.risk}</span></div></div>
            <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors"><span className="text-xs hidden md:inline">Review</span><ArrowRight size={16} /></div>
          </div></div>
        </Card>
      ) : (<QueueEmpty processedCount={queueStats.processed} totalDuration={queueStats.totalDuration} onBackToInbox={onBackToInbox} />)}
      {nextCase && <div className="mt-6 text-center"><button onClick={onBackToInbox} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Back to Inbox</button></div>}
    </div>
  );
};

const QueueEmpty = ({ processedCount, totalDuration, onBackToInbox }) => {
  useEffect(() => { playQueueClearChime(); }, []);
  return (<Card className="border-emerald-500/20 bg-emerald-500/5"><div className="p-8 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4"><Trophy size={22} className="text-emerald-400" /></div>
    <h3 className="text-lg font-semibold text-white mb-1">Queue cleared</h3><p className="text-sm text-zinc-500 mb-6">All open cases have been reviewed.</p>
    <div className="flex justify-center gap-6 mb-6">
      <div className="text-center"><div className="text-2xl font-mono font-bold text-emerald-400">{processedCount}</div><div className="text-[10px] text-zinc-500 uppercase tracking-wider">Cases reviewed</div></div>
      <div className="w-[1px] bg-zinc-800" /><div className="text-center"><div className="text-2xl font-mono font-bold text-zinc-200">{totalDuration}s</div><div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total time</div></div>
      <div className="w-[1px] bg-zinc-800" /><div className="text-center"><div className="text-2xl font-mono font-bold text-zinc-200">{processedCount > 0 ? Math.round(totalDuration / processedCount) : 0}s</div><div className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg per case</div></div>
    </div>
    <Button variant="secondary" onClick={onBackToInbox}>Back to Inbox</Button>
  </div></Card>);
};

const SessionSummary = ({ stats }) => {
  if (stats.processed === 0) return null;
  return (<div className="mb-6 animate-in fade-in duration-300"><Card><div className="px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Session</span>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-300"><span className="font-mono text-emerald-400">{stats.processed}</span> reviewed</span>
        {stats.blocked > 0 && <span className="text-xs text-zinc-300"><span className="font-mono text-red-400">{stats.blocked}</span> blocked</span>}
        {stats.escalated > 0 && <span className="text-xs text-zinc-300"><span className="font-mono text-amber-400">{stats.escalated}</span> escalated</span>}
        {stats.resolved > 0 && <span className="text-xs text-zinc-300"><span className="font-mono text-zinc-400">{stats.resolved}</span> safe</span>}
      </div>
    </div>
    <span className="text-[10px] font-mono text-zinc-600">avg {stats.processed > 0 ? Math.round(stats.totalDuration / stats.processed) : 0}s/case</span>
  </div></Card></div>);
};

// ─── DASHBOARD ───

const DashboardView = ({ cases, onSelectCase, openCount, sessionStats, initialFilter, onFilterChange }) => {
  const [riskFilter, setRiskFilter] = useState(initialFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filteredCases = useMemo(() => { let r = cases; if (riskFilter === 'high') r = r.filter(c => c.risk > 70); else if (riskFilter === 'medium') r = r.filter(c => c.risk > 40 && c.risk <= 70); else if (riskFilter === 'low') r = r.filter(c => c.risk <= 40); if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); r = r.filter(c => c.user.toLowerCase().includes(q) || c.id.includes(q) || c.type.toLowerCase().includes(q)); } return r; }, [cases, riskFilter, searchQuery]);
  const fL = { all: 'All', high: 'High Risk', medium: 'Medium', low: 'Low' };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Inbox</h1><p className="text-zinc-500 text-sm">{riskFilter === 'all' ? <>You have <span className="text-zinc-300 font-medium">{openCount} open</span> cases requiring attention.</> : <><span className="text-zinc-300 font-medium">{filteredCases.length}</span> {fL[riskFilter].toLowerCase()} case{filteredCases.length !== 1 ? 's' : ''} shown.</>}</p></div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search cases..." className="w-full h-9 bg-zinc-900/50 border border-zinc-800 rounded pl-9 pr-3 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600" /></div>
          <div className="relative">
            <Button variant={riskFilter !== 'all' ? 'primary' : 'secondary'} icon={Filter} onClick={() => setFilterOpen(!filterOpen)} className="h-9 px-3"><span className="hidden md:inline">{fL[riskFilter]}</span><ChevronDown size={12} className="hidden md:inline" /></Button>
            {filterOpen && (<div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden">
              {['all', 'high', 'medium', 'low'].map(level => { const cnt = level === 'all' ? cases.length : level === 'high' ? cases.filter(c => c.risk > 70).length : level === 'medium' ? cases.filter(c => c.risk > 40 && c.risk <= 70).length : cases.filter(c => c.risk <= 40).length; const dot = level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : level === 'low' ? 'bg-emerald-500' : 'bg-zinc-500'; return (<button key={level} onClick={() => { setRiskFilter(level); setFilterOpen(false); if (onFilterChange) onFilterChange(level); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-800 transition-colors ${riskFilter === level ? 'text-white bg-zinc-800/50' : 'text-zinc-400'}`}><span className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{fL[level]}</span><span className="text-[10px] font-mono text-zinc-600">{cnt}</span></button>); })}
            </div>)}
          </div>
        </div>
      </header>
      <SessionSummary stats={sessionStats} />
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase font-medium text-zinc-500 tracking-wider"><div className="col-span-1">Risk</div><div className="col-span-1">Case ID</div><div className="col-span-3">User</div><div className="col-span-2">Type</div><div className="col-span-2">Status</div><div className="col-span-1 text-right">Amount</div><div className="col-span-2 text-right">Time</div></div>
        <div className="divide-y divide-zinc-800/50">
          {filteredCases.length === 0 ? <div className="px-4 py-8 text-center text-sm text-zinc-600">No cases match your filters.</div> : filteredCases.map(c => (
            <div key={c.id} onClick={() => onSelectCase(c)} className={`group grid grid-cols-12 gap-2 md:gap-4 px-4 py-3 md:py-2.5 items-center cursor-pointer transition-colors ${c.status !== 'open' ? 'opacity-40 hover:opacity-60' : 'hover:bg-zinc-800/30'}`}>
              <div className="col-span-12 md:hidden flex justify-between items-center mb-1"><span className="text-xs font-mono text-zinc-400">#{c.id}</span><span className="text-xs text-zinc-600">{c.time}</span></div>
              <div className="col-span-2 md:col-span-1 flex items-center gap-2"><div className={`h-1.5 w-1.5 rounded-full ${c.risk > 70 ? 'bg-red-500' : c.risk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} /><span className={`font-mono text-xs ${c.risk > 70 ? 'text-red-400' : 'text-zinc-400'}`}>{c.risk}</span></div>
              <div className="hidden md:block col-span-1 text-sm font-mono text-zinc-400 group-hover:text-zinc-300">#{c.id}</div>
              <div className="col-span-6 md:col-span-3"><div className="text-sm font-medium text-zinc-200">{c.user}</div><div className="md:hidden flex gap-1 mt-1">{c.factors.slice(0,2).map(f => <span key={f} className="text-[10px] px-1 bg-zinc-800 rounded text-zinc-500">{f}</span>)}</div></div>
              <div className="hidden md:block col-span-2"><Badge color={c.type === 'Transfer' ? 'amber' : 'zinc'}>{c.type}</Badge></div>
              <div className="hidden md:block col-span-2"><Badge color={c.status === 'resolved' ? 'green' : c.status === 'escalated' ? 'amber' : 'zinc'}>{c.status}</Badge></div>
              <div className="col-span-4 md:col-span-1 text-right text-sm font-mono text-zinc-300">${c.amount.toLocaleString()}</div>
              <div className="hidden md:block col-span-2 text-right text-xs text-zinc-500">{c.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CASE DETAIL ───

const CaseDetailView = ({ caseData, queuePosition, onAction, onEscalateWithNote }) => {
  const [streamComplete, setStreamComplete] = useState(false);
  const handleStreamComplete = useCallback(() => setStreamComplete(true), []);
  useEffect(() => { setStreamComplete(false); }, [caseData.id]);
  const details = CASE_DETAILS[caseData.id] || CASE_DETAILS['4521'];
  const initials = caseData.user.split(' ').map(n => n[0]).join('');
  const comp = details.comparison;

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="mb-6 md:mb-8 px-2 md:px-0"><div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div>
        <div className="flex items-center gap-3 mb-2"><Badge color="amber" className="animate-pulse">Suspicious {caseData.type}</Badge><span className="text-[10px] text-zinc-500 font-mono">CASE #{caseData.id}</span>{queuePosition && <span className="text-[10px] text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{queuePosition.current} of {queuePosition.total} in queue</span>}</div>
        <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight leading-tight">Anomalous high-value {caseData.type.toLowerCase()} detected</h1>
      </div></div></header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 pb-20 md:pb-0">
        <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
          <Card className="h-auto"><CardHeader title="Risk Assessment" /><div className="p-4 md:p-6">
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tighter">{caseData.risk}<span className="text-base md:text-lg text-zinc-600 font-sans font-normal ml-1">/100</span></span>
              <span className={`text-[10px] md:text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1 px-2 py-1 rounded ${caseData.risk > 70 ? 'text-amber-500 bg-amber-500/10' : caseData.risk > 40 ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 bg-zinc-800'}`}><AlertTriangle size={12} /> {caseData.risk > 70 ? 'High Risk' : caseData.risk > 40 ? 'Medium' : 'Low'}</span>
            </div>
            <div className="mb-5"><ProgressBar value={caseData.risk} /></div>
            <div className="mb-5 p-3 bg-zinc-950/40 rounded border border-zinc-800/50">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between"><span>Normal behavior</span><span>This transaction</span></div>
              <ComparisonRow label="Amount" normal={comp.avgAmount} current={comp.thisAmount} isAnomaly={comp.avgAmount !== comp.thisAmount} />
              <ComparisonRow label="Geo" normal={comp.avgGeo} current={comp.thisGeo} isAnomaly={comp.avgGeo !== comp.thisGeo} />
              <ComparisonRow label="Device" normal={comp.avgDevice} current={comp.thisDevice} isAnomaly={comp.avgDevice !== comp.thisDevice} />
            </div>
            {details.factors.length > 0 && (<div className="space-y-0.5"><h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-3">Contributing Factors</h4>{details.factors.map((f, i) => <RiskFactorRow key={i} label={f.label} value={f.value} intensity={f.intensity} icon={ICON_MAP[f.icon] || Activity} />)}</div>)}
          </div></Card>

          <Card><CardHeader title="Customer Profile" action={<span className="flex items-center gap-1 text-[10px] text-zinc-600 cursor-pointer hover:text-zinc-400"><ArrowUpRight size={12} />CRM</span>} /><div className="p-4 md:p-6">
            <div className="flex items-center gap-4 mb-6"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-medium text-base md:text-lg shrink-0">{initials}</div><div className="overflow-hidden"><div className="text-white font-medium truncate">{caseData.user}</div><div className="text-xs md:text-sm text-zinc-500 truncate">{details.profile.email}</div><div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1 font-mono uppercase"><Check size={10} /> KYC Verified</div></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="p-3 bg-zinc-950/30 rounded border border-zinc-800/50"><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Tenure</div><div className="text-zinc-200 font-mono text-xs md:text-sm">{details.profile.tenure}</div></div><div className="p-3 bg-zinc-950/30 rounded border border-zinc-800/50"><div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Avg Monthly</div><div className="text-zinc-200 font-mono text-xs md:text-sm">{details.profile.avgMonthly}</div></div></div>
          </div></Card>
        </div>

        <div className="col-span-1 md:col-span-12 lg:col-span-8 space-y-4 md:space-y-6">
          <Card><CardHeader title="Transaction Flow" /><div className="p-4 md:p-8"><Timeline items={details.timeline} /></div></Card>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none"><Zap size={100} className="text-purple-500" /></div>
            <CardHeader title="AI Insight" action={<Badge color="purple">Beta</Badge>} />
            <div className="p-4 md:p-6 relative z-10">
              <StreamingInsight caseId={caseData.id} onStreamComplete={handleStreamComplete} />
              {streamComplete && (<>
                <div className="mt-5 ml-0 md:ml-10 flex flex-wrap gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button variant="danger" onClick={() => onAction('block')} className="text-xs" icon={Lock}>Block Card</Button>
                  <Button variant="secondary" onClick={onEscalateWithNote} className="text-xs" icon={ArrowUpRight}>Escalate</Button>
                  <Button variant="secondary" onClick={() => onAction('resolve')} className="text-xs" icon={Eye}>Monitor Only</Button>
                </div>
                <FollowUpInsight caseId={caseData.id} />
                <ConnectedSources />
              </>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ───

export default function App() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseStatus, setCaseStatus] = useState('open');
  const [lastAction, setLastAction] = useState(null);
  const [reviewDuration, setReviewDuration] = useState(0);
  const [escalationNote, setEscalationNote] = useState(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const reviewStartRef = useRef(null);
  const sessionStartRef = useRef(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [actionLog, setActionLog] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedFilter, setSavedFilter] = useState('all');

  const openCases = useMemo(() => cases.filter(c => c.status === 'open'), [cases]);
  const sessionStats = useMemo(() => ({ processed: processedCount, blocked: actionLog.filter(a => a.action === 'block').length, escalated: actionLog.filter(a => a.action === 'escalate').length, resolved: actionLog.filter(a => a.action === 'resolve').length, totalDuration: sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0 }), [processedCount, actionLog]);

  const handleKeyPress = useCallback((e) => { if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return; if (currentView === 'detail' && e.key === 'Escape') setCurrentView('dashboard'); }, [currentView]);
  useEffect(() => { document.addEventListener('keydown', handleKeyPress); return () => document.removeEventListener('keydown', handleKeyPress); }, [handleKeyPress]);

  const showToast = (msg, type) => { setToast({ visible: true, message: msg, type }); setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000); };
  const getNextOpenCase = useCallback((id) => cases.find(c => c.status === 'open' && c.id !== id), [cases]);
  const getQueuePosition = useCallback((id) => { const ids = openCases.map(c => c.id); const i = ids.indexOf(id); return i >= 0 ? { current: i + 1, total: ids.length } : null; }, [openCases]);

  const doAction = (action, note) => {
    if (!selectedCase) return;
    const ns = action === 'escalate' ? 'escalated' : 'resolved';
    const elapsed = reviewStartRef.current ? Math.round((Date.now() - reviewStartRef.current) / 1000) : 0;
    setReviewDuration(elapsed);
    setCases(p => p.map(c => c.id === selectedCase.id ? { ...c, status: ns } : c));
    setCaseStatus(ns); setLastAction(action); setProcessedCount(p => p + 1);
    setActionLog(p => [...p, { action, caseId: selectedCase.id }]);
    setEscalationNote(note || null);
    showToast({ escalate: 'Case escalated to Level 2', resolve: 'Case marked as safe', block: 'Account frozen & user notified' }[action], action === 'escalate' ? 'warning' : 'success');
    setCurrentView('confirmation');
  };

  const handleAction = (a) => doAction(a, null);
  const handleEscalateWithNote = () => setShowEscalationModal(true);
  const handleEscalationConfirm = (note) => { setShowEscalationModal(false); doAction('escalate', note); };
  const navToCase = (c) => { setSelectedCase(c); setCaseStatus(c.status); setCurrentView('detail'); reviewStartRef.current = Date.now(); if (!sessionStartRef.current) sessionStartRef.current = Date.now(); window.scrollTo(0, 0); };
  const navToDash = () => { setCurrentView('dashboard'); setSelectedCase(null); window.scrollTo(0, 0); };
  const reviewNext = () => { const n = getNextOpenCase(selectedCase?.id); if (n) navToCase(n); };
  const exportReport = () => showToast('Report downloaded (PDF)', 'success');

  const queueStats = useMemo(() => ({ remaining: openCases.filter(c => c.id !== selectedCase?.id).length, processed: processedCount, totalDuration: sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0 }), [openCases, selectedCase, processedCount]);
  const insightText = selectedCase ? (AI_INSIGHTS[selectedCase.id] || AI_INSIGHTS['4521']).lines.slice(1, 3).join(' ') : '';

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 md:pb-10 relative">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      {showEscalationModal && selectedCase && <EscalationNote caseData={selectedCase} insightText={insightText} onConfirm={handleEscalationConfirm} onCancel={() => setShowEscalationModal(false)} />}

      {isMobileMenuOpen && (<div className="fixed inset-0 z-[60] md:hidden"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} /><div className="absolute inset-y-0 left-0 w-3/4 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col"><div className="flex items-center gap-2 text-zinc-100 font-semibold mb-8"><ShieldAlert size={20} className="text-amber-500" /><span>RiskOS</span></div><div className="space-y-4"><div onClick={() => { navToDash(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded text-zinc-200"><Activity size={18} /> Dashboard</div><div className="flex items-center gap-3 p-3 text-zinc-500"><CreditCard size={18} /> Transactions</div></div></div></div>)}

      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="md:hidden text-zinc-400 p-1 -ml-2" onClick={() => { currentView !== 'dashboard' ? navToDash() : setIsMobileMenuOpen(true); }}>{currentView !== 'dashboard' ? <ArrowLeft size={20} /> : <Menu size={20} />}</div>
            <div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-tight cursor-pointer" onClick={navToDash}><ShieldAlert size={18} className="text-amber-500" /><span className="hidden md:inline">RiskOS</span></div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-zinc-700 text-lg font-light">/</span>
              <span className={`transition-colors cursor-pointer ${currentView === 'dashboard' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} onClick={navToDash}>Inbox</span>
              {currentView !== 'dashboard' && selectedCase && (<><ChevronRight size={14} className="text-zinc-700" /><span className="text-zinc-100 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-xs">#{selectedCase.id}</span>{caseStatus === 'escalated' && <Badge color="amber" className="ml-2">Escalated</Badge>}{caseStatus === 'resolved' && <Badge color="green" className="ml-2">Resolved</Badge>}</>)}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {currentView === 'dashboard' && (<div className="flex items-center gap-3"><span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{openCases.length} open</span><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs text-zinc-400">System Operational</span></div>)}
            {currentView === 'detail' && (<div className="flex items-center gap-3"><span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{openCases.length} in queue</span><span className="text-[10px] text-zinc-600"><kbd className="font-sans border border-zinc-800 px-1 rounded bg-zinc-900">Esc</kbd> Inbox</span></div>)}
          </div>
          <div className="md:hidden flex items-center">{currentView !== 'dashboard' && selectedCase && <span className="text-xs font-mono text-zinc-500">#{selectedCase.id}</span>}</div>
        </div>
      </nav>

      {currentView === 'dashboard' && <DashboardView cases={cases} onSelectCase={navToCase} openCount={openCases.length} sessionStats={sessionStats} initialFilter={savedFilter} onFilterChange={setSavedFilter} />}
      {currentView === 'detail' && selectedCase && <CaseDetailView caseData={selectedCase} queuePosition={getQueuePosition(selectedCase.id)} onAction={handleAction} onEscalateWithNote={handleEscalateWithNote} />}
      {currentView === 'confirmation' && selectedCase && <ActionConfirmation action={lastAction} caseData={selectedCase} reviewDuration={reviewDuration} nextCase={getNextOpenCase(selectedCase.id)} queueStats={queueStats} escalationNote={escalationNote} onReviewNext={reviewNext} onBackToInbox={navToDash} onExportReport={exportReport} />}

      {currentView === 'detail' && (<div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-3 md:hidden z-50 flex gap-3 safe-area-bottom animate-in slide-in-from-bottom duration-300"><Button variant="secondary" onClick={() => handleAction('escalate')} className="flex-1 py-6">Escalate</Button><Button variant="primary" onClick={() => handleAction('resolve')} className="flex-1 py-6 bg-white text-black">Resolve</Button></div>)}
    </div>
  );
}
