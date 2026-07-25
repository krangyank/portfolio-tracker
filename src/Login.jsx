import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Fingerprint, LogOut, Loader2 } from 'lucide-react';
import { auth } from './firebase.js';
import { isWebAuthnAvailable, registerFingerprint, hasFingerprintRegistered, verifyFingerprint } from './webauthn.js';

const INK = '#14213D';
const PAPER = '#FAF7F0';
const BRASS = '#B8874B';
const SLATE = '#6B7280';

export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUnlocked(false);
    });
  }, []);

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
    return (
      <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif' }} className="flex flex-col justify-center px-6">
        <p className="text-xs tracking-widest mb-1" style={{ color: BRASS }}>สมุดบัญชีการลงทุน</p>
        <h1 style={{ color: INK }} className="text-2xl font-semibold mb-6">{mode === 'signup' ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}</h1>
        <input
          type="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-3 text-sm w-full mb-3"
        />
        <input
          type="password" placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ border: '1px solid #E7E0CE' }} className="rounded-lg px-3 py-3 text-sm w-full mb-3"
        />
        {error && <p className="text-xs mb-3" style={{ color: '#A64B3D' }}>{error}</p>}
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
      <div style={{ background: INK, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif' }} className="flex flex-col items-center justify-center px-6 text-white">
        <Fingerprint size={56} color={BRASS} className="mb-6" />
        <p className="text-sm mb-6 text-center" style={{ color: '#D8CBB0' }}>
          {registered ? 'สแกนลายนิ้วมือ/ใบหน้าเพื่อปลดล็อก' : 'ตั้งค่าล็อกด้วยลายนิ้วมือของเครื่องนี้ (ไม่บังคับ)'}
        </p>
        {error && <p className="text-xs mb-4" style={{ color: '#E07A5F' }}>{error}</p>}
        {registered ? (
          <button onClick={handleVerifyFingerprint} style={{ background: BRASS }} className="rounded-full px-8 py-3 text-sm font-semibold" >
            ปลดล็อก
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={handleRegisterFingerprint} style={{ background: BRASS }} className="rounded-full px-8 py-3 text-sm font-semibold">
              ตั้งค่าลายนิ้วมือ
            </button>
            <button onClick={() => setUnlocked(true)} className="text-xs" style={{ color: '#8A93A6' }}>
              ข้ามไปก่อน
            </button>
          </div>
        )}
        <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs mt-10" style={{ color: '#8A93A6' }}>
          <LogOut size={12} /> ออกจากระบบ
        </button>
      </div>
    );
  }

  return children(user);
}
