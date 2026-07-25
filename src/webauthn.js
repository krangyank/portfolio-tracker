// หมายเหตุสำคัญเรื่องความปลอดภัย:
// การใช้งานนี้เป็น "ตัวล็อกระดับเครื่อง" ด้วยลายนิ้วมือ/Face unlock ของอุปกรณ์
// ไม่ใช่ระบบ WebAuthn แบบเต็มรูปแบบที่มีเซิร์ฟเวอร์ตรวจสอบลายเซ็นดิจิทัล
// เหมาะสำหรับแอปส่วนตัวที่ต้องการกันคนอื่นเปิดเครื่องแล้วเห็นข้อมูลทันที

export function isWebAuthnAvailable() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

function randomChallenge() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
}

export async function registerFingerprint(uid, displayName) {
  const publicKey = {
    challenge: randomChallenge(),
    rp: { name: 'สมุดบัญชีการลงทุน' },
    user: {
      id: new TextEncoder().encode(uid),
      name: displayName || uid,
      displayName: displayName || uid,
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
    timeout: 60000,
  };
  const credential = await navigator.credentials.create({ publicKey });
  const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  localStorage.setItem(`fingerprint-cred-${uid}`, credentialId);
  return credentialId;
}

export function hasFingerprintRegistered(uid) {
  return !!localStorage.getItem(`fingerprint-cred-${uid}`);
}

export async function verifyFingerprint(uid) {
  const stored = localStorage.getItem(`fingerprint-cred-${uid}`);
  if (!stored) throw new Error('ยังไม่ได้ตั้งค่าลายนิ้วมือบนเครื่องนี้');
  const credentialId = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const publicKey = {
    challenge: randomChallenge(),
    allowCredentials: [{ id: credentialId, type: 'public-key' }],
    userVerification: 'required',
    timeout: 60000,
  };
  await navigator.credentials.get({ publicKey });
  return true;
}

export function removeFingerprint(uid) {
  localStorage.removeItem(`fingerprint-cred-${uid}`);
}
