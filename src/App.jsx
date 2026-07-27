import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  PlusCircle, Trash2, TrendingUp, Wallet, PiggyBank, Flame, Landmark,
  BarChart3, Camera, Sparkles, Share2, X, Loader2, RefreshCw, ChevronDown, ChevronUp,
  Settings, AlertTriangle, CheckCircle2, Info, Calendar, LogOut, Receipt, Mic,
  Dog, Scale, Syringe, Shield, Bug, Stethoscope, Eye, EyeOff, Search, Upload,
  ClipboardList, Bell,
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
const HOLDING_CATEGORIES = ['set_stock', 'dime', 'mutual_fund'];
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
const fmt2 = (n) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(n || 0);
const uid = () => Math.random().toString(36).slice(2, 10);
const monthKey = (d) => d.slice(0, 7);
const quarterKey = (d) => `${d.slice(0, 4)}-Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1}`;
const yearKey = (d) => d.slice(0, 4);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const prevMonthKey = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };

const DOG_NAMES = ['เป๋าตุง', 'ถุงทอง', 'ตุ้มแต้ม', 'ขวานฟ้า', 'คัตโตะ', 'โยกเยก', 'หนึ่งหนึ่ง', 'หญิงเล็ก'];
const PET_EXPENSE_CATEGORIES = ['ค่าตรวจ', 'ค่ายา', 'อาหาร', 'อาหารเสริม', 'ของเล่น', 'อาบน้ำ', 'ตัดขน', 'ประกัน', 'เดินทาง', 'ฉุกเฉิน', 'อื่นๆ'];
const BLOOD_TEST_TYPES = ['CBC', 'ค่าไต', 'ค่าตับ', 'ไขมันในเลือด', 'น้ำตาล', 'SDMA', 'Electrolyte', 'Cortisol', 'ACTH'];
const ORGAN_TYPES = ['ไต', 'ตับ', 'ถุงน้ำดี', 'ม้าม', 'ต่อมหมวกไต', 'หัวใจ', 'ตา'];
const IMAGING_TYPES = ['Ultrasound', 'X-ray', 'CT', 'MRI'];
const makeDog = (name) => ({
  id: uid(), name, nickname: '', birthdate: '', sex: '', color: '', breed: '', microchip: '', breeder: '', personality: '', notes: '',
  bcs: 0, chronicDiseases: '', drugAllergies: '',
  weights: [], medications: [], fleaTick: { productName: '', tabletMg: 0, tabletsPurchased: 0, lastGivenDate: '' }, fleaTickHistory: [],
  insurance: { company: '', policyNumber: '', startDate: '', endDate: '', premium: 0, opdLimit: 0, ipdLimit: 0, remainingBalance: 0, claims: [] },
  appointments: [], bloodTests: [], organExams: [], imaging: [], expenses: [],
});
const DEFAULT_DOGS = DOG_NAMES.map((n) => makeDog(n));

const EMPTY_STATE = {
  accounts: [], income: [], contributions: [], history: [], expenses: [],
  expenseCategories: ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'สุขภาพ', 'อื่นๆ'],
  targetDate: '2029-01-01', goalNetWorth: 0, finnhubKey: '', dogs: [], googleClientId: '', googleRefreshToken: '',
  hospitalList: ['โรงพยาบาลสัตว์เล็กเกษตร', 'โรงพยาบาลสัตว์เล็กจุฬาฯ', 'Central West Animal Hospital', 'โรงพยาบาลสัตว์ทองหล่อ', 'โรงพยาบาลสัตว์อารักษ์', 'โรงพยาบาลสัตว์นครสวรรค์ (Big C)'],
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

function ensureGsiLoaded() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) { resolve(); return; }
    const existing = document.getElementById('gsi-client-script');
    if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => reject(new Error('โหลดสคริปต์ Google ไม่สำเร็จ'))); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true; script.id = 'gsi-client-script';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('โหลดสคริปต์ Google ไม่สำเร็จ'));
    document.head.appendChild(script);
  });
}

async function getGoogleAuthCode(clientId) {
  if (!clientId) throw new Error('ยังไม่ได้ใส่ Google Client ID ในหน้าตั้งค่า');
  await ensureGsiLoaded();
  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        ux_mode: 'popup',
        callback: (resp) => { if (resp && resp.code) resolve(resp.code); else reject(new Error('ไม่ได้รับสิทธิ์เข้าถึง Google Calendar')); },
      });
      client.requestCode();
    } catch (e) { reject(e); }
  });
}

