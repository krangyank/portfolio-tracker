import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  PlusCircle, Trash2, TrendingUp, Wallet, PiggyBank, Flame, Landmark,
  BarChart3, Camera, Sparkles, Share2, X, Loader2, RefreshCw, ChevronDown, ChevronUp,
  Settings, AlertTriangle, CheckCircle2, Info, Calendar, LogOut,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase.js';
import AuthGate from './Login.jsx';

const INK = '#14213D';
const PAPER = '#FAF7F0';
const PAPER_DIM = '#F0EBDD';
const BRASS = '#B8874B';
const SLATE = '#6B7280';
const GOOD = '#3F6152';
const BAD = '#A64B3D';
const WARN = '#B8874B';

const CATEGORY_META = {
  cooperative: { label: 'สหกรณ์ออมทรัพย์ครู', color: '#B8874B' },
  real_estate: { label: 'อสังหาริมทรัพย์', color: '#7A5230' },
  business: { label: 'ธุรกิจร้านยา', color: '#9C6B3E' },
  bond: { label: 'หุ้นกู้ / ตราสารหนี้', color: '#4B6B53' },
  set_stock: { label: 'หุ้นไทย (SET)', color: '#A64B3D' },
  mutual_fund: { label: 'กองทุนรวม', color: '#5C6F8A' },
  dime: { label: 'Dime! (หุ้น/กองทุนสหรัฐฯ)', color: '#2E5266' },
  other: { label: 'อื่นๆ', color: '#6B7280' },
};
const HOLDING_CATEGORIES = ['set_stock', 'dime'];
const RISK_CATEGORIES = ['set_stock', 'dime', 'mutual_fund'];

const SOURCES = [
  { id: 'coop_div', label: 'ปันผลสหกรณ์' },
  { id: 'coop_interest', label: 'ดอกเบี้ยเงินฝากสหกรณ์' },
  { id: 'thai_div', label: 'ปันผลหุ้นไทย' },
  { id: 'rental', label: 'ค่าเช่า' },
  { id: 'us_div', label: 'ปันผลหุ้นสหรัฐฯ' },
  { id: 'wealthx', label: 'Wealth X (หักอัตโนมัติ)' },
  { id: 'pharmacy', label: 'เงินเก็บร้านยา' },
  { id: 'other', label: 'อื่นๆ' },
];

const fmt = (n) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n || 0);
const uid = () => Math.random().toString(36).slice(2, 10);
const monthKey = (d) => d.slice(0, 7);
const quarterKey = (d) => `${d.slice(0, 4)}-Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1}`;
const yearKey = (d) => d.slice(0, 4);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const prevMonthKey = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };

const EMPTY_STATE = {
  accounts: [], income: [], contributions: [], history: [],
  targetDate: '2029-01-01', goalNetWorth: 0, finnhubKey: '',
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
// calls our own serverless function instead of Anthropic directly
async function askServer(promptText, imageBase64, mediaType) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, imageBase64, mediaType }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || '';
}

function holdingMarketValueTHB(h) { const fx = h.currency === 'USD' ? Number(h.currentFx || 0) : 1; return Number(h.shares || 0) * Number(h.currentPrice || 0) * fx; }
function holdingCostBasisTHB(h) { const fx = h.currency === 'USD' ? Number(h.purchaseFx || 0) : 1; return Number(h.shares || 0) * Number(h.avgCost || 0) * fx; }
function holdingCAGR(h) {
  if (!h.purchaseDate) return null;
  const years = (Date.now() - new Date(h.purchaseDate).getTime()) / (365.25 * 24 * 3600 * 1000);
  const basis = holdingCostBasisTHB(h); const value = holdingMarketValueTHB(h);
  if (years < 0.15 || basis <= 0) return null;
  return (Math.pow(value / basis, 1 / years) - 1) * 100;
}
function accountValueTHB(a) {
  if (a.holdings && a.holdings.length > 0) return a.holdings.reduce((s, h) => s + holdingMarketValueTHB(h), 0);
  return Number(a.value || 0);
}

function NumInput({ value, onChange, className, style, placeholder }) {
  return (
    <input type="text" inputMode="decimal" value={value === 0 || value === undefined || value === null ? '' : value}
      placeholder={placeholder || '0'} onFocus={(e) => e.target.select()}
      onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); onChange(raw === '' ? 0 : Number(raw)); }}
      className={className} style={style} />
  );
}

function computeInsights({ accounts, totalNetWorth, categoryBreakdown, requiredDaily, contributions }) {
  const insights = [];
  categoryBreakdown.forEach((c) => {
    if (RISK_CATEGORIES.includes(c.key) && c.pct > 40) insights.push({ tone: 'warn', text: `${c.label} คิดเป็น ${c.pct.toFixed(0)}% ของสินทรัพย์สุทธิ — สัดส่วนค่อนข้างสูง อาจกระจุกตัว` });
  });
  accounts.forEach((a) => (a.holdings || []).forEach((h) => {
    const pct = totalNetWorth ? (holdingMarketValueTHB(h) / totalNetWorth) * 100 : 0;
    if (pct >= 8 && h.symbol) insights.push({ tone: 'warn', text: `${h.symbol} คิดเป็น ${pct.toFixed(1)}% ของสินทรัพย์สุทธิทั้งหมด` });
  }));
  const allDivs = [];
  accounts.forEach((a) => (a.holdings || []).forEach((h) => (h.dividends || []).forEach((d) => allDivs.push(d))));
  const byMonth = {};
  allDivs.forEach((d) => { byMonth[monthKey(d.date)] = (byMonth[monthKey(d.date)] || 0) + Number(d.amount || 0); });
  const now = thisMonth();
  const pastMonths = Object.keys(byMonth).filter((m) => m !== now).sort().slice(-3);
  if (pastMonths.length >= 2) {
    const avg = pastMonths.reduce((s, m) => s + byMonth[m], 0) / pastMonths.length;
    const cur = byMonth[now] || 0;
    if (avg > 0 && cur < avg * 0.6) insights.push({ tone: 'warn', text: `ปันผลเดือนนี้ (฿${fmt(cur)}) ต่ำกว่าค่าเฉลี่ย 3 เดือนก่อนหน้า (฿${fmt(avg)})` });
    else if (avg > 0 && cur > avg * 1.2) insights.push({ tone: 'good', text: `ปันผลเดือนนี้ (฿${fmt(cur)}) สูงกว่าค่าเฉลี่ยที่ผ่านมา` });
  }
  if (requiredDaily > 0) {
    const last30 = contributions.filter((c) => Date.now() - new Date(c.date).getTime() < 30 * 24 * 3600 * 1000);
    const actualDaily = last30.reduce((s, c) => s + Number(c.amount || 0), 0) / 30;
    if (actualDaily < requiredDaily * 0.8) insights.push({ tone: 'warn', text: `ออมเฉลี่ย 30 วันล่าสุด ~฿${fmt(actualDaily)}/วัน ยังต่ำกว่าที่ต้องการ (฿${fmt(requiredDaily)}/วัน)` });
    else insights.push({ tone: 'good', text: `จังหวะการออมตอนนี้ทันเป้าหมายที่ตั้งไว้` });
  }
  if (insights.length === 0) insights.push({ tone: 'info', text: 'ยังไม่มีข้อสังเกตพิเศษ — พอร์ตดูสมดุลดีในตอนนี้' });
  return insights;
}

