import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PlusCircle, Trash2, TrendingUp, Wallet, PiggyBank, Flame, Landmark, BarChart3, LogOut } from 'lucide-react';
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

const EMPTY_STATE = { accounts: [], income: [], contributions: [], targetDate: '2029-01-01', goalNetWorth: 0 };

export default function App() {
  return <AuthGate>{(user) => <Tracker user={user} />}</AuthGate>;
}

function Tracker({ user }) {
  const [state, setState] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const docRef = doc(db, 'users', user.uid, 'data', 'portfolio');

  useEffect(() => {
    (async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) setState({ ...EMPTY_STATE, ...snap.data() });
      else {
        await setDoc(docRef, EMPTY_STATE);
        setState(EMPTY_STATE);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  function persist(next) {
    setState(next);
    setDoc(docRef, next).catch((e) => console.error('save failed', e));
  }

  const totalNetWorth = useMemo(() => (state ? state.accounts.reduce((s, a) => s + Number(a.value || 0), 0) : 0), [state]);
  const monthlyIncome = useMemo(() => (state ? state.income.reduce((s, i) => s + Number(i.amount || 0), 0) : 0), [state]);
  const categoryBreakdown = useMemo(() => {
    if (!state) return [];
    const map = {};
    state.accounts.forEach((a) => { map[a.category] = (map[a.category] || 0) + Number(a.value || 0); });
    return Object.entries(map)
      .map(([key, value]) => ({ key, value, ...CATEGORY_META[key], pct: totalNetWorth ? (value / totalNetWorth) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [state, totalNetWorth]);
  const daysLeft = useMemo(() => {
    if (!state) return 0;
    return Math.max(0, Math.ceil((new Date(state.targetDate) - new Date()) / (1000 * 60 * 60 * 24)));
  }, [state]);
  const costBasisByAccount = useMemo(() => {
    if (!state) return {};
    const map = {};
    state.contributions.forEach((c) => { map[c.accountId] = (map[c.accountId] || 0) + Number(c.amount || 0); });
    return map;
  }, [state]);

  if (!state) {
    return (
      <div style={{ background: PAPER, minHeight: '100vh' }} className="flex items-center justify-center">
        <p style={{ fontFamily: 'Sarabun, sans-serif', color: INK }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const updateAccount = (id, patch) => persist({ ...state, accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const addAccount = (category) => persist({ ...state, accounts: [...state.accounts, { id: uid(), category, name: 'บัญชีใหม่', value: 0 }] });
  const removeAccount = (id) => persist({ ...state, accounts: state.accounts.filter((a) => a.id !== id) });
  const updateIncome = (id, patch) => persist({ ...state, income: state.income.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const addIncome = () => persist({ ...state, income: [...state.income, { id: uid(), name: 'แหล่งรายได้ใหม่', amount: 0 }] });
  const removeIncome = (id) => persist({ ...state, income: state.income.filter((i) => i.id !== id) });
  const addContribution = (entry) => persist({ ...state, contributions: [{ id: uid(), ...entry }, ...state.contributions] });
  const removeContribution = (id) => persist({ ...state, contributions: state.contributions.filter((c) => c.id !== id) });
  const changeTargetDate = (d) => persist({ ...state, targetDate: d });
  const changeGoal = (v) => persist({ ...state, goalNetWorth: v });

  return (
    <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: INK }} className="pb-24">
      <div style={{ background: INK }} className="px-5 pt-8 pb-6 text-white relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs tracking-widest" style={{ color: BRASS }}>สมุดบัญชีการลงทุน</p>
            <h1 className="text-3xl mt-1 font-semibold">สินทรัพย์สุทธิ</h1>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: BRASS }}>
            <LogOut size={13} /> ออก
          </button>
        </div>
        <p className="text-4xl mt-3 font-semibold">฿{fmt(totalNetWorth)}</p>
        <div className="flex items-center gap-2 mt-4">
          <Flame size={14} color={BRASS} />
          <p className="text-xs" style={{ color: '#D8CBB0' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p>
        </div>
      </div>

      {tab === 'dashboard' && (
        <Dashboard categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} targetDate={state.targetDate} onChangeTarget={changeTargetDate} goalNetWorth={state.goalNetWorth} onChangeGoal={changeGoal} totalNetWorth={totalNetWorth} daysLeft={daysLeft} />
      )}
      {tab === 'accounts' && <AccountsTab accounts={state.accounts} onUpdate={updateAccount} onAdd={addAccount} onRemove={removeAccount} costBasisByAccount={costBasisByAccount} />}
      {tab === 'savings' && <SavingsTab accounts={state.accounts} contributions={state.contributions} onAdd={addContribution} onRemove={removeContribution} />}
      {tab === 'income' && <IncomeTab income={state.income} onUpdate={updateIncome} onAdd={addIncome} onRemove={removeIncome} monthlyIncome={monthlyIncome} />}
      {tab === 'reports' && <ReportsTab contributions={state.contributions} accounts={state.accounts} costBasisByAccount={costBasisByAccount} />}

      <div style={{ background: INK, borderTop: `1px solid ${BRASS}33` }} className="fixed bottom-0 left-0 right-0 flex justify-around py-3 text-white">
        {[
          { id: 'dashboard', label: 'ภาพรวม', icon: Wallet },
          { id: 'accounts', label: 'บัญชี', icon: Landmark },
          { id: 'savings', label: 'เงินเข้า', icon: PiggyBank },
          { id: 'income', label: 'รายรับ', icon: TrendingUp },
          { id: 'reports', label: 'รายงาน', icon: BarChart3 },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-1">
            <t.icon size={18} color={tab === t.id ? BRASS : '#8A93A6'} />
            <span className="text-[9px]" style={{ color: tab === t.id ? BRASS : '#8A93A6' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div style={{ background: 'white', border: '1px solid #E7E0CE' }} className="rounded-xl p-4 mb-4">{children}</div>;
}

function Dashboard({ categoryBreakdown, monthlyIncome, targetDate, onChangeTarget, goalNetWorth, onChangeGoal, totalNetWorth, daysLeft }) {
  const requiredDaily = goalNetWorth && goalNetWorth > totalNetWorth && daysLeft > 0 ? (goalNetWorth - totalNetWorth) / daysLeft : 0;
  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สัดส่วนสินทรัพย์ตามประเภท</p>
        {categoryBreakdown.map((c) => (
          <div key={c.key} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>{c.label}</span>
              <span>฿{fmt(c.value)} ({c.pct.toFixed(1)}%)</span>
            </div>
            <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden">
              <div style={{ width: `${c.pct}%`, background: c.color }} className="h-full rounded-full" />
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>กระแสเงินสดต่อเดือน (ประมาณ)</p>
        <p className="text-2xl font-semibold">฿{fmt(monthlyIncome)}<span className="text-sm" style={{ color: SLATE }}> /เดือน</span></p>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เป้าหมาย</p>
        <label className="text-xs" style={{ color: SLATE }}>วันที่เป้าหมายเกษียณ</label>
        <input type="date" value={targetDate} onChange={(e) => onChangeTarget(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>เป้าหมายสินทรัพย์สุทธิ (บาท)</label>
        <input type="number" value={goalNetWorth} onChange={(e) => onChangeGoal(Number(e.target.value))} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
        {requiredDaily > 0 && <p className="text-xs mt-3" style={{ color: GOOD }}>ควรออมเพิ่มวันละ ~฿{fmt(requiredDaily)} เพื่อให้ถึงเป้าหมาย</p>}
      </Card>
    </div>
  );
}

function AccountsTab({ accounts, onUpdate, onAdd, onRemove, costBasisByAccount }) {
  const grouped = useMemo(() => {
    const map = {};
    accounts.forEach((a) => { (map[a.category] = map[a.category] || []).push(a); });
    return map;
  }, [accounts]);
  return (
    <div className="px-5 pt-5">
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <div key={key} className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
            <button onClick={() => onAdd(key)} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่ม</button>
          </div>
          {(grouped[key] || []).map((a) => {
            const basis = costBasisByAccount[a.id] || 0;
            const gain = a.value - basis;
            return (
              <Card key={a.id}>
                <div className="flex justify-between items-center gap-2">
                  <input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} />
                  <button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-1">฿</span>
                  <input type="number" value={a.value} onChange={(e) => onUpdate(a.id, { value: Number(e.target.value) })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} />
                </div>
                {basis > 0 && <p className="text-xs mt-1" style={{ color: gain >= 0 ? GOOD : BAD }}>ต้นทุนสะสม ฿{fmt(basis)} · {gain >= 0 ? '+' : ''}฿{fmt(gain)}</p>}
              </Card>
            );
          })}
          {(!grouped[key] || grouped[key].length === 0) && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบัญชีในหมวดนี้</p>}
        </div>
      ))}
    </div>
  );
}

function SavingsTab({ accounts, contributions, onAdd, onRemove }) {
  const [amount, setAmount] = useState(10000);
  const [source, setSource] = useState('pharmacy');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [usdAmount, setUsdAmount] = useState('');
  const destAccount = accounts.find((a) => a.id === accountId);
  const isDime = destAccount && destAccount.category === 'dime';

  function submit() {
    if (!accountId) return;
    onAdd({ date: new Date().toISOString().slice(0, 10), amount, source, accountId, usdAmount: isDime && usdAmount ? Number(usdAmount) : undefined });
    setUsdAmount('');
  }
  const thisMonthTotal = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    return contributions.filter((c) => c.date.startsWith(ym)).reduce((s, c) => s + Number(c.amount || 0), 0);
  }, [contributions]);

  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เงินเข้าเดือนนี้รวม</p>
        <p className="text-2xl font-semibold mb-3">฿{fmt(thisMonthTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน (บาท)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>มาจากแหล่งไหน</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">
          {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <label className="text-xs" style={{ color: SLATE }}>ลงทุนเข้าบัญชีไหน</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {isDime && (
          <>
            <label className="text-xs" style={{ color: SLATE }}>จำนวน USD ที่ซื้อได้ (ถ้ามี)</label>
            <input type="number" value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
          </>
        )}
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกเงินเข้า</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>รายการล่าสุด</p>
      {contributions.slice(0, 30).map((c) => {
        const acc = accounts.find((a) => a.id === c.accountId);
        const src = SOURCES.find((s) => s.id === c.source);
        return (
          <Card key={c.id}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">{src?.label || c.source} → {acc?.name || 'ไม่ทราบบัญชี'}</p>
                <p className="text-xs" style={{ color: SLATE }}>{c.date}{c.usdAmount ? ` · ${c.usdAmount} USD` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">฿{fmt(c.amount)}</span>
                <button onClick={() => onRemove(c.id)}><Trash2 size={14} color={BAD} /></button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function IncomeTab({ income, onUpdate, onAdd, onRemove, monthlyIncome }) {
  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>รวมรายรับต่อเดือน</p>
        <p className="text-2xl font-semibold">฿{fmt(monthlyIncome)}</p>
      </Card>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold">แหล่งรายได้ประจำ</p>
        <button onClick={onAdd} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่ม</button>
      </div>
      {income.map((i) => (
        <Card key={i.id}>
          <div className="flex justify-between items-center gap-2">
            <input value={i.name} onChange={(e) => onUpdate(i.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} />
            <button onClick={() => onRemove(i.id)}><Trash2 size={16} color={BAD} /></button>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm mr-1">฿</span>
            <input type="number" value={i.amount} onChange={(e) => onUpdate(i.id, { amount: Number(e.target.value) })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} />
            <span className="text-xs" style={{ color: SLATE }}>/เดือน</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ReportsTab({ contributions, accounts, costBasisByAccount }) {
  const [periodType, setPeriodType] = useState('month');
  const keyFn = periodType === 'month' ? monthKey : periodType === 'quarter' ? quarterKey : yearKey;
  const periods = useMemo(() => Array.from(new Set(contributions.map((c) => keyFn(c.date)))).sort().reverse(), [contributions, periodType]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  useEffect(() => { setSelectedPeriod(periods[0] || ''); }, [periodType, periods.length]);
  const periodContribs = useMemo(() => contributions.filter((c) => keyFn(c.date) === selectedPeriod), [contributions, selectedPeriod, periodType]);
  const periodTotal = periodContribs.reduce((s, c) => s + Number(c.amount || 0), 0);
  const bySource = useMemo(() => {
    const map = {};
    periodContribs.forEach((c) => { map[c.source] = (map[c.source] || 0) + Number(c.amount || 0); });
    return Object.entries(map).map(([id, value]) => ({ id, label: SOURCES.find((s) => s.id === id)?.label || id, value })).sort((a, b) => b.value - a.value);
  }, [periodContribs]);
  const byAccount = useMemo(() => {
    const map = {};
    periodContribs.forEach((c) => { map[c.accountId] = (map[c.accountId] || 0) + Number(c.amount || 0); });
    return Object.entries(map).map(([id, value]) => ({ id, label: accounts.find((a) => a.id === id)?.name || 'ไม่ทราบบัญชี', value })).sort((a, b) => b.value - a.value);
  }, [periodContribs, accounts]);

  return (
    <div className="px-5 pt-5">
      <Card>
        <div className="flex gap-2 mb-3">
          {[{ id: 'month', label: 'รายเดือน' }, { id: 'quarter', label: 'รายไตรมาส' }, { id: 'year', label: 'รายปี' }].map((p) => (
            <button key={p.id} onClick={() => setPeriodType(p.id)} style={{ background: periodType === p.id ? INK : PAPER_DIM, color: periodType === p.id ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">{p.label}</button>
          ))}
        </div>
        {periods.length > 0 ? (
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-2 text-sm w-full">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        ) : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูล — เริ่มบันทึกที่แท็บ "เงินเข้า"</p>}
      </Card>
      {selectedPeriod && (
        <>
          <Card>
            <p className="text-xs mb-1" style={{ color: SLATE }}>เก็บเงินไปทั้งหมดในช่วง {selectedPeriod}</p>
            <p className="text-2xl font-semibold">฿{fmt(periodTotal)}</p>
          </Card>
          <Card>
            <p className="text-xs mb-3" style={{ color: SLATE }}>แยกตามแหล่งที่มา</p>
            {bySource.map((s) => <div key={s.id} className="flex justify-between text-sm mb-2"><span>{s.label}</span><span>฿{fmt(s.value)}</span></div>)}
          </Card>
          <Card>
            <p className="text-xs mb-3" style={{ color: SLATE }}>แยกตามสินทรัพย์ปลายทาง</p>
            {byAccount.map((a) => <div key={a.id} className="flex justify-between text-sm mb-2"><span>{a.label}</span><span>฿{fmt(a.value)}</span></div>)}
          </Card>
        </>
      )}
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ต้นทุนสะสมเทียบมูลค่าปัจจุบัน</p>
        {accounts.filter((a) => costBasisByAccount[a.id]).map((a) => {
          const basis = costBasisByAccount[a.id] || 0;
          const gain = a.value - basis;
          const pct = basis ? (gain / basis) * 100 : 0;
          return (
            <div key={a.id} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span style={{ color: gain >= 0 ? GOOD : BAD }}>{gain >= 0 ? '+' : ''}{pct.toFixed(1)}%</span>
              </div>
              <p className="text-xs" style={{ color: SLATE }}>ต้นทุน ฿{fmt(basis)} · ปัจจุบัน ฿{fmt(a.value)}</p>
            </div>
          );
        })}
      </Card>
    </div>
  );
           }