async function exchangeGoogleCode(clientId, code) {
  const res = await fetch('/api/google-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'exchange', clientId, code }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data; // { access_token, refresh_token, expires_in }
}

async function refreshGoogleAccessToken(clientId, refreshToken) {
  const res = await fetch('/api/google-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refresh', clientId, refreshToken }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data; // { access_token, expires_in }
}

async function createCalendarEvent(accessToken, evt) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: evt.summary,
      description: evt.description || '',
      start: { dateTime: evt.startDateTime, timeZone: 'Asia/Bangkok' },
      end: { dateTime: evt.endDateTime, timeZone: 'Asia/Bangkok' },
      reminders: { useDefault: false, overrides: evt.reminders || [{ method: 'popup', minutes: 7 * 24 * 60 }, { method: 'popup', minutes: 3 * 24 * 60 }, { method: 'popup', minutes: 24 * 60 }, { method: 'popup', minutes: 120 }] },
    }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error((err.error && err.error.message) || `HTTP ${res.status}`); }
  return res.json();
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
  const [localText, setLocalText] = useState(null); // null = not actively editing, derive from value
  const inputRef = useRef(null);
  const parsedLocal = localText === null ? null : (localText === '' || localText === '.' ? 0 : Number(localText));
  const displayValue = localText !== null && parsedLocal === (value || 0)
    ? localText
    : (value === 0 || value === undefined || value === null ? '' : String(value));

  function applyRaw(raw) {
    const firstDot = raw.indexOf('.');
    if (firstDot !== -1) raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
    setLocalText(raw);
    const numeric = raw === '' || raw === '.' ? 0 : Number(raw);
    onChange(isNaN(numeric) ? 0 : numeric);
  }

  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        placeholder={placeholder || '0'}
        onFocus={(e) => e.target.select()}
        onChange={(e) => applyRaw(e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''))}
        onBlur={() => setLocalText(null)}
        className={className}
        style={{ ...style, width: '100%', boxSizing: 'border-box', paddingRight: displayValue.includes('.') ? style?.paddingRight : 24 }}
      />
      {!displayValue.includes('.') && (
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { applyRaw((displayValue || '0') + '.'); inputRef.current && inputRef.current.focus(); }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: '#B8874B', background: 'transparent', border: 'none', padding: '0 2px', lineHeight: 1 }}
        >.</button>
      )}
    </span>
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
        }function Tracker({ user }) {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('quick') === 'expense') return 'expenses';
    return 'dashboard';
  });
  const [shareMode, setShareMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [calendarError, setCalendarError] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function trySilentReconnect() {
      if (!state || !state.googleRefreshToken || !state.googleClientId || googleToken) return;
      setReconnecting(true);
      try {
        const data = await refreshGoogleAccessToken(state.googleClientId, state.googleRefreshToken);
        if (!cancelled) setGoogleToken(data.access_token);
      } catch (e) { if (!cancelled) setCalendarError('เชื่อมต่ออัตโนมัติไม่สำเร็จ กรุณากดเชื่อมต่อใหม่'); }
      finally { if (!cancelled) setReconnecting(false); }
    }
    trySilentReconnect();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state && state.googleRefreshToken, state && state.googleClientId]);

  async function connectCalendar() {
    setCalendarError('');
    try {
      const code = await getGoogleAuthCode(state && state.googleClientId);
      const data = await exchangeGoogleCode(state.googleClientId, code);
      setGoogleToken(data.access_token);
      if (data.refresh_token) persist({ ...state, googleRefreshToken: data.refresh_token });
    } catch (e) { setCalendarError(e.message); }
  }
  function disconnectCalendar() {
    setGoogleToken(null);
    persist({ ...state, googleRefreshToken: '' });
  }
  async function addAppointmentToCalendar(dogName, appt) {
    if (!googleToken) { setCalendarError('ยังไม่ได้เชื่อมต่อ Google Calendar'); return { ok: false }; }
    try {
      const startDateTime = `${appt.date}T${appt.time || '09:00'}:00`;
      const start = new Date(startDateTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const pad = (n) => String(n).padStart(2, '0');
      const endDateTime = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
      const days = (appt.reminderDays && appt.reminderDays.length > 0) ? appt.reminderDays : [7, 3, 1];
      const reminders = days.map((d) => ({ method: 'popup', minutes: d * 24 * 60 })).concat([{ method: 'popup', minutes: 120 }]);
      await createCalendarEvent(googleToken, {
        summary: `นัดสัตวแพทย์: ${dogName}${appt.purpose ? ' - ' + appt.purpose : ''}`,
        description: `โรงพยาบาล: ${appt.hospital || '-'}\nหมอ: ${appt.doctor || '-'}`,
        startDateTime, endDateTime, reminders,
      });
      return { ok: true };
    } catch (e) { return { ok: false, message: e.message }; }
  }

  const docRef = doc(db, 'users', user.uid, 'data', 'portfolio');

  useEffect(() => {
    (async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = { ...EMPTY_STATE, ...snap.data() };
        const cutoff = Date.now() - 90 * 24 * 3600 * 1000;
        const prunedExpenses = (data.expenses || []).filter((e) => new Date(e.date).getTime() >= cutoff);
        if (prunedExpenses.length !== (data.expenses || []).length) {
          const next = { ...data, expenses: prunedExpenses };
          setState(next);
          setDoc(docRef, next).catch((e) => console.error('prune save failed', e));
        } else {
          setState(data);
        }
      } else { await setDoc(docRef, EMPTY_STATE); setState(EMPTY_STATE); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  function persist(next) { setState(next); setDoc(docRef, next).catch((e) => console.error('save failed', e)); }

  const accounts = state?.accounts || [];
  const income = state?.income || [];
  const contributions = state?.contributions || [];
  const history = state?.history || [];
  const expenses = state?.expenses || [];
  const expenseCategories = state?.expenseCategories || ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'สุขภาพ', 'อื่นๆ'];
  const dogs = (state?.dogs && state.dogs.length > 0) ? state.dogs : DEFAULT_DOGS;
  const hospitalList = state?.hospitalList || ['โรงพยาบาลสัตว์เล็กเกษตร', 'โรงพยาบาลสัตว์เล็กจุฬาฯ', 'Central West Animal Hospital', 'โรงพยาบาลสัตว์ทองหล่อ', 'โรงพยาบาลสัตว์อารักษ์', 'โรงพยาบาลสัตว์นครสวรรค์ (Big C)'];

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
  const updateContribution = (id, patch) => persist({ ...state, contributions: contributions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const changeTargetDate = (d) => persist({ ...state, targetDate: d });
  const changeGoal = (v) => persist({ ...state, goalNetWorth: v });
  const changeFinnhubKey = (v) => persist({ ...state, finnhubKey: v });
  const changeGoogleClientId = (v) => persist({ ...state, googleClientId: v });

  function addHolding(accountId) {
    const acc = accounts.find((a) => a.id === accountId);
    const currency = acc.category === 'dime' ? 'USD' : 'THB';
    const h = { id: uid(), symbol: '', name: '', shares: 0, avgCost: 0, currency, purchaseFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, currentPrice: 0, currentFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, lastUpdated: '', purchaseDate: '', dividends: [], sells: [], buys: [] };
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
    const nextHoldings = acc.holdings.map((x) => (x.id === holdingId ? { ...x, dividends: [{ id: uid(), date: entry.date, amount: entry.amount, destination: entry.destination || '' }, ...(x.dividends || [])] } : x));
    let nextContributions = contributions;
    if (entry.reinvestAccountId) {
      const tag = h.currency === 'USD' ? 'us_div' : 'thai_div';
      nextContributions = [{ id: uid(), date: entry.date, amount: entry.amount, source: tag, accountId: entry.reinvestAccountId }, ...contributions];
    }
    persist({ ...state, accounts: accounts.map((a) => (a.id === accountId ? { ...a, holdings: nextHoldings } : a)), contributions: nextContributions });
  }
  function removeDividend(accountId, holdingId, divId) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { dividends: (h.dividends || []).filter((d) => d.id !== divId) });
  }
  function updateDividend(accountId, holdingId, divId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { dividends: (h.dividends || []).map((d) => (d.id === divId ? { ...d, ...patch } : d)) });
  }
  function sellHolding(accountId, holdingId, entry) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    const fx = h.currency === 'USD' ? Number(h.purchaseFx || 0) : 1;
    const costBasisSold = Number(entry.shares || 0) * Number(h.avgCost || 0) * fx;
    const gain = Number(entry.amount || 0) - costBasisSold;
    const sellRecord = { id: uid(), date: entry.date, shares: entry.shares, price: entry.price, amount: entry.amount, gain, currency: h.currency };
    const newShares = Math.max(0, Number(h.shares || 0) - Number(entry.shares || 0));
    updateHolding(accountId, holdingId, { shares: newShares, sells: [sellRecord, ...(h.sells || [])] });
  }
  function removeSell(accountId, holdingId, sellId) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { sells: (h.sells || []).filter((s) => s.id !== sellId) });
  }
  function updateSell(accountId, holdingId, sellId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { sells: (h.sells || []).map((s) => (s.id === sellId ? { ...s, ...patch } : s)) });
  }
  function updateBuy(accountId, holdingId, buyId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { buys: (h.buys || []).map((b) => (b.id === buyId ? { ...b, ...patch } : b)) });
  }
  const addExpense = (entry) => persist({ ...state, expenses: [{ id: uid(), ...entry }, ...expenses] });
  const removeExpense = (id) => persist({ ...state, expenses: expenses.filter((e) => e.id !== id) });
  const updateExpense = (id, patch) => persist({ ...state, expenses: expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addExpenseCategory = (name) => { if (name && !expenseCategories.includes(name)) persist({ ...state, expenseCategories: [...expenseCategories, name] }); };

  function updateDog(dogId, patch) { persist({ ...state, dogs: dogs.map((d) => (d.id === dogId ? { ...d, ...patch } : d)) }); }
  function addHospital(name) { if (name && !hospitalList.includes(name)) persist({ ...state, hospitalList: [...hospitalList, name] }); }
  function addWeight(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { weights: [{ id: uid(), ...entry }, ...(d.weights || [])] });
  }
  function removeWeight(dogId, wid) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { weights: (d.weights || []).filter((w) => w.id !== wid) });
  }
  function updateWeight(dogId, wid, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { weights: (d.weights || []).map((w) => (w.id === wid ? { ...w, ...patch } : w)) });
  }
  function addMedication(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { medications: [{ id: uid(), ...entry }, ...(d.medications || [])] });
  }
  function updateMedication(dogId, medId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { medications: (d.medications || []).map((m) => (m.id === medId ? { ...m, ...patch } : m)) });
  }
  function logFleaTick(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { fleaTickHistory: [{ id: uid(), ...entry }, ...(d.fleaTickHistory || [])], fleaTick: { ...d.fleaTick, lastGivenDate: entry.date } });
  }
  function updateFleaTickInfo(dogId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { fleaTick: { ...d.fleaTick, ...patch } });
  }
  function updateInsurance(dogId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { insurance: { ...d.insurance, ...patch } });
  }
  function addInsuranceClaim(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { insurance: { ...d.insurance, claims: [{ id: uid(), ...entry }, ...(d.insurance.claims || [])] } });
  }
  function addAppointment(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { appointments: [{ id: uid(), ...entry }, ...(d.appointments || [])] });
  }
  function removeAppointment(dogId, apptId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { appointments: (d.appointments || []).filter((a) => a.id !== apptId) });
  }
  function updateAppointment(dogId, apptId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { appointments: (d.appointments || []).map((a) => (a.id === apptId ? { ...a, ...patch } : a)) });
  }
  function addBloodTest(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { bloodTests: [{ id: uid(), ...entry }, ...(d.bloodTests || [])] });
  }
  function updateBloodTest(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { bloodTests: (d.bloodTests || []).map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  }
  function addOrganExam(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { organExams: [{ id: uid(), ...entry }, ...(d.organExams || [])] });
  }
  function updateOrganExam(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { organExams: (d.organExams || []).map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  }
  function addImaging(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { imaging: [{ id: uid(), ...entry }, ...(d.imaging || [])] });
  }
  function updateImaging(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { imaging: (d.imaging || []).map((im) => (im.id === id ? { ...im, ...patch } : im)) });
  }
  function addDogExpense(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { expenses: [{ id: uid(), ...entry }, ...(d.expenses || [])] });
  }
  function removeDogExpense(dogId, expId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { expenses: (d.expenses || []).filter((e) => e.id !== expId) });
  }
  function updateDogExpense(dogId, expId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { expenses: (d.expenses || []).map((e) => (e.id === expId ? { ...e, ...patch } : e)) });
  }
  function updateInsuranceClaim(dogId, claimId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { insurance: { ...d.insurance, claims: (d.insurance.claims || []).map((c) => (c.id === claimId ? { ...c, ...patch } : c)) } });
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
    if (!state.finnhubKey) { setShowSettings(true); return { ok: false, message: 'ยังไม่ได้ตั้งค่า API key' }; }
    if (!symbol) return { ok: false, message: 'ยังไม่ได้ใส่สัญลักษณ์หุ้น' };
    try {
      const res = await fetch(`https://finnhub.io/api/v2/quote?symbol=${encodeURIComponent(symbol)}&token=${state.finnhubKey}`);
      if (!res.ok) return { ok: false, message: `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${res.status})` };
      const data = await res.json();
      if (data && data.error) return { ok: false, message: 'Finnhub: ' + data.error };
      if (!data || (data.c === undefined || data.c === null)) return { ok: false, message: 'ไม่พบข้อมูลราคา ลองตรวจสอบสัญลักษณ์อีกครั้ง' };
      if (data.c === 0) return { ok: false, message: `Finnhub ไม่รู้จักสัญลักษณ์ "${symbol}" (ราคาที่ได้เป็น 0)` };
      updateHolding(accountId, holdingId, { currentPrice: data.c, lastUpdated: new Date().toISOString().slice(0, 10) });
      return { ok: true, price: data.c };
    } catch (e) { return { ok: false, message: 'เชื่อมต่อไม่สำเร็จ: ' + e.message }; }
  }

  if (shareMode) return <ShareView totalNetWorth={totalNetWorth} categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} daysLeft={daysLeft} onClose={() => setShareMode(false)} />;

  return (
    <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: INK }} className="pb-24">
      <div style={{ background: INK }} className="px-5 pt-8 pb-6 text-white relative overflow-hidden">
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', border: `1px solid ${BRASS}55`, pointerEvents: 'none' }} />
        <div className="flex justify-between items-start">
          <div><p className="text-xs tracking-widest" style={{ color: BRASS }}>สมุดบัญชีการลงทุน</p><h1 className="text-3xl mt-1 font-semibold">สินทรัพย์สุทธิ</h1></div>
          <div className="flex gap-2">
            <button onClick={() => setShowAmounts(!showAmounts)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}>{showAmounts ? <Eye size={13} /> : <EyeOff size={13} />}</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><Settings size={13} /></button>
            <button onClick={() => setShareMode(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><Share2 size={13} /></button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}><LogOut size={13} /></button>
          </div>
        </div>
        <p className="text-4xl mt-3 font-semibold">{showAmounts ? `฿${fmt(totalNetWorth)}` : '฿xxx,xxx'}</p>
        {prevSnapshot && showAmounts && <p className="text-xs mt-1" style={{ color: totalNetWorth >= prevSnapshot.netWorth ? '#9CD3B0' : '#E3A79A' }}>{totalNetWorth >= prevSnapshot.netWorth ? '+' : ''}฿{fmt(totalNetWorth - prevSnapshot.netWorth)} จากเดือนก่อน</p>}
        <div className="flex items-center gap-2 mt-3"><Flame size={14} color={BRASS} /><p className="text-xs" style={{ color: '#D8CBB0' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p></div>
      </div>

      {showSettings && (
        <SettingsModal finnhubKey={state.finnhubKey} onChange={changeFinnhubKey} onClose={() => setShowSettings(false)}
          googleClientId={state.googleClientId} onChangeGoogleClientId={changeGoogleClientId}
          googleToken={googleToken} onConnectCalendar={connectCalendar} onDisconnectCalendar={disconnectCalendar}
          calendarError={calendarError} reconnecting={reconnecting} />
      )}

      {tab === 'dashboard' && (
        <Dashboard categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} passiveIncome={passiveIncome} activeIncome={activeIncome}
          investedThisMonth={investedThisMonth} savingsRate={savingsRate} targetDate={state.targetDate} onChangeTarget={changeTargetDate}
          goalNetWorth={state.goalNetWorth} onChangeGoal={changeGoal} requiredDaily={requiredDaily} avgFx={avgFxFromContributions}
          totalNetWorth={totalNetWorth} contributions={contributions} daysLeft={daysLeft} onRefreshFx={refreshFxRate} insights={insights} />
      )}
      {tab === 'accounts' && (
        <AccountsTab accounts={accounts} onUpdate={updateAccount} onAdd={addAccount} onRemove={removeAccount} costBasisByAccount={costBasisByAccount}
          onAddHolding={addHolding} onUpdateHolding={updateHolding} onRemoveHolding={removeHolding} onAddDividend={addDividend}
          onRemoveDividend={removeDividend} onUpdateDividend={updateDividend} onRefreshPrice={refreshHoldingPrice} finnhubKey={state.finnhubKey}
          onSellHolding={sellHolding} onRemoveSell={removeSell} onUpdateSell={updateSell} onUpdateBuy={updateBuy} />
      )}
      {tab === 'savings' && <SavingsTab accounts={accounts} contributions={contributions} onAdd={addContribution} onRemove={removeContribution} onUpdate={updateContribution} />}
      {tab === 'income' && <IncomeTab income={income} onUpdate={updateIncome} onAdd={addIncome} onRemove={removeIncome} monthlyIncome={monthlyIncome} />}
      {tab === 'reports' && <ReportsTab contributions={contributions} accounts={accounts} costBasisByAccount={costBasisByAccount} history={history} />}
      {tab === 'expenses' && <ExpensesTab expenses={expenses} categories={expenseCategories} onAdd={addExpense} onRemove={removeExpense} onUpdate={updateExpense} onAddCategory={addExpenseCategory} />}
      {tab === 'pets' && (
        <PetsTab dogs={dogs} onUpdateDog={updateDog} onAddWeight={addWeight} onRemoveWeight={removeWeight} onUpdateWeight={updateWeight}
          onAddMedication={addMedication} onUpdateMedication={updateMedication} onLogFleaTick={logFleaTick} onUpdateFleaTickInfo={updateFleaTickInfo}
          onUpdateInsurance={updateInsurance} onAddInsuranceClaim={addInsuranceClaim} onUpdateInsuranceClaim={updateInsuranceClaim} onAddAppointment={addAppointment} onRemoveAppointment={removeAppointment} onUpdateAppointment={updateAppointment}
          onAddBloodTest={addBloodTest} onUpdateBloodTest={updateBloodTest} onAddOrganExam={addOrganExam} onUpdateOrganExam={updateOrganExam} onAddImaging={addImaging} onUpdateImaging={updateImaging} onAddDogExpense={addDogExpense} onRemoveDogExpense={removeDogExpense} onUpdateDogExpense={updateDogExpense}
          googleConnected={!!googleToken} onAddToCalendar={addAppointmentToCalendar} hospitalList={hospitalList} onAddHospital={addHospital} />
      )}

      <div style={{ background: INK, borderTop: `1px solid ${BRASS}33` }} className="fixed bottom-0 left-0 right-0 flex justify-around py-3 text-white">
        {[{ id: 'dashboard', label: 'ภาพรวม', icon: Wallet }, { id: 'accounts', label: 'บัญชี', icon: Landmark }, { id: 'savings', label: 'เงินเข้า', icon: PiggyBank }, { id: 'income', label: 'รายรับ', icon: TrendingUp }, { id: 'expenses', label: 'รายจ่าย', icon: Receipt }, { id: 'pets', label: 'ลูกๆ', icon: Dog }, { id: 'reports', label: 'รายงาน', icon: BarChart3 }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-1">
            <t.icon size={17} color={tab === t.id ? BRASS : '#8A93A6'} /><span className="text-[8px]" style={{ color: tab === t.id ? BRASS : '#8A93A6' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ children }) { return <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-xl p-4 mb-4">{children}</div>; }

// Popup แก้ไขรายการทั่วไป (ฟีเจอร์ O) — ใช้ร่วมกันทุก Tab ที่มีปุ่มลบ ยกเว้นตัวหุ้น/บัญชีทั้งก้อน
// fields: [{ key, label, type: 'text'|'number'|'date'|'time'|'select'|'textarea', options }]
function EditModal({ title, fields, initialValues, onSave, onClose }) {
  const [values, setValues] = useState(initialValues);
  function setField(key, v) { setValues({ ...values, [key]: v }); }
  return (
    <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
      <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">{title || 'แก้ไขรายการ'}</p><button onClick={onClose}><X size={20} color={INK} /></button></div>
        {fields.map((f) => (
          <div key={f.key} className="mb-3">
            <label className="text-xs" style={{ color: SLATE }}>{f.label}</label>
            {f.type === 'number' ? (
              <NumInput value={values[f.key]} onChange={(v) => setField(f.key, v)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            ) : f.type === 'select' ? (
              <select value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1">
                {(f.options || []).map((o) => <option key={o.value !== undefined ? o.value : o} value={o.value !== undefined ? o.value : o}>{o.label || o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} rows={3} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            ) : (
              <input type={f.type || 'text'} value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            )}
          </div>
        ))}
        <button onClick={() => onSave(values)} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm">บันทึกการแก้ไข</button>
      </div>
    </div>
  );
}

function EditButton({ onClick }) {
  return <button onClick={onClick} className="text-[11px] underline mr-2" style={{ color: BRASS }}>แก้ไข</button>;
}

function SettingsModal({ finnhubKey, onChange, onClose, googleClientId, onChangeGoogleClientId, googleToken, onConnectCalendar, onDisconnectCalendar, calendarError, reconnecting }) {
  return (
    <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
      <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">ตั้งค่า</p><button onClick={onClose}><X size={20} color={INK} /></button></div>
        <p className="text-xs mb-2" style={{ color: SLATE }}>Finnhub API key (ฟรี) — ใช้สำหรับปุ่มรีเฟรชราคาหุ้นสหรัฐฯ สมัครที่ finnhub.io/register</p>
        <input type="text" value={finnhubKey || ''} onChange={(e) => onChange(e.target.value)} placeholder="วาง API key ที่นี่" style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mb-2" />
        <p className="text-[11px] mb-4" style={{ color: SLATE }}>หุ้นไทย (SET) ยังไม่มี API ฟรีที่ดึงราคาได้ตรงจากเบราว์เซอร์ ต้องอัพเดทราคาด้วยตนเองไปก่อนครับ</p>

        <div style={{ borderTop: '1px solid #E7E0CE' }} className="pt-4">
          <p className="text-xs mb-2" style={{ color: SLATE }}>Google Calendar — สำหรับเพิ่มนัดหมายลงปฏิทินโดยตรง ต้องสร้าง OAuth Client ID จาก Google Cloud Console ก่อน</p>
          <input type="text" value={googleClientId || ''} onChange={(e) => onChangeGoogleClientId(e.target.value)} placeholder="วาง Google Client ID ที่นี่ (ลงท้าย .apps.googleusercontent.com)" style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mb-2" />
          {reconnecting && <p className="text-[11px] mb-2" style={{ color: SLATE }}>กำลังเชื่อมต่ออัตโนมัติ...</p>}
          <button onClick={onConnectCalendar} style={{ background: googleToken ? GOOD : INK }} className="w-full text-white rounded-lg py-2 text-sm mb-2">
            {googleToken ? '✓ เชื่อมต่อแล้ว (จะเชื่อมอัตโนมัติทุกครั้งที่เปิดแอป)' : 'เชื่อมต่อ Google Calendar'}
          </button>
          {googleToken && <button onClick={onDisconnectCalendar} className="w-full text-xs rounded-lg py-2 mb-2" style={{ border: '1px solid #E7E0CE', color: BAD }}>ยกเลิกการเชื่อมต่อ</button>}
          {calendarError && <p className="text-[11px]" style={{ color: BAD }}>{calendarError}</p>}
          <p className="text-[11px]" style={{ color: SLATE }}>เชื่อมต่อครั้งเดียว ระบบจะจำไว้และเชื่อมต่อให้อัตโนมัติทุกครั้งที่เปิดแอปในอนาคต</p>
        </div>
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

function safeParseJson(text) {
  let clean = text.replace(/```json|```/g, '').trim();
  const firstObj = clean.indexOf('{');
  const firstArr = clean.indexOf('[');
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) throw new Error('ไม่พบข้อมูล JSON ในคำตอบ');
  const openChar = clean[start];
  const closeChar = openChar === '{' ? '}' : ']';
  const end = clean.lastIndexOf(closeChar);
  if (end === -1 || end < start) throw new Error('รูปแบบข้อมูลไม่สมบูรณ์');
  clean = clean.slice(start, end + 1);
  return JSON.parse(clean);
}

async function scanSingleValue(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอแอปการลงทุนของสินทรัพย์ชิ้นเดียว อ่านมูลค่ารวม (ยอดใหญ่ที่สุดที่สื่อถึงมูลค่าพอร์ต/สินทรัพย์นี้) และสกุลเงินที่แสดง แล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"value": ตัวเลขไม่มีคอมมา, "currency": "THB หรือ USD"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  const parsed = safeParseJson(text);
  return { value: Number(parsed.value) || 0, currency: parsed.currency === 'USD' ? 'USD' : 'THB' };
}

async function scanBuyTransaction(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพยืนยันรายการซื้อหุ้นหรือกองทุนจากแอปการลงทุน (เช่น สลิปคำสั่งซื้อ, DCA, ประวัติรายการ, หรือตารางคำสั่งซื้อขาย) ภาพอาจมีหลายรายการหรือหลายสัญลักษณ์ปนกัน — ให้เลือกเฉพาะรายการฝั่งซื้อ (Buy/B) ที่มีสถานะสำเร็จแล้วเท่านั้น (เช่น Match, Filled, Completed, สำเร็จ) ห้ามนับรายการที่สถานะยังเป็น Open/Pending/รอดำเนินการ ถ้ามีหลายรายการที่ผ่านเงื่อนไข ให้เลือกรายการที่ดูเด่นหรือล่าสุดที่สุด อ่านข้อมูลแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"symbol": "สัญลักษณ์ย่อของรายการที่เลือก หรือ null ถ้าไม่เห็น", "amount": จำนวนเงินที่จ่ายจริงเป็นตัวเลขไม่มีคอมมา, "shares": จำนวนหน่วยหรือหุ้นที่ได้รับเป็นตัวเลข, "price": ราคาต่อหน่วยที่ซื้อได้จริงเป็นตัวเลข, "date": วันที่ทำรายการรูปแบบ YYYY-MM-DD}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanSellTransaction(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพยืนยันรายการขายหุ้นหรือกองทุนจากแอปการลงทุน ภาพอาจมีหลายรายการหรือหลายสัญลักษณ์ปนกัน — ให้เลือกเฉพาะรายการฝั่งขาย (Sell/S) ที่มีสถานะสำเร็จแล้วเท่านั้น (เช่น Match, Filled, Completed, สำเร็จ) ห้ามนับรายการที่สถานะยังเป็น Open/Pending/รอดำเนินการ ถ้ามีหลายรายการที่ผ่านเงื่อนไข ให้เลือกรายการที่ดูเด่นหรือล่าสุดที่สุด อ่านข้อมูลแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"symbol": "สัญลักษณ์ย่อของรายการที่เลือก หรือ null ถ้าไม่เห็น", "amount": จำนวนเงินที่ได้รับจริงเป็นตัวเลขไม่มีคอมมา, "shares": จำนวนหน่วยหรือหุ้นที่ขายเป็นตัวเลข, "price": ราคาต่อหน่วยที่ขายได้จริงเป็นตัวเลข, "date": วันที่ทำรายการรูปแบบ YYYY-MM-DD}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanReceiptItems(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพใบเสร็จรับเงิน อ่านรายการสินค้า/บริการทั้งหมดพร้อมราคา แล้วตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: [{"item":"ชื่อรายการ","amount":ราคาเป็นตัวเลขไม่มีคอมมา}] ถ้าอ่านราคารวมทั้งบิลได้แต่แยกรายการไม่ได้ ให้ส่งเป็นรายการเดียวชื่อ "รวมบิล"`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanPetExpenseReceipt(file, categories) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหลักฐานค่าใช้จ่ายของสัตว์เลี้ยง ซึ่งอาจเป็น "ใบเสร็จร้านค้า/โรงพยาบาล" หรือ "สลิปโอนเงินจากแอปธนาคาร" ก็ได้ ให้ดูก่อนว่าเป็นแบบไหน แล้วอ่านข้อมูลตามนี้:
- ถ้าเป็นใบเสร็จ: อ่านยอดรวมที่จ่ายจริง, วันที่บนใบเสร็จ, และเลือกหมวดหมู่ที่ใกล้เคียงที่สุดจากรายการ: ${categories.join(', ')}
- ถ้าเป็นสลิปโอนเงิน: อ่านยอดโอน, วันที่โอน, ชื่อผู้รับโอน (ถ้ามี) — สลิปโอนมักไม่มีหมวดหมู่ชัดเจน ถ้าเดาหมวดหมู่ไม่ได้ให้ตอบ "อื่นๆ"
ถ้าไม่มีวันที่ให้ใช้วันนี้ ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"amount": ยอดเงินเป็นตัวเลขไม่มีคอมมา, "category": "หมวดที่เลือกจากรายการ หรือ อื่นๆ ถ้าเดาไม่ได้", "date": "YYYY-MM-DD", "note": "รายละเอียดสั้นๆ เช่นชื่อร้าน/ผู้รับโอน/รายการ", "sourceType": "receipt หรือ transfer_slip"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanWeightScale(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอตาชั่งน้ำหนักสัตว์เลี้ยง อ่านตัวเลขน้ำหนักที่แสดง (หน่วยกิโลกรัม) แล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"weight": ตัวเลขน้ำหนักเป็นกิโลกรัม}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function parseExpenseText(transcript, categories) {
  const prompt = `ผู้ใช้พูดบันทึกรายจ่ายเป็นภาษาไทยว่า: "${transcript}"
หมวดหมู่ที่มีอยู่แล้ว: ${categories.join(', ')}
อ่านแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"amount": จำนวนเงินเป็นตัวเลข, "category": "เลือกหมวดที่ใกล้เคียงที่สุดจากรายการที่มี หรือถ้าไม่เข้าเลยให้ตอบ อื่นๆ", "note": "รายละเอียดสั้นๆ เช่น ชื่อของที่ซื้อ"}`;
  const text = await askServer(prompt);
  return safeParseJson(text);
}


async function scanPortfolioTable(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอแอปการลงทุนที่แสดงรายการสินทรัพย์หลายตัว (อาจเป็นตารางหุ้นไทยแบบมีคอลัมน์ Avail Vol/Avg/Market หรือเป็นรายการแบบ Dime! ที่โชว์มูลค่ารวมกับราคาต่อหน่วยและ % เปลี่ยนแปลง) อ่านทุกแถวที่เห็น แล้วตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น สำหรับแต่ละแถวใส่ข้อมูลเท่าที่เห็นจริงในภาพ ถ้าไม่เห็นให้ใส่ null รูปแบบ: [{"symbol":"สัญลักษณ์ย่อ","currency":"THB หรือ USD","shares":จำนวนหน่วยถ้าเห็นตรงๆมิฉะนั้น null,"avgCost":ต้นทุนเฉลี่ยต่อหน่วยถ้าเห็นมิฉะนั้น null,"currentPrice":ราคาต่อหน่วยปัจจุบันถ้าเห็นมิฉะนั้น null,"value":มูลค่ารวมของแถวนี้ถ้าเห็นมิฉะนั้น null}]`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
                                                  }async function scanHoldingDetail(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้ารายละเอียดของหุ้นหรือกองทุนเพียงตัวเดียว (อาจแสดงจำนวนหน่วย/หุ้นที่ถือ, ต้นทุนเฉลี่ยหรือ NAV ต้นทุนต่อหน่วย, ราคาปัจจุบันหรือ NAV ปัจจุบันต่อหน่วย) อ่านค่าที่เห็นจริงแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น ถ้าไม่เห็นค่าใดให้ใส่ null รูปแบบ: {"shares": จำนวนหน่วยหรือหุ้นเป็นตัวเลขหรือ null, "avgCost": ต้นทุนเฉลี่ยหรือNAVต้นทุนต่อหน่วยเป็นตัวเลขหรือ null, "currentPrice": ราคาปัจจุบันหรือNAVปัจจุบันต่อหน่วยเป็นตัวเลขหรือ null, "currency": "THB หรือ USD"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

// ฟีเจอร์ L+M: อ่านภาพพอร์ต/ออเดอร์แบบยืดหยุ่น — จำแนกประเภทภาพเองแล้วดึงข้อมูลตามแบบที่เจอ
// type "order": ตารางออเดอร์ซื้อขาย (เช่นแอป ttb) — ต้องกรองเอาเฉพาะสถานะ Match/สำเร็จเท่านั้น
// type "summary": หน้ารวมหลายสินทรัพย์ (เช่นตาราง SET หรือลิสต์การ์ดของ Dime) — อาจไม่มีจำนวนหน่วยตรงๆ
// type "detail": หน้ารายละเอียดของสินทรัพย์ตัวเดียว — มักมีจำนวนหน่วย/ต้นทุนเฉลี่ยตรงๆ แม่นยำที่สุด
async function scanPortfolioImageUniversal(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอแอปการลงทุน (หุ้น/กองทุน/ETF) ให้จำแนกก่อนว่าภาพนี้เป็นแบบไหนใน 3 แบบนี้:
1) "order" = ตารางประวัติคำสั่งซื้อขาย มีคอลัมน์ฝั่ง (Buy/Sell หรือ B/S) และสถานะ (เช่น Match, Cancel, Change)
2) "summary" = หน้ารวมแสดงหลายสินทรัพย์พร้อมกัน (ตารางหรือการ์ดหลายรายการ) แต่ไม่ใช่หน้าออเดอร์
3) "detail" = หน้ารายละเอียดของสินทรัพย์เพียงตัวเดียว

ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ:
{"type": "order หรือ summary หรือ detail",
"rows": [
  ถ้า type=order: {"symbol":"สัญลักษณ์","side":"B หรือ S","price":ราคาต่อหน่วยเป็นตัวเลข,"volume":จำนวนหน่วยเป็นตัวเลข,"status":"สถานะที่เห็น เช่น Match, Cancel, Change"}
  ถ้า type=summary: {"symbol":"สัญลักษณ์","shares":จำนวนหน่วยถ้าเห็นตรงๆมิฉะนั้น null,"avgCost":ต้นทุนเฉลี่ยต่อหน่วยถ้าเห็นมิฉะนั้น null,"currentPrice":ราคาต่อหน่วยปัจจุบันถ้าเห็นมิฉะนั้น null,"marketValue":มูลค่ารวมของแถวนี้ถ้าเห็นมิฉะนั้น null}
  ถ้า type=detail: {"symbol":"สัญลักษณ์ถ้าเห็นมิฉะนั้น null","shares":จำนวนหน่วยหรือหุ้นเป็นตัวเลขหรือ null,"avgCost":ต้นทุนเฉลี่ยต่อหน่วยเป็นตัวเลขหรือ null,"currentPrice":ราคาปัจจุบันต่อหน่วยเป็นตัวเลขหรือ null}
]}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

// รวมผลลัพธ์จากหลายภาพ: rows แบบ detail ชนะ summary เสมอสำหรับสัญลักษณ์เดียวกัน, เก็บ order rows แยกไว้ต่างหาก
function mergePortfolioScans(results) {
  const bySymbol = {}; // symbol -> { shares, avgCost, currentPrice, sourcePriority }
  const orderRows = [];
  const priority = { detail: 2, summary: 1 };
  results.forEach((r) => {
    if (!r || !r.rows) return;
    if (r.type === 'order') {
      r.rows.forEach((row) => { if (row.symbol) orderRows.push(row); });
      return;
    }
    const pri = priority[r.type] || 1;
    r.rows.forEach((row) => {
      const sym = (row.symbol || '').toUpperCase();
      if (!sym) return;
      const shares = row.shares !== null && row.shares !== undefined ? Number(row.shares) : (row.marketValue && row.currentPrice ? Number(row.marketValue) / Number(row.currentPrice) : null);
      const existing = bySymbol[sym];
      if (!existing || pri >= existing.sourcePriority) {
        bySymbol[sym] = {
          symbol: sym,
          shares: shares !== null && shares !== undefined ? shares : (existing ? existing.shares : null),
          avgCost: (row.avgCost !== null && row.avgCost !== undefined) ? Number(row.avgCost) : (existing ? existing.avgCost : null),
          currentPrice: (row.currentPrice !== null && row.currentPrice !== undefined) ? Number(row.currentPrice) : (existing ? existing.currentPrice : null),
          sourcePriority: pri,
        };
      }
    });
  });
  return { bySymbol, orderRows };
}

function AccountsTab({ accounts, onUpdate, onAdd, onRemove, costBasisByAccount, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, finnhubKey, onSellHolding, onRemoveSell, onUpdateSell, onUpdateBuy }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [targets, setTargets] = useState({});
  const [newCats, setNewCats] = useState({});
  const [search, setSearch] = useState('');
  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (a) => {
    if (!searchLower) return true;
    if ((a.name || '').toLowerCase().includes(searchLower)) return true;
    return (a.holdings || []).some((h) => (h.symbol || '').toLowerCase().includes(searchLower) || (h.name || '').toLowerCase().includes(searchLower));
  };
  const grouped = useMemo(() => { const map = {}; accounts.forEach((a) => { (map[a.category] = map[a.category] || []).push(a); }); return map; }, [accounts]);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanning(true); setScanError(''); setExtracted(null); setTargets({}); setNewCats({});
    try {
      const base64 = await readFileAsBase64(file);
      const prompt = `นี่คือภาพหน้าจอแอปการลงทุน อ่านค่ามูลค่าสินทรัพย์/พอร์ตที่แสดงในภาพ แล้วตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: [{"name":"ชื่อสินทรัพย์","value":ตัวเลขไม่มีคอมมา,"currency":"THB หรือ USD"}]`;
      const text = await askServer(prompt, base64, file.type || 'image/jpeg');
      setExtracted(safeParseJson(text));
    } catch (e) { setScanError('อ่านภาพไม่สำเร็จ: ' + e.message); } finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  function confirmItem(item, idx) {
    const target = targets[idx];
    if (!target || target === '') return; // must choose a destination first
    if (target === '__new__') {
      const cat = newCats[idx] || 'other';
      onAdd(cat, item.name, Number(item.value) || 0);
    } else {
      onUpdate(target, { value: Number(item.value) || 0 });
    }
    setExtracted(extracted.filter((_, i) => i !== idx));
  }

  return (
    <div className="px-5 pt-5">
      <div className="relative mb-4">
        <Search size={15} color={SLATE} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาบัญชีหรือสัญลักษณ์หุ้น..." style={{ border: '1px solid #E7E0CE' }} className="rounded-lg pl-9 pr-3 py-2.5 text-sm w-full" />
      </div>
      <Card>
        <div className="flex items-center gap-2 mb-2"><Camera size={16} color={BRASS} /><p className="text-sm font-semibold">อัพเดทพอร์ตจากภาพหน้าจอ (หลายรายการ)</p></div>
        <p className="text-xs mb-3" style={{ color: SLATE }}>เหมาะกับภาพที่มีหลายสินทรัพย์ในหน้าเดียว ต้องเลือกบัญชีปลายทางเองทีละรายการก่อนยืนยัน (กันจับคู่ผิด/ซ้ำ) — ถ้าอัพเดทแค่บัญชีเดียว แนะนำใช้ปุ่มกล้องในการ์ดของบัญชีนั้นแทน จะง่ายกว่า</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{scanning ? 'กำลังอ่านภาพ...' : 'เลือกภาพ'}
        </button>
        {scanError && <p className="text-xs mt-2" style={{ color: BAD }}>{scanError}</p>}
        {extracted && extracted.length > 0 && (
          <div className="mt-3">
            <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {extracted.length} รายการ — เลือกบัญชีปลายทางแล้วกดยืนยันทีละรายการ</p>
            {extracted.map((item, idx) => (
              <div key={idx} style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <div><p className="text-sm">{item.name}</p><p className="text-xs" style={{ color: SLATE }}>{item.value} {item.currency}</p></div>
                  <button onClick={() => confirmItem(item, idx)} disabled={!targets[idx]} style={{ color: targets[idx] ? BRASS : '#B8B0A0' }} className="text-xs font-semibold">ยืนยัน</button>
                </div>
                <select value={targets[idx] || ''} onChange={(e) => setTargets({ ...targets, [idx]: e.target.value })} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-2 py-1.5 text-xs w-full mb-1">
                  <option value="">— เลือกบัญชีปลายทาง —</option>
                  {Object.entries(CATEGORY_META).map(([catKey, catMeta]) => (
                    <optgroup key={catKey} label={catMeta.label}>

                      {accounts.filter((a) => a.category === catKey).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </optgroup>
                  ))}
                  <option value="__new__">+ สร้างบัญชีใหม่</option>
                </select>
                {targets[idx] === '__new__' && (
                  <select value={newCats[idx] || 'other'} onChange={(e) => setNewCats({ ...newCats, [idx]: e.target.value })} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-2 py-1.5 text-xs w-full">
                    {Object.entries(CATEGORY_META).map(([catKey, catMeta]) => <option key={catKey} value={catKey}>{catMeta.label}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      {Object.entries(CATEGORY_META).map(([key, meta]) => {
        const catAccounts = (grouped[key] || []).filter(matchesSearch);
        if (searchLower && catAccounts.length === 0) return null;
        return (
        <div key={key} className="mb-5">
          <div className="flex justify-between items-center mb-2"><p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p><button onClick={() => onAdd(key)} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่มบัญชี</button></div>
          {catAccounts.map((a) => (
            HOLDING_CATEGORIES.includes(key)
              ? <StockAccountCard key={a.id} account={a} onUpdate={onUpdate} onRemove={onRemove} onAddHolding={onAddHolding} onUpdateHolding={onUpdateHolding} onRemoveHolding={onRemoveHolding} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onUpdateDividend={onUpdateDividend} onRefreshPrice={onRefreshPrice} finnhubKey={finnhubKey} categoryColor={meta.color} onScanValue={scanSingleValue} allAccounts={accounts} onSellHolding={onSellHolding} onRemoveSell={onRemoveSell} onUpdateSell={onUpdateSell} onUpdateBuy={onUpdateBuy} />
              : <SimpleAccountCard key={a.id} account={a} basis={costBasisByAccount[a.id] || 0} onUpdate={onUpdate} onRemove={onRemove} onScanValue={scanSingleValue} />
          ))}
          {(!grouped[key] || grouped[key].length === 0) && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบัญชีในหมวดนี้</p>}
        </div>
        );
      })}
    </div>
  );
}

function ScanValueButton({ onScanValue, onApply, defaultFx }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [pendingValue, setPendingValue] = useState(null); // { value, currency }
  const [fxRate, setFxRate] = useState(defaultFx || 36);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanning(true); setError(''); setPendingValue(null);
    try {
      const result = await onScanValue(file);
      if (!result) setError('อ่านค่าจากภาพไม่สำเร็จ ลองภาพที่ชัดกว่านี้');
      else { setPendingValue(result); setFxRate(defaultFx || 36); }
    } catch (e) { setError('เกิดข้อผิดพลาด: ' + e.message); }
    finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  if (pendingValue !== null) {
    const isUSD = pendingValue.currency === 'USD';
    const thbValue = isUSD ? pendingValue.value * fxRate : pendingValue.value;
    return (
      <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
        {isUSD ? (
          <>
            <p className="text-xs mb-2" style={{ color: SLATE }}>อ่านได้ {pendingValue.value.toLocaleString()} USD — ใส่อัตราแลกเปลี่ยนเพื่อแปลงเป็นบาท</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: SLATE }}>1 USD =</span>
              <NumInput value={fxRate} onChange={setFxRate} className="text-xs rounded px-2 py-1 w-20" style={{ border: '1px solid #E7E0CE' }} />
              <span className="text-xs" style={{ color: SLATE }}>บาท → ฿{fmt(thbValue)}</span>
            </div>
          </>
        ) : (
          <p className="text-xs mb-2" style={{ color: SLATE }}>พบมูลค่า <span className="font-semibold" style={{ color: INK }}>฿{fmt(thbValue)}</span> — ยืนยันเพื่ออัพเดทบัญชีนี้?</p>
        )}
        <div className="flex gap-2">
          <button onClick={() => { onApply(thbValue); setPendingValue(null); }} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยัน</button>
          <button onClick={() => setPendingValue(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-1">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
        {scanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {scanning ? 'กำลังอ่านภาพ...' : 'ถ่ายภาพอัพเดทมูลค่าบัญชีนี้'}
      </button>
      {error && <p className="text-[10px] mt-1" style={{ color: BAD }}>{error}</p>}
    </div>
  );
}

function SimpleAccountCard({ account: a, basis, onUpdate, onRemove, onScanValue }) {
  const gain = a.value - basis;
  return (
    <Card>
      <div className="flex justify-between items-center gap-2"><input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} /><button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button></div>
      <div className="flex items-center mt-2 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} /></div>
      {basis > 0 && <p className="text-xs mb-2" style={{ color: gain >= 0 ? GOOD : BAD }}>ต้นทุนสะสม ฿{fmt(basis)} · {gain >= 0 ? '+' : ''}฿{fmt(gain)}</p>}
      {onScanValue && <ScanValueButton onScanValue={onScanValue} onApply={(v) => onUpdate(a.id, { value: v })} />}
    </Card>
  );
  }function StockAccountCard({ account: a, onUpdate, onRemove, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, finnhubKey, categoryColor, onScanValue, allAccounts, onSellHolding, onRemoveSell, onUpdateSell, onUpdateBuy }) {
  const [expanded, setExpanded] = useState(true);
  const holdings = a.holdings || [];
  const totalValue = holdings.reduce((s, h) => s + holdingMarketValueTHB(h), 0);
  const totalCost = holdings.reduce((s, h) => s + holdingCostBasisTHB(h), 0);
  const totalGain = totalValue - totalCost;
  const displayValue = holdings.length > 0 ? totalValue : a.value;
  const currency = a.category === 'dime' ? 'USD' : 'THB';

  const portFileRef = useRef(null);
  const [portScanning, setPortScanning] = useState(false);
  const [portError, setPortError] = useState('');
  const [portDraft, setPortDraft] = useState(null); // array of rows

  const syncFilesRef = useRef(null);
  const [syncScanningMulti, setSyncScanningMulti] = useState(false);
  const [syncErrorMulti, setSyncErrorMulti] = useState('');
  const [syncDraftMulti, setSyncDraftMulti] = useState(null); // { rows: [...], removedSymbols: [...] }

  async function handlePortfolioFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPortScanning(true); setPortError(''); setPortDraft(null);
    try {
      const rows = await scanPortfolioTable(file);
      setPortDraft(rows.map((r) => {
        const rowCurrency = r.currency === 'USD' ? 'USD' : currency;
        const currentPrice = r.currentPrice !== null && r.currentPrice !== undefined ? Number(r.currentPrice) : 0;
        let shares = r.shares !== null && r.shares !== undefined ? Number(r.shares) : null;
        if ((shares === null || shares === 0) && r.value && currentPrice) shares = Number(r.value) / currentPrice;
        const existing = holdings.find((h) => (h.symbol || '').toUpperCase() === (r.symbol || '').toUpperCase());
        const avgCost = r.avgCost !== null && r.avgCost !== undefined ? Number(r.avgCost) : (existing ? existing.avgCost : 0);
        return { symbol: (r.symbol || '').toUpperCase(), shares: shares || 0, avgCost, currentPrice, currency: rowCurrency, fx: rowCurrency === 'USD' ? 36 : 1, avgCostMissing: r.avgCost === null || r.avgCost === undefined, sharesMissing: r.shares === null || r.shares === undefined };
      }));
    } catch (err) { setPortError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setPortScanning(false); if (portFileRef.current) portFileRef.current.value = ''; }
  }
  function updateDraftRow(idx, patch) { setPortDraft(portDraft.map((r, i) => (i === idx ? { ...r, ...patch } : r))); }
  function removeDraftRow(idx) { setPortDraft(portDraft.filter((_, i) => i !== idx)); }
  function confirmPortfolioImport() {
    const today = new Date().toISOString().slice(0, 10);
    const next = [...holdings];
    portDraft.forEach((row) => {
      if (!row.symbol) return;
      const rowCur = row.currency || currency;
      const idx = next.findIndex((h) => (h.symbol || '').toUpperCase() === row.symbol);
      if (idx >= 0) {
        next[idx] = { ...next[idx], shares: row.shares, avgCost: row.avgCost, currentPrice: row.currentPrice, currentFx: rowCur === 'USD' ? row.fx : next[idx].currentFx, lastUpdated: today };
      } else {
        next.push({ id: uid(), symbol: row.symbol, name: '', shares: row.shares, avgCost: row.avgCost, currency: rowCur, purchaseFx: rowCur === 'USD' ? row.fx : 1, currentPrice: row.currentPrice, currentFx: rowCur === 'USD' ? row.fx : 1, lastUpdated: today, purchaseDate: '', dividends: [], sells: [], buys: [] });
      }
    });
    onUpdate(a.id, { holdings: next });
    setPortDraft(null);
  }

  async function handleSyncFilesMulti(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSyncScanningMulti(true); setSyncErrorMulti(''); setSyncDraftMulti(null);
    try {
      const results = await Promise.all(files.map((f) => scanPortfolioImageUniversal(f)));
      const { bySymbol, orderRows } = mergePortfolioScans(results);
      let fxRate = null;
      if (currency === 'USD') {
        try { const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=THB'); const d = await res.json(); fxRate = d && d.rates && d.rates.THB; } catch (e) { fxRate = null; }
      }
      const today = new Date().toISOString().slice(0, 10);
      // เริ่มจากโฮลดิ้งปัจจุบันเป็นฐาน
      const working = {};
      holdings.forEach((h) => { working[(h.symbol || '').toUpperCase()] = { ...h }; });

      // ใช้ order rows (เฉพาะ Match) ปรับจำนวนหุ้น/ต้นทุนก่อน
      orderRows.forEach((row) => {
        const sym = (row.symbol || '').toUpperCase();
        const statusStr = (row.status || '').toLowerCase();
        const isMatch = statusStr.includes('match') || statusStr === 'm';
        if (!isMatch || !sym) return;
        const isBuy = (row.side || '').toUpperCase().startsWith('B');
        const vol = Number(row.volume) || 0;
        const price = Number(row.price) || 0;
        const existing = working[sym];
        if (isBuy) {
          if (existing) {
            const oldShares = Number(existing.shares || 0); const oldAvg = Number(existing.avgCost || 0);
            const newShares = oldShares + vol;
            const newAvg = newShares > 0 ? (oldShares * oldAvg + vol * price) / newShares : 0;
            working[sym] = { ...existing, shares: newShares, avgCost: newAvg, lastUpdated: today };
          } else {
            working[sym] = { id: uid(), symbol: sym, name: '', shares: vol, avgCost: price, currency, purchaseFx: currency === 'USD' ? (fxRate || 36) : 1, currentPrice: price, currentFx: currency === 'USD' ? (fxRate || 36) : 1, lastUpdated: today, purchaseDate: today, dividends: [], sells: [], buys: [] };
          }
        } else {
          if (existing) {
            const newShares = Math.max(0, Number(existing.shares || 0) - vol);
            working[sym] = { ...existing, shares: newShares, lastUpdated: today };
          }
        }
      });

      const hasSnapshotData = Object.keys(bySymbol).length > 0;
      const rows = [];
      if (hasSnapshotData) {
        // Full sync: ใช้ bySymbol เป็นความจริงล่าสุด — อัพเดท/เพิ่มทุกตัวที่เจอ
        Object.values(bySymbol).forEach((row) => {
          const existing = working[row.symbol];
          const shares = row.shares !== null && row.shares !== undefined ? row.shares : (existing ? existing.shares : 0);
          const avgCost = row.avgCost !== null && row.avgCost !== undefined ? row.avgCost : (existing ? existing.avgCost : 0);
          const currentPrice = row.currentPrice !== null && row.currentPrice !== undefined ? row.currentPrice : (existing ? existing.currentPrice : 0);
          rows.push({ symbol: row.symbol, shares: shares || 0, avgCost: avgCost || 0, currentPrice: currentPrice || 0, isNew: !existing, willRemove: false });
        });
        // สัญลักษณ์ที่มีอยู่เดิมแต่ไม่เจอในภาพเลย (ไม่ใช่แค่ order) → เสนอให้ลบ (full sync)
        Object.keys(working).forEach((sym) => {
          if (!bySymbol[sym]) {
            const existing = working[sym];
            const stillFromOrder = orderRows.some((r) => (r.symbol || '').toUpperCase() === sym);
            if (stillFromOrder) {
              rows.push({ symbol: sym, shares: existing.shares || 0, avgCost: existing.avgCost || 0, currentPrice: existing.currentPrice || 0, isNew: false, willRemove: false });
            } else {
              rows.push({ symbol: sym, shares: existing.shares || 0, avgCost: existing.avgCost || 0, currentPrice: existing.currentPrice || 0, isNew: false, willRemove: true });
            }
          }
        });
      } else {
        // ไม่มีภาพสรุปเลย มีแต่ order → แค่ผสานเพิ่ม/ลด ไม่ลบอะไรออก
        Object.keys(working).forEach((sym) => {
          const existing = working[sym];
          rows.push({ symbol: sym, shares: existing.shares || 0, avgCost: existing.avgCost || 0, currentPrice: existing.currentPrice || 0, isNew: !holdings.some((h) => (h.symbol || '').toUpperCase() === sym), willRemove: false });
        });
      }
      setSyncDraftMulti({ rows, fxRate: fxRate || null });
    } catch (err) { setSyncErrorMulti('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setSyncScanningMulti(false); if (syncFilesRef.current) syncFilesRef.current.value = ''; }
  }
  function updateSyncRowMulti(idx, patch) { setSyncDraftMulti({ ...syncDraftMulti, rows: syncDraftMulti.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }); }
  function confirmSyncMulti() {
    const today = new Date().toISOString().slice(0, 10);
    const fx = syncDraftMulti.fxRate;
    const kept = syncDraftMulti.rows.filter((r) => !r.willRemove);
    const next = kept.map((row) => {
      const existing = holdings.find((h) => (h.symbol || '').toUpperCase() === row.symbol);
      if (existing) {
        return { ...existing, shares: row.shares, avgCost: row.avgCost, currentPrice: row.currentPrice, currentFx: currency === 'USD' && fx ? fx : existing.currentFx, lastUpdated: today };
      }
      return { id: uid(), symbol: row.symbol, name: '', shares: row.shares, avgCost: row.avgCost, currency, purchaseFx: currency === 'USD' ? (fx || 36) : 1, currentPrice: row.currentPrice, currentFx: currency === 'USD' ? (fx || 36) : 1, lastUpdated: today, purchaseDate: '', dividends: [], sells: [], buys: [] };
    });
    onUpdate(a.id, { holdings: next });
    setSyncDraftMulti(null);
  }

  return (
    <Card>
      <div className="flex justify-between items-center gap-2"><input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none font-semibold" style={{ border: 'none' }} /><button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button></div>
      {a.category === 'mutual_fund' && (
        <input value={a.platform || ''} onChange={(e) => onUpdate(a.id, { platform: e.target.value })} placeholder="แพลตฟอร์ม/ช่องทาง เช่น Wealth X, ดาม (ไม่บังคับ)" className="text-[11px] w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7E0CE', color: SLATE }} />
      )}
      <p className="text-lg font-semibold mt-1">฿{fmt(displayValue)}</p>
      {holdings.length > 0 && totalCost > 0 && <p className="text-xs mb-2" style={{ color: totalGain >= 0 ? GOOD : BAD }}>ต้นทุนรวม ฿{fmt(totalCost)} · {totalGain >= 0 ? '+' : ''}฿{fmt(totalGain)} ({totalCost ? ((totalGain / totalCost) * 100).toFixed(1) : 0}%)</p>}
      {holdings.length === 0 && (
        <>
          <div className="flex items-center mt-1 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: SLATE }} placeholder="มูลค่ารวม (ถ้ายังไม่แยกรายตัว)" /></div>
          {onScanValue && <ScanValueButton onScanValue={onScanValue} onApply={(v) => onUpdate(a.id, { value: v })} />}
        </>
      )}

      {portDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-lg p-2 my-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {portDraft.length} หุ้น — ตรวจสอบ/แก้ไขแล้วกดยืนยันนำเข้าทั้งหมด (หุ้นเดิมจะอัพเดท หุ้นใหม่จะถูกเพิ่ม)</p>
          {portDraft.map((row, idx) => {
            const isExisting = holdings.some((h) => (h.symbol || '').toUpperCase() === row.symbol);
            return (
              <div key={idx} style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <input value={row.symbol} onChange={(e) => updateDraftRow(idx, { symbol: e.target.value.toUpperCase() })} className="text-xs font-semibold outline-none rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
                  <span className="text-[10px] mx-2" style={{ color: isExisting ? BRASS : GOOD }}>{isExisting ? 'อัพเดทเดิม' : 'เพิ่มใหม่'}</span>
                  <button onClick={() => removeDraftRow(idx)}><Trash2 size={13} color={BAD} /></button>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  <div><label className="text-[9px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={row.shares} onChange={(v) => updateDraftRow(idx, { shares: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย ({row.currency})</label><NumInput value={row.avgCost} onChange={(v) => updateDraftRow(idx, { avgCost: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ราคาตลาด ({row.currency})</label><NumInput value={row.currentPrice} onChange={(v) => updateDraftRow(idx, { currentPrice: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                </div>
                {row.currency === 'USD' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px]" style={{ color: SLATE }}>FX (1 USD =)</span>
                    <NumInput value={row.fx} onChange={(v) => updateDraftRow(idx, { fx: v })} className="text-xs rounded px-1 py-1 w-16" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
                    <span className="text-[9px]" style={{ color: SLATE }}>บาท</span>
                  </div>
                )}
                {row.avgCostMissing && <p className="text-[9px]" style={{ color: BAD }}>ภาพนี้ไม่แสดงต้นทุนเฉลี่ย — {holdings.some((h) => (h.symbol || '').toUpperCase() === row.symbol) ? 'ใช้ค่าเดิมที่มีอยู่แล้ว' : 'กรุณากรอกเอง'}</p>}
                {row.sharesMissing && row.shares > 0 && <p className="text-[9px]" style={{ color: SLATE }}>คำนวณจำนวนหุ้นจากมูลค่า ÷ ราคา (ไม่ได้อ่านจากภาพตรงๆ)</p>}
              </div>
            );
          })}
          {currency === 'USD' && <p className="text-[10px] mb-2" style={{ color: SLATE }}>หุ้นใหม่ที่เพิ่มจะตั้ง FX เริ่มต้นที่ 36 — เข้าไปแก้ไขในแต่ละหุ้นให้ตรงภายหลังได้</p>}
          <div className="flex gap-2">
            <button onClick={confirmPortfolioImport} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันนำเข้าทั้งหมด</button>
            <button onClick={() => setPortDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="my-2">
          <input ref={portFileRef} type="file" accept="image/*" onChange={handlePortfolioFile} className="hidden" />
          <button onClick={() => portFileRef.current && portFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: categoryColor }}>
            {portScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {portScanning ? 'กำลังอ่านตารางพอร์ต...' : 'นำเข้าทั้งพอร์ตจากภาพ (แยกเป็นรายหุ้นให้)'}
          </button>
          {portError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{portError}</p>}
        </div>
      )}

      {syncDraftMulti ? (
        <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-lg p-2 my-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ซิงค์พอร์ตจากภาพ — ตรวจสอบก่อนยืนยัน (สีแดง = จะถูกลบเพราะไม่เจอในภาพ, สีเขียว = หุ้นใหม่)</p>
          {syncDraftMulti.rows.map((row, idx) => (
            <div key={idx} style={{ background: row.willRemove ? '#FBEAE6' : PAPER_DIM }} className="rounded-lg p-2 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">{row.symbol}</span>
                <span className="text-[10px]" style={{ color: row.willRemove ? BAD : (row.isNew ? GOOD : SLATE) }}>{row.willRemove ? 'จะลบ (ไม่เจอในภาพ)' : row.isNew ? 'หุ้นใหม่' : 'อัพเดท'}</span>
              </div>
              {!row.willRemove && (
                <div className="grid grid-cols-3 gap-1">
                  <div><label className="text-[9px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={row.shares} onChange={(v) => updateSyncRowMulti(idx, { shares: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย</label><NumInput value={row.avgCost} onChange={(v) => updateSyncRowMulti(idx, { avgCost: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ราคาตลาด</label><NumInput value={row.currentPrice} onChange={(v) => updateSyncRowMulti(idx, { currentPrice: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} /></div>
                </div>
              )}
              <button onClick={() => updateSyncRowMulti(idx, { willRemove: !row.willRemove })} className="text-[10px] mt-1" style={{ color: BRASS }}>{row.willRemove ? 'ยกเลิกการลบ (เก็บไว้)' : 'บังคับลบตัวนี้'}</button>
            </div>
          ))}
          {currency === 'USD' && <p className="text-[10px] mb-2" style={{ color: SLATE }}>อัตราแลกเปลี่ยนที่ใช้: {syncDraftMulti.fxRate ? `1 USD = ${syncDraftMulti.fxRate.toFixed(2)} บาท (เรียลไทม์)` : 'ดึงเรียลไทม์ไม่สำเร็จ ใช้ค่าเดิม'}</p>}
          <div className="flex gap-2">
            <button onClick={confirmSyncMulti} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันซิงค์ทั้งหมด</button>
            <button onClick={() => setSyncDraftMulti(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="my-2">
          <input ref={syncFilesRef} type="file" accept="image/*" multiple onChange={handleSyncFilesMulti} className="hidden" />
          <button onClick={() => syncFilesRef.current && syncFilesRef.current.click()} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: categoryColor }}>
            {syncScanningMulti ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} {syncScanningMulti ? 'กำลังอ่านภาพทั้งหมด...' : '📷 ซิงค์พอร์ตจากภาพ (เลือกได้หลายรูป)'}
          </button>
          <p className="text-[9px] mt-0.5" style={{ color: SLATE }}>รองรับทั้งภาพสรุปพอร์ต, ภาพรายละเอียดรายตัว, และภาพตาราง Order — ระบบจะรวมข้อมูลให้อัตโนมัติ</p>
          {syncErrorMulti && <p className="text-[10px] mt-1" style={{ color: BAD }}>{syncErrorMulti}</p>}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs mt-1" style={{ color: categoryColor }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {holdings.length} หุ้นในบัญชีนี้</button>
      {expanded && (
        <div className="mt-3">
          {holdings.map((h) => <HoldingRow key={h.id} accountId={a.id} holding={h} onUpdate={onUpdateHolding} onRemove={onRemoveHolding} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onUpdateDividend={onUpdateDividend} onRefreshPrice={onRefreshPrice} canRefresh={h.currency === 'USD'} finnhubKey={finnhubKey} allAccounts={allAccounts} onSellHolding={onSellHolding} onRemoveSell={onRemoveSell} onUpdateSell={onUpdateSell} onUpdateBuy={onUpdateBuy} />)}
          <button onClick={() => onAddHolding(a.id)} className="flex items-center gap-1 text-xs mt-1" style={{ color: BRASS }}><PlusCircle size={13} /> เพิ่มหุ้นในบัญชีนี้</button>
        </div>
      )}
    </Card>
  );
}

function HoldingRow({ accountId, holding: h, onUpdate, onRemove, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, canRefresh, finnhubKey, allAccounts, onSellHolding, onRemoveSell, onUpdateSell, onUpdateBuy }) {
  const [showDiv, setShowDiv] = useState(false);
  const [divAmount, setDivAmount] = useState(0);
  const [divDate, setDivDate] = useState(new Date().toISOString().slice(0, 10));
  const [divReinvest, setDivReinvest] = useState('');
  const [showSells, setShowSells] = useState(false);
  const [showBuys, setShowBuys] = useState(false);
  const [editingBuy, setEditingBuy] = useState(null);
  const [editingSell, setEditingSell] = useState(null);
  const [editingDiv, setEditingDiv] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const buyFileRef = useRef(null);
  const [buyScanning, setBuyScanning] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buyDraft, setBuyDraft] = useState(null); // { amount, shares, price, date }
  const sellFileRef = useRef(null);
  const [sellScanning, setSellScanning] = useState(false);
  const [sellError, setSellError] = useState('');
  const [sellDraft, setSellDraft] = useState(null); // { amount, shares, price, date }
  const syncFileRef = useRef(null);
  const [syncScanning, setSyncScanning] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncDraft, setSyncDraft] = useState(null); // { shares, avgCost, currentPrice, currency }
  const marketValue = holdingMarketValueTHB(h);
  const costBasis = holdingCostBasisTHB(h);
  const gain = marketValue - costBasis;
  const gainPct = costBasis ? (gain / costBasis) * 100 : 0;
  const totalDiv = (h.dividends || []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const yieldPct = costBasis ? (totalDiv / costBasis) * 100 : 0;
  const cagr = holdingCAGR(h);
  const totalRealized = (h.sells || []).reduce((s, x) => s + Number(x.gain || 0), 0);
  const [refreshError, setRefreshError] = useState('');
  async function doRefresh() {
    setRefreshing(true); setRefreshError('');
    const result = await onRefreshPrice(accountId, h.id, h.symbol);
    if (result && !result.ok) setRefreshError(result.message);
    setRefreshing(false);
  }

  async function handleBuyFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBuyScanning(true); setBuyError(''); setBuyDraft(null);
    try {
      const parsed = await scanBuyTransaction(file);
      setBuyDraft({ symbol: parsed.symbol || null, amount: Number(parsed.amount) || 0, shares: Number(parsed.shares) || 0, price: Number(parsed.price) || 0, date: parsed.date || new Date().toISOString().slice(0, 10) });
    } catch (err) { setBuyError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setBuyScanning(false); if (buyFileRef.current) buyFileRef.current.value = ''; }
  }

  async function handleSellFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSellScanning(true); setSellError(''); setSellDraft(null);
    try {
      const parsed = await scanSellTransaction(file);
      setSellDraft({ symbol: parsed.symbol || null, amount: Number(parsed.amount) || 0, shares: Number(parsed.shares) || 0, price: Number(parsed.price) || 0, date: parsed.date || new Date().toISOString().slice(0, 10) });
    } catch (err) { setSellError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setSellScanning(false); if (sellFileRef.current) sellFileRef.current.value = ''; }
  }

  const sellPreview = useMemo(() => {
    if (!sellDraft) return null;
    const fx = h.currency === 'USD' ? Number(h.purchaseFx || 0) : 1;
    const costBasisSold = Number(sellDraft.shares || 0) * Number(h.avgCost || 0) * fx;
    const gainOnSale = Number(sellDraft.amount || 0) - costBasisSold;
    const remainingShares = Math.max(0, Number(h.shares || 0) - Number(sellDraft.shares || 0));
    return { costBasisSold, gainOnSale, remainingShares };
  }, [sellDraft, h]);

  function confirmSell() {
    onSellHolding(accountId, h.id, sellDraft);
    setSellDraft(null);
  }

  const buyPreview = useMemo(() => {
    if (!buyDraft) return null;
    const oldShares = Number(h.shares || 0);
    const oldAvgCost = Number(h.avgCost || 0);
    const newShares = oldShares + Number(buyDraft.shares || 0);
    const newAvgCost = newShares > 0 ? (oldShares * oldAvgCost + Number(buyDraft.shares || 0) * Number(buyDraft.price || 0)) / newShares : 0;
    let newPurchaseFx = h.purchaseFx;
    if (h.currency === 'USD') {
      const oldTotalTHB = holdingCostBasisTHB(h);
      const newTotalTHB = oldTotalTHB + Number(buyDraft.amount || 0);
      const newTotalUSDCost = newShares * newAvgCost;
      newPurchaseFx = newTotalUSDCost > 0 ? newTotalTHB / newTotalUSDCost : h.purchaseFx;
    }
    return { newShares, newAvgCost, newPurchaseFx };
  }, [buyDraft, h]);

  function confirmBuy() {
    const buyRecord = { id: uid(), date: buyDraft.date, shares: buyDraft.shares, price: buyDraft.price, amount: buyDraft.amount };
    const patch = { shares: buyPreview.newShares, avgCost: buyPreview.newAvgCost, purchaseDate: h.purchaseDate || buyDraft.date, lastUpdated: new Date().toISOString().slice(0, 10), buys: [buyRecord, ...(h.buys || [])] };
    if (h.currency === 'USD') patch.purchaseFx = buyPreview.newPurchaseFx;
    onUpdate(accountId, h.id, patch);
    setBuyDraft(null);
  }

  async function handleSyncFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSyncScanning(true); setSyncError(''); setSyncDraft(null);
    try {
      const parsed = await scanHoldingDetail(file);
      setSyncDraft({
        shares: parsed.shares !== null && parsed.shares !== undefined ? Number(parsed.shares) : h.shares,
        avgCost: parsed.avgCost !== null && parsed.avgCost !== undefined ? Number(parsed.avgCost) : h.avgCost,
        currentPrice: parsed.currentPrice !== null && parsed.currentPrice !== undefined ? Number(parsed.currentPrice) : h.currentPrice,
        currency: parsed.currency === 'USD' ? 'USD' : 'THB',
        fx: h.currency === 'USD' ? h.purchaseFx : 36,
      });
    } catch (err) { setSyncError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setSyncScanning(false); if (syncFileRef.current) syncFileRef.current.value = ''; }
  }
  function confirmSync() {
    const wasUSD = h.currency === 'USD';
    const nowUSD = syncDraft.currency === 'USD';
    const patch = { shares: syncDraft.shares, avgCost: syncDraft.avgCost, currentPrice: syncDraft.currentPrice, currency: syncDraft.currency, lastUpdated: new Date().toISOString().slice(0, 10) };
    if (nowUSD) { patch.purchaseFx = wasUSD ? h.purchaseFx : syncDraft.fx; patch.currentFx = wasUSD ? h.currentFx : syncDraft.fx; }
    onUpdate(accountId, h.id, patch);
    setSyncDraft(null);
  }

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
      {canRefresh && <button onClick={doRefresh} disabled={!h.symbol} className="flex items-center gap-1 text-[11px] mb-1" style={{ color: finnhubKey ? BRASS : SLATE }}>{refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} {finnhubKey ? 'รีเฟรชราคาล่าสุด' : 'ตั้งค่า API key เพื่อรีเฟรชราคา'}</button>}
      {refreshError && <p className="text-[10px] mb-2" style={{ color: BAD }}>{refreshError}</p>}
      {syncDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-lg p-2 mb-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบข้อมูลก่อนตั้งค่าใหม่ทั้งหมด (แทนที่ค่าเดิม)</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={syncDraft.shares} onChange={(v) => setSyncDraft({ ...syncDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย ({syncDraft.currency})</label><NumInput value={syncDraft.avgCost} onChange={(v) => setSyncDraft({ ...syncDraft, avgCost: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคาปัจจุบัน ({syncDraft.currency})</label><NumInput value={syncDraft.currentPrice} onChange={(v) => setSyncDraft({ ...syncDraft, currentPrice: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            {syncDraft.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX</label><NumInput value={syncDraft.fx} onChange={(v) => setSyncDraft({ ...syncDraft, fx: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>}
          </div>
          {syncDraft.currency !== h.currency && <p className="text-[11px] mb-2" style={{ color: WARN }}>สังเกตว่าสกุลเงินตรวจพบเป็น {syncDraft.currency} ต่างจากเดิม ({h.currency}) — ระบบจะปรับให้ตรงตามนี้</p>}
          <div className="flex gap-2">
            <button onClick={confirmSync} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันตั้งค่าใหม่</button>
            <button onClick={() => setSyncDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="mb-2">
          <input ref={syncFileRef} type="file" accept="image/*" onChange={handleSyncFile} className="hidden" />
          <button onClick={() => syncFileRef.current && syncFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
            {syncScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {syncScanning ? 'กำลังอ่านภาพ...' : 'ซิงค์ข้อมูลจากภาพหน้ารายละเอียด'}
          </button>
          {syncError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{syncError}</p>}
        </div>
      )}
      {h.lastUpdated && <p className="text-[10px] mb-2" style={{ color: SLATE }}>อัพเดทล่าสุด: {h.lastUpdated}</p>}
      <div className="flex justify-between text-sm"><span>มูลค่า ฿{fmt(marketValue)}</span><span style={{ color: gain >= 0 ? GOOD : BAD }}>{gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%</span></div>
      <p className="text-[11px]" style={{ color: SLATE }}>ต้นทุน ฿{fmt(costBasis)} · ปันผลสะสม ฿{fmt(totalDiv)} (Yield {yieldPct.toFixed(1)}%){cagr !== null && ` · CAGR ${cagr.toFixed(1)}%/ปี`}</p>
      {h.currency === 'USD' && <p className="text-[11px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ยต่อหุ้นเป็นบาท ≈ ฿{fmt2(Number(h.avgCost || 0) * Number(h.purchaseFx || 0))} (จาก {Number(h.avgCost || 0).toFixed(2)} USD × FX {Number(h.purchaseFx || 0).toFixed(2)})</p>}
      {(h.sells || []).length > 0 && (
        <p className="text-[11px] mb-1" style={{ color: totalRealized >= 0 ? GOOD : BAD }}>กำไร/ขาดทุนที่รับรู้แล้ว (ขายไปแล้ว): {totalRealized >= 0 ? '+' : ''}฿{fmt(totalRealized)}</p>
      )}

      {buyDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-lg p-2 mt-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบรายการซื้อก่อนยืนยัน (แก้ไขได้)</p>
          {buyDraft.symbol && buyDraft.symbol.toUpperCase() !== (h.symbol || '').toUpperCase() && (
            <p className="text-[11px] mb-2" style={{ color: WARN }}>⚠️ ภาพนี้ดูเหมือนเป็นสัญลักษณ์ "{buyDraft.symbol}" แต่หุ้นนี้คือ "{h.symbol}" — เช็คให้ดีว่าภาพถูกต้องก่อนยืนยัน</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>จ่ายจริง (บาท)</label><NumInput value={buyDraft.amount} onChange={(v) => setBuyDraft({ ...buyDraft, amount: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้นที่ได้</label><NumInput value={buyDraft.shares} onChange={(v) => setBuyDraft({ ...buyDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคา/หุ้น ({h.currency})</label><NumInput value={buyDraft.price} onChange={(v) => setBuyDraft({ ...buyDraft, price: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่ซื้อ</label><input type="date" value={buyDraft.date} onChange={(e) => setBuyDraft({ ...buyDraft, date: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          </div>
          {buyPreview && (
            <p className="text-[11px] mb-2" style={{ color: GOOD }}>
              หลังยืนยัน: จำนวนหุ้นรวม {buyPreview.newShares.toFixed(4)} · ต้นทุนเฉลี่ยใหม่ {buyPreview.newAvgCost.toFixed(2)} {h.currency}
              {h.currency === 'USD' && ` · FX เฉลี่ยใหม่ ${buyPreview.newPurchaseFx.toFixed(2)}`}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={confirmBuy} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันซื้อเพิ่ม</button>
            <button onClick={() => setBuyDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <input ref={buyFileRef} type="file" accept="image/*" onChange={handleBuyFile} className="hidden" />
          <button onClick={() => buyFileRef.current && buyFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
            {buyScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {buyScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปรายการซื้อ (ซื้อเพิ่ม)'}
          </button>
          {buyError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{buyError}</p>}
        </div>
      )}
      {(h.buys || []).length > 0 && (
        <button onClick={() => setShowBuys(!showBuys)} className="text-[11px] mt-1" style={{ color: BRASS }}>{showBuys ? 'ซ่อนประวัติการซื้อ' : `ดูประวัติการซื้อ (${h.buys.length})`}</button>
      )}
      {showBuys && (h.buys || []).map((b) => (
        <div key={b.id} className="flex justify-between text-xs mt-1">
          <span>{b.date} · ซื้อ {b.shares} หุ้น @ {b.price}</span>
          <span className="text-[10px] flex items-center gap-2" style={{ color: SLATE }}>฿{fmt(b.amount)} <EditButton onClick={() => setEditingBuy(b)} /></span>
        </div>
      ))}
      {editingBuy && (
        <EditModal title="แก้ไขรายการซื้อ" onClose={() => setEditingBuy(null)}
          initialValues={{ date: editingBuy.date, shares: editingBuy.shares, price: editingBuy.price, amount: editingBuy.amount }}
          fields={[
            { key: 'date', label: 'วันที่ซื้อ', type: 'date' },
            { key: 'shares', label: 'จำนวนหุ้น', type: 'number' },
            { key: 'price', label: 'ราคา/หุ้น', type: 'number' },
            { key: 'amount', label: 'จ่ายจริง (บาท)', type: 'number' },
          ]}
          onSave={(v) => { onUpdateBuy(accountId, h.id, editingBuy.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0 }); setEditingBuy(null); }}
        />
      )}

      {sellDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-lg p-2 mt-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบรายการขายก่อนยืนยัน (แก้ไขได้)</p>
          {sellDraft.symbol && sellDraft.symbol.toUpperCase() !== (h.symbol || '').toUpperCase() && (
            <p className="text-[11px] mb-2" style={{ color: WARN }}>⚠️ ภาพนี้ดูเหมือนเป็นสัญลักษณ์ "{sellDraft.symbol}" แต่หุ้นนี้คือ "{h.symbol}" — เช็คให้ดีว่าภาพถูกต้องก่อนยืนยัน</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>ได้รับจริง (บาท)</label><NumInput value={sellDraft.amount} onChange={(v) => setSellDraft({ ...sellDraft, amount: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้นที่ขาย</label><NumInput value={sellDraft.shares} onChange={(v) => setSellDraft({ ...sellDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคา/หุ้น ({h.currency})</label><NumInput value={sellDraft.price} onChange={(v) => setSellDraft({ ...sellDraft, price: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่ขาย</label><input type="date" value={sellDraft.date} onChange={(e) => setSellDraft({ ...sellDraft, date: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          </div>
          {sellPreview && (
            <p className="text-[11px] mb-2" style={{ color: sellPreview.gainOnSale >= 0 ? GOOD : BAD }}>
              กำไร/ขาดทุนจากการขายนี้: {sellPreview.gainOnSale >= 0 ? '+' : ''}฿{fmt(sellPreview.gainOnSale)} (เทียบต้นทุน ฿{fmt(sellPreview.costBasisSold)}) · เหลือถือ {sellPreview.remainingShares.toFixed(4)} หุ้น
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={confirmSell} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันขาย</button>
            <button onClick={() => setSellDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="mt-1">
          <input ref={sellFileRef} type="file" accept="image/*" onChange={handleSellFile} className="hidden" />
          <button onClick={() => sellFileRef.current && sellFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BAD }}>
            {sellScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {sellScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปรายการขาย (บันทึกกำไร/ขาดทุน)'}
          </button>
          {sellError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{sellError}</p>}
        </div>
      )}
      {(h.sells || []).length > 0 && (
        <button onClick={() => setShowSells(!showSells)} className="text-[11px] mt-1" style={{ color: BRASS }}>{showSells ? 'ซ่อนประวัติการขาย' : `ดูประวัติการขาย (${h.sells.length})`}</button>
      )}
      {showSells && (h.sells || []).map((s) => (
        <div key={s.id} className="flex justify-between text-xs mt-1">
          <span>{s.date} · ขาย {s.shares} หุ้น @ {s.price}</span>
          <span className="flex items-center gap-2" style={{ color: s.gain >= 0 ? GOOD : BAD }}>{s.gain >= 0 ? '+' : ''}฿{fmt(s.gain)} <EditButton onClick={() => setEditingSell(s)} /><button onClick={() => onRemoveSell(accountId, h.id, s.id)}><Trash2 size={11} color={BAD} /></button></span>
        </div>
      ))}
      {editingSell && (
        <EditModal title="แก้ไขรายการขาย" onClose={() => setEditingSell(null)}
          initialValues={{ date: editingSell.date, shares: editingSell.shares, price: editingSell.price, amount: editingSell.amount }}
          fields={[
            { key: 'date', label: 'วันที่ขาย', type: 'date' },
            { key: 'shares', label: 'จำนวนหุ้นที่ขาย', type: 'number' },
            { key: 'price', label: 'ราคา/หุ้น', type: 'number' },
            { key: 'amount', label: 'ได้รับจริง (บาท)', type: 'number' },
          ]}
          onSave={(v) => {
            const fx = h.currency === 'USD' ? Number(h.purchaseFx || 0) : 1;
            const costBasisSold = Number(v.shares || 0) * Number(h.avgCost || 0) * fx;
            const gain = Number(v.amount || 0) - costBasisSold;
            onUpdateSell(accountId, h.id, editingSell.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0, gain });
            setEditingSell(null);
          }}
        />
      )}

      <button onClick={() => setShowDiv(!showDiv)} className="text-[11px] mt-2" style={{ color: BRASS }}>{showDiv ? 'ซ่อน' : 'ดู/บันทึกปันผล'}</button>
      {showDiv && (
        <div className="mt-2">
          <div className="flex gap-2 mb-2">
            <input type="date" value={divDate} onChange={(e) => setDivDate(e.target.value)} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
            <NumInput value={divAmount} onChange={setDivAmount} placeholder="จำนวนเงิน" className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE', background: 'white' }} />
          </div>
          <label className="text-[10px]" style={{ color: SLATE }}>เอาไปทำอะไรต่อ (ไม่บังคับ — ถ้าเลือกบัญชี จะบันทึกเป็นเงินเข้าให้อัตโนมัติ)</label>
          <select value={divReinvest} onChange={(e) => setDivReinvest(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded px-2 py-1 text-xs w-full mt-1 mb-2">
            <option value="">— เก็บไว้เฉยๆ / ยังไม่ระบุ —</option>
            {(allAccounts || []).map((acc) => <option key={acc.id} value={acc.id}>นำไปลงทุนต่อที่: {acc.name}</option>)}
          </select>
          <button onClick={() => { onAddDividend(accountId, h.id, { date: divDate, amount: divAmount, reinvestAccountId: divReinvest || undefined }); setDivAmount(0); setDivReinvest(''); }} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 w-full mb-2">บันทึกปันผล</button>
          {(h.dividends || []).map((d) => <div key={d.id} className="flex justify-between text-xs mb-1"><span>{d.date}{d.reinvestAccountId && ` · ลงทุนต่อ`}</span><span className="flex items-center gap-2">฿{fmt(d.amount)} <EditButton onClick={() => setEditingDiv(d)} /><button onClick={() => onRemoveDividend(accountId, h.id, d.id)}><Trash2 size={11} color={BAD} /></button></span></div>)}
        </div>
      )}
      {editingDiv && (
        <EditModal title="แก้ไขปันผล" onClose={() => setEditingDiv(null)}
          initialValues={{ date: editingDiv.date, amount: editingDiv.amount }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
          ]}
          onSave={(v) => { onUpdateDividend(accountId, h.id, editingDiv.id, { date: v.date, amount: Number(v.amount) || 0 }); setEditingDiv(null); }}
        />
      )}
    </div>
  );
}

function SavingsTab({ accounts, contributions, onAdd, onRemove, onUpdate }) {
  const [amount, setAmount] = useState(10000);
  const [source, setSource] = useState('pharmacy');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [usdAmount, setUsdAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState(null); // contribution being edited
  const destAccount = accounts.find((a) => a.id === accountId);
  const isDime = destAccount && destAccount.category === 'dime';
  function submit() { if (!accountId) return; onAdd({ date, amount, source, accountId, usdAmount: isDime && usdAmount ? Number(usdAmount) : undefined }); setUsdAmount(0); }
  const thisMonthTotal = useMemo(() => { const ym = new Date().toISOString().slice(0, 7); return contributions.filter((c) => c.date.startsWith(ym)).reduce((s, c) => s + Number(c.amount || 0), 0); }, [contributions]);
  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เงินเข้าเดือนนี้รวม</p><p className="text-2xl mb-3">฿{fmt(thisMonthTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>วันที่</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
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
        return <Card key={c.id}><div className="flex justify-between items-center"><div><p className="text-sm">{src?.label || c.source} → {acc?.name || 'ไม่ทราบบัญชี'}</p><p className="text-xs" style={{ color: SLATE }}>{c.date}{c.usdAmount ? ` · ${c.usdAmount} USD` : ''}</p></div><div className="flex items-center gap-3"><span className="text-sm">฿{fmt(c.amount)}</span><EditButton onClick={() => setEditing(c)} /><button onClick={() => onRemove(c.id)}><Trash2 size={14} color={BAD} /></button></div></div></Card>;
      })}
      {editing && (
        <EditModal title="แก้ไขเงินเข้า" onClose={() => setEditing(null)}
          initialValues={{ date: editing.date, amount: editing.amount, source: editing.source, accountId: editing.accountId }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'source', label: 'แหล่งที่มา', type: 'select', options: SOURCES.map((s) => ({ value: s.id, label: s.label })) },
            { key: 'accountId', label: 'บัญชีปลายทาง', type: 'select', options: accounts.map((a) => ({ value: a.id, label: a.name })) },
          ]}
          onSave={(v) => { onUpdate(editing.id, { date: v.date, amount: Number(v.amount) || 0, source: v.source, accountId: v.accountId }); setEditing(null); }}
        />
      )}
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
  }function ExpensesTab({ expenses, categories, onAdd, onRemove, onUpdate, onAddCategory }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(categories[0] || 'อื่นๆ');
  const [note, setNote] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);

  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceDraft, setVoiceDraft] = useState(null); // { amount, category, note }
  const recogRef = useRef(null);

  const receiptFileRef = useRef(null);
  const [receiptScanning, setReceiptScanning] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [receiptDraft, setReceiptDraft] = useState(null); // array of {item, amount, category}

  const today = new Date().toISOString().slice(0, 10);

  function submitManual() {
    if (!amount) return;
    onAdd({ date: today, amount, category, note });
    setAmount(0); setNote('');
  }
  function confirmNewCategory() {
    if (newCatInput.trim()) { onAddCategory(newCatInput.trim()); setCategory(newCatInput.trim()); }
    setNewCatInput(''); setShowNewCat(false);
  }

  function startVoice() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { setVoiceError('เบราว์เซอร์นี้ไม่รองรับการพูดบันทึก ลองใช้ Chrome บน Android'); return; }
    setVoiceError(''); setVoiceDraft(null);
    const rec = new SpeechRec();
    rec.lang = 'th-TH';
    rec.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      try {
        const parsed = await parseExpenseText(transcript, categories);
        setVoiceDraft({ amount: Number(parsed.amount) || 0, category: categories.includes(parsed.category) ? parsed.category : 'อื่นๆ', note: parsed.note || transcript });
      } catch (err) { setVoiceError('แปลงข้อความไม่สำเร็จ: ' + err.message); }
    };
    rec.onerror = () => { setListening(false); setVoiceError('ฟังเสียงไม่สำเร็จ ลองใหม่อีกครั้ง'); };
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    setListening(true);
    rec.start();
  }
  function confirmVoice() { onAdd({ date: today, amount: voiceDraft.amount, category: voiceDraft.category, note: voiceDraft.note }); setVoiceDraft(null); }

  async function handleReceiptFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setReceiptScanning(true); setReceiptError(''); setReceiptDraft(null);
    try {
      const items = await scanReceiptItems(file);
      setReceiptDraft(items.map((it) => ({ item: it.item || 'รายการ', amount: Number(it.amount) || 0, category: categories[0] || 'อื่นๆ' })));
    } catch (err) { setReceiptError('อ่านใบเสร็จไม่สำเร็จ: ' + err.message); }
    finally { setReceiptScanning(false); if (receiptFileRef.current) receiptFileRef.current.value = ''; }
  }
  function updateReceiptRow(idx, patch) { setReceiptDraft(receiptDraft.map((r, i) => (i === idx ? { ...r, ...patch } : r))); }
  function removeReceiptRow(idx) { setReceiptDraft(receiptDraft.filter((_, i) => i !== idx)); }
  function confirmReceipt() {
    receiptDraft.forEach((r) => onAdd({ date: today, amount: r.amount, category: r.category, note: r.item }));
    setReceiptDraft(null);
  }

  const todayTotal = useMemo(() => expenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount || 0), 0), [expenses, today]);
  const [periodType, setPeriodType] = useState('month');
  const keyFn2 = periodType === 'month' ? monthKey : yearKey;
  const periods2 = useMemo(() => Array.from(new Set(expenses.map((e) => keyFn2(e.date)))).sort().reverse(), [expenses, periodType]);
  const [selPeriod2, setSelPeriod2] = useState('');
  useEffect(() => { setSelPeriod2(periods2[0] || ''); }, [periodType, periods2.length]);
  const periodExpenses = useMemo(() => expenses.filter((e) => keyFn2(e.date) === selPeriod2), [expenses, selPeriod2, periodType]);
  const periodExpenseTotal = periodExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const byCategory = useMemo(() => {
    const map = {};
    periodExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); });
    return Object.entries(map).map(([cat, value]) => ({ cat, value, pct: periodExpenseTotal ? (value / periodExpenseTotal) * 100 : 0 })).sort((a, b) => b.value - a.value);
  }, [periodExpenses, periodExpenseTotal]);

  return (
    <div className="px-5 pt-5">
      <div className="relative mb-4">
        <Search size={15} color={SLATE} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={listSearch} onChange={(e) => setListSearch(e.target.value)} placeholder="ค้นหารายจ่าย (โน้ต/หมวดหมู่)..." style={{ border: '1px solid #E7E0CE' }} className="rounded-lg pl-9 pr-3 py-2.5 text-sm w-full" />
      </div>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>รายจ่ายวันนี้</p>
        <p className="text-2xl mb-3">฿{fmt(todayTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน</label>
        <NumInput value={amount} onChange={setAmount} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>หมวดหมู่</label>
        {!showNewCat ? (
          <div className="flex gap-2 mt-1 mb-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm flex-1">{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <button onClick={() => setShowNewCat(true)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 text-xs" >+ หมวดใหม่</button>
          </div>
        ) : (
          <div className="flex gap-2 mt-1 mb-3">
            <input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder="ชื่อหมวดใหม่" style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm flex-1" />
            <button onClick={confirmNewCategory} style={{ background: INK }} className="text-white rounded-lg px-3 text-xs">เพิ่ม</button>
          </div>
        )}
        <label className="text-xs" style={{ color: SLATE }}>โน้ต (ไม่บังคับ)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ค่าข้าวเที่ยง" style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <button onClick={submitManual} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm mb-2">บันทึกรายจ่าย</button>

        {voiceDraft ? (
          <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
            <p className="text-xs mb-2" style={{ color: SLATE }}>ได้ยินว่า: ฿{fmt(voiceDraft.amount)} · {voiceDraft.category} · {voiceDraft.note}</p>
            <div className="flex gap-2">
              <button onClick={confirmVoice} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันบันทึก</button>
              <button onClick={() => setVoiceDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
            </div>
          </div>
        ) : (
          <button onClick={startVoice} disabled={listening} className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm mb-2" style={{ border: '1px solid #E7E0CE', color: listening ? SLATE : BAD }}>
            <Mic size={14} className={listening ? 'animate-pulse' : ''} /> {listening ? 'กำลังฟัง... พูดได้เลย' : 'พูดบันทึกรายจ่าย'}
          </button>
        )}
        {voiceError && <p className="text-xs mb-2" style={{ color: BAD }}>{voiceError}</p>}

        {receiptDraft ? (
          <div style={{ background: PAPER_DIM }} className="rounded-lg p-2">
            <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {receiptDraft.length} รายการในใบเสร็จ — เลือกหมวดหมู่แล้วยืนยัน</p>
            {receiptDraft.map((r, idx) => (
              <div key={idx} style={{ background: 'white' }} className="rounded-lg p-2 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <input value={r.item} onChange={(e) => updateReceiptRow(idx, { item: e.target.value })} className="text-xs flex-1 outline-none rounded px-2 py-1" style={{ border: '1px solid #E7E0CE' }} />
                  <button onClick={() => removeReceiptRow(idx)}><Trash2 size={12} color={BAD} /></button>
                </div>
                <div className="flex gap-2">
                  <NumInput value={r.amount} onChange={(v) => updateReceiptRow(idx, { amount: v })} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE' }} />
                  <select value={r.category} onChange={(e) => updateReceiptRow(idx, { category: e.target.value })} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7E0CE' }}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={confirmReceipt} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันเพิ่มทั้งหมด</button>
              <button onClick={() => setReceiptDraft(null)} style={{ border: '1px solid #E7E0CE' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptFile} className="hidden" />
            <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm" style={{ border: '1px solid #E7E0CE', color: BRASS }}>
              {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {receiptScanning ? 'กำลังอ่านใบเสร็จ...' : 'สแกนใบเสร็จ'}
            </button>
            {receiptError && <p className="text-xs mt-2" style={{ color: BAD }}>{receiptError}</p>}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPeriodType('month')} style={{ background: periodType === 'month' ? INK : PAPER_DIM, color: periodType === 'month' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายเดือน</button>
          <button onClick={() => setPeriodType('year')} style={{ background: periodType === 'year' ? INK : PAPER_DIM, color: periodType === 'year' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายปี</button>
        </div>
        {periods2.length > 0 ? <select value={selPeriod2} onChange={(e) => setSelPeriod2(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mb-3">{periods2.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลรายจ่าย</p>}
        {selPeriod2 && (
          <>
            <p className="text-xl mb-3">รวม ฿{fmt(periodExpenseTotal)}</p>
            {byCategory.map((c) => (
              <div key={c.cat} className="mb-2">
                <div className="flex justify-between text-sm mb-1"><span>{c.cat}</span><span>฿{fmt(c.value)} ({c.pct.toFixed(0)}%)</span></div>
                <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden"><div style={{ width: `${c.pct}%`, background: BAD }} className="h-full rounded-full" /></div>
              </div>
            ))}
          </>
        )}
      </Card>

      <p className="text-xs mb-2" style={{ color: SLATE }}>รายการล่าสุด</p>
      {expenses.filter((e) => !listSearch.trim() || (e.category || '').toLowerCase().includes(listSearch.trim().toLowerCase()) || (e.note || '').toLowerCase().includes(listSearch.trim().toLowerCase())).slice(0, 30).map((e) => (
        <Card key={e.id}>
          <div className="flex justify-between items-center">
            <div><p className="text-sm">{e.category}{e.note ? ` · ${e.note}` : ''}</p><p className="text-xs" style={{ color: SLATE }}>{e.date}</p></div>
            <div className="flex items-center gap-3"><span className="text-sm">฿{fmt(e.amount)}</span><EditButton onClick={() => setEditingExpense(e)} /><button onClick={() => onRemove(e.id)}><Trash2 size={14} color={BAD} /></button></div>
          </div>
        </Card>
      ))}
      {editingExpense && (
        <EditModal title="แก้ไขรายจ่าย" onClose={() => setEditingExpense(null)}
          initialValues={{ date: editingExpense.date, amount: editingExpense.amount, category: editingExpense.category, note: editingExpense.note || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'category', label: 'หมวดหมู่', type: 'select', options: categories },
            { key: 'note', label: 'โน้ต', type: 'text' },
          ]}
          onSave={(v) => { onUpdate(editingExpense.id, { date: v.date, amount: Number(v.amount) || 0, category: v.category, note: v.note }); setEditingExpense(null); }}
        />
      )}
    </div>
  );
}

function ReportsTab({ contributions, accounts, costBasisByAccount, history }) {
  const symbolRollup = useMemo(() => {
    const map = {};
    accounts.forEach((a) => (a.holdings || []).forEach((h) => {
      if (!h.symbol) return;
      const key = h.symbol.toUpperCase();
      if (!map[key]) map[key] = { symbol: key, shares: 0, value: 0, cost: 0, accountNames: [] };
      map[key].shares += Number(h.shares || 0);
      map[key].value += holdingMarketValueTHB(h);
      map[key].cost += holdingCostBasisTHB(h);
      map[key].accountNames.push(a.name);
    }));
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [accounts]);
  const duplicateSymbols = symbolRollup.filter((r) => r.accountNames.length > 1);
  const allSells = useMemo(() => {
    const list = [];
    accounts.forEach((a) => (a.holdings || []).forEach((h) => (h.sells || []).forEach((s) => list.push({ ...s, symbol: h.symbol }))));
    return list;
  }, [accounts]);
  const totalRealizedAllTime = allSells.reduce((s, x) => s + Number(x.gain || 0), 0);

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
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปหุ้นซ้ำข้ามบัญชี</p>
        {duplicateSymbols.length > 0 ? duplicateSymbols.map((r) => (
          <div key={r.symbol} className="mb-3">
            <div className="flex justify-between text-sm"><span className="font-semibold">{r.symbol}</span><span>฿{fmt(r.value)}</span></div>
            <p className="text-xs" style={{ color: SLATE }}>รวม {r.shares.toFixed(4)} หุ้น จาก {r.accountNames.length} บัญชี: {r.accountNames.join(', ')}</p>
          </div>
        )) : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีหุ้นตัวเดียวกันซ้ำกันข้ามบัญชี</p>}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>กำไร/ขาดทุนที่รับรู้แล้วจากการขาย (สะสมทั้งหมด)</p>
        <p className="text-xl mb-3" style={{ color: totalRealizedAllTime >= 0 ? GOOD : BAD }}>{totalRealizedAllTime >= 0 ? '+' : ''}฿{fmt(totalRealizedAllTime)}</p>
        {allSells.slice(0, 10).map((s) => (
          <div key={s.id} className="flex justify-between text-xs mb-2"><span>{s.date} · {s.symbol}</span><span style={{ color: s.gain >= 0 ? GOOD : BAD }}>{s.gain >= 0 ? '+' : ''}฿{fmt(s.gain)}</span></div>
        ))}
        {allSells.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีประวัติการขาย</p>}
      </Card>
    </div>
  );
}

function ageString(birthdate) {
  if (!birthdate) return '-';
  const bd = new Date(birthdate); const now = new Date();
  let years = now.getFullYear() - bd.getFullYear();
  let months = now.getMonth() - bd.getMonth();
  if (now.getDate() < bd.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  if (years < 0) return '-';
  return `${years} ปี ${months} เดือน`;
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
function computeDogInsights(dog) {
  const insights = [];
  const weights = [...(dog.weights || [])].sort((a, b) => b.date.localeCompare(a.date));
  if (weights.length >= 2) {
    const latest = Number(weights[0].weight); const prev = Number(weights[1].weight);
    if (prev > 0) {
      const pct = ((latest - prev) / prev) * 100;
      if (pct >= 10) insights.push({ tone: 'warn', text: `น้ำหนักเพิ่มขึ้น ${pct.toFixed(1)}% จากครั้งก่อน — น้ำหนักเพิ่มผิดปกติ` });
      else if (pct <= -10) insights.push({ tone: 'warn', text: `น้ำหนักลดลง ${Math.abs(pct).toFixed(1)}% จากครั้งก่อน — น้ำหนักลดผิดปกติ` });
    }
  }
  const ft = dog.fleaTick || {};
  if (ft.lastGivenDate && ft.intervalDays) {
    const due = new Date(ft.lastGivenDate); due.setDate(due.getDate() + Number(ft.intervalDays || 84));
    const d = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
    if (d <= 7) insights.push({ tone: d < 0 ? 'warn' : 'info', text: d < 0 ? `ยาเห็บหมัดเลยกำหนดมา ${Math.abs(d)} วันแล้ว` : `ยาเห็บหมัดครบกำหนดในอีก ${d} วัน` });
  }
  (dog.appointments || []).forEach((a) => {
    const d = daysUntil(a.date);
    if (d !== null && d >= 0 && d <= 7) insights.push({ tone: 'info', text: `นัดหมายที่ ${a.hospital || '-'} อีก ${d} วัน` });
  });
  if (dog.insurance && dog.insurance.endDate) {
    const d = daysUntil(dog.insurance.endDate);
    if (d !== null && d >= 0 && d <= 30) insights.push({ tone: 'warn', text: `ประกันจะหมดอายุในอีก ${d} วัน` });
  }
  const activeMeds = (dog.medications || []).filter((m) => !m.stopDate);
  if (activeMeds.length > 0) insights.push({ tone: 'info', text: `กำลังใช้ยาอยู่ ${activeMeds.length} รายการ: ${activeMeds.map((m) => m.name).join(', ')}` });
  if (insights.length === 0) insights.push({ tone: 'good', text: 'ไม่มีรายการที่ต้องระวังตอนนี้' });
  return insights;
}

function PetsTab({ dogs, onUpdateDog, onAddWeight, onRemoveWeight, onUpdateWeight, onAddMedication, onUpdateMedication, onLogFleaTick, onUpdateFleaTickInfo, onUpdateInsurance, onAddInsuranceClaim, onUpdateInsuranceClaim, onAddAppointment, onRemoveAppointment, onUpdateAppointment, onAddBloodTest, onUpdateBloodTest, onAddOrganExam, onUpdateOrganExam, onAddImaging, onUpdateImaging, onAddDogExpense, onRemoveDogExpense, onUpdateDogExpense, googleConnected, onAddToCalendar, hospitalList, onAddHospital }) {
  const [selectedId, setSelectedId] = useState(dogs[0]?.id || '');
  const [section, setSection] = useState('overview');
  const dog = dogs.find((d) => d.id === selectedId) || dogs[0];

  const sections = [
    { id: 'overview', label: 'ภาพรวม' },
    { id: 'profile', label: 'ข้อมูลส่วนตัว' },
    { id: 'weight', label: 'น้ำหนัก' },
    { id: 'meds', label: 'ยา' },
    { id: 'flea', label: 'เห็บหมัด' },
    { id: 'insurance', label: 'ประกัน' },
    { id: 'appt', label: 'นัดหมาย' },
    { id: 'records', label: 'เวชระเบียน' },
    { id: 'expenses', label: 'ค่าใช้จ่าย' },
    { id: 'allreport', label: 'รายงานรวม 8 ตัว' },
  ];

  return (
    <div className="px-5 pt-5">
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {dogs.map((d) => (
          <button key={d.id} onClick={() => setSelectedId(d.id)} style={{ background: selectedId === d.id ? INK : PAPER_DIM, color: selectedId === d.id ? 'white' : INK, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs whitespace-nowrap">{d.name}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {sections.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? BRASS : PAPER_DIM, color: section === s.id ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1 text-[11px] whitespace-nowrap">{s.label}</button>
        ))}
      </div>

      {section === 'allreport' ? (
        <AllDogsReportSection dogs={dogs} />
      ) : dog && (
        <>
          {section === 'overview' && <DogOverviewSection dog={dog} />}
          {section === 'profile' && <DogProfileSection dog={dog} onUpdateDog={onUpdateDog} />}
          {section === 'weight' && <DogWeightSection dog={dog} onAddWeight={onAddWeight} onRemoveWeight={onRemoveWeight} onUpdateWeight={onUpdateWeight} />}
          {section === 'meds' && <DogMedicationSection dog={dog} onAddMedication={onAddMedication} onUpdateMedication={onUpdateMedication} />}
          {section === 'flea' && <DogFleaTickSection dog={dog} onLogFleaTick={onLogFleaTick} onUpdateFleaTickInfo={onUpdateFleaTickInfo} />}
          {section === 'insurance' && <DogInsuranceSection dog={dog} onUpdateInsurance={onUpdateInsurance} onAddInsuranceClaim={onAddInsuranceClaim} onUpdateInsuranceClaim={onUpdateInsuranceClaim} />}
          {section === 'appt' && <DogAppointmentsSection dog={dog} onAddAppointment={onAddAppointment} onRemoveAppointment={onRemoveAppointment} onUpdateAppointment={onUpdateAppointment} googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} hospitalList={hospitalList} onAddHospital={onAddHospital} />}
          {section === 'records' && <DogMedicalRecordsSection dog={dog} onAddBloodTest={onAddBloodTest} onUpdateBloodTest={onUpdateBloodTest} onAddOrganExam={onAddOrganExam} onUpdateOrganExam={onUpdateOrganExam} onAddImaging={onAddImaging} onUpdateImaging={onUpdateImaging} />}
          {section === 'expenses' && <DogExpensesSection dog={dog} onAddDogExpense={onAddDogExpense} onRemoveDogExpense={onRemoveDogExpense} onUpdateDogExpense={onUpdateDogExpense} hospitalList={hospitalList} onAddHospital={onAddHospital} />}
        </>
      )}
    </div>
  );
}

function DogOverviewSection({ dog }) {
  const latestWeight = [...(dog.weights || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const thisYear = new Date().getFullYear();
  const expensesThisYear = (dog.expenses || []).filter((e) => e.date.startsWith(String(thisYear))).reduce((s, e) => s + Number(e.amount || 0), 0);
  const expensesLifetime = (dog.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const activeMeds = (dog.medications || []).filter((m) => !m.stopDate);
  const nextAppt = [...(dog.appointments || [])].filter((a) => daysUntil(a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  const ft = dog.fleaTick || {};
  const nextFleaDue = ft.lastGivenDate ? (() => { const d = new Date(ft.lastGivenDate); d.setDate(d.getDate() + Number(ft.intervalDays || 84)); return d.toISOString().slice(0, 10); })() : null;
  const insights = computeDogInsights(dog);

  return (
    <div>
      <Card>
        <p className="text-lg font-semibold mb-1">{dog.name}{dog.nickname && ` (${dog.nickname})`}</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="อายุ" value={ageString(dog.birthdate)} />
          <StatBox label="น้ำหนักล่าสุด" value={latestWeight ? `${latestWeight.weight} กก.` : '-'} />
          <StatBox label="BCS" value={dog.bcs || '-'} />
          <StatBox label="เพศ/สี" value={`${dog.sex || '-'} / ${dog.color || '-'}`} />
        </div>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>สรุปสำคัญ</p>
        <p className="text-sm mb-1">โรคประจำตัว: {dog.chronicDiseases || 'ไม่มี'}</p>
        <p className="text-sm mb-1">แพ้ยา: {dog.drugAllergies || 'ไม่มี'}</p>
        <p className="text-sm mb-1">ยาที่กำลังกิน: {activeMeds.length > 0 ? activeMeds.map((m) => m.name).join(', ') : 'ไม่มี'}</p>
        <p className="text-sm mb-1">นัดถัดไป: {nextAppt ? `${nextAppt.date} · ${nextAppt.hospital || '-'}` : 'ไม่มี'}</p>
        <p className="text-sm mb-1">ยาเห็บหมัดครั้งถัดไป: {nextFleaDue || 'ยังไม่ได้ตั้งค่า'}</p>
        <p className="text-sm">ประกันหมดอายุ: {dog.insurance?.endDate || 'ไม่มี'}</p>
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ประวัติการตรวจสุขภาพ</p>
        {(() => {
          const bloodTests = dog.bloodTests || [];
          const organExams = dog.organExams || [];
          const imaging = dog.imaging || [];
          const latestOf = (list) => [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
          const rows = [
            { label: 'เจาะเลือด', item: latestOf(bloodTests) },
            { label: 'ตรวจตา', item: latestOf(organExams.filter((o) => o.organ === 'ตา')) },
            { label: 'CT', item: latestOf(imaging.filter((im) => im.type === 'CT')) },
            { label: 'MRI', item: latestOf(imaging.filter((im) => im.type === 'MRI')) },
            { label: 'Ultrasound', item: latestOf(imaging.filter((im) => im.type === 'Ultrasound')) },
          ];
          return rows.map((r) => (
            <div key={r.label} className="mb-2 pb-2" style={{ borderBottom: '1px solid #F0EBDD' }}>
              <div className="flex justify-between text-sm"><span className="font-semibold">{r.label}</span><span style={{ color: r.item ? INK : SLATE }}>{r.item ? r.item.date : 'ยังไม่เคยตรวจ'}</span></div>
              {r.item && r.item.note && <p className="text-xs mt-0.5" style={{ color: SLATE }}>{r.item.note}</p>}
            </div>
          ));
        })()}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ค่าใช้จ่าย</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="ปีนี้" value={`฿${fmt(expensesThisYear)}`} />
          <StatBox label="ตลอดชีวิต" value={`฿${fmt(expensesLifetime)}`} />
        </div>
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ข้อสังเกต/แจ้งเตือน</p>
        {insights.map((it, i) => <InsightRow key={i} tone={it.tone} text={it.text} />)}
      </Card>
    </div>
  );
}

function DogProfileSection({ dog, onUpdateDog }) {
  const field = (label, key, type = 'text') => (
    <div className="mb-3">
      <label className="text-xs" style={{ color: SLATE }}>{label}</label>
      <input type={type} value={dog[key] || ''} onChange={(e) => onUpdateDog(dog.id, { [key]: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} />
    </div>
  );
  return (
    <Card>
      <div className="mb-3"><label className="text-xs" style={{ color: SLATE }}>ชื่อ</label><input value={dog.name} onChange={(e) => onUpdateDog(dog.id, { name: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1 font-semibold" style={{ border: '1px solid #E7E0CE' }} /></div>
      {field('ชื่อเล่น', 'nickname')}
      {field('วันเกิด', 'birthdate', 'date')}
      {field('เพศ', 'sex')}
      {field('สี', 'color')}
      {field('สายพันธุ์', 'breed')}
      {field('หมายเลขไมโครชิป', 'microchip')}
      {field('ผู้เพาะพันธุ์', 'breeder')}
      <div className="mb-3"><label className="text-xs" style={{ color: SLATE }}>BCS (Body Condition Score)</label><NumInput value={dog.bcs} onChange={(v) => onUpdateDog(dog.id, { bcs: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
      {field('นิสัย', 'personality')}
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>โรคประจำตัว</label><textarea value={dog.chronicDiseases || ''} onChange={(e) => onUpdateDog(dog.id, { chronicDiseases: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} rows={2} /></div>
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>การแพ้ยา</label><textarea value={dog.drugAllergies || ''} onChange={(e) => onUpdateDog(dog.id, { drugAllergies: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} rows={2} /></div>
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>หมายเหตุ</label><textarea value={dog.notes || ''} onChange={(e) => onUpdateDog(dog.id, { notes: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} rows={2} /></div>
    </Card>
  );
        }function DogWeightSection({ dog, onAddWeight, onRemoveWeight, onUpdateWeight }) {
  const [weight, setWeight] = useState(0);
  const [location, setLocation] = useState('');
  const [weigher, setWeigher] = useState('');
  const [note, setNote] = useState('');
  const [range, setRange] = useState(90);
  const [editingWeight, setEditingWeight] = useState(null);
  const scaleFileRef = useRef(null);
  const [scaleScanning, setScaleScanning] = useState(false);
  const [scaleError, setScaleError] = useState('');
  const weights = [...(dog.weights || [])].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = weights.filter((w) => range === 9999 || (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24) <= range).map((w) => ({ date: w.date.slice(5), weight: Number(w.weight) }));

  function submit() {
    if (!weight) return;
    onAddWeight(dog.id, { date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5), weight, location, weigher, note });
    setWeight(0); setNote('');
  }

  async function handleScalePhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScaleScanning(true); setScaleError('');
    try {
      const result = await scanWeightScale(file);
      const w = Number(result.weight);
      if (!w) { setScaleError('อ่านตัวเลขน้ำหนักจากภาพไม่สำเร็จ ลองภาพที่ชัดกว่านี้'); return; }
      onAddWeight(dog.id, { date: new Date().toISOString().slice(0, 10), time: new Date().toTimeString().slice(0, 5), weight: w, location, weigher, note: 'ถ่ายจากตาชั่ง' });
    } catch (err) { setScaleError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setScaleScanning(false); if (scaleFileRef.current) scaleFileRef.current.value = ''; }
  }

  return (
    <div>
      <Card>
        <input ref={scaleFileRef} type="file" accept="image/*" capture="environment" onChange={handleScalePhoto} className="hidden" />
        <button onClick={() => scaleFileRef.current && scaleFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {scaleScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{scaleScanning ? 'กำลังอ่านตาชั่ง...' : 'ถ่ายรูปตาชั่ง (บันทึกทันที)'}
        </button>
        {scaleError && <p className="text-xs mb-3" style={{ color: BAD }}>{scaleError}</p>}
        <label className="text-xs" style={{ color: SLATE }}>หรือกรอกน้ำหนักเอง (กก.)</label>
        <NumInput value={weight} onChange={setWeight} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <label className="text-xs" style={{ color: SLATE }}>สถานที่ชั่ง</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <label className="text-xs" style={{ color: SLATE }}>ผู้ชั่ง</label>
        <input value={weigher} onChange={(e) => setWeigher(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกน้ำหนัก</button>
      </Card>
      <Card>
        <div className="flex gap-1 mb-3">
          {[{ v: 90, l: '3 เดือน' }, { v: 180, l: '6 เดือน' }, { v: 365, l: '1 ปี' }, { v: 9999, l: 'ตลอดอายุ' }].map((r) => (
            <button key={r.v} onClick={() => setRange(r.v)} style={{ background: range === r.v ? INK : PAPER_DIM, color: range === r.v ? 'white' : INK }} className="rounded-full px-2 py-1 text-[10px]">{r.l}</button>
          ))}
        </div>
        {chartData.length >= 2 ? (
          <div style={{ width: '100%', height: 160 }}><ResponsiveContainer><LineChart data={chartData}><XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Tooltip /><Line type="monotone" dataKey="weight" stroke={BRASS} strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div>
        ) : <p className="text-xs" style={{ color: SLATE }}>ต้องมีอย่างน้อย 2 ครั้งถึงจะขึ้นกราฟ</p>}
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติ</p>
      {[...weights].reverse().map((w) => (
        <Card key={w.id}><div className="flex justify-between items-center"><div><p className="text-sm">{w.weight} กก. {w.location && `· ${w.location}`}</p><p className="text-xs" style={{ color: SLATE }}>{w.date} {w.time}</p></div><div className="flex items-center gap-2"><EditButton onClick={() => setEditingWeight(w)} /><button onClick={() => onRemoveWeight(dog.id, w.id)}><Trash2 size={14} color={BAD} /></button></div></div></Card>
      ))}
      {editingWeight && (
        <EditModal title="แก้ไขน้ำหนัก" onClose={() => setEditingWeight(null)}
          initialValues={{ date: editingWeight.date, weight: editingWeight.weight, location: editingWeight.location || '', weigher: editingWeight.weigher || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'weight', label: 'น้ำหนัก (กก.)', type: 'number' },
            { key: 'location', label: 'สถานที่ชั่ง', type: 'text' },
            { key: 'weigher', label: 'ผู้ชั่ง', type: 'text' },
          ]}
          onSave={(v) => { onUpdateWeight(dog.id, editingWeight.id, { date: v.date, weight: Number(v.weight) || 0, location: v.location, weigher: v.weigher }); setEditingWeight(null); }}
        />
      )}
    </div>
  );
}

function DogMedicationSection({ dog, onAddMedication, onUpdateMedication }) {
  const [form, setForm] = useState({ name: '', strength: '', form: '', dose: '', usage: '', timing: '', startDate: new Date().toISOString().slice(0, 10), startReason: '', hospital: '', doctor: '' });
  function submit() {
    if (!form.name) return;
    onAddMedication(dog.id, { ...form, stopDate: '', stopReason: '' });
    setForm({ name: '', strength: '', form: '', dose: '', usage: '', timing: '', startDate: new Date().toISOString().slice(0, 10), startReason: '', hospital: '', doctor: '' });
  }
  const meds = [...(dog.medications || [])].sort((a, b) => b.startDate.localeCompare(a.startDate));
  return (
    <div>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เพิ่มยาใหม่ (ปรับยา = เพิ่มรายการใหม่ ไม่ลบของเดิม)</p>
        {['name:ชื่อยา', 'strength:ความแรง', 'form:รูปแบบยา', 'dose:ขนาดยา/จำนวน', 'usage:วิธีใช้', 'timing:เวลาใช้ (ก่อน/หลังอาหาร)', 'startReason:เหตุผลที่เริ่ม', 'hospital:โรงพยาบาล', 'doctor:หมอผู้สั่ง'].map((f) => {
          const [k, l] = f.split(':');
          return <div key={k} className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>{l}</label><input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>;
        })}
        <div className="mb-3"><label className="text-[10px]" style={{ color: SLATE }}>วันที่เริ่ม</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกยา</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติยาทั้งหมด (ห้ามลบ)</p>
      {meds.map((m) => (
        <Card key={m.id}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">{m.name} {m.strength}</p>
              <p className="text-xs" style={{ color: SLATE }}>{m.dose} · {m.usage} · {m.timing}</p>
              <p className="text-xs" style={{ color: SLATE }}>เริ่ม {m.startDate}{m.stopDate ? ` · หยุด ${m.stopDate}` : ''}</p>
              {m.hospital && <p className="text-xs" style={{ color: SLATE }}>{m.hospital} · {m.doctor}</p>}
            </div>
            {!m.stopDate && <span className="text-[10px] rounded-full px-2 py-1" style={{ background: PAPER_DIM, color: GOOD }}>กำลังใช้</span>}
          </div>
          {!m.stopDate && (
            <button onClick={() => { const reason = prompt('เหตุผลที่หยุดยา (ไม่บังคับ)') || ''; onUpdateMedication(dog.id, m.id, { stopDate: new Date().toISOString().slice(0, 10), stopReason: reason }); }} className="text-[11px] mt-2" style={{ color: BAD }}>บันทึกหยุดยา</button>
          )}
        </Card>
      ))}
    </div>
  );
}

function DogFleaTickSection({ dog, onLogFleaTick, onUpdateFleaTickInfo }) {
  const ft = dog.fleaTick || {};
  const [doseGiven, setDoseGiven] = useState('');
  const [cost, setCost] = useState(0);
  const nextDue = ft.lastGivenDate ? (() => { const d = new Date(ft.lastGivenDate); d.setDate(d.getDate() + Number(ft.intervalDays || 84)); return d.toISOString().slice(0, 10); })() : null;
  const costPerDose = ft.tabletsPurchased > 0 ? (Number(ft.totalCost || 0) / Number(ft.tabletsPurchased)) : 0;

  function submit() {
    onLogFleaTick(dog.id, { date: new Date().toISOString().slice(0, 10), doseGiven, cost });
    setDoseGiven(''); setCost(0);
  }

  return (
    <div>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ข้อมูลผลิตภัณฑ์</p>
        <label className="text-[10px]" style={{ color: SLATE }}>ชื่อผลิตภัณฑ์ (เช่น Bravecto)</label>
        <input value={ft.productName || ''} onChange={(e) => onUpdateFleaTickInfo(dog.id, { productName: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7E0CE' }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ขนาดเม็ดยา (mg)</label><NumInput value={ft.tabletMg} onChange={(v) => onUpdateFleaTickInfo(dog.id, { tabletMg: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนเม็ดที่ซื้อ</label><NumInput value={ft.tabletsPurchased} onChange={(v) => onUpdateFleaTickInfo(dog.id, { tabletsPurchased: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ราคารวมที่ซื้อ (บาท)</label><NumInput value={ft.totalCost} onChange={(v) => onUpdateFleaTickInfo(dog.id, { totalCost: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ระยะห่างรอบถัดไป (วัน)</label><NumInput value={ft.intervalDays || 84} onChange={(v) => onUpdateFleaTickInfo(dog.id, { intervalDays: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        </div>
        {costPerDose > 0 && <p className="text-xs mb-2" style={{ color: SLATE }}>ต้นทุนต่อครั้ง ≈ ฿{fmt(costPerDose)}</p>}
        <p className="text-[10px]" style={{ color: WARN }}>⚠️ หากแบ่งเม็ดยาเอง ควรเป็นไปตามคำแนะนำของสัตวแพทย์และข้อมูลผู้ผลิตเท่านั้น ยาบางชนิดไม่เหมาะกับการแบ่งเม็ด ระบบนี้ไม่ได้คำนวณขนาดยาที่ถูกต้องให้ กรุณาให้ตามที่สัตวแพทย์สั่งเท่านั้น</p>
      </Card>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>ให้ยาล่าสุด: {ft.lastGivenDate || 'ยังไม่เคยบันทึก'}</p>
        <p className="text-xs mb-3" style={{ color: nextDue && daysUntil(nextDue) < 0 ? BAD : GOOD }}>ครั้งถัดไป: {nextDue || '-'}</p>
        <label className="text-[10px]" style={{ color: SLATE }}>ให้ไปเท่าไหร่ (เช่น 1 เม็ด)</label>
        <input value={doseGiven} onChange={(e) => setDoseGiven(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7E0CE' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>ค่าใช้จ่ายครั้งนี้ (ไม่บังคับ)</label>
        <NumInput value={cost} onChange={setCost} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกให้ยาวันนี้</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติ</p>
      {(dog.fleaTickHistory || []).map((h) => <Card key={h.id}><div className="flex justify-between text-sm"><span>{h.date} · {h.doseGiven}</span><span>{h.cost ? `฿${fmt(h.cost)}` : ''}</span></div></Card>)}
    </div>
  );
}

function DogInsuranceSection({ dog, onUpdateInsurance, onAddInsuranceClaim, onUpdateInsuranceClaim }) {
  const ins = dog.insurance || {};
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimReason, setClaimReason] = useState('');
  const [editingClaim, setEditingClaim] = useState(null);
  const totalClaimed = (ins.claims || []).reduce((s, c) => s + Number(c.amount || 0), 0);
  function submitClaim() {
    if (!claimAmount) return;
    onAddInsuranceClaim(dog.id, { date: new Date().toISOString().slice(0, 10), amount: claimAmount, reason: claimReason });
    setClaimAmount(0); setClaimReason('');
  }
  return (
    <div>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ข้อมูลกรมธรรม์</p>
        {['company:บริษัทประกัน', 'policyNumber:เลขกรมธรรม์'].map((f) => { const [k, l] = f.split(':'); return <div key={k} className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>{l}</label><input value={ins[k] || ''} onChange={(e) => onUpdateInsurance(dog.id, { [k]: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>; })}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันเริ่ม</label><input type="date" value={ins.startDate || ''} onChange={(e) => onUpdateInsurance(dog.id, { startDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันหมดอายุ</label><input type="date" value={ins.endDate || ''} onChange={(e) => onUpdateInsurance(dog.id, { endDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ค่าเบี้ย</label><NumInput value={ins.premium} onChange={(v) => onUpdateInsurance(dog.id, { premium: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วงเงิน OPD</label><NumInput value={ins.opdLimit} onChange={(v) => onUpdateInsurance(dog.id, { opdLimit: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วงเงิน IPD</label><NumInput value={ins.ipdLimit} onChange={(v) => onUpdateInsurance(dog.id, { ipdLimit: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        </div>
        <p className="text-xs" style={{ color: SLATE }}>ใช้สิทธิ์ไปแล้ว ฿{fmt(totalClaimed)}</p>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>บันทึกการเคลม</p>
        <NumInput value={claimAmount} onChange={setClaimAmount} placeholder="จำนวนเงิน" className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7E0CE' }} />
        <input value={claimReason} onChange={(e) => setClaimReason(e.target.value)} placeholder="เหตุผล/อาการ" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <button onClick={submitClaim} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกเคลม</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติการเคลม</p>
      {(ins.claims || []).map((c) => <Card key={c.id}><div className="flex justify-between items-center text-sm"><span>{c.date} · {c.reason}</span><div className="flex items-center gap-2"><span>฿{fmt(c.amount)}</span><EditButton onClick={() => setEditingClaim(c)} /></div></div></Card>)}
      {editingClaim && (
        <EditModal title="แก้ไขการเคลม" onClose={() => setEditingClaim(null)}
          initialValues={{ date: editingClaim.date, amount: editingClaim.amount, reason: editingClaim.reason || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'reason', label: 'เหตุผล/อาการ', type: 'text' },
          ]}
          onSave={(v) => { onUpdateInsuranceClaim(dog.id, editingClaim.id, { date: v.date, amount: Number(v.amount) || 0, reason: v.reason }); setEditingClaim(null); }}
        />
      )}
    </div>
  );
}

function DogAppointmentsSection({ dog, onAddAppointment, onRemoveAppointment, onUpdateAppointment, googleConnected, onAddToCalendar, hospitalList, onAddHospital }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), time: '', hospital: '', doctor: '', purpose: '', reminderDays: [7, 3, 1] });
  const [syncingId, setSyncingId] = useState(null);
  const [syncResult, setSyncResult] = useState({});
  const [editingAppt, setEditingAppt] = useState(null);
  const list = hospitalList || [];
  function submit() {
    if (!form.date) return;
    onAddAppointment(dog.id, form);
    setForm({ date: new Date().toISOString().slice(0, 10), time: '', hospital: '', doctor: '', purpose: '', reminderDays: [7, 3, 1] });
  }
  function toggleReminderDay(d) {
    const cur = form.reminderDays || [];
    setForm({ ...form, reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => b - a) });
  }
  async function syncToCalendar(a) {
    setSyncingId(a.id);
    const result = await onAddToCalendar(dog.name, a);
    setSyncResult({ ...syncResult, [a.id]: result });
    setSyncingId(null);
  }
  const appts = [...(dog.appointments || [])].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      {!googleConnected && <Card><p className="text-xs" style={{ color: SLATE }}>ยังไม่ได้เชื่อมต่อ Google Calendar — ไปที่ไอคอนตั้งค่า ⚙️ ที่หน้าภาพรวมเพื่อเชื่อมต่อก่อน จะได้กดเพิ่มนัดลงปฏิทินได้</p></Card>}
      <Card>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>เวลา</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }} /></div>
        </div>
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label>
        <select value={list.includes(form.hospital) ? form.hospital : (form.hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') { setForm({ ...form, hospital: '' }); } else { setForm({ ...form, hospital: e.target.value }); } }} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7E0CE' }}>
          <option value="">— เลือกโรงพยาบาล —</option>
          {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ เพิ่มโรงพยาบาลใหม่</option>
        </select>
        {(!list.includes(form.hospital)) && (
          <div className="flex gap-2 mt-1 mb-2">
            <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} placeholder="พิมพ์ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7E0CE' }} />
            <button type="button" onClick={() => { if (form.hospital) onAddHospital(form.hospital); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7E0CE', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
        {list.includes(form.hospital) && <div className="mb-2" />}
        <label className="text-[10px]" style={{ color: SLATE }}>วัตถุประสงค์</label>
        <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>เตือนล่วงหน้ากี่วัน (เลือกได้หลายอัน)</label>
        <div className="flex gap-2 mt-1 mb-3">
          {[1, 2, 3, 7].map((d) => (
            <button key={d} type="button" onClick={() => toggleReminderDay(d)} style={{ background: (form.reminderDays || []).includes(d) ? BRASS : PAPER_DIM, color: (form.reminderDays || []).includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1.5 text-xs">{d} วัน</button>
          ))}
        </div>
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">เพิ่มนัดหมาย</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>นัดหมายทั้งหมด</p>
      {appts.map((a) => {
        const d = daysUntil(a.date);
        const result = syncResult[a.id];
        return (
          <Card key={a.id}>
            <div className="flex justify-between items-center">
              <div><p className="text-sm">{a.hospital} · {a.purpose}</p><p className="text-xs" style={{ color: d < 0 ? SLATE : GOOD }}>{a.date} {a.time} {d >= 0 && `(อีก ${d} วัน)`}</p></div>
              <div className="flex items-center gap-2"><EditButton onClick={() => setEditingAppt(a)} /><button onClick={() => onRemoveAppointment(dog.id, a.id)}><Trash2 size={14} color={BAD} /></button></div>
            </div>
            {googleConnected && (
              <button onClick={() => syncToCalendar(a)} disabled={syncingId === a.id} className="flex items-center gap-1 text-[11px] mt-2" style={{ color: BRASS }}>
                {syncingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />} เพิ่มลง Google Calendar
              </button>
            )}
            {result && (result.ok ? <p className="text-[11px] mt-1" style={{ color: GOOD }}>เพิ่มลงปฏิทินสำเร็จ ✓</p> : <p className="text-[11px] mt-1" style={{ color: BAD }}>ไม่สำเร็จ: {result.message}</p>)}
          </Card>
        );
      })}
      {editingAppt && (
        <EditModal title="แก้ไขนัดหมาย" onClose={() => setEditingAppt(null)}
          initialValues={{ date: editingAppt.date, time: editingAppt.time || '', hospital: editingAppt.hospital || '', doctor: editingAppt.doctor || '', purpose: editingAppt.purpose || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'time', label: 'เวลา', type: 'time' },
            { key: 'hospital', label: 'โรงพยาบาล', type: 'select', options: list },
            { key: 'doctor', label: 'หมอ', type: 'text' },
            { key: 'purpose', label: 'วัตถุประสงค์', type: 'text' },
          ]}
          onSave={(v) => { onUpdateAppointment(dog.id, editingAppt.id, v); setEditingAppt(null); }}
        />
      )}
    </div>
  );
}

function DogMedicalRecordsSection({ dog, onAddBloodTest, onUpdateBloodTest, onAddOrganExam, onUpdateOrganExam, onAddImaging, onUpdateImaging }) {
  const [subTab, setSubTab] = useState('blood');
  const [bt, setBt] = useState({ type: BLOOD_TEST_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '' });
  const [oe, setOe] = useState({ organ: ORGAN_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '' });
  const [im, setIm] = useState({ type: IMAGING_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '' });
  const [editingBt, setEditingBt] = useState(null);
  const [editingOe, setEditingOe] = useState(null);
  const [editingIm, setEditingIm] = useState(null);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[{ id: 'blood', l: 'ตรวจเลือด' }, { id: 'organ', l: 'อวัยวะ' }, { id: 'imaging', l: 'Imaging' }].map((s) => (
          <button key={s.id} onClick={() => setSubTab(s.id)} style={{ background: subTab === s.id ? INK : PAPER_DIM, color: subTab === s.id ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">{s.l}</button>
        ))}
      </div>
      {subTab === 'blood' && (
        <>
          <Card>
            <select value={bt.type} onChange={(e) => setBt({ ...bt, type: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }}>{BLOOD_TEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <input type="date" value={bt.date} onChange={(e) => setBt({ ...bt, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }} />
            <textarea value={bt.note} onChange={(e) => setBt({ ...bt, note: e.target.value })} placeholder="ผลตรวจ/ค่าที่ได้" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }} rows={3} />
            <button onClick={() => { onAddBloodTest(dog.id, bt); setBt({ ...bt, note: '' }); }} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผลตรวจเลือด</button>
          </Card>
          {[...(dog.bloodTests || [])].reverse().map((r) => <Card key={r.id}><div className="flex justify-between items-start"><div><p className="text-sm font-semibold">{r.type} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div><EditButton onClick={() => setEditingBt(r)} /></div></Card>)}
        </>
      )}
      {subTab === 'organ' && (
        <>
          <Card>
            <select value={oe.organ} onChange={(e) => setOe({ ...oe, organ: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }}>{ORGAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <input type="date" value={oe.date} onChange={(e) => setOe({ ...oe, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }} />
            <textarea value={oe.note} onChange={(e) => setOe({ ...oe, note: e.target.value })} placeholder="ผลตรวจ/ลักษณะที่พบ" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }} rows={3} />
            <button onClick={() => { onAddOrganExam(dog.id, oe); setOe({ ...oe, note: '' }); }} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผลตรวจอวัยวะ</button>
          </Card>
          {[...(dog.organExams || [])].reverse().map((r) => <Card key={r.id}><div className="flex justify-between items-start"><div><p className="text-sm font-semibold">{r.organ} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div><EditButton onClick={() => setEditingOe(r)} /></div></Card>)}
        </>
      )}
      {subTab === 'imaging' && (
        <>
          <Card>
            <select value={im.type} onChange={(e) => setIm({ ...im, type: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }}>{IMAGING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <input type="date" value={im.date} onChange={(e) => setIm({ ...im, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }} />
            <textarea value={im.note} onChange={(e) => setIm({ ...im, note: e.target.value })} placeholder="ผลอ่านภาพ/รายงาน" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }} rows={3} />
            <button onClick={() => { onAddImaging(dog.id, im); setIm({ ...im, note: '' }); }} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผล Imaging</button>
          </Card>
          {[...(dog.imaging || [])].reverse().map((r) => <Card key={r.id}><div className="flex justify-between items-start"><div><p className="text-sm font-semibold">{r.type} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div><EditButton onClick={() => setEditingIm(r)} /></div></Card>)}
        </>
      )}
      {editingBt && (
        <EditModal title="แก้ไขผลตรวจเลือด" onClose={() => setEditingBt(null)}
          initialValues={{ type: editingBt.type, date: editingBt.date, note: editingBt.note || '' }}
          fields={[
            { key: 'type', label: 'ประเภท', type: 'select', options: BLOOD_TEST_TYPES },
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'note', label: 'ผลตรวจ/ค่าที่ได้', type: 'textarea' },
          ]}
          onSave={(v) => { onUpdateBloodTest(dog.id, editingBt.id, v); setEditingBt(null); }}
        />
      )}
      {editingOe && (
        <EditModal title="แก้ไขผลตรวจอวัยวะ" onClose={() => setEditingOe(null)}
          initialValues={{ organ: editingOe.organ, date: editingOe.date, note: editingOe.note || '' }}
          fields={[
            { key: 'organ', label: 'อวัยวะ', type: 'select', options: ORGAN_TYPES },
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'note', label: 'ผลตรวจ/ลักษณะที่พบ', type: 'textarea' },
          ]}
          onSave={(v) => { onUpdateOrganExam(dog.id, editingOe.id, v); setEditingOe(null); }}
        />
      )}
      {editingIm && (
        <EditModal title="แก้ไขผล Imaging" onClose={() => setEditingIm(null)}
          initialValues={{ type: editingIm.type, date: editingIm.date, note: editingIm.note || '' }}
          fields={[
            { key: 'type', label: 'ประเภท', type: 'select', options: IMAGING_TYPES },
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'note', label: 'ผลอ่านภาพ/รายงาน', type: 'textarea' },
          ]}
          onSave={(v) => { onUpdateImaging(dog.id, editingIm.id, v); setEditingIm(null); }}
        />
      )}
    </div>
  );
}

function DogExpensesSection({ dog, onAddDogExpense, onRemoveDogExpense, onUpdateDogExpense, hospitalList, onAddHospital }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(PET_EXPENSE_CATEGORIES[0]);
  const [hospital, setHospital] = useState('');
  const [note, setNote] = useState('');
  const [periodType, setPeriodType] = useState('month');
  const [editingExp, setEditingExp] = useState(null);
  const receiptFileRef = useRef(null);
  const [receiptScanning, setReceiptScanning] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const list = hospitalList || [];
  const keyFn = periodType === 'month' ? monthKey : yearKey;
  const expenses = dog.expenses || [];
  const periods = Array.from(new Set(expenses.map((e) => keyFn(e.date)))).sort().reverse();
  const [selPeriod, setSelPeriod] = useState(periods[0] || '');
  useEffect(() => { setSelPeriod(periods[0] || ''); }, [periodType, expenses.length]);
  const periodExpenses = expenses.filter((e) => keyFn(e.date) === selPeriod);
  const periodTotal = periodExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  function submit() { if (!amount) return; onAddDogExpense(dog.id, { date: new Date().toISOString().slice(0, 10), amount, category, hospital, note }); setAmount(0); setNote(''); }

  async function handleReceiptPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setReceiptScanning(true); setReceiptError('');
    try {
      const result = await scanPetExpenseReceipt(file, PET_EXPENSE_CATEGORIES);
      const amt = Number(result.amount);
      if (!amt) { setReceiptError('อ่านยอดเงินจากภาพไม่สำเร็จ ลองภาพที่ชัดกว่านี้'); return; }
      const cat = PET_EXPENSE_CATEGORIES.includes(result.category) ? result.category : 'อื่นๆ';
      onAddDogExpense(dog.id, { date: result.date || new Date().toISOString().slice(0, 10), amount: amt, category: cat, hospital, note: result.note || (result.sourceType === 'transfer_slip' ? 'ถ่ายจากสลิปโอนเงิน' : 'ถ่ายจากใบเสร็จ') });
    } catch (err) { setReceiptError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setReceiptScanning(false); if (receiptFileRef.current) receiptFileRef.current.value = ''; }
  }

  return (
    <div>
      <Card>
        <input ref={receiptFileRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
        {receiptError && <p className="text-xs mb-3" style={{ color: BAD }}>{receiptError}</p>}
        <label className="text-xs" style={{ color: SLATE }}>หรือกรอกเอง</label>
        <NumInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7E0CE' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7E0CE' }}>{PET_EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล (ไม่บังคับ)</label>
        <select value={list.includes(hospital) ? hospital : (hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') setHospital(''); else setHospital(e.target.value); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7E0CE' }}>
          <option value="">— ไม่ระบุ —</option>
          {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ เพิ่มโรงพยาบาลใหม่</option>
        </select>
        {(hospital && !list.includes(hospital)) && (
          <div className="flex gap-2 mb-2">
            <input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="พิมพ์ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7E0CE' }} />
            <button type="button" onClick={() => { if (hospital) onAddHospital(hospital); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7E0CE', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="โน้ต" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกค่าใช้จ่าย</button>
      </Card>
      <Card>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPeriodType('month')} style={{ background: periodType === 'month' ? INK : PAPER_DIM, color: periodType === 'month' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายเดือน</button>
          <button onClick={() => setPeriodType('year')} style={{ background: periodType === 'year' ? INK : PAPER_DIM, color: periodType === 'year' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายปี</button>
        </div>
        {periods.length > 0 ? <select value={selPeriod} onChange={(e) => setSelPeriod(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7E0CE' }}>{periods.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูล</p>}
        {selPeriod && <p className="text-xl">รวม ฿{fmt(periodTotal)}</p>}
      </Card>
      {expenses.slice(0, 20).map((e) => <Card key={e.id}><div className="flex justify-between items-center"><div><p className="text-sm">{e.category}{e.hospital ? ` · ${e.hospital}` : ''}{e.note ? ` · ${e.note}` : ''}</p><p className="text-xs" style={{ color: SLATE }}>{e.date}</p></div><div className="flex items-center gap-2"><span className="text-sm">฿{fmt(e.amount)}</span><EditButton onClick={() => setEditingExp(e)} /><button onClick={() => onRemoveDogExpense(dog.id, e.id)}><Trash2 size={14} color={BAD} /></button></div></div></Card>)}
      {editingExp && (
        <EditModal title="แก้ไขค่าใช้จ่าย" onClose={() => setEditingExp(null)}
          initialValues={{ date: editingExp.date, amount: editingExp.amount, category: editingExp.category, hospital: editingExp.hospital || '', note: editingExp.note || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'category', label: 'หมวดหมู่', type: 'select', options: PET_EXPENSE_CATEGORIES },
            { key: 'hospital', label: 'โรงพยาบาล', type: 'select', options: ['', ...list] },
            { key: 'note', label: 'โน้ต', type: 'text' },
          ]}
          onSave={(v) => { onUpdateDogExpense(dog.id, editingExp.id, { date: v.date, amount: Number(v.amount) || 0, category: v.category, hospital: v.hospital, note: v.note }); setEditingExp(null); }}
        />
      )}
    </div>
  );
}

function AllDogsReportSection({ dogs }) {
  const totals = dogs.map((d) => ({ name: d.name, total: (d.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0) })).sort((a, b) => b.total - a.total);
  const grandTotal = totals.reduce((s, t) => s + t.total, 0);
  const avg = dogs.length ? grandTotal / dogs.length : 0;
  const byCategory = useMemo(() => {
    const map = {};
    dogs.forEach((d) => (d.expenses || []).forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); }));
    return Object.entries(map).map(([cat, value]) => ({ cat, value })).sort((a, b) => b.value - a.value);
  }, [dogs]);
  return (
    <div>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>ค่าใช้จ่ายรวมทั้ง 8 ตัว (ตลอดชีวิต)</p>
        <p className="text-2xl mb-2">฿{fmt(grandTotal)}</p>
        <p className="text-xs" style={{ color: SLATE }}>เฉลี่ยต่อตัว ฿{fmt(avg)}</p>
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>อันดับค่าใช้จ่ายแต่ละตัว</p>
        {totals.map((t) => <div key={t.name} className="flex justify-between text-sm mb-2"><span>{t.name}</span><span>฿{fmt(t.total)}</span></div>)}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>แยกตามหมวดหมู่ (รวมทุกตัว)</p>
        {byCategory.map((c) => <div key={c.cat} className="flex justify-between text-sm mb-2"><span>{c.cat}</span><span>฿{fmt(c.value)}</span></div>)}
        {byCategory.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลค่าใช้จ่าย</p>}
      </Card>
    </div>
  );
      }
