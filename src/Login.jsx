import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Fingerprint, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { auth } from './firebase.js';
import { isWebAuthnAvailable, registerFingerprint, hasFingerprintRegistered, verifyFingerprint } from './webauthn.js';

// โทนสีเดียวกับ App.jsx (ปรับให้เข้าชุดกันทั้งแอปตอนทำโทนสีใหม่ให้ดูมืออาชีพขึ้น)
const INK = '#1C2029';
const PAPER = '#F6F5F1';
const PAPER_DIM = '#ECEAE3';
const BRASS = '#A87C2E';
const SLATE = '#767268';
const BORDER = '#E4E1D8';
const BAD = '#C0392E';

export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  // หน้าประตูทางเข้า (โลโก้ + คำทักทาย + ปุ่มเดียว) ก่อนค่อยเปิดฟอร์มกรอกอีเมล/รหัสผ่านจริง — ตามแบบที่ต้องการ
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUnlocked(false);
      setAutoTried(false);
    });
  }, []);

  useEffect(() => {
    if (!user || unlocked || autoTried) return;
    if (isWebAuthnAvailable() && hasFingerprintRegistered(user.uid)) {
      setAutoTried(true);
      handleVerifyFingerprint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, unlocked]);

  async function handleSubmit() {
    setError(''); setBusy(true);
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาด');
    } finally {
      setBusy(false);
    }
  }

  async function handleRegisterFingerprint() {
    try {
      await registerFingerprint(user.uid, user.email);
      setUnlocked(true);
    } catch (e) {
      setError('ตั้งค่าลายนิ้วมือไม่สำเร็จ: ' + e.message);
    }
  }

  async function handleVerifyFingerprint() {
    try {
      await verifyFingerprint(user.uid);
      setUnlocked(true);
    } catch (e) {
      setError('ยืนยันลายนิ้วมือไม่สำเร็จ: ' + e.message);
    }
  }

  if (user === undefined) {
    return (
      <div style={{ background: PAPER, minHeight: '100vh' }} className="flex items-center justify-center">
        <Loader2 className="animate-spin" color={INK} />
      </div>
    );
  }

  if (!user) {
    // ขั้นที่ 1: หน้าประตูทางเข้า — โลโก้ตรงกลาง คำทักทายใหญ่ ปุ่มเดียว ไม่มีฟอร์มให้เห็นเลย
    if (!showForm) {
      return (
        <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif' }} className="flex flex-col justify-between px-6 pt-20 pb-10">
          <div>
            <div className="flex flex-col items-center mb-16">
              <div style={{ background: INK }} className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3">
                <span style={{ color: BRASS }} className="text-2xl font-bold">฿</span>
              </div>
              <p style={{ color: INK }} className="text-lg font-semibold">เป๋าตุง Family</p>
              <p className="text-[11px] tracking-widest mt-0.5" style={{ color: SLATE }}>FAMILY · FINANCE · SYSTEM</p>
            </div>
            <p style={{ color: INK }} className="text-3xl font-semibold leading-snug text-center">
              &ldquo;สวัสดี&rdquo;<br />เป๋าตุง Family
            </p>
          </div>
          <div>
            <button onClick={() => setShowForm(true)} style={{ background: INK }} className="w-full text-white rounded-full py-4 text-sm font-semibold mb-4">
              เข้าสู่ระบบ
            </button>
            <p className="text-[11px] text-center leading-relaxed" style={{ color: SLATE }}>
              ระบบสำหรับครอบครัวทอมมี่เท่านั้น<br />หากเข้าสู่ระบบไม่ได้ กรุณาติดต่อทอมมี่
            </p>
          </div>
        </div>
      );
    }

    // ขั้นที่ 2: ฟอร์มกรอกอีเมล/รหัสผ่านจริง (ฟังก์ชันเดิมทุกอย่าง แค่รีสไตล์ให้เข้าชุดกับหน้าประตู)
    return (
      <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif' }} className="flex flex-col justify-center px-6">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-1 text-xs mb-8" style={{ color: SLATE }}>
          <ArrowLeft size={14} /> กลับ
        </button>
        <p className="text-xs tracking-widest mb-1" style={{ color: BRASS }}>เป๋าตุง FAMILY</p>
        <h1 style={{ color: INK }} className="text-2xl font-semibold mb-6">{mode === 'signup' ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}</h1>
        <input
          type="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ border: `1px solid ${BORDER}`, background: 'white' }} className="rounded-lg px-3 py-3 text-sm w-full mb-3"
        />
        <input
          type="password" placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ border: `1px solid ${BORDER}`, background: 'white' }} className="rounded-lg px-3 py-3 text-sm w-full mb-3"
        />
        {error && <p className="text-xs mb-3" style={{ color: BAD }}>{error}</p>}
        <button onClick={handleSubmit} disabled={busy} style={{ background: INK }} className="text-white rounded-lg py-3 text-sm mb-3 flex items-center justify-center gap-2">
          {busy && <Loader2 size={14} className="animate-spin" />}
          {mode === 'signup' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </button>
        <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-xs" style={{ color: SLATE }}>
          {mode === 'signup' ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
        </button>
      </div>
    );
  }

  if (isWebAuthnAvailable() && !unlocked) {
    const registered = hasFingerprintRegistered(user.uid);
    return (
      <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif' }} className="flex flex-col items-center justify-center px-6">
        <div style={{ background: INK }} className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
          <Fingerprint size={30} color={BRASS} />
        </div>
        <p style={{ color: INK }} className="text-lg font-semibold mb-1.5 text-center">
          {registered ? 'ยืนยันตัวตน' : 'ล็อกเครื่องนี้ด้วยลายนิ้วมือ'}
        </p>
        <p className="text-sm mb-8 text-center" style={{ color: SLATE }}>
          {registered ? 'สแกนลายนิ้วมือ/ใบหน้าเพื่อปลดล็อก' : 'ตั้งค่าไว้ครั้งเดียว ไม่บังคับ'}
        </p>
        {error && <p className="text-xs mb-4 text-center" style={{ color: BAD }}>{error}</p>}
        {registered ? (
          <button onClick={handleVerifyFingerprint} style={{ background: INK }} className="w-full max-w-xs text-white rounded-full py-4 text-sm font-semibold">
            ปลดล็อก
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={handleRegisterFingerprint} style={{ background: INK }} className="text-white rounded-full py-4 text-sm font-semibold">
              ตั้งค่าลายนิ้วมือ
            </button>
            <button onClick={() => setUnlocked(true)} className="text-xs" style={{ color: SLATE }}>
              ข้ามไปก่อน
            </button>
          </div>
        )}
        <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs mt-10" style={{ color: SLATE }}>
          <LogOut size={12} /> ออกจากระบบ
        </button>
      </div>
    );
  }

  return children(user);
}