export default function App() {
  return <AuthGate>{(user) => <Tracker user={user} />}</AuthGate>;
}

function Tracker({ user }) {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [shareMode, setShareMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const docRef = doc(db, 'users', user.uid, 'data', 'portfolio');

  useEffect(() => {
    (async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) setState({ ...EMPTY_STATE, ...snap.data() });
      else { await setDoc(docRef, EMPTY_STATE); setState(EMPTY_STATE); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  function persist(next) { setState(next); setDoc(docRef, next).catch((e) => console.error('save failed', e)); }

  const accounts = state?.accounts || [];
  const income = state?.income || [];
  const contributions = state?.contributions || [];
  const history = state?.history || [];

  const totalNetWorth = useMemo(() => accounts.reduce((s, a) => s + accountValueTHB(a), 0), [accounts]);
  const monthlyIncome = useMemo(() => income.reduce((s, i) => s + Number(i.amount || 0), 0), [income]);
  const passiveIncome = useMemo(() => income.filter((i) => i.tag !== 'pharmacy').reduce((s, i) => s + Number(i.amount || 0), 0), [income]);
  const activeIncome = useMemo(() => income.filter((i) => i.tag === 'pharmacy').reduce((s, i) => s + Number(i.amount || 0), 0), [income]);
  const investedThisMonth = useMemo(() => contributions.filter((c) => c.date.startsWith(thisMonth())).reduce((s, c) => s + Number(c.amount || 0), 0), [contributions]);
  const savingsRate = monthlyIncome > 0 ? Math.min(999, (investedThisMonth / monthlyIncome) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    accounts.forEach((a) => { map[a.category] = (map[a.category] || 0) + accountValueTHB(a); });
    return Object.entries(map).map(([key, value]) => ({ key, value, ...CATEGORY_META[key], pct: totalNetWorth ? (value / totalNetWorth) * 100 : 0 })).sort((a, b) => b.value - a.value);
  }, [accounts, totalNetWorth]);

  const daysLeft = useMemo(() => {
    if (!state) return 0;
    return Math.max(0, Math.ceil((new Date(state.targetDate) - new Date()) / (1000 * 60 * 60 * 24)));
  }, [state]);
  const requiredDaily = useMemo(() => {
    if (!state || !state.goalNetWorth || state.goalNetWorth <= totalNetWorth || daysLeft <= 0) return 0;
    return (state.goalNetWorth - totalNetWorth) / daysLeft;
  }, [state, totalNetWorth, daysLeft]);
  const avgFxFromContributions = useMemo(() => {
    const withFx = contributions.filter((c) => c.usdAmount && Number(c.usdAmount) > 0);
    const thb = withFx.reduce((s, c) => s + Number(c.amount || 0), 0);
    const usd = withFx.reduce((s, c) => s + Number(c.usdAmount || 0), 0);
    return usd > 0 ? thb / usd : null;
  }, [contributions]);
  const costBasisByAccount = useMemo(() => {
    const map = {};
    contributions.forEach((c) => { map[c.accountId] = (map[c.accountId] || 0) + Number(c.amount || 0); });
    return map;
  }, [contributions]);
  const insights = useMemo(() => (state ? computeInsights({ accounts, totalNetWorth, categoryBreakdown, requiredDaily, contributions }) : []), [state, accounts, totalNetWorth, categoryBreakdown, requiredDaily, contributions]);
  const prevSnapshot = useMemo(() => history.find((h) => h.month === prevMonthKey()), [history]);

  useEffect(() => {
    if (!state) return;
    const month = thisMonth();
    const entry = { month, netWorth: totalNetWorth, passiveIncome, activeIncome };
    const idx = history.findIndex((h) => h.month === month);
    const changed = idx < 0 || history[idx].netWorth !== totalNetWorth || history[idx].passiveIncome !== passiveIncome || history[idx].activeIncome !== activeIncome;
    if (!changed) return;
    const next = idx >= 0 ? history.map((h, i) => (i === idx ? entry : h)) : [...history, entry];
    persist({ ...state, history: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, totalNetWorth, passiveIncome, activeIncome]);

  if (!state) return <div style={{ background: PAPER, minHeight: '100vh' }} className="flex items-center justify-center"><p style={{ fontFamily: 'Sarabun, sans-serif', color: INK }}>กำลังโหลดข้อมูล...</p></div>;

  const updateAccount = (id, patch) => persist({ ...state, accounts: accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const addAccount = (category, name, value) => {
    const base = { id: uid(), category, name: name || 'บัญชีใหม่', value: value || 0 };
    if (HOLDING_CATEGORIES.includes(category)) base.holdings = [];
    persist({ ...state, accounts: [...accounts, base] });
  };
  const removeAccount = (id) => persist({ ...state, accounts: accounts.filter((a) => a.id !== id) });
  const updateIncome = (id, patch) => persist({ ...state, income: income.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const addIncome = () => persist({ ...state, income: [...income, { id: uid(), name: 'แหล่งรายได้ใหม่', amount: 0, tag: 'other' }] });
  const removeIncome = (id) => persist({ ...state, income: income.filter((i) => i.id !== id) });
  const addContribution = (entry) => persist({ ...state, contributions: [{ id: uid(), ...entry }, ...contributions] });
  const removeContribution = (id) => persist({ ...state, contributions: contributions.filter((c) => c.id !== id) });
  const changeTargetDate = (d) => persist({ ...state, targetDate: d });
  const changeGoal = (v) => persist({ ...state, goalNetWorth: v });
  const changeFinnhubKey = (v) => persist({ ...state, finnhubKey: v });

  function addHolding(accountId) {
    const acc = accounts.find((a) => a.id === accountId);
    const currency = acc.category === 'dime' ? 'USD' : 'THB';
    const h = { id: uid(), symbol: '', name: '', shares: 0, avgCost: 0, currency, purchaseFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, currentPrice: 0, currentFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, lastUpdated: '', purchaseDate: '', dividends: [] };
    updateAccount(accountId, { holdings: [...(acc.holdings || []), h] });
  }
  function updateHolding(accountId, holdingId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    updateAccount(accountId, { holdings: acc.holdings.map((h) => (h.id === holdingId ? { ...h, ...patch } : h)) });
  }
  function removeHolding(accountId, holdingId) {
    const acc = accounts.find((a) => a.id === accountId);
    updateAccount(accountId, { holdings: acc.holdings.filter((h) => h.id !== holdingId) });
  }
  function addDividend(accountId, holdingId, entry) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { dividends: [{ id: uid(), ...entry }, ...(h.dividends || [])] });
  }
  function removeDividend(accountId, holdingId, divId) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { dividends: (h.dividends || []).filter((d) => d.id !== divId) });
  }
  async function refreshFxRate() {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=THB');
      const data = await res.json();
      const rate = data && data.rates && data.rates.THB;
      if (!rate) return null;
      const next = accounts.map((a) => (!a.holdings ? a : { ...a, holdings: a.holdings.map((h) => (h.currency === 'USD' ? { ...h, currentFx: rate, lastUpdated: new Date().toISOString().slice(0, 10) } : h)) }));
      persist({ ...state, accounts: next });
      return rate;
    } catch (e) { return null; }
  }
  async function refreshHoldingPrice(accountId, holdingId, symbol) {
    if (!state.finnhubKey) { setShowSettings(true); return; }
    try {
      const res = await fetch(`https://finnhub.io/api/v2/quote?symbol=${encodeURIComponent(symbol)}&token=${state.finnhubKey}`);
      const data = await res.json();
      if (data && data.c) updateHolding(accountId, holdingId, { currentPrice: data.c, lastUpdated: new Date().toISOString().slice(0, 10) });
    } catch (e) { console.error('price fetch failed', e); }
  }

  if (shareMode) return <ShareView totalNetWorth={totalNetWorth} categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} daysLeft={daysLeft} onClose={() => setShareMode(false)} />;

  return (
    <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: INK }} className="pb-24">
      <div style={{ background: INK }} className="px-5 pt-8 pb-6 text-white relative overflow-hidden">
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', border: `1px solid ${BRASS}55` }} />
        <div className="flex justify-between items-start">
          <div><p className="text-xs tracking-widest" style={{ color: BRASS }}>สมุดบัญชีการลงทุน</p><h1 className="text-3xl mt-1 font-semibold">สินทรัพย์สุทธิ</h1></div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><Settings size={13} /></button>
            <button onClick={() => setShareMode(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><Share2 size={13} /></button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><LogOut size={13} /></button>
          </div>
        </div>
        <p className="text-4xl mt-3 font-semibold">฿{fmt(totalNetWorth)}</p>
        {prevSnapshot && <p className="text-xs mt-1" style={{ color: totalNetWorth >= prevSnapshot.netWorth ? '#9CD3B0' : '#E3A79A' }}>{totalNetWorth >= prevSnapshot.netWorth ? '+' : ''}฿{fmt(totalNetWorth - prevSnapshot.netWorth)} จากเดือนก่อน</p>}
        <div className="flex items-center gap-2 mt-3"><Flame size={14} color={BRASS} /><p className="text-xs" style={{ color: '#D8CBB0' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p></div>
      </div>

      {showSettings && <SettingsModal finnhubKey={state.finnhubKey} onChange={changeFinnhubKey} onClose={() => setShowSettings(false)} />}

      {tab === 'dashboard' && (
        <Dashboard categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} passiveIncome={passiveIncome} activeIncome={activeIncome}
          investedThisMonth={investedThisMonth} savingsRate={savingsRate} targetDate={state.targetDate} onChangeTarget={changeTargetDate}
          goalNetWorth={state.goalNetWorth} onChangeGoal={changeGoal} requiredDaily={requiredDaily} avgFx={avgFxFromContributions}
          totalNetWorth={totalNetWorth} contributions={contributions} daysLeft={daysLeft} onRefreshFx={refreshFxRate} insights={insights} />
      )}
      {tab === 'accounts' && (
        <AccountsTab accounts={accounts} onUpdate={updateAccount} onAdd={addAccount} onRemove={removeAccount} costBasisByAccount={costBasisByAccount}
          onAddHolding={addHolding} onUpdateHolding={updateHolding} onRemoveHolding={removeHolding} onAddDividend={addDividend}
          onRemoveDividend={removeDividend} onRefreshPrice={refreshHoldingPrice} finnhubKey={state.finnhubKey} />
      )}
      {tab === 'savings' && <SavingsTab accounts={accounts} contributions={contributions} onAdd={addContribution} onRemove={removeContribution} />}
      {tab === 'income' && <IncomeTab income={income} onUpdate={updateIncome} onAdd={addIncome} onRemove={removeIncome} monthlyIncome={monthlyIncome} />}
      {tab === 'reports' && <ReportsTab contributions={contributions} accounts={accounts} costBasisByAccount={costBasisByAccount} history={history} />}

      <div style={{ background: INK, borderTop: `1px solid ${BRASS}33` }} className="fixed bottom-0 left-0 right-0 flex justify-around py-3 text-white">
        {[{ id: 'dashboard', label: 'ภาพรวม', icon: Wallet }, { id: 'accounts', label: 'บัญชี', icon: Landmark }, { id: 'savings', label: 'เงินเข้า', icon: PiggyBank }, { id: 'income', label: 'รายรับ', icon: TrendingUp }, { id: 'reports', label: 'รายงาน', icon: BarChart3 }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-1">
            <t.icon size={18} color={tab === t.id ? BRASS : '#8A93A6'} /><span className="text-[9px]" style={{ color: tab === t.id ? BRASS : '#8A93A6' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ children }) { return <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-xl p-4 mb-4">{children}</div>; }

function SettingsModal({ finnhubKey, onChange, onClose }) {
  return (
    <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
      <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">ตั้งค่า</p><button onClick={onClose}><X size={20} color={INK} /></button></div>
        <p className="text-xs mb-2" style={{ color: SLATE }}>Finnhub API key (ฟรี) — ใช้สำหรับปุ่มรีเฟรชราคาหุ้นสหรัฐฯ สมัครที่ finnhub.io/register</p>
        <input type="text" value={finnhubKey || ''} onChange={(e) => onChange(e.target.value)} placeholder="วาง API key ที่นี่" style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mb-2" />
        <p className="text-[11px]" style={{ color: SLATE }}>หุ้นไทย (SET) ยังไม่มี API ฟรีที่ดึงราคาได้ตรงจากเบราว์เซอร์ ต้องอัพเดทราคาด้วยตนเองไปก่อนครับ</p>
      </div>
    </div>
  );
}

function ShareView({ totalNetWorth, categoryBreakdown, monthlyIncome, daysLeft, onClose }) {
  return (
    <div style={{ background: INK, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: 'white' }} className="p-6">
      <div className="flex justify-between items-center mb-6"><p className="text-xs tracking-widest" style={{ color: BRASS }}>สรุปพอร์ตการลงทุน</p><button onClick={onClose}><X size={20} color="white" /></button></div>
      <p className="text-2xl mb-1">สินทรัพย์สุทธิ</p>
      <p className="text-4xl font-semibold mb-6">฿{fmt(totalNetWorth)}</p>
      <div className="mb-6">
        {categoryBreakdown.map((c) => (
          <div key={c.key} className="mb-3">
            <div className="flex justify-between text-sm mb-1"><span>{c.label}</span><span>{c.pct.toFixed(1)}%</span></div>
            <div style={{ background: '#ffffff22' }} className="h-2 rounded-full overflow-hidden"><div style={{ width: `${c.pct}%`, background: c.color }} className="h-full rounded-full" /></div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #ffffff22' }} className="pt-4 mb-4"><p className="text-xs" style={{ color: '#D8CBB0' }}>กระแสเงินสดต่อเดือน</p><p className="text-xl">฿{fmt(monthlyIncome)}</p></div>
      <div className="flex items-center gap-2 mb-8"><Flame size={14} color={BRASS} /><p className="text-xs" style={{ color: '#D8CBB0' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p></div>
      <p className="text-[11px] text-center" style={{ color: '#8A93A6' }}>ใช้ปุ่มแคปหน้าจอของเครื่องเพื่อบันทึกภาพนี้</p>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return <div style={{ background: PAPER_DIM }} className="rounded-xl p-3"><p className="text-[10px] mb-1" style={{ color: SLATE }}>{label}</p><p className="text-lg font-semibold" style={{ color: color || INK }}>{value}</p></div>;
}
function InsightRow({ tone, text }) {
  const Icon = tone === 'warn' ? AlertTriangle : tone === 'good' ? CheckCircle2 : Info;
  const color = tone === 'warn' ? WARN : tone === 'good' ? GOOD : SLATE;
  return <div className="flex items-start gap-2 mb-2"><Icon size={15} color={color} style={{ marginTop: 1, flexShrink: 0 }} /><p className="text-sm">{text}</p></div>;
}

function Dashboard({ categoryBreakdown, monthlyIncome, passiveIncome, activeIncome, investedThisMonth, savingsRate, targetDate, onChangeTarget, goalNetWorth, onChangeGoal, requiredDaily, avgFx, totalNetWorth, contributions, daysLeft, onRefreshFx, insights }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');
  const [newAmount, setNewAmount] = useState(10000);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxResult, setFxResult] = useState(null);
  const [calcMonthly, setCalcMonthly] = useState(50000);
  const goalPct = goalNetWorth ? Math.min(100, (totalNetWorth / goalNetWorth) * 100) : null;
  const monthsToGoal = goalNetWorth > totalNetWorth && calcMonthly > 0 ? Math.ceil((goalNetWorth - totalNetWorth) / calcMonthly) : 0;

  async function runAi() {
    setAiLoading(true); setAiError(''); setAiOpen(true);
    try {
      const recent = contributions.slice(0, 20).map((c) => `${c.date} ${SOURCES.find((s) => s.id === c.source)?.label || c.source} ฿${c.amount}`).join('\n');
      const prompt = `คุณเป็นผู้ช่วยวางแผนการเงินส่วนบุคคล ผู้ใช้เป็นคนไทยอายุใกล้เกษียณ (เป้าหมายเกษียณอีก ${daysLeft} วัน)
สินทรัพย์สุทธิปัจจุบัน: ${fmt(totalNetWorth)} บาท, เป้าหมาย: ${goalNetWorth ? fmt(goalNetWorth) : 'ยังไม่ตั้ง'} บาท
Passive income เดือนนี้: ${fmt(passiveIncome)}, Active income: ${fmt(activeIncome)}, อัตราการออม: ${savingsRate.toFixed(0)}%
สัดส่วนสินทรัพย์: ${categoryBreakdown.map((c) => `${c.label} ${c.pct.toFixed(1)}%`).join(', ')}
เงินก้อนใหม่ที่จะลงทุนรอบนี้: ${fmt(newAmount)} บาท
ประวัติเงินเข้าล่าสุด: ${recent || '(ไม่มีข้อมูล)'}
ช่วยแนะนำสั้นๆ ภาษาไทย 3 ข้อ ไม่เกิน 200 คำ ห้ามเตือนเรื่อง "ไม่ใช่คำแนะนำทางการเงิน" เกินหนึ่งครั้ง`;
      const text = await askServer(prompt);
      setAiText(text || 'ไม่สามารถรับคำแนะนำได้ในขณะนี้');
    } catch (e) { setAiError('เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ' + e.message); } finally { setAiLoading(false); }
  }
  async function runRefreshFx() { setFxLoading(true); const rate = await onRefreshFx(); setFxResult(rate); setFxLoading(false); }
  const pieData = categoryBreakdown.map((c) => ({ name: c.label, value: c.value, color: c.color }));

  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สุขภาพการเงินเดือนนี้</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Passive Income" value={`฿${fmt(passiveIncome)}`} color={GOOD} />
          <StatBox label="Active Income" value={`฿${fmt(activeIncome)}`} />
          <StatBox label="ลงทุนเดือนนี้" value={`฿${fmt(investedThisMonth)}`} />
          <StatBox label="อัตราการออม" value={`${savingsRate.toFixed(0)}%`} color={savingsRate >= 50 ? GOOD : WARN} />
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-2"><p className="text-xs" style={{ color: SLATE }}>ความคืบหน้าสู่เป้าหมาย (FIRE)</p>{goalPct !== null && <p className="text-sm font-semibold">{goalPct.toFixed(1)}%</p>}</div>
        {goalNetWorth ? (
          <>
            <div style={{ background: PAPER_DIM }} className="h-3 rounded-full overflow-hidden mb-2"><div style={{ width: `${goalPct}%`, background: BRASS }} className="h-full rounded-full" /></div>
            <p className="text-xs mb-3" style={{ color: SLATE }}>฿{fmt(totalNetWorth)} จากเป้าหมาย ฿{fmt(goalNetWorth)}</p>
            <div className="flex gap-2 items-center"><span className="text-xs" style={{ color: SLATE }}>ถ้าออมเดือนละ</span><NumInput value={calcMonthly} onChange={setCalcMonthly} className="text-xs rounded px-2 py-1 w-24" style={{ border: '1px solid #E7E0CE' }} /><span className="text-xs" style={{ color: SLATE }}>บาท</span></div>
            {monthsToGoal > 0 && <p className="text-xs mt-2" style={{ color: GOOD }}>จะถึงเป้าหมายในอีกประมาณ {monthsToGoal} เดือน ({(monthsToGoal / 12).toFixed(1)} ปี)</p>}
          </>
        ) : <p className="text-xs" style={{ color: SLATE }}>ยังไม่ได้ตั้งเป้าหมายสินทรัพย์สุทธิ</p>}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ข้อสังเกตอัตโนมัติ</p>
        {insights.map((it, i) => <InsightRow key={i} tone={it.tone} text={it.text} />)}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สัดส่วนสินทรัพย์ตามประเภท</p>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={(v) => `฿${fmt(v)}`} /></PieChart></ResponsiveContainer>
        </div>
        {categoryBreakdown.map((c) => <div key={c.key} className="flex justify-between text-xs mb-1.5 mt-1"><span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 4, background: c.color, display: 'inline-block' }} />{c.label}</span><span>{c.pct.toFixed(1)}%</span></div>)}
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-1"><p className="text-xs" style={{ color: SLATE }}>อัตราแลกเปลี่ยน USD/THB</p><button onClick={runRefreshFx} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}>{fxLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} รีเฟรช</button></div>
        {fxResult && <p className="text-xl">1 USD ≈ {fxResult.toFixed(2)} บาท</p>}
        {!fxResult && avgFx && <p className="text-xs" style={{ color: SLATE }}>อัตราเฉลี่ยที่เคยซื้อ: {avgFx.toFixed(2)} บาท/USD</p>}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ตั้งเป้าหมาย</p>
        <label className="text-xs" style={{ color: SLATE }}>วันที่เป้าหมายเกษียณ</label>
        <input type="date" value={targetDate} onChange={(e) => onChangeTarget(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>เป้าหมายสินทรัพย์สุทธิ (บาท)</label>
        <NumInput value={goalNetWorth} onChange={onChangeGoal} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
        {requiredDaily > 0 && <p className="text-xs mt-3" style={{ color: GOOD }}>ควรออมเพิ่มวันละ ~฿{fmt(requiredDaily)}</p>}
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-2"><Sparkles size={16} color={BRASS} /><p className="text-sm font-semibold">ให้ AI แนะนำสัดส่วนการลงทุน</p></div>
        <label className="text-xs" style={{ color: SLATE }}>เงินก้อนใหม่ที่จะลงทุนรอบนี้ (บาท)</label>
        <NumInput value={newAmount} onChange={setNewAmount} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <button onClick={runAi} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} color={BRASS} />}{aiLoading ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำ'}
        </button>
        {aiOpen && !aiLoading && <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-3 mt-3 text-sm whitespace-pre-wrap">{aiError ? <span style={{ color: BAD }}>{aiError}</span> : aiText}</div>}
      </Card>
    </div>
  );
}

function AccountsTab({ accounts, onUpdate, onAdd, onRemove, costBasisByAccount, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onRefreshPrice, finnhubKey }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const grouped = useMemo(() => { const map = {}; accounts.forEach((a) => { (map[a.category] = map[a.category] || []).push(a); }); return map; }, [accounts]);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanning(true); setScanError(''); setExtracted(null);
    try {
      const base64 = await readFileAsBase64(file);
      const prompt = `นี่คือภาพหน้าจอแอปการลงทุน อ่านค่ามูลค่าสินทรัพย์/พอร์ตที่แสดงในภาพ แล้วตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: [{"name":"ชื่อสินทรัพย์","value":ตัวเลขไม่มีคอมมา,"currency":"THB หรือ USD"}]`;
      const text = await askServer(prompt, base64, file.type || 'image/jpeg');
      const clean = text.replace(/```json|```/g, '').trim();
      setExtracted(JSON.parse(clean));
    } catch (e) { setScanError('อ่านภาพไม่สำเร็จ: ' + e.message); } finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  function applyExtractedItem(item, category) {
    const match = accounts.find((a) => a.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(a.name.toLowerCase()));
    if (match) onUpdate(match.id, { value: Number(item.value) || 0 });
    else onAdd(category, item.name, Number(item.value) || 0);
  }

  return (
    <div className="px-5 pt-5">
      <Card>
        <div className="flex items-center gap-2 mb-2"><Camera size={16} color={BRASS} /><p className="text-sm font-semibold">อัพเดทพอร์ตจากภาพหน้าจอ</p></div>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ถ่ายหรือแคปหน้าจอแอปลงทุน ระบบจะอ่านมูลค่าแล้วให้ตรวจสอบก่อนบันทึกเสมอ</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{scanning ? 'กำลังอ่านภาพ...' : 'เลือกภาพ'}
        </button>
        {scanError && <p className="text-xs mt-2" style={{ color: BAD }}>{scanError}</p>}
        {extracted && extracted.length > 0 && (
          <div className="mt-3">
            <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {extracted.length} รายการ — กดยืนยันทีละรายการ</p>
            {extracted.map((item, idx) => (
              <div key={idx} style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2 flex justify-between items-center">
                <div><p className="text-sm">{item.name}</p><p className="text-xs" style={{ color: SLATE }}>{item.value} {item.currency}</p></div>
                <button onClick={() => { applyExtractedItem(item, 'other'); setExtracted(extracted.filter((_, i) => i !== idx)); }} style={{ color: BRASS }} className="text-xs font-semibold">ยืนยัน</button>
              </div>
            ))}
          </div>
        )}
      </Card>
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <div key={key} className="mb-5">
          <div className="flex justify-between items-center mb-2"><p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p><button onClick={() => onAdd(key)} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่มบัญชี</button></div>
          {(grouped[key] || []).map((a) => (
            HOLDING_CATEGORIES.includes(key)
              ? <StockAccountCard key={a.id} account={a} onUpdate={onUpdate} onRemove={onRemove} onAddHolding={onAddHolding} onUpdateHolding={onUpdateHolding} onRemoveHolding={onRemoveHolding} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onRefreshPrice={onRefreshPrice} finnhubKey={finnhubKey} categoryColor={meta.color} />
              : <SimpleAccountCard key={a.id} account={a} basis={costBasisByAccount[a.id] || 0} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
          {(!grouped[key] || grouped[key].length === 0) && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบัญชีในหมวดนี้</p>}
        </div>
      ))}
    </div>
  );
}

function SimpleAccountCard({ account: a, basis, onUpdate, onRemove }) {
  const gain = a.value - basis;
  return (
    <Card>
      <div className="flex justify-between items-center gap-2"><input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} /><button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button></div>
      <div className="flex items-center mt-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} /></div>
      {basis > 0 && <p className="text-xs mt-1" style={{ color: gain >= 0 ? GOOD : BAD }}>ต้นทุนสะสม ฿{fmt(basis)} · {gain >= 0 ? '+' : ''}฿{fmt(gain)}</p>}
    </Card>
  );
}

function StockAccountCard({ account: a, onUpdate, onRemove, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onRefreshPrice, finnhubKey, categoryColor }) {
  const [expanded, setExpanded] = useState(true);
  const holdings = a.holdings || [];
  const totalValue = holdings.reduce((s, h) => s + holdingMarketValueTHB(h), 0);
  const totalCost = holdings.reduce((s, h) => s + holdingCostBasisTHB(h), 0);
  const totalGain = totalValue - totalCost;
  const displayValue = holdings.length > 0 ? totalValue : a.value;
  return (
    <Card>
      <div className="flex justify-between items-center gap-2"><input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none font-semibold" style={{ border: 'none' }} /><button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button></div>
      <p className="text-lg font-semibold mt-1">฿{fmt(displayValue)}</p>
      {holdings.length > 0 && totalCost > 0 && <p className="text-xs mb-2" style={{ color: totalGain >= 0 ? GOOD : BAD }}>ต้นทุนรวม ฿{fmt(totalCost)} · {totalGain >= 0 ? '+' : ''}฿{fmt(totalGain)} ({totalCost ? ((totalGain / totalCost) * 100).toFixed(1) : 0}%)</p>}
      {holdings.length === 0 && <div className="flex items-center mt-1 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: SLATE }} placeholder="มูลค่ารวม (ถ้ายังไม่แยกรายตัว)" /></div>}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs mt-1" style={{ color: categoryColor }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {holdings.length} หุ้นในบัญชีนี้</button>
      {expanded && (
        <div className="mt-3">
          {holdings.map((h) => <HoldingRow key={h.id} accountId={a.id} holding={h} onUpdate={onUpdateHolding} onRemove={onRemoveHolding} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onRefreshPrice={onRefreshPrice} canRefresh={h.currency === 'USD'} finnhubKey={finnhubKey} />)}
          <button onClick={() => onAddHolding(a.id)} className="flex items-center gap-1 text-xs mt-1" style={{ color: BRASS }}><PlusCircle size={13} /> เพิ่มหุ้นในบัญชีนี้</button>
        </div>
      )}
    </Card>
  );
}

function HoldingRow({ accountId, holding: h, onUpdate, onRemove, onAddDividend, onRemoveDividend, onRefreshPrice, canRefresh, finnhubKey }) {
  const [showDiv, setShowDiv] = useState(false);
  const [divAmount, setDivAmount] = useState(0);
  const [divDate, setDivDate] = useState(new Date().toISOString().slice(0, 10));
  const [refreshing, setRefreshing] = useState(false);
  const marketValue = holdingMarketValueTHB(h);
  const costBasis = holdingCostBasisTHB(h);
  const gain = marketValue - costBasis;
  const gainPct = costBasis ? (gain / costBasis) * 100 : 0;
  const totalDiv = (h.dividends || []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const yieldPct = costBasis ? (totalDiv / costBasis) * 100 : 0;
  const cagr = holdingCAGR(h);
  async function doRefresh() { setRefreshing(true); await onRefreshPrice(accountId, h.id, h.symbol); setRefreshing(false); }
  return (
    <div style={{ background: PAPER_DIM }} className="rounded-lg p-3 mb-2">
      <div className="flex gap-2 mb-2"><input value={h.symbol} onChange={(e) => onUpdate(accountId, h.id, { symbol: e.target.value.toUpperCase() })} placeholder="สัญลักษณ์" className="text-sm font-semibold flex-1 outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /><button onClick={() => onRemove(accountId, h.id)}><Trash2 size={14} color={BAD} /></button></div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={h.shares} onChange={(v) => onUpdate(accountId, h.id, { shares: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย/หุ้น ({h.currency})</label><NumInput value={h.avgCost} onChange={(v) => onUpdate(accountId, h.id, { avgCost: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
        {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ตอนซื้อเฉลี่ย</label><NumInput value={h.purchaseFx} onChange={(v) => onUpdate(accountId, h.id, { purchaseFx: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>}
        <div><label className="text-[10px]" style={{ color: SLATE }}>ราคาปัจจุบัน/หุ้น ({h.currency})</label><NumInput value={h.currentPrice} onChange={(v) => onUpdate(accountId, h.id, { currentPrice: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
        {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ปัจจุบัน</label><NumInput value={h.currentFx} onChange={(v) => onUpdate(accountId, h.id, { currentFx: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>}
        <div className="col-span-2"><label className="text-[10px]" style={{ color: SLATE }}>วันที่เริ่มถือ (สำหรับ CAGR)</label><input type="date" value={h.purchaseDate || ''} onChange={(e) => onUpdate(accountId, h.id, { purchaseDate: e.target.value })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
      </div>
      {canRefresh && <button onClick={doRefresh} disabled={!h.symbol} className="flex items-center gap-1 text-[11px] mb-2" style={{ color: finnhubKey ? BRASS : SLATE }}>{refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} {finnhubKey ? 'รีเฟรชราคาล่าสุด' : 'ตั้งค่า API key เพื่อรีเฟรชราคา'}</button>}
      {h.lastUpdated && <p className="text-[10px] mb-2" style={{ color: SLATE }}>อัพเดทล่าสุด: {h.lastUpdated}</p>}
      <div className="flex justify-between text-sm"><span>มูลค่า ฿{fmt(marketValue)}</span><span style={{ color: gain >= 0 ? GOOD : BAD }}>{gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%</span></div>
      <p className="text-[11px]" style={{ color: SLATE }}>ต้นทุน ฿{fmt(costBasis)} · ปันผลสะสม ฿{fmt(totalDiv)} (Yield {yieldPct.toFixed(1)}%){cagr !== null && ` · CAGR ${cagr.toFixed(1)}%/ปี`}</p>
      <button onClick={() => setShowDiv(!showDiv)} className="text-[11px] mt-2" style={{ color: BRASS }}>{showDiv ? 'ซ่อน' : 'ดู/บันทึกปันผล'}</button>
      {showDiv && (
        <div className="mt-2">
          <div className="flex gap-2 mb-2">
            <input type="date" value={divDate} onChange={(e) => setDivDate(e.target.value)} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
            <NumInput value={divAmount} onChange={setDivAmount} placeholder="จำนวนเงิน" className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
            <button onClick={() => { onAddDividend(accountId, h.id, { date: divDate, amount: divAmount }); setDivAmount(0); }} style={{ background: INK }} className="text-white text-xs rounded px-3">บันทึก</button>
          </div>
          {(h.dividends || []).map((d) => <div key={d.id} className="flex justify-between text-xs mb-1"><span>{d.date}</span><span className="flex items-center gap-2">฿{fmt(d.amount)} <button onClick={() => onRemoveDividend(accountId, h.id, d.id)}><Trash2 size={11} color={BAD} /></button></span></div>)}
        </div>
      )}
    </div>
  );
}

function SavingsTab({ accounts, contributions, onAdd, onRemove }) {
  const [amount, setAmount] = useState(10000);
  const [source, setSource] = useState('pharmacy');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [usdAmount, setUsdAmount] = useState(0);
  const destAccount = accounts.find((a) => a.id === accountId);
  const isDime = destAccount && destAccount.category === 'dime';
  function submit() { if (!accountId) return; onAdd({ date: new Date().toISOString().slice(0, 10), amount, source, accountId, usdAmount: isDime && usdAmount ? Number(usdAmount) : undefined }); setUsdAmount(0); }
  const thisMonthTotal = useMemo(() => { const ym = new Date().toISOString().slice(0, 7); return contributions.filter((c) => c.date.startsWith(ym)).reduce((s, c) => s + Number(c.amount || 0), 0); }, [contributions]);
  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เงินเข้าเดือนนี้รวม</p><p className="text-2xl mb-3">฿{fmt(thisMonthTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน (บาท)</label>
        <NumInput value={amount} onChange={setAmount} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>มาจากแหล่งไหน</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">{SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <label className="text-xs" style={{ color: SLATE }}>ลงทุนเข้าบัญชีไหน</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        {isDime && <><label className="text-xs" style={{ color: SLATE }}>จำนวน USD ที่ซื้อได้ (ถ้ามี)</label><NumInput value={usdAmount} onChange={setUsdAmount} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" /></>}
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกเงินเข้า</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>รายการล่าสุด</p>
      {contributions.slice(0, 30).map((c) => {
        const acc = accounts.find((a) => a.id === c.accountId); const src = SOURCES.find((s) => s.id === c.source);
        return <Card key={c.id}><div className="flex justify-between items-center"><div><p className="text-sm">{src?.label || c.source} → {acc?.name || 'ไม่ทราบบัญชี'}</p><p className="text-xs" style={{ color: SLATE }}>{c.date}{c.usdAmount ? ` · ${c.usdAmount} USD` : ''}</p></div><div className="flex items-center gap-3"><span className="text-sm">฿{fmt(c.amount)}</span><button onClick={() => onRemove(c.id)}><Trash2 size={14} color={BAD} /></button></div></div></Card>;
      })}
    </div>
  );
}

function IncomeTab({ income, onUpdate, onAdd, onRemove, monthlyIncome }) {
  return (
    <div className="px-5 pt-5">
      <Card><p className="text-xs mb-1" style={{ color: SLATE }}>รวมรายรับต่อเดือน</p><p className="text-2xl">฿{fmt(monthlyIncome)}</p></Card>
      <div className="flex justify-between items-center mb-2"><p className="text-sm font-semibold">แหล่งรายได้ประจำ</p><button onClick={onAdd} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่ม</button></div>
      {income.map((i) => (
        <Card key={i.id}>
          <div className="flex justify-between items-center gap-2"><input value={i.name} onChange={(e) => onUpdate(i.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} /><button onClick={() => onRemove(i.id)}><Trash2 size={16} color={BAD} /></button></div>
          <div className="flex items-center mt-2 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={i.amount} onChange={(v) => onUpdate(i.id, { amount: v })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} /><span className="text-xs" style={{ color: SLATE }}>/เดือน</span></div>
          <select value={i.tag || 'other'} onChange={(e) => onUpdate(i.id, { tag: e.target.value })} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-2 py-1 text-xs">{SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </Card>
      ))}
    </div>
  );
}

function ReportsTab({ contributions, accounts, costBasisByAccount, history }) {
  const [periodType, setPeriodType] = useState('month');
  const keyFn = periodType === 'month' ? monthKey : periodType === 'quarter' ? quarterKey : yearKey;
  const periods = useMemo(() => Array.from(new Set(contributions.map((c) => keyFn(c.date)))).sort().reverse(), [contributions, periodType]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  useEffect(() => { setSelectedPeriod(periods[0] || ''); }, [periodType, periods.length]);
  const periodContribs = useMemo(() => contributions.filter((c) => keyFn(c.date) === selectedPeriod), [contributions, selectedPeriod, periodType]);
  const periodTotal = periodContribs.reduce((s, c) => s + Number(c.amount || 0), 0);
  const bySource = useMemo(() => { const map = {}; periodContribs.forEach((c) => { map[c.source] = (map[c.source] || 0) + Number(c.amount || 0); }); return Object.entries(map).map(([id, value]) => ({ id, label: SOURCES.find((s) => s.id === id)?.label || id, value })).sort((a, b) => b.value - a.value); }, [periodContribs]);
  const byAccount = useMemo(() => { const map = {}; periodContribs.forEach((c) => { map[c.accountId] = (map[c.accountId] || 0) + Number(c.amount || 0); }); return Object.entries(map).map(([id, value]) => ({ id, label: accounts.find((a) => a.id === id)?.name || 'ไม่ทราบบัญชี', value })).sort((a, b) => b.value - a.value); }, [periodContribs, accounts]);
  const allDividendsAll = useMemo(() => { const list = []; accounts.forEach((a) => (a.holdings || []).forEach((h) => (h.dividends || []).forEach((d) => list.push({ ...d, symbol: h.symbol })))); return list; }, [accounts]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const calendarData = useMemo(() => monthNames.map((label, idx) => { const mk = `${calYear}-${String(idx + 1).padStart(2, '0')}`; const divs = allDividendsAll.filter((d) => monthKey(d.date) === mk); return { label, total: divs.reduce((s, d) => s + Number(d.amount || 0), 0), divs }; }), [allDividendsAll, calYear]);
  const [range, setRange] = useState(6);
  const chartData = useMemo(() => [...history].sort((a, b) => a.month.localeCompare(b.month)).slice(-range).map((h) => ({ month: h.month.slice(2), netWorth: h.netWorth })), [history, range]);

  return (
    <div className="px-5 pt-5">
      <Card>
        <div className="flex justify-between items-center mb-3"><p className="text-xs" style={{ color: SLATE }}>แนวโน้มสินทรัพย์สุทธิ</p><div className="flex gap-1">{[3, 6, 12, 999].map((r) => <button key={r} onClick={() => setRange(r)} style={{ background: range === r ? INK : PAPER_DIM, color: range === r ? 'white' : INK }} className="rounded-full px-2 py-1 text-[10px]">{r === 999 ? 'ทั้งหมด' : `${r}ด.`}</button>)}</div></div>
        {chartData.length >= 2 ? (
          <div style={{ width: '100%', height: 160 }}><ResponsiveContainer><LineChart data={chartData}><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} /><Tooltip formatter={(v) => `฿${fmt(v)}`} /><Line type="monotone" dataKey="netWorth" stroke={BRASS} strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
        ) : <p className="text-xs" style={{ color: SLATE }}>ระบบจะบันทึกสินทรัพย์สุทธิอัตโนมัติทุกเดือน</p>}
      </Card>
      <Card>
        <div className="flex gap-2 mb-3">{[{ id: 'month', label: 'รายเดือน' }, { id: 'quarter', label: 'รายไตรมาส' }, { id: 'year', label: 'รายปี' }].map((p) => <button key={p.id} onClick={() => setPeriodType(p.id)} style={{ background: periodType === p.id ? INK : PAPER_DIM, color: periodType === p.id ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">{p.label}</button>)}</div>
        {periods.length > 0 ? <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full">{periods.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลเงินเข้า</p>}
      </Card>
      {selectedPeriod && (
        <>
          <Card><p className="text-xs mb-1" style={{ color: SLATE }}>เก็บเงินไปทั้งหมดในช่วง {selectedPeriod}</p><p className="text-2xl">฿{fmt(periodTotal)}</p></Card>
          <Card><p className="text-xs mb-3" style={{ color: SLATE }}>แยกตามแหล่งที่มา</p>{bySource.map((s) => <div key={s.id} className="flex justify-between text-sm mb-2"><span>{s.label}</span><span>฿{fmt(s.value)}</span></div>)}</Card>
          <Card><p className="text-xs mb-3" style={{ color: SLATE }}>แยกตามสินทรัพย์ปลายทาง</p>{byAccount.map((a) => <div key={a.id} className="flex justify-between text-sm mb-2"><span>{a.label}</span><span>฿{fmt(a.value)}</span></div>)}</Card>
        </>
      )}
      <Card>
        <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-1"><Calendar size={14} color={SLATE} /><p className="text-xs" style={{ color: SLATE }}>ปฏิทินปันผลรายหุ้น</p></div><div className="flex items-center gap-2"><button onClick={() => setCalYear(calYear - 1)} className="text-xs" style={{ color: BRASS }}>‹</button><span className="text-sm">{calYear}</span><button onClick={() => setCalYear(calYear + 1)} className="text-xs" style={{ color: BRASS }}>›</button></div></div>
        {calendarData.map((m) => <div key={m.label} className="mb-2"><div className="flex justify-between text-sm"><span>{m.label}</span><span style={{ color: m.total > 0 ? GOOD : SLATE }}>{m.total > 0 ? `฿${fmt(m.total)}` : '—'}</span></div>{m.divs.length > 0 && <p className="text-[10px]" style={{ color: SLATE }}>{m.divs.map((d) => d.symbol).join(', ')}</p>}</div>)}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ต้นทุนสะสมเทียบมูลค่าปัจจุบัน (บัญชีที่ไม่แยกรายหุ้น)</p>
        {accounts.filter((a) => costBasisByAccount[a.id] && (!a.holdings || a.holdings.length === 0)).map((a) => {
          const basis = costBasisByAccount[a.id] || 0; const gain = a.value - basis; const pct = basis ? (gain / basis) * 100 : 0;
          return <div key={a.id} className="mb-3"><div className="flex justify-between text-sm"><span>{a.name}</span><span style={{ color: gain >= 0 ? GOOD : BAD }}>{gain >= 0 ? '+' : ''}{pct.toFixed(1)}%</span></div><p className="text-xs" style={{ color: SLATE }}>ต้นทุน ฿{fmt(basis)} · ปัจจุบัน ฿{fmt(a.value)}</p></div>;
        })}
      </Card>
    </div>
  );
}
