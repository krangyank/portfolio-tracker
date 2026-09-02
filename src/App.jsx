import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import {
  PlusCircle, Trash2, TrendingUp, Wallet, PiggyBank, Flame, Landmark,
  BarChart3, Camera, Sparkles, Share2, X, Loader2, RefreshCw, ChevronDown, ChevronUp,
  Settings, AlertTriangle, CheckCircle2, Info, Calendar, LogOut, Receipt, Mic,
  Dog, Scale, Syringe, Shield, Bug, Stethoscope, Eye, EyeOff, Search, Upload,
  ClipboardList, Bell, ChevronRight, ChevronLeft, Home, Phone, MessageCircle, Wrench, Image as ImageIcon, Percent, User, Newspaper, Rss,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { signOut } from 'firebase/auth';
import { db, auth, storage } from './firebase.js';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AuthGate from './Login.jsx';

const INK = '#1C2029';
const PAPER = '#F6F5F1';
const PAPER_DIM = '#ECEAE3';
const BRASS = '#A87C2E';
const SLATE = '#767268';
const GOOD = '#1F8A54';
const BAD = '#C0392E';
const WARN = '#B45309';
const BORDER = '#E4E1D8';
const CARD_RADIUS = 12;

const CATEGORY_META = {
  cooperative: { label: 'สหกรณ์ออมทรัพย์ครู', color: '#B8874B' },
  bank_savings: { label: 'บัญชีออมทรัพย์ธนาคาร', color: '#3F6152' },
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
const INTEREST_CATEGORIES = ['cooperative', 'bank_savings'];
const PIE_COLORS = ['#0F172A', '#16A34A', '#D97706', '#2563EB', '#7A5230', '#5C6F8A'];
const TAB_MASCOTS = {
  dashboard: { emoji: '💰', bg: '#FDE6D3', photo: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=200&h=200&fit=crop' },
  accounts: { emoji: '🪙', bg: '#DCE8FE', photo: 'https://images.unsplash.com/photo-1621981386829-9b458a2cddde?w=200&h=200&fit=crop' },
  savings: { emoji: '🐷', bg: '#FDE6D3', photo: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=200&h=200&fit=crop' },
  income: { emoji: '📰', bg: '#F3E9DC' },
  expenses: { emoji: '🛍️', bg: '#FBE3E1', photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop' },
  pets: { emoji: '🐶', bg: '#EFE7FE' },
  realestate: { emoji: '🏡', bg: '#DDF4F4' },
  insurance: { emoji: '🛡️', bg: '#DCE8FE' },
  reports: { emoji: '🦉', bg: '#DCE8FE', photo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop' },
};
const TAB_LABELS = { dashboard: 'ภาพรวม', accounts: 'บัญชี', savings: 'เงินเข้า', income: 'ข่าว', expenses: 'รายจ่าย', pets: 'ลูกๆ', realestate: 'บ้านเช่า', insurance: 'ประกัน', reports: 'รายงาน' };

const SOURCES = [
  { id: 'coop_div', label: 'ปันผลสหกรณ์' },
  { id: 'coop_interest', label: 'ดอกเบี้ยเงินฝากสหกรณ์' },
  { id: 'thai_div', label: 'ปันผลหุ้นไทย' },
  { id: 'rental', label: 'ค่าเช่า' },
  { id: 'us_div', label: 'ปันผลหุ้นสหรัฐฯ' },
  { id: 'wealthx', label: 'Wealth X (หักอัตโนมัติ)' },
  { id: 'pharmacy', label: 'เงินเก็บร้านยา' },
  { id: 'personal_withdraw', label: 'ถอนใช้ส่วนตัว' },
  { id: 'other', label: 'อื่นๆ' },
];
// แหล่งที่มาที่ถือเป็น "ปันผล" — ใช้ทำพื้นหลังสีเขียวอ่อนแยกจากเงินเข้าปกติในรายการล่าสุด
const DIVIDEND_SOURCES = ['coop_div', 'thai_div', 'us_div', 'yieldtech'];
const BG_WITHDRAW = '#FBEAEA';
const BG_DIVIDEND = '#E9F5EE';

const fmt = (n) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(n || 0);
// แปลง YYYY-MM-DD เป็น วัน/เดือน/ปี ให้อ่านง่ายแบบไทย ใช้แสดงผลเฉยๆ ไม่กระทบการเก็บข้อมูลจริง (ยังเก็บเป็น YYYY-MM-DD เหมือนเดิมเพื่อ sort ได้ถูกต้อง)
function formatDateDMY(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}
const fmt2 = (n) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(n || 0);
const uid = () => Math.random().toString(36).slice(2, 10);
const monthKey = (d) => d.slice(0, 7);
const quarterKey = (d) => `${d.slice(0, 4)}-Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1}`;
const yearKey = (d) => d.slice(0, 4);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const prevMonthKey = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };

const DOG_NAMES = ['เป๋าตุง', 'ถุงทอง', 'ตุ้มแต้ม', 'ขวานฟ้า', 'คัตโตะ', 'โยกเยก', 'หนึ่งหนึ่ง', 'หญิงเล็ก'];
const PET_EXPENSE_CATEGORIES = ['ค่าตรวจ', 'ค่ายา', 'อาหาร', 'อาหารเสริม', 'ของเล่น', 'อาบน้ำ', 'ตัดขน', 'ประกัน', 'เดินทาง', 'ฉุกเฉิน', 'อื่นๆ'];
const BLOOD_TEST_TYPES = ['CBC', 'ค่าไต', 'ค่าตับ', 'ค่าตับอ่อน (Lipase/Amylase/cPLI)', 'ไขมันในเลือด', 'น้ำตาล', 'SDMA', 'Electrolyte', 'Cortisol', 'ACTH', 'T4/Thyroid', 'Coagulation (PT/PTT)', 'Urinalysis'];
const ORGAN_TYPES = ['ไต', 'ตับ', 'ตับอ่อน', 'ถุงน้ำดี', 'ม้าม', 'ต่อมหมวกไต', 'หัวใจ', 'ตา'];
const IMAGING_TYPES = ['Ultrasound', 'X-ray', 'CT', 'MRI', 'Echo (Echocardiogram)'];
const makeDog = (name) => ({
  id: uid(), name, nickname: '', birthdate: '', sex: '', color: '', breed: '', microchip: '', breeder: '', personality: '', notes: '',
  bcs: 0, chronicDiseases: '', drugAllergies: '',
  weights: [], medications: [], fleaTick: { productName: '', tabletMg: 0, tabletsPurchased: 0, lastGivenDate: '' }, fleaTickHistory: [],
  insurance: { company: '', policyNumber: '', startDate: '', endDate: '', premium: 0, opdLimit: 0, ipdLimit: 0, remainingBalance: 0, claims: [] },
  appointments: [], bloodTests: [], organExams: [], imaging: [], expenses: [], vetVisits: [],
});
const DEFAULT_DOGS = DOG_NAMES.map((n) => makeDog(n));

const PROPERTY_SEED = [
  { name: 'คอนโด O2', rent: 5500, purchasePrice: 1300000 },
  { name: 'บ้านซอยวัชระ', rent: 5000, purchasePrice: 2300000 },
  { name: 'บ้านซอยปั๊มแก๊ส', rent: 4700, purchasePrice: 2700000 },
  { name: 'Park View หลักสี่', rent: 6500, purchasePrice: 1200000 },
  { name: 'Kave กรุงเทพฯ', rent: 11000, purchasePrice: 2500000 },
  { name: 'Wish Signature', rent: 17000, purchasePrice: 4500000 },
];
const makeProperty = (p) => ({
  id: uid(), name: p.name, rent: p.rent, purchasePrice: p.purchasePrice,
  status: 'occupied', tenantName: '', tenantPhone: '', tenantLine: '',
  depositAmount: p.rent * 2, contractStartDate: '', contractEndDate: '', reminderDays: [7, 3, 1],
  rentDueDay: 5, rentReminderDays: [3, 1],
  photos: [], documents: [], payments: {}, transactions: [], repairs: [],
});
const DEFAULT_PROPERTIES = PROPERTY_SEED.map((p) => makeProperty(p));

const EMPTY_STATE = {
  accounts: [], income: [], contributions: [], history: [], expenses: [],
  expenseCategories: ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'สุขภาพ', 'อื่นๆ'],
  targetDate: '2029-01-01', goalNetWorth: 0, finnhubKey: '', dogs: [], googleClientId: '', googleRefreshToken: '',
  hospitalList: ['โรงพยาบาลสัตว์เล็กเกษตร', 'โรงพยาบาลสัตว์เล็กจุฬาฯ', 'Central West Animal Hospital', 'โรงพยาบาลสัตว์ทองหล่อ', 'โรงพยาบาลสัตว์อารักษ์', 'โรงพยาบาลสัตว์นครสวรรค์ (Big C)'],
  doctorList: [],
  departmentList: ['แผนกฉุกเฉิน', 'อายุรกรรมทั่วไป', 'ตา', 'ศัลยกรรม', 'ผิวหนัง', 'ต่อมไร้ท่อ'],
  doctorDepartments: {},
  customDestinationList: [],
  openToLastTab: false,
  lastUsedTab: 'dashboard',
  insurancePolicies: [],
  insuranceClaims: [],
  bloodTestTypeList: ['CBC', 'ค่าไต', 'ค่าตับ', 'ค่าตับอ่อน (Lipase/Amylase/cPLI)', 'ไขมันในเลือด', 'น้ำตาล', 'SDMA', 'Electrolyte', 'Cortisol', 'ACTH', 'T4/Thyroid', 'Coagulation (PT/PTT)', 'Urinalysis'],
  organTypeList: ['ไต', 'ตับ', 'ตับอ่อน', 'ถุงน้ำดี', 'ม้าม', 'ต่อมหมวกไต', 'หัวใจ', 'ตา'],
  imagingTypeList: ['Ultrasound', 'X-ray', 'CT', 'MRI', 'Echo (Echocardiogram)'],
  weigherList: ['พ่อ', 'แม่'],
  medicationList: [],
  properties: [],
  creditCards: [],
  investmentNews: { items: [], fetchedAt: '' },
};
const makeCreditCard = (entry) => ({
  id: uid(), bankName: entry?.bankName || '', cardName: entry?.cardName || '', last4: entry?.last4 || '',
  creditLimit: entry?.creditLimit || 0, statementDay: entry?.statementDay || 1, dueDay: entry?.dueDay || 15,
  reminderDays: entry?.reminderDays || [3, 1], transactions: [],
});

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
// calls our own serverless function instead of Anthropic directly
async function askServer(promptText, imageBase64, mediaType, webSearch) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: promptText, imageBase64, mediaType, webSearch: !!webSearch }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || '';
}

// ส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE — เป็น fire-and-forget เสมอ ไม่บล็อก UI และไม่โยน error ออกไปให้ผู้ใช้เห็น
// เพราะการแจ้งเตือนพัง (เช่น ยังไม่ตั้งค่า LINE_GROUP_ID) ไม่ควรทำให้การบันทึกรายการหลักใช้งานไม่ได้
// currentNotifyUser ถูกตั้งค่าจาก Tracker ทุกครั้งที่ user หรือชื่อที่ตั้งไว้ในตั้งค่าเปลี่ยน เพื่อให้ทุกข้อความแจ้งเตือน (ทุกจุดเรียกทั่วทั้งไฟล์) ต่อท้ายด้วย "โดยใคร" โดยไม่ต้องแก้ทีละจุด
let currentNotifyUser = '';
// สวิตช์เปิด/ปิดแจ้งเตือน LINE ทั้งหมด ตั้งค่าจาก Tracker ตาม state.lineNotifyEnabled (ค่าเริ่มต้นเปิด) — เช็คจุดเดียวตรงนี้ ครอบคลุมทุกจุดเรียกในไฟล์ทันที
let lineNotifyEnabled = true;
function sendLineNotify(message) {
  if (!lineNotifyEnabled) return;
  const tagged = currentNotifyUser ? `${message}\n— โดย ${currentNotifyUser}` : message;
  fetch('/api/line-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: tagged }),
  }).catch((e) => console.error('sendLineNotify failed', e));
}
// ส่งการ์ด Flex Message แทนข้อความล้วน — ใช้ altText เป็นข้อความสำรอง (โชว์ตอนแจ้งเตือน/บนนาฬิกา ที่มองไม่เห็นการ์ดจริง) ต้องแปะ "โดยใคร" ต่อท้ายใน altText เอง เพราะการ์ดไม่มีที่ใส่ชื่อผู้บันทึกแบบข้อความธรรมดา
function sendLineFlex(altText, contents) {
  if (!lineNotifyEnabled) return;
  const taggedAlt = currentNotifyUser ? `${altText} — โดย ${currentNotifyUser}` : altText;
  fetch('/api/line-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flex: { altText: taggedAlt, contents } }),
  }).catch((e) => console.error('sendLineFlex failed', e));
}
const APP_URL = 'https://portfolio-tracker-six-chi.vercel.app';
// การ์ด Flex Message มาตรฐานที่ใช้ซ้ำได้ทุกจุดแจ้งเตือน — หัวเข้ม, แถว label/value, ยอดเงินตัวใหญ่ (สีเขียว/แดงได้ตามทิศทางเงิน), โน้ตท้ายการ์ด, ปุ่มเปิดแอปไปแท็บที่เกี่ยวข้อง
function buildFlexCard({ title, rows, amount, amountColor, note, tab }) {
  const body = [];
  if (rows && rows.length) {
    body.push({ type: 'box', layout: 'vertical', spacing: 'sm', contents: rows.map((r) => ({
      type: 'box', layout: 'baseline', contents: [
        { type: 'text', text: r.label, size: 'sm', color: '#767268', flex: 2 },
        { type: 'text', text: r.value, size: 'sm', color: '#1C2029', flex: 3, wrap: true, align: 'end' },
      ],
    })) });
  }
  if (amount != null) {
    if (rows && rows.length) body.push({ type: 'separator', margin: 'md' });
    body.push({ type: 'box', layout: 'baseline', margin: rows && rows.length ? 'md' : undefined, contents: [
      { type: 'text', text: 'จำนวนเงิน', size: 'sm', color: '#767268', flex: 2 },
      { type: 'text', text: `฿${fmt(Math.abs(amount))}`, size: 'lg', weight: 'bold', flex: 3, align: 'end', color: amountColor || '#1C2029' },
    ] });
  }
  if (note) body.push({ type: 'text', text: note, size: 'xs', color: '#767268', wrap: true, margin: 'md' });
  // แสดง "บันทึกโดย" ในตัวการ์ดเองด้วย เดิมมีแค่ใน altText (ข้อความสำรองตอนแจ้งเตือน) ซึ่งมองไม่เห็นแล้วหลังเปิดแชทเข้ามาดูการ์ดจริง
  if (currentNotifyUser) body.push({ type: 'box', layout: 'baseline', margin: 'md', contents: [
    { type: 'text', text: 'บันทึกโดย', size: 'xs', color: '#9A958A', flex: 2 },
    { type: 'text', text: currentNotifyUser, size: 'xs', color: '#9A958A', flex: 3, wrap: true, align: 'end' },
  ] });
  const bubble = {
    type: 'bubble',
    header: { type: 'box', layout: 'horizontal', backgroundColor: '#1C2029', paddingAll: 'md', contents: [
      { type: 'text', text: title, color: '#FFFFFF', weight: 'bold', size: 'md', wrap: true },
    ] },
    body: { type: 'box', layout: 'vertical', paddingAll: 'md', contents: body },
  };
  if (tab) bubble.footer = { type: 'box', layout: 'vertical', contents: [
    { type: 'button', style: 'link', height: 'sm', action: { type: 'uri', label: 'เปิดในแอป', uri: `${APP_URL}/?tab=${tab}` } },
  ] };
  return bubble;
}
// สร้างการ์ด Flex Message สรุปการไปหาหมอ — โครงเดียวกับตัวอย่างที่ทำให้ดูก่อนหน้านี้ (หัวการ์ดเข้ม, แถว label/value, ค่าใช้จ่ายตัวใหญ่, กล่องนัดถัดไปสีเตือน, ปุ่มเปิดแอป)
function buildVetVisitFlexCard(dogName, form, meds, nextApptDate) {
  const rows = [];
  const row = (label, value) => rows.push({ type: 'box', layout: 'baseline', contents: [
    { type: 'text', text: label, size: 'sm', color: '#767268', flex: 2 },
    { type: 'text', text: value, size: 'sm', color: '#1C2029', flex: 3, wrap: true, align: 'end' },
  ] });
  row('วันที่', formatDateDMY(form.date));
  if (form.hospital) row('โรงพยาบาล', form.hospital);
  if (form.department) row('แผนก', form.department);
  if (form.doctor) row('สัตวแพทย์', form.doctor);
  const body = [{ type: 'box', layout: 'vertical', spacing: 'sm', contents: rows }];
  if (form.diagnosis) {
    body.push({ type: 'separator', margin: 'md' });
    body.push({ type: 'box', layout: 'vertical', margin: 'md', contents: [
      { type: 'text', text: 'ผลวินิจฉัย', size: 'xs', color: '#767268' },
      { type: 'text', text: form.diagnosis, size: 'sm', wrap: true, margin: 'xs' },
    ] });
  }
  if (meds && meds.length) {
    body.push({ type: 'box', layout: 'baseline', margin: 'md', contents: [
      { type: 'text', text: 'ยาที่ได้รับ', size: 'sm', color: '#767268', flex: 2 },
      { type: 'text', text: meds.join(', '), size: 'sm', flex: 3, wrap: true, align: 'end' },
    ] });
  }
  if (form.cost) {
    body.push({ type: 'separator', margin: 'md' });
    body.push({ type: 'box', layout: 'baseline', margin: 'md', contents: [
      { type: 'text', text: 'ค่าใช้จ่าย', size: 'sm', color: '#767268', flex: 2 },
      { type: 'text', text: `฿${fmt(form.cost)}`, size: 'lg', weight: 'bold', flex: 3, align: 'end' },
    ] });
  }
  if (nextApptDate) {
    body.push({ type: 'box', layout: 'baseline', margin: 'md', backgroundColor: '#FAEEDA', cornerRadius: 'md', paddingAll: 'sm', contents: [
      { type: 'text', text: `📆 นัดครั้งถัดไป ${formatDateDMY(nextApptDate)}`, size: 'xs', color: '#854F0B' },
    ] });
  }
  if (currentNotifyUser) body.push({ type: 'box', layout: 'baseline', margin: 'md', contents: [
    { type: 'text', text: 'บันทึกโดย', size: 'xs', color: '#9A958A', flex: 2 },
    { type: 'text', text: currentNotifyUser, size: 'xs', color: '#9A958A', flex: 3, wrap: true, align: 'end' },
  ] });
  return {
    type: 'bubble',
    header: { type: 'box', layout: 'horizontal', backgroundColor: '#1C2029', paddingAll: 'md', contents: [
      { type: 'text', text: `${dogName} — ไปหาหมอ`, color: '#FFFFFF', weight: 'bold', size: 'md' },
    ] },
    body: { type: 'box', layout: 'vertical', paddingAll: 'md', contents: body },
    footer: { type: 'box', layout: 'vertical', contents: [
      { type: 'button', style: 'link', height: 'sm', action: { type: 'uri', label: 'เปิดในแอป', uri: `${APP_URL}/?tab=pets` } },
    ] },
  };
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
// แก้ไขอีเวนต์เดิมที่มีอยู่แล้วในปฏิทิน (ใช้ event id ที่เก็บไว้จากตอนสร้างครั้งแรก) แทนที่จะสร้างอันใหม่ซ้อนขึ้นมาทุกครั้งที่กด sync ซ้ำ
async function updateCalendarEvent(accessToken, eventId, evt) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
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
// ลบอีเวนต์ในปฏิทิน — 404/410 แปลว่าถูกลบไปแล้ว (เช่น ผู้ใช้ลบเองในปฏิทิน) ให้ถือว่าสำเร็จ ไม่ต้อง throw error
async function deleteCalendarEvent(accessToken, eventId) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) { const err = await res.json().catch(() => ({})); throw new Error((err.error && err.error.message) || `HTTP ${res.status}`); }
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
  const holdingsValue = (a.holdings && a.holdings.length > 0) ? a.holdings.reduce((s, h) => s + holdingMarketValueTHB(h), 0) : Number(a.value || 0);
  let cashTHB;
  if (a.category === 'dime') {
    const fx = Number(a.cashBalanceFx || 36);
    cashTHB = Number(a.cashBalanceTHB || 0) + (Number(a.cashBalanceUSD || 0) + Number(a.cashBalanceFCD || 0)) * fx;
  } else {
    cashTHB = Number(a.cashBalance || 0);
  }
  return holdingsValue + cashTHB;
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

// เก็บ log ล่าสุดไว้ดูในแอปได้เลย โดยไม่ต้องต่อคอมพิวเตอร์ — สำหรับดีบักบนมือถือ (เก็บไว้ใช้ต่อได้เผื่อมีปัญหาในอนาคต)
const DEBUG_LOG_BUFFER = [];
function pushDebugLog(level, args) {
  try {
    const text = args.map((a) => (a instanceof Error ? (a.message || String(a)) : (typeof a === 'object' ? JSON.stringify(a) : String(a)))).join(' ');
    DEBUG_LOG_BUFFER.push({ t: new Date().toISOString().slice(11, 19), level, text });
    if (DEBUG_LOG_BUFFER.length > 60) DEBUG_LOG_BUFFER.shift();
  } catch (e) { /* ignore */ }
}
if (typeof window !== 'undefined' && !window.__debugLogPatched) {
  window.__debugLogPatched = true;
  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  const origLog = console.log.bind(console);
  console.error = (...args) => { pushDebugLog('error', args); origError(...args); };
  console.warn = (...args) => { pushDebugLog('warn', args); origWarn(...args); };
  console.log = (...args) => { pushDebugLog('log', args); origLog(...args); };
}

// ถ้าโค้ดตรงไหนพังตอน render ปกติ React จะถอดทั้งแอปออกไปเฉยๆ กลายเป็นหน้าขาวโล่ง (ปุ่ม 🐞 ก็หายไปด้วยเพราะเป็นส่วนหนึ่งของแอปที่พัง)
// ตัวจับ error นี้จะดักไว้ก่อน แสดงข้อความ error จริงๆ ให้เห็นบนจอแทน จะได้รู้ทันทีว่าโค้ดพังตรงไหน ไม่ต้องเดาอีก
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App crashed (caught by ErrorBoundary)', error, info && info.componentStack); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Sarabun, sans-serif', background: '#FFF8F0', minHeight: '100vh' }}>
          <p style={{ color: '#E1483F', fontWeight: 700, marginBottom: 10, fontSize: 15 }}>⚠️ เกิดข้อผิดพลาดในแอป</p>
          <p style={{ fontSize: 13, color: '#2B2118', marginBottom: 16, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{String((this.state.error && this.state.error.message) || this.state.error)}</p>
          <p style={{ fontSize: 11, color: '#9A8A78', marginBottom: 16 }}>ช่วยแคปหน้าจอนี้ทั้งหมดส่งมาให้ดูได้เลยครับ จะช่วยแก้ได้ตรงจุด</p>
          <button onClick={() => this.setState({ error: null })} style={{ background: '#2B2118', color: 'white', padding: '10px 18px', borderRadius: 10, border: 'none', fontFamily: 'Sarabun, sans-serif' }}>ลองใหม่</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><AuthGate>{(user) => <Tracker user={user} />}</AuthGate></ErrorBoundary>;
}function Tracker({ user }) {
  const [state, setState] = useState(null);
  const appliedLastTabRef = useRef(false);
  const stateRef = useRef(null);
  const [tab, setTab] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    if (path.indexOf('/expense') === 0) return 'expenses';
    if (path.indexOf('/realestate') === 0) return 'realestate';
    if (new URLSearchParams(window.location.search).get('quick') === 'expense') return 'expenses';
    // รองรับลิงก์เปิดแอปตรงไปยังแท็บที่ต้องการ เช่น จากปุ่ม "เปิดในแอป" ในการ์ด LINE Flex Message: ?tab=pets
    const validTabs = ['dashboard', 'accounts', 'savings', 'income', 'reports', 'expenses', 'pets', 'realestate', 'insurance'];
    const tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam && validTabs.includes(tabParam)) return tabParam;
    return 'dashboard';
  });
  const [shareMode, setShareMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [calendarError, setCalendarError] = useState('');
  const [reconnecting, setReconnecting] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pendingWrites, setPendingWrites] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);
  const [headerPhotoOverride, setHeaderPhotoOverride] = useState(null); // รูปจริงของลูก/ทรัพย์สินที่กำลังเลือกดูอยู่ ใช้แทน emoji ใน header
  useEffect(() => { if (tab !== 'pets' && tab !== 'realestate') setHeaderPhotoOverride(null); }, [tab]);
  const [debugTick, setDebugTick] = useState(0);
  useEffect(() => {
    if (!debugOpen) return;
    const id = setInterval(() => setDebugTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [debugOpen]);

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
      if (data.refresh_token) persist({ ...stateRef.current, googleRefreshToken: data.refresh_token });
    } catch (e) { setCalendarError(e.message); }
  }
  function disconnectCalendar() {
    setGoogleToken(null);
    persist({ ...state, googleRefreshToken: '' });
  }
  // access token ของ Google หมดอายุทุกๆ ~1 ชม. แต่ระบบ reconnect อัตโนมัติเดิมรันแค่ครั้งเดียวตอนเปิดแอป
  // ถ้าเปิดแอปค้างไว้นานแล้วมา sync ปฏิทินทีหลัง จะเจอ error "invalid authentication credentials" แบบนี้ทุกครั้ง
  // ฟังก์ชันนี้ครอบการเรียก Calendar API ไว้ ถ้าเจอ error แบบ token หมดอายุ จะรีเฟรช token ให้อัตโนมัติแล้วลองใหม่อีก 1 ครั้งก่อนจะยอมแพ้จริงๆ
  async function withGoogleTokenRetry(apiCall) {
    try {
      return await apiCall(googleToken);
    } catch (e) {
      const authErr = /invalid authentication credentials|unauthorized|401/i.test(e.message || '');
      if (authErr && state && state.googleRefreshToken && state.googleClientId) {
        const data = await refreshGoogleAccessToken(state.googleClientId, state.googleRefreshToken);
        setGoogleToken(data.access_token);
        return await apiCall(data.access_token);
      }
      throw e;
    }
  }
  // ลบอีเวนต์ปฏิทินที่เคยผูกไว้กับรายการ เรียกตอนลบรายการต้นทางทิ้ง — fire-and-forget เหมือน sendLineNotify เพราะไม่ควรบล็อกการลบรายการหลัก แม้ไม่ได้เชื่อมต่อปฏิทินอยู่ก็แค่ข้ามเงียบๆ ไป
  function deleteLinkedCalendarEvent(eventId) {
    if (!eventId || !googleToken) return;
    withGoogleTokenRetry((token) => deleteCalendarEvent(token, eventId)).catch((e) => console.error('deleteCalendarEvent failed', e));
  }
  async function addAppointmentToCalendar(dogName, appt, existingEventId) {
    if (!googleToken) { setCalendarError('ยังไม่ได้เชื่อมต่อ Google Calendar'); return { ok: false }; }
    try {
      const startDateTime = `${appt.date}T${appt.time || '09:00'}:00`;
      const start = new Date(startDateTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const pad = (n) => String(n).padStart(2, '0');
      const endDateTime = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
      const days = (appt.reminderDays && appt.reminderDays.length > 0) ? appt.reminderDays : [7, 3, 1];
      const reminders = days.map((d) => ({ method: 'popup', minutes: d * 24 * 60 })).concat([{ method: 'popup', minutes: 120 }]);
      const evt = {
        summary: `นัดสัตวแพทย์: ${dogName}${appt.purpose ? ' - ' + appt.purpose : ''}`,
        description: `โรงพยาบาล: ${appt.hospital || '-'}\nหมอ: ${appt.doctor || '-'}`,
        startDateTime, endDateTime, reminders,
      };
      if (existingEventId) {
        await withGoogleTokenRetry((token) => updateCalendarEvent(token, existingEventId, evt));
        return { ok: true, eventId: existingEventId };
      }
      const created = await withGoogleTokenRetry((token) => createCalendarEvent(token, evt));
      return { ok: true, eventId: created.id };
    } catch (e) { return { ok: false, message: e.message }; }
  }
  async function addPropertyEventToCalendar(summary, description, date, reminderDays, existingEventId) {
    if (!googleToken) { setCalendarError('ยังไม่ได้เชื่อมต่อ Google Calendar'); return { ok: false }; }
    try {
      const startDateTime = `${date}T09:00:00`;
      const endDateTime = `${date}T10:00:00`;
      const days = (reminderDays && reminderDays.length > 0) ? reminderDays : [7, 3, 1];
      const reminders = days.map((d) => ({ method: 'popup', minutes: d * 24 * 60 }));
      if (existingEventId) {
        await withGoogleTokenRetry((token) => updateCalendarEvent(token, existingEventId, { summary, description, startDateTime, endDateTime, reminders }));
        return { ok: true, eventId: existingEventId };
      }
      const created = await withGoogleTokenRetry((token) => createCalendarEvent(token, { summary, description, startDateTime, endDateTime, reminders }));
      return { ok: true, eventId: created.id };
    } catch (e) { return { ok: false, message: e.message }; }
  }

  // ฟีเจอร์ II: AI Insight สรุปภาพรวมประจำวัน (รันอัตโนมัติวันละ 1 ครั้ง)
  // ฟีเจอร์ใหม่: AI วิเคราะห์สุขภาพลูกๆ สรุปให้ในหน้าภาพรวมของแต่ละตัว (อัปเดตวันละครั้งต่อตัว)
  async function runDogHealthInsight(dogId) {
    const d = dogs.find((x) => x.id === dogId);
    if (!d) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (d.aiHealthInsight && d.aiHealthInsight.date === todayStr) return; // คำนวณไปแล้ววันนี้
    try {
      const sortedWeights = [...(d.weights || [])].sort((a, b) => a.date.localeCompare(b.date));
      const weightTrend = sortedWeights.slice(-5).map((w) => `${w.date}: ${w.weight}กก.`).join(', ');
      const activeMeds = (d.medications || []).filter((m) => !m.stopDate).map((m) => m.name).join(', ');
      const recentBlood = [...(d.bloodTests || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((r) => `${r.date} ${r.type}: ${r.note || 'ไม่มีบันทึกผล'}`).join(' | ');
      const recentImaging = [...(d.imaging || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((r) => `${r.date} ${r.type}: ${r.note || 'ไม่มีบันทึกผล'}`).join(' | ');
      const lastVisit = [...(d.vetVisits || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
      const insuranceEnd = d.insurance?.endDate || 'ไม่มีข้อมูล';
      const prompt = `คุณเป็นผู้ช่วยสรุปข้อมูลสุขภาพสัตว์เลี้ยงให้เจ้าของ (ไม่ใช่สัตวแพทย์ ไม่ได้วินิจฉัยโรค) ข้อมูลของ "${d.name}" (${d.breed || 'ไม่ระบุพันธุ์'}):
โรคประจำตัว: ${d.chronicDiseases || 'ไม่มี'}
แพ้ยา: ${d.drugAllergies || 'ไม่มี'}
ยาที่กินอยู่ตอนนี้: ${activeMeds || 'ไม่มี'}
แนวโน้มน้ำหนักล่าสุด: ${weightTrend || 'ไม่มีข้อมูล'}
ผลเลือดล่าสุด: ${recentBlood || 'ไม่มีข้อมูล'}
ผล Imaging ล่าสุด: ${recentImaging || 'ไม่มีข้อมูล'}
ไปหาหมอล่าสุด: ${lastVisit ? `${lastVisit.date} ที่ ${lastVisit.hospital} เหตุผล: ${lastVisit.reason}` : 'ไม่มีข้อมูล'}
วันหมดอายุประกัน: ${insuranceEnd}
ช่วยสรุปเป็นภาษาไทยสั้นๆ 2-3 ประเด็นที่ควรระวัง/ติดตาม หรือแนวโน้มที่น่าสนใจ แต่ละข้อไม่เกิน 1 บรรทัด ตอบเป็น bullet เท่านั้น ห้ามวินิจฉัยโรคหรือฟันธง ให้เป็นการสรุปข้อมูลเพื่อช่วยเตือนความจำเจ้าของเท่านั้น`;
      const text = await askServer(prompt);
      updateDog(dogId, { aiHealthInsight: { date: todayStr, text: text || '' } });
    } catch (e) { /* เงียบไว้ ถ้ามีข้อความเก่าอยู่แล้วให้ใช้ต่อไป */ }
  }

  async function runDailyInsight() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (state?.aiInsight && state.aiInsight.date === todayStr) return; // คำนวณไปแล้ววันนี้
    try {
      const holdingLines = accounts.filter((a) => HOLDING_CATEGORIES.includes(a.category)).flatMap((a) => (a.holdings || []).map((h) => {
        const mv = holdingMarketValueTHB(h); const cb = holdingCostBasisTHB(h); const gp = cb ? ((mv - cb) / cb) * 100 : 0;
        return `${h.symbol}: มูลค่า ${fmt(mv)} บาท ${gp >= 0 ? '+' : ''}${gp.toFixed(1)}%`;
      }));
      const ym = thisMonth();
      const rentTotal = properties.reduce((s, p) => s + (p.status === 'occupied' ? Number(p.rent || 0) : 0), 0);
      const rentCollected = properties.reduce((s, p) => { const pay = (p.payments || {})[ym]; return s + (pay && pay.paid ? Number(pay.amount || p.rent || 0) : 0); }, 0);
      const pendingProps = properties.filter((p) => { const pay = (p.payments || {})[ym]; return p.status === 'occupied' && !(pay && pay.paid); }).map((p) => p.name);
      const petExpenseTotal = dogs.reduce((s, d) => s + (d.expenses || []).reduce((s2, e) => s2 + Number(e.amount || 0), 0), 0);
      const divTotal = accounts.filter((a) => HOLDING_CATEGORIES.includes(a.category)).flatMap((a) => a.holdings || []).reduce((s, h) => s + (h.dividends || []).filter((d) => monthKey(d.date) === ym).reduce((s2, d) => s2 + Number(d.amount || 0), 0), 0);
      const monthExpense = expenses.filter((e) => monthKey(e.date) === ym).reduce((s, e) => s + Number(e.amount || 0), 0);
      const prompt = `คุณเป็นผู้ช่วยสรุปภาพรวมการเงินประจำวัน ข้อมูลปัจจุบันของผู้ใช้:
หุ้น/กองทุนแต่ละตัว: ${holdingLines.join(', ') || 'ไม่มีข้อมูล'}
ค่าเช่าเดือนนี้: ควรได้ ${fmt(rentTotal)} บาท เก็บแล้ว ${fmt(rentCollected)} บาท ${pendingProps.length ? `ยังค้าง: ${pendingProps.join(', ')}` : 'เก็บครบแล้ว'}
เงินปันผลเดือนนี้: ${fmt(divTotal)} บาท
ค่าใช้จ่ายลูก (สัตว์เลี้ยง) สะสม: ${fmt(petExpenseTotal)} บาท
รายจ่ายส่วนตัวเดือนนี้: ${fmt(monthExpense)} บาท
ช่วยสรุปเป็นข้อความสั้นๆ ภาษาไทย เลือกเฉพาะ 2-3 ประเด็นที่สำคัญ/น่าสนใจที่สุด (ไม่ต้องพูดทุกเรื่อง) แต่ละประเด็นไม่เกิน 1 บรรทัด ไม่ต้องมีคำนำหรือสรุปปิดท้าย ตอบเป็น bullet 2-3 ข้อเท่านั้น`;
      const text = await askServer(prompt);
      persist({ ...stateRef.current, aiInsight: { date: todayStr, text: text || '' } });
    } catch (e) { /* เงียบไว้ ถ้าเคยมีข้อความเก่าอยู่แล้วให้ใช้ต่อไป */ }
  }

  // ฟีเจอร์ SS: รีเฟรชราคาหุ้น/กองทุน/FX อัตโนมัติ วันละ 1 ครั้ง
  // สำคัญ: ฟังก์ชันนี้ทำงานเบื้องหลังนาน (ทีละหุ้น รอ API ทีละตัว) ถ้าระหว่างนั้นผู้ใช้บันทึกอย่างอื่น (เช่น เงินเข้า)
  // ห้ามเขียนทับด้วยข้อมูลเก่าที่ค้างอยู่ตอนเริ่มฟังก์ชัน จึงต้อง (1) ไม่ persist ระหว่าง loop เลย แค่เก็บผลไว้ในตัวแปรท้องถิ่น
  // (2) พอ loop เสร็จ ค่อย merge ผลที่ได้เข้ากับ stateRef.current/sharedStateRef.current ที่เป็นข้อมูลล่าสุดจริง ณ ตอนนั้น แล้ว persist ทีเดียว
  async function runDailyPriceRefresh() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (stateRef.current?.lastPriceRefreshDate === todayStr) return; // รีเฟรชไปแล้ววันนี้
    const startAccounts = [...(stateRef.current?.accounts || []), ...(sharedStateRef.current?.accounts || [])];
    const fxRate = await fetchFxRateOnly();
    const priceUpdates = {}; // holdingId -> { currentPrice, lastUpdated }
    for (const a of startAccounts) {
      if (!HOLDING_CATEGORIES.includes(a.category)) continue;
      for (const h of (a.holdings || [])) {
        if (!h.symbol) continue;
        try {
          const result = await fetchHoldingPriceOnly(h.symbol, h.currency, stateRef.current?.finnhubKey);
          if (result.ok) priceUpdates[h.id] = { currentPrice: result.price, lastUpdated: todayStr };
        } catch (e) { /* ข้ามตัวที่ error ไปทำตัวถัดไป */ }
      }
    }
    // merge ผลลัพธ์เข้ากับข้อมูลล่าสุดจริง (ไม่ใช่ข้อมูลตอนเริ่ม loop) กันเขียนทับของที่ผู้ใช้เพิ่งบันทึกไประหว่างรีเฟรช
    function applyUpdates(list) {
      return (list || []).map((a) => {
        if (!a.holdings) return a;
        let changed = false;
        const holdings = a.holdings.map((h) => {
          const patch = {};
          if (priceUpdates[h.id]) { Object.assign(patch, priceUpdates[h.id]); changed = true; }
          if (h.currency === 'USD' && fxRate) { patch.currentFx = fxRate; changed = true; }
          return changed && Object.keys(patch).length ? { ...h, ...patch } : h;
        });
        return changed ? { ...a, holdings } : a;
      });
    }
    const freshState = stateRef.current;
    const freshShared = sharedStateRef.current;
    if (freshState) persist({ ...freshState, accounts: applyUpdates(freshState.accounts), lastPriceRefreshDate: todayStr });
    if (freshShared) persistShared({ ...freshShared, accounts: applyUpdates(freshShared.accounts) });
  }

  const FAMILY_SHARE_ID = 'krangya-family';
  const docRef = doc(db, 'users', user.uid, 'data', 'portfolio');
  const sharedDocRef = doc(db, 'shared', FAMILY_SHARE_ID, 'data', 'main');
  const [sharedState, setSharedState] = useState(null);
  const sharedStateRef = useRef(null);

  useEffect(() => {
    (async () => {
     try {
      const snap = await getDoc(docRef);
      let data;
      if (snap.exists()) {
        data = { ...EMPTY_STATE, ...snap.data() };
        const cutoff = Date.now() - 90 * 24 * 3600 * 1000;
        const prunedExpenses = (data.expenses || []).filter((e) => new Date(e.date).getTime() >= cutoff);
        if (prunedExpenses.length !== (data.expenses || []).length) {
          data = { ...data, expenses: prunedExpenses };
          updateDoc(docRef, { expenses: prunedExpenses }).catch((e) => { console.error('prune save failed', e); setSaveError(`บันทึกไม่สำเร็จ (ตัดรายจ่ายเก่า): ${e.message || e.code || e}`); });
        }
      } else { data = EMPTY_STATE; await setDoc(docRef, EMPTY_STATE); }

      // ฟีเจอร์ GG: โหลดเอกสารข้อมูลที่ใช้ร่วมกับภรรยา (ลูกๆ, บ้านเช่า, สหกรณ์, กองทุน DIME/WealthX)
      const sharedSnap = await getDoc(sharedDocRef);
      let shared = sharedSnap.exists() ? sharedSnap.data() : { dogs: [], properties: [], accounts: [] };
      let dataChanged = false;
      let sharedChanged = false;
      // เก็บเฉพาะฟิลด์ที่เปลี่ยนจริงๆ ไว้ใน patch แยกต่างหาก แล้วค่อยเขียนแบบ updateDoc (merge เฉพาะฟิลด์นี้)
      // แทนการ setDoc ทั้งก้อนแบบเดิม — กันไม่ให้ข้อมูลอื่น (เช่น เงินเข้า/รายจ่าย ของ Tommy หรือข้อมูลของภรรยาในฝั่ง shared)
      // ถูกเขียนทับ ถ้า snapshot ที่อ่านมาตอนนี้ดันเก่ากว่าที่อยู่จริงบนเซิร์ฟเวอร์ (เช่น แคชค้างตอนสลับแอปไปมา)
      const dataPatch = {};
      const sharedPatch = {};

      // ย้ายลูกๆ/บ้านเช่าไปยังส่วนที่ใช้ร่วมกัน (ทำครั้งแรกครั้งเดียว)
      if (!data.migratedToShared) {
        const dogsToMove = (data.dogs && data.dogs.length > 0) ? data.dogs : [];
        const propsToMove = (data.properties && data.properties.length > 0) ? data.properties : [];
        if (dogsToMove.length || propsToMove.length) {
          shared = {
            ...shared,
            dogs: shared.dogs && shared.dogs.length > 0 ? shared.dogs : dogsToMove,
            properties: shared.properties && shared.properties.length > 0 ? shared.properties : propsToMove,
          };
          sharedPatch.dogs = shared.dogs; sharedPatch.properties = shared.properties;
          sharedChanged = true;
        }
        data = { ...data, dogs: [], properties: [], migratedToShared: true };
        dataPatch.dogs = []; dataPatch.properties = []; dataPatch.migratedToShared = true;
        dataChanged = true;
      }

      // ตรวจสอบบัญชีที่ควรแชร์ (สหกรณ์ทั้งหมด + กองทุนรวมที่เป็น DIME/WealthX) — เช็คทุกครั้งที่เปิดแอป เผื่อมีบัญชีใหม่/ตกหล่น
      const isSharedAccount = (a) => {
        if (a.category === 'cooperative') return true;
        if (a.category === 'mutual_fund') {
          const text = `${a.name || ''} ${a.platform || ''}`.toLowerCase();
          return text.includes('wealth') || text.includes('ดาม') || text.includes('dime');
        }
        return false;
      };
      const accountsToMove = (data.accounts || []).filter(isSharedAccount);
      if (accountsToMove.length) {
        shared = {
          ...shared,
          accounts: [...(shared.accounts || []), ...accountsToMove.filter((a) => !(shared.accounts || []).some((sa) => sa.id === a.id))],
        };
        const remainingAccounts = (data.accounts || []).filter((a) => !accountsToMove.some((m) => m.id === a.id));
        data = { ...data, accounts: remainingAccounts };
        dataPatch.accounts = remainingAccounts;
        sharedPatch.accounts = shared.accounts;
        dataChanged = true; sharedChanged = true;
      }
      if (sharedChanged) await updateDoc(sharedDocRef, sharedPatch).catch((e) => { console.error('shared migrate save failed', e); setSaveError(`บันทึกไม่สำเร็จ (ย้ายข้อมูลแชร์): ${e.message || e.code || e}`); });
      if (dataChanged) await updateDoc(docRef, dataPatch).catch((e) => { console.error('migrate save failed', e); setSaveError(`บันทึกไม่สำเร็จ (ย้ายบัญชี): ${e.message || e.code || e}`); });

      setSharedState(shared);
      setState(data);
      stateRef.current = data;
      sharedStateRef.current = shared;
      // จำหน้าที่เปิดล่าสุด — ใช้ได้เฉพาะตอนเข้าหน้าแรกปกติ (ไม่ใช่ deep-link เฉพาะ เช่น /expense) และต้องเปิดใช้ในตั้งค่าไว้ก่อน
      if (!appliedLastTabRef.current) {
        appliedLastTabRef.current = true;
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        const isPlainEntry = path.indexOf('/expense') !== 0 && path.indexOf('/realestate') !== 0 && new URLSearchParams(window.location.search).get('quick') !== 'expense';
        if (isPlainEntry && data.openToLastTab && data.lastUsedTab) setTab(data.lastUsedTab);
      }
     } catch (e) {
       console.error('initial load failed', e);
       setSaveError(`โหลดข้อมูลไม่สำเร็จ: ${e.message || e.code || e}`);
     }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  // กันเผื่อกรณีการเชื่อมต่อ Firestore ค้าง (เช่น เน็ตมีปัญหา) ไม่ให้แถบ "กำลังบันทึก" ค้างวนไม่จบไม่สิ้นโดยไม่บอกอะไรเลย
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`หมดเวลารอ (เกิน ${Math.round(ms / 1000)} วิ) — เช็คสัญญาณอินเทอร์เน็ตแล้วลองใหม่: ${label}`)), ms)),
    ]);
  }
  // ทุกครั้งที่ persist/persistShared เขียนข้อมูล ให้ ref ตามทันเสมอ
  // ป้องกันงานเบื้องหลังที่ทำงานนาน (เช่น รีเฟรชราคาหุ้นทุกตัว, AI insight) เขียนทับข้อมูลใหม่ที่ผู้ใช้เพิ่งบันทึกไประหว่างที่มันทำงานอยู่
  // Firestore (ทั้ง setDoc/updateDoc/arrayUnion) ไม่ยอมรับ field ที่เป็น undefined เลยไม่ว่าจะอยู่ลึกแค่ไหนในอ็อบเจกต์
  // ต้องตัดออกแบบลงลึกทุกชั้น (deep) ก่อนเขียนเสมอ ไม่งั้นจะ throw ทันที — จุดนี้คือสาเหตุของบั๊ก "คัดลอกไปยังตัวอื่น" ที่พังทุกเมนู
  function stripUndefined(obj) {
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
      const out = {};
      Object.keys(obj).forEach((k) => { if (obj[k] !== undefined) out[k] = stripUndefined(obj[k]); });
      return out;
    }
    return obj;
  }
  // จำหน้าที่ใช้ล่าสุดไว้เบาๆ (แค่ field เดียว ไม่เขียนทับข้อมูลทั้งก้อน) เผื่อผู้ใช้เปิดใช้ "จำหน้าที่ใช้ล่าสุด" ไว้ในตั้งค่า
  useEffect(() => {
    if (!state) return;
    if (state.lastUsedTab === tab) return;
    stateRef.current = stateRef.current ? { ...stateRef.current, lastUsedTab: tab } : stateRef.current;
    updateDoc(docRef, { lastUsedTab: tab }).catch((e) => console.error('save lastUsedTab failed', e));
  }, [tab]);
  function persist(rawNext) {
    const next = stripUndefined(rawNext);
    setState(next); stateRef.current = next;
    setPendingWrites((n) => n + 1);
    try {
      withTimeout(setDoc(docRef, next), 15000, 'บันทึกข้อมูล')
        .catch((e) => { console.error('save failed', e); setSaveError(`บันทึกไม่สำเร็จ: ${e.message || e.code || e}`); })
        .finally(() => setPendingWrites((n) => Math.max(0, n - 1)));
    } catch (e) {
      console.error('save failed (sync)', e);
      setSaveError(`บันทึกไม่สำเร็จ (sync): ${e.message || e.code || e}`);
      setPendingWrites((n) => Math.max(0, n - 1));
    }
  }
  // สำคัญ: ใช้สำหรับรายการที่ "เพิ่มเข้าไปในลิสต์" บ่อยๆ เช่น เงินเข้า/รายจ่าย — เขียนแบบ arrayUnion ที่ Firestore
  // จะเติมเข้าไปในเอกสารจริงบนเซิร์ฟเวอร์เสมอ ไม่ว่า state ฝั่งเครื่องจะเก่าแค่ไหน (เช่น เปิดแอปค้างไว้นาน สลับแอปไปมา
  // หรือมีงานเบื้องหลังทำงานช้าอยู่) ป้องกันปัญหาข้อมูลหายที่เจอมาก่อนหน้านี้ได้แน่นอนกว่าการเขียนทับทั้งก้อนแบบเดิม
  function persistAppend(fieldName, rawItem) {
    const newItem = stripUndefined(rawItem);
    const base = stateRef.current || state;
    const next = { ...base, [fieldName]: [newItem, ...((base && base[fieldName]) || [])] };
    setState(next); stateRef.current = next;
    setPendingWrites((n) => n + 1);
    try {
      withTimeout(updateDoc(docRef, { [fieldName]: arrayUnion(newItem) }), 15000, fieldName)
        .catch((e) => { console.error('append save failed', e); setSaveError(`บันทึกไม่สำเร็จ (${fieldName}): ${e.message || e.code || e}`); })
        .finally(() => setPendingWrites((n) => Math.max(0, n - 1)));
    } catch (e) {
      console.error('append save failed (sync)', e);
      setSaveError(`บันทึกไม่สำเร็จ (${fieldName}, sync): ${e.message || e.code || e}`);
      setPendingWrites((n) => Math.max(0, n - 1));
    }
  }
  function persistShared(rawNext) {
    const next = stripUndefined(rawNext);
    setSharedState(next); sharedStateRef.current = next;
    setPendingWrites((n) => n + 1);
    try {
      withTimeout(setDoc(sharedDocRef, next), 15000, 'ข้อมูลแชร์')
        .catch((e) => { console.error('shared save failed', e); setSaveError(`บันทึกไม่สำเร็จ (ข้อมูลแชร์): ${e.message || e.code || e}`); })
        .finally(() => setPendingWrites((n) => Math.max(0, n - 1)));
    } catch (e) {
      console.error('shared save failed (sync)', e);
      setSaveError(`บันทึกไม่สำเร็จ (ข้อมูลแชร์, sync): ${e.message || e.code || e}`);
      setPendingWrites((n) => Math.max(0, n - 1));
    }
  }
  function refreshSharedData() { getDoc(sharedDocRef).then((snap) => { if (snap.exists()) { setSharedState(snap.data()); sharedStateRef.current = snap.data(); } }); }

  // ฟีเจอร์ GG: บัญชีที่แชร์กับภรรยา (WealthX ทั้งหมด + DIME กองทุน) รวมเข้ากับบัญชีส่วนตัว พร้อมป้าย _shared
  function persistAccountsFull(nextAccountsFull) {
    const personalOnes = nextAccountsFull.filter((a) => !a._shared);
    const sharedOnes = nextAccountsFull.filter((a) => a._shared).map((a) => { const { _shared, ...rest } = a; return rest; });
    persist({ ...state, accounts: personalOnes });
    persistShared({ ...sharedState, accounts: sharedOnes });
  }

  const accounts = useMemo(() => [
    ...(state?.accounts || []).map((a) => ({ ...a, _shared: false })),
    ...((sharedState?.accounts) || []).map((a) => ({ ...a, _shared: true })),
  ], [state, sharedState]);
  const income = state?.income || [];
  const contributions = state?.contributions || [];
  const history = state?.history || [];
  const expenses = state?.expenses || [];
  const expenseCategories = state?.expenseCategories || ['อาหาร', 'เดินทาง', 'ของใช้', 'บันเทิง', 'สุขภาพ', 'อื่นๆ'];
  const creditCards = state?.creditCards || [];
  const dogs = (sharedState?.dogs && sharedState.dogs.length > 0) ? sharedState.dogs : DEFAULT_DOGS;
  const properties = (sharedState?.properties && sharedState.properties.length > 0) ? sharedState.properties : DEFAULT_PROPERTIES;
  // สรุปสิ่งที่ต้องรีบทำ/ต้องระวังของแต่ละแท็บ ใช้โชว์ในหัวเรื่องเล็กแทนตัวเลขสินทรัพย์สุทธิ (ยกเว้นหน้าภาพรวมที่ยังโชว์แบบเดิม)
  const tabAlert = useMemo(() => {
    if (tab === 'pets') {
      const items = [];
      (dogs || []).forEach((d) => (d.appointments || []).forEach((a) => { const dl = daysUntil(a.date); if (dl !== null && dl >= 0) items.push({ dogName: d.name, purpose: a.purpose || 'นัดหมาย', date: a.date, daysLeft: dl }); }));
      items.sort((a, b) => a.daysLeft - b.daysLeft);
      const nearest = items[0];
      if (!nearest) return { tone: 'ok', icon: '✅', title: 'ยังไม่มีนัดหมายบันทึกไว้', sub: '' };
      if (nearest.daysLeft <= 7) return { tone: nearest.daysLeft <= 1 ? 'bad' : 'warn', icon: '⚠️', title: `${nearest.dogName} มีนัด "${nearest.purpose}" อีก ${nearest.daysLeft} วัน`, sub: formatDateDMY(nearest.date) };
      return { tone: 'ok', icon: '✅', title: 'ไม่มีนัดด่วนใน 7 วันนี้', sub: `นัดถัดไป: ${nearest.dogName} ${formatDateDMY(nearest.date)}` };
    }
    if (tab === 'realestate') {
      const ym = thisMonth();
      const overdue = (properties || []).find((p) => { if (p.status !== 'occupied' || !p.rentDueDay) return false; const pay = (p.payments || {})[ym]; if (pay && pay.paid) return false; const due = new Date(new Date().getFullYear(), new Date().getMonth(), Number(p.rentDueDay)); return due < new Date(); });
      if (overdue) return { tone: 'bad', icon: '🔴', title: `${overdue.name} ค้างชำระค่าเช่า`, sub: `฿${fmt(overdue.rent)} · เลยกำหนด ${overdue.rentDueDay} ${THAI_MONTHS[new Date().getMonth()]}` };
      const contracts = (properties || []).filter((p) => p.contractEndDate).map((p) => ({ ...p, dl: daysUntil(p.contractEndDate) })).filter((p) => p.dl !== null && p.dl >= 0 && p.dl <= 60).sort((a, b) => a.dl - b.dl);
      if (contracts[0]) return { tone: 'warn', icon: '⚠️', title: `${contracts[0].name} ใกล้ครบสัญญา`, sub: `อีก ${contracts[0].dl} วัน` };
      return { tone: 'ok', icon: '✅', title: 'เก็บค่าเช่าครบทุกหลังแล้ว', sub: '' };
    }
    if (tab === 'expenses') {
      const upcoming = (creditCards || []).map((c) => { const dl = daysUntil(monthKey(new Date().toISOString().slice(0, 10)) + '-' + String(c.dueDay || 15).padStart(2, '0')); return { ...c, dl }; }).filter((c) => c.dl !== null && c.dl >= 0 && c.dl <= 5).sort((a, b) => a.dl - b.dl);
      if (upcoming[0]) return { tone: upcoming[0].dl <= 1 ? 'bad' : 'warn', icon: '💳', title: `บัตร ${upcoming[0].cardName || upcoming[0].bankName} ครบกำหนดจ่ายอีก ${upcoming[0].dl} วัน`, sub: '' };
      return { tone: 'ok', icon: '✅', title: 'ไม่มีบัตรใกล้ครบกำหนดจ่าย', sub: '' };
    }
    if (tab === 'savings') {
      const realIds = accounts.map((a) => a.id);
      const pending = (contributions || []).filter((c) => c.accountId && !realIds.includes(c.accountId)).sort((a, b) => a.date.localeCompare(b.date))[0];
      if (pending) { const daysSince = Math.abs(daysUntil(pending.date)); return { tone: daysSince >= 7 ? 'warn' : 'ok', icon: '💰', title: `มีเงิน ฿${fmt(pending.amount)} ค้างใน "${pending.accountId}"`, sub: daysSince > 0 ? `ยังไม่ได้ย้ายไปลงทุน มา ${daysSince} วันแล้ว` : 'เพิ่งบันทึกวันนี้' }; }
      return { tone: 'ok', icon: '✅', title: 'เงินเข้าทุกรายการลงบัญชีจริงแล้ว', sub: '' };
    }
    return null;
  }, [tab, dogs, properties, creditCards, contributions, accounts]);
  const hospitalList = state?.hospitalList || ['โรงพยาบาลสัตว์เล็กเกษตร', 'โรงพยาบาลสัตว์เล็กจุฬาฯ', 'Central West Animal Hospital', 'โรงพยาบาลสัตว์ทองหล่อ', 'โรงพยาบาลสัตว์อารักษ์', 'โรงพยาบาลสัตว์นครสวรรค์ (Big C)'];
  const doctorList = state?.doctorList || [];
  const departmentList = state?.departmentList || ['แผนกฉุกเฉิน', 'อายุรกรรมทั่วไป', 'ตา', 'ศัลยกรรม', 'ผิวหนัง', 'ต่อมไร้ท่อ'];
  const doctorDepartments = state?.doctorDepartments || {};
  const customDestinationList = state?.customDestinationList || [];
  const bloodTestTypeList = state?.bloodTestTypeList || BLOOD_TEST_TYPES;
  const organTypeList = state?.organTypeList || ORGAN_TYPES;
  const imagingTypeList = state?.imagingTypeList || IMAGING_TYPES;
  const weigherList = state?.weigherList || ['พ่อ', 'แม่'];
  const medicationList = state?.medicationList || [];

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
  const yearAgoKey = useMemo(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 7); }, []);
  const yearSnapshot = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));
    return sorted.find((h) => h.month >= yearAgoKey) || sorted[0];
  }, [history, yearAgoKey]);
  const firstSnapshot = useMemo(() => [...history].sort((a, b) => a.month.localeCompare(b.month))[0], [history]);

  // ฟีเจอร์ JJ: ค่าสำหรับการ์ดหมวดหมู่ 8 ช่องในหน้า Dashboard
  const catSetValue = useMemo(() => accounts.filter((a) => a.category === 'set_stock').reduce((s, a) => s + accountValueTHB(a), 0), [accounts]);
  const catUsValue = useMemo(() => accounts.filter((a) => a.category === 'dime').reduce((s, a) => s + accountValueTHB(a), 0), [accounts]);
  const catFundValue = useMemo(() => accounts.filter((a) => a.category === 'mutual_fund').reduce((s, a) => s + accountValueTHB(a), 0), [accounts]);
  const catCoopValue = useMemo(() => accounts.filter((a) => a.category === 'cooperative').reduce((s, a) => s + accountValueTHB(a), 0), [accounts]);
  const catRentThisMonth = useMemo(() => properties.reduce((s, p) => s + (p.status === 'occupied' ? Number(p.rent || 0) : 0), 0), [properties]);
  const catRentCollected = useMemo(() => { const ym = thisMonth(); return properties.reduce((s, p) => { const pay = (p.payments || {})[ym]; return s + (pay && pay.paid ? Number(pay.amount || p.rent || 0) : 0); }, 0); }, [properties]);
  const catPetExpenseTotal = useMemo(() => dogs.reduce((s, d) => s + (d.expenses || []).reduce((s2, e) => s2 + Number(e.amount || 0), 0), 0), [dogs]);
  const catExpenseThisMonth = useMemo(() => { const ym = thisMonth(); return expenses.filter((e) => monthKey(e.date) === ym).reduce((s, e) => s + Number(e.amount || 0), 0); }, [expenses]);
  const catSavingsThisMonth = useMemo(() => { const ym = thisMonth(); return contributions.filter((c) => monthKey(c.date) === ym).reduce((s, c) => s + Number(c.amount || 0), 0); }, [contributions]);

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

  useEffect(() => {
    function handleWindowError(e) {
      console.error('window error', e.error || e.message);
      setSaveError(`เกิดข้อผิดพลาดไม่คาดคิด: ${(e.error && e.error.message) || e.message}`);
    }
    function handleRejection(e) {
      console.error('unhandled rejection', e.reason);
      setSaveError(`เกิดข้อผิดพลาดไม่คาดคิด (promise): ${(e.reason && e.reason.message) || e.reason}`);
    }
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    currentNotifyUser = (state && state.notifyDisplayName) || (user && user.email) || '';
  }, [state && state.notifyDisplayName, user]);
  useEffect(() => {
    lineNotifyEnabled = !(state && state.lineNotifyEnabled === false);
  }, [state && state.lineNotifyEnabled]);

  const dailyPriceRefreshTriggered = useRef(false);
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (pendingWrites > 0) { e.preventDefault(); e.returnValue = ''; return ''; }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingWrites]);
  useEffect(() => {
    if (state && sharedState && !dailyPriceRefreshTriggered.current) {
      dailyPriceRefreshTriggered.current = true;
      runDailyPriceRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, sharedState]);

  if (!state || !sharedState) return <div style={{ background: PAPER, minHeight: '100vh' }} className="flex items-center justify-center"><p style={{ fontFamily: 'Sarabun, sans-serif', color: INK }}>กำลังโหลดข้อมูล...</p></div>;

  const updateAccount = (id, patch) => persistAccountsFull(accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const addAccount = (category, name, value) => {
    const base = { id: uid(), category, name: name || 'บัญชีใหม่', value: value || 0 };
    if (HOLDING_CATEGORIES.includes(category)) base.holdings = [];
    persistAccountsFull([...accounts, base]);
  };
  const removeAccount = (id) => persistAccountsFull(accounts.filter((a) => a.id !== id));
  const updateIncome = (id, patch) => persist({ ...state, income: income.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const addIncome = () => persist({ ...state, income: [...income, { id: uid(), name: 'แหล่งรายได้ใหม่', amount: 0, tag: 'other' }] });
  const removeIncome = (id) => persist({ ...state, income: income.filter((i) => i.id !== id) });
  const addContribution = (entry) => {
    persistAppend('contributions', { id: uid(), ...entry });
    if (entry.source === 'rental') return; // มีข้อความแจ้งเตือนเฉพาะทางที่ addRentInstallment ส่งให้แล้ว (บอกชื่อบ้าน+ยอดขาด) กันส่งซ้ำ
    const accName = (accounts.find((a) => a.id === entry.accountId) || {}).name || entry.accountId || '';
    const srcLabel = entry.source === 'yieldtech' ? 'YieldTech' : ((SOURCES.find((s) => s.id === entry.source) || {}).label || entry.source || 'เงินเข้า');
    if (entry.source === 'personal_withdraw') {
      const wdRows = [{ label: 'วันที่', value: formatDateDMY(entry.date) }, { label: 'ปลายทาง', value: 'ใช้ส่วนตัว' }];
      if (entry.category) wdRows.push({ label: 'หมวดหมู่', value: entry.category });
      if (entry.note) wdRows.push({ label: 'โน้ต', value: entry.note });
      sendLineFlex(`ถอนจาก ${accName} ไปใช้ส่วนตัว ฿${fmt(Math.abs(Number(entry.amount || 0)))}`, buildFlexCard({
        title: `💸 ถอนออกจาก${accName ? ' ' + accName : ''}`,
        rows: wdRows,
        amount: Math.abs(Number(entry.amount || 0)), amountColor: BAD, tab: 'savings',
      }));
    } else {
      sendLineFlex(`เงินเข้า${accName ? ' ' + accName : ''} (${srcLabel}) ฿${fmt(entry.amount)}`, buildFlexCard({
        title: `💰 เงินเข้า${accName ? ' ' + accName : ''}`,
        rows: [{ label: 'วันที่', value: formatDateDMY(entry.date) }, { label: 'แหล่งที่มา', value: srcLabel }, { label: 'ปลายทาง', value: accName || '-' }],
        amount: Number(entry.amount || 0), amountColor: GOOD, tab: 'savings',
      }));
    }
  };
  const removeContribution = (id) => {
    const c = contributions.find((x) => x.id === id);
    if (c && c.calendarEventId) deleteLinkedCalendarEvent(c.calendarEventId);
    persist({ ...state, contributions: contributions.filter((x) => x.id !== id) });
  };
  const updateContribution = (id, patch) => persist({ ...state, contributions: contributions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const changeTargetDate = (d) => persist({ ...state, targetDate: d });
  const changeGoal = (v) => persist({ ...state, goalNetWorth: v });
  const changeFinnhubKey = (v) => persist({ ...state, finnhubKey: v });
  const changeGoogleClientId = (v) => persist({ ...state, googleClientId: v });
  const changeNotifyDisplayName = (v) => persist({ ...state, notifyDisplayName: v });
  const changeLineNotifyEnabled = (v) => persist({ ...state, lineNotifyEnabled: v });

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
    if (nextContributions !== contributions) persist({ ...state, contributions: nextContributions });
    persistAccountsFull(accounts.map((a) => (a.id === accountId ? { ...a, holdings: nextHoldings } : a)));
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
    const gainLabel = gain >= 0 ? `กำไร +฿${fmt(gain)}` : `ขาดทุน -฿${fmt(Math.abs(gain))}`;
    const sellRows = [{ label: 'บัญชี', value: acc.name }, { label: 'วันที่', value: formatDateDMY(entry.date) }, { label: 'จำนวนหุ้น', value: `${Number(entry.shares || 0).toLocaleString()} หน่วย` }];
    if (entry.amountForeign) sellRows.push({ label: 'ได้รับจริง', value: `$${fmt2(entry.amountForeign)}${entry.fx ? ` (FX ${Number(entry.fx).toFixed(2)})` : ''}` });
    sellRows.push({ label: 'กำไร/ขาดทุน', value: gainLabel });
    sendLineFlex(`ขาย ${h.symbol || h.name} (${acc.name}) ฿${fmt(entry.amount)}`, buildFlexCard({
      title: `📉 ขาย ${h.symbol || h.name}`,
      rows: sellRows,
      amount: Number(entry.amount || 0), amountColor: gain >= 0 ? GOOD : BAD, tab: 'accounts',
    }));
  }
  function removeSell(accountId, holdingId, sellId) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    const sell = (h.sells || []).find((s) => s.id === sellId);
    // ลบรายการขาย ต้องคืนจำนวนหุ้นที่เคยขายไปกลับเข้าพอร์ตด้วย ไม่งั้นจำนวนหุ้นจะขาดหายไปเฉยๆ
    const restoredShares = Number(h.shares || 0) + Number(sell?.shares || 0);
    updateHolding(accountId, holdingId, { shares: restoredShares, sells: (h.sells || []).filter((s) => s.id !== sellId) });
  }
  // ลบรายการซื้อ — ต้องคำนวณจำนวนหุ้น/ต้นทุนเฉลี่ย/FX เฉลี่ยของหุ้นตัวนั้นใหม่ทั้งหมด (หักรายการนี้ออกจากยอดรวมเดิม) ไม่ใช่แค่ลบออกจากลิสต์เฉยๆ
  function removeBuy(accountId, holdingId, buyId) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    const buy = (h.buys || []).find((b) => b.id === buyId);
    if (!buy) return;
    const newShares = Math.max(0, Number(h.shares || 0) - Number(buy.shares || 0));
    const oldTotalCost = Number(h.shares || 0) * Number(h.avgCost || 0);
    const newTotalCost = oldTotalCost - Number(buy.shares || 0) * Number(buy.price || 0);
    const newAvgCost = newShares > 0 ? newTotalCost / newShares : 0;
    const patch = { shares: newShares, avgCost: newAvgCost, buys: (h.buys || []).filter((b) => b.id !== buyId) };
    if (h.currency === 'USD') {
      const oldTotalTHB = holdingCostBasisTHB(h);
      const newTotalTHB = oldTotalTHB - Number(buy.amount || 0);
      const newTotalUSDCost = newShares * newAvgCost;
      patch.purchaseFx = newTotalUSDCost > 0 ? newTotalTHB / newTotalUSDCost : h.purchaseFx;
    }
    updateHolding(accountId, holdingId, patch);
  }
  function updateSell(accountId, holdingId, sellId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { sells: (h.sells || []).map((s) => (s.id === sellId ? { ...s, ...patch } : s)) });
  }
  // บันทึกรายการตัด YieldTech ให้กองทุนตัวหนึ่ง — หักจำนวนหน่วยลงเหมือนการขาย (ประมาณจากราคาล่าสุดถ้าไม่รู้จำนวนหน่วยที่แน่นอน)
  // ถ้าเลือกจะนำไปลงทุนต่อที่บัญชีอื่น จะสร้างรายการ "เงินเข้า" ให้อัตโนมัติด้วย
  // ใช้ตอนแปะรูปประวัติ YieldTech ที่มีหลายกองทุนปนกันในภาพเดียว — ต้องรวมเป็น patch เดียวแล้วเขียนทีเดียว
  // ห้ามเรียก recordYieldTechWithdrawal วนหลายรอบ เพราะแต่ละกองทุนจะเขียนทับกันเอง (เหมือนปัญหาที่เจอมาก่อน)
  function recordYieldTechWithdrawalsBatch(accountId, entries) {
    const acc = accounts.find((a) => a.id === accountId);
    const contributionsToAdd = [];
    const nextHoldings = acc.holdings.map((h) => {
      const matches = entries.filter((e) => e.holdingId === h.id);
      if (matches.length === 0) return h;
      let shares = Number(h.shares || 0);
      let sells = h.sells || [];
      let yieldTechHistory = h.yieldTechHistory || [];
      const price = Number(h.currentPrice || h.avgCost || 0);
      const fx = h.currency === 'USD' ? Number(h.currentFx || h.purchaseFx || 1) : 1;
      matches.forEach((e) => {
        const estimatedShares = price > 0 ? Number(e.amount) / (price * fx) : 0;
        if (estimatedShares > 0) {
          const costBasisSold = estimatedShares * Number(h.avgCost || 0) * fx;
          sells = [{ id: uid(), date: e.date, shares: estimatedShares, price, amount: Number(e.amount), gain: Number(e.amount) - costBasisSold, currency: h.currency }, ...sells];
          shares = Math.max(0, shares - estimatedShares);
        }
        yieldTechHistory = [{ id: uid(), date: e.date, amount: Number(e.amount), reinvestAccountId: e.reinvestAccountId || undefined, estimatedShares: estimatedShares || undefined }, ...yieldTechHistory];
        if (e.reinvestAccountId) contributionsToAdd.push({ date: e.date, amount: Number(e.amount), source: 'yieldtech', accountId: e.reinvestAccountId });
      });
      return { ...h, shares, sells, yieldTechHistory };
    });
    updateAccount(accountId, { holdings: nextHoldings });
    contributionsToAdd.forEach((c) => addContribution(c));
    const noReinvestTotal = entries.filter((e) => !e.reinvestAccountId).reduce((s, e) => s + Number(e.amount || 0), 0);
    if (noReinvestTotal > 0) sendLineFlex(`ตัด YieldTech ${acc.name} ฿${fmt(noReinvestTotal)}`, buildFlexCard({
      title: `💵 ตัด YieldTech ${acc.name}`,
      rows: [{ label: 'จำนวนรายการ', value: `${entries.length} รายการ` }],
      amount: noReinvestTotal, amountColor: BAD, tab: 'accounts',
    }));
  }
  // แปะรูปประวัติคำสั่งซื้อ-ขายที่มีหลายกองทุนปนกันในภาพเดียว — บันทึกซื้อเพิ่ม/ขายให้ทุกกองทุนที่จับคู่ไว้พร้อมกันในการเขียนครั้งเดียว
  function recordBuySellBatch(accountId, entries) {
    const acc = accounts.find((a) => a.id === accountId);
    const currency = acc.category === 'dime' ? 'USD' : 'THB';
    function applyEntries(h, matches) {
      let shares = Number(h.shares || 0);
      let avgCost = Number(h.avgCost || 0);
      let purchaseFx = h.purchaseFx;
      let buys = h.buys || [];
      let sells = h.sells || [];
      matches.forEach((e) => {
        const price = e.price ? Number(e.price) : (Number(h.currentPrice || h.avgCost || 0));
        const eShares = e.shares ? Number(e.shares) : (price > 0 ? Number(e.amount) / price : 0);
        if (e.type === 'sell') {
          if (eShares > 0) {
            const costBasisSold = eShares * avgCost;
            sells = [{ id: uid(), date: e.date, shares: eShares, price, amount: Number(e.amount), gain: Number(e.amount) - costBasisSold, currency: h.currency }, ...sells];
            shares = Math.max(0, shares - eShares);
          }
        } else {
          const newShares = shares + eShares;
          const newAvgCost = newShares > 0 ? (shares * avgCost + eShares * price) / newShares : avgCost;
          if (h.currency === 'USD') {
            const oldTotalTHB = shares * avgCost * Number(purchaseFx || 1);
            const newTotalTHB = oldTotalTHB + Number(e.amount);
            const newTotalForeignCost = newShares * newAvgCost;
            purchaseFx = newTotalForeignCost > 0 ? newTotalTHB / newTotalForeignCost : purchaseFx;
          }
          buys = [{ id: uid(), date: e.date, shares: eShares, price, amount: Number(e.amount) }, ...buys];
          shares = newShares; avgCost = newAvgCost;
        }
      });
      return { ...h, shares, avgCost, purchaseFx, buys, sells, lastUpdated: new Date().toISOString().slice(0, 10) };
    }
    // อัปเดตกองทุน/หุ้นที่มีอยู่แล้วในพอร์ต
    const nextHoldings = acc.holdings.map((h) => {
      const matches = entries.filter((e) => e.holdingId === h.id);
      return matches.length === 0 ? h : applyEntries(h, matches);
    });
    // สร้างกองทุน/หุ้นใหม่ให้อัตโนมัติสำหรับรายการที่ไม่เจอในพอร์ตเลย (holdingId === '__new__') — จัดกลุ่มตามชื่อสัญลักษณ์ กันสร้างซ้ำถ้ามีหลายรายการของกองทุนใหม่เดียวกัน
    const newSymbolEntries = entries.filter((e) => e.holdingId === '__new__');
    const bySymbol = {};
    newSymbolEntries.forEach((e) => { const key = e.symbol || 'ไม่ทราบชื่อ'; if (!bySymbol[key]) bySymbol[key] = []; bySymbol[key].push(e); });
    const newHoldings = Object.entries(bySymbol).map(([symbol, matches]) => {
      const blank = { id: uid(), symbol, name: symbol, shares: 0, avgCost: 0, currency, purchaseFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, currentPrice: 0, currentFx: currency === 'USD' ? (avgFxFromContributions || 36) : 1, lastUpdated: '', purchaseDate: '', dividends: [], sells: [], buys: [] };
      return applyEntries(blank, matches);
    });
    updateAccount(accountId, { holdings: [...nextHoldings, ...newHoldings] });
    const buysN = entries.filter((e) => e.type !== 'sell');
    const sellsN = entries.filter((e) => e.type === 'sell');
    const rows = [];
    if (buysN.length) rows.push({ label: 'ซื้อ', value: `${buysN.length} รายการ รวม ฿${fmt(buysN.reduce((s, e) => s + Number(e.amount || 0), 0))}` });
    if (sellsN.length) rows.push({ label: 'ขาย', value: `${sellsN.length} รายการ รวม ฿${fmt(sellsN.reduce((s, e) => s + Number(e.amount || 0), 0))}` });
    if (rows.length) sendLineFlex(`อัพเดตพอร์ต ${acc.name}`, buildFlexCard({ title: `📊 อัพเดตพอร์ต ${acc.name}`, rows, tab: 'accounts' }));
  }
  function recordYieldTechWithdrawal(accountId, holdingId, { amount, date, reinvestAccountId, sharesOverride }) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    const price = Number(h.currentPrice || h.avgCost || 0);
    const fx = h.currency === 'USD' ? Number(h.currentFx || h.purchaseFx || 1) : 1;
    const estimatedShares = sharesOverride ? Number(sharesOverride) : (price > 0 ? Number(amount) / (price * fx) : 0);
    const patch = {};
    if (estimatedShares > 0) {
      const costBasisSold = estimatedShares * Number(h.avgCost || 0) * fx;
      const gain = Number(amount) - costBasisSold;
      patch.shares = Math.max(0, Number(h.shares || 0) - estimatedShares);
      patch.sells = [{ id: uid(), date, shares: estimatedShares, price, amount: Number(amount), gain, currency: h.currency }, ...(h.sells || [])];
    }
    patch.yieldTechHistory = [{ id: uid(), date, amount: Number(amount), reinvestAccountId: reinvestAccountId || undefined, estimatedShares: estimatedShares || undefined }, ...(h.yieldTechHistory || [])];
    updateHolding(accountId, holdingId, patch);
    if (reinvestAccountId) addContribution({ date, amount: Number(amount), source: 'yieldtech', accountId: reinvestAccountId });
    else sendLineFlex(`ตัด YieldTech ${h.symbol || h.name} (${acc.name}) ฿${fmt(amount)}`, buildFlexCard({
      title: `💵 ตัด YieldTech ${h.symbol || h.name}`,
      rows: [{ label: 'บัญชี', value: acc.name }, { label: 'วันที่', value: formatDateDMY(date) }],
      amount: Number(amount || 0), amountColor: BAD, tab: 'accounts',
    }));
  }
  function updateBuy(accountId, holdingId, buyId, patch) {
    const acc = accounts.find((a) => a.id === accountId);
    const h = acc.holdings.find((x) => x.id === holdingId);
    updateHolding(accountId, holdingId, { buys: (h.buys || []).map((b) => (b.id === buyId ? { ...b, ...patch } : b)) });
  }
  const addExpense = (entry) => persistAppend('expenses', { id: uid(), ...entry });
  const removeExpense = (id) => persist({ ...state, expenses: expenses.filter((e) => e.id !== id) });
  const updateExpense = (id, patch) => persist({ ...state, expenses: expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addExpenseCategory = (name) => { if (name && !expenseCategories.includes(name)) persist({ ...state, expenseCategories: [...expenseCategories, name] }); };

  // ระบบบัตรเครดิต: เพิ่ม/แก้ไข/ลบบัตร และรายการใช้จ่ายแยกตามบัตร
  const addCreditCard = (entry) => persist({ ...state, creditCards: [...creditCards, makeCreditCard(entry)] });
  const updateCreditCard = (id, patch) => persist({ ...state, creditCards: creditCards.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const removeCreditCard = (id) => persist({ ...state, creditCards: creditCards.filter((c) => c.id !== id) });
  const addCreditCardTransaction = (cardId, entry) => persist({ ...state, creditCards: creditCards.map((c) => (c.id === cardId ? { ...c, transactions: [{ id: uid(), ...entry }, ...(c.transactions || [])] } : c)) });
  const removeCreditCardTransaction = (cardId, txId) => persist({ ...state, creditCards: creditCards.map((c) => (c.id === cardId ? { ...c, transactions: (c.transactions || []).filter((t) => t.id !== txId) } : c)) });
  const updateCreditCardTransaction = (cardId, txId, patch) => persist({ ...state, creditCards: creditCards.map((c) => (c.id === cardId ? { ...c, transactions: (c.transactions || []).map((t) => (t.id === txId ? { ...t, ...patch } : t)) } : c)) });
  // จับคู่ชื่อบัตรที่พูด/พิมพ์มา (เช่น "ttb", "TTB", "บัตร ttb") กับบัตรที่มีอยู่ โดยเทียบจากชื่อธนาคาร/ชื่อบัตร
  function matchCreditCard(spokenName) {
    if (!spokenName) return null;
    const needle = spokenName.toLowerCase().trim();
    return creditCards.find((c) => {
      const hay = `${c.bankName || ''} ${c.cardName || ''}`.toLowerCase();
      return hay.includes(needle) || needle.includes((c.bankName || '').toLowerCase()) || needle.includes((c.cardName || '').toLowerCase());
    }) || null;
  }

  function updateDog(dogId, patch) { persistShared({ ...sharedState, dogs: dogs.map((d) => (d.id === dogId ? { ...d, ...patch } : d)) }); }
  // ใช้สำหรับ "คัดลอกไปยังตัวอื่น" ที่เลือกได้หลายตัวพร้อมกัน — คำนวณ patch ของทุกตัวแล้วเขียนทีเดียวใน persistShared เดียว
  // กันปัญหาที่ถ้าเรียก updateDog/updateFleaTickInfo/updateInsurance วนซ้ำหลายครั้งติดกัน (forEach) แต่ละครั้งจะคำนวณจาก
  // dogs อาร์เรย์เดิมที่ยังไม่อัปเดต (เพราะ React ยังไม่ re-render ระหว่าง loop) ทำให้การเขียนครั้งหลังไปเขียนทับของครั้งก่อน
  // จนเหลือแค่ตัวสุดท้ายที่คัดลอกสำเร็จจริง ตัวอื่นๆ ดูเหมือนไม่มีอะไรเปลี่ยนเลย
  function copyToMultipleDogs(targetIds, patchBuilder) {
    const next = dogs.map((d) => (targetIds.includes(d.id) ? { ...d, ...patchBuilder(d) } : d));
    persistShared({ ...sharedState, dogs: next });
  }
  function addHospital(name) { if (name && !hospitalList.includes(name)) persist({ ...state, hospitalList: [...hospitalList, name] }); }
  function addDoctor(name) { if (name && !doctorList.includes(name)) persist({ ...state, doctorList: [...doctorList, name] }); }
  function addDepartment(name) { if (name && !departmentList.includes(name)) persist({ ...state, departmentList: [...departmentList, name] }); }
  // จำคู่ "หมอ-แผนก" ไว้ พอเลือกชื่อหมอที่เคยบันทึกไว้แล้ว จะเติมแผนกให้อัตโนมัติ (เพราะปกติพบหมอคนเดิมประจำแผนกเดิม)
  function setDoctorDepartment(doctorName, department) {
    if (!doctorName || !department) return;
    if (doctorDepartments[doctorName] === department) return;
    persist({ ...state, doctorDepartments: { ...doctorDepartments, [doctorName]: department } });
  }
  function addCustomDestination(name) { if (name && !customDestinationList.includes(name)) persist({ ...state, customDestinationList: [...customDestinationList, name] }); }
  // ประกันครอบครัว — 1 กรมธรรม์ = สัญญาหลัก + สัญญาเพิ่มเติมได้หลายรายการ (riders)
  const insurancePolicies = state?.insurancePolicies || [];
  const insuranceClaims = state?.insuranceClaims || [];
  function addInsurancePolicy(entry) {
    const p = { id: uid(), owner: 'me', category: 'life', company: '', policyNumber: '', planName: '', startDate: '', endDate: '', premiumAmount: 0, premiumFrequency: 'year', nextDueDate: '', agentName: '', agentPhone: '', status: 'active', documents: [], riders: [], ...entry };
    persist({ ...state, insurancePolicies: [p, ...insurancePolicies] });
    return p.id;
  }
  function updateInsurancePolicy(policyId, patch) {
    persist({ ...state, insurancePolicies: insurancePolicies.map((p) => (p.id === policyId ? { ...p, ...patch } : p)) });
  }
  function removeInsurancePolicy(policyId) {
    persist({ ...state, insurancePolicies: insurancePolicies.filter((p) => p.id !== policyId) });
  }
  function addInsuranceRider(policyId, entry) {
    const p = insurancePolicies.find((x) => x.id === policyId);
    const rider = { id: uid(), name: '', type: 'life', sumInsured: 0, deathBenefit: 0, taxDeductible: 'no', notes: '', benefitItems: [], ...entry };
    updateInsurancePolicy(policyId, { riders: [...(p.riders || []), rider] });
  }
  function updateInsuranceRider(policyId, riderId, patch) {
    const p = insurancePolicies.find((x) => x.id === policyId);
    updateInsurancePolicy(policyId, { riders: (p.riders || []).map((r) => (r.id === riderId ? { ...r, ...patch } : r)) });
  }
  function removeInsuranceRider(policyId, riderId) {
    const p = insurancePolicies.find((x) => x.id === policyId);
    updateInsurancePolicy(policyId, { riders: (p.riders || []).filter((r) => r.id !== riderId) });
  }
  async function addInsurancePolicyDocument(policyId, file) {
    const p = insurancePolicies.find((x) => x.id === policyId);
    const path = `properties/${FAMILY_SHARE_ID}/insurance/${policyId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateInsurancePolicy(policyId, { documents: [{ id: uid(), url, path, name: file.name, uploadedAt: new Date().toISOString().slice(0, 10) }, ...(p.documents || [])] });
  }
  async function removeInsurancePolicyDocument(policyId, docId) {
    const p = insurancePolicies.find((x) => x.id === policyId);
    const doc = (p.documents || []).find((d) => d.id === docId);
    if (doc && doc.path) { try { await deleteObject(storageRef(storage, doc.path)); } catch (e) { /* ignore */ } }
    updateInsurancePolicy(policyId, { documents: (p.documents || []).filter((d) => d.id !== docId) });
  }
  function addInsuranceClaim(entry) {
    persist({ ...state, insuranceClaims: [{ id: uid(), ...entry }, ...insuranceClaims] });
  }
  function updateInsuranceClaim(claimId, patch) {
    persist({ ...state, insuranceClaims: insuranceClaims.map((c) => (c.id === claimId ? { ...c, ...patch } : c)) });
  }
  function removeInsuranceClaim(claimId) {
    persist({ ...state, insuranceClaims: insuranceClaims.filter((c) => c.id !== claimId) });
  }
  // ข่าวลงทุน — ดึงจากหุ้น/สินทรัพย์ที่ถืออยู่จริง + เศรษฐกิจมหภาค แคชไว้ 1 วันไม่ให้เรียก AI ซ้ำทุกครั้งที่เปิดแอป
  const investmentNews = state?.investmentNews || { items: [], fetchedAt: '' };
  function saveInvestmentNews(items) {
    persist({ ...state, investmentNews: { items, fetchedAt: new Date().toISOString() } });
  }
  function addBloodTestType(name) { if (name && !bloodTestTypeList.includes(name)) persist({ ...state, bloodTestTypeList: [...bloodTestTypeList, name] }); }
  function addOrganType(name) { if (name && !organTypeList.includes(name)) persist({ ...state, organTypeList: [...organTypeList, name] }); }
  function addImagingType(name) { if (name && !imagingTypeList.includes(name)) persist({ ...state, imagingTypeList: [...imagingTypeList, name] }); }
  function addWeigher(name) { if (name && !weigherList.includes(name)) persist({ ...state, weigherList: [...weigherList, name] }); }
  function addMedicationPreset(preset) {
    const exists = medicationList.some((m) => m.name === preset.name && m.strength === preset.strength && m.dose === preset.dose && m.usage === preset.usage);
    if (!exists) persist({ ...state, medicationList: [...medicationList, preset] });
  }

  function updateProperty(id, patch) { persistShared({ ...sharedState, properties: properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }); }
  function addProperty(entry) { persistShared({ ...sharedState, properties: [...properties, { ...makeProperty({ name: entry.name || 'ทรัพย์สินใหม่', rent: 0, purchasePrice: 0 }), ...entry }] }); }
  function removeProperty(id) { persistShared({ ...sharedState, properties: properties.filter((p) => p.id !== id) }); }
  function togglePayment(propertyId, ymKey) {
    const p = properties.find((x) => x.id === propertyId);
    const cur = (p.payments || {})[ymKey];
    const nowPaid = !(cur && cur.paid);
    updateProperty(propertyId, { payments: { ...(p.payments || {}), [ymKey]: { paid: nowPaid, date: nowPaid ? new Date().toISOString().slice(0, 10) : (cur && cur.date), amount: p.rent } } });
  }
  function addPropertyTransaction(propertyId, entry) {
    const p = properties.find((x) => x.id === propertyId);
    updateProperty(propertyId, { transactions: [{ id: uid(), ...entry }, ...(p.transactions || [])] });
  }
  function removePropertyTransaction(propertyId, txId) {
    const p = properties.find((x) => x.id === propertyId);
    updateProperty(propertyId, { transactions: (p.transactions || []).filter((t) => t.id !== txId) });
  }
  function addPropertyRepair(propertyId, entry) {
    const p = properties.find((x) => x.id === propertyId);
    updateProperty(propertyId, { repairs: [{ id: uid(), ...entry }, ...(p.repairs || [])] });
  }
  function removePropertyRepair(propertyId, repairId) {
    const p = properties.find((x) => x.id === propertyId);
    updateProperty(propertyId, { repairs: (p.repairs || []).filter((r) => r.id !== repairId) });
  }
  async function addPropertyPhoto(propertyId, file) {
    const p = properties.find((x) => x.id === propertyId);
    const path = `properties/${FAMILY_SHARE_ID}/${propertyId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateProperty(propertyId, { photos: [{ id: uid(), url, path }, ...(p.photos || [])] });
  }
  async function removePropertyPhoto(propertyId, photoId) {
    const p = properties.find((x) => x.id === propertyId);
    const photo = (p.photos || []).find((ph) => ph.id === photoId);
    if (photo && photo.path) { try { await deleteObject(storageRef(storage, photo.path)); } catch (e) { /* ignore */ } }
    updateProperty(propertyId, { photos: (p.photos || []).filter((ph) => ph.id !== photoId) });
  }
  // เอกสารสัญญาเช่า/โฉนด (PDF) แยกจากรูปห้อง
  async function addPropertyDocument(propertyId, file) {
    const p = properties.find((x) => x.id === propertyId);
    const path = `properties/${FAMILY_SHARE_ID}/${propertyId}/documents/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateProperty(propertyId, { documents: [{ id: uid(), name: file.name, url, path, uploadedAt: new Date().toISOString().slice(0, 10) }, ...(p.documents || [])] });
  }
  async function removePropertyDocument(propertyId, docId) {
    const p = properties.find((x) => x.id === propertyId);
    const doc = (p.documents || []).find((d) => d.id === docId);
    if (doc && doc.path) { try { await deleteObject(storageRef(storage, doc.path)); } catch (e) { /* ignore */ } }
    updateProperty(propertyId, { documents: (p.documents || []).filter((d) => d.id !== docId) });
  }
  // แบ่งจ่ายค่าเช่าหลายงวด: บันทึกแต่ละงวดพร้อมวันที่ + จะเลือกได้ว่าเอาเงินก้อนนี้ไปลงบัญชีไหน (สร้างรายการ "เงินเข้า" ให้อัตโนมัติ)
  function addRentInstallment(propertyId, ymKey, entry) {
    const p = properties.find((x) => x.id === propertyId);
    const cur = (p.payments || {})[ymKey] || {};
    const installments = [{ id: uid(), amount: entry.amount, date: entry.date, note: entry.note || '', accountId: entry.accountId || '' }, ...(cur.installments || [])];
    const totalPaid = installments.reduce((s, it) => s + Number(it.amount || 0), 0);
    const paid = cur.manualConfirm || totalPaid >= Number(p.rent || 0);
    updateProperty(propertyId, { payments: { ...(p.payments || {}), [ymKey]: { ...cur, installments, amount: totalPaid, paid, date: paid ? (cur.date || entry.date) : cur.date } } });
    if (entry.accountId) {
      addContribution({ date: entry.date, amount: entry.amount, source: 'rental', accountId: entry.accountId });
      const accName = (accounts.find((a) => a.id === entry.accountId) || {}).name || entry.accountId || '';
      const shortfall = Number(p.rent || 0) - totalPaid;
      const rows = [{ label: 'วันที่', value: formatDateDMY(entry.date) }, { label: 'ฝากเข้าบัญชี', value: accName }];
      if (shortfall > 0) rows.push({ label: 'ยังขาดอีก', value: `฿${fmt(shortfall)} จากยอดเต็ม ฿${fmt(p.rent)}` });
      sendLineFlex(`รับค่าเช่า ${p.name} ฿${fmt(entry.amount)}`, buildFlexCard({ title: `🏠 รับค่าเช่า ${p.name}`, rows, amount: Number(entry.amount || 0), amountColor: GOOD, tab: 'realestate' }));
    }
  }
  function removeRentInstallment(propertyId, ymKey, installmentId) {
    const p = properties.find((x) => x.id === propertyId);
    const cur = (p.payments || {})[ymKey] || {};
    const installments = (cur.installments || []).filter((it) => it.id !== installmentId);
    const totalPaid = installments.reduce((s, it) => s + Number(it.amount || 0), 0);
    const paid = cur.manualConfirm || totalPaid >= Number(p.rent || 0);
    updateProperty(propertyId, { payments: { ...(p.payments || {}), [ymKey]: { ...cur, installments, amount: totalPaid, paid } } });
  }
  // แก้ไขงวดค่าเช่าที่บันทึกไปแล้ว — ถ้าเปลี่ยนบัญชีปลายทาง ย้ายรายการ "เงินเข้า" ที่ addRentInstallment สร้างไว้ให้ตรงกับบัญชีใหม่ด้วย (หาโดยจับคู่ source=rental + วันที่ + ยอดเดิม) แล้วแจ้งเตือน LINE บอกว่าเปลี่ยนอะไรไปบ้าง
  function updateRentInstallment(propertyId, ymKey, installmentId, patch) {
    const p = properties.find((x) => x.id === propertyId);
    const cur = (p.payments || {})[ymKey] || {};
    const old = (cur.installments || []).find((it) => it.id === installmentId);
    if (!old) return;
    const installments = (cur.installments || []).map((it) => (it.id === installmentId ? { ...it, ...patch } : it));
    const totalPaid = installments.reduce((s, it) => s + Number(it.amount || 0), 0);
    const paid = cur.manualConfirm || totalPaid >= Number(p.rent || 0);
    updateProperty(propertyId, { payments: { ...(p.payments || {}), [ymKey]: { ...cur, installments, amount: totalPaid, paid } } });
    // ย้าย/อัพเดทรายการ "เงินเข้า" คู่กันที่สร้างไว้ตอนบันทึกครั้งแรก ให้ค่าตรงกับงวดที่แก้ไข
    const linkedContribution = contributions.find((c) => c.source === 'rental' && c.date === old.date && Number(c.amount) === Number(old.amount) && c.accountId === old.accountId);
    if (linkedContribution) updateContribution(linkedContribution.id, { date: patch.date !== undefined ? patch.date : old.date, amount: patch.amount !== undefined ? patch.amount : old.amount, accountId: patch.accountId !== undefined ? patch.accountId : old.accountId });
    const oldAccName = (accounts.find((a) => a.id === old.accountId) || {}).name || old.accountId || '-';
    const newAccountId = patch.accountId !== undefined ? patch.accountId : old.accountId;
    const newAccName = (accounts.find((a) => a.id === newAccountId) || {}).name || newAccountId || '-';
    const changed = [];
    if (patch.amount !== undefined && Number(patch.amount) !== Number(old.amount)) changed.push({ label: 'ยอด', value: `฿${fmt(old.amount)} → ฿${fmt(patch.amount)}` });
    if (patch.accountId !== undefined && patch.accountId !== old.accountId) changed.push({ label: 'บัญชีปลายทาง', value: `${oldAccName} → ${newAccName}` });
    if (patch.date !== undefined && patch.date !== old.date) changed.push({ label: 'วันที่', value: `${formatDateDMY(old.date)} → ${formatDateDMY(patch.date)}` });
    if (changed.length) sendLineFlex(`แก้ไขค่าเช่า ${p.name} ฿${fmt(old.amount)}`, buildFlexCard({
      title: `✏️ แก้ไขค่าเช่า ${p.name}`,
      rows: [{ label: 'รายการ', value: `฿${fmt(old.amount)} วันที่ ${formatDateDMY(old.date)}` }, ...changed],
      tab: 'realestate',
    }));
  }
  function setRentManualConfirm(propertyId, ymKey, confirmed) {
    const p = properties.find((x) => x.id === propertyId);
    const cur = (p.payments || {})[ymKey] || {};
    const totalPaid = (cur.installments || []).reduce((s, it) => s + Number(it.amount || 0), 0);
    updateProperty(propertyId, { payments: { ...(p.payments || {}), [ymKey]: { ...cur, manualConfirm: confirmed, paid: confirmed || totalPaid >= Number(p.rent || 0), date: confirmed ? new Date().toISOString().slice(0, 10) : cur.date } } });
  }
  // ฟีเจอร์ KK: รูปโปรไฟล์ของลูกๆ แต่ละตัว (ใช้ Storage เดียวกับรูปห้อง)
  // ใช้อัพโหลดรูปแล้วแนบเข้ากับ "รายการใหม่" ที่กำลังจะสร้างโดยตรง (กันปัญหาข้อมูลไม่ทันอัพเดทถ้าไปแนบทีหลัง)
  async function uploadDogRecordPhoto(dogId, subfolder, file) {
    const path = `properties/${FAMILY_SHARE_ID}/pets/${dogId}/${subfolder}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { id: uid(), url, path };
  }
  // เอกสารกรมธรรม์ประกันของลูกๆ (รูป/PDF)
  async function addInsuranceDocument(dogId, file) {
    const d = dogs.find((x) => x.id === dogId);
    const path = `properties/${FAMILY_SHARE_ID}/pets/${dogId}/insurance/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateDog(dogId, { insurance: { ...d.insurance, documents: [{ id: uid(), name: file.name, url, path, uploadedAt: new Date().toISOString().slice(0, 10) }, ...(d.insurance.documents || [])] } });
  }
  async function removeInsuranceDocument(dogId, docId) {
    const d = dogs.find((x) => x.id === dogId);
    const doc = (d.insurance.documents || []).find((x) => x.id === docId);
    if (doc && doc.path) { try { await deleteObject(storageRef(storage, doc.path)); } catch (e) { /* ignore */ } }
    updateDog(dogId, { insurance: { ...d.insurance, documents: (d.insurance.documents || []).filter((x) => x.id !== docId) } });
  }
  // อัลบั้มรูปสำคัญของลูกๆ — ไม่ผูกกับบันทึกไหนเป็นพิเศษ เก็บได้เรื่อยๆ (Firebase Storage แบบจ่ายตามใช้จริง ไม่มีเพดานตายตัว)
  async function addAlbumPhoto(dogId, file) {
    const d = dogs.find((x) => x.id === dogId);
    const path = `properties/${FAMILY_SHARE_ID}/pets/${dogId}/album/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateDog(dogId, { albumPhotos: [{ id: uid(), url, path, uploadedAt: new Date().toISOString().slice(0, 10) }, ...(d.albumPhotos || [])] });
  }
  async function removeAlbumPhoto(dogId, photoId) {
    const d = dogs.find((x) => x.id === dogId);
    const photo = (d.albumPhotos || []).find((x) => x.id === photoId);
    if (photo && photo.path) { try { await deleteObject(storageRef(storage, photo.path)); } catch (e) { /* ignore */ } }
    updateDog(dogId, { albumPhotos: (d.albumPhotos || []).filter((x) => x.id !== photoId) });
  }
  async function setDogPhoto(dogId, file) {
    const d = dogs.find((x) => x.id === dogId);
    if (d && d.photoPath) { try { await deleteObject(storageRef(storage, d.photoPath)); } catch (e) { /* ignore */ } }
    const path = `properties/${FAMILY_SHARE_ID}/pets/${dogId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    updateDog(dogId, { photoUrl: url, photoPath: path });
  }
  // ฟีเจอร์ RR: แนบรูปผลตรวจ (หลายรูปต่อรายการ) ในเวชระเบียน — ใช้ร่วมกันได้ทั้งผลเลือด/อวัยวะ/imaging
  async function addMedicalPhoto(dogId, recordType, recordId, file) {
    const d = dogs.find((x) => x.id === dogId);
    const records = d[recordType] || [];
    const path = `properties/${FAMILY_SHARE_ID}/pets/${dogId}/medical/${recordId}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    const nextRecords = records.map((r) => (r.id === recordId ? { ...r, photos: [...(r.photos || []), { id: uid(), url, path }] } : r));
    updateDog(dogId, { [recordType]: nextRecords });
  }
  async function removeMedicalPhoto(dogId, recordType, recordId, photoId) {
    const d = dogs.find((x) => x.id === dogId);
    const records = d[recordType] || [];
    const record = records.find((r) => r.id === recordId);
    const photo = (record && record.photos || []).find((p) => p.id === photoId);
    if (photo && photo.path) { try { await deleteObject(storageRef(storage, photo.path)); } catch (e) { /* ignore */ } }
    const nextRecords = records.map((r) => (r.id === recordId ? { ...r, photos: (r.photos || []).filter((p) => p.id !== photoId) } : r));
    updateDog(dogId, { [recordType]: nextRecords });
  }
  // ถ้าวันที่ของรายการใหม่ตรงกับวันที่มีการไปหาหมอบันทึกไว้อยู่แล้ว ให้เชื่อมโยงอัตโนมัติ
  // สำคัญ: ต้องรวมเข้ากับ patch เดิมเป็นก้อนเดียว แล้วเขียนทีเดียว ห้ามแยกเรียก updateDog ซ้ำสองครั้ง
  // (ถ้าแยกเรียก จะเกิดปัญหาเดียวกับที่เจอตอนคัดลอกข้อมูลไปหลายตัว คือครั้งหลังจะเขียนทับครั้งแรก)
  function withAutoLinkPatch(d, date, recordType, recordId, basePatch) {
    const visit = (d.vetVisits || []).find((v) => v.date === date);
    if (!visit) return basePatch;
    const alreadyLinked = (visit.linkedRecords || []).some((r) => r.type === recordType && r.id === recordId);
    if (alreadyLinked) return basePatch;
    const nextVetVisits = d.vetVisits.map((v) => (v.id === visit.id ? { ...v, linkedRecords: [...(v.linkedRecords || []), { type: recordType, id: recordId }] } : v));
    return { ...basePatch, vetVisits: nextVetVisits };
  }
  // บันทึกผล Imaging พร้อมสร้างรายการ "อวัยวะ" ให้อัตโนมัติสำหรับทุกอวัยวะที่เกี่ยวข้อง (เช่น อัลตร้าซาวด์เจอนิ่วถุงน้ำดี + ต่อมหมวกไตโต พร้อมกัน)
  // ทำเป็นก้อนเดียว (imaging + organExams + link วันเดียวกัน) แล้วเขียนทีเดียว กันปัญหาเขียนทับที่เจอมาก่อน
  function addImagingWithOrgans(dogId, entry, organNames) {
    const d = dogs.find((x) => x.id === dogId);
    if (!d) return;
    const { relatedOrgans, ...imagingEntry } = entry;
    const imagingId = uid();
    const newImaging = { id: imagingId, ...imagingEntry };
    const organEntries = (organNames || []).map((organ) => ({ id: uid(), organ, date: entry.date, note: entry.note }));
    let patch = {
      imaging: [newImaging, ...(d.imaging || [])],
      organExams: [...organEntries, ...(d.organExams || [])],
    };
    const visit = (d.vetVisits || []).find((v) => v.date === entry.date);
    if (visit) {
      const newLinks = [{ type: 'imaging', id: imagingId }, ...organEntries.map((o) => ({ type: 'organExams', id: o.id }))];
      const alreadyLinked = (t, id) => (visit.linkedRecords || []).some((r) => r.type === t && r.id === id);
      const toAdd = newLinks.filter((l) => !alreadyLinked(l.type, l.id));
      if (toAdd.length) patch.vetVisits = d.vetVisits.map((v) => (v.id === visit.id ? { ...v, linkedRecords: [...(v.linkedRecords || []), ...toAdd] } : v));
    }
    updateDog(dogId, patch);
    return imagingId;
  }
  function addWeight(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'weights', id, { weights: [{ id, ...entry }, ...(d.weights || [])] }));
    return id;
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
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.startDate, 'medications', id, { medications: [{ id, ...entry }, ...(d.medications || [])] }));
    return id;
  }
  function updateMedication(dogId, medId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { medications: (d.medications || []).map((m) => (m.id === medId ? { ...m, ...patch } : m)) });
  }
  function removeMedication(dogId, medId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { medications: (d.medications || []).filter((m) => m.id !== medId) });
  }
  function logFleaTick(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { fleaTickHistory: [{ id: uid(), ...entry }, ...(d.fleaTickHistory || [])], fleaTick: { ...d.fleaTick, lastGivenDate: entry.date } });
  }
  // ลบ/แก้ไขประวัติการให้ยาเห็บหมัด — ต้องคำนวณ "ให้ยาล่าสุด" ใหม่ทุกครั้งด้วย เผื่อลบ/แก้รายการที่เป็นล่าสุดอยู่
  function recomputeLastGivenDate(history) {
    if (!history || history.length === 0) return '';
    return [...history].sort((a, b) => b.date.localeCompare(a.date))[0].date;
  }
  function removeFleaTickHistory(dogId, historyId) {
    const d = dogs.find((x) => x.id === dogId);
    const nextHistory = (d.fleaTickHistory || []).filter((h) => h.id !== historyId);
    updateDog(dogId, { fleaTickHistory: nextHistory, fleaTick: { ...d.fleaTick, lastGivenDate: recomputeLastGivenDate(nextHistory) } });
  }
  function updateFleaTickHistory(dogId, historyId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    const nextHistory = (d.fleaTickHistory || []).map((h) => (h.id === historyId ? { ...h, ...patch } : h));
    updateDog(dogId, { fleaTickHistory: nextHistory, fleaTick: { ...d.fleaTick, lastGivenDate: recomputeLastGivenDate(nextHistory) } });
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
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'appointments', id, { appointments: [{ id, ...entry }, ...(d.appointments || [])] }));
    return id;
  }
  function removeAppointment(dogId, apptId) {
    const d = dogs.find((x) => x.id === dogId);
    const a = (d.appointments || []).find((x) => x.id === apptId);
    if (a && a.calendarEventId) deleteLinkedCalendarEvent(a.calendarEventId);
    updateDog(dogId, { appointments: (d.appointments || []).filter((a) => a.id !== apptId) });
  }
  function updateAppointment(dogId, apptId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { appointments: (d.appointments || []).map((a) => (a.id === apptId ? { ...a, ...patch } : a)) });
  }
  function addBloodTest(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'bloodTests', id, { bloodTests: [{ id, ...entry }, ...(d.bloodTests || [])] }));
    return id;
  }
  function updateBloodTest(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { bloodTests: (d.bloodTests || []).map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  }
  function addOrganExam(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'organExams', id, { organExams: [{ id, ...entry }, ...(d.organExams || [])] }));
    return id;
  }
  function updateOrganExam(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { organExams: (d.organExams || []).map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  }
  function addImaging(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'imaging', id, { imaging: [{ id, ...entry }, ...(d.imaging || [])] }));
    return id;
  }
  function updateImaging(dogId, id, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { imaging: (d.imaging || []).map((im) => (im.id === id ? { ...im, ...patch } : im)) });
  }
  function addDogExpense(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, withAutoLinkPatch(d, entry.date, 'expenses', id, { expenses: [{ id, ...entry }, ...(d.expenses || [])] }));
    return id;
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

  // ฟีเจอร์ WW: ประวัติการไปหาหมอ (1 ครั้งที่ไป = 1 รายการ) เชื่อมโยงกับผลเลือด/imaging/ยา/นัดหมาย/ค่าใช้จ่ายที่มีอยู่แล้วได้
  function addVetVisit(dogId, entry) {
    const d = dogs.find((x) => x.id === dogId);
    const id = uid();
    updateDog(dogId, { vetVisits: [{ id, linkedRecords: [], ...entry }, ...(d.vetVisits || [])] });
    return id;
  }
  function updateVetVisit(dogId, visitId, patch) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { vetVisits: (d.vetVisits || []).map((v) => (v.id === visitId ? { ...v, ...patch } : v)) });
  }
  function removeVetVisit(dogId, visitId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { vetVisits: (d.vetVisits || []).filter((v) => v.id !== visitId) });
  }
  function linkRecordToVisit(dogId, visitId, recordType, recordId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { vetVisits: (d.vetVisits || []).map((v) => {
      if (v.id !== visitId) return v;
      const exists = (v.linkedRecords || []).some((r) => r.type === recordType && r.id === recordId);
      return exists ? v : { ...v, linkedRecords: [...(v.linkedRecords || []), { type: recordType, id: recordId }] };
    }) });
  }
  function unlinkRecordFromVisit(dogId, visitId, recordType, recordId) {
    const d = dogs.find((x) => x.id === dogId);
    updateDog(dogId, { vetVisits: (d.vetVisits || []).map((v) => (v.id === visitId ? { ...v, linkedRecords: (v.linkedRecords || []).filter((r) => !(r.type === recordType && r.id === recordId)) } : v)) });
  }

  async function fetchFxRateOnly() {
    try {
      const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=THB');
      const data = await res.json();
      const rate = data && data.rates && data.rates.THB;
      return rate || null;
    } catch (e) { return null; }
  }
  async function fetchHoldingPriceOnly(symbol, currency, finnhubKey) {
    if (!symbol) return { ok: false, message: 'ยังไม่ได้ใส่สัญลักษณ์หุ้น' };
    if (currency === 'THB') {
      try {
        const res = await fetch(`/api/thai-stock?symbol=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        if (data && data.error) return { ok: false, message: data.error };
        if (!data || !data.price) return { ok: false, message: 'ไม่พบข้อมูลราคา ลองตรวจสอบสัญลักษณ์อีกครั้ง' };
        return { ok: true, price: data.price, delayed: true };
      } catch (e) { return { ok: false, message: 'เชื่อมต่อไม่สำเร็จ: ' + e.message }; }
    }
    if (!finnhubKey) return { ok: false, message: 'ยังไม่ได้ตั้งค่า API key' };
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${finnhubKey}`);
      if (!res.ok) return { ok: false, message: `เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP ${res.status})` };
      const data = await res.json();
      if (data && data.error) return { ok: false, message: 'Finnhub: ' + data.error };
      if (!data || (data.c === undefined || data.c === null)) return { ok: false, message: 'ไม่พบข้อมูลราคา ลองตรวจสอบสัญลักษณ์อีกครั้ง' };
      if (data.c === 0) return { ok: false, message: `Finnhub ไม่รู้จักสัญลักษณ์ "${symbol}" (ราคาที่ได้เป็น 0)` };
      return { ok: true, price: data.c };
    } catch (e) { return { ok: false, message: 'เชื่อมต่อไม่สำเร็จ: ' + e.message }; }
  }

  async function refreshFxRate() {
    const rate = await fetchFxRateOnly();
    if (!rate) return null;
    const next = accounts.map((a) => (!a.holdings ? a : { ...a, holdings: a.holdings.map((h) => (h.currency === 'USD' ? { ...h, currentFx: rate, lastUpdated: new Date().toISOString().slice(0, 10) } : h)) }));
    persistAccountsFull(next);
    return rate;
  }
  async function refreshHoldingPrice(accountId, holdingId, symbol, currency) {
    const result = await fetchHoldingPriceOnly(symbol, currency, state.finnhubKey);
    if (!result.ok) { if (currency !== 'THB' && !state.finnhubKey) setShowSettings(true); return result; }
    updateHolding(accountId, holdingId, { currentPrice: result.price, lastUpdated: new Date().toISOString().slice(0, 10) });
    return result;
  }


  if (shareMode) return <ShareView totalNetWorth={totalNetWorth} categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} daysLeft={daysLeft} onClose={() => setShareMode(false)} />;

  return (
    <div style={{ background: PAPER, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: INK, fontVariantNumeric: 'tabular-nums' }} className="pb-24">
      {saveError && (
        <div style={{ background: BAD, position: 'sticky', top: 0, zIndex: 100 }} className="px-4 py-3 text-white text-xs flex items-start gap-2">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span className="flex-1">⚠️ {saveError}</span>
          <button onClick={() => setSaveError('')} style={{ flexShrink: 0 }}>✕</button>
        </div>
      )}
      {!saveError && pendingWrites > 0 && (
        <div style={{ background: GOOD, position: 'sticky', top: 0, zIndex: 100 }} className="px-4 py-2 text-white text-xs flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" style={{ flexShrink: 0 }} />
          <span>กำลังบันทึกข้อมูล... รอสักครู่ก่อนปิดแอปนะครับ</span>
        </div>
      )}
      {tab === 'dashboard' ? (
      <div style={{ background: INK }} className="px-5 pt-8 pb-6 text-white relative overflow-hidden">
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', border: `1px solid #FFFFFF22`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 10, bottom: 10, width: 104, height: 104, borderRadius: '50%', background: TAB_MASCOTS.dashboard.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, border: '3px solid #FFFFFF4D', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', pointerEvents: 'none', overflow: 'hidden' }}>
          {TAB_MASCOTS.dashboard.photo ? <img src={TAB_MASCOTS.dashboard.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : TAB_MASCOTS.dashboard.emoji}
        </div>
        <div className="flex justify-between items-start">
          <div><p className="text-xs tracking-widest" style={{ color: '#94A3B8' }}>สมุดบัญชีการลงทุน</p><h1 className="text-3xl mt-1 font-semibold">สินทรัพย์สุทธิ</h1></div>
          <div className="flex gap-2">
            <button onClick={() => setShowAmounts(!showAmounts)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}>{showAmounts ? <Eye size={13} /> : <EyeOff size={13} />}</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}><Settings size={13} /></button>
            <button onClick={() => setShareMode(true)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}><Share2 size={13} /></button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-1 text-xs rounded-full px-3 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}><LogOut size={13} /></button>
          </div>
        </div>
        <p className="text-4xl mt-3 font-semibold">{showAmounts ? `฿${fmt(totalNetWorth)}` : '฿xxx,xxx'}</p>
        {prevSnapshot && showAmounts && <p className="text-xs mt-1" style={{ color: totalNetWorth >= prevSnapshot.netWorth ? '#86EFAC' : '#FCA5A5' }}>{totalNetWorth >= prevSnapshot.netWorth ? '+' : ''}฿{fmt(totalNetWorth - prevSnapshot.netWorth)} จากเดือนก่อน</p>}
        <div className="flex items-center gap-2 mt-3"><Flame size={14} color="#FBBF24" /><p className="text-xs" style={{ color: '#94A3B8' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p></div>
      </div>
      ) : (
      <div style={{ background: INK }} className="px-5 pt-5 pb-4 text-white relative overflow-hidden">
        <div className="flex justify-between items-center mb-3" style={{ paddingRight: 74 }}>
          <h1 className="text-base font-semibold flex items-center gap-2">
            {TAB_LABELS[tab] || ''}
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAmounts(!showAmounts)} className="flex items-center gap-1 text-xs rounded-full px-2.5 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}>{showAmounts ? <Eye size={12} /> : <EyeOff size={12} />}</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-1 text-xs rounded-full px-2.5 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}><Settings size={12} /></button>
            <button onClick={() => setShareMode(true)} className="flex items-center gap-1 text-xs rounded-full px-2.5 py-2" style={{ background: '#ffffff15', color: '#CBD5E1' }}><Share2 size={12} /></button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 14, top: 14, width: 52, height: 52, borderRadius: '50%', background: (TAB_MASCOTS[tab] || TAB_MASCOTS.dashboard).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid #FFFFFF4D', overflow: 'hidden' }}>
          {(tab === 'expenses' || tab === 'savings') ? (
            <div className="relative flex items-center justify-center w-full h-full" style={{ background: '#3d2f22' }}>
              <Wallet size={22} color="white" />
              <div className="absolute flex items-center justify-center" style={{ bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: tab === 'expenses' ? BAD : GOOD, border: `2px solid ${INK}`, fontSize: 13, fontWeight: 900, color: 'white' }}>{tab === 'expenses' ? '−' : '+'}</div>
            </div>
          ) : ((tab === 'pets' || tab === 'realestate') && headerPhotoOverride) ? (
            <img src={headerPhotoOverride} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (TAB_MASCOTS[tab] || TAB_MASCOTS.dashboard).photo ? (
            <img src={(TAB_MASCOTS[tab] || TAB_MASCOTS.dashboard).photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (TAB_MASCOTS[tab] || TAB_MASCOTS.dashboard).emoji}
        </div>
        {tabAlert && (
          <div style={{ background: tabAlert.tone === 'bad' ? '#3a2020' : tabAlert.tone === 'warn' ? '#3a2a1a' : '#1a2e22', borderRadius: 14 }} className="px-3 py-2.5 flex items-start gap-2.5" >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{tabAlert.icon}</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: tabAlert.tone === 'ok' ? '#86EFAC' : '#FCA5A5' }}>{tabAlert.title}</p>
              {tabAlert.sub && <p className="text-[11px] mt-0.5" style={{ color: '#C9BCAE' }}>{tabAlert.sub}</p>}
            </div>
          </div>
        )}
      </div>
      )}


      {showSettings && (
        <SettingsModal finnhubKey={state.finnhubKey} onChange={changeFinnhubKey} onClose={() => setShowSettings(false)}
          googleClientId={state.googleClientId} onChangeGoogleClientId={changeGoogleClientId}
          googleToken={googleToken} onConnectCalendar={connectCalendar} onDisconnectCalendar={disconnectCalendar}
          calendarError={calendarError} reconnecting={reconnecting}
          openToLastTab={state.openToLastTab} onChangeOpenToLastTab={(v) => persist({ ...state, openToLastTab: v })}
          notifyDisplayName={state.notifyDisplayName} userEmail={user && user.email} onChangeNotifyDisplayName={changeNotifyDisplayName}
          lineNotifyEnabled={state.lineNotifyEnabled !== false} onChangeLineNotifyEnabled={changeLineNotifyEnabled} />
      )}

      {tab === 'dashboard' && (
        <Dashboard categoryBreakdown={categoryBreakdown} monthlyIncome={monthlyIncome} passiveIncome={passiveIncome} activeIncome={activeIncome}
          investedThisMonth={investedThisMonth} savingsRate={savingsRate} targetDate={state.targetDate} onChangeTarget={changeTargetDate}
          goalNetWorth={state.goalNetWorth} onChangeGoal={changeGoal} requiredDaily={requiredDaily} avgFx={avgFxFromContributions}
          totalNetWorth={totalNetWorth} contributions={contributions} daysLeft={daysLeft} onRefreshFx={refreshFxRate} insights={insights}
          dailyInsight={state?.aiInsight} onRunDailyInsight={runDailyInsight} onNavigateTab={setTab}
          monthChange={prevSnapshot ? totalNetWorth - prevSnapshot.netWorth : null}
          yearChange={yearSnapshot ? totalNetWorth - yearSnapshot.netWorth : null}
          sinceStartChange={firstSnapshot ? totalNetWorth - firstSnapshot.netWorth : null}
          catSetValue={catSetValue} catUsValue={catUsValue} catFundValue={catFundValue} catCoopValue={catCoopValue}
          catRentThisMonth={catRentThisMonth} catRentCollected={catRentCollected} catPetExpenseTotal={catPetExpenseTotal}
          catExpenseThisMonth={catExpenseThisMonth} catSavingsThisMonth={catSavingsThisMonth}
          properties={properties} dogs={dogs} showAmounts={showAmounts} />
      )}
      {tab === 'accounts' && (
        <AccountsTab accounts={accounts} onUpdate={updateAccount} onAdd={addAccount} onRemove={removeAccount} costBasisByAccount={costBasisByAccount}
          onAddHolding={addHolding} onUpdateHolding={updateHolding} onRemoveHolding={removeHolding} onAddDividend={addDividend}
          onRemoveDividend={removeDividend} onUpdateDividend={updateDividend} onRefreshPrice={refreshHoldingPrice} finnhubKey={state.finnhubKey}
          onSellHolding={sellHolding} onRemoveSell={removeSell} onRemoveBuy={removeBuy} onUpdateSell={updateSell} onUpdateBuy={updateBuy} onAddContribution={addContribution} onRecordYieldTech={recordYieldTechWithdrawal} onRecordYieldTechBatch={recordYieldTechWithdrawalsBatch} onRecordBuySellBatch={recordBuySellBatch} />
      )}
      {tab === 'savings' && <SavingsTab accounts={accounts} contributions={contributions} onAdd={addContribution} onRemove={removeContribution} onUpdate={updateContribution} customDestinationList={customDestinationList} onAddCustomDestination={addCustomDestination} onAddToCalendar={addPropertyEventToCalendar} googleConnected={!!googleToken} expenseCategories={expenseCategories} onAddExpense={addExpense} />}
      {tab === 'income' && <NewsTab news={investmentNews} accounts={accounts} onSaved={saveInvestmentNews} />}
      {tab === 'reports' && <ReportsTab contributions={contributions} accounts={accounts} costBasisByAccount={costBasisByAccount} history={history} />}
      {tab === 'expenses' && <ExpensesTab expenses={expenses} categories={expenseCategories} onAdd={addExpense} onRemove={removeExpense} onUpdate={updateExpense} onAddCategory={addExpenseCategory}
          creditCards={creditCards} onAddCreditCard={addCreditCard} onUpdateCreditCard={updateCreditCard} onRemoveCreditCard={removeCreditCard}
          onAddCreditCardTransaction={addCreditCardTransaction} onRemoveCreditCardTransaction={removeCreditCardTransaction} onUpdateCreditCardTransaction={updateCreditCardTransaction} onMatchCreditCard={matchCreditCard}
          googleConnected={!!googleToken} onAddToCalendar={addPropertyEventToCalendar} />}
      {tab === 'pets' && (
        <PetsTab dogs={dogs} onUpdateDog={updateDog} onCopyToMultipleDogs={copyToMultipleDogs} onAddWeight={addWeight} onRemoveWeight={removeWeight} onUpdateWeight={updateWeight}
          onAddMedication={addMedication} onUpdateMedication={updateMedication} onRemoveMedication={removeMedication} onLogFleaTick={logFleaTick} onRemoveFleaTickHistory={removeFleaTickHistory} onUpdateFleaTickHistory={updateFleaTickHistory} onUpdateFleaTickInfo={updateFleaTickInfo}
          onUpdateInsurance={updateInsurance} onAddInsuranceClaim={addInsuranceClaim} onUpdateInsuranceClaim={updateInsuranceClaim} onAddAppointment={addAppointment} onRemoveAppointment={removeAppointment} onUpdateAppointment={updateAppointment}
          onAddBloodTest={addBloodTest} onUpdateBloodTest={updateBloodTest} onAddOrganExam={addOrganExam} onUpdateOrganExam={updateOrganExam} onAddImaging={addImaging} onUpdateImaging={updateImaging} onAddDogExpense={addDogExpense} onRemoveDogExpense={removeDogExpense} onUpdateDogExpense={updateDogExpense}
          googleConnected={!!googleToken} onAddToCalendar={addAppointmentToCalendar} hospitalList={hospitalList} onAddHospital={addHospital} doctorList={doctorList} onAddDoctor={addDoctor} weigherList={weigherList} onAddWeigher={addWeigher} onRefreshShared={refreshSharedData} onSetDogPhoto={setDogPhoto} medicationList={medicationList} onAddMedicationPreset={addMedicationPreset} onAddGenericCalendarEvent={addPropertyEventToCalendar} onAddMedicalPhoto={addMedicalPhoto} onRemoveMedicalPhoto={removeMedicalPhoto} onUploadRecordPhoto={uploadDogRecordPhoto} onAddPersonalExpense={addExpense} expenseCategories={expenseCategories}
          onAddVetVisit={addVetVisit} onUpdateVetVisit={updateVetVisit} onRemoveVetVisit={removeVetVisit} onLinkRecordToVisit={linkRecordToVisit} onUnlinkRecordFromVisit={unlinkRecordFromVisit} onAddInsuranceDocument={addInsuranceDocument} onRemoveInsuranceDocument={removeInsuranceDocument} onCurrentPhotoChange={setHeaderPhotoOverride} onRunHealthInsight={runDogHealthInsight} departmentList={departmentList} onAddDepartment={addDepartment} doctorDepartments={doctorDepartments} onSetDoctorDepartment={setDoctorDepartment} bloodTestTypeList={bloodTestTypeList} onAddBloodTestType={addBloodTestType} organTypeList={organTypeList} onAddOrganType={addOrganType} imagingTypeList={imagingTypeList} onAddImagingType={addImagingType} onAddImagingWithOrgans={addImagingWithOrgans} onAddAlbumPhoto={addAlbumPhoto} onRemoveAlbumPhoto={removeAlbumPhoto} />
      )}
      {tab === 'realestate' && (
        <RealEstateTab properties={properties} onUpdate={updateProperty} onAdd={addProperty} onRemove={removeProperty}
          onTogglePayment={togglePayment} onAddTransaction={addPropertyTransaction} onRemoveTransaction={removePropertyTransaction}
          onAddRepair={addPropertyRepair} onRemoveRepair={removePropertyRepair} onAddPhoto={addPropertyPhoto} onRemovePhoto={removePropertyPhoto}
          onAddDocument={addPropertyDocument} onRemoveDocument={removePropertyDocument}
          onAddRentInstallment={addRentInstallment} onRemoveRentInstallment={removeRentInstallment} onUpdateRentInstallment={updateRentInstallment} onSetRentManualConfirm={setRentManualConfirm}
          accounts={accounts}
          googleConnected={!!googleToken} onAddToCalendar={addPropertyEventToCalendar} onRefreshShared={refreshSharedData} onCurrentPhotoChange={setHeaderPhotoOverride} />
      )}
      {tab === 'insurance' && (
        <InsuranceTab policies={insurancePolicies} claims={insuranceClaims}
          onAddPolicy={addInsurancePolicy} onUpdatePolicy={updateInsurancePolicy} onRemovePolicy={removeInsurancePolicy}
          onAddRider={addInsuranceRider} onUpdateRider={updateInsuranceRider} onRemoveRider={removeInsuranceRider}
          onAddDocument={addInsurancePolicyDocument} onRemoveDocument={removeInsurancePolicyDocument}
          onAddClaim={addInsuranceClaim} onUpdateClaim={updateInsuranceClaim} onRemoveClaim={removeInsuranceClaim}
          googleConnected={!!googleToken} onAddToCalendar={addPropertyEventToCalendar} />
      )}

      <div style={{ background: INK, borderTop: `1px solid #FFFFFF1A` }} className="fixed bottom-0 left-0 right-0 flex justify-around py-3 text-white">
        {[{ id: 'dashboard', label: 'ภาพรวม', icon: Wallet }, { id: 'accounts', label: 'บัญชี', icon: Landmark }, { id: 'savings', label: 'เงินเข้า', icon: PiggyBank }, { id: 'income', label: 'ข่าว', icon: Rss }, { id: 'expenses', label: 'รายจ่าย', icon: Receipt }, { id: 'pets', label: 'ลูกๆ', icon: Dog }, { id: 'realestate', label: 'บ้านเช่า', icon: Home }, { id: 'insurance', label: 'ประกัน', icon: Shield }, { id: 'reports', label: 'รายงาน', icon: BarChart3 }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-1">
            <t.icon size={17} color={tab === t.id ? '#FFFFFF' : '#94A3B8'} /><span className="text-[8px]" style={{ color: tab === t.id ? '#FFFFFF' : '#94A3B8' }}>{t.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => setDebugOpen(!debugOpen)} style={{ position: 'fixed', left: 10, bottom: 74, background: '#7C3AED', zIndex: 200, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 16 }}>🐞</span>
      </button>
      {debugOpen && (
        <div style={{ position: 'fixed', left: 10, right: 10, bottom: 116, background: '#111', color: '#7CFC7C', zIndex: 200, borderRadius: 12, maxHeight: '50vh', overflowY: 'auto', fontFamily: 'monospace', fontSize: 10, padding: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <p style={{ color: 'white', marginBottom: 6 }}>pendingWrites: {pendingWrites} | saveError: {saveError ? 'YES' : 'no'}</p>
          {[...DEBUG_LOG_BUFFER].reverse().map((l, i) => (
            <p key={i} style={{ color: l.level === 'error' ? '#FF6B6B' : l.level === 'warn' ? '#FFD166' : '#7CFC7C', margin: '2px 0', wordBreak: 'break-all' }}>[{l.t}] {l.text}</p>
          ))}
          {DEBUG_LOG_BUFFER.length === 0 && <p style={{ color: '#888' }}>ยังไม่มี log</p>}
        </div>
      )}
    </div>
  );
}

function Card({ children, style }) { return <div style={{ background: 'white', borderRadius: CARD_RADIUS, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', ...style }} className="p-4 mb-4">{children}</div>; }

// Popup แก้ไขรายการทั่วไป (ฟีเจอร์ O) — ใช้ร่วมกันทุก Tab ที่มีปุ่มลบ ยกเว้นตัวหุ้น/บัญชีทั้งก้อน
// fields: [{ key, label, type: 'text'|'number'|'date'|'time'|'select'|'textarea', options }]
// เลือกบัญชีปลายทางจากลิสต์จริง หรือพิมพ์เองได้ (เช่น "ตู้เซฟ", "ฝากเด็กร้านขายยา") เผื่อเก็บเงินไว้ก่อนยังไม่ได้ฝากเข้าบัญชีลงทุนจริง
function AccountPickerWithCustom({ options, value, onChange, customList, onAddCustom }) {
  const isKnownAccount = options.some((o) => (o.value !== undefined ? o.value : o) === value);
  const isKnownCustom = (customList || []).includes(value);
  const [typingNew, setTypingNew] = useState(!!value && !isKnownAccount && !isKnownCustom);
  const selectValue = typingNew ? '__custom__' : (isKnownAccount || isKnownCustom ? value : '');
  return (
    <div>
      <select
        value={selectValue}
        onChange={(e) => { if (e.target.value === '__custom__') { setTypingNew(true); onChange(''); } else { setTypingNew(false); onChange(e.target.value); } }}
        style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1">
        <option value="">— เลือกบัญชีปลายทาง —</option>
        {options.map((o) => <option key={o.value !== undefined ? o.value : o} value={o.value !== undefined ? o.value : o}>{o.label || o}</option>)}
        {(customList || []).length > 0 && <option disabled>── จุดเก็บเงินที่เคยบันทึกไว้ ──</option>}
        {(customList || []).map((c) => <option key={c} value={c}>📍 {c}</option>)}
        <option value="__custom__">+ เก็บไว้ก่อน / พิมพ์เองใหม่</option>
      </select>
      {typingNew && (
        <div className="flex gap-2 mt-1.5">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="เช่น ตู้เซฟ, ฝากเด็กร้านยา" style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm flex-1" />
          {value && onAddCustom && (
            <button type="button" onClick={() => onAddCustom(value)} className="text-xs rounded-lg px-3 whitespace-nowrap" style={{ border: `1px solid ${BRASS}`, color: BRASS }}>จำไว้ด้วย</button>
          )}
        </div>
      )}
    </div>
  );
}

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
              <NumInput value={values[f.key]} onChange={(v) => setField(f.key, v)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            ) : f.type === 'select' ? (
              <select value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1">
                {(f.options || []).map((o) => <option key={o.value !== undefined ? o.value : o} value={o.value !== undefined ? o.value : o}>{o.label || o}</option>)}
              </select>
            ) : f.type === 'select-custom' ? (
              <AccountPickerWithCustom options={f.options || []} value={values[f.key] || ''} onChange={(v) => setField(f.key, v)} customList={f.customList} onAddCustom={f.onAddCustom} />
            ) : f.type === 'textarea' ? (
              <textarea value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} rows={3} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            ) : (
              <input type={f.type || 'text'} value={values[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
            )}
          </div>
        ))}
        <button onClick={() => onSave(values)} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm">บันทึกการแก้ไข</button>
      </div>
    </div>
  );
}

// dropdown ที่เลือกจากลิสต์ได้ หรือกด "อื่นๆ (พิมพ์เอง)" แล้วพิมพ์เองได้เลย — ใช้กับประเภทตรวจเลือด/อวัยวะ/Imaging
// ช่องที่จดจำค่าที่เคยพิมพ์ไว้ (เช่น ชื่อสัตวแพทย์) — เลือกจาก dropdown ได้ หรือพิมพ์ใหม่แล้วกด "จำชื่อนี้ไว้" เพื่อบันทึกเข้ารายการ
function MemoTextField({ list, value, onChange, onAddToList, placeholder, className, style }) {
  const inList = value && (list || []).includes(value);
  return (
    <div>
      <select value={inList ? value : ''} onChange={(e) => onChange(e.target.value)} className={className} style={{ ...style, marginBottom: 6 }}>
        <option value="">— เลือกจากที่เคยบันทึกไว้ —</option>
        {(list || []).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <div className="flex gap-2">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} style={{ ...style, flex: 1 }} />
        {value && !inList && (
          <button type="button" onClick={() => onAddToList(value)} className="text-xs rounded-lg px-3 whitespace-nowrap" style={{ border: `1px solid ${BRASS}`, color: BRASS }}>จำชื่อนี้ไว้</button>
        )}
      </div>
    </div>
  );
}

function TypeSelectWithCustom({ options, value, onChange, onAddToList, className, style }) {
  const [customMode, setCustomMode] = useState(!!value && !options.includes(value));
  return (
    <div>
      <select
        value={customMode ? '__custom__' : (options.includes(value) ? value : '')}
        onChange={(e) => { if (e.target.value === '__custom__') setCustomMode(true); else { setCustomMode(false); onChange(e.target.value); } }}
        className={className} style={style}>
        <option value="">— เลือก —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__custom__">+ อื่นๆ (พิมพ์เอง)</option>
      </select>
      {customMode && (
        <div className="flex gap-2" style={{ marginTop: 6 }}>
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="พิมพ์ชื่อรายการที่ต้องการ" className={className} style={{ ...style, flex: 1 }} />
          {onAddToList && value && !options.includes(value) && (
            <button type="button" onClick={() => onAddToList(value)} className="text-xs rounded-lg px-3 whitespace-nowrap" style={{ border: `1px solid ${BRASS}`, color: BRASS }}>จำไว้ด้วย</button>
          )}
        </div>
      )}
    </div>
  );
}

function EditButton({ onClick }) {
  return <button onClick={onClick} className="text-[11px] underline mr-2" style={{ color: BRASS }}>แก้ไข</button>;
}

// สรุปข้อมูล "ไปหาหมอ" ครั้งหนึ่งเป็นข้อความเต็ม รวมทุกรายการที่เชื่อมโยงไว้ (ผลเลือด/อวัยวะ/Imaging/น้ำหนัก/ยา/ค่าใช้จ่าย)
function buildVetVisitShareText(dog, visit) {
  const lines = [];
  lines.push(`🐶 ${dog.name} — ไปหาหมอ`);
  lines.push(`📅 วันที่: ${visit.date}`);
  if (visit.hospital) lines.push(`🏥 โรงพยาบาล: ${visit.hospital}`);
  if (visit.department) lines.push(`🚪 แผนก: ${visit.department}`);
  if (visit.doctor) lines.push(`👨‍⚕️ สัตวแพทย์: ${visit.doctor}`);
  if (visit.reason) lines.push(`📝 เหตุผลที่ไป: ${visit.reason}`);
  if (visit.diagnosis) lines.push(`💬 ผลวินิจฉัย/การรักษา: ${visit.diagnosis}`);
  if (visit.cost) lines.push(`💰 ค่าใช้จ่าย: ฿${fmt(visit.cost)}`);
  const linked = visit.linkedRecords || [];
  linked.forEach((lr) => {
    const record = (dog[lr.type] || []).find((r) => r.id === lr.id);
    if (!record) return;
    if (lr.type === 'bloodTests') lines.push(`🩸 ตรวจเลือด (${record.type || ''}): ${record.note || '-'}`);
    else if (lr.type === 'organExams') lines.push(`🫁 อวัยวะ (${record.organ || ''}): ${record.note || '-'}`);
    else if (lr.type === 'imaging') lines.push(`🩻 ${record.type || 'Imaging'}: ${record.note || '-'}`);
    else if (lr.type === 'weights') lines.push(`⚖️ น้ำหนัก: ${record.weight} กก.`);
    else if (lr.type === 'medications') lines.push(`💊 ยา: ${record.name}${record.dose ? ' ' + record.dose : ''}`);
    else if (lr.type === 'expenses') lines.push(`🧾 ค่าใช้จ่าย: ฿${fmt(record.amount)} (${record.category || ''})`);
  });
  return lines.join('\n');
}
function buildAppointmentShareText(dog, appt) {
  const lines = [];
  lines.push(`🐶 ${dog.name} — นัดหมาย`);
  lines.push(`📅 วันนัด: ${appt.date}`);
  if (appt.hospital) lines.push(`🏥 โรงพยาบาล: ${appt.hospital}`);
  if (appt.doctor) lines.push(`👨‍⚕️ สัตวแพทย์: ${appt.doctor}`);
  if (appt.purpose) lines.push(`📝 วัตถุประสงค์: ${appt.purpose}`);
  return lines.join('\n');
}
// แชร์ข้อความ+รูปผ่านเมนูแชร์ของเครื่อง (รองรับ LINE/Messenger/อีเมล ฯลฯ) ถ้าเครื่องไม่รองรับ fallback ไปเปิด LINE ด้วยข้อความอย่างเดียว
async function shareContent(text, photoUrls) {
  const result = { ok: false, sharedWithPhotos: false, error: null, requestedPhotoCount: (photoUrls || []).length, attachedPhotoCount: 0, textCopiedToClipboard: false };
  // คัดลอกข้อความไว้ในคลิปบอร์ดเสมอ เผื่อไว้ก่อน — บางแอปปลายทาง (เช่น LINE) เวลาส่งรูป+ข้อความพร้อมกัน
  // จะรับแค่รูปแล้วตัดข้อความทิ้งไปเงียบๆ (ข้อจำกัดของแอปปลายทางเอง แก้จากฝั่งเว็บเราไม่ได้ 100%)
  try { await navigator.clipboard.writeText(text); result.textCopiedToClipboard = true; } catch (e) { console.error('clipboard copy failed', e); }
  try {
    if (navigator.share) {
      let files = [];
      if (photoUrls && photoUrls.length) {
        for (const url of photoUrls.slice(0, 8)) {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`โหลดรูปไม่สำเร็จ (${res.status})`);
            const blob = await res.blob();
            files.push(new File([blob], `photo_${files.length + 1}.jpg`, { type: blob.type || 'image/jpeg' }));
          } catch (e) { console.error('share: photo fetch failed', url, e); }
        }
      }
      result.attachedPhotoCount = files.length;
      const canShareFiles = files.length > 0 && navigator.canShare && navigator.canShare({ files });
      if (canShareFiles) {
        await navigator.share({ text, files });
        result.ok = true; result.sharedWithPhotos = true;
      } else {
        if (files.length === 0 && (photoUrls || []).length > 0) console.error('share: no photos could be attached, device/browser may not support file sharing');
        await navigator.share({ text });
        result.ok = true; result.sharedWithPhotos = false;
      }
    } else {
      window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
      result.ok = true; result.sharedWithPhotos = false;
      if ((photoUrls || []).length > 0) console.error('share: device has no Web Share API, opened LINE text-only — photos need manual download');
    }
  } catch (e) {
    if (e && e.name === 'AbortError') { result.ok = true; /* ผู้ใช้กดยกเลิกเอง ไม่ถือเป็น error */ }
    else { console.error('share failed', e); result.error = e.message || String(e); }
  }
  return result;
}
// ดาวน์โหลดรูปทีละใบไว้ในเครื่อง เผื่อกรณีอุปกรณ์ไม่รองรับการแชร์ไฟล์รูปโดยตรง จะได้เอาไปแนบเองใน LINE ได้
async function downloadPhotos(photoUrls) {
  let success = 0; let failed = 0;
  for (let i = 0; i < (photoUrls || []).length; i++) {
    try {
      const res = await fetch(photoUrls[i]);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = `photo_${i + 1}.jpg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      success++;
    } catch (e) { console.error('download photo failed', photoUrls[i], e); failed++; }
  }
  return { success, failed };
}

function Lightbox({ url, onClose }) {
  if (!url) return null;
  return (
    <div onClick={onClose} style={{ background: 'rgba(0,0,0,0.9)', position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', padding: 8 }}><X size={22} color="white" /></button>
      <img src={url} alt="" style={{ maxWidth: '94vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function MedicalPhotoAttach({ record, onAddPhoto, onRemovePhoto }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { await onAddPhoto(file); } catch (err) { /* เงียบไว้ */ }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  return (
    <div className="mt-2">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {uploading ? 'กำลังอัพโหลด...' : 'แนบรูปผลตรวจ'}
      </button>
      {(record.photos || []).length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {record.photos.map((ph) => (
            <div key={ph.id} className="relative">
              <button onClick={() => setLightboxUrl(ph.url)} className="w-full block"><img src={ph.url} alt="" className="w-full h-14 object-cover rounded-lg" /></button>
              <button onClick={() => onRemovePhoto(ph.id)} style={{ background: 'rgba(0,0,0,0.5)' }} className="absolute top-0.5 right-0.5 rounded-full p-0.5"><Trash2 size={10} color="white" /></button>
            </div>
          ))}
        </div>
      )}
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}

function SettingsModal({ finnhubKey, onChange, onClose, googleClientId, onChangeGoogleClientId, googleToken, onConnectCalendar, onDisconnectCalendar, calendarError, reconnecting, openToLastTab, onChangeOpenToLastTab, notifyDisplayName, userEmail, onChangeNotifyDisplayName, lineNotifyEnabled, onChangeLineNotifyEnabled }) {
  return (
    <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
      <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">ตั้งค่า</p><button onClick={onClose}><X size={20} color={INK} /></button></div>

        <div style={{ borderBottom: '1px solid #E7EAF0' }} className="pb-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="pr-3">
              <p className="text-xs font-semibold" style={{ color: INK }}>จำหน้าที่ใช้ล่าสุด</p>
              <p className="text-[11px]" style={{ color: SLATE }}>เปิดแอปครั้งถัดไปจะเข้าหน้าที่ใช้ล่าสุดแทนหน้าภาพรวม</p>
            </div>
            <button onClick={() => onChangeOpenToLastTab(!openToLastTab)} style={{ background: openToLastTab ? GOOD : PAPER_DIM, flexShrink: 0 }} className="w-12 h-7 rounded-full relative">
              <div style={{ background: 'white', left: openToLastTab ? 22 : 3, top: 3 }} className="w-5 h-5 rounded-full absolute transition-all" />
            </button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #E7EAF0' }} className="pb-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="pr-3">
              <p className="text-xs font-semibold" style={{ color: INK }}>แจ้งเตือนผ่าน LINE</p>
              <p className="text-[11px]" style={{ color: SLATE }}>ปิดไว้ชั่วคราวได้ถ้าไม่อยากให้มีข้อความเด้งเข้ากลุ่ม (เช่น กำลังทดสอบ/แก้ข้อมูลหลายรายการรวด) — ตั้งค่านี้แยกกันได้ในแต่ละบัญชี ปิดที่บัญชีนี้จะงดแจ้งเตือนเฉพาะตอนที่บัญชีนี้เป็นคนบันทึก/แก้ไขเท่านั้น ไม่กระทบอีกฝ่าย</p>
            </div>
            <button onClick={() => onChangeLineNotifyEnabled(!lineNotifyEnabled)} style={{ background: lineNotifyEnabled ? GOOD : PAPER_DIM, flexShrink: 0 }} className="w-12 h-7 rounded-full relative">
              <div style={{ background: 'white', left: lineNotifyEnabled ? 22 : 3, top: 3 }} className="w-5 h-5 rounded-full absolute transition-all" />
            </button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #E7EAF0' }} className="pb-4 mb-4">
          <p className="text-xs font-semibold mb-1" style={{ color: INK }}>ชื่อที่แสดงในแจ้งเตือน LINE</p>
          <p className="text-[11px] mb-2" style={{ color: SLATE }}>ทุกข้อความแจ้งเตือนที่ยิงเข้ากลุ่ม LINE จะต่อท้ายด้วย "โดย {'{ชื่อนี้}'}" เพื่อให้รู้ว่าใครเป็นคนบันทึก/แก้ไข — ตั้งค่านี้แยกกันได้ในแต่ละเครื่อง (บัญชีของใคร ก็ตั้งชื่อของคนนั้น)</p>
          <input type="text" value={notifyDisplayName || ''} onChange={(e) => onChangeNotifyDisplayName(e.target.value)} placeholder={userEmail ? `ค่าเริ่มต้น: ${userEmail}` : 'เช่น ทอมมี่'} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full" />
        </div>

        <p className="text-xs mb-2" style={{ color: SLATE }}>Finnhub API key (ฟรี) — ใช้สำหรับปุ่มรีเฟรชราคาหุ้นสหรัฐฯ สมัครที่ finnhub.io/register</p>
        <input type="text" value={finnhubKey || ''} onChange={(e) => onChange(e.target.value)} placeholder="วาง API key ที่นี่" style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mb-2" />
        <p className="text-[11px] mb-4" style={{ color: SLATE }}>หุ้นไทย (SET) ยังไม่มี API ฟรีที่ดึงราคาได้ตรงจากเบราว์เซอร์ ต้องอัพเดทราคาด้วยตนเองไปก่อนครับ</p>

        <div style={{ borderTop: '1px solid #E7EAF0' }} className="pt-4">
          <p className="text-xs mb-2" style={{ color: SLATE }}>Google Calendar — สำหรับเพิ่มนัดหมายลงปฏิทินโดยตรง ต้องสร้าง OAuth Client ID จาก Google Cloud Console ก่อน</p>
          <input type="text" value={googleClientId || ''} onChange={(e) => onChangeGoogleClientId(e.target.value)} placeholder="วาง Google Client ID ที่นี่ (ลงท้าย .apps.googleusercontent.com)" style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mb-2" />
          {reconnecting && <p className="text-[11px] mb-2" style={{ color: SLATE }}>กำลังเชื่อมต่ออัตโนมัติ...</p>}
          <button onClick={onConnectCalendar} style={{ background: googleToken ? GOOD : INK }} className="w-full text-white rounded-lg py-2 text-sm mb-2">
            {googleToken ? '✓ เชื่อมต่อแล้ว (จะเชื่อมอัตโนมัติทุกครั้งที่เปิดแอป)' : 'เชื่อมต่อ Google Calendar'}
          </button>
          {googleToken && <button onClick={onDisconnectCalendar} className="w-full text-xs rounded-lg py-2 mb-2" style={{ border: '1px solid #E7EAF0', color: BAD }}>ยกเลิกการเชื่อมต่อ</button>}
          {calendarError && <p className="text-[11px]" style={{ color: BAD }}>{calendarError}</p>}
          <p className="text-[11px]" style={{ color: SLATE }}>เชื่อมต่อครั้งเดียว ระบบจะจำไว้และเชื่อมต่อให้อัตโนมัติทุกครั้งที่เปิดแอปในอนาคต</p>
        </div>
      </div>
    </div>
  );
                                                    }function ShareView({ totalNetWorth, categoryBreakdown, monthlyIncome, daysLeft, onClose }) {
  return (
    <div style={{ background: INK, minHeight: '100vh', fontFamily: 'Sarabun, sans-serif', color: 'white' }} className="p-6">
      <div className="flex justify-between items-center mb-6"><p className="text-xs tracking-widest" style={{ color: '#94A3B8' }}>สรุปพอร์ตการลงทุน</p><button onClick={onClose}><X size={20} color="white" /></button></div>
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
      <div style={{ borderTop: '1px solid #ffffff22' }} className="pt-4 mb-4"><p className="text-xs" style={{ color: '#94A3B8' }}>กระแสเงินสดต่อเดือน</p><p className="text-xl">฿{fmt(monthlyIncome)}</p></div>
      <div className="flex items-center gap-2 mb-8"><Flame size={14} color="#FBBF24" /><p className="text-xs" style={{ color: '#94A3B8' }}>เป้าหมายเกษียณอีก {daysLeft.toLocaleString()} วัน</p></div>
      <p className="text-[11px] text-center" style={{ color: '#94A3B8' }}>ใช้ปุ่มแคปหน้าจอของเครื่องเพื่อบันทึกภาพนี้</p>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return <div style={{ background: PAPER_DIM }} className="rounded-xl p-3"><p className="text-[10px] mb-1" style={{ color: SLATE }}>{label}</p><p className="text-lg font-semibold" style={{ color: color || INK }}>{value}</p></div>;
}
// กราฟเส้นเล็กๆ แสดงแนวโน้ม (เช่น น้ำหนักย้อนหลัง) ไม่มีแกน ไม่มีตัวเลขกำกับ ดูปุ๊บรู้ทิศทาง
function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const w = 64, h = 24, pad = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const last = values[values.length - 1];
  const lastPt = pts[pts.length - 1].split(',').map(Number);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color || BRASS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color || BRASS} />
    </svg>
  );
}
function WeightStatBox({ label, value, trendValues, trendColor, onClick }) {
  return (
    <button onClick={onClick} disabled={!onClick} style={{ background: PAPER_DIM }} className="rounded-xl p-3 text-left w-full">
      <p className="text-[10px] mb-1" style={{ color: SLATE }}>{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold" style={{ color: INK }}>{value}</p>
        {trendValues && trendValues.length >= 2 && <Sparkline values={trendValues} color={trendColor} />}
      </div>
    </button>
  );
}
function DashCategoryCard({ label, value, sub, tone, icon: Icon, fg, bg, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'white', borderRadius: CARD_RADIUS, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }} className="p-3.5 text-left">
      <div style={{ background: bg, color: fg }} className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"><Icon size={15} /></div>
      <p className="text-[11px] mb-0.5" style={{ color: SLATE }}>{label}</p>
      <p className="text-base font-bold leading-tight" style={{ color: INK }}>{value}</p>
      <p className="text-[10px] mt-1" style={{ color: tone === 'good' ? GOOD : tone === 'bad' ? BAD : SLATE }}>{sub}</p>
    </button>
  );
}
function PassiveIncomeRing({ pct }) {
  const r = 34, c = 2 * Math.PI * r; const clamped = Math.min(100, Math.max(0, pct));
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} stroke={PAPER_DIM} strokeWidth="8" fill="none" />
      <circle cx="44" cy="44" r={r} stroke={GOOD} strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (c * clamped) / 100} strokeLinecap="round" transform="rotate(-90 44 44)" />
      <text x="44" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill={INK}>{Math.round(clamped)}%</text>
    </svg>
  );
}
function InsightRow({ tone, text, onClick }) {
  const Icon = tone === 'warn' ? AlertTriangle : tone === 'good' ? CheckCircle2 : Info;
  const color = tone === 'warn' ? WARN : tone === 'good' ? GOOD : SLATE;
  const content = (
    <>
      <Icon size={15} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
      <p className="text-sm flex-1">{text}</p>
      {onClick && <ChevronRight size={15} color={SLATE} style={{ marginTop: 1, flexShrink: 0 }} />}
    </>
  );
  if (onClick) {
    return <button onClick={onClick} className="flex items-start gap-2 mb-2 w-full text-left" style={{ background: 'transparent' }}>{content}</button>;
  }
  return <div className="flex items-start gap-2 mb-2">{content}</div>;
}

function Dashboard({ categoryBreakdown, monthlyIncome, passiveIncome, activeIncome, investedThisMonth, savingsRate, targetDate, onChangeTarget, goalNetWorth, onChangeGoal, requiredDaily, avgFx, totalNetWorth, contributions, daysLeft, onRefreshFx, insights, dailyInsight, onRunDailyInsight, onNavigateTab, monthChange, yearChange, sinceStartChange, catSetValue, catUsValue, catFundValue, catCoopValue, catRentThisMonth, catRentCollected, catPetExpenseTotal, catExpenseThisMonth, catSavingsThisMonth, properties, dogs, showAmounts }) {
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

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!dailyInsight || dailyInsight.date !== todayStr) { onRunDailyInsight(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const passiveGoalTarget = 300000; // เป้าหมาย passive income ต่อเดือน (ปรับได้ทีหลังถ้าต้องการ)
  const passivePctVsGoal = passiveGoalTarget ? (passiveIncome / passiveGoalTarget) * 100 : 0;

  // ปฏิทินเหตุการณ์สำคัญ: รวมวันครบสัญญาบ้านเช่า + นัดหมอถัดไปของลูกๆ
  const upcomingEvents = useMemo(() => {
    const events = [];
    const ym = thisMonth();
    (properties || []).forEach((p) => {
      if (p.contractEndDate) {
        const daysLeftP = Math.ceil((new Date(p.contractEndDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeftP >= -3 && daysLeftP <= 60) events.push({ date: p.contractEndDate, label: `ครบสัญญาเช่า: ${p.name}`, tone: daysLeftP <= 14 ? 'warn' : 'info' });
      }
      if (p.status === 'occupied' && p.rentDueDay) {
        const pay = (p.payments || {})[ym] || {};
        if (!pay.paid) {
          const dueDate = `${ym}-${String(p.rentDueDay).padStart(2, '0')}`;
          const daysToDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          const reminderDays = p.rentReminderDays || [3, 1];
          if (daysToDue < 0) events.push({ date: dueDate, label: `ค่าเช่าเลยกำหนด: ${p.name} (เลยมา ${Math.abs(daysToDue)} วัน)`, tone: 'warn' });
          else if (reminderDays.some((d) => daysToDue <= d)) events.push({ date: dueDate, label: `ใกล้ครบกำหนดค่าเช่า: ${p.name}`, tone: 'info' });
        }
      }
    });
    (dogs || []).forEach((d) => {
      (d.appointments || []).forEach((a) => {
        const daysLeftA = Math.ceil((new Date(a.date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeftA >= 0 && daysLeftA <= 30) events.push({ date: a.date, label: `นัดหมอ: ${d.name}${a.purpose ? ' - ' + a.purpose : ''}`, tone: 'info' });
      });
    });
    return events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  }, [properties, dogs]);

  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>สินทรัพย์สุทธิ (Net Worth)</p>
        <p className="text-3xl font-bold mb-3" style={{ color: INK }}>{showAmounts ? `฿${fmt(totalNetWorth)}` : '฿xxx,xxx'}</p>
        <div className="grid grid-cols-3 gap-2">
          <div style={{ background: PAPER_DIM }} className="rounded-xl p-2.5 text-center">
            <p className="text-[10px] mb-1" style={{ color: SLATE }}>เดือนนี้</p>
            {!showAmounts ? <p className="text-xs font-bold" style={{ color: SLATE }}>฿xxx</p> : monthChange !== null ? <p className="text-xs font-bold" style={{ color: monthChange >= 0 ? GOOD : BAD }}>{monthChange >= 0 ? '+' : ''}฿{fmt(monthChange)}</p> : <p className="text-xs" style={{ color: SLATE }}>เริ่มเก็บข้อมูล</p>}
          </div>
          <div style={{ background: PAPER_DIM }} className="rounded-xl p-2.5 text-center">
            <p className="text-[10px] mb-1" style={{ color: SLATE }}>ปีนี้</p>
            {!showAmounts ? <p className="text-xs font-bold" style={{ color: SLATE }}>฿xxx</p> : yearChange !== null ? <p className="text-xs font-bold" style={{ color: yearChange >= 0 ? GOOD : BAD }}>{yearChange >= 0 ? '+' : ''}฿{fmt(yearChange)}</p> : <p className="text-xs" style={{ color: SLATE }}>เริ่มเก็บข้อมูล</p>}
          </div>
          <div style={{ background: PAPER_DIM }} className="rounded-xl p-2.5 text-center">
            <p className="text-[10px] mb-1" style={{ color: SLATE }}>ตั้งแต่เริ่มต้น</p>
            {!showAmounts ? <p className="text-xs font-bold" style={{ color: SLATE }}>฿xxx</p> : sinceStartChange !== null ? <p className="text-xs font-bold" style={{ color: sinceStartChange >= 0 ? GOOD : BAD }}>{sinceStartChange >= 0 ? '+' : ''}฿{fmt(sinceStartChange)}</p> : <p className="text-xs" style={{ color: SLATE }}>เริ่มเก็บข้อมูล</p>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <DashCategoryCard label="หุ้นไทย" value={`฿${fmt(catSetValue)}`} sub="ดูรายละเอียด" icon={TrendingUp} fg={GOOD} bg="#16A34A14" onClick={() => onNavigateTab('accounts')} />
        <DashCategoryCard label="หุ้นสหรัฐฯ" value={`฿${fmt(catUsValue)}`} sub="ดูรายละเอียด" icon={TrendingUp} fg="#2563EB" bg="#2563EB14" onClick={() => onNavigateTab('accounts')} />
        <DashCategoryCard label="กองทุนรวม" value={`฿${fmt(catFundValue)}`} sub="ดูรายละเอียด" icon={PiggyBank} fg="#CA8A04" bg="#CA8A0414" onClick={() => onNavigateTab('accounts')} />
        <DashCategoryCard label="สหกรณ์ออมทรัพย์" value={`฿${fmt(catCoopValue)}`} sub="ดูรายละเอียด" icon={Landmark} fg="#0891B2" bg="#0891B214" onClick={() => onNavigateTab('accounts')} />
        <DashCategoryCard label="บ้านเช่า" value={`฿${fmt(catRentThisMonth)}`} sub={`เก็บแล้ว ฿${fmt(catRentCollected)}`} tone={catRentCollected >= catRentThisMonth ? 'good' : null} icon={Home} fg="#D97706" bg="#D9770614" onClick={() => onNavigateTab('realestate')} />
        <DashCategoryCard label="ลูกๆ" value={`฿${fmt(catPetExpenseTotal)}`} sub="ค่าใช้จ่ายสะสม" tone="bad" icon={Dog} fg="#7C3AED" bg="#7C3AED14" onClick={() => onNavigateTab('pets')} />
        <DashCategoryCard label="รายจ่าย" value={`฿${fmt(catExpenseThisMonth)}`} sub="เดือนนี้" tone="bad" icon={Receipt} fg={BAD} bg="#DC262614" onClick={() => onNavigateTab('expenses')} />
        <DashCategoryCard label="เงินเข้า" value={`฿${fmt(catSavingsThisMonth)}`} sub="เดือนนี้" tone="good" icon={Wallet} fg={GOOD} bg="#16A34A14" onClick={() => onNavigateTab('savings')} />
      </div>

      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>Passive Income เทียบเป้าหมาย</p>
        <div className="flex items-center gap-4">
          <PassiveIncomeRing pct={passivePctVsGoal} />
          <div className="flex-1">
            <p className="text-xl font-bold" style={{ color: INK }}>฿{fmt(passiveIncome)}</p>
            <p className="text-xs mb-2" style={{ color: SLATE }}>จากเป้าหมาย ฿{fmt(passiveGoalTarget)}/เดือน</p>
            <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden"><div style={{ width: `${Math.min(100, passivePctVsGoal)}%`, background: GOOD }} className="h-full rounded-full" /></div>
          </div>
        </div>
      </Card>

      <Card style={{ background: PAPER_DIM, boxShadow: 'none' }}>
        <div className="flex items-center gap-2 mb-2.5"><Sparkles size={15} color={INK} /><p className="text-sm font-semibold" style={{ color: INK }}>สรุปวันนี้โดย AI</p></div>
        {dailyInsight && dailyInsight.text ? (
          <p className="text-[13px] whitespace-pre-wrap" style={{ color: INK }}>{dailyInsight.text}</p>
        ) : (
          <p className="text-[13px]" style={{ color: SLATE }}>กำลังสรุปข้อมูลวันนี้...</p>
        )}
      </Card>

      {upcomingEvents.length > 0 && (
        <Card>
          <p className="text-xs mb-3" style={{ color: SLATE }}>ปฏิทินเหตุการณ์สำคัญ</p>
          {upcomingEvents.map((e, i) => (
            <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? `1px solid #E7EAF0` : 'none' }}>
              <div style={{ background: e.tone === 'warn' ? WARN : '#2563EB' }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
              <span className="text-xs w-16 flex-shrink-0" style={{ color: SLATE }}>{formatDateDMY(e.date)}</span>
              <span className="text-sm flex-1" style={{ color: INK }}>{e.label}</span>
            </div>
          ))}
        </Card>
      )}

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
            <div className="flex gap-2 items-center"><span className="text-xs" style={{ color: SLATE }}>ถ้าออมเดือนละ</span><NumInput value={calcMonthly} onChange={setCalcMonthly} className="text-xs rounded px-2 py-1 w-24" style={{ border: '1px solid #E7EAF0' }} /><span className="text-xs" style={{ color: SLATE }}>บาท</span></div>
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
        <input type="date" value={targetDate} onChange={(e) => onChangeTarget(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>เป้าหมายสินทรัพย์สุทธิ (บาท)</label>
        <NumInput value={goalNetWorth} onChange={onChangeGoal} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1" />
        {requiredDaily > 0 && <p className="text-xs mt-3" style={{ color: GOOD }}>ควรออมเพิ่มวันละ ~฿{fmt(requiredDaily)}</p>}
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-2"><Sparkles size={16} color={BRASS} /><p className="text-sm font-semibold">ให้ AI แนะนำสัดส่วนการลงทุน</p></div>
        <label className="text-xs" style={{ color: SLATE }}>เงินก้อนใหม่ที่จะลงทุนรอบนี้ (บาท)</label>
        <NumInput value={newAmount} onChange={setNewAmount} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <button onClick={runAi} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} color={BRASS} />}{aiLoading ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำ'}
        </button>
        {aiOpen && !aiLoading && <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-3 mt-3 text-sm whitespace-pre-wrap">{aiError ? <span style={{ color: BAD }}>{aiError}</span> : aiText}</div>}
      </Card>
    </div>
  );
}

function tryRepairTruncatedJson(str) {
  // ซ่อมแซม JSON ที่ถูกตัดครึ่งกลางคัน (เช่น เพราะ token limit ของ AI) โดยตัดกลับไปจุดล่าสุดที่ยัง valid แล้วปิดวงเล็บที่ค้างอยู่ให้ครบ
  const stack = [];
  let inStr = false, strCh = null, esc = false, lastSafe = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      if (esc) { esc = false; }
      else if (c === '\\') { esc = true; }
      else if (c === strCh) { inStr = false; lastSafe = i + 1; }
      continue;
    }
    if (c === '"') { inStr = true; strCh = c; continue; }
    if (c === '{' || c === '[') { stack.push(c); continue; }
    if (c === '}' || c === ']') { stack.pop(); lastSafe = i + 1; continue; }
  }
  let truncated = str.slice(0, lastSafe).replace(/,\s*$/, '');
  for (let i = stack.length - 1; i >= 0; i--) truncated += (stack[i] === '{' ? '}' : ']');
  return truncated;
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
  try {
    return JSON.parse(clean);
  } catch (e) {
    // คำตอบอาจถูกตัดครึ่งกลางคัน (token limit) ลองซ่อมก่อนยอมแพ้ เพื่อกู้ข้อมูลบางส่วนแทนที่จะเสียทั้งหมด
    try { return JSON.parse(tryRepairTruncatedJson(clean)); }
    catch (e2) { throw e; }
  }
}

async function scanSingleValue(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอแอปการลงทุนของสินทรัพย์ชิ้นเดียว อ่านมูลค่ารวม (ยอดใหญ่ที่สุดที่สื่อถึงมูลค่าพอร์ต/สินทรัพย์นี้) และสกุลเงินที่แสดง แล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"value": ตัวเลขไม่มีคอมมา, "currency": "THB หรือ USD"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  const parsed = safeParseJson(text);
  return { value: Number(parsed.value) || 0, currency: parsed.currency === 'USD' ? 'USD' : 'THB' };
}
async function scanCashBalance(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอพอร์ตการลงทุน ซึ่งอาจมีตัวเลขหลายค่าปนกัน (เช่น Amount, Market Value, Unrealized P/L, Line Available, Cash Balance) หาตัวเลข "เงินสด" ของบัญชีนี้ตามลำดับความสำคัญนี้:
1. ถ้าเห็นช่อง "Line Available" (วงเงินคงเหลือที่ใช้ซื้อได้) ให้ใช้ค่านี้เป็นหลัก — สำหรับพอร์ตหุ้นแบบมาร์จิ้น เลขนี้คือเงินสด/วงเงินที่ใช้ได้จริง
2. ถ้าไม่มีช่อง "Line Available" ในภาพ ให้ใช้ช่อง "Cash Balance" หรือ "เงินสดคงเหลือ" หรือ "เงินสดในบัญชี" แทน
ห้ามอ่านค่าอื่นเช่น Market Value, Amount, ยอดพอร์ตรวม เด็ดขาด ถ้าไม่เจอทั้ง 2 แบบข้างต้นชัดเจนในภาพ ให้ตอบ value เป็น null ห้ามเดา ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"value": ตัวเลขไม่มีคอมมาหรือnull, "currency": "THB หรือ USD", "source": "line_available หรือ cash_balance"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  const parsed = safeParseJson(text);
  return { value: parsed.value !== null && parsed.value !== undefined ? Number(parsed.value) : null, currency: parsed.currency === 'USD' ? 'USD' : 'THB', source: parsed.source || '' };
}
// อ่านหน้าจอ "เงินสด" ของแอป Dime! ซึ่งแยกเป็น 3 บัญชีย่อยในภาพเดียว: THB (Dime! Save), USD (Dime! USD), USD (Dime! FCD)
async function scanDimeCashBalances(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอ "เงินสด" ของแอป Dime! ซึ่งมีบัญชีย่อยแยกกัน 3 บัญชี:
1. THB — ป้ายกำกับ "Dime! Save"
2. USD — ป้ายกำกับ "Dime! USD"
3. USD — ป้ายกำกับ "Dime! FCD"
อ่านยอดคงเหลือของแต่ละบัญชีแยกกัน และถ้ามีตัวเลขกำกับด้วย "≈ ... THB" ใต้ยอด USD ให้อ่านค่านั้นมาด้วย (เป็นค่าประมาณเทียบเป็นบาท ใช้คำนวณอัตราแลกเปลี่ยนได้) ถ้าบัญชีไหนไม่ปรากฏในภาพให้ใส่ null ห้ามเดา ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"thbBalance":ตัวเลขหรือnull,"usdBalance":ตัวเลขหรือnull,"usdEquivalentThb":ตัวเลขหรือnull,"fcdBalance":ตัวเลขหรือnull,"fcdEquivalentThb":ตัวเลขหรือnull}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}


async function scanBuyTransaction(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพยืนยันรายการซื้อหุ้นหรือกองทุนจากแอปการลงทุน (เช่น สลิปคำสั่งซื้อ, คำสั่งซื้อกองทุนรวม, DCA, ประวัติรายการ, หรือตารางคำสั่งซื้อขาย)

กรณีที่ 1 — สลิปคำสั่งซื้อ "กองทุนรวม" (มักมี Order ID, "วันที่คำสั่งมีผล", "วันที่คาดว่าได้รับหน่วยลงทุน" เป็นวันถัดไป, ยังไม่มีจำนวนหน่วย): เงินถูกตัดจากบัญชีแล้วทันทีที่ยืนยันคำสั่ง แม้จะยังไม่รู้จำนวนหน่วย/ราคาต่อหน่วย (ต้องรอ NAV ปิดวันถัดไป) — ถือเป็นรายการซื้อที่สมบูรณ์แล้ว ให้ดึง amount (ยอดเงินที่ระบุในสลิป) และ date ให้ครบเสมอ ส่วน shares และ price ถ้ายังไม่ปรากฏในภาพให้ตอบเป็น null (ห้ามตอบ 0)

กรณีที่ 2 — รายการซื้อหุ้นจากตลาดหลักทรัพย์ (ภาพอาจมีหลายรายการ/หลายสัญลักษณ์ปนกัน มีสถานะกำกับแต่ละแถว): ให้เลือกเฉพาะรายการฝั่งซื้อ (Buy/B) ที่ execute สำเร็จแล้วเท่านั้น (เช่น Match, Filled, Completed, สำเร็จ) ห้ามนับรายการที่สถานะยังเป็น Open/Pending/รอดำเนินการ (คือคำสั่ง limit order ที่ยังไม่จับคู่ ไม่ใช่การซื้อที่เกิดขึ้นจริง) ถ้ามีหลายรายการที่ผ่านเงื่อนไข ให้เลือกรายการที่ดูเด่นหรือล่าสุดที่สุด

อ่านข้อมูลแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"symbol": "สัญลักษณ์ย่อของรายการที่เลือก หรือ null ถ้าไม่เห็น", "amount": จำนวนเงินที่จ่ายจริงเป็นตัวเลขไม่มีคอมมา, "shares": จำนวนหน่วยหรือหุ้นที่ได้รับเป็นตัวเลข หรือ null ถ้ายังไม่ทราบ (กองทุนรอ NAV), "price": ราคาต่อหน่วยที่ซื้อได้จริงเป็นตัวเลข หรือ null ถ้ายังไม่ทราบ, "date": วันที่ทำรายการรูปแบบ YYYY-MM-DD}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanSellTransaction(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพยืนยันรายการขายหุ้นหรือกองทุนจากแอปการลงทุน ภาพอาจมีหลายรายการหรือหลายสัญลักษณ์ปนกัน — ให้เลือกเฉพาะรายการฝั่งขาย (Sell/S) ที่มีสถานะสำเร็จแล้วเท่านั้น (เช่น Match, Filled, Completed, สำเร็จ) ห้ามนับรายการที่สถานะยังเป็น Open/Pending/รอดำเนินการ ถ้ามีหลายรายการที่ผ่านเงื่อนไข ให้เลือกรายการที่ดูเด่นหรือล่าสุดที่สุด อ่านข้อมูลแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"symbol": "สัญลักษณ์ย่อของรายการที่เลือก หรือ null ถ้าไม่เห็น", "amount": จำนวนเงินที่ได้รับจริงเป็นตัวเลขไม่มีคอมมา, "shares": จำนวนหน่วยหรือหุ้นที่ขายเป็นตัวเลข, "price": ราคาต่อหน่วยที่ขายได้จริงเป็นตัวเลข, "date": วันที่ทำรายการรูปแบบ YYYY-MM-DD}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

// อ่านรูปประวัติการตัด YieldTech ที่อาจมีหลายกองทุนปนกันในภาพเดียว แยกเป็นรายการต่อกองทุนให้อัตโนมัติ
async function scanYieldTechHistory(file, symbols) {
  const base64 = await readFileAsBase64(file);
  const symbolHint = (symbols && symbols.length > 0) ? `\nชื่อกองทุน/หุ้นที่มีอยู่ในพอร์ต: ${symbols.join(', ')} — จับคู่ชื่อที่อ่านได้กับรายการนี้ให้ใกล้เคียงที่สุด` : '';
  const prompt = `นี่คือภาพเกี่ยวกับการตัด/ขายกองทุนแบบไม่กินทุน (คล้าย YieldTech) จากแอปการลงทุน อาจเป็นได้ 2 แบบ:
1) ตารางประวัติหลายรายการปนกัน — อ่านทุกแถวที่เป็น "ขาย (YIELDTECH)" เท่านั้น (ไม่เอารายการซื้อ/ขายปกติ)
2) หน้าจอ "ยืนยันคำสั่งขาย" รายการเดียว (เช่นจากแอป Dime! ที่ผู้ใช้ขายหน่วยลงทุนด้วยตัวเองเพื่อถอนเงินแบบไม่กินทุน เพราะแพลตฟอร์มนี้ไม่มีฟังก์ชันตัดอัตโนมัติ) — ให้อ่านเป็น 1 รายการ โดยเอามูลค่าเงินที่ขาย (บาท), วันที่คำสั่งมีผล/วันที่ขาย (ถ้าเป็นปี พ.ศ. ให้แปลงเป็น ค.ศ. โดยลบ 543), และชื่อกองทุน/สัญลักษณ์ที่ขาย${symbolHint}
ตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: [{"symbol":"ชื่อกองทุน/หุ้น","amount":จำนวนเงินที่ตัด(ตัวเลขบวกไม่มีคอมมา ไม่ต้องใส่เครื่องหมายลบ),"date":"YYYY-MM-DD"}]`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}
// อ่านรูปประวัติคำสั่งซื้อ-ขาย ที่อาจมีหลายกองทุนปนกันในภาพเดียว แยกซื้อ/ขายแต่ละแถวให้อัตโนมัติ (ไม่เอารายการ YieldTech)
async function scanBuySellHistory(file, symbols) {
  const base64 = await readFileAsBase64(file);
  const symbolHint = (symbols && symbols.length > 0) ? `\nชื่อกองทุน/หุ้นที่มีอยู่ในพอร์ต: ${symbols.join(', ')} — จับคู่ชื่อที่อ่านได้กับรายการนี้ให้ใกล้เคียงที่สุด` : '';
  const prompt = `นี่คือภาพประวัติรายการคำสั่งซื้อ-ขายกองทุน/หุ้น จากแอปการลงทุน อาจมีหลายกองทุนปนกันในภาพเดียว อ่านเฉพาะรายการที่เป็น "ซื้อ" หรือ "ขาย" ปกติเท่านั้น (ไม่เอารายการ YIELDTECH)${symbolHint}
ถ้าภาพมีจำนวนหน่วย/ราคาต่อหน่วยระบุไว้ ให้อ่านมาด้วย ถ้าไม่มีให้เว้นว่าง (null) ห้ามเดา
สำคัญ: ถ้าภาพไม่มีวันที่กำกับไว้ชัดเจนต่อแต่ละแถว (เช่น หน้าจอสรุปที่ไม่ได้แยกวันที่ต่อรายการ) ให้ใส่ "date" เป็น null ห้ามเดาวันที่เอง เพราะจะทำให้ระบบตรวจจับรายการซ้ำทำงานผิดพลาด
ตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: [{"symbol":"ชื่อกองทุน/หุ้น","type":"buy หรือ sell","amount":จำนวนเงินเป็นตัวเลขบวกไม่มีคอมมา,"shares":จำนวนหน่วยถ้ามีระบุไม่งั้นเป็น null,"price":ราคาต่อหน่วยถ้ามีระบุไม่งั้นเป็น null,"date":"YYYY-MM-DD หรือ null ถ้าไม่มีวันที่ต่อแถวชัดเจน"}]`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}
// อ่านกรมธรรม์ประกันจากรูปได้หลายหน้า/หลายรูป — เนื่องจาก askServer ส่งได้ทีละรูป จะสแกนทีละรูปแล้วรวมผลลัพธ์เข้าด้วยกัน
// สำคัญ: แยกผลประโยชน์กรณีเสียชีวิตกับทุนประกันหลักของแต่ละสัญญาออกจากกัน ไม่ใช่ค่าเดียวกันเสมอไป (พบจากกรมธรรม์ตัวอย่างจริง)
// และแยก "จำนวนเงินที่รับรองแน่นอน" ออกจาก "เงินปันผล/ผลตอบแทนที่ไม่รับรอง" (ตัวอย่างประมาณการเท่านั้น) ของกรมธรรม์แบบมีเงินปันผล
async function scanInsurancePolicyPage(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพเอกสารกรมธรรม์ประกัน (อาจเป็นตารางกรมธรรม์ ใบเสร็จ หรือตารางผลประโยชน์) อ่านข้อมูลที่พบในภาพนี้เท่านั้น ห้ามเดาข้อมูลที่ไม่มีในภาพ ถ้าไม่พบให้ใส่ null
ข้อควรระวังสำคัญ:
- "ผลประโยชน์กรณีเสียชีวิต" ของแต่ละสัญญา อาจไม่เท่ากับทุนประกัน/ผลประโยชน์หลักของสัญญานั้น ต้องอ่านแยกจากตารางที่ระบุกรณีเสียชีวิตโดยเฉพาะ ถ้ามี
- ถ้าเป็นกรมธรรม์แบบมีเงินปันผล ให้แยก "จำนวนเงินที่รับรองแน่นอนตามกรมธรรม์" ออกจาก "เงินปันผล/ผลตอบแทนที่ไม่รับรอง" (เป็นแค่ตัวอย่างประมาณการ) — เอาเฉพาะจำนวนที่รับรองแน่นอนมาใส่ในผลประโยชน์
- 1 กรมธรรม์อาจมีทั้งสัญญาหลักและสัญญาเพิ่มเติมหลายรายการปนกัน ให้แยกเป็นรายการละ 1 สัญญา
- หมวดผลประโยชน์ที่เป็น "ตามที่จ่ายจริง" ไม่มีเพดานตายตัว ให้ใส่ notes อธิบายแทนตัวเลข
- เงื่อนไขซับซ้อน (ระยะรอคอย, เงื่อนไขเลือกอย่างใดอย่างหนึ่ง ฯลฯ) ให้สรุปสั้นๆ ใส่ใน notes
- ถ้าภาพเป็นตารางรายการผลประโยชน์แยกย่อย (เช่น หมวดที่ 1 ค่าห้อง, หมวดที่ 2 ค่าแพทย์ ฯลฯ) แม้จะไม่มีชื่อสัญญา/ทุนประกัน/เบี้ยอยู่ในภาพนี้เลยก็ตาม ให้ยังคงส่งกลับเป็น 1 rider (name อาจเป็น null ถ้าไม่มีในภาพ) พร้อมใส่รายการเหล่านั้นลงใน benefitItems ที่อ่านได้ ห้ามทิ้งข้อมูลเพียงเพราะไม่มีชื่อสัญญา/ทุนประกันในภาพนี้
- แต่ละแถวในตารางผลประโยชน์ = 1 รายการใน benefitItems: label คือชื่อรายการ (ตัดเลขหมวดออกได้ ให้สั้นกระชับ ไม่เกิน 6 คำ), value คือจำนวนเงิน/เงื่อนไข (เช่น "6,000 ต่อวัน" หรือ "ตามที่จ่ายจริง"), maxCount คือจำนวนครั้ง/วันสูงสุดถ้ามีระบุ (เช่น "15 วัน") ไม่มีให้ใส่ null
- เอาเฉพาะรายการที่สำคัญที่สุดไม่เกิน 8 รายการต่อสัญญาต่อภาพ (ถ้าตารางมีมากกว่านั้น เลือกเฉพาะรายการที่มีตัวเลขชัดเจน ข้ามรายการรองที่ซ้ำซ้อนกัน) เพื่อให้คำตอบไม่ยาวเกินไป
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น ห้ามมีคำอธิบายก่อน/หลัง JSON ห้ามขึ้นบรรทัดใหม่โดยไม่จำเป็น ตอบให้กระชับที่สุด รูปแบบ:
{"company":"","policyNumber":"","planName":"","insuredName":"","startDate":"YYYY-MM-DD หรือ null","endDate":"YYYY-MM-DD หรือ null","premiumAmount":ตัวเลขหรือnull,"premiumFrequency":"year หรือ month หรือ null","riders":[{"name":"ชื่อสัญญาหลักหรือสัญญาเพิ่มเติม หรือ null ถ้าไม่ปรากฏในภาพนี้","type":"life หรือ health หรือ critical หรือ accident หรือ daily_cash หรือ car หรือ other","sumInsured":ตัวเลขหรือnull,"deathBenefit":ตัวเลขหรือnull,"premiumAmount":ตัวเลขหรือnull,"taxDeductible":"yes หรือ no หรือ partial หรือ null","ipdLimit":ตัวเลขหรือnull,"opdLimit":ตัวเลขหรือnull,"roomLimit":ตัวเลขหรือnull,"doctorLimit":ตัวเลขหรือnull,"icuLimit":ตัวเลขหรือnull,"surgeryLimit":ตัวเลขหรือnull,"erLimit":ตัวเลขหรือnull,"ambulanceLimit":ตัวเลขหรือnull,"cancerLimit":ตัวเลขหรือnull,"dialysisLimit":ตัวเลขหรือnull,"mriCtLimit":ตัวเลขหรือnull,"deductible":ตัวเลขหรือnull,"copaymentPct":ตัวเลขหรือnull,"dailyCashAmount":ตัวเลขหรือnull,"deathAccidentBenefit":ตัวเลขหรือnull,"disabilityBenefit":ตัวเลขหรือnull,"cashBackAmount":ตัวเลขหรือnull,"surrenderValue":ตัวเลขหรือnull,"maturityBenefit":ตัวเลขหรือnull,"coveredDiseases":"ข้อความหรือnull","diagnosisCondition":"ข้อความหรือnull","payoutType":"single หรือ multiple หรือ null","continuesAfterClaim":"yes หรือ no หรือ null","vehiclePlate":"ข้อความหรือnull","insuranceClass":"1 หรือ 2+ หรือ 3+ หรือ 2 หรือ 3 หรือ null","carDeductible":ตัวเลขหรือnull,"theftFireCoverage":"yes หรือ no หรือ null","thirdPartyCoverage":ตัวเลขหรือnull,"compulsoryInsurance":"ข้อความหรือnull","garageType":"center หรือ garage หรือ null","emergencyHotline":"ข้อความหรือnull","notes":"ข้อความสรุปเงื่อนไขสำคัญ หรือ ตามที่จ่ายจริง","benefitItems":[{"label":"ชื่อรายการผลประโยชน์","value":"จำนวนเงิน/เงื่อนไข เช่น 6,000 ต่อวัน","maxCount":"จำนวนสูงสุด เช่น 15 วัน หรือ null"}]}]}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}
function mergeBenefitItems(existing, incoming) {
  const list = [...(existing || [])];
  (incoming || []).forEach((it) => {
    if (!it || (!it.label && !it.value)) return;
    const dup = list.find((x) => x.label && it.label && x.label.trim().toLowerCase() === it.label.trim().toLowerCase());
    if (!dup) list.push({ id: uid(), label: it.label || '', value: it.value || '', maxCount: it.maxCount || '' });
  });
  return list;
}
async function scanInsurancePolicyMultiPhoto(files) {
  const merged = { company: '', policyNumber: '', planName: '', insuredName: '', startDate: '', endDate: '', premiumAmount: 0, premiumFrequency: 'year', riders: [] };
  const errors = [];
  let successCount = 0;
  for (const file of files) {
    try {
      const page = await scanInsurancePolicyPage(file);
      if (!page) { errors.push(`${file.name}: ไม่มีข้อมูลตอบกลับ`); continue; }
      successCount++;
      ['company', 'policyNumber', 'planName', 'insuredName', 'startDate', 'endDate', 'premiumFrequency'].forEach((k) => { if (page[k] && !merged[k]) merged[k] = page[k]; });
      if (page.premiumAmount && !merged.premiumAmount) merged.premiumAmount = page.premiumAmount;
      (page.riders || []).forEach((r) => {
        let existingIdx = -1;
        if (r.name) {
          existingIdx = merged.riders.findIndex((x) => x.name && x.name.trim().toLowerCase() === r.name.trim().toLowerCase());
        } else if (r.type) {
          // หน้าตารางผลประโยชน์แยกย่อยมักไม่มีชื่อสัญญากำกับซ้ำ ให้รวมเข้ากับสัญญาประเภทเดียวกันที่เจอล่าสุด
          for (let i = merged.riders.length - 1; i >= 0; i--) { if (merged.riders[i].type === r.type) { existingIdx = i; break; } }
        }
        if (existingIdx >= 0) {
          const prev = merged.riders[existingIdx];
          const patch = Object.fromEntries(Object.entries(r).filter(([k, v]) => k !== 'benefitItems' && v !== null && v !== undefined && v !== ''));
          merged.riders[existingIdx] = { ...prev, ...patch, benefitItems: mergeBenefitItems(prev.benefitItems, r.benefitItems) };
        } else {
          merged.riders.push({ ...r, benefitItems: mergeBenefitItems([], r.benefitItems) });
        }
      });
    } catch (e) {
      console.error('scanInsurancePolicyPage failed for one photo', e);
      errors.push(`${file.name || 'รูป'}: ${e.message || 'อ่านไม่สำเร็จ'}`);
    }
  }
  if (successCount === 0 && errors.length > 0) throw new Error(errors.join(' | '));
  merged._partialErrors = errors; // เก็บไว้เผื่อบางรูปอ่านไม่ผ่านแต่บางรูปผ่าน จะได้เตือนได้โดยไม่บล็อกทั้งหมด
  return merged;
}

async function fetchInvestmentNews(symbols) {
  const symbolLine = symbols.length > 0 ? symbols.join(', ') : '(ไม่มีข้อมูลสินทรัพย์ที่ถือ)';
  const prompt = `คุณคือนักวิเคราะห์การลงทุน ค้นข่าวการลงทุนล่าสุด (ภายใน 3-5 วันที่ผ่านมา) ที่สำคัญที่สุดสำหรับพอร์ตนี้ ใช้เครื่องมือค้นเว็บจริง ห้ามตอบจากความจำเก่า
สินทรัพย์ที่ถืออยู่: ${symbolLine}
ให้ค้นข่าวที่เกี่ยวข้องกับสินทรัพย์เหล่านี้โดยตรง (เช่น ผลประกอบการ ข่าวใหญ่ของบริษัท) และข่าวเศรษฐกิจมหภาคสำคัญที่กระทบพอร์ตการลงทุน (ดอกเบี้ยนโยบาย Fed, อัตราเงินเฟ้อสหรัฐ, อัตราการว่างงาน, ค่าเงิน USD/THB)
เลือกเฉพาะข่าวใหญ่ที่สำคัญจริงๆ ไม่เกิน 6 ข่าว เรียงตามความสำคัญจากมากไปน้อย ห้ามใส่ข่าวซ้ำหรือข่าวเล็กน้อย
ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นก่อน/หลัง รูปแบบ:
{"items":[{"headline":"หัวข้อข่าวสั้นๆ ภาษาไทย ไม่เกิน 15 คำ","summary":"สรุปใจความสำคัญ 1 บรรทัด ภาษาไทย ไม่เกิน 30 คำ","relatedSymbol":"สัญลักษณ์สินทรัพย์ที่เกี่ยวข้อง หรือ null ถ้าเป็นข่าวมหภาคทั่วไป","tone":"positive หรือ negative หรือ neutral","date":"YYYY-MM-DD หรือ null"}]}`;
  const text = await askServer(prompt, null, null, true);
  const parsed = safeParseJson(text);
  return (parsed && parsed.items) || [];
}

async function scanReceiptItems(file, cardNames) {
  const base64 = await readFileAsBase64(file);
  const cardHint = (cardNames && cardNames.length > 0) ? `\nถ้าภาพนี้เป็นสลิปรูดบัตรเครดิต/สลิปยืนยันการชำระ ลองดูว่ามีชื่อธนาคาร/บัตรตรงหรือใกล้เคียงกับรายชื่อนี้ไหม: ${cardNames.join(', ')} — ถ้ามีให้ระบุกลับมาด้วย ถ้าไม่มี/ไม่แน่ใจให้ตอบค่าว่าง` : '';
  const prompt = `นี่คือภาพใบเสร็จรับเงินหรือสลิปการชำระเงิน อ่านรายการสินค้า/บริการทั้งหมดพร้อมราคา ถ้าอ่านราคารวมทั้งบิลได้แต่แยกรายการไม่ได้ ให้ส่งเป็นรายการเดียวชื่อ "รวมบิล"${cardHint}
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"items": [{"item":"ชื่อรายการ","amount":ราคาเป็นตัวเลขไม่มีคอมมา}], "cardName": "ชื่อธนาคาร/บัตรที่ใช้จ่ายถ้าระบุในภาพ ไม่งั้นค่าว่าง"}`;
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

// ฟีเจอร์ UU: ถ่ายรูปฉลาก/ซองยา ให้ AI อ่านและกรอกฟอร์มให้ (รองรับทั้งใบสั่งยาโรงพยาบาลใหญ่และฉลากคลินิกเล็ก)
async function scanMedicationLabel(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพฉลากยา/ซองยา/ใบสั่งยาสำหรับสัตว์เลี้ยง ความละเอียดของภาพอาจแตกต่างกันมาก (โรงพยาบาลใหญ่มักพิมพ์ครบทุกอย่าง ส่วนคลินิกเล็กอาจมีแค่บางส่วนหรือเขียนมือ) อ่านเท่าที่มีในภาพจริงเท่านั้น ฟิลด์ไหนไม่มีข้อมูลในภาพหรืออ่านไม่ออกให้ตอบเป็นค่าว่าง "" ห้ามเดามั่ว ไม่ต้องอ่านราคา (ไม่มีในฉลากยาแน่นอน)
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ:
{"name": "ชื่อยา", "strength": "ความแรง/ขนาด เช่น 10mg", "dose": "จำนวนที่ได้รับ เช่น 7 เม็ด", "usage": "วิธีใช้/ปริมาณต่อครั้ง เช่น 1/4 แคปซูล", "timing": "ความถี่/เวลาที่ให้ เช่น วันละ 2 เวลา เช้า-เย็น พร้อมอาหาร", "hospital": "ชื่อโรงพยาบาล/คลินิก", "doctor": "ชื่อสัตวแพทย์ผู้สั่ง", "startDate": "YYYY-MM-DD ถ้ามีวันที่ระบุ", "note": "หมายเหตุอื่นๆที่สำคัญ เช่น สรรพคุณยา หรือคำเตือนพิเศษ"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

// ฟีเจอร์ TT: ถ่ายรูปใบนัดหมาย ให้ AI อ่านและกรอกฟอร์มให้
async function scanAppointmentSlip(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพใบนัดหมายสัตวแพทย์สำหรับสัตว์เลี้ยง ความละเอียดอาจแตกต่างกัน (บางที่พิมพ์ครบ บางที่เขียนมือสั้นๆ) อ่านเท่าที่มีในภาพจริงเท่านั้น ฟิลด์ไหนไม่มี/อ่านไม่ออกให้ตอบค่าว่าง "" ห้ามเดามั่ว
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ:
{"date": "YYYY-MM-DD วันนัด", "time": "HH:MM เวลานัด ถ้ามี", "hospital": "ชื่อโรงพยาบาล/คลินิก", "doctor": "ชื่อสัตวแพทย์", "purpose": "วัตถุประสงค์การนัด เช่น ฉีดวัคซีน, ตรวจติดตามอาการ", "note": "รายละเอียด/คำแนะนำอื่นๆที่ระบุในใบนัด"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

// ถ่ายรูปผลตรวจเลือด/อวัยวะ/Imaging ให้ AI อ่านและกรอกฟอร์มให้ (ใช้ร่วมกันได้ทั้ง 3 หมวดในเวชระเบียน)
async function scanMedicalResult(file, kind) {
  const base64 = await readFileAsBase64(file);
  const kindLabel = kind === 'bloodTest' ? 'ผลตรวจเลือด' : kind === 'organExam' ? 'ผลตรวจอวัยวะ (อัลตราซาวด์/คลำ/ตรวจร่างกาย)' : 'ผล Imaging (X-ray/CT/MRI/Ultrasound)';
  const optionsHint = kind === 'bloodTest' ? `ประเภทตรวจที่ใกล้เคียงจากรายการนี้ถ้ามี: ${BLOOD_TEST_TYPES.join(', ')}` : kind === 'organExam' ? `อวัยวะที่ใกล้เคียงจากรายการนี้ถ้ามี: ${ORGAN_TYPES.join(', ')}` : `ประเภทที่ใกล้เคียงจากรายการนี้ถ้ามี: ${IMAGING_TYPES.join(', ')}`;
  const prompt = `นี่คือภาพ${kindLabel}ของสัตว์เลี้ยง ความละเอียดอาจแตกต่างกันมาก อ่านเท่าที่มีในภาพจริงเท่านั้น ห้ามเดามั่ว ${optionsHint}
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"type": "ประเภท/อวัยวะที่ตรวจ ใกล้เคียงจากรายการที่ให้ไว้ หรือค่าว่างถ้าไม่แน่ใจ", "date": "YYYY-MM-DD ถ้ามีวันที่ระบุในภาพ ไม่งั้นค่าว่าง", "note": "สรุปผลตรวจ/ค่าที่ได้/ลักษณะที่พบสั้นๆ"}`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}


async function parseExpenseText(transcript, categories, cardNames) {
  const cardHint = (cardNames && cardNames.length > 0) ? `\nรายชื่อบัตรเครดิตที่ผู้ใช้มี: ${cardNames.join(', ')} — ถ้าคำพูดมีการเอ่ยถึงชื่อบัตร/ธนาคารที่ตรงหรือใกล้เคียงกับรายชื่อนี้ ให้ระบุกลับมาด้วย` : '';
  const prompt = `ผู้ใช้พูดบันทึกรายจ่ายเป็นภาษาไทยว่า: "${transcript}"
หมวดหมู่ที่มีอยู่แล้ว: ${categories.join(', ')}${cardHint}
อ่านแล้วตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่น รูปแบบ: {"amount": จำนวนเงินเป็นตัวเลข, "category": "เลือกหมวดที่ใกล้เคียงที่สุดจากรายการที่มี หรือถ้าไม่เข้าเลยให้ตอบ อื่นๆ", "note": "รายละเอียดสั้นๆ เช่น ชื่อของที่ซื้อ", "cardName": "ชื่อบัตร/ธนาคารที่พูดถึงถ้ามี ไม่งั้นตอบค่าว่าง"}`;
  const text = await askServer(prompt);
  return safeParseJson(text);
}


async function scanPortfolioTable(file) {
  const base64 = await readFileAsBase64(file);
  const prompt = `นี่คือภาพหน้าจอแอปการลงทุนที่แสดงรายการสินทรัพย์หลายตัว (อาจเป็นตารางหุ้นไทยแบบมีคอลัมน์ Avail Vol/Avg/Market หรือเป็นรายการแบบ Dime! ที่โชว์มูลค่ารวมกับราคาต่อหน่วยและ % เปลี่ยนแปลง) อ่านทุกแถวที่เห็น แล้วตอบกลับเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น สำหรับแต่ละแถวใส่ข้อมูลเท่าที่เห็นจริงในภาพ ถ้าไม่เห็นให้ใส่ null รูปแบบ: [{"symbol":"สัญลักษณ์ย่อ","currency":"THB หรือ USD","shares":จำนวนหน่วยถ้าเห็นตรงๆมิฉะนั้น null,"avgCost":ต้นทุนเฉลี่ยต่อหน่วยถ้าเห็นมิฉะนั้น null,"currentPrice":ราคาต่อหน่วยปัจจุบันถ้าเห็นมิฉะนั้น null,"value":มูลค่ารวมของแถวนี้ถ้าเห็นมิฉะนั้น null}]`;
  const text = await askServer(prompt, base64, file.type || 'image/jpeg');
  return safeParseJson(text);
}

async function scanHoldingDetail(file) {
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

function AccountsTab({ accounts, onUpdate, onAdd, onRemove, costBasisByAccount, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, finnhubKey, onSellHolding, onRemoveSell, onRemoveBuy, onUpdateSell, onUpdateBuy, onAddContribution, onRecordYieldTech, onRecordYieldTechBatch, onRecordBuySellBatch }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [targets, setTargets] = useState({});
  const [newCats, setNewCats] = useState({});
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('accounts'); // 'accounts' | 'allbuys'
  const [editingAllBuy, setEditingAllBuy] = useState(null); // { accountId, holdingId, ...buy }
  const [buyMonthPopup, setBuyMonthPopup] = useState(null); // month string
  const allBuys = useMemo(() => {
    const rows = [];
    accounts.forEach((a) => {
      (a.holdings || []).forEach((h) => {
        (h.buys || []).forEach((b) => {
          rows.push({ ...b, accountId: a.id, accountName: a.name, holdingId: h.id, holdingLabel: h.symbol || h.name || '(ยังไม่ตั้งชื่อ)', currency: h.currency });
        });
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [accounts]);
  const buyMonthGroups = useMemo(() => {
    const ym = thisMonth();
    const older = allBuys.filter((b) => !(b.date || '').startsWith(ym));
    const map = {};
    older.forEach((b) => {
      const month = (b.date || '').slice(0, 7);
      if (!map[month]) map[month] = { month, rows: [], total: 0 };
      map[month].rows.push(b);
      map[month].total += Number(b.amount || 0);
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [allBuys]);
  const thisMonthBuys = useMemo(() => { const ym = thisMonth(); return allBuys.filter((b) => (b.date || '').startsWith(ym)); }, [allBuys]);
  const [editingAllSell, setEditingAllSell] = useState(null);
  const [sellMonthPopup, setSellMonthPopup] = useState(null);
  const allSells = useMemo(() => {
    const rows = [];
    accounts.forEach((a) => {
      (a.holdings || []).forEach((h) => {
        (h.sells || []).forEach((s) => {
          rows.push({ ...s, accountId: a.id, accountName: a.name, holdingId: h.id, holdingLabel: h.symbol || h.name || '(ยังไม่ตั้งชื่อ)', currency: h.currency });
        });
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [accounts]);
  const sellMonthGroups = useMemo(() => {
    const ym = thisMonth();
    const older = allSells.filter((s) => !(s.date || '').startsWith(ym));
    const map = {};
    older.forEach((s) => {
      const month = (s.date || '').slice(0, 7);
      if (!map[month]) map[month] = { month, rows: [], total: 0 };
      map[month].rows.push(s);
      map[month].total += Number(s.amount || 0);
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [allSells]);
  const thisMonthSells = useMemo(() => { const ym = thisMonth(); return allSells.filter((s) => (s.date || '').startsWith(ym)); }, [allSells]);
  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (a) => {
    if (!searchLower) return true;
    if ((a.name || '').toLowerCase().includes(searchLower)) return true;
    return (a.holdings || []).some((h) => (h.symbol || '').toLowerCase().includes(searchLower) || (h.name || '').toLowerCase().includes(searchLower));
  };
  const grouped = useMemo(() => { const map = {}; accounts.forEach((a) => { (map[a.category] = map[a.category] || []).push(a); }); return map; }, [accounts]);
  const [refreshingCat, setRefreshingCat] = useState(null);
  async function refreshCategoryAll(key) {
    setRefreshingCat(key);
    const catAccounts = grouped[key] || [];
    for (const a of catAccounts) {
      for (const h of (a.holdings || [])) {
        if (h.symbol) { try { await onRefreshPrice(a.id, h.id, h.symbol, h.currency); } catch (e) { /* ข้ามตัวที่ error ไปทำตัวถัดไป */ } }
      }
    }
    setRefreshingCat(null);
  }

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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาบัญชีหรือสัญลักษณ์หุ้น..." style={{ border: '1px solid #E7EAF0' }} className="rounded-lg pl-9 pr-3 py-2.5 text-sm w-full" />
      </div>
      <div className="flex gap-2 mb-4 p-1 rounded-lg" style={{ background: PAPER_DIM }}>
        <button onClick={() => setViewMode('accounts')} className="flex-1 text-xs rounded-md py-2 font-semibold" style={viewMode === 'accounts' ? { background: 'white', color: INK } : { color: SLATE }}>ตามบัญชี</button>
        <button onClick={() => setViewMode('allbuys')} className="flex-1 text-xs rounded-md py-2 font-semibold" style={viewMode === 'allbuys' ? { background: 'white', color: INK } : { color: SLATE }}>ซื้อทั้งหมด ({allBuys.length})</button>
        <button onClick={() => setViewMode('allsells')} className="flex-1 text-xs rounded-md py-2 font-semibold" style={viewMode === 'allsells' ? { background: 'white', color: INK } : { color: SLATE }}>ขายทั้งหมด ({allSells.length})</button>
      </div>
      {viewMode === 'allsells' ? (
        <div>
          {allSells.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีประวัติการขาย</p>}
          {thisMonthSells.length > 0 && <p className="text-xs mb-2" style={{ color: SLATE }}>เดือนนี้</p>}
          {thisMonthSells.map((s) => (
            <Card key={`${s.holdingId}__${s.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{s.holdingLabel} <span className="text-xs font-normal" style={{ color: SLATE }}>· {s.accountName}</span></p>
                  <p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(s.date)} · {Number(s.shares || 0).toLocaleString()} หุ้น @ {Number(s.price || 0)}{s.currency === 'USD' ? ' USD' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: s.gain >= 0 ? GOOD : BAD }}>฿{fmt(s.amount)}</span>
                  <EditButton onClick={() => setEditingAllSell(s)} />
                  <button onClick={() => onRemoveSell(s.accountId, s.holdingId, s.id)}><Trash2 size={14} color={BAD} /></button>
                </div>
              </div>
            </Card>
          ))}
          {sellMonthGroups.length > 0 && (
            <>
              <p className="text-xs mb-2 mt-4" style={{ color: SLATE }}>เดือนก่อนๆ (แตะเพื่อดูรายเดือน)</p>
              {sellMonthGroups.map((mg) => (
                <button key={mg.month} onClick={() => setSellMonthPopup(mg.month)} className="w-full text-left" style={{ display: 'block' }}>
                  <Card style={{ background: PAPER_DIM, borderLeft: `3px solid ${SLATE}` }}>
                    <div className="flex justify-between items-center">
                      <div><p className="text-sm" style={{ color: SLATE }}>🗂️ {mg.month}</p><p className="text-xs" style={{ color: SLATE }}>{mg.rows.length} รายการ</p></div>
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold" style={{ color: SLATE }}>฿{fmt(mg.total)}</span><ChevronRight size={15} color={SLATE} /></div>
                    </div>
                  </Card>
                </button>
              ))}
            </>
          )}
          {sellMonthPopup && (
            <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
              <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">เดือน {sellMonthPopup}</p><button onClick={() => setSellMonthPopup(null)}><X size={20} color={INK} /></button></div>
                {(sellMonthGroups.find((mg) => mg.month === sellMonthPopup)?.rows || []).map((s) => (
                  <Card key={`${s.holdingId}__${s.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold">{s.holdingLabel} <span className="text-xs font-normal" style={{ color: SLATE }}>· {s.accountName}</span></p>
                        <p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(s.date)} · {Number(s.shares || 0).toLocaleString()} หุ้น @ {Number(s.price || 0)}{s.currency === 'USD' ? ' USD' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: s.gain >= 0 ? GOOD : BAD }}>฿{fmt(s.amount)}</span>
                        <EditButton onClick={() => setEditingAllSell(s)} />
                        <button onClick={() => onRemoveSell(s.accountId, s.holdingId, s.id)}><Trash2 size={14} color={BAD} /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {editingAllSell && (
            <EditModal title={`แก้ไขรายการขาย · ${editingAllSell.holdingLabel}`} onClose={() => setEditingAllSell(null)}
              initialValues={{ date: editingAllSell.date, shares: editingAllSell.shares, price: editingAllSell.price, amount: editingAllSell.amount }}
              fields={[
                { key: 'date', label: 'วันที่', type: 'date' },
                { key: 'shares', label: 'จำนวนหุ้น', type: 'number' },
                { key: 'price', label: `ราคา/หุ้น (${editingAllSell.currency || 'บาท'})`, type: 'number' },
                { key: 'amount', label: 'ได้รับจริง (บาท)', type: 'number' },
              ]}
              onSave={(v) => {
                onUpdateSell(editingAllSell.accountId, editingAllSell.holdingId, editingAllSell.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0 });
                setEditingAllSell(null);
              }}
            />
          )}
        </div>
      ) : viewMode === 'allbuys' ? (
        <div>
          {allBuys.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีประวัติการซื้อ</p>}
          {thisMonthBuys.length > 0 && <p className="text-xs mb-2" style={{ color: SLATE }}>เดือนนี้</p>}
          {thisMonthBuys.map((b) => (
            <Card key={`${b.holdingId}__${b.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{b.holdingLabel} <span className="text-xs font-normal" style={{ color: SLATE }}>· {b.accountName}</span></p>
                  <p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(b.date)} · {Number(b.shares || 0).toLocaleString()} หุ้น @ {Number(b.price || 0)}{b.currency === 'USD' ? ' USD' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: BAD }}>฿{fmt(b.amount)}</span>
                  <EditButton onClick={() => setEditingAllBuy(b)} />
                  <button onClick={() => onRemoveBuy(b.accountId, b.holdingId, b.id)}><Trash2 size={14} color={BAD} /></button>
                </div>
              </div>
            </Card>
          ))}
          {buyMonthGroups.length > 0 && (
            <>
              <p className="text-xs mb-2 mt-4" style={{ color: SLATE }}>เดือนก่อนๆ (แตะเพื่อดูรายเดือน)</p>
              {buyMonthGroups.map((mg) => (
                <button key={mg.month} onClick={() => setBuyMonthPopup(mg.month)} className="w-full text-left" style={{ display: 'block' }}>
                  <Card style={{ background: PAPER_DIM, borderLeft: `3px solid ${SLATE}` }}>
                    <div className="flex justify-between items-center">
                      <div><p className="text-sm" style={{ color: SLATE }}>🗂️ {mg.month}</p><p className="text-xs" style={{ color: SLATE }}>{mg.rows.length} รายการ</p></div>
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold" style={{ color: SLATE }}>฿{fmt(mg.total)}</span><ChevronRight size={15} color={SLATE} /></div>
                    </div>
                  </Card>
                </button>
              ))}
            </>
          )}
          {buyMonthPopup && (
            <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
              <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">เดือน {buyMonthPopup}</p><button onClick={() => setBuyMonthPopup(null)}><X size={20} color={INK} /></button></div>
                {(buyMonthGroups.find((mg) => mg.month === buyMonthPopup)?.rows || []).map((b) => (
                  <Card key={`${b.holdingId}__${b.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold">{b.holdingLabel} <span className="text-xs font-normal" style={{ color: SLATE }}>· {b.accountName}</span></p>
                        <p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(b.date)} · {Number(b.shares || 0).toLocaleString()} หุ้น @ {Number(b.price || 0)}{b.currency === 'USD' ? ' USD' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: BAD }}>฿{fmt(b.amount)}</span>
                        <EditButton onClick={() => setEditingAllBuy(b)} />
                        <button onClick={() => onRemoveBuy(b.accountId, b.holdingId, b.id)}><Trash2 size={14} color={BAD} /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {editingAllBuy && (
            <EditModal title={`แก้ไขรายการซื้อ · ${editingAllBuy.holdingLabel}`} onClose={() => setEditingAllBuy(null)}
              initialValues={{ date: editingAllBuy.date, shares: editingAllBuy.shares, price: editingAllBuy.price, amount: editingAllBuy.amount }}
              fields={[
                { key: 'date', label: 'วันที่', type: 'date' },
                { key: 'shares', label: 'จำนวนหุ้น', type: 'number' },
                { key: 'price', label: `ราคา/หุ้น (${editingAllBuy.currency || 'บาท'})`, type: 'number' },
                { key: 'amount', label: 'จ่ายจริง (บาท)', type: 'number' },
              ]}
              onSave={(v) => {
                onUpdateBuy(editingAllBuy.accountId, editingAllBuy.holdingId, editingAllBuy.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0 });
                setEditingAllBuy(null);
              }}
            />
          )}
        </div>
      ) : (
      <>
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
                <select value={targets[idx] || ''} onChange={(e) => setTargets({ ...targets, [idx]: e.target.value })} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-2 py-1.5 text-xs w-full mb-1">
                  <option value="">— เลือกบัญชีปลายทาง —</option>
                  {Object.entries(CATEGORY_META).map(([catKey, catMeta]) => (
                    <optgroup key={catKey} label={catMeta.label}>

                      {accounts.filter((a) => a.category === catKey).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </optgroup>
                  ))}
                  <option value="__new__">+ สร้างบัญชีใหม่</option>
                </select>
                {targets[idx] === '__new__' && (
                  <select value={newCats[idx] || 'other'} onChange={(e) => setNewCats({ ...newCats, [idx]: e.target.value })} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-2 py-1.5 text-xs w-full">
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
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
            <div className="flex items-center gap-3">
              {HOLDING_CATEGORIES.includes(key) && catAccounts.length > 0 && (
                <button onClick={() => refreshCategoryAll(key)} disabled={refreshingCat === key} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}>
                  {refreshingCat === key ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {refreshingCat === key ? 'กำลังรีเฟรช...' : 'รีเฟรชทั้งหมวด'}
                </button>
              )}
              <button onClick={() => onAdd(key)} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={14} /> เพิ่มบัญชี</button>
            </div>
          </div>
          {catAccounts.map((a) => (
            HOLDING_CATEGORIES.includes(key)
              ? <StockAccountCard key={a.id} account={a} onUpdate={onUpdate} onRemove={onRemove} onAddHolding={onAddHolding} onUpdateHolding={onUpdateHolding} onRemoveHolding={onRemoveHolding} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onUpdateDividend={onUpdateDividend} onRefreshPrice={onRefreshPrice} finnhubKey={finnhubKey} categoryColor={meta.color} onScanValue={scanSingleValue} allAccounts={accounts} onSellHolding={onSellHolding} onRemoveSell={onRemoveSell} onRemoveBuy={onRemoveBuy} onUpdateSell={onUpdateSell} onUpdateBuy={onUpdateBuy} onAddContribution={onAddContribution} onRecordYieldTech={onRecordYieldTech} onRecordYieldTechBatch={onRecordYieldTechBatch} onRecordBuySellBatch={onRecordBuySellBatch} />
              : <SimpleAccountCard key={a.id} account={a} basis={costBasisByAccount[a.id] || 0} onUpdate={onUpdate} onRemove={onRemove} onScanValue={scanSingleValue} />
          ))}
          {(!grouped[key] || grouped[key].length === 0) && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบัญชีในหมวดนี้</p>}
        </div>
        );
      })}
      </>
      )}
    </div>
  );
          }function ScanValueButton({ onScanValue, onApply, defaultFx }) {
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
              <NumInput value={fxRate} onChange={setFxRate} className="text-xs rounded px-2 py-1 w-20" style={{ border: '1px solid #E7EAF0' }} />
              <span className="text-xs" style={{ color: SLATE }}>บาท → ฿{fmt(thbValue)}</span>
            </div>
          </>
        ) : (
          <p className="text-xs mb-2" style={{ color: SLATE }}>พบมูลค่า <span className="font-semibold" style={{ color: INK }}>฿{fmt(thbValue)}</span> — ยืนยันเพื่ออัพเดทบัญชีนี้?</p>
        )}
        <div className="flex gap-2">
          <button onClick={() => { onApply(thbValue); setPendingValue(null); }} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยัน</button>
          <button onClick={() => setPendingValue(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
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

// สแกนเงินสด — ต่างจาก ScanValueButton ตรงที่ "ไม่แปลงเป็นบาททันที" เพราะเงินสดของบัญชี USD เก็บเป็นสกุลเดิม + อัตราแลกเปลี่ยนแยก
// (ให้สอดคล้องกับวิธีเก็บ currentPrice/currentFx ของหุ้นรายตัว) ถ้าใช้ ScanValueButton ตัวเดิมจะเกิดการคูณ FX ซ้ำซ้อนสำหรับบัญชี USD
function CashBalanceScanButton({ onApply, expectedCurrency }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [pendingValue, setPendingValue] = useState(null); // { value, currency }
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanning(true); setError(''); setPendingValue(null);
    try {
      const result = await scanCashBalance(file);
      if (result.value === null || result.value === undefined) setError('ไม่พบช่อง "Cash Balance" ในภาพนี้ ลองภาพที่เห็นช่องนี้ชัดกว่านี้');
      else setPendingValue(result);
    } catch (e) { setError('เกิดข้อผิดพลาด: ' + e.message); }
    finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  if (pendingValue !== null) {
    const mismatch = expectedCurrency && pendingValue.currency !== expectedCurrency;
    return (
      <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
        <p className="text-xs mb-2" style={{ color: SLATE }}>พบ{pendingValue.source === 'line_available' ? ' Line Available' : ' Cash Balance'} = <span className="font-semibold" style={{ color: INK }}>{pendingValue.value.toLocaleString()} {pendingValue.currency}</span>{mismatch ? ` — ⚠️ คาดว่าบัญชีนี้เป็น ${expectedCurrency} เช็คให้ดีก่อนยืนยัน` : ''}</p>
        <div className="flex gap-2">
          <button onClick={() => { onApply(pendingValue.value); setPendingValue(null); }} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยัน</button>
          <button onClick={() => setPendingValue(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-1">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
        {scanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {scanning ? 'กำลังอ่านภาพ...' : 'ถ่ายภาพอ่านเฉพาะ Cash Balance'}
      </button>
      {error && <p className="text-[10px] mt-1" style={{ color: BAD }}>{error}</p>}
    </div>
  );
}

// สแกนหน้าจอ "เงินสด" ของแอป Dime! ที่มี 3 บัญชีย่อยปนกันในภาพเดียว (THB/USD/FCD) แยกให้อัตโนมัติในครั้งเดียว
function DimeCashScanButton({ onApply }) {
  const fileRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanning(true); setError(''); setPendingValue(null);
    try {
      const parsed = await scanDimeCashBalances(file);
      if (parsed.thbBalance === null && parsed.usdBalance === null && parsed.fcdBalance === null) {
        setError('อ่านไม่พบยอดคงเหลือทั้ง 3 บัญชี ลองภาพที่ชัดกว่านี้');
      } else {
        let fx = null;
        if (parsed.usdBalance && parsed.usdEquivalentThb) fx = parsed.usdEquivalentThb / parsed.usdBalance;
        else if (parsed.fcdBalance && parsed.fcdEquivalentThb) fx = parsed.fcdEquivalentThb / parsed.fcdBalance;
        setPendingValue({ thb: parsed.thbBalance, usd: parsed.usdBalance, fcd: parsed.fcdBalance, fx });
      }
    } catch (e) { setError('เกิดข้อผิดพลาด: ' + e.message); }
    finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  if (pendingValue !== null) {
    return (
      <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
        <p className="text-xs mb-1" style={{ color: SLATE }}>พบยอดคงเหลือ:</p>
        {pendingValue.thb !== null && <p className="text-[11px] mb-0.5" style={{ color: INK }}>฿ Dime! Save: {pendingValue.thb.toLocaleString()} THB</p>}
        {pendingValue.usd !== null && <p className="text-[11px] mb-0.5" style={{ color: INK }}>$ Dime! USD: {pendingValue.usd.toLocaleString()} USD</p>}
        {pendingValue.fcd !== null && <p className="text-[11px] mb-0.5" style={{ color: INK }}>$ Dime! FCD: {pendingValue.fcd.toLocaleString()} USD</p>}
        {pendingValue.fx && <p className="text-[11px] mb-1" style={{ color: SLATE }}>FX ที่คำนวณได้: ≈ {pendingValue.fx.toFixed(2)}</p>}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => {
              const patch = {};
              if (pendingValue.thb !== null) patch.cashBalanceTHB = pendingValue.thb;
              if (pendingValue.usd !== null) patch.cashBalanceUSD = pendingValue.usd;
              if (pendingValue.fcd !== null) patch.cashBalanceFCD = pendingValue.fcd;
              if (pendingValue.fx) patch.cashBalanceFx = pendingValue.fx;
              onApply(patch);
              setPendingValue(null);
            }}
            style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1"
          >ยืนยัน</button>
          <button onClick={() => setPendingValue(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-1">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
        {scanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {scanning ? 'กำลังอ่านภาพ...' : 'ถ่ายภาพหน้า "เงินสด" (อ่านครบ 3 บัญชีให้อัตโนมัติ)'}
      </button>
      {error && <p className="text-[10px] mt-1" style={{ color: BAD }}>{error}</p>}
    </div>
  );
}

function SimpleAccountCard({ account: a, basis, onUpdate, onRemove, onScanValue }) {
  const gain = a.value - basis;
  const showInterest = INTEREST_CATEGORIES.includes(a.category);
  const isCooperative = a.category === 'cooperative';
  const [showInterestHistory, setShowInterestHistory] = useState(false);
  const [interestAmount, setInterestAmount] = useState(0);
  const [interestDate, setInterestDate] = useState(new Date().toISOString().slice(0, 10));
  const [txAmount, setTxAmount] = useState(0);
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [showTxHistory, setShowTxHistory] = useState(false);
  const estimatedAnnualInterest = showInterest ? Number(a.value || 0) * Number(a.interestRate || 0) / 100 : 0;
  function recordInterest() {
    if (!interestAmount) return;
    const history = a.interestHistory || [];
    onUpdate(a.id, { interestHistory: [{ id: uid(), date: interestDate, amount: interestAmount }, ...history] });
    setInterestAmount(0);
  }
  function recordDeposit() {
    if (!txAmount) return;
    const history = a.cashFlowHistory || [];
    onUpdate(a.id, { value: Number(a.value || 0) + Number(txAmount), cashFlowHistory: [{ id: uid(), type: 'deposit', date: txDate, amount: txAmount }, ...history] });
    sendLineFlex(`ฝากเงินเข้า ${a.name} ฿${fmt(txAmount)}`, buildFlexCard({ title: `💰 ฝากเงินเข้า ${a.name}`, rows: [{ label: 'วันที่', value: formatDateDMY(txDate) }], amount: Number(txAmount), amountColor: GOOD, tab: 'accounts' }));
    setTxAmount(0);
  }
  function recordWithdraw() {
    if (!txAmount) return;
    const history = a.cashFlowHistory || [];
    onUpdate(a.id, { value: Math.max(0, Number(a.value || 0) - Number(txAmount)), cashFlowHistory: [{ id: uid(), type: 'withdraw', date: txDate, amount: txAmount }, ...history] });
    sendLineFlex(`ถอนเงินจาก ${a.name} ฿${fmt(txAmount)}`, buildFlexCard({ title: `💸 ถอนเงินจาก ${a.name}`, rows: [{ label: 'วันที่', value: formatDateDMY(txDate) }], amount: Number(txAmount), amountColor: BAD, tab: 'accounts' }));
    setTxAmount(0);
  }
  return (
    <Card>
      <div className="flex justify-between items-center gap-2"><input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none" style={{ border: 'none' }} />{a._shared && <span style={{ background: '#7C3AED14', color: '#7C3AED', flexShrink: 0 }} className="text-[10px] font-medium px-2 py-1 rounded-full">🔗 ภรรยา</span>}<button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button></div>
      <div className="flex items-center mt-2 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-lg font-semibold flex-1 outline-none" style={{ border: 'none' }} /></div>
      {basis > 0 && <p className="text-xs mb-2" style={{ color: gain >= 0 ? GOOD : BAD }}>ต้นทุนสะสม ฿{fmt(basis)} · {gain >= 0 ? '+' : ''}฿{fmt(gain)}</p>}
      {onScanValue && <ScanValueButton onScanValue={onScanValue} onApply={(v) => onUpdate(a.id, { value: v })} />}
      {isCooperative && (
        <div style={{ borderTop: '1px solid #E7EAF0', background: PAPER_DIM, borderRadius: 10 }} className="mt-3 pt-3 px-2 pb-2">
          <p className="text-[10px] mb-1" style={{ color: SLATE }}>💰 ฝาก-ถอนเงิน</p>
          <div className="flex gap-2 mb-2">
            <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="text-xs rounded px-2 py-1.5 flex-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
            <NumInput value={txAmount} onChange={setTxAmount} placeholder="จำนวนเงิน" className="text-xs rounded px-2 py-1.5 flex-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
          </div>
          <div className="flex gap-2 mb-1">
            <button onClick={recordDeposit} style={{ background: GOOD }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ฝากเงิน</button>
            <button onClick={recordWithdraw} style={{ background: BAD }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ถอนเงิน</button>
          </div>
          {(a.cashFlowHistory || []).length > 0 && (
            <button onClick={() => setShowTxHistory(!showTxHistory)} className="text-[11px]" style={{ color: BRASS }}>{showTxHistory ? 'ซ่อนประวัติ' : `ดูประวัติฝาก-ถอน (${(a.cashFlowHistory || []).length})`}</button>
          )}
          {showTxHistory && (a.cashFlowHistory || []).map((h) => (
            <div key={h.id} className="flex justify-between text-xs mt-1"><span>{h.date} · {h.type === 'deposit' ? 'ฝาก' : 'ถอน'}</span><span style={{ color: h.type === 'deposit' ? GOOD : BAD }}>{h.type === 'deposit' ? '+' : '-'}฿{fmt(h.amount)}</span></div>
          ))}
        </div>
      )}
      {showInterest && (
        <div style={{ borderTop: '1px solid #E7EAF0' }} className="mt-3 pt-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>ดอกเบี้ยต่อปี (%)</label><NumInput value={a.interestRate} onChange={(v) => onUpdate(a.id, { interestRate: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่จ่ายดอกเบี้ย</label><input value={a.interestPayDate || ''} onChange={(e) => onUpdate(a.id, { interestPayDate: e.target.value })} placeholder="เช่น 31 ธ.ค." className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          </div>
          {a.interestRate > 0 && <p className="text-xs mb-2" style={{ color: GOOD }}>ประมาณการดอกเบี้ยที่ควรได้ต่อปี ~฿{fmt(estimatedAnnualInterest)}</p>}
          <div className="flex gap-2 mb-2">
            <input type="date" value={interestDate} onChange={(e) => setInterestDate(e.target.value)} className="text-xs rounded px-2 py-1.5 flex-1" style={{ border: '1px solid #E7EAF0' }} />
            <NumInput value={interestAmount} onChange={setInterestAmount} placeholder="ดอกเบี้ยที่ได้รับจริง" className="text-xs rounded px-2 py-1.5 flex-1" style={{ border: '1px solid #E7EAF0' }} />
          </div>
          <button onClick={recordInterest} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 w-full mb-1">บันทึกดอกเบี้ยที่ได้รับ</button>
          {(a.interestHistory || []).length > 0 && (
            <button onClick={() => setShowInterestHistory(!showInterestHistory)} className="text-[11px]" style={{ color: BRASS }}>{showInterestHistory ? 'ซ่อนประวัติดอกเบี้ย' : `ดูประวัติดอกเบี้ย (${(a.interestHistory || []).length})`}</button>
          )}
          {showInterestHistory && (a.interestHistory || []).map((h) => (
            <div key={h.id} className="flex justify-between text-xs mt-1"><span>{h.date}</span><span>฿{fmt(h.amount)}</span></div>
          ))}
        </div>
      )}
    </Card>
  );
}

function StockAccountCard({ account: a, onUpdate, onRemove, onAddHolding, onUpdateHolding, onRemoveHolding, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, finnhubKey, categoryColor, onScanValue, allAccounts, onSellHolding, onRemoveSell, onRemoveBuy, onUpdateSell, onUpdateBuy, onAddContribution, onRecordYieldTech, onRecordYieldTechBatch, onRecordBuySellBatch }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedHoldingId, setSelectedHoldingId] = useState(null);
  const holdings = a.holdings || [];
  // FX ล่าสุดที่ใช้จริงจากการซื้อหุ้น USD ตัวไหนก็ได้ในพอร์ต (สำรองไว้ตอนแปะรูปประวัติซื้อ-ขายแบบหลายรายการ กรณีจับคู่กองทุนใหม่ที่ยังไม่มีประวัติ FX ของตัวเอง)
  const globalLatestFx = useMemo(() => {
    let best = null;
    (allAccounts || []).forEach((acc) => (acc.holdings || []).forEach((hh) => {
      if (hh.currency !== 'USD') return;
      (hh.buys || []).forEach((b) => {
        if (!b.shares || !b.price) return;
        const impliedFx = Number(b.amount || 0) / (Number(b.shares) * Number(b.price));
        if (isFinite(impliedFx) && impliedFx > 0 && (!best || b.date > best.date)) best = { date: b.date, fx: impliedFx };
      });
    }));
    return best ? best.fx : null;
  }, [allAccounts]);
  const totalValue = holdings.reduce((s, h) => s + holdingMarketValueTHB(h), 0);
  const totalCost = holdings.reduce((s, h) => s + holdingCostBasisTHB(h), 0);
  const totalGain = totalValue - totalCost;
  const displayValue = holdings.length > 0 ? totalValue : a.value;
  const currency = a.category === 'dime' ? 'USD' : 'THB';
  const cashTHB = a.category === 'dime'
    ? Number(a.cashBalanceTHB || 0) + (Number(a.cashBalanceUSD || 0) + Number(a.cashBalanceFCD || 0)) * Number(a.cashBalanceFx || 36)
    : Number(a.cashBalance || 0);

  const portFileRef = useRef(null);
  const [portScanning, setPortScanning] = useState(false);
  const [portError, setPortError] = useState('');
  const [portDraft, setPortDraft] = useState(null); // array of rows

  const syncFilesRef = useRef(null);
  const [syncScanningMulti, setSyncScanningMulti] = useState(false);
  const [syncErrorMulti, setSyncErrorMulti] = useState('');
  const [syncDraftMulti, setSyncDraftMulti] = useState(null); // { rows: [...], removedSymbols: [...] }

  const ytFileRef = useRef(null);
  const [ytScanning, setYtScanning] = useState(false);
  const [ytScanError, setYtScanError] = useState('');
  const [ytDraft, setYtDraft] = useState(null); // [{ symbol, amount, date, holdingId, reinvestAccountId }]

  const bsFileRef = useRef(null);
  const [bsScanning, setBsScanning] = useState(false);
  const [bsScanError, setBsScanError] = useState('');
  const [bsDraft, setBsDraft] = useState(null); // [{ symbol, type, amount, shares, price, date, holdingId }]

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
        const oldShares = Number(existing.shares || 0);
        const newShares = Number(row.shares || 0);
        const delta = newShares - oldShares;
        let patch = { ...existing, shares: row.shares, avgCost: row.avgCost, currentPrice: row.currentPrice, currentFx: currency === 'USD' && fx ? fx : existing.currentFx, lastUpdated: today };
        // ฟีเจอร์ CC: ถ้าจำนวนหุ้นเปลี่ยนไปจากเดิม (ไม่มีภาพ Order มายืนยัน) ให้ประมาณการรายการซื้อ/ขายให้อัตโนมัติ
        if (Math.abs(delta) > 0.0001) {
          const estPrice = Number(row.currentPrice) || 0;
          if (delta > 0) {
            const buyRecord = { id: uid(), date: today, shares: delta, price: estPrice, amount: delta * estPrice, estimated: true };
            patch.buys = [buyRecord, ...(existing.buys || [])];
          } else {
            const soldShares = Math.abs(delta);
            const fxUsed = existing.currency === 'USD' ? Number(existing.purchaseFx || 0) : 1;
            const costBasisSold = soldShares * Number(existing.avgCost || 0) * fxUsed;
            const amount = soldShares * estPrice * (existing.currency === 'USD' && fx ? fx : fxUsed);
            const gain = amount - costBasisSold;
            const sellRecord = { id: uid(), date: today, shares: soldShares, price: estPrice, amount, gain, currency: existing.currency, estimated: true };
            patch.sells = [sellRecord, ...(existing.sells || [])];
          }
        }
        return patch;
      }
      return { id: uid(), symbol: row.symbol, name: '', shares: row.shares, avgCost: row.avgCost, currency, purchaseFx: currency === 'USD' ? (fx || 36) : 1, currentPrice: row.currentPrice, currentFx: currency === 'USD' ? (fx || 36) : 1, lastUpdated: today, purchaseDate: '', dividends: [], sells: [], buys: [] };
    });
    onUpdate(a.id, { holdings: next });
    setSyncDraftMulti(null);
  }

  async function handleYieldTechPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setYtScanning(true); setYtScanError(''); setYtDraft(null);
    try {
      const symbols = holdings.map((h) => h.symbol).filter(Boolean);
      const rows = await scanYieldTechHistory(file, symbols);
      if (!rows || rows.length === 0) { setYtScanError('อ่านรายการไม่พบ ลองภาพที่ชัดกว่านี้'); return; }
      const matched = rows.map((r) => {
        const found = holdings.find((h) => h.symbol && r.symbol && (h.symbol.toUpperCase() === r.symbol.toUpperCase() || h.symbol.toUpperCase().includes(r.symbol.toUpperCase()) || r.symbol.toUpperCase().includes(h.symbol.toUpperCase())));
        return { symbol: r.symbol, amount: Number(r.amount) || 0, date: r.date || new Date().toISOString().slice(0, 10), holdingId: found ? found.id : '', reinvestAccountId: '' };
      });
      setYtDraft(matched);
    } catch (err) { setYtScanError('เกิดข้อผิดพลาด: ' + err.message); }
    finally { setYtScanning(false); if (ytFileRef.current) ytFileRef.current.value = ''; }
  }
  function updateYtDraftRow(idx, patch) { setYtDraft(ytDraft.map((r, i) => (i === idx ? { ...r, ...patch } : r))); }
  function confirmYtDraft() {
    const valid = ytDraft.filter((r) => r.holdingId && r.amount > 0);
    if (valid.length === 0) return;
    onRecordYieldTechBatch(a.id, valid);
    setYtDraft(null);
  }
  async function handleBuySellPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBsScanning(true); setBsScanError(''); setBsDraft(null);
    try {
      const symbols = holdings.map((h) => h.symbol).filter(Boolean);
      const rows = await scanBuySellHistory(file, symbols);
      if (!rows || rows.length === 0) { setBsScanError('อ่านรายการไม่พบ ลองภาพที่ชัดกว่านี้'); return; }
      const matched = rows.map((r) => {
        const found = holdings.find((h) => h.symbol && r.symbol && (h.symbol.toUpperCase() === r.symbol.toUpperCase() || h.symbol.toUpperCase().includes(r.symbol.toUpperCase()) || r.symbol.toUpperCase().includes(h.symbol.toUpperCase())));
        const rShares = r.shares ? Number(r.shares) : null;
        const rAmount = Number(r.amount) || 0;
        // เช็คว่ารายการนี้อาจซ้ำกับที่เคยบันทึกไว้แล้วไหม — ใช้จำนวนหุ้น+ยอดเงินเป็นหลัก (แม่นกว่าวันที่มาก เพราะบางภาพหน้าจอ เช่น Deal Sum ไม่มีวันที่กำกับต่อแถว ทำให้ AI เดาวันที่ไม่ตรงกันทุกครั้งที่สแกนรูปเดียวกัน)
        let isDuplicate = false;
        if (found) {
          const existingList = r.type === 'sell' ? (found.sells || []) : (found.buys || []);
          isDuplicate = existingList.some((ex) => {
            const sharesMatch = rShares && ex.shares ? Math.abs(ex.shares - rShares) < 0.01 : false;
            const amountMatch = Math.abs(Number(ex.amount || 0) - rAmount) < 1;
            if (sharesMatch && amountMatch) return true; // จำนวนหุ้น+ยอดเงินตรงกันเป๊ะ ถือว่าเป็นรายการเดียวกัน ไม่ต้องพึ่งวันที่
            if (!rShares && amountMatch && ex.date === (r.date || '')) return true; // ถ้าไม่รู้จำนวนหุ้น ค่อยพึ่งวันที่+ยอดเงินแทน
            return false;
          });
        }
        return { symbol: r.symbol, type: r.type === 'sell' ? 'sell' : 'buy', amount: rAmount, shares: rShares, price: r.price ? Number(r.price) : null, date: r.date || new Date().toISOString().slice(0, 10), holdingId: isDuplicate ? '' : (found ? found.id : '__new__'), isDuplicate, fx: a.category === 'dime' ? Number((found && found.purchaseFx) || globalLatestFx || 36) : undefined };
      });
      setBsDraft(matched);
    } catch (err) { setBsScanError('เกิดข้อผิดพลาด: ' + err.message); }
    finally { setBsScanning(false); if (bsFileRef.current) bsFileRef.current.value = ''; }
  }
  function updateBsDraftRow(idx, patch) { setBsDraft(bsDraft.map((r, i) => (i === idx ? { ...r, ...patch } : r))); }
  function confirmBsDraft() {
    const valid = bsDraft.filter((r) => r.holdingId && r.amount > 0).map((r) => (
      a.category === 'dime' ? { ...r, amountForeign: Number(r.amount), amount: Number(r.amount) * Number(r.fx || globalLatestFx || 36) } : r
    ));
    if (valid.length === 0) return;
    onRecordBuySellBatch(a.id, valid);
    setBsDraft(null);
  }
  const today_ = new Date();

  return (
    <Card style={{ borderTop: `3px solid ${categoryColor}` }}>
      <div className="flex items-center gap-2.5 mb-1">
        <div style={{ background: `${categoryColor}1F`, color: categoryColor, flexShrink: 0 }} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold">{(a.name || '?').trim().slice(0, 2).toUpperCase()}</div>
        <input value={a.name} onChange={(e) => onUpdate(a.id, { name: e.target.value })} className="text-sm flex-1 outline-none font-semibold" style={{ border: 'none' }} />
        {a._shared && <span style={{ background: '#7C3AED14', color: '#7C3AED', flexShrink: 0 }} className="text-[10px] font-medium px-2 py-1 rounded-full">🔗 ภรรยา</span>}
        <button onClick={() => onRemove(a.id)}><Trash2 size={16} color={BAD} /></button>
      </div>
      {a.category === 'mutual_fund' && (
        <input value={a.platform || ''} onChange={(e) => onUpdate(a.id, { platform: e.target.value })} placeholder="แพลตฟอร์ม/ช่องทาง เช่น Wealth X, ดาม (ไม่บังคับ)" className="text-[11px] w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7EAF0', color: SLATE }} />
      )}
      {a.category === 'mutual_fund' && (
        <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
          <p className="text-[11px] font-semibold mb-1.5" style={{ color: SLATE }}>YieldTech (ถอนแบบไม่กินทุน)</p>
          <p className="text-[10px] mb-2" style={{ color: SLATE }}>ตั้งค่ายอดถอน/วันตัดได้แยกตามกองทุนแต่ละตัว — เปิดหุ้น/กองทุนแต่ละตัวด้านล่างเพื่อตั้งค่า</p>
          <input ref={ytFileRef} type="file" accept="image/*" onChange={handleYieldTechPhoto} className="hidden" />
          <button onClick={() => ytFileRef.current && ytFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-xs flex items-center justify-center gap-2">{ytScanning ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} color="#FBBF24" />}{ytScanning ? 'กำลังอ่านรูป...' : 'แปะรูปตัด/ขาย YieldTech (ตารางประวัติ หรือรูปยืนยันการขายรายการเดียวก็ได้)'}</button>
          {ytScanError && <p className="text-[11px] mt-1.5" style={{ color: BAD }}>{ytScanError}</p>}
          {ytDraft && (
            <div className="mt-2">
              <p className="text-[11px] mb-1.5" style={{ color: SLATE }}>พบ {ytDraft.length} รายการ — เช็คว่าจับคู่กองทุนถูกต้องก่อนยืนยัน</p>
              {ytDraft.map((row, idx) => (
                <div key={idx} style={{ background: 'white', border: `1px solid ${BORDER}` }} className="rounded-lg p-2 mb-1.5">
                  <p className="text-[11px] font-semibold mb-1">{row.symbol} · {row.date} · ฿{fmt(row.amount)}</p>
                  <select value={row.holdingId} onChange={(e) => updateYtDraftRow(idx, { holdingId: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
                    <option value="">— ไม่จับคู่ (ข้ามรายการนี้) —</option>
                    {holdings.map((h) => <option key={h.id} value={h.id}>{h.symbol}</option>)}
                  </select>
                  <select value={row.reinvestAccountId} onChange={(e) => updateYtDraftRow(idx, { reinvestAccountId: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }}>
                    <option value="">— เก็บไว้เฉยๆ / ยังไม่ระบุ —</option>
                    {(allAccounts || []).map((acc) => <option key={acc.id} value={acc.id}>นำไปลงทุนต่อที่: {acc.name}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={confirmYtDraft} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันบันทึกทั้งหมด</button>
                <button onClick={() => setYtDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      )}
      {holdings.length > 0 && (
        <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
          <p className="text-[11px] font-semibold mb-1.5" style={{ color: SLATE }}>แปะรูปประวัติคำสั่งซื้อ-ขาย</p>
          <p className="text-[10px] mb-2" style={{ color: SLATE }}>ถ่ายรูปที่มีหลายกองทุน/หุ้นปนกันได้เลย ระบบแยกซื้อ/ขายและจับคู่ให้อัตโนมัติ</p>
          <input ref={bsFileRef} type="file" accept="image/*" onChange={handleBuySellPhoto} className="hidden" />
          <button onClick={() => bsFileRef.current && bsFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-xs flex items-center justify-center gap-2">{bsScanning ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} color="#FBBF24" />}{bsScanning ? 'กำลังอ่านรูป...' : 'แปะรูปประวัติคำสั่งซื้อ-ขาย'}</button>
          {bsScanError && <p className="text-[11px] mt-1.5" style={{ color: BAD }}>{bsScanError}</p>}
          {bsDraft && (
            <div className="mt-2">
              <p className="text-[11px] mb-1.5" style={{ color: SLATE }}>พบ {bsDraft.length} รายการ — เช็คประเภท/จับคู่กองทุนให้ถูกต้องก่อนยืนยัน</p>
              {bsDraft.map((row, idx) => (
                <div key={idx} style={{ background: 'white', border: `1px solid ${row.isDuplicate ? WARN : BORDER}` }} className="rounded-lg p-2 mb-1.5">
                  <p className="text-[11px] font-semibold mb-1">{row.symbol} · {row.date} · {a.category === 'dime' ? `$${fmt2(row.amount)}` : `฿${fmt(row.amount)}`}{row.shares ? ` · ${fmt2(row.shares)} หน่วย` : ''}</p>
                  {row.isDuplicate && <p className="text-[10px] mb-1.5" style={{ color: WARN }}>⚠️ ดูเหมือนซ้ำกับรายการที่เคยบันทึกไว้แล้ว (วันที่/จำนวนตรงกัน) — ระบบตั้งค่าเป็น "ข้าม" ไว้ให้ ถ้าตั้งใจบันทึกซ้ำจริงค่อยเลือกกองทุนเอง</p>}
                  <div className="grid grid-cols-2 gap-1.5 mb-1">
                    <select value={row.type} onChange={(e) => updateBsDraftRow(idx, { type: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: `1px solid ${row.type === 'sell' ? BAD : GOOD}`, color: row.type === 'sell' ? BAD : GOOD }}>
                      <option value="buy">🟢 ซื้อ</option>
                      <option value="sell">🔴 ขาย</option>
                    </select>
                    <select value={row.holdingId} onChange={(e) => updateBsDraftRow(idx, { holdingId: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: row.holdingId === '__new__' ? `1px solid ${BRASS}` : '1px solid #E7EAF0', color: row.holdingId === '__new__' ? BRASS : INK }}>
                      <option value="">— ไม่จับคู่ (ข้าม) —</option>
                      {holdings.map((h) => <option key={h.id} value={h.id}>{h.symbol}</option>)}
                      <option value="__new__">+ สร้าง "{row.symbol}" เป็นกองทุนใหม่</option>
                    </select>
                  </div>
                  {a.category === 'dime' && (
                    <div>
                      <label className="text-[10px]" style={{ color: SLATE }}>FX ตอนทำรายการนี้ (บาทต่อ USD)</label>
                      <NumInput value={row.fx} onChange={(v) => updateBsDraftRow(idx, { fx: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} />
                      <p className="text-[10px] mt-0.5" style={{ color: SLATE }}>≈ ฿{fmt(Number(row.amount || 0) * Number(row.fx || globalLatestFx || 36))} (แก้ FX ได้ถ้าอัตราจริงไม่ตรง)</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button onClick={confirmBsDraft} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันบันทึกทั้งหมด</button>
                <button onClick={() => setBsDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-lg font-semibold mt-1">฿{fmt(displayValue)}{cashTHB > 0 && <span className="text-sm font-normal" style={{ color: SLATE }}> (รวมเงินสด ≈ ฿{fmt(displayValue + cashTHB)})</span>}</p>
      {holdings.length > 0 && totalCost > 0 && <p className="text-xs mb-2" style={{ color: totalGain >= 0 ? GOOD : BAD }}>ต้นทุนรวม ฿{fmt(totalCost)} · {totalGain >= 0 ? '+' : ''}฿{fmt(totalGain)} ({totalCost ? ((totalGain / totalCost) * 100).toFixed(1) : 0}%)</p>}
      {holdings.length > 0 && a.category !== 'dime' && (
        <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-2 mb-2">
          <p className="text-[10px] mb-1" style={{ color: SLATE }}>💵 เงินสดในบัญชี (Cash Balance)</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1"><span className="text-sm mr-1">฿</span><NumInput value={a.cashBalance} onChange={(v) => onUpdate(a.id, { cashBalance: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: INK, background: 'white', borderRadius: 6, padding: '4px 6px' }} placeholder="0" /></div>
          </div>
          <div className="mt-1"><CashBalanceScanButton expectedCurrency={currency} onApply={(v) => onUpdate(a.id, { cashBalance: v })} /></div>
        </div>
      )}
      {holdings.length > 0 && a.category === 'dime' && (
        <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-2 mb-2">
          <p className="text-[10px] mb-1" style={{ color: SLATE }}>💵 เงินสดในบัญชี Dime! (แยก 3 บัญชีย่อย)</p>
          <div className="grid grid-cols-1 gap-1.5 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: SLATE, width: 84, flexShrink: 0 }}>฿ Dime! Save</span>
              <div className="flex items-center flex-1"><NumInput value={a.cashBalanceTHB} onChange={(v) => onUpdate(a.id, { cashBalanceTHB: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: INK, background: 'white', borderRadius: 6, padding: '4px 6px' }} placeholder="0" /></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: SLATE, width: 84, flexShrink: 0 }}>$ Dime! USD</span>
              <div className="flex items-center flex-1"><NumInput value={a.cashBalanceUSD} onChange={(v) => onUpdate(a.id, { cashBalanceUSD: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: INK, background: 'white', borderRadius: 6, padding: '4px 6px' }} placeholder="0" /></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: SLATE, width: 84, flexShrink: 0 }}>$ Dime! FCD</span>
              <div className="flex items-center flex-1"><NumInput value={a.cashBalanceFCD} onChange={(v) => onUpdate(a.id, { cashBalanceFCD: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: INK, background: 'white', borderRadius: 6, padding: '4px 6px' }} placeholder="0" /></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: SLATE, width: 84, flexShrink: 0 }}>FX (USD→บาท)</span>
              <div className="flex items-center" style={{ width: 90 }}><NumInput value={a.cashBalanceFx} onChange={(v) => onUpdate(a.id, { cashBalanceFx: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: INK, background: 'white', borderRadius: 6, padding: '4px 6px' }} placeholder="36" /></div>
            </div>
          </div>
          <div className="mt-1"><DimeCashScanButton onApply={(patch) => onUpdate(a.id, patch)} /></div>
          {cashTHB > 0 && <p className="text-[10px] mt-1" style={{ color: SLATE }}>รวมเงินสดทั้ง 3 บัญชี ≈ ฿{fmt(cashTHB)}</p>}
        </div>
      )}
      {holdings.length === 0 && (
        <>
          <div className="flex items-center mt-1 mb-2"><span className="text-sm mr-1">฿</span><NumInput value={a.value} onChange={(v) => onUpdate(a.id, { value: v })} className="text-sm flex-1 outline-none" style={{ border: 'none', color: SLATE }} placeholder="มูลค่ารวม (ถ้ายังไม่แยกรายตัว)" /></div>
          {onScanValue && <ScanValueButton onScanValue={onScanValue} onApply={(v) => onUpdate(a.id, { value: v })} />}
        </>
      )}

      {portDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7EAF0' }} className="rounded-lg p-2 my-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {portDraft.length} หุ้น — ตรวจสอบ/แก้ไขแล้วกดยืนยันนำเข้าทั้งหมด (หุ้นเดิมจะอัพเดท หุ้นใหม่จะถูกเพิ่ม)</p>
          {portDraft.map((row, idx) => {
            const isExisting = holdings.some((h) => (h.symbol || '').toUpperCase() === row.symbol);
            return (
              <div key={idx} style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <input value={row.symbol} onChange={(e) => updateDraftRow(idx, { symbol: e.target.value.toUpperCase() })} className="text-xs font-semibold outline-none rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
                  <span className="text-[10px] mx-2" style={{ color: isExisting ? BRASS : GOOD }}>{isExisting ? 'อัพเดทเดิม' : 'เพิ่มใหม่'}</span>
                  <button onClick={() => removeDraftRow(idx)}><Trash2 size={13} color={BAD} /></button>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  <div><label className="text-[9px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={row.shares} onChange={(v) => updateDraftRow(idx, { shares: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย ({row.currency})</label><NumInput value={row.avgCost} onChange={(v) => updateDraftRow(idx, { avgCost: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ราคาตลาด ({row.currency})</label><NumInput value={row.currentPrice} onChange={(v) => updateDraftRow(idx, { currentPrice: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                </div>
                {row.currency === 'USD' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px]" style={{ color: SLATE }}>FX (1 USD =)</span>
                    <NumInput value={row.fx} onChange={(v) => updateDraftRow(idx, { fx: v })} className="text-xs rounded px-1 py-1 w-16" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
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
            <button onClick={() => setPortDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
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
        <div style={{ background: 'white', border: '1px solid #E7EAF0' }} className="rounded-lg p-2 my-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ซิงค์พอร์ตจากภาพ — ตรวจสอบก่อนยืนยัน (สีแดง = จะถูกลบเพราะไม่เจอในภาพ, สีเขียว = หุ้นใหม่)</p>
          {syncDraftMulti.rows.map((row, idx) => (
            <div key={idx} style={{ background: row.willRemove ? '#FBEAE6' : PAPER_DIM }} className="rounded-lg p-2 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">{row.symbol}</span>
                <span className="text-[10px]" style={{ color: row.willRemove ? BAD : (row.isNew ? GOOD : SLATE) }}>{row.willRemove ? 'จะลบ (ไม่เจอในภาพ)' : row.isNew ? 'หุ้นใหม่' : 'อัพเดท'}</span>
              </div>
              {!row.willRemove && (
                <div className="grid grid-cols-3 gap-1">
                  <div><label className="text-[9px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={row.shares} onChange={(v) => updateSyncRowMulti(idx, { shares: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย</label><NumInput value={row.avgCost} onChange={(v) => updateSyncRowMulti(idx, { avgCost: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                  <div><label className="text-[9px]" style={{ color: SLATE }}>ราคาตลาด</label><NumInput value={row.currentPrice} onChange={(v) => updateSyncRowMulti(idx, { currentPrice: v })} className="text-xs w-full outline-none rounded px-1 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
                </div>
              )}
              <button onClick={() => updateSyncRowMulti(idx, { willRemove: !row.willRemove })} className="text-[10px] mt-1" style={{ color: BRASS }}>{row.willRemove ? 'ยกเลิกการลบ (เก็บไว้)' : 'บังคับลบตัวนี้'}</button>
            </div>
          ))}
          {currency === 'USD' && <p className="text-[10px] mb-2" style={{ color: SLATE }}>อัตราแลกเปลี่ยนที่ใช้: {syncDraftMulti.fxRate ? `1 USD = ${syncDraftMulti.fxRate.toFixed(2)} บาท (เรียลไทม์)` : 'ดึงเรียลไทม์ไม่สำเร็จ ใช้ค่าเดิม'}</p>}
          <div className="flex gap-2">
            <button onClick={confirmSyncMulti} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันซิงค์ทั้งหมด</button>
            <button onClick={() => setSyncDraftMulti(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
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
          <div style={{ borderRadius: CARD_RADIUS, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            {holdings.map((h, i) => (
              <button key={h.id} onClick={() => setSelectedHoldingId(h.id)} className="w-full flex items-center justify-between px-3 py-3" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none', background: 'white' }}>
                <div className="flex items-center gap-2.5">
                  <div style={{ background: PAPER_DIM, color: INK }} className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0">{(h.symbol || '?').slice(0, 2)}</div>
                  <div className="text-left">
                    <p style={{ color: INK }} className="text-sm font-semibold">{h.symbol || '(ยังไม่ตั้งชื่อ)'}</p>
                    <p style={{ color: SLATE }} className="text-[11px]">{fmt2(h.shares)} หุ้น</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-right">
                    <p style={{ color: INK }} className="text-sm font-bold">฿{fmt(holdingMarketValueTHB(h))}</p>
                    {(() => { const cb = holdingCostBasisTHB(h); const g = holdingMarketValueTHB(h) - cb; const gp = cb ? (g / cb) * 100 : 0; return (
                      <span style={{ background: gp >= 0 ? '#16A34A14' : '#DC262614', color: gp >= 0 ? GOOD : BAD }} className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full">{gp >= 0 ? '+' : ''}{gp.toFixed(1)}%</span>
                    ); })()}
                  </div>
                  <ChevronRight size={15} color={SLATE} />
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => onAddHolding(a.id)} className="flex items-center gap-1 text-xs mt-2" style={{ color: BRASS }}><PlusCircle size={13} /> เพิ่มหุ้นในบัญชีนี้</button>
        </div>
      )}
      {selectedHoldingId && (() => {
        const h = holdings.find((x) => x.id === selectedHoldingId);
        if (!h) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setSelectedHoldingId(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, maxHeight: '88vh' }} className="w-full overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-2">
                <p style={{ color: INK }} className="text-base font-bold">{h.symbol}</p>
                <button onClick={() => setSelectedHoldingId(null)}><X size={20} color={INK} /></button>
              </div>
              <HoldingRow accountId={a.id} holding={h} onUpdate={onUpdateHolding} onRemove={(accId, hId) => { onRemoveHolding(accId, hId); setSelectedHoldingId(null); }} onAddDividend={onAddDividend} onRemoveDividend={onRemoveDividend} onUpdateDividend={onUpdateDividend} onRefreshPrice={onRefreshPrice} canRefresh={true} finnhubKey={finnhubKey} allAccounts={allAccounts} onSellHolding={onSellHolding} onRemoveSell={onRemoveSell} onRemoveBuy={onRemoveBuy} onUpdateSell={onUpdateSell} onUpdateBuy={onUpdateBuy} onRecordYieldTech={onRecordYieldTech} isMutualFund={a.category === 'mutual_fund'} />
            </div>
          </div>
        );
      })()}
    </Card>
  );
    }function HoldingRow({ accountId, holding: h, onUpdate, onRemove, onAddDividend, onRemoveDividend, onUpdateDividend, onRefreshPrice, canRefresh, finnhubKey, allAccounts, onSellHolding, onRemoveSell, onRemoveBuy, onUpdateSell, onUpdateBuy, onRecordYieldTech, isMutualFund }) {
  // FX ล่าสุดที่ใช้จริงจากการซื้อหุ้น USD ตัวไหนก็ได้ในพอร์ต (เอาไว้ตั้งค่าเริ่มต้นให้หุ้น/กองทุน USD ที่ยังไม่มีประวัติซื้อของตัวเอง แทนเลข 36 ที่ล้าสมัยและอาจต่างจาก FX จริงมาก)
  const latestGlobalFx = useMemo(() => {
    let best = null;
    (allAccounts || []).forEach((acc) => (acc.holdings || []).forEach((hh) => {
      if (hh.currency !== 'USD') return;
      (hh.buys || []).forEach((b) => {
        if (!b.shares || !b.price) return;
        const impliedFx = Number(b.amount || 0) / (Number(b.shares) * Number(b.price));
        if (isFinite(impliedFx) && impliedFx > 0 && (!best || b.date > best.date)) best = { date: b.date, fx: impliedFx };
      });
    }));
    return best ? best.fx : null;
  }, [allAccounts]);
  const defaultFxFor = (h) => Number(h.purchaseFx || latestGlobalFx || 36);
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
  const [showYieldHistory, setShowYieldHistory] = useState(false);
  const [yieldConfirmAmount, setYieldConfirmAmount] = useState(0);
  const [yieldConfirmDest, setYieldConfirmDest] = useState('');
  const [yieldConfirmShares, setYieldConfirmShares] = useState('');
  const marketValue = holdingMarketValueTHB(h);
  const costBasis = holdingCostBasisTHB(h);
  const gain = marketValue - costBasis;
  const gainPct = costBasis ? (gain / costBasis) * 100 : 0;
  const totalDiv = (h.dividends || []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const yieldPct = costBasis ? (totalDiv / costBasis) * 100 : 0;
  const yieldAnnualPct = (h.yieldTechMonthly && costBasis > 0) ? (Number(h.yieldTechMonthly) * 12 / costBasis) * 100 : 0;
  const ytToday = new Date();
  const yieldDueThisMonth = h.yieldTechDay && ytToday.getDate() >= Number(h.yieldTechDay);
  const yieldRecordedThisMonth = (h.yieldTechHistory || []).some((x) => monthKey(x.date) === monthKey(ytToday.toISOString().slice(0, 10)));
  function confirmYieldTechThis() {
    if (!yieldConfirmAmount) return;
    onRecordYieldTech(accountId, h.id, { amount: yieldConfirmAmount, date: ytToday.toISOString().slice(0, 10), reinvestAccountId: yieldConfirmDest || undefined, sharesOverride: yieldConfirmShares || undefined });
    setYieldConfirmAmount(0); setYieldConfirmDest(''); setYieldConfirmShares('');
  }
  const cagr = holdingCAGR(h);
  const totalRealized = (h.sells || []).reduce((s, x) => s + Number(x.gain || 0), 0);
  const [refreshError, setRefreshError] = useState('');
  async function doRefresh() {
    setRefreshing(true); setRefreshError('');
    const result = await onRefreshPrice(accountId, h.id, h.symbol, h.currency);
    if (result && !result.ok) setRefreshError(result.message);
    setRefreshing(false);
  }

  async function handleBuyFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBuyScanning(true); setBuyError(''); setBuyDraft(null);
    try {
      const parsed = await scanBuyTransaction(file);
      setBuyDraft({ symbol: parsed.symbol || null, amount: Number(parsed.amount) || 0, shares: Number(parsed.shares) || 0, price: Number(parsed.price) || 0, date: parsed.date || new Date().toISOString().slice(0, 10), fx: h.currency === 'USD' ? defaultFxFor(h) : undefined, pendingUnits: (parsed.shares === null || parsed.shares === undefined) });
    } catch (err) { setBuyError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setBuyScanning(false); if (buyFileRef.current) buyFileRef.current.value = ''; }
  }

  async function handleSellFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSellScanning(true); setSellError(''); setSellDraft(null);
    try {
      const parsed = await scanSellTransaction(file);
      setSellDraft({ symbol: parsed.symbol || null, amount: Number(parsed.amount) || 0, shares: Number(parsed.shares) || 0, price: Number(parsed.price) || 0, date: parsed.date || new Date().toISOString().slice(0, 10), fx: h.currency === 'USD' ? defaultFxFor(h) : undefined });
    } catch (err) { setSellError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setSellScanning(false); if (sellFileRef.current) sellFileRef.current.value = ''; }
  }

  const sellPreview = useMemo(() => {
    if (!sellDraft) return null;
    const costFx = h.currency === 'USD' ? Number(h.purchaseFx || 0) : 1;
    const costBasisSold = Number(sellDraft.shares || 0) * Number(h.avgCost || 0) * costFx;
    // สำหรับหุ้น USD (Dime): sellDraft.amount คือยอดที่ได้รับจริงเป็น USD ต้องคูณ FX ก่อนเทียบกับต้นทุน (ที่เป็นบาท) เพื่อหากำไร/ขาดทุน
    const amountTHB = h.currency === 'USD' ? Number(sellDraft.amount || 0) * Number(sellDraft.fx || defaultFxFor(h)) : Number(sellDraft.amount || 0);
    const gainOnSale = amountTHB - costBasisSold;
    const remainingShares = Math.max(0, Number(h.shares || 0) - Number(sellDraft.shares || 0));
    return { costBasisSold, gainOnSale, remainingShares, amountTHB };
  }, [sellDraft, h]);

  function confirmSell() {
    onSellHolding(accountId, h.id, { ...sellDraft, amount: sellPreview.amountTHB, amountForeign: h.currency === 'USD' ? Number(sellDraft.amount || 0) : undefined, fx: sellDraft.fx });
    setSellDraft(null);
  }

  const buyPreview = useMemo(() => {
    if (!buyDraft) return null;
    const oldShares = Number(h.shares || 0);
    const oldAvgCost = Number(h.avgCost || 0);
    const newShares = oldShares + Number(buyDraft.shares || 0);
    const newAvgCost = newShares > 0 ? (oldShares * oldAvgCost + Number(buyDraft.shares || 0) * Number(buyDraft.price || 0)) / newShares : 0;
    // สำหรับหุ้น USD (Dime): buyDraft.amount คือยอดที่จ่ายจริงเป็น USD (ตามที่สแกน/กรอก) ต้องคูณ FX ก่อนแปลงเป็นบาทเพื่อคำนวณต้นทุน/FX เฉลี่ย
    const amountTHB = h.currency === 'USD' ? Number(buyDraft.amount || 0) * Number(buyDraft.fx || defaultFxFor(h)) : Number(buyDraft.amount || 0);
    let newPurchaseFx = h.purchaseFx;
    if (h.currency === 'USD') {
      const oldTotalTHB = holdingCostBasisTHB(h);
      const newTotalTHB = oldTotalTHB + amountTHB;
      const newTotalUSDCost = newShares * newAvgCost;
      newPurchaseFx = newTotalUSDCost > 0 ? newTotalTHB / newTotalUSDCost : h.purchaseFx;
    }
    return { newShares, newAvgCost, newPurchaseFx, amountTHB };
  }, [buyDraft, h]);

  function confirmBuy() {
    const amountTHB = buyPreview.amountTHB;
    const buyRecord = { id: uid(), date: buyDraft.date, shares: buyDraft.shares, price: buyDraft.price, amount: amountTHB };
    const patch = { shares: buyPreview.newShares, avgCost: buyPreview.newAvgCost, purchaseDate: h.purchaseDate || buyDraft.date, lastUpdated: new Date().toISOString().slice(0, 10), buys: [buyRecord, ...(h.buys || [])] };
    if (h.currency === 'USD') patch.purchaseFx = buyPreview.newPurchaseFx;
    // ถ้าหุ้น/กองทุนนี้ยังไม่มีชื่อ (เพิ่งสร้างใหม่ ยังไม่ได้กรอกชื่อ) ให้ดึงชื่อจากภาพสลิปที่สแกนมาใส่ให้เลย จะได้ไม่ขึ้นชื่อว่างในการ์ดแจ้งเตือน/ประวัติ
    if (!h.symbol && !h.name && buyDraft.symbol) patch.symbol = buyDraft.symbol;
    onUpdate(accountId, h.id, patch);
    const displayName = h.symbol || h.name || buyDraft.symbol || 'รายการนี้';
    const accName = ((allAccounts || []).find((acc) => acc.id === accountId) || {}).name || '';
    const isUSD = h.currency === 'USD';
    const rows = [{ label: 'บัญชี', value: accName || '-' }, { label: 'วันที่', value: formatDateDMY(buyDraft.date) }, { label: 'จำนวนหุ้น', value: `${Number(buyDraft.shares || 0).toLocaleString()} หุ้น @ ${Number(buyDraft.price || 0)}${isUSD ? ' USD' : ''}` }];
    if (isUSD) rows.push({ label: 'จ่ายจริง', value: `$${fmt2(Number(buyDraft.amount || 0))} (FX ${Number(buyDraft.fx || defaultFxFor(h)).toFixed(2)})` });
    sendLineFlex(`ซื้อ ${displayName}${accName ? ' (' + accName + ')' : ''} ${isUSD ? '$' + fmt2(Number(buyDraft.amount || 0)) : '฿' + fmt(amountTHB)}`, buildFlexCard({
      title: `📈 ซื้อ ${displayName}`,
      rows,
      amount: amountTHB, amountColor: BAD, tab: 'accounts',
    }));
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
      <div className="flex gap-2 mb-2"><input value={h.symbol} onChange={(e) => onUpdate(accountId, h.id, { symbol: e.target.value.toUpperCase() })} placeholder="สัญลักษณ์" className="text-sm font-semibold flex-1 outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /><button onClick={() => onRemove(accountId, h.id)}><Trash2 size={14} color={BAD} /></button></div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={h.shares} onChange={(v) => onUpdate(accountId, h.id, { shares: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย/หุ้น ({h.currency})</label><NumInput value={h.avgCost} onChange={(v) => onUpdate(accountId, h.id, { avgCost: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
        {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ตอนซื้อเฉลี่ย</label><NumInput value={h.purchaseFx} onChange={(v) => onUpdate(accountId, h.id, { purchaseFx: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>}
        <div><label className="text-[10px]" style={{ color: SLATE }}>ราคาปัจจุบัน/หุ้น ({h.currency})</label><NumInput value={h.currentPrice} onChange={(v) => onUpdate(accountId, h.id, { currentPrice: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
        {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ปัจจุบัน</label><NumInput value={h.currentFx} onChange={(v) => onUpdate(accountId, h.id, { currentFx: v })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>}
        <div className="col-span-2"><label className="text-[10px]" style={{ color: SLATE }}>วันที่เริ่มถือ (สำหรับ CAGR)</label><input type="date" value={h.purchaseDate || ''} onChange={(e) => onUpdate(accountId, h.id, { purchaseDate: e.target.value })} className="text-sm w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} /></div>
      </div>
      {isMutualFund && (
        <div style={{ background: 'white', border: `1px solid ${BORDER}` }} className="rounded-lg p-2 mb-2">
          <p className="text-[11px] font-semibold mb-2" style={{ color: SLATE }}>YieldTech (ถอนแบบไม่กินทุน)</p>
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div><label className="text-[9px]" style={{ color: SLATE }}>ถอนต่อเดือน (บาท)</label><NumInput value={h.yieldTechMonthly} onChange={(v) => onUpdate(accountId, h.id, { yieldTechMonthly: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[9px]" style={{ color: SLATE }}>วันที่ตัดในเดือน</label><NumInput value={h.yieldTechDay} onChange={(v) => onUpdate(accountId, h.id, { yieldTechDay: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          </div>
          {yieldAnnualPct > 0 && <p className="text-[11px] mb-1" style={{ color: GOOD }}>คิดเป็น Yield ~{yieldAnnualPct.toFixed(2)}% ต่อปี</p>}
          {yieldDueThisMonth && !yieldRecordedThisMonth && (
            <div style={{ background: '#FFF6E5', border: '1px solid #E7D0A0' }} className="rounded-lg p-2 mt-1 mb-1">
              <p className="text-[11px] mb-2" style={{ color: WARN }}>เดือนนี้ถึงวันตัดแล้ว (วันที่ {h.yieldTechDay}) — บันทึกยอดที่ได้รับจริง</p>
              <NumInput value={yieldConfirmAmount} onChange={setYieldConfirmAmount} placeholder="ยอดรับจริง (บาท)" className="text-xs w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7EAF0' }} />
              <input value={yieldConfirmShares} onChange={(e) => setYieldConfirmShares(e.target.value)} placeholder="จำนวนหน่วยที่ถูกหัก (ถ้าทราบ — ไม่ทราบเว้นว่างไว้ ระบบจะประมาณให้)" className="text-xs w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7EAF0' }} />
              <select value={yieldConfirmDest} onChange={(e) => setYieldConfirmDest(e.target.value)} className="text-xs w-full outline-none rounded px-2 py-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
                <option value="">— เก็บไว้เฉยๆ / ยังไม่ระบุ —</option>
                {(allAccounts || []).map((acc) => <option key={acc.id} value={acc.id}>นำไปลงทุนต่อที่: {acc.name}</option>)}
              </select>
              <button onClick={confirmYieldTechThis} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 w-full">ยืนยันบันทึก</button>
            </div>
          )}
          {(h.yieldTechHistory || []).length > 0 && (
            <button onClick={() => setShowYieldHistory(!showYieldHistory)} className="text-[10px]" style={{ color: BRASS }}>{showYieldHistory ? 'ซ่อนประวัติ' : `ดูประวัติ YieldTech (${(h.yieldTechHistory || []).length})`}</button>
          )}
          {showYieldHistory && (h.yieldTechHistory || []).map((x) => (
            <div key={x.id} className="flex justify-between text-[11px] mt-1"><span>{x.date}{x.reinvestAccountId && ' · ลงทุนต่อ'}{x.estimatedShares ? ` · ~${fmt2(x.estimatedShares)} หน่วย` : ''}</span><span>฿{fmt(x.amount)}</span></div>
          ))}
        </div>
      )}
      {canRefresh && (
        <>
          <button onClick={doRefresh} disabled={!h.symbol || (h.currency === 'USD' && !finnhubKey)} className="flex items-center gap-1 text-[11px] mb-1" style={{ color: (h.currency === 'USD' && !finnhubKey) ? SLATE : BRASS }}>
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} {h.currency === 'USD' ? (finnhubKey ? 'รีเฟรชราคาล่าสุด' : 'ตั้งค่า API key เพื่อรีเฟรชราคา') : 'รีเฟรชราคาล่าสุด (ดีเลย์ ~15 นาที)'}
          </button>
          {h.currency === 'THB' && <p className="text-[9px] mb-1" style={{ color: SLATE }}>ข้อมูลจาก Yahoo Finance (ไม่เป็นทางการ) — ใช้เป็นข้อมูลอ้างอิงคร่าวๆ</p>}
        </>
      )}
      {refreshError && <p className="text-[10px] mb-2" style={{ color: BAD }}>{refreshError}</p>}
      {syncDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7EAF0' }} className="rounded-lg p-2 mb-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบข้อมูลก่อนตั้งค่าใหม่ทั้งหมด (แทนที่ค่าเดิม)</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้น</label><NumInput value={syncDraft.shares} onChange={(v) => setSyncDraft({ ...syncDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ย ({syncDraft.currency})</label><NumInput value={syncDraft.avgCost} onChange={(v) => setSyncDraft({ ...syncDraft, avgCost: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคาปัจจุบัน ({syncDraft.currency})</label><NumInput value={syncDraft.currentPrice} onChange={(v) => setSyncDraft({ ...syncDraft, currentPrice: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            {syncDraft.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX</label><NumInput value={syncDraft.fx} onChange={(v) => setSyncDraft({ ...syncDraft, fx: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>}
          </div>
          {syncDraft.currency !== h.currency && <p className="text-[11px] mb-2" style={{ color: WARN }}>สังเกตว่าสกุลเงินตรวจพบเป็น {syncDraft.currency} ต่างจากเดิม ({h.currency}) — ระบบจะปรับให้ตรงตามนี้</p>}
          <div className="flex gap-2">
            <button onClick={confirmSync} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันตั้งค่าใหม่</button>
            <button onClick={() => setSyncDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
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
      <div className="flex justify-between items-center mt-1"><span className="text-xl font-bold">฿{fmt(marketValue)}</span><span className="text-xl font-bold" style={{ color: gain >= 0 ? GOOD : BAD }}>{gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%</span></div>
      <p className="text-[11px]" style={{ color: SLATE }}>ต้นทุน ฿{fmt(costBasis)} · ปันผลสะสม ฿{fmt(totalDiv)} (Yield {yieldPct.toFixed(1)}%){cagr !== null && ` · CAGR ${cagr.toFixed(1)}%/ปี`}</p>
      {h.currency === 'USD' && <p className="text-[11px]" style={{ color: SLATE }}>ต้นทุนเฉลี่ยต่อหุ้นเป็นบาท ≈ ฿{fmt2(Number(h.avgCost || 0) * Number(h.purchaseFx || 0))} (จาก {Number(h.avgCost || 0).toFixed(2)} USD × FX {Number(h.purchaseFx || 0).toFixed(2)})</p>}
      {(h.sells || []).length > 0 && (
        <p className="text-[11px] mb-1" style={{ color: totalRealized >= 0 ? GOOD : BAD }}>กำไร/ขาดทุนที่รับรู้แล้ว (ขายไปแล้ว): {totalRealized >= 0 ? '+' : ''}฿{fmt(totalRealized)}</p>
      )}

      {buyDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7EAF0' }} className="rounded-lg p-2 mt-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบรายการซื้อก่อนยืนยัน (แก้ไขได้)</p>
          {buyDraft.symbol && buyDraft.symbol.toUpperCase() !== (h.symbol || '').toUpperCase() && (
            <p className="text-[11px] mb-2" style={{ color: WARN }}>⚠️ ภาพนี้ดูเหมือนเป็นสัญลักษณ์ "{buyDraft.symbol}" แต่หุ้นนี้คือ "{h.symbol}" — เช็คให้ดีว่าภาพถูกต้องก่อนยืนยัน</p>
          )}
          {buyDraft.pendingUnits && (
            <p className="text-[11px] mb-2 px-2 py-1.5 rounded" style={{ background: '#FEF3E2', color: WARN }}>⏳ กองทุนนี้ยังไม่รู้จำนวนหน่วย/ราคา (รอ NAV ปิดวันถัดไป) — กรอกยอดเงินแล้วบันทึกไปก่อนได้ แล้วค่อยกลับมาแก้ไขจำนวนหน่วย/ราคาทีหลังตอนกองทุนแจ้งผลแล้ว</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>จ่ายจริง ({h.currency === 'USD' ? 'USD' : 'บาท'})</label><NumInput value={buyDraft.amount} onChange={(v) => setBuyDraft({ ...buyDraft, amount: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้นที่ได้</label><NumInput value={buyDraft.shares} onChange={(v) => setBuyDraft({ ...buyDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคา/หุ้น ({h.currency})</label><NumInput value={buyDraft.price} onChange={(v) => setBuyDraft({ ...buyDraft, price: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่ซื้อ</label><input type="date" value={buyDraft.date} onChange={(e) => setBuyDraft({ ...buyDraft, date: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ตอนซื้อนี้ (บาทต่อ USD)</label><NumInput value={buyDraft.fx} onChange={(v) => setBuyDraft({ ...buyDraft, fx: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>}
          </div>
          {h.currency === 'USD' && <p className="text-[10px] mb-2" style={{ color: SLATE }}>≈ ฿{fmt(Number(buyDraft.amount || 0) * Number(buyDraft.fx || defaultFxFor(h)))} (คำนวณจาก FX ด้านบน — แก้ได้ถ้าอัตราจริงที่จ่ายไม่ตรง)</p>}
          {buyPreview && (
            <p className="text-[11px] mb-2" style={{ color: GOOD }}>
              หลังยืนยัน: จำนวนหุ้นรวม {buyPreview.newShares.toFixed(4)} · ต้นทุนเฉลี่ยใหม่ {buyPreview.newAvgCost.toFixed(2)} {h.currency}
              {h.currency === 'USD' && ` · FX เฉลี่ยใหม่ ${buyPreview.newPurchaseFx.toFixed(2)}`}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={confirmBuy} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันซื้อเพิ่ม</button>
            <button onClick={() => setBuyDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-3">
          <input ref={buyFileRef} type="file" accept="image/*" onChange={handleBuyFile} className="hidden" />
          <button onClick={() => buyFileRef.current && buyFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
            {buyScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {buyScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปรายการซื้อ'}
          </button>
          <button onClick={() => setBuyDraft({ symbol: null, amount: 0, shares: 0, price: 0, date: new Date().toISOString().slice(0, 10), fx: h.currency === 'USD' ? defaultFxFor(h) : undefined })} className="flex items-center gap-1 text-[11px]" style={{ color: BRASS }}>
            ✍️ กรอกด้วยมือ
          </button>
          {buyError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{buyError}</p>}
        </div>
      )}
      {(h.buys || []).length > 0 && (
        <button onClick={() => setShowBuys(!showBuys)} className="text-[11px] mt-1" style={{ color: BRASS }}>{showBuys ? 'ซ่อนประวัติการซื้อ' : `ดูประวัติการซื้อ (${h.buys.length})`}</button>
      )}
      {showBuys && (h.buys || []).map((b) => (
        <div key={b.id} className="flex justify-between text-xs mt-1">
          <span>{b.date} · ซื้อ {b.shares} หุ้น @ {b.price}{b.estimated && <span className="text-[9px]" style={{ color: WARN }}> (ประมาณการจากภาพสรุป)</span>}</span>
          <span className="text-[10px] flex items-center gap-2" style={{ color: SLATE }}>฿{fmt(b.amount)} <EditButton onClick={() => setEditingBuy(b)} /><button onClick={() => onRemoveBuy(accountId, h.id, b.id)}><Trash2 size={11} color={BAD} /></button></span>
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
          onSave={(v) => {
            const changed = [];
            if (Number(editingBuy.shares || 0) !== Number(v.shares || 0)) changed.push({ label: 'จำนวนหุ้น', value: `${Number(editingBuy.shares || 0).toLocaleString()} → ${Number(v.shares || 0).toLocaleString()}` });
            if (Number(editingBuy.price || 0) !== Number(v.price || 0)) changed.push({ label: 'ราคา', value: `${editingBuy.price} → ${v.price}` });
            if (Number(editingBuy.amount || 0) !== Number(v.amount || 0)) changed.push({ label: 'จ่ายจริง', value: `฿${fmt(editingBuy.amount)} → ฿${fmt(v.amount)}` });
            if (editingBuy.date !== v.date) changed.push({ label: 'วันที่', value: `${formatDateDMY(editingBuy.date)} → ${formatDateDMY(v.date)}` });
            const accName = ((allAccounts || []).find((acc) => acc.id === accountId) || {}).name || '';
            if (changed.length) sendLineFlex(`แก้ไขรายการซื้อ ${h.symbol || h.name}${accName ? ' (' + accName + ')' : ''}`, buildFlexCard({
              title: `✏️ แก้ไขรายการซื้อ ${h.symbol || h.name}`,
              rows: [{ label: 'วันที่เดิม', value: formatDateDMY(editingBuy.date) }, ...changed],
              tab: 'accounts',
            }));
            onUpdateBuy(accountId, h.id, editingBuy.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0 });
            setEditingBuy(null);
          }}
        />
      )}

      {sellDraft ? (
        <div style={{ background: 'white', border: '1px solid #E7EAF0' }} className="rounded-lg p-2 mt-2">
          <p className="text-xs mb-2" style={{ color: SLATE }}>ตรวจสอบรายการขายก่อนยืนยัน (แก้ไขได้)</p>
          {sellDraft.symbol && sellDraft.symbol.toUpperCase() !== (h.symbol || '').toUpperCase() && (
            <p className="text-[11px] mb-2" style={{ color: WARN }}>⚠️ ภาพนี้ดูเหมือนเป็นสัญลักษณ์ "{sellDraft.symbol}" แต่หุ้นนี้คือ "{h.symbol}" — เช็คให้ดีว่าภาพถูกต้องก่อนยืนยัน</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[10px]" style={{ color: SLATE }}>ได้รับจริง ({h.currency === 'USD' ? 'USD' : 'บาท'})</label><NumInput value={sellDraft.amount} onChange={(v) => setSellDraft({ ...sellDraft, amount: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนหุ้นที่ขาย</label><NumInput value={sellDraft.shares} onChange={(v) => setSellDraft({ ...sellDraft, shares: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>ราคา/หุ้น ({h.currency})</label><NumInput value={sellDraft.price} onChange={(v) => setSellDraft({ ...sellDraft, price: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่ขาย</label><input type="date" value={sellDraft.date} onChange={(e) => setSellDraft({ ...sellDraft, date: e.target.value })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            {h.currency === 'USD' && <div><label className="text-[10px]" style={{ color: SLATE }}>FX ตอนขายนี้ (บาทต่อ USD)</label><NumInput value={sellDraft.fx} onChange={(v) => setSellDraft({ ...sellDraft, fx: v })} className="text-xs w-full outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} /></div>}
          </div>
          {h.currency === 'USD' && <p className="text-[10px] mb-2" style={{ color: SLATE }}>≈ ฿{fmt(Number(sellDraft.amount || 0) * Number(sellDraft.fx || defaultFxFor(h)))} (คำนวณจาก FX ด้านบน — แก้ได้ถ้าอัตราจริงที่ได้ไม่ตรง)</p>}
          {sellPreview && (
            <p className="text-[11px] mb-2" style={{ color: sellPreview.gainOnSale >= 0 ? GOOD : BAD }}>
              กำไร/ขาดทุนจากการขายนี้: {sellPreview.gainOnSale >= 0 ? '+' : ''}฿{fmt(sellPreview.gainOnSale)} (เทียบต้นทุน ฿{fmt(sellPreview.costBasisSold)}) · เหลือถือ {sellPreview.remainingShares.toFixed(4)} หุ้น
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={confirmSell} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันขาย</button>
            <button onClick={() => setSellDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-3">
          <input ref={sellFileRef} type="file" accept="image/*" onChange={handleSellFile} className="hidden" />
          <button onClick={() => sellFileRef.current && sellFileRef.current.click()} className="flex items-center gap-1 text-[11px]" style={{ color: BAD }}>
            {sellScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} {sellScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปรายการขาย'}
          </button>
          <button onClick={() => setSellDraft({ symbol: null, amount: 0, shares: 0, price: 0, date: new Date().toISOString().slice(0, 10), fx: h.currency === 'USD' ? defaultFxFor(h) : undefined })} className="flex items-center gap-1 text-[11px]" style={{ color: BAD }}>
            ✍️ กรอกด้วยมือ
          </button>
          {sellError && <p className="text-[10px] mt-1" style={{ color: BAD }}>{sellError}</p>}
        </div>
      )}
      {(h.sells || []).length > 0 && (
        <button onClick={() => setShowSells(!showSells)} className="text-[11px] mt-1" style={{ color: BRASS }}>{showSells ? 'ซ่อนประวัติการขาย' : `ดูประวัติการขาย (${h.sells.length})`}</button>
      )}
      {showSells && (h.sells || []).map((s) => (
        <div key={s.id} className="flex justify-between text-xs mt-1">
          <span>{s.date} · ขาย {s.shares} หุ้น @ {s.price}{s.estimated && <span className="text-[9px]" style={{ color: WARN }}> (ประมาณการจากภาพสรุป)</span>}</span>
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
            const changed = [];
            if (Number(editingSell.shares || 0) !== Number(v.shares || 0)) changed.push({ label: 'จำนวนหุ้น', value: `${Number(editingSell.shares || 0).toLocaleString()} → ${Number(v.shares || 0).toLocaleString()}` });
            if (Number(editingSell.price || 0) !== Number(v.price || 0)) changed.push({ label: 'ราคา', value: `${editingSell.price} → ${v.price}` });
            if (Number(editingSell.amount || 0) !== Number(v.amount || 0)) changed.push({ label: 'ได้รับ', value: `฿${fmt(editingSell.amount)} → ฿${fmt(v.amount)}` });
            if (editingSell.date !== v.date) changed.push({ label: 'วันที่', value: `${formatDateDMY(editingSell.date)} → ${formatDateDMY(v.date)}` });
            const accName = ((allAccounts || []).find((acc) => acc.id === accountId) || {}).name || '';
            if (changed.length) sendLineFlex(`แก้ไขรายการขาย ${h.symbol || h.name}${accName ? ' (' + accName + ')' : ''}`, buildFlexCard({
              title: `✏️ แก้ไขรายการขาย ${h.symbol || h.name}`,
              rows: [{ label: 'วันที่เดิม', value: formatDateDMY(editingSell.date) }, ...changed],
              tab: 'accounts',
            }));
            onUpdateSell(accountId, h.id, editingSell.id, { date: v.date, shares: Number(v.shares) || 0, price: Number(v.price) || 0, amount: Number(v.amount) || 0, gain });
            setEditingSell(null);
          }}
        />
      )}

      <button onClick={() => setShowDiv(!showDiv)} className="text-[11px] mt-2" style={{ color: BRASS }}>{showDiv ? 'ซ่อน' : 'ดู/บันทึกปันผล'}</button>
      {showDiv && (
        <div className="mt-2">
          <div className="flex gap-2 mb-2">
            <input type="date" value={divDate} onChange={(e) => setDivDate(e.target.value)} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
            <NumInput value={divAmount} onChange={setDivAmount} placeholder="จำนวนเงิน" className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7EAF0', background: 'white' }} />
          </div>
          <label className="text-[10px]" style={{ color: SLATE }}>เอาไปทำอะไรต่อ (ไม่บังคับ — ถ้าเลือกบัญชี จะบันทึกเป็นเงินเข้าให้อัตโนมัติ)</label>
          <select value={divReinvest} onChange={(e) => setDivReinvest(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded px-2 py-1 text-xs w-full mt-1 mb-2">
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

function SavingsTab({ accounts, contributions, onAdd, onRemove, onUpdate, customDestinationList, onAddCustomDestination, onAddToCalendar, googleConnected, expenseCategories, onAddExpense }) {
  const [amount, setAmount] = useState(10000);
  const [source, setSource] = useState('pharmacy');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [usdAmount, setUsdAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState(null); // contribution being edited
  const [syncingId, setSyncingId] = useState(null);
  const [syncMsg, setSyncMsg] = useState({}); // { [contributionId]: message }
  const [summaryPeriodType, setSummaryPeriodType] = useState('month');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wdAmount, setWdAmount] = useState(0);
  const [wdAccountId, setWdAccountId] = useState('');
  const [wdDate, setWdDate] = useState(new Date().toISOString().slice(0, 10));
  const [wdCategory, setWdCategory] = useState((expenseCategories && expenseCategories[0]) || 'อื่นๆ');
  const [wdNote, setWdNote] = useState('');
  const destAccount = accounts.find((a) => a.id === accountId);
  const isDime = destAccount && destAccount.category === 'dime';
  function submit() { if (!accountId) return; onAdd({ date, amount, source, accountId, usdAmount: isDime && usdAmount ? Number(usdAmount) : undefined }); setUsdAmount(0); }
  const thisMonthTotal = useMemo(() => { const ym = new Date().toISOString().slice(0, 7); return contributions.filter((c) => c.date.startsWith(ym)).reduce((s, c) => s + Number(c.amount || 0), 0); }, [contributions]);
  const summaryKeyFn = summaryPeriodType === 'month' ? monthKey : yearKey;
  const summaryPeriods = useMemo(() => Array.from(new Set(contributions.map((c) => summaryKeyFn(c.date)))).sort().reverse(), [contributions, summaryPeriodType]);
  const [summaryPeriod, setSummaryPeriod] = useState(summaryPeriods[0] || '');
  useEffect(() => { setSummaryPeriod(summaryPeriods[0] || ''); }, [summaryPeriodType, contributions.length]);
  const bySourceThisPeriod = useMemo(() => {
    const filtered = contributions.filter((c) => summaryKeyFn(c.date) === summaryPeriod);
    const map = {};
    filtered.forEach((c) => { map[c.source] = (map[c.source] || 0) + Number(c.amount || 0); });
    return Object.entries(map).map(([src, total]) => ({ src, label: SOURCES.find((s) => s.id === src)?.label || src, total })).sort((a, b) => b.total - a.total);
  }, [contributions, summaryPeriod, summaryPeriodType]);
  const byDestinationThisPeriod = useMemo(() => {
    const filtered = contributions.filter((c) => summaryKeyFn(c.date) === summaryPeriod);
    const map = {};
    filtered.forEach((c) => {
      const acc = accounts.find((a) => a.id === c.accountId);
      const label = acc?.name || c.accountId || 'ไม่ทราบปลายทาง';
      map[label] = (map[label] || 0) + Number(c.amount || 0);
    });
    return Object.entries(map).map(([dest, total]) => ({ dest, total })).sort((a, b) => b.total - a.total);
  }, [contributions, summaryPeriod, summaryPeriodType, accounts]);
  const [destPopup, setDestPopup] = useState(null); // { label, items: [...] }
  const periodGrandTotal = bySourceThisPeriod.reduce((s, r) => s + r.total, 0);
  const [groupPopup, setGroupPopup] = useState(null); // { label, items: [...] }
  const [monthPopup, setMonthPopup] = useState(null); // month string, e.g. '2026-08'
  const groupedList = useMemo(() => {
    const ym = thisMonth();
    const thisMonthItems = contributions.filter((c) => c.date.startsWith(ym)).sort((a, b) => b.date.localeCompare(a.date));
    const older = contributions.filter((c) => !c.date.startsWith(ym));
    const groups = {};
    older.forEach((c) => {
      const key = `${c.source}__${c.accountId}__${monthKey(c.date)}`;
      if (!groups[key]) groups[key] = { source: c.source, accountId: c.accountId, month: monthKey(c.date), items: [] };
      groups[key].items.push(c);
    });
    const groupRows = Object.values(groups).sort((a, b) => b.month.localeCompare(a.month));
    const monthMap = {};
    groupRows.forEach((g) => {
      if (!monthMap[g.month]) monthMap[g.month] = { month: g.month, rows: [], total: 0, count: 0 };
      monthMap[g.month].rows.push(g);
      monthMap[g.month].total += g.items.reduce((s, it) => s + Number(it.amount || 0), 0);
      monthMap[g.month].count += g.items.length;
    });
    const monthGroups = Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month));
    return { thisMonthItems, groupRows, monthGroups };
  }, [contributions]);

  return (
    <div className="px-5 pt-5">
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เงินเข้าเดือนนี้รวม</p><p className="text-2xl mb-3">฿{fmt(thisMonthTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>วันที่</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน (บาท)</label>
        <NumInput value={amount} onChange={setAmount} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>มาจากแหล่งไหน</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">{SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <label className="text-xs" style={{ color: SLATE }}>ลงทุนเข้าบัญชีไหน</label>
        <AccountPickerWithCustom options={accounts.map((a) => ({ value: a.id, label: a.name }))} value={accountId} onChange={setAccountId} customList={customDestinationList} onAddCustom={onAddCustomDestination} />
        <div className="mb-3" />
        {isDime && <><label className="text-xs" style={{ color: SLATE }}>จำนวน USD ที่ซื้อได้ (ถ้ามี)</label><NumInput value={usdAmount} onChange={setUsdAmount} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" /></>}
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกเงินเข้า</button>
      </Card>
      <Card>
        <button onClick={() => setShowWithdraw(!showWithdraw)} className="w-full flex justify-between items-center text-sm font-semibold" style={{ color: INK }}>
          <span>💸 ถอนออกมาใช้ส่วนตัว</span><span style={{ color: SLATE }}>{showWithdraw ? '▲' : '▼'}</span>
        </button>
        {showWithdraw && (() => {
          function submitWithdraw() {
            if (!wdAmount || !wdAccountId) return;
            const acc = accounts.find((a) => a.id === wdAccountId);
            const destLabel = acc ? acc.name : wdAccountId;
            onAdd({ date: wdDate, amount: -Math.abs(Number(wdAmount)), source: 'personal_withdraw', accountId: wdAccountId, category: wdCategory, note: wdNote });
            if (onAddExpense) onAddExpense({ date: wdDate, amount: Math.abs(Number(wdAmount)), category: wdCategory, note: `ถอนจากเงินเก็บ${destLabel ? ' - ' + destLabel : ''}${wdNote ? ' · ' + wdNote : ''}` });
            setWdAmount(0); setWdNote(''); setShowWithdraw(false);
          }
          return (
            <div className="mt-3">
              <label className="text-xs" style={{ color: SLATE }}>วันที่</label>
              <input type="date" value={wdDate} onChange={(e) => setWdDate(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
              <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน (บาท)</label>
              <NumInput value={wdAmount} onChange={setWdAmount} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
              <label className="text-xs" style={{ color: SLATE }}>ถอนจากบัญชีไหน</label>
              <AccountPickerWithCustom options={accounts.map((a) => ({ value: a.id, label: a.name }))} value={wdAccountId} onChange={setWdAccountId} customList={customDestinationList} onAddCustom={onAddCustomDestination} />
              <div className="mb-3" />
              <label className="text-xs" style={{ color: SLATE }}>หมวดหมู่รายจ่าย (จะขึ้นในแท็บรายจ่ายด้วย)</label>
              <select value={wdCategory} onChange={(e) => setWdCategory(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">
                {(expenseCategories || ['อื่นๆ']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="text-xs" style={{ color: SLATE }}>โน้ต (ไม่บังคับ)</label>
              <input value={wdNote} onChange={(e) => setWdNote(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
              <button onClick={submitWithdraw} disabled={!wdAmount || !wdAccountId} style={{ background: BAD, opacity: (!wdAmount || !wdAccountId) ? 0.5 : 1 }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกการถอน</button>
            </div>
          );
        })()}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปแยกตามแหล่งที่มา</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setSummaryPeriodType('month')} style={{ background: summaryPeriodType === 'month' ? INK : PAPER_DIM, color: summaryPeriodType === 'month' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายเดือน</button>
          <button onClick={() => setSummaryPeriodType('year')} style={{ background: summaryPeriodType === 'year' ? INK : PAPER_DIM, color: summaryPeriodType === 'year' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายปี</button>
        </div>
        {summaryPeriods.length > 0 ? (
          <select value={summaryPeriod} onChange={(e) => setSummaryPeriod(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }}>{summaryPeriods.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        ) : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูล</p>}
        {bySourceThisPeriod.map((r) => (
          <div key={r.src} className="flex justify-between text-sm mb-1.5"><span>{r.label}</span><span>฿{fmt(r.total)}</span></div>
        ))}
        {summaryPeriod && <div className="flex justify-between text-sm font-semibold mt-2 pt-2" style={{ borderTop: '1px solid #E7EAF0' }}><span>รวมทั้งหมด</span><span>฿{fmt(periodGrandTotal)}</span></div>}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปแยกตามปลายทาง (ไปลงที่ไหนบ้าง)</p>
        {byDestinationThisPeriod.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูล</p>}
        {byDestinationThisPeriod.map((r) => {
          const items = contributions.filter((c) => summaryKeyFn(c.date) === summaryPeriod && ((accounts.find((a) => a.id === c.accountId)?.name || c.accountId || 'ไม่ทราบปลายทาง') === r.dest));
          return (
            <button key={r.dest} onClick={() => setDestPopup({ label: `${r.dest} · ${summaryPeriod}`, items })} className="w-full flex justify-between text-sm mb-1.5 text-left">
              <span>{r.dest}</span><span>฿{fmt(r.total)}</span>
            </button>
          );
        })}
        {summaryPeriod && byDestinationThisPeriod.length > 0 && <div className="flex justify-between text-sm font-semibold mt-2 pt-2" style={{ borderTop: '1px solid #E7EAF0' }}><span>รวมทั้งหมด</span><span>฿{fmt(byDestinationThisPeriod.reduce((s, r) => s + r.total, 0))}</span></div>}
      </Card>
      {destPopup && (
        <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
          <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">{destPopup.label}</p><button onClick={() => setDestPopup(null)}><X size={20} color={INK} /></button></div>
            {destPopup.items.sort((a, b) => b.date.localeCompare(a.date)).map((c) => {
              const src3 = SOURCES.find((s) => s.id === c.source);
              return <Card key={c.id}><div className="flex justify-between items-center"><div><p className="text-sm">{src3?.label || c.source}</p><p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(c.date)}</p></div><span className="text-sm">฿{fmt(c.amount)}</span></div></Card>;
            })}
          </div>
        </div>
      )}
      <p className="text-xs mb-2" style={{ color: SLATE }}>รายการล่าสุด (เดือนนี้)</p>
      {groupedList.thisMonthItems.length === 0 && <p className="text-xs mb-3" style={{ color: SLATE }}>ยังไม่มีรายการเดือนนี้</p>}
      {groupedList.thisMonthItems.map((c) => {
        const acc = accounts.find((a) => a.id === c.accountId); const src = SOURCES.find((s) => s.id === c.source);
        const destLabel = acc?.name || c.accountId || 'ไม่ทราบบัญชี';
        const isWithdraw = c.source === 'personal_withdraw';
        const isDividend = DIVIDEND_SOURCES.includes(c.source);
        return (
          <Card key={c.id} style={isWithdraw ? { background: BG_WITHDRAW } : isDividend ? { background: BG_DIVIDEND } : undefined}>
            <div className="flex justify-between items-center">
              <div><p className="text-sm">{isWithdraw ? '💸' : '💰'} {src?.label || c.source} → {destLabel}</p><p className="text-xs" style={{ color: SLATE }}>{c.date}{c.usdAmount ? ` · ${c.usdAmount} USD` : ''}{isWithdraw && c.category ? ` · ${c.category}` : ''}</p>{isWithdraw && c.note && <p className="text-xs" style={{ color: SLATE }}>{c.note}</p>}</div>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: isWithdraw ? BAD : GOOD }}>{isWithdraw ? '-' : '+'}฿{fmt(Math.abs(c.amount))}</span>
                {googleConnected && (
                  <button onClick={async () => {
                    setSyncingId(c.id);
                    const r = await onAddToCalendar(`เก็บเงิน ${src?.label || c.source} → ${destLabel}`, `จำนวน ฿${fmt(c.amount)}`, c.date, [0], c.calendarEventId);
                    setSyncMsg((prev) => ({ ...prev, [c.id]: r.ok ? 'เพิ่มลงปฏิทินสำเร็จ ✓' : `ไม่สำเร็จ: ${r.message}` }));
                    if (r.ok) onUpdate(c.id, { calendarSynced: true, calendarEventId: r.eventId });
                    setSyncingId(null);
                  }}>{syncingId === c.id ? <Loader2 size={14} className="animate-spin" color={BRASS} /> : <Calendar size={14} color={BRASS} />}</button>
                )}
                <EditButton onClick={() => setEditing(c)} />
                <button onClick={() => onRemove(c.id)}><Trash2 size={14} color={BAD} /></button>
              </div>
            </div>
            {syncMsg[c.id] ? (
              <p className="text-[11px] mt-1" style={{ color: syncMsg[c.id].includes('สำเร็จ') ? GOOD : BAD }}>{syncMsg[c.id]}</p>
            ) : (c.calendarSynced && <p className="text-[11px] mt-1" style={{ color: GOOD }}>เพิ่มลงปฏิทินไว้แล้ว ✓ (แก้ไขข้อมูลแล้วกดใหม่ได้ถ้าอยากอัปเดต)</p>)}
          </Card>
        );
      })}
      {groupedList.monthGroups.length > 0 && (
        <>
          <p className="text-xs mb-2 mt-4" style={{ color: SLATE }}>ประวัติเดือนก่อนๆ (แตะเพื่อดูรายเดือน)</p>
          {groupedList.monthGroups.map((mg) => (
            <button key={mg.month} onClick={() => setMonthPopup(mg.month)} className="w-full text-left" style={{ display: 'block' }}>
              <Card style={{ background: PAPER_DIM, borderLeft: `3px solid ${SLATE}` }}>
                <div className="flex justify-between items-center">
                  <div><p className="text-sm" style={{ color: SLATE }}>🗂️ {mg.month}</p><p className="text-xs" style={{ color: SLATE }}>{mg.count} รายการ · {mg.rows.length} หมวด</p></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold" style={{ color: SLATE }}>฿{fmt(mg.total)}</span><ChevronRight size={15} color={SLATE} /></div>
                </div>
              </Card>
            </button>
          ))}
        </>
      )}
      {monthPopup && (
        <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
          <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">🗂️ เดือน {monthPopup}</p><button onClick={() => setMonthPopup(null)}><X size={20} color={INK} /></button></div>
            {(groupedList.monthGroups.find((mg) => mg.month === monthPopup)?.rows || []).map((g) => {
              const acc = accounts.find((a) => a.id === g.accountId); const src = SOURCES.find((s) => s.id === g.source);
              const total = g.items.reduce((s, it) => s + Number(it.amount || 0), 0);
              return (
                <button key={`${g.source}__${g.accountId}__${g.month}`} onClick={() => setGroupPopup({ label: `${src?.label || g.source} → ${acc?.name || g.accountId || 'ไม่ทราบบัญชี'} · ${g.month}`, items: g.items })} className="w-full text-left" style={{ display: 'block' }}>
                  <Card>
                    <div className="flex justify-between items-center">
                      <div><p className="text-sm">{src?.label || g.source} → {acc?.name || g.accountId || 'ไม่ทราบบัญชี'}</p><p className="text-xs" style={{ color: SLATE }}>{g.items.length} รายการ</p></div>
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold">฿{fmt(total)}</span><ChevronRight size={15} color={SLATE} /></div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {groupPopup && (
        <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
          <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">{groupPopup.label}</p><button onClick={() => setGroupPopup(null)}><X size={20} color={INK} /></button></div>
            {groupPopup.items.sort((a, b) => b.date.localeCompare(a.date)).map((c) => {
              const acc2 = accounts.find((a) => a.id === c.accountId); const src2 = SOURCES.find((s) => s.id === c.source);
              const destLabel2 = acc2?.name || c.accountId || 'ไม่ทราบบัญชี';
              return (
                <Card key={c.id}>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm">{c.date}</p>{c.usdAmount ? <p className="text-xs" style={{ color: SLATE }}>{c.usdAmount} USD</p> : null}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">฿{fmt(c.amount)}</span>
                      {googleConnected && (
                        <button onClick={async () => {
                          setSyncingId(c.id);
                          const r = await onAddToCalendar(`เก็บเงิน ${src2?.label || c.source} → ${destLabel2}`, `จำนวน ฿${fmt(c.amount)}`, c.date, [0], c.calendarEventId);
                          setSyncMsg((prev) => ({ ...prev, [c.id]: r.ok ? 'เพิ่มลงปฏิทินสำเร็จ ✓' : `ไม่สำเร็จ: ${r.message}` }));
                          if (r.ok) onUpdate(c.id, { calendarSynced: true, calendarEventId: r.eventId });
                          setSyncingId(null);
                        }}>{syncingId === c.id ? <Loader2 size={14} className="animate-spin" color={BRASS} /> : <Calendar size={14} color={BRASS} />}</button>
                      )}
                      <EditButton onClick={() => { setEditing(c); setGroupPopup(null); }} />
                      <button onClick={() => { onRemove(c.id); setGroupPopup({ ...groupPopup, items: groupPopup.items.filter((x) => x.id !== c.id) }); }}><Trash2 size={14} color={BAD} /></button>
                    </div>
                  </div>
                  {syncMsg[c.id] ? (
                    <p className="text-[11px] mt-1" style={{ color: syncMsg[c.id].includes('สำเร็จ') ? GOOD : BAD }}>{syncMsg[c.id]}</p>
                  ) : (c.calendarSynced && <p className="text-[11px] mt-1" style={{ color: GOOD }}>เพิ่มลงปฏิทินไว้แล้ว ✓</p>)}
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {editing && (
        <EditModal title="แก้ไขเงินเข้า" onClose={() => setEditing(null)}
          initialValues={{ date: editing.date, amount: editing.amount, source: editing.source, accountId: editing.accountId, note: editing.note || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'source', label: 'แหล่งที่มา', type: 'select', options: SOURCES.map((s) => ({ value: s.id, label: s.label })) },
            { key: 'accountId', label: 'บัญชีปลายทาง', type: 'select-custom', options: accounts.map((a) => ({ value: a.id, label: a.name })), customList: customDestinationList, onAddCustom: onAddCustomDestination },
            ...(editing.source === 'personal_withdraw' ? [{ key: 'note', label: 'โน้ต (เอาไปทำอะไร)', type: 'text' }] : []),
          ]}
          onSave={(v) => {
            const oldAcc = accounts.find((a) => a.id === editing.accountId);
            const newAcc = accounts.find((a) => a.id === v.accountId);
            const oldSrc = editing.source === 'yieldtech' ? 'YieldTech' : (SOURCES.find((s) => s.id === editing.source)?.label || editing.source);
            const newSrc = v.source === 'yieldtech' ? 'YieldTech' : (SOURCES.find((s) => s.id === v.source)?.label || v.source);
            const amountChanged = Number(editing.amount || 0) !== Number(v.amount || 0);
            const changed = [];
            if (amountChanged) changed.push({ label: 'ยอด', value: `฿${fmt(editing.amount)} → ฿${fmt(v.amount)}` });
            if (editing.accountId !== v.accountId) changed.push({ label: 'ปลายทาง', value: `${oldAcc?.name || editing.accountId || '-'} → ${newAcc?.name || v.accountId || '-'}` });
            if (editing.source !== v.source) changed.push({ label: 'แหล่งที่มา', value: `${oldSrc} → ${newSrc}` });
            if (editing.date !== v.date) changed.push({ label: 'วันที่', value: `${formatDateDMY(editing.date)} → ${formatDateDMY(v.date)}` });
            if ((editing.note || '') !== (v.note || '')) changed.push({ label: 'โน้ต', value: `${editing.note || '-'} → ${v.note || '-'}` });
            // ระบุยอดเงิน+วันที่ของรายการไว้เสมอ (ใช้ยอด/วันที่เดิมเป็นตัวบอกว่าแก้ "รายการไหน" เผื่อวันนั้นมีหลายรายการ)
            if (changed.length) sendLineFlex(`แก้ไขเงินเข้า ฿${fmt(editing.amount)} (${oldSrc})`, buildFlexCard({
              title: `✏️ แก้ไขเงินเข้า (${oldSrc})`,
              rows: [{ label: 'รายการเดิม', value: `฿${fmt(editing.amount)} วันที่ ${formatDateDMY(editing.date)}` }, ...changed],
              tab: 'savings',
            }));
            onUpdate(editing.id, { date: v.date, amount: Number(v.amount) || 0, source: v.source, accountId: v.accountId, note: v.note });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function NewsTab({ news, accounts, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const items = (news && news.items) || [];
  const fetchedAt = news && news.fetchedAt;
  const isStale = !fetchedAt || (Date.now() - new Date(fetchedAt).getTime()) > 24 * 60 * 60 * 1000;

  function collectSymbols() {
    const set = new Set();
    (accounts || []).forEach((a) => (a.holdings || []).forEach((h) => { if (h.symbol) set.add(h.symbol.trim().toUpperCase()); }));
    return Array.from(set);
  }

  async function runFetch() {
    setLoading(true); setError('');
    try {
      const newItems = await fetchInvestmentNews(collectSymbols());
      onSaved(newItems);
    } catch (e) { setError('ดึงข่าวไม่สำเร็จ: ' + (e.message || 'ไม่ทราบสาเหตุ')); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    // ดึงข่าวใหม่อัตโนมัติทุกครั้งที่เข้าแท็บนี้ ถ้าข่าวที่มีอยู่เก่าเกิน 24 ชม. — แก้บั๊กเดิมที่เช็ค items.length === 0 ด้วย ทำให้พอมีข่าวแคชไว้แล้วครั้งแรก จะไม่มีวันดึงใหม่ให้เองอีกเลย
    if (isStale && !loading) runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toneColor = (t) => (t === 'positive' ? GOOD : t === 'negative' ? BAD : SLATE);
  const toneEmoji = (t) => (t === 'positive' ? '📈' : t === 'negative' ? '📉' : '📰');

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-base font-bold" style={{ color: INK }}>📰 ข่าวลงทุน</p>
          <p className="text-[10px]" style={{ color: SLATE }}>
            {fetchedAt ? `อัพเดตล่าสุด ${new Date(fetchedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}` : 'ยังไม่เคยดึงข่าว'}
          </p>
        </div>
        <button onClick={runFetch} disabled={loading} style={{ background: INK }} className="text-white rounded-lg px-3 py-2 text-xs flex items-center gap-1.5">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {loading ? 'กำลังค้นข่าว...' : 'รีเฟรช'}
        </button>
      </div>
      {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '10px 12px', fontSize: 11, color: '#991B1B' }} className="mb-3">⚠️ {error}</div>}
      {!loading && items.length === 0 && !error && <Card><p className="text-xs text-center py-4" style={{ color: SLATE }}>ยังไม่มีข่าว กด "รีเฟรช" เพื่อดึงข่าวล่าสุด</p></Card>}
      {items.map((it, idx) => (
        <Card key={idx}>
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-semibold flex-1 mr-2" style={{ color: INK }}>{toneEmoji(it.tone)} {it.headline}</p>
            {it.relatedSymbol && <span style={{ background: PAPER_DIM, color: BRASS }} className="text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0">{it.relatedSymbol}</span>}
          </div>
          <p className="text-xs" style={{ color: toneColor(it.tone) }}>{it.summary}</p>
          {it.date && <p className="text-[9px] mt-1" style={{ color: SLATE }}>{it.date}</p>}
        </Card>
      ))}
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
          <select value={i.tag || 'other'} onChange={(e) => onUpdate(i.id, { tag: e.target.value })} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-2 py-1 text-xs">{SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </Card>
      ))}
    </div>
  );
      }function ExpensesTab({ expenses, categories, onAdd, onRemove, onUpdate, onAddCategory, creditCards, onAddCreditCard, onUpdateCreditCard, onRemoveCreditCard, onAddCreditCardTransaction, onRemoveCreditCardTransaction, onUpdateCreditCardTransaction, onMatchCreditCard, googleConnected, onAddToCalendar }) {
  const [mainSection, setMainSection] = useState('cash');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(categories[0] || 'อื่นๆ');
  const [note, setNote] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [groupPopup, setGroupPopup] = useState(null);
  const [calViewDate, setCalViewDate] = useState(new Date());

  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceDraft, setVoiceDraft] = useState(null); // { amount, category, note, matchedCard }
  const recogRef = useRef(null);

  const receiptFileRef = useRef(null);
  const receiptGalleryRef = useRef(null);
  const [receiptScanning, setReceiptScanning] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [receiptDraft, setReceiptDraft] = useState(null); // array of {item, amount, category}
  const [receiptCardId, setReceiptCardId] = useState('');
  const [payWithCardId, setPayWithCardId] = useState(''); // '' = เงินสด, ไม่งั้นคือ id ของบัตรเครดิต

  const today = new Date().toISOString().slice(0, 10);

  function submitManual() {
    if (!amount) return;
    if (payWithCardId) {
      onAddCreditCardTransaction(payWithCardId, { date: today, amount, category, note });
    } else {
      onAdd({ date: today, amount, category, note });
    }
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
        const cardNames = (creditCards || []).map((c) => `${c.bankName || ''} ${c.cardName || ''}`.trim()).filter(Boolean);
        const parsed = await parseExpenseText(transcript, categories, cardNames);
        const matchedCard = onMatchCreditCard ? onMatchCreditCard(parsed.cardName) : null;
        setVoiceDraft({ amount: Number(parsed.amount) || 0, category: categories.includes(parsed.category) ? parsed.category : 'อื่นๆ', note: parsed.note || transcript, matchedCard });
      } catch (err) { setVoiceError('แปลงข้อความไม่สำเร็จ: ' + err.message); }
    };
    rec.onerror = () => { setListening(false); setVoiceError('ฟังเสียงไม่สำเร็จ ลองใหม่อีกครั้ง'); };
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    setListening(true);
    rec.start();
  }
  function confirmVoice() {
    if (voiceDraft.matchedCard) {
      onAddCreditCardTransaction(voiceDraft.matchedCard.id, { date: today, amount: voiceDraft.amount, category: voiceDraft.category, note: voiceDraft.note });
    } else {
      onAdd({ date: today, amount: voiceDraft.amount, category: voiceDraft.category, note: voiceDraft.note });
    }
    setVoiceDraft(null);
  }

  async function handleReceiptFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setReceiptScanning(true); setReceiptError(''); setReceiptDraft(null);
    try {
      const cardNames = (creditCards || []).map((c) => `${c.bankName || ''} ${c.cardName || ''}`.trim()).filter(Boolean);
      const result = await scanReceiptItems(file, cardNames);
      const items = result.items || result; // เผื่อ AI ตอบกลับมาเป็น array ตรงๆ แบบเก่า
      setReceiptDraft(items.map((it) => ({ item: it.item || 'รายการ', amount: Number(it.amount) || 0, category: categories[0] || 'อื่นๆ' })));
      const matchedCard = onMatchCreditCard ? onMatchCreditCard(result.cardName) : null;
      setReceiptCardId(matchedCard ? matchedCard.id : '');
    } catch (err) { setReceiptError('อ่านใบเสร็จไม่สำเร็จ: ' + err.message); }
    finally { setReceiptScanning(false); if (receiptFileRef.current) receiptFileRef.current.value = ''; }
  }
  function updateReceiptRow(idx, patch) { setReceiptDraft(receiptDraft.map((r, i) => (i === idx ? { ...r, ...patch } : r))); }
  function removeReceiptRow(idx) { setReceiptDraft(receiptDraft.filter((_, i) => i !== idx)); }
  function confirmReceipt() {
    // รวมทุกรายการในใบเสร็จเป็นรายจ่ายเดียว (ยอดรวม) แต่เก็บรายละเอียดแต่ละรายการไว้ใน items เผื่อต้องการดูแยก
    const total = receiptDraft.reduce((s, r) => s + Number(r.amount || 0), 0);
    const catCounts = {};
    receiptDraft.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const mainCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0] || (categories[0] || 'อื่นๆ');
    const combinedNote = receiptDraft.map((r) => `${r.item} ฿${fmt(r.amount)}`).join(', ');
    const record = { date: today, amount: total, category: mainCategory, note: combinedNote, items: receiptDraft };
    if (receiptCardId) onAddCreditCardTransaction(receiptCardId, record);
    else onAdd(record);
    setReceiptDraft(null); setReceiptCardId('');
  }

  const todayTotal = useMemo(() => expenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount || 0), 0), [expenses, today]);
  const [periodType, setPeriodType] = useState('month');
  const keyFn2 = periodType === 'month' ? monthKey : yearKey;
  const periods2 = useMemo(() => Array.from(new Set(expenses.map((e) => keyFn2(e.date)))).sort().reverse(), [expenses, periodType]);
  const [selPeriod2, setSelPeriod2] = useState('');
  useEffect(() => { setSelPeriod2(periods2[0] || ''); }, [periodType, periods2.length]);
  const periodExpenses = useMemo(() => expenses.filter((e) => keyFn2(e.date) === selPeriod2), [expenses, selPeriod2, periodType]);
  const periodExpenseTotal = periodExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  // รวมรายจ่ายเงินสด + รายการบัตรเครดิตทุกใบเป็นลิสต์เดียว ให้ "รายการล่าสุด" เห็นครบทั้งวันในที่เดียว ไม่ต้องสลับไปแท็บบัตรเครดิตแยก
  const combinedExpenses = useMemo(() => {
    const cash = expenses.map((e) => ({ ...e, _kind: 'cash' }));
    const card = [];
    (creditCards || []).forEach((c) => {
      (c.transactions || []).forEach((t) => {
        card.push({ ...t, _kind: 'card', _cardId: c.id, _cardLabel: c.cardName || c.bankName || 'บัตร' });
      });
    });
    return [...cash, ...card];
  }, [expenses, creditCards]);
  function removeCombinedItem(e) {
    if (e._kind === 'card') onRemoveCreditCardTransaction(e._cardId, e.id);
    else onRemove(e.id);
  }
  const byCategory = useMemo(() => {
    const map = {};
    periodExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount || 0); });
    return Object.entries(map).map(([cat, value]) => ({ cat, value, pct: periodExpenseTotal ? (value / periodExpenseTotal) * 100 : 0 })).sort((a, b) => b.value - a.value);
  }, [periodExpenses, periodExpenseTotal]);

  return (
    <div className="px-5 pt-5">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMainSection('cash')} style={{ background: mainSection === 'cash' ? INK : PAPER_DIM, color: mainSection === 'cash' ? 'white' : INK }} className="rounded-full px-4 py-2 text-xs font-medium">📅 ปฏิทิน &amp; รายจ่ายเงินสด</button>
        <button onClick={() => setMainSection('cards')} style={{ background: mainSection === 'cards' ? INK : PAPER_DIM, color: mainSection === 'cards' ? 'white' : INK }} className="rounded-full px-4 py-2 text-xs font-medium">💳 บัตรเครดิต</button>
      </div>
      {mainSection === 'cards' && (
        <CreditCardsSection creditCards={creditCards} onAddCard={onAddCreditCard} onUpdateCard={onUpdateCreditCard} onRemoveCard={onRemoveCreditCard}
          onAddTransaction={onAddCreditCardTransaction} onRemoveTransaction={onRemoveCreditCardTransaction} onUpdateTransaction={onUpdateCreditCardTransaction} />
      )}
      {mainSection === 'cash' && (
      <>
      <ExpenseMonthCalendar expenses={expenses} creditCards={creditCards} viewDate={calViewDate} onChangeViewDate={setCalViewDate} />
      <div className="relative mb-4">
        <Search size={15} color={SLATE} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={listSearch} onChange={(e) => setListSearch(e.target.value)} placeholder="ค้นหารายจ่าย (โน้ต/หมวดหมู่)..." style={{ border: '1px solid #E7EAF0' }} className="rounded-lg pl-9 pr-3 py-2.5 text-sm w-full" />
      </div>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>รายจ่ายวันนี้</p>
        <p className="text-2xl mb-3">฿{fmt(todayTotal)}</p>
        <label className="text-xs" style={{ color: SLATE }}>จำนวนเงิน</label>
        <NumInput value={amount} onChange={setAmount} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>หมวดหมู่</label>
        {!showNewCat ? (
          <div className="flex gap-2 mt-1 mb-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm flex-1">{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <button onClick={() => setShowNewCat(true)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 text-xs" >+ หมวดใหม่</button>
          </div>
        ) : (
          <div className="flex gap-2 mt-1 mb-3">
            <input value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder="ชื่อหมวดใหม่" style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm flex-1" />
            <button onClick={confirmNewCategory} style={{ background: INK }} className="text-white rounded-lg px-3 text-xs">เพิ่ม</button>
          </div>
        )}
        <label className="text-xs" style={{ color: SLATE }}>โน้ต (ไม่บังคับ)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ค่าข้าวเที่ยง" style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" />
        <label className="text-xs" style={{ color: SLATE }}>จ่ายด้วย</label>
        <select value={payWithCardId} onChange={(e) => setPayWithCardId(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3">
          <option value="">💵 เงินสด</option>
          {(creditCards || []).map((c) => <option key={c.id} value={c.id}>💳 {c.bankName} {c.cardName}</option>)}
        </select>
        <button onClick={submitManual} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm mb-2">บันทึกรายจ่าย</button>

        {voiceDraft ? (
          <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mb-2">
            <p className="text-xs mb-2" style={{ color: SLATE }}>ได้ยินว่า: ฿{fmt(voiceDraft.amount)} · {voiceDraft.category} · {voiceDraft.note}</p>
            {voiceDraft.matchedCard && <p className="text-xs mb-2 font-semibold" style={{ color: BRASS }}>💳 จะบันทึกเข้าบัตร {voiceDraft.matchedCard.bankName} {voiceDraft.matchedCard.cardName} (แยกจากรายจ่ายเงินสด)</p>}
            <div className="flex gap-2">
              <button onClick={confirmVoice} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยันบันทึก</button>
              <button onClick={() => setVoiceDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
            </div>
          </div>
        ) : (
          <button onClick={startVoice} disabled={listening} className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm mb-2" style={{ border: '1px solid #E7EAF0', color: listening ? SLATE : BAD }}>
            <Mic size={14} className={listening ? 'animate-pulse' : ''} /> {listening ? 'กำลังฟัง... พูดได้เลย' : 'พูดบันทึกรายจ่าย'}
          </button>
        )}
        {voiceError && <p className="text-xs mb-2" style={{ color: BAD }}>{voiceError}</p>}

        {receiptDraft ? (
          <div style={{ background: PAPER_DIM }} className="rounded-lg p-2">
            <p className="text-xs mb-2" style={{ color: SLATE }}>พบ {receiptDraft.length} รายการในใบเสร็จ — แก้ไขได้ทีละรายการ ตอนยืนยันจะรวมเป็นรายจ่ายเดียว (ยอดรวม ฿{fmt(receiptDraft.reduce((s, r) => s + Number(r.amount || 0), 0))}) แต่ยังเก็บรายละเอียดแต่ละรายการไว้ให้ดูย้อนหลังได้</p>
            <label className="text-[11px]" style={{ color: SLATE }}>จ่ายด้วย</label>
            <select value={receiptCardId} onChange={(e) => setReceiptCardId(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }}>
              <option value="">💵 เงินสด</option>
              {(creditCards || []).map((c) => <option key={c.id} value={c.id}>💳 {c.bankName} {c.cardName}</option>)}
            </select>
            {receiptCardId && <p className="text-[11px] mb-2 font-semibold" style={{ color: BRASS }}>🤖 AI ตรวจพบว่ารูดบัตรนี้จากสลิป — ปรับได้ถ้าไม่ตรง</p>}
            {receiptDraft.map((r, idx) => (
              <div key={idx} style={{ background: 'white' }} className="rounded-lg p-2 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <input value={r.item} onChange={(e) => updateReceiptRow(idx, { item: e.target.value })} className="text-xs flex-1 outline-none rounded px-2 py-1" style={{ border: '1px solid #E7EAF0' }} />
                  <button onClick={() => removeReceiptRow(idx)}><Trash2 size={12} color={BAD} /></button>
                </div>
                <div className="flex gap-2">
                  <NumInput value={r.amount} onChange={(v) => updateReceiptRow(idx, { amount: v })} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7EAF0' }} />
                  <select value={r.category} onChange={(e) => updateReceiptRow(idx, { category: e.target.value })} className="text-xs rounded px-2 py-1 flex-1" style={{ border: '1px solid #E7EAF0' }}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={confirmReceipt} style={{ background: INK }} className="text-white text-xs rounded px-3 py-1.5 flex-1">ยืนยัน (รวมเป็นรายการเดียว)</button>
              <button onClick={() => setReceiptDraft(null)} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded px-3 py-1.5">ยกเลิก</button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={receiptFileRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptFile} className="hidden" />
            <input ref={receiptGalleryRef} type="file" accept="image/*" onChange={handleReceiptFile} className="hidden" />
            <div className="flex gap-2">
              <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm" style={{ border: '1px solid #E7EAF0', color: BRASS }}>
                {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {receiptScanning ? 'กำลังอ่าน...' : 'ถ่ายรูปใบเสร็จ'}
              </button>
              <button onClick={() => receiptGalleryRef.current && receiptGalleryRef.current.click()} disabled={receiptScanning} className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm" style={{ border: '1px solid #E7EAF0', color: SLATE }}>
                <ImageIcon size={14} /> เลือกจากอัลบั้ม
              </button>
            </div>
            {receiptError && <p className="text-xs mt-2" style={{ color: BAD }}>{receiptError}</p>}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPeriodType('month')} style={{ background: periodType === 'month' ? INK : PAPER_DIM, color: periodType === 'month' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายเดือน</button>
          <button onClick={() => setPeriodType('year')} style={{ background: periodType === 'year' ? INK : PAPER_DIM, color: periodType === 'year' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายปี</button>
        </div>
        {periods2.length > 0 ? <select value={selPeriod2} onChange={(e) => setSelPeriod2(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full mb-3">{periods2.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลรายจ่าย</p>}
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
      {(() => {
        const searchActive = listSearch.trim().length > 0;
        const filtered = combinedExpenses.filter((e) => !searchActive || (e.category || '').toLowerCase().includes(listSearch.trim().toLowerCase()) || (e.note || '').toLowerCase().includes(listSearch.trim().toLowerCase()));
        if (searchActive) {
          // ค้นหาอยู่ -> โชว์แบบแบนเรียงตามปกติ ไม่ต้องจัดกลุ่ม
          return filtered.slice(0, 30).map((e) => (
            <Card key={`${e._kind}_${e.id}`} style={e._kind === 'card' ? { background: '#EFF6FF', border: '1px solid #BFDBFE' } : undefined}>
              <div className="flex justify-between items-center">
                <div><p className="text-sm">{e._kind === 'card' && <span style={{ color: '#2563EB' }}>💳 {e._cardLabel} · </span>}{e.category}{e.note ? ` · ${e.note}` : ''}</p><p className="text-xs" style={{ color: SLATE }}>{e.date}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm">฿{fmt(e.amount)}</span><EditButton onClick={() => setEditingExpense(e)} /><button onClick={() => removeCombinedItem(e)}><Trash2 size={14} color={BAD} /></button></div>
              </div>
            </Card>
          ));
        }
        const curMonth = thisMonth();
        const dayGroups = {}; // date -> items (only current month)
        const monthGroups = {}; // ym -> items (past months)
        filtered.forEach((e) => {
          if (monthKey(e.date) === curMonth) {
            (dayGroups[e.date] = dayGroups[e.date] || []).push(e);
          } else {
            (monthGroups[monthKey(e.date)] = monthGroups[monthKey(e.date)] || []).push(e);
          }
        });
        const dayKeys = Object.keys(dayGroups).sort().reverse();
        const monthKeys = Object.keys(monthGroups).sort().reverse();
        const rows = [];
        dayKeys.forEach((d) => rows.push({ type: 'day', key: d, items: dayGroups[d], total: dayGroups[d].reduce((s, e) => s + Number(e.amount || 0), 0) }));
        monthKeys.forEach((m) => rows.push({ type: 'month', key: m, items: monthGroups[m], total: monthGroups[m].reduce((s, e) => s + Number(e.amount || 0), 0) }));
        return rows.map((r) => {
          const hasCard = r.items.some((e) => e._kind === 'card');
          return (
            <Card key={r.key} style={hasCard ? { borderLeft: '3px solid #2563EB' } : undefined}>
              <button onClick={() => setGroupPopup(r)} className="w-full flex justify-between items-center">
                <div className="text-left"><p className="text-sm">{r.type === 'day' ? r.key : r.key}{hasCard && <span className="ml-1.5" style={{ color: '#2563EB' }}>💳</span>}</p><p className="text-xs" style={{ color: SLATE }}>{r.items.length} รายการ{r.type === 'month' ? ' (เดือนที่ผ่านมา)' : ''}</p></div>
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">฿{fmt(r.total)}</span><ChevronRight size={15} color={SLATE} /></div>
              </button>
            </Card>
          );
        });
      })()}
      {groupPopup && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={() => setGroupPopup(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, maxHeight: '85vh' }} className="w-full overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-base font-bold" style={{ color: INK }}>{groupPopup.key} · รวม ฿{fmt(groupPopup.total)}</p>
              <button onClick={() => setGroupPopup(null)}><X size={20} color={INK} /></button>
            </div>
            {[...groupPopup.items].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <div key={`${e._kind}_${e.id}`} className="flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg" style={{ borderTop: `1px solid ${BORDER}`, background: e._kind === 'card' ? '#EFF6FF' : 'transparent' }}>
                <div><p className="text-sm">{e._kind === 'card' && <span style={{ color: '#2563EB' }}>💳 {e._cardLabel} · </span>}{e.category}{e.note ? ` · ${e.note}` : ''}</p><p className="text-xs" style={{ color: SLATE }}>{e.date}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm">฿{fmt(e.amount)}</span><EditButton onClick={() => { setEditingExpense(e); }} /><button onClick={() => removeCombinedItem(e)}><Trash2 size={14} color={BAD} /></button></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {editingExpense && (
        <EditModal title={editingExpense._kind === 'card' ? `แก้ไขรายการบัตร (${editingExpense._cardLabel})` : 'แก้ไขรายจ่าย'} onClose={() => setEditingExpense(null)}
          initialValues={{ date: editingExpense.date, amount: editingExpense.amount, category: editingExpense.category, note: editingExpense.note || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'category', label: 'หมวดหมู่', type: 'select', options: categories },
            { key: 'note', label: 'โน้ต', type: 'text' },
          ]}
          onSave={(v) => {
            if (editingExpense._kind === 'card') onUpdateCreditCardTransaction(editingExpense._cardId, editingExpense.id, { date: v.date, amount: Number(v.amount) || 0, category: v.category, note: v.note });
            else onUpdate(editingExpense.id, { date: v.date, amount: Number(v.amount) || 0, category: v.category, note: v.note });
            setEditingExpense(null);
          }}
        />
      )}
      </>
      )}
    </div>
  );
}

function daysUntilGeneric(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
// คำนวณวันครบกำหนดจ่ายบัตรของรอบปัจจุบัน จาก dueDay (วันที่ในเดือน)
function nextCardDueDate(dueDay) {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), Number(dueDay || 15));
  if (due < now) due = new Date(now.getFullYear(), now.getMonth() + 1, Number(dueDay || 15));
  return due.toISOString().slice(0, 10);
}

// ปฏิทินรายจ่าย — วันที่มีรายจ่ายจะโชว์ตัวย่อธนาคาร/ชื่อบัตร (ถ้าจ่ายด้วยบัตร) หรือ 💵 พร้อมจำนวนเงิน (ถ้าจ่ายเงินสด)
function ExpenseMonthCalendar({ expenses, creditCards, viewDate, onChangeViewDate }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const allItems = [];
  (expenses || []).forEach((e) => allItems.push({ date: e.date, label: `${e.category}${e.note ? ' — ' + e.note : ''}`, amount: e.amount, source: 'cash' }));
  (creditCards || []).forEach((c) => {
    const cardLabel = c.cardName || c.bankName || 'บัตร';
    (c.transactions || []).forEach((t) => allItems.push({ date: t.date, label: `${cardLabel} — ${t.category}${t.note ? ' — ' + t.note : ''}`, amount: t.amount, source: 'card', cardLabel }));
  });

  const thisMonthItems = allItems.filter((it) => { const dd = new Date(it.date); return dd.getFullYear() === year && dd.getMonth() === month; });
  const eventsByDay = {};
  thisMonthItems.forEach((it) => { const day = new Date(it.date).getDate(); if (!eventsByDay[day]) eventsByDay[day] = []; eventsByDay[day].push(it); });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(firstWeekday).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => onChangeViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} color={SLATE} /></button>
        <p className="text-sm font-bold" style={{ color: INK }}>{THAI_MONTHS[month]} {year + 543}</p>
        <button onClick={() => onChangeViewDate(new Date(year, month + 1, 1))}><ChevronRight size={18} color={SLATE} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((d) => <p key={d} className="text-center text-[10px]" style={{ color: SLATE }}>{d}</p>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const dayEvents = day ? eventsByDay[day] : null;
          const hasEvents = dayEvents && dayEvents.length > 0;
          const isToday = day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          return (
            <div key={i} className="flex flex-col items-center pt-1" style={{ minHeight: 44, background: hasEvents ? '#F2761E14' : (isToday ? PAPER_DIM : 'transparent'), borderRadius: 10 }}>
              {day && <span className="text-[11px]" style={{ color: hasEvents ? BRASS : (isToday ? BRASS : INK), fontWeight: hasEvents || isToday ? 700 : 400 }}>{day}</span>}
              {hasEvents && (
                <div className="flex flex-col items-center" style={{ maxWidth: 44, lineHeight: 1.25 }}>
                  {dayEvents.map((e, ei) => <span key={ei} style={{ fontSize: 7.5 }}>{e.source === 'card' ? e.cardLabel : `💵${fmt(e.amount)}`}</span>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <span className="text-[10px]" style={{ color: SLATE }}>💳 ชื่อบัตร/ธนาคาร = จ่ายด้วยบัตรเครดิต</span>
        <span className="text-[10px]" style={{ color: SLATE }}>💵 จำนวนเงิน = จ่ายเงินสด</span>
      </div>
    </Card>
  );
}
function CreditCardsSection({ creditCards, onAddCard, onUpdateCard, onRemoveCard, onAddTransaction, onRemoveTransaction, onUpdateTransaction }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ bankName: '', cardName: '', last4: '', creditLimit: 0, statementDay: 1, dueDay: 15 });
  const cards = creditCards || [];
  const selected = cards.find((c) => c.id === selectedId);

  function submitAddCard() {
    if (!form.bankName) return;
    onAddCard({ ...form, reminderDays: [3, 1] });
    setForm({ bankName: '', cardName: '', last4: '', creditLimit: 0, statementDay: 1, dueDay: 15 });
    setShowAddForm(false);
  }

  if (selected) return <CreditCardDetail card={selected} onBack={() => setSelectedId(null)} onUpdateCard={onUpdateCard} onRemoveCard={(id) => { onRemoveCard(id); setSelectedId(null); }} onAddTransaction={onAddTransaction} onRemoveTransaction={onRemoveTransaction} onUpdateTransaction={onUpdateTransaction} googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} />;

  return (
    <div>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปยอดใช้จ่ายตามบัตรเครดิต</p>
        {cards.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบัตรเครดิต</p>}
        {cards.map((c, i) => {
          const ym = thisMonth();
          const monthTx = (c.transactions || []).filter((t) => monthKey(t.date) === ym);
          const spent = monthTx.reduce((s, t) => s + Number(t.amount || 0), 0);
          const pct = c.creditLimit ? Math.min(100, (spent / c.creditLimit) * 100) : 0;
          const dueDate = nextCardDueDate(c.dueDay);
          const daysToDue = daysUntilGeneric(dueDate);
          const dueSoon = daysToDue !== null && daysToDue <= 3;
          return (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className="w-full text-left mb-3 pb-3" style={{ borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold" style={{ color: INK }}>💳 {c.bankName} {c.cardName}</p>
                <ChevronRight size={15} color={SLATE} />
              </div>
              <p className="text-xs mb-1" style={{ color: SLATE }}>ใช้ไป ฿{fmt(spent)} จากวงเงิน ฿{fmt(c.creditLimit)}</p>
              <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden mb-1"><div style={{ width: `${pct}%`, background: pct >= 90 ? BAD : BRASS }} className="h-full rounded-full" /></div>
              <p className="text-[11px]" style={{ color: dueSoon ? BAD : SLATE }}>ครบกำหนดจ่าย: {dueDate} {daysToDue >= 0 ? `(อีก ${daysToDue} วัน)` : ''}</p>
            </button>
          );
        })}
      </Card>
      {showAddForm ? (
        <Card>
          <p className="text-xs mb-2" style={{ color: SLATE }}>เพิ่มบัตรเครดิตใหม่</p>
          <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="ธนาคาร เช่น TTB" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <input value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} placeholder="ชื่อบัตร เช่น All Free" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <input value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} placeholder="เลข 4 ตัวท้าย (ไม่บังคับ)" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>วงเงิน (บาท)</label>
          <NumInput value={form.creditLimit} onChange={(v) => setForm({ ...form, creditLimit: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันตัดยอด (วันที่ในเดือน)</label><NumInput value={form.statementDay} onChange={(v) => setForm({ ...form, statementDay: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
            <div><label className="text-[10px]" style={{ color: SLATE }}>วันครบกำหนดจ่าย</label><NumInput value={form.dueDay} onChange={(v) => setForm({ ...form, dueDay: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={submitAddCard} style={{ background: INK }} className="text-white text-sm rounded-lg py-2 flex-1">บันทึกบัตร</button>
            <button onClick={() => setShowAddForm(false)} style={{ border: '1px solid #E7EAF0' }} className="text-sm rounded-lg py-2 px-4">ยกเลิก</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="flex items-center justify-center gap-1 text-sm w-full py-2.5 rounded-lg mb-4" style={{ border: `1px dashed ${BRASS}`, color: BRASS }}><PlusCircle size={15} /> เพิ่มบัตรเครดิต</button>
      )}
    </div>
  );
}

function CreditCardDetail({ card, onBack, onUpdateCard, onRemoveCard, onAddTransaction, onRemoveTransaction, onUpdateTransaction, googleConnected, onAddToCalendar }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('อื่นๆ');
  const [note, setNote] = useState('');
  const [editingTx, setEditingTx] = useState(null);
  const [syncingDue, setSyncingDue] = useState(false);
  const [syncDueMsg, setSyncDueMsg] = useState('');
  const reminderDays = card.reminderDays || [3, 1];
  const dueDate = nextCardDueDate(card.dueDay);
  const daysToDue = daysUntilGeneric(dueDate);
  const ym = thisMonth();
  const monthTx = (card.transactions || []).filter((t) => monthKey(t.date) === ym);
  const spent = monthTx.reduce((s, t) => s + Number(t.amount || 0), 0);
  const pct = card.creditLimit ? Math.min(100, (spent / card.creditLimit) * 100) : 0;

  function toggleReminderDay(d) {
    onUpdateCard(card.id, { reminderDays: reminderDays.includes(d) ? reminderDays.filter((x) => x !== d) : [...reminderDays, d].sort((a, b) => a - b) });
  }
  async function syncDueReminder() {
    setSyncingDue(true); setSyncDueMsg('');
    const r = await onAddToCalendar(`ครบกำหนดจ่ายบัตร: ${card.bankName} ${card.cardName}`, `ยอดใช้เดือนนี้: ฿${fmt(spent)}`, dueDate, reminderDays, card.dueCalendarEventId);
    if (r.ok) { onUpdateCard(card.id, { dueCalendarEventId: r.eventId, dueCalendarSyncedFor: dueDate }); setSyncDueMsg('เพิ่มลงปฏิทินสำเร็จ ✓'); }
    else setSyncDueMsg(`ไม่สำเร็จ: ${r.message}`);
    setSyncingDue(false);
  }
  function submit() {
    if (!amount) return;
    onAddTransaction(card.id, { date: new Date().toISOString().slice(0, 10), amount, category, note });
    setAmount(0); setNote('');
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-xs mb-3" style={{ color: BRASS }}>‹ กลับไปดูทุกบัตร</button>
      <Card>
        <div className="flex justify-between items-center mb-2">
          <p className="text-base font-bold" style={{ color: INK }}>💳 {card.bankName} {card.cardName}</p>
          <button onClick={() => onRemoveCard(card.id)}><Trash2 size={16} color={BAD} /></button>
        </div>
        <p className="text-xs mb-1" style={{ color: SLATE }}>ใช้ไปเดือนนี้ ฿{fmt(spent)} จากวงเงิน ฿{fmt(card.creditLimit)}</p>
        <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden mb-2"><div style={{ width: `${pct}%`, background: pct >= 90 ? BAD : BRASS }} className="h-full rounded-full" /></div>
        <p className="text-xs" style={{ color: daysToDue <= 3 ? BAD : SLATE }}>ครบกำหนดจ่าย: {dueDate} {daysToDue >= 0 ? `(อีก ${daysToDue} วัน)` : ''}</p>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ตั้งค่าบัตร</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ธนาคาร</label><input value={card.bankName} onChange={(e) => onUpdateCard(card.id, { bankName: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ชื่อบัตร</label><input value={card.cardName} onChange={(e) => onUpdateCard(card.id, { cardName: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <label className="text-[10px]" style={{ color: SLATE }}>วงเงิน (บาท)</label>
        <NumInput value={card.creditLimit} onChange={(v) => onUpdateCard(card.id, { creditLimit: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันตัดยอด</label><NumInput value={card.statementDay} onChange={(v) => onUpdateCard(card.id, { statementDay: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันครบกำหนดจ่าย</label><NumInput value={card.dueDay} onChange={(v) => onUpdateCard(card.id, { dueDay: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <p className="text-[10px] mb-1" style={{ color: SLATE }}>เตือนล่วงหน้าก่อนวันจ่าย (วัน)</p>
        <div className="flex gap-2 flex-wrap mb-2">
          {[1, 2, 3, 7].map((d) => (
            <button key={d} onClick={() => toggleReminderDay(d)} style={{ background: reminderDays.includes(d) ? BRASS : PAPER_DIM, color: reminderDays.includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1 text-xs">{d} วัน</button>
          ))}
        </div>
        {googleConnected ? (
          <button onClick={syncDueReminder} disabled={syncingDue} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-xs">{syncingDue ? 'กำลังเพิ่ม...' : (card.dueCalendarEventId && card.dueCalendarSyncedFor === dueDate ? '🔄 อัพเดทในปฏิทิน' : '📅 เพิ่มลงปฏิทิน')}</button>
        ) : <p className="text-[11px]" style={{ color: SLATE }}>เชื่อมต่อ Google Calendar ที่ ⚙️ ตั้งค่า ก่อน ถึงจะเพิ่มเตือนลงปฏิทินได้</p>}
        {syncDueMsg && <p className="text-[11px] mt-1" style={{ color: syncDueMsg.includes('สำเร็จ') ? GOOD : BAD }}>{syncDueMsg}</p>}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>บันทึกรายจ่ายเข้าบัตรนี้</p>
        <NumInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="หมวดหมู่ เช่น อาหาร" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="โน้ต (ไม่บังคับ)" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกรายจ่าย</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติย้อนหลังบัตรนี้</p>
      {(card.transactions || []).map((t) => (
        <Card key={t.id}>
          <div className="flex justify-between items-center">
            <div><p className="text-sm">{t.category}{t.note ? ` · ${t.note}` : ''}</p><p className="text-xs" style={{ color: SLATE }}>{t.date}</p></div>
            <div className="flex items-center gap-3"><span className="text-sm">฿{fmt(t.amount)}</span><EditButton onClick={() => setEditingTx(t)} /><button onClick={() => onRemoveTransaction(card.id, t.id)}><Trash2 size={14} color={BAD} /></button></div>
          </div>
        </Card>
      ))}
      {(card.transactions || []).length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีรายการใช้จ่าย</p>}
      {editingTx && (
        <EditModal title="แก้ไขรายการ" onClose={() => setEditingTx(null)}
          initialValues={{ date: editingTx.date, amount: editingTx.amount, category: editingTx.category, note: editingTx.note || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'category', label: 'หมวดหมู่', type: 'text' },
            { key: 'note', label: 'โน้ต', type: 'text' },
          ]}
          onSave={(v) => { onUpdateTransaction(card.id, editingTx.id, { date: v.date, amount: Number(v.amount) || 0, category: v.category, note: v.note }); setEditingTx(null); }}
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
        {periods.length > 0 ? <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ border: '1px solid #E7EAF0' }} className="rounded-lg px-3 py-2 text-sm w-full">{periods.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลเงินเข้า</p>}
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
    if (d <= 7) insights.push({ tone: d < 0 ? 'warn' : 'info', text: d < 0 ? `ยาเห็บหมัดเลยกำหนดมา ${Math.abs(d)} วันแล้ว` : `ยาเห็บหมัดครบกำหนดในอีก ${d} วัน`, section: 'flea' });
  }
  (dog.appointments || []).forEach((a) => {
    const d = daysUntil(a.date);
    if (d !== null && d >= 0 && d <= 7) insights.push({ tone: 'info', text: `นัดหมายที่ ${a.hospital || '-'} อีก ${d} วัน`, section: 'appt' });
  });
  if (dog.insurance && dog.insurance.endDate) {
    const d = daysUntil(dog.insurance.endDate);
    if (d !== null && d >= 0 && d <= 30) insights.push({ tone: 'warn', text: `ประกันจะหมดอายุในอีก ${d} วัน`, section: 'insurance' });
  }
  const activeMeds = (dog.medications || []).filter((m) => !m.stopDate);
  if (activeMeds.length > 0) insights.push({ tone: 'info', text: `กำลังใช้ยาอยู่ ${activeMeds.length} รายการ: ${activeMeds.map((m) => m.name).join(', ')}`, section: 'meds' });
  if (insights.length === 0) insights.push({ tone: 'good', text: 'ไม่มีรายการที่ต้องระวังตอนนี้' });
  return insights;
}

function PetsTab({ dogs, onUpdateDog, onCopyToMultipleDogs, onAddWeight, onRemoveWeight, onUpdateWeight, onAddMedication, onUpdateMedication, onRemoveMedication, onLogFleaTick, onRemoveFleaTickHistory, onUpdateFleaTickHistory, onUpdateFleaTickInfo, onUpdateInsurance, onAddInsuranceClaim, onUpdateInsuranceClaim, onAddAppointment, onRemoveAppointment, onUpdateAppointment, onAddBloodTest, onUpdateBloodTest, onAddOrganExam, onUpdateOrganExam, onAddImaging, onUpdateImaging, onAddDogExpense, onRemoveDogExpense, onUpdateDogExpense, googleConnected, onAddToCalendar, hospitalList, onAddHospital, doctorList, onAddDoctor, weigherList, onAddWeigher, onRefreshShared, onSetDogPhoto, medicationList, onAddMedicationPreset, onAddGenericCalendarEvent, onAddMedicalPhoto, onRemoveMedicalPhoto, onUploadRecordPhoto, onAddPersonalExpense, expenseCategories, onAddVetVisit, onUpdateVetVisit, onRemoveVetVisit, onLinkRecordToVisit, onUnlinkRecordFromVisit, onAddInsuranceDocument, onRemoveInsuranceDocument, onCurrentPhotoChange, onRunHealthInsight, departmentList, onAddDepartment, doctorDepartments, onSetDoctorDepartment, bloodTestTypeList, onAddBloodTestType, organTypeList, onAddOrganType, imagingTypeList, onAddImagingType, onAddImagingWithOrgans, onAddAlbumPhoto, onRemoveAlbumPhoto }) {
  const [selectedId, setSelectedId] = useState(null); // null = หน้าปฏิทินรวม (ค่าเริ่มต้น) / มีค่า = กำลังดูลูกตัวนั้นอยู่
  const [section, setSection] = useState('overview');
  const dog = selectedId ? dogs.find((d) => d.id === selectedId) : null;
  useEffect(() => { if (onCurrentPhotoChange) onCurrentPhotoChange(dog?.photoUrl || null); }, [dog?.photoUrl, dog?.id]);
  const photoFileRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !dog) return;
    setPhotoUploading(true);
    try { await onSetDogPhoto(dog.id, file); } catch (err) { /* เงียบไว้ */ }
    finally { setPhotoUploading(false); if (photoFileRef.current) photoFileRef.current.value = ''; }
  }

  const sections = [
    { id: 'overview', label: 'ภาพรวม', icon: Home },
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'weight', label: 'น้ำหนัก', icon: Scale },
    { id: 'meds', label: 'ยา', icon: Syringe },
    { id: 'flea', label: 'เห็บหมัด', icon: Bug },
    { id: 'insurance', label: 'ประกัน', icon: Shield },
    { id: 'appt', label: 'นัดหมาย', icon: Calendar },
    { id: 'vetvisits', label: 'ไปหาหมอ', icon: Stethoscope },
    { id: 'records', label: 'ผลตรวจ', icon: ClipboardList },
    { id: 'expenses', label: 'ค่าใช้จ่าย', icon: Receipt },
    { id: 'album', label: 'อัลบั้ม', icon: Camera },
    { id: 'allreport', label: 'รายงานรวม', icon: BarChart3 },
  ];

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <span style={{ background: '#7C3AED14', color: '#7C3AED' }} className="text-[11px] font-medium px-2.5 py-1 rounded-full">🔗 ใช้ร่วมกับภรรยา</span>
        {onRefreshShared && <button onClick={onRefreshShared} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><RefreshCw size={12} /> รีเฟรช</button>}
      </div>
      <div className="flex gap-3 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {dogs.map((d) => (
          <button key={d.id} onClick={() => setSelectedId(d.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div style={{ boxShadow: d.id === selectedId ? `0 0 0 3px ${INK}` : 'none', borderRadius: '50%' }}>
              {d.photoUrl ? (
                <img src={d.photoUrl} alt={d.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div style={{ background: PAPER_DIM, color: SLATE }} className="w-14 h-14 rounded-full flex items-center justify-center"><Dog size={22} /></div>
              )}
            </div>
            <span style={{ color: d.id === selectedId ? INK : SLATE, fontWeight: d.id === selectedId ? 600 : 400 }} className="text-[11px] whitespace-nowrap">{d.name}</span>
          </button>
        ))}
      </div>

      {!dog && <AllDogsAppointmentsCalendar dogs={dogs} onJumpTo={(dogId) => { setSelectedId(dogId); setSection('appt'); }} />}

      {dog && (
        <>
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs font-semibold mb-3" style={{ color: BRASS }}>‹ ภาพรวมทุกตัว</button>
        <Card>
          <input ref={photoFileRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
          <div className="flex items-center gap-4">
            <button onClick={() => photoFileRef.current && photoFileRef.current.click()} className="relative flex-shrink-0">
              {dog.photoUrl ? (
                <img src={dog.photoUrl} alt={dog.name} className="w-18 h-18 rounded-full object-cover" style={{ width: 72, height: 72 }} />
              ) : (
                <div style={{ background: PAPER_DIM, color: SLATE }} className="rounded-full flex items-center justify-center" style={{ width: 72, height: 72 }}>
                  {photoUploading ? <Loader2 size={22} className="animate-spin" /> : <Dog size={28} />}
                </div>
              )}
              <div style={{ background: INK }} className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center">
                <Camera size={12} color="white" />
              </div>
            </button>
            <div>
              <p className="text-lg font-bold" style={{ color: INK }}>{dog.name}</p>
              <p className="text-xs" style={{ color: SLATE }}>{dog.breed || 'ยังไม่ระบุพันธุ์'}</p>
            </div>
          </div>
        </Card>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button key={s.id} onClick={() => setSection(s.id)} className="flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: active ? BRASS : PAPER_DIM }}>
              <Icon size={17} color={active ? 'white' : SLATE} />
              <span style={{ color: active ? 'white' : SLATE, fontWeight: active ? 600 : 400 }} className="text-[9.5px] leading-tight text-center px-0.5">{s.label}</span>
            </button>
          );
        })}
      </div>

      {section === 'allreport' ? (
        <AllDogsReportSection dogs={dogs} />
      ) : (
        <>
          {section === 'overview' && <DogOverviewSection dog={dog} setSection={setSection} onRunHealthInsight={onRunHealthInsight} />}
          {section === 'profile' && <DogProfileSection dog={dog} onUpdateDog={onUpdateDog} dogs={dogs} onCopyToMultipleDogs={onCopyToMultipleDogs} />}
          {section === 'weight' && <DogWeightSection dog={dog} onAddWeight={onAddWeight} onRemoveWeight={onRemoveWeight} onUpdateWeight={onUpdateWeight} hospitalList={hospitalList} onAddHospital={onAddHospital} weigherList={weigherList} onAddWeigher={onAddWeigher} onUploadRecordPhoto={onUploadRecordPhoto} onAddMedicalPhoto={onAddMedicalPhoto} onRemoveMedicalPhoto={onRemoveMedicalPhoto} />}
          {section === 'meds' && <DogMedicationSection dog={dog} onAddMedication={onAddMedication} onUpdateMedication={onUpdateMedication} onRemoveMedication={onRemoveMedication} medicationList={medicationList} onAddMedicationPreset={onAddMedicationPreset} onUploadRecordPhoto={onUploadRecordPhoto} onRemoveMedicalPhoto={onRemoveMedicalPhoto} doctorList={doctorList} onAddDoctor={onAddDoctor} hospitalList={hospitalList} onAddHospital={onAddHospital} />}
          {section === 'flea' && <DogFleaTickSection dog={dog} onLogFleaTick={onLogFleaTick} onRemoveFleaTickHistory={onRemoveFleaTickHistory} onUpdateFleaTickHistory={onUpdateFleaTickHistory} onUpdateFleaTickInfo={onUpdateFleaTickInfo} googleConnected={googleConnected} onAddGenericCalendarEvent={onAddGenericCalendarEvent} dogs={dogs} onCopyToMultipleDogs={onCopyToMultipleDogs} />}
          {section === 'insurance' && <DogInsuranceSection dog={dog} onUpdateInsurance={onUpdateInsurance} onAddInsuranceClaim={onAddInsuranceClaim} onUpdateInsuranceClaim={onUpdateInsuranceClaim} dogs={dogs} onCopyToMultipleDogs={onCopyToMultipleDogs} onAddInsuranceDocument={onAddInsuranceDocument} onRemoveInsuranceDocument={onRemoveInsuranceDocument} />}
          {section === 'appt' && <DogAppointmentsSection dog={dog} onAddAppointment={onAddAppointment} onRemoveAppointment={onRemoveAppointment} onUpdateAppointment={onUpdateAppointment} googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} hospitalList={hospitalList} onAddHospital={onAddHospital} doctorList={doctorList} onAddDoctor={onAddDoctor} onAddMedicalPhoto={onAddMedicalPhoto} onRemoveMedicalPhoto={onRemoveMedicalPhoto} onUploadRecordPhoto={onUploadRecordPhoto} />}
          {section === 'vetvisits' && <DogVetVisitsSection dog={dog} hospitalList={hospitalList} onAddHospital={onAddHospital} doctorList={doctorList} onAddDoctor={onAddDoctor} departmentList={departmentList} onAddDepartment={onAddDepartment} doctorDepartments={doctorDepartments} onSetDoctorDepartment={onSetDoctorDepartment} weigherList={weigherList} medicationList={medicationList} onAddMedicationPreset={onAddMedicationPreset} onUpdateDog={onUpdateDog} onUpdateVetVisit={onUpdateVetVisit} onRemoveVetVisit={onRemoveVetVisit} onLinkRecordToVisit={onLinkRecordToVisit} onUnlinkRecordFromVisit={onUnlinkRecordFromVisit} onUploadRecordPhoto={onUploadRecordPhoto} setSection={setSection} bloodTestTypeList={bloodTestTypeList} onAddBloodTestType={onAddBloodTestType} organTypeList={organTypeList} onAddOrganType={onAddOrganType} imagingTypeList={imagingTypeList} onAddImagingType={onAddImagingType} onAddOrganExam={onAddOrganExam} />}
          {section === 'records' && <DogMedicalRecordsSection dog={dog} onAddBloodTest={onAddBloodTest} onUpdateBloodTest={onUpdateBloodTest} onAddOrganExam={onAddOrganExam} onUpdateOrganExam={onUpdateOrganExam} onAddImaging={onAddImaging} onUpdateImaging={onUpdateImaging} onAddMedicalPhoto={onAddMedicalPhoto} onRemoveMedicalPhoto={onRemoveMedicalPhoto} onUploadRecordPhoto={onUploadRecordPhoto} bloodTestTypeList={bloodTestTypeList} onAddBloodTestType={onAddBloodTestType} organTypeList={organTypeList} onAddOrganType={onAddOrganType} imagingTypeList={imagingTypeList} onAddImagingType={onAddImagingType} onAddImagingWithOrgans={onAddImagingWithOrgans} />}
          {section === 'expenses' && <DogExpensesSection dog={dog} onAddDogExpense={onAddDogExpense} onRemoveDogExpense={onRemoveDogExpense} onUpdateDogExpense={onUpdateDogExpense} hospitalList={hospitalList} onAddHospital={onAddHospital} onAddPersonalExpense={onAddPersonalExpense} expenseCategories={expenseCategories} onUploadRecordPhoto={onUploadRecordPhoto} />}
          {section === 'album' && <DogAlbumSection dog={dog} onAddAlbumPhoto={onAddAlbumPhoto} onRemoveAlbumPhoto={onRemoveAlbumPhoto} />}
        </>
      )}
      </>
      )}
    </div>
  );
}

// นัดหมายรวมทุกตัว — ไม่ต้องเปิดทีละตัวเพื่อดู เรียงตามวันที่ใกล้สุด ไม่จำกัดจำนวน/ไม่จำกัดช่วงเวลา
const PET_EVENT_ICONS = { appt: '📅', weight: '⚖️', blood: '🩸', imaging: '🩻', organ: '👁️' };
// คำย่อชื่อลูกๆ สำหรับโชว์ในปฏิทิน — เช็คคำที่ระบุไว้ก่อน แล้วค่อย fallback เป็นชื่อเต็ม
function dogAbbrev(name) {
  const n = name || '';
  const knownMap = [['เป๋าตุง', 'เป๋า'], ['ถุงทอง', 'ถุง'], ['หญิงเล็ก', 'หญิง'], ['ขวานฟ้า', 'ขวาน'], ['โยกเยก', 'โยก'], ['คัตโตะ', 'พัต'], ['หนึ่งหนึ่ง', 'หนึ่ง'], ['ตุ้มแต้ม', 'แต้ม']];
  for (const [keyword, abbrev] of knownMap) { if (n === keyword || n.includes(keyword)) return abbrev; }
  return n.slice(0, 3);
}
function imagingBadge(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('mri')) return 'MRI';
  if (t.includes('ct')) return 'CT';
  if (t.includes('ultrasound') || t.includes('อัลตราซาวด์') || t.includes('us')) return 'US';
  if (t.includes('x-ray') || t.includes('xray') || t.includes('เอกซเรย์')) return 'X-ray';
  return '🩻';
}
function eventBadge(it) {
  if (it.type === 'imaging') return imagingBadge(it.label);
  return PET_EVENT_ICONS[it.type];
}
function AllDogsAppointmentsCalendar({ dogs, onJumpTo }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // รวมเหตุการณ์สำคัญของลูกๆ ทุกตัว — นัดหมาย/น้ำหนัก/ผลเลือด/Imaging/อวัยวะ (รวมตรวจตา)
  const allItems = [];
  (dogs || []).forEach((d) => {
    (d.appointments || []).forEach((a) => allItems.push({ dogId: d.id, dogName: d.name, dogPhoto: d.photoUrl, date: a.date, time: a.time, label: a.purpose || 'นัดหมาย', sub: a.hospital, type: 'appt' }));
    (d.weights || []).forEach((w) => allItems.push({ dogId: d.id, dogName: d.name, dogPhoto: d.photoUrl, date: w.date, label: `ชั่งน้ำหนัก — ${w.weight} กก.`, type: 'weight' }));
    (d.bloodTests || []).forEach((b) => allItems.push({ dogId: d.id, dogName: d.name, dogPhoto: d.photoUrl, date: b.date, label: `ตรวจเลือด${b.type ? ' — ' + b.type : ''}`, type: 'blood' }));
    (d.imaging || []).forEach((im) => allItems.push({ dogId: d.id, dogName: d.name, dogPhoto: d.photoUrl, date: im.date, label: im.type || 'Imaging', type: 'imaging' }));
    (d.organExams || []).forEach((o) => allItems.push({ dogId: d.id, dogName: d.name, dogPhoto: d.photoUrl, date: o.date, label: `ตรวจอวัยวะ — ${o.organ || ''}`, type: 'organ' }));
  });
  allItems.sort((a, b) => a.date.localeCompare(b.date));

  const thisMonthItems = allItems.filter((it) => { const dd = new Date(it.date); return dd.getFullYear() === year && dd.getMonth() === month; });
  const eventsByDay = {};
  thisMonthItems.forEach((it) => { const day = new Date(it.date).getDate(); if (!eventsByDay[day]) eventsByDay[day] = []; eventsByDay[day].push(it); });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(firstWeekday).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  const filteredMonthItems = filterType === 'all' ? thisMonthItems : thisMonthItems.filter((it) => it.type === filterType);
  const today = new Date();
  const monthExpenseTotal = (dogs || []).reduce((sum, d) => sum + (d.expenses || []).filter((e) => { const dd = new Date(e.date); return dd.getFullYear() === year && dd.getMonth() === month; }).reduce((s, e) => s + Number(e.amount || 0), 0), 0);

  return (
    <div>
      <Card>
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} color={SLATE} /></button>
          <p className="text-sm font-bold" style={{ color: INK }}>{THAI_MONTHS[month]} {year + 543}</p>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={18} color={SLATE} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((d) => <p key={d} className="text-center text-[10px]" style={{ color: SLATE }}>{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const dayEvents = day ? eventsByDay[day] : null;
            const hasEvents = dayEvents && dayEvents.length > 0;
            const isToday = day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            return (
              <div key={i} className="flex flex-col items-center pt-1" style={{ minHeight: 44, background: hasEvents ? '#F2761E14' : (isToday ? PAPER_DIM : 'transparent'), borderRadius: 10 }}>
                {day && <span className="text-[11px]" style={{ color: hasEvents ? BRASS : (isToday ? BRASS : INK), fontWeight: hasEvents || isToday ? 700 : 400 }}>{day}</span>}
                {hasEvents && (
                  <div className="flex flex-col items-center" style={{ maxWidth: 40, lineHeight: 1.25 }}>
                    {dayEvents.map((e, ei) => <span key={ei} style={{ fontSize: 8 }}>{dogAbbrev(e.dogName)}{eventBadge(e)}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="text-[10px]" style={{ color: SLATE }}>📅 นัดหมาย</span>
          <span className="text-[10px]" style={{ color: SLATE }}>⚖️ น้ำหนัก</span>
          <span className="text-[10px]" style={{ color: SLATE }}>🩸 ผลเลือด</span>
          <span className="text-[10px]" style={{ color: SLATE }}>MRI/CT/US/X-ray</span>
          <span className="text-[10px]" style={{ color: SLATE }}>👁️ อวัยวะ/ตา</span>
        </div>
      </Card>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button onClick={() => setFilterType('all')} style={{ background: filterType === 'all' ? BRASS : PAPER_DIM, color: filterType === 'all' ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs">ทั้งหมด</button>
        {[{ k: 'appt', l: 'นัดหมาย' }, { k: 'weight', l: 'น้ำหนัก' }, { k: 'blood', l: 'ผลเลือด' }, { k: 'imaging', l: 'Imaging' }, { k: 'organ', l: 'อวัยวะ/ตา' }].map((t) => (
          <button key={t.k} onClick={() => setFilterType(t.k)} style={{ background: filterType === t.k ? BRASS : PAPER_DIM, color: filterType === t.k ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs whitespace-nowrap">{PET_EVENT_ICONS[t.k]} {t.l}</button>
        ))}
      </div>

      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>รายการแจ้งเตือนเดือนนี้</p>
        {filteredMonthItems.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ไม่มีรายการ</p>}
        {filteredMonthItems.map((it, i) => {
          const d_ = daysUntil(it.date);
          const isFuture = d_ !== null && d_ >= 0 && new Date(it.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button key={i} onClick={() => onJumpTo(it.dogId)} className="w-full text-left flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              {it.dogPhoto ? <img src={it.dogPhoto} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" /> : <div style={{ background: PAPER_DIM }} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"><Dog size={16} color={SLATE} /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: INK }}>{PET_EVENT_ICONS[it.type]} {it.dogName} — {it.label}</p>
                <p className="text-xs" style={{ color: isFuture ? GOOD : SLATE }}>{formatDateDMY(it.date)} {it.time || ''}{isFuture ? ` (อีก ${d_} วัน)` : ''}{it.sub ? ` · ${it.sub}` : ''}</p>
              </div>
              <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </Card>

      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>สรุปเดือนนี้</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="ลูกๆ ทั้งหมด" value={`${(dogs || []).length} ตัว`} />
          <StatBox label="ค่าใช้จ่ายเดือนนี้" value={`฿${fmt(monthExpenseTotal)}`} />
        </div>
      </Card>
    </div>
  );
}

function RealEstateTab({ properties, onUpdate, onAdd, onRemove, onTogglePayment, onAddTransaction, onRemoveTransaction, onAddRepair, onRemoveRepair, onAddPhoto, onRemovePhoto, onAddDocument, onRemoveDocument, onAddRentInstallment, onRemoveRentInstallment, onUpdateRentInstallment, onSetRentManualConfirm, accounts, googleConnected, onAddToCalendar, onRefreshShared, onCurrentPhotoChange }) {
  const [section, setSection] = useState('overview');
  const [selectedId, setSelectedId] = useState(properties[0]?.id || '');
  const selected = properties.find((p) => p.id === selectedId) || properties[0];
  useEffect(() => { if (onCurrentPhotoChange) onCurrentPhotoChange((selected?.photos && selected.photos[0]?.url) || null); }, [selected?.id, selected?.photos]);

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <span style={{ background: '#D9770614', color: '#D97706' }} className="text-[11px] font-medium px-2.5 py-1 rounded-full">🔗 ใช้ร่วมกับภรรยา</span>
        {onRefreshShared && <button onClick={onRefreshShared} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><RefreshCw size={12} /> รีเฟรช</button>}
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: 'overview', l: 'ภาพรวม' }, { id: 'properties', l: 'ทรัพย์สิน' }, { id: 'collection', l: 'รับเงิน' }, { id: 'calendar', l: 'ปฏิทิน' }].map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? INK : PAPER_DIM, color: section === s.id ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-4 py-2 text-xs font-medium">{s.l}</button>
        ))}
      </div>
      {section === 'overview' && (
        <>
          <RealEstateCalendarSection properties={properties} googleConnected={googleConnected} onSelectProperty={(id) => { setSelectedId(id); setSection('properties'); }} />
          <RealEstateOverview properties={properties} onSelectProperty={(id) => { setSelectedId(id); setSection('properties'); }} />
        </>
      )}
      {section === 'properties' && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {properties.map((p) => (
              <button key={p.id} onClick={() => setSelectedId(p.id)} style={{ background: selectedId === p.id ? BRASS : PAPER_DIM, color: selectedId === p.id ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs whitespace-nowrap">{p.name}</button>
            ))}
            <button onClick={() => onAdd({ name: 'ทรัพย์สินใหม่' })} style={{ color: BRASS, flexShrink: 0 }} className="flex items-center gap-1 text-xs"><PlusCircle size={14} /> เพิ่ม</button>
          </div>
          {selected && <PropertyDetail property={selected} onUpdate={onUpdate} onRemove={onRemove} onAddTransaction={onAddTransaction} onRemoveTransaction={onRemoveTransaction} onAddRepair={onAddRepair} onRemoveRepair={onRemoveRepair} onAddPhoto={onAddPhoto} onRemovePhoto={onRemovePhoto} onAddDocument={onAddDocument} onRemoveDocument={onRemoveDocument} onAddRentInstallment={onAddRentInstallment} onRemoveRentInstallment={onRemoveRentInstallment} onUpdateRentInstallment={onUpdateRentInstallment} onSetRentManualConfirm={onSetRentManualConfirm} accounts={accounts} googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} />}
        </>
      )}
      {section === 'collection' && <RentCollectionMatrix properties={properties} onTogglePayment={onTogglePayment} />}
      {section === 'calendar' && <RealEstateCalendarSection properties={properties} googleConnected={googleConnected} onSelectProperty={(id) => { setSelectedId(id); setSection('properties'); }} />}
    </div>
  );
}

function RealEstateOverview({ properties, onSelectProperty }) {
  const totalValue = properties.reduce((s, p) => s + Number(p.purchasePrice || 0), 0);
  const totalRent = properties.reduce((s, p) => s + (p.status === 'occupied' ? Number(p.rent || 0) : 0), 0);
  const ym = thisMonth();
  const collected = properties.reduce((s, p) => { const pay = (p.payments || {})[ym]; return s + (pay && pay.paid ? Number(pay.amount || p.rent || 0) : 0); }, 0);
  const outstanding = Math.max(0, totalRent - collected);
  const occupiedCount = properties.filter((p) => p.status === 'occupied').length;
  const occupancy = properties.length ? (occupiedCount / properties.length) * 100 : 0;

  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');
  async function runAi() {
    setAiLoading(true); setAiError('');
    try {
      const detail = properties.map((p) => {
        const pay = (p.payments || {})[ym];
        return `${p.name}: ค่าเช่า ${p.rent} บาท สถานะ ${p.status === 'occupied' ? 'มีผู้เช่า' : 'ว่าง'} เดือนนี้${pay && pay.paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}`;
      }).join('\n');
      const prompt = `คุณเป็นผู้ช่วยวิเคราะห์การปล่อยเช่าอสังหาริมทรัพย์ นี่คือข้อมูลทรัพย์สินทั้งหมด:\n${detail}\nรวมค่าเช่าที่ควรได้เดือนนี้ ${fmt(totalRent)} บาท เก็บได้แล้ว ${fmt(collected)} บาท ค้างชำระ ${fmt(outstanding)} บาท\nช่วยวิเคราะห์สั้นๆ ภาษาไทยไม่เกิน 150 คำ ว่ามีจุดไหนน่าเป็นห่วง (เช่น ห้องไหนค้างชำระ ห้องไหนว่าง) และคำแนะนำ`;
      const text = await askServer(prompt);
      setAiText(text || 'ไม่สามารถวิเคราะห์ได้ในขณะนี้');
    } catch (e) { setAiError('เกิดข้อผิดพลาด: ' + e.message); } finally { setAiLoading(false); }
  }

  const pieData = properties.filter((p) => p.status === 'occupied').map((p, i) => ({ name: p.name, value: Number(p.rent || 0), color: PIE_COLORS[i % PIE_COLORS.length] }));

  return (
    <div>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>อสังหาทั้งหมด {properties.length} แห่ง</p>
        <p className="text-xs mb-1" style={{ color: SLATE }}>มูลค่ารวม</p>
        <p className="text-2xl font-bold mb-3" style={{ color: INK }}>฿{fmt(totalValue)}</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="ค่าเช่าเดือนนี้" value={`฿${fmt(totalRent)}`} />
          <StatBox label="Occupancy" value={`${occupancy.toFixed(0)}%`} color={GOOD} />
          <StatBox label="เก็บแล้ว" value={`฿${fmt(collected)}`} color={GOOD} />
          <StatBox label="ค้างชำระ" value={`฿${fmt(outstanding)}`} color={outstanding > 0 ? BAD : GOOD} />
        </div>
      </Card>
      {pieData.length > 0 && (
        <Card>
          <p className="text-xs mb-3" style={{ color: SLATE }}>สัดส่วนรายได้ค่าเช่าแต่ละแห่ง</p>
          <div style={{ width: '100%', height: 180 }}><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={(v) => `฿${fmt(v)}`} /></PieChart></ResponsiveContainer></div>
        </Card>
      )}
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>ทรัพย์สินของฉัน</p>
        {properties.map((p, i) => {
          const pay = (p.payments || {})[ym];
          const paid = pay && pay.paid;
          const thumb = (p.photos || [])[0];
          return (
            <button key={p.id} onClick={() => onSelectProperty(p.id)} className="w-full flex justify-between items-center py-2.5" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div className="flex items-center gap-3 text-left">
                {thumb ? (
                  <img src={thumb.url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div style={{ background: PAPER_DIM, color: SLATE }} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"><Home size={18} /></div>
                )}
                <div><p className="text-sm font-medium" style={{ color: INK }}>{p.name}</p><p className="text-xs" style={{ color: SLATE }}>฿{fmt(p.rent)}/เดือน</p></div>
              </div>
              <span style={{ background: p.status !== 'occupied' ? '#D9770614' : (paid ? '#16A34A14' : '#DC262614'), color: p.status !== 'occupied' ? WARN : (paid ? GOOD : BAD) }} className="text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0">{p.status !== 'occupied' ? 'ว่าง' : (paid ? 'เก็บแล้ว' : 'ค้างชำระ')}</span>
            </button>
          );
        })}
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-3"><Sparkles size={16} color={BRASS} /><p className="text-sm font-semibold" style={{ color: INK }}>AI วิเคราะห์</p></div>
        <button onClick={runAi} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm flex items-center justify-center gap-2">{aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} color="#FBBF24" />}{aiLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์เดือนนี้'}</button>
        {(aiText || aiError) && <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-3 mt-3 text-sm whitespace-pre-wrap">{aiError ? <span style={{ color: BAD }}>{aiError}</span> : aiText}</div>}
      </Card>
    </div>
  );
}

function PropertyDetail({ property: p, onUpdate, onRemove, onAddTransaction, onRemoveTransaction, onAddRepair, onRemoveRepair, onAddPhoto, onRemovePhoto, onAddDocument, onRemoveDocument, onAddRentInstallment, onRemoveRentInstallment, onUpdateRentInstallment, onSetRentManualConfirm, accounts, googleConnected, onAddToCalendar }) {
  const [sub, setSub] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const heroPhoto = p.photos && p.photos[0] && p.photos[0].url;
  const ym = thisMonth();
  const monthTx = (p.transactions || []).filter((t) => monthKey(t.date) === ym);
  const pay = (p.payments || {})[ym];
  const rentIncome = pay && pay.paid ? Number(pay.amount || p.rent || 0) : 0;
  const extraIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
  const netProfit = rentIncome + extraIncome - totalExpense;
  const recentRepairs = [...(p.repairs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const daysToContractEnd = p.contractEndDate ? daysUntil(p.contractEndDate) : null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <input value={p.name} onChange={(e) => onUpdate(p.id, { name: e.target.value })} className="text-base font-bold flex-1 outline-none" style={{ border: 'none', color: INK }} />
        <button onClick={() => onRemove(p.id)}><Trash2 size={16} color={BAD} /></button>
      </div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[{ id: 'info', l: 'ข้อมูล' }, { id: 'rent', l: 'รับเงิน' }, { id: 'money', l: 'รายรับจ่าย' }, { id: 'repairs', l: 'ซ่อม' }, { id: 'roi', l: 'ROI' }, { id: 'docs', l: 'เอกสาร' }].map((s) => (
          <button key={s.id} onClick={() => { setSub(s.id); setEditMode(false); }} style={{ background: sub === s.id ? BRASS : PAPER_DIM, color: sub === s.id ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1 text-[11px] whitespace-nowrap">{s.l}</button>
        ))}
      </div>
      {sub === 'info' && !editMode && (
        <div>
          {heroPhoto && <img src={heroPhoto} alt="" className="w-full rounded-2xl mb-3" style={{ height: 160, objectFit: 'cover' }} />}
          <span style={{ background: p.status === 'occupied' ? '#E1F5E9' : '#FBF3E9', color: p.status === 'occupied' ? GOOD : SLATE }} className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-block mb-2">{p.status === 'occupied' ? '🟢 มีผู้เช่า' : '⚪ ว่าง'}</span>
          <p className="text-xl font-bold mb-3" style={{ color: INK }}>฿{fmt(p.rent)}<span className="text-xs font-normal" style={{ color: SLATE }}> /เดือน</span></p>
          <div style={{ background: PAPER_DIM, borderRadius: 14 }} className="p-3 mb-3">
            <div className="flex justify-between items-center mb-2"><p className="text-xs font-bold" style={{ color: SLATE }}>ข้อมูลสรุป</p><button onClick={() => setEditMode(true)} className="text-[11px] font-semibold" style={{ color: BRASS }}>แก้ไข ›</button></div>
            <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>ค่าเช่า</span><span style={{ color: INK, fontWeight: 600 }}>฿{fmt(p.rent)} /เดือน</span></div>
            <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>เงินประกัน</span><span style={{ color: INK, fontWeight: 600 }}>฿{fmt(p.depositAmount)}</span></div>
            <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>ผู้เช่า</span><span style={{ color: INK, fontWeight: 600 }}>{p.tenantName || '-'}</span></div>
            {p.contractEndDate && <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>วันครบสัญญา</span><span style={{ color: daysToContractEnd !== null && daysToContractEnd <= 30 ? BAD : INK, fontWeight: 600 }}>{formatDateDMY(p.contractEndDate)}{daysToContractEnd !== null && <span style={{ color: SLATE, fontWeight: 400 }}> ({daysToContractEnd >= 0 ? `อีก ${daysToContractEnd} วัน` : 'เลยกำหนดแล้ว'})</span>}</span></div>}
            <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>วันครบกำหนดจ่าย</span><span style={{ color: INK, fontWeight: 600 }}>ทุกวันที่ {p.rentDueDay || '-'}</span></div>
            <div className="flex justify-between items-center text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span style={{ color: SLATE }}>สถานะเดือนนี้</span><span style={{ background: pay && pay.paid ? '#E1F5E9' : '#FBE9D0', color: pay && pay.paid ? GOOD : '#B5720A' }} className="text-[11px] font-bold px-2.5 py-0.5 rounded-full">{pay && pay.paid ? 'จ่ายครบแล้ว' : 'ยังไม่ครบ'}</span></div>
          </div>
          <div style={{ background: PAPER_DIM, borderRadius: 14 }} className="p-3 mb-3">
            <p className="text-xs font-bold mb-2" style={{ color: SLATE }}>รายได้ &amp; รายจ่าย เดือนนี้</p>
            <div className="flex justify-between text-sm py-1"><span style={{ color: SLATE }}>ค่าเช่า</span><span style={{ color: GOOD, fontWeight: 600 }}>+฿{fmt(rentIncome)}</span></div>
            {monthTx.map((t) => (
              <div key={t.id} className="flex justify-between text-sm py-1"><span style={{ color: SLATE }}>{t.category}</span><span style={{ color: t.type === 'income' ? GOOD : BAD, fontWeight: 600 }}>{t.type === 'income' ? '+' : '-'}฿{fmt(t.amount)}</span></div>
            ))}
            <p className="text-[11px] mt-2" style={{ color: SLATE }}>กำไรสุทธิ</p>
            <p className="text-2xl font-bold mb-2" style={{ color: netProfit >= 0 ? GOOD : BAD }}>฿{fmt(netProfit)}</p>
            <div className="flex gap-2">
              <button onClick={() => setSub('money')} style={{ background: '#E1F5E9', color: GOOD }} className="flex-1 text-xs font-bold rounded-xl py-2.5">💰 บันทึกรายรับ</button>
              <button onClick={() => setSub('money')} style={{ background: '#FBE3E1', color: BAD }} className="flex-1 text-xs font-bold rounded-xl py-2.5">🧾 บันทึกรายจ่าย</button>
            </div>
          </div>
          <div style={{ background: PAPER_DIM, borderRadius: 14 }} className="p-3">
            <div className="flex justify-between items-center mb-1"><p className="text-xs font-bold" style={{ color: SLATE }}>ประวัติการซ่อมบำรุง</p>{(p.repairs || []).length > 3 && <button onClick={() => setSub('repairs')} className="text-[11px] font-semibold" style={{ color: BRASS }}>ดูทั้งหมด ›</button>}</div>
            {recentRepairs.length === 0 ? <p className="text-xs py-2" style={{ color: SLATE }}>ยังไม่มีประวัติซ่อม</p> : recentRepairs.map((r, i) => (
              <div key={r.id} className="flex justify-between text-xs py-1.5" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}><span style={{ color: SLATE }}>{formatDateDMY(r.date)}</span><span style={{ color: INK, flex: 1, marginLeft: 10 }}>{r.item}</span><span style={{ color: INK, fontWeight: 600 }}>฿{fmt(r.amount)}</span></div>
            ))}
          </div>
        </div>
      )}
      {sub === 'info' && editMode && (
        <div>
          <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-xs mb-3" style={{ color: BRASS }}>‹ กลับไปดูสรุป</button>
          <PropertyInfoSection property={p} onUpdate={onUpdate} googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} />
        </div>
      )}
      {sub === 'rent' && <PropertyRentSection property={p} accounts={accounts} onAddInstallment={onAddRentInstallment} onRemoveInstallment={onRemoveRentInstallment} onUpdateInstallment={onUpdateRentInstallment} onSetManualConfirm={onSetRentManualConfirm} />}
      {sub === 'money' && <PropertyMoneySection property={p} onAddTransaction={onAddTransaction} onRemoveTransaction={onRemoveTransaction} />}
      {sub === 'repairs' && <PropertyRepairsSection property={p} onAddRepair={onAddRepair} onRemoveRepair={onRemoveRepair} />}
      {sub === 'roi' && <PropertyROISection property={p} />}
      {sub === 'docs' && <PropertyDocsSection property={p} onAddPhoto={onAddPhoto} onRemovePhoto={onRemovePhoto} onAddDocument={onAddDocument} onRemoveDocument={onRemoveDocument} />}
    </Card>
  );
}

// หน้ารับเงินค่าเช่าแบบแบ่งจ่ายได้หลายงวด — เลือกเดือน ดูสถานะ จ่ายครบ/ไม่ครบ เพิ่มงวดใหม่พร้อมเลือกบัญชีปลายทาง (สร้างรายการเงินเข้าให้อัตโนมัติ)
function PropertyRentSection({ property: p, accounts, onAddInstallment, onRemoveInstallment, onUpdateInstallment, onSetManualConfirm }) {
  const [ym, setYm] = useState(thisMonth());
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState('');
  const [editingInstallment, setEditingInstallment] = useState(null);
  const pay = (p.payments || {})[ym] || {};
  const installments = pay.installments || [];
  const totalPaid = installments.reduce((s, it) => s + Number(it.amount || 0), 0);
  const remaining = Math.max(0, Number(p.rent || 0) - totalPaid);
  const isFull = pay.paid;

  const dueDay = Number(p.rentDueDay || 5);
  const dueDate = `${ym}-${String(dueDay).padStart(2, '0')}`;
  const daysToDue = daysUntilGeneric(dueDate);
  const isOverdue = !isFull && daysToDue !== null && daysToDue < 0;

  function submit() {
    if (!amount) return;
    onAddInstallment(p.id, ym, { amount, date, note, accountId });
    setAmount(0); setNote('');
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} className="text-sm rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} />
        <span className="text-xs" style={{ color: SLATE }}>ครบกำหนดจ่าย: วันที่ {dueDay} ของทุกเดือน</span>
      </div>
      <div style={{ background: isFull ? '#16A34A14' : (isOverdue ? '#DC262614' : PAPER_DIM) }} className="rounded-full px-3 py-1.5 text-xs font-semibold inline-block mb-2" >
        {isFull ? '✅ จ่ายครบแล้ว' : isOverdue ? `🔴 เลยกำหนดมา ${Math.abs(daysToDue)} วัน — ขาดอีก ฿${fmt(remaining)}` : `🟠 จ่ายไม่ครบ — ขาดอีก ฿${fmt(remaining)}`}
      </div>
      <div style={{ background: PAPER_DIM }} className="h-2.5 rounded-full overflow-hidden mb-1">
        <div style={{ width: `${p.rent ? Math.min(100, (totalPaid / p.rent) * 100) : 0}%`, background: isFull ? GOOD : BRASS }} className="h-full rounded-full" />
      </div>
      <div className="flex justify-between text-xs mb-4" style={{ color: SLATE }}><span>จ่ายแล้ว <b style={{ color: INK }}>฿{fmt(totalPaid)}</b></span><span>เป้าหมาย <b style={{ color: INK }}>฿{fmt(p.rent)}</b></span></div>

      <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>รายการที่จ่ายมาแล้ว (แบ่งจ่าย)</p>
      {installments.length === 0 && <p className="text-xs mb-2" style={{ color: SLATE }}>ยังไม่มีการจ่ายเดือนนี้</p>}
      {installments.map((it) => {
        const acc = accounts.find((a) => a.id === it.accountId);
        return (
          <div key={it.id} style={{ border: `1px solid ${BORDER}` }} className="rounded-xl px-3 py-2 mb-2 flex justify-between items-center">
            <div><p className="text-sm font-semibold">฿{fmt(it.amount)}</p><p className="text-xs" style={{ color: SLATE }}>{it.date}{it.note ? ` · ${it.note}` : ''}</p>{acc ? <p className="text-xs font-semibold mt-0.5" style={{ color: BRASS }}>💰 นำไปลง: {acc.name}</p> : <p className="text-xs mt-0.5" style={{ color: SLATE }}>ยังไม่ได้ระบุว่านำไปลงที่ไหน</p>}</div>
            <div className="flex items-center gap-3"><EditButton onClick={() => setEditingInstallment(it)} /><button onClick={() => onRemoveInstallment(p.id, ym, it.id)}><Trash2 size={14} color={BAD} /></button></div>
          </div>
        );
      })}
      {editingInstallment && (
        <EditModal title="แก้ไขงวดค่าเช่า" onClose={() => setEditingInstallment(null)}
          initialValues={{ date: editingInstallment.date, amount: editingInstallment.amount, note: editingInstallment.note || '', accountId: editingInstallment.accountId || '' }}
          fields={[
            { key: 'date', label: 'วันที่โอน/จ่าย', type: 'date' },
            { key: 'amount', label: 'จำนวนเงิน', type: 'number' },
            { key: 'note', label: 'โน้ต', type: 'text' },
            { key: 'accountId', label: 'นำเงินนี้ไปฝาก/ลงทุนที่บัญชีไหน', type: 'select', options: [{ value: '', label: '— ไม่ระบุ —' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))] },
          ]}
          onSave={(v) => { onUpdateInstallment(p.id, ym, editingInstallment.id, { date: v.date, amount: Number(v.amount) || 0, note: v.note, accountId: v.accountId }); setEditingInstallment(null); }}
        />
      )}

      <div style={{ background: PAPER_DIM }} className="rounded-xl p-3 mt-2">
        <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>+ เพิ่มรายการจ่ายอีกงวด</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนเงิน</label><NumInput value={amount} onChange={setAmount} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่โอน/จ่าย</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <label className="text-[10px]" style={{ color: SLATE }}>โน้ต (ไม่บังคับ)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น จ่ายงวดสุดท้าย" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>นำเงินนี้ไปฝาก/ลงทุนที่บัญชีไหน (ไม่บังคับ)</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— ไม่ระบุ (แค่บันทึกว่าเก็บค่าเช่าได้) —</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <p className="text-[10px] mb-2" style={{ color: SLATE }}>💡 ถ้าระบุบัญชีไว้ ระบบจะสร้างรายการ "เงินเข้า" ให้อัตโนมัติในบัญชีนั้นเลย</p>
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">+ บันทึกงวดนี้</button>
      </div>

      <label className="flex items-center gap-2 mt-3 text-xs p-2.5 rounded-xl" style={{ border: `1px dashed ${BRASS}`, color: INK }}>
        <input type="checkbox" checked={!!pay.manualConfirm} onChange={(e) => onSetManualConfirm(p.id, ym, e.target.checked)} />
        ติ๊กยืนยันว่าเดือนนี้ "จ่ายครบแล้ว" ด้วยตัวเอง (เผื่อกรณีพิเศษ)
      </label>
    </div>
  );
}


function PropertyInfoSection({ property: p, onUpdate, googleConnected, onAddToCalendar }) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  async function syncContractReminder() {
    if (!p.contractEndDate) return;
    setSyncing(true); setSyncMsg('');
    const r = await onAddToCalendar(`ครบสัญญาเช่า: ${p.name}`, `ผู้เช่า: ${p.tenantName || '-'}\nค่าเช่า: ${fmt(p.rent)} บาท`, p.contractEndDate, p.reminderDays);
    setSyncMsg(r.ok ? 'เพิ่มลงปฏิทินสำเร็จ ✓' : `ไม่สำเร็จ: ${r.message}`);
    setSyncing(false);
  }
  function toggleReminderDay(d) {
    const cur = p.reminderDays || [];
    onUpdate(p.id, { reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => b - a) });
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ background: p.status === 'occupied' ? '#16A34A14' : '#D9770614', color: p.status === 'occupied' ? GOOD : WARN }} className="text-xs font-semibold px-2.5 py-1 rounded-full">{p.status === 'occupied' ? '🟢 มีผู้เช่า' : '🟡 ว่าง'}</span>
        <select value={p.status} onChange={(e) => onUpdate(p.id, { status: e.target.value })} className="text-xs rounded-lg px-2 py-1" style={{ border: `1px solid ${BORDER}` }}>
          <option value="occupied">มีผู้เช่า</option>
          <option value="vacant">ว่าง</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div><label className="text-[10px]" style={{ color: SLATE }}>ค่าเช่า/เดือน</label><NumInput value={p.rent} onChange={(v) => onUpdate(p.id, { rent: v })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>เงินประกัน</label><NumInput value={p.depositAmount} onChange={(v) => onUpdate(p.id, { depositAmount: v })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>วันเริ่มสัญญา</label><input type="date" value={p.contractStartDate || ''} onChange={(e) => onUpdate(p.id, { contractStartDate: e.target.value })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>วันครบสัญญา</label><input type="date" value={p.contractEndDate || ''} onChange={(e) => onUpdate(p.id, { contractEndDate: e.target.value })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[10px]" style={{ color: SLATE }}>วันครบกำหนดจ่ายค่าเช่า (ทุกวันที่)</label><NumInput value={p.rentDueDay || 5} onChange={(v) => onUpdate(p.id, { rentDueDay: v })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div className="col-span-2"><label className="text-[10px]" style={{ color: SLATE }}>ราคาซื้อ</label><NumInput value={p.purchasePrice} onChange={(v) => onUpdate(p.id, { purchasePrice: v })} className="text-sm w-full outline-none rounded-lg px-2 py-1.5" style={{ border: `1px solid ${BORDER}` }} /></div>
      </div>
      <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>ผู้เช่า</p>
      <div className="mb-2"><input value={p.tenantName || ''} onChange={(e) => onUpdate(p.id, { tenantName: e.target.value })} placeholder="ชื่อผู้เช่า" className="text-sm w-full outline-none rounded-lg px-2.5 py-2" style={{ border: `1px solid ${BORDER}` }} /></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <input value={p.tenantPhone || ''} onChange={(e) => onUpdate(p.id, { tenantPhone: e.target.value })} placeholder="เบอร์โทร" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-1" style={{ border: `1px solid ${BORDER}` }} />
          {p.tenantPhone && <a href={`tel:${p.tenantPhone}`} className="flex items-center justify-center gap-1 text-xs rounded-lg py-1.5" style={{ background: PAPER_DIM, color: INK }}><Phone size={12} /> โทร</a>}
        </div>
        <div>
          <input value={p.tenantLine || ''} onChange={(e) => onUpdate(p.id, { tenantLine: e.target.value })} placeholder="LINE ID" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-1" style={{ border: `1px solid ${BORDER}` }} />
          {p.tenantLine && <a href={`https://line.me/ti/p/~${p.tenantLine}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-xs rounded-lg py-1.5" style={{ background: PAPER_DIM, color: INK }}><MessageCircle size={12} /> LINE</a>}
        </div>
      </div>
      <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>เตือนล่วงหน้ากี่วัน (ครบสัญญา)</p>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 7].map((d) => (<button key={d} onClick={() => toggleReminderDay(d)} style={{ background: (p.reminderDays || []).includes(d) ? BRASS : PAPER_DIM, color: (p.reminderDays || []).includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1.5 text-xs">{d} วัน</button>))}
      </div>
      {googleConnected && p.contractEndDate && (
        <button onClick={syncContractReminder} disabled={syncing} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}>{syncing ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />} เพิ่มเตือนครบสัญญาลง Google Calendar</button>
      )}
      {syncMsg && <p className="text-[11px] mt-1" style={{ color: syncMsg.includes('สำเร็จ') ? GOOD : BAD }}>{syncMsg}</p>}
    </div>
  );
                                                         }function PropertyMoneySection({ property: p, onAddTransaction, onRemoveTransaction }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('ค่าส่วนกลาง');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const ym = thisMonth();
  const monthTx = (p.transactions || []).filter((t) => monthKey(t.date) === ym);
  const pay = (p.payments || {})[ym];
  const rentIncome = pay && pay.paid ? Number(pay.amount || p.rent || 0) : 0;
  const extraIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
  const netProfit = rentIncome + extraIncome - totalExpense;

  function submit() { if (!amount) return; onAddTransaction(p.id, { date, type, category, amount }); setAmount(0); }

  return (
    <div>
      <div style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3 mb-3">
        <p className="text-[10px] mb-2" style={{ color: SLATE }}>สรุปเดือนนี้ ({ym})</p>
        <div className="flex justify-between text-sm mb-1"><span>ค่าเช่า</span><span style={{ color: GOOD }}>+฿{fmt(rentIncome)}</span></div>
        {monthTx.map((t) => (
          <div key={t.id} className="flex justify-between text-sm mb-1"><span>{t.category}</span><span style={{ color: t.type === 'income' ? GOOD : BAD }}>{t.type === 'income' ? '+' : '-'}฿{fmt(t.amount)}</span></div>
        ))}
        <div className="flex justify-between text-sm font-bold mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}><span>กำไรสุทธิ</span><span style={{ color: netProfit >= 0 ? GOOD : BAD }}>฿{fmt(netProfit)}</span></div>
      </div>
      <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>บันทึกรายการ</p>
      <div className="flex gap-2 mb-2">
        <button onClick={() => setType('income')} style={{ background: type === 'income' ? GOOD : PAPER_DIM, color: type === 'income' ? 'white' : SLATE }} className="flex-1 text-xs rounded-full py-1.5">รายรับ</button>
        <button onClick={() => setType('expense')} style={{ background: type === 'expense' ? BAD : PAPER_DIM, color: type === 'expense' ? 'white' : SLATE }} className="flex-1 text-xs rounded-full py-1.5">รายจ่าย</button>
      </div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-2" style={{ border: `1px solid ${BORDER}` }} />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="รายการ เช่น ค่าส่วนกลาง" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-2" style={{ border: `1px solid ${BORDER}` }} />
      <NumInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-3" style={{ border: `1px solid ${BORDER}` }} />
      <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm mb-3">บันทึก</button>
      <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>ประวัติทั้งหมด</p>
      {(p.transactions || []).map((t) => (
        <div key={t.id} className="flex justify-between items-center text-sm mb-1.5"><span>{t.date} · {t.category}</span><div className="flex items-center gap-2"><span style={{ color: t.type === 'income' ? GOOD : BAD }}>{t.type === 'income' ? '+' : '-'}฿{fmt(t.amount)}</span><button onClick={() => onRemoveTransaction(p.id, t.id)}><Trash2 size={12} color={BAD} /></button></div></div>
      ))}
    </div>
  );
}

function PropertyRepairsSection({ property: p, onAddRepair, onRemoveRepair }) {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  function submit() { if (!item) return; onAddRepair(p.id, { date, item, amount }); setItem(''); setAmount(0); }
  const total = (p.repairs || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  return (
    <div>
      <div style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3 mb-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-2" style={{ border: `1px solid ${BORDER}`, background: 'white' }} />
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="รายการซ่อม เช่น เปลี่ยนแอร์" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-2" style={{ border: `1px solid ${BORDER}`, background: 'white' }} />
        <NumInput value={amount} onChange={setAmount} placeholder="ค่าใช้จ่าย" className="text-sm w-full outline-none rounded-lg px-2.5 py-2 mb-3" style={{ border: `1px solid ${BORDER}`, background: 'white' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกการซ่อม</button>
      </div>
      <p className="text-xs mb-2" style={{ color: SLATE }}>รวมค่าซ่อมทั้งหมด ฿{fmt(total)}</p>
      {(p.repairs || []).map((r) => (
        <div key={r.id} className="flex justify-between items-center text-sm mb-2 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}><span>{r.date} · {r.item}</span><div className="flex items-center gap-2"><span>฿{fmt(r.amount)}</span><button onClick={() => onRemoveRepair(p.id, r.id)}><Trash2 size={12} color={BAD} /></button></div></div>
      ))}
    </div>
  );
}

function PropertyROISection({ property: p }) {
  const yieldPct = p.purchasePrice ? (Number(p.rent || 0) * 12 / Number(p.purchasePrice)) * 100 : 0;
  const totalRepairs = (p.repairs || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpenses = (p.transactions || []).filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalRentCollected = Object.values(p.payments || {}).filter((x) => x.paid).reduce((s, x) => s + Number(x.amount || 0), 0);
  const cumulativeProfit = totalRentCollected - totalRepairs - totalExpenses;
  const paybackYears = yieldPct > 0 ? (100 / yieldPct) : null;
  return (
    <div>
      <div style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3 mb-3">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatBox label="ราคาซื้อ" value={`฿${fmt(p.purchasePrice)}`} />
          <StatBox label="ค่าเช่า/เดือน" value={`฿${fmt(p.rent)}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Yield" value={`${yieldPct.toFixed(1)}%`} color={GOOD} />
          <StatBox label="ระยะเวลาคืนทุน" value={paybackYears ? `${paybackYears.toFixed(1)} ปี` : '-'} />
        </div>
      </div>
      <div style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3">
        <p className="text-xs mb-2" style={{ color: SLATE }}>กำไรสะสมทั้งหมด (เก็บค่าเช่า − ค่าซ่อม − ค่าใช้จ่าย)</p>
        <p className="text-2xl font-bold" style={{ color: cumulativeProfit >= 0 ? GOOD : BAD }}>฿{fmt(cumulativeProfit)}</p>
      </div>
    </div>
  );
}

function PropertyDocsSection({ property: p, onAddPhoto, onRemovePhoto, onAddDocument, onRemoveDocument }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const docFileRef = useRef(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');
  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    try { await onAddPhoto(p.id, file); } catch (err) { setError('อัพโหลดไม่สำเร็จ: ' + err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  async function handleDocFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !onAddDocument) return;
    setDocUploading(true); setDocError('');
    try { await onAddDocument(p.id, file); } catch (err) { setDocError('อัพโหลดไม่สำเร็จ: ' + err.message); }
    finally { setDocUploading(false); if (docFileRef.current) docFileRef.current.value = ''; }
  }
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 mb-3">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />}{uploading ? 'กำลังอัพโหลด...' : 'ถ่ายรูปห้อง/มิเตอร์'}</button>
      {error && <p className="text-xs mb-3" style={{ color: BAD }}>{error}</p>}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(p.photos || []).map((ph) => (
          <div key={ph.id} className="relative">
            <button onClick={() => setLightboxUrl(ph.url)} className="w-full block"><img src={ph.url} className="w-full h-24 object-cover rounded-lg" alt="" /></button>
            <button onClick={() => onRemovePhoto(p.id, ph.id)} style={{ background: 'rgba(0,0,0,0.5)' }} className="absolute top-1 right-1 rounded-full p-1"><Trash2 size={12} color="white" /></button>
          </div>
        ))}
      </div>
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />

      <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>เอกสารสัญญา/โฉนด (PDF)</p>
      <input ref={docFileRef} type="file" accept="application/pdf" onChange={handleDocFile} className="hidden" />
      <button onClick={() => docFileRef.current && docFileRef.current.click()} style={{ border: `1px dashed ${BRASS}`, color: BRASS }} className="w-full rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 mb-3">{docUploading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}{docUploading ? 'กำลังอัพโหลด...' : 'แนบไฟล์ PDF (สัญญาเช่า/โฉนด)'}</button>
      {docError && <p className="text-xs mb-3" style={{ color: BAD }}>{docError}</p>}
      {(p.documents || []).length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีเอกสารแนบไว้</p>}
      {(p.documents || []).map((doc) => (
        <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-2" style={{ border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 flex-1 min-w-0"><ClipboardList size={16} color={BRASS} style={{ flexShrink: 0 }} /><div className="min-w-0"><p className="text-sm truncate" style={{ color: INK }}>{doc.name}</p><p className="text-[11px]" style={{ color: SLATE }}>{doc.uploadedAt}</p></div></div>
          <button onClick={(e) => { e.preventDefault(); onRemoveDocument(p.id, doc.id); }} style={{ flexShrink: 0 }}><Trash2 size={14} color={BAD} /></button>
        </a>
      ))}
    </div>
  );
}

function RentCollectionMatrix({ properties, onTogglePayment }) {
  const [month, setMonth] = useState(thisMonth());
  return (
    <div>
      <div style={{ background: 'white', borderRadius: CARD_RADIUS, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { const d = new Date(month + '-01'); d.setMonth(d.getMonth() - 1); setMonth(d.toISOString().slice(0, 7)); }} style={{ color: BRASS }} className="text-lg px-2">‹</button>
          <p className="text-sm font-semibold" style={{ color: INK }}>{month}</p>
          <button onClick={() => { const d = new Date(month + '-01'); d.setMonth(d.getMonth() + 1); setMonth(d.toISOString().slice(0, 7)); }} style={{ color: BRASS }} className="text-lg px-2">›</button>
        </div>
        {properties.map((p, i) => {
          const pay = (p.payments || {})[month];
          const paid = pay && pay.paid;
          return (
            <button key={p.id} onClick={() => onTogglePayment(p.id, month)} className="w-full flex justify-between items-center py-2.5" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div className="text-left"><p className="text-sm font-medium" style={{ color: INK }}>{p.name}</p><p className="text-xs" style={{ color: SLATE }}>฿{fmt(p.rent)}</p></div>
              <span style={{ background: paid ? '#16A34A14' : '#DC262614', color: paid ? GOOD : BAD }} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">{paid ? '✔️ จ่ายแล้ว' : '❌ ยังไม่จ่าย'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
// คำย่อชื่อทรัพย์สินสำหรับโชว์ในปฏิทิน — เช็คคำที่มักปรากฏในชื่อทรัพย์สินก่อน เผื่อชื่อเต็มไม่ตรงเป๊ะ แล้วค่อย fallback เป็นคำสุดท้ายของชื่อ
function propertyAbbrev(name) {
  const n = name || '';
  const knownMap = [['O2', 'O2'], ['วัชระ', 'วัชระ'], ['แก๊ส', 'แก๊ส'], ['หลักสี่', 'หลักสี่'], ['Kave', 'Kave'], ['Wish', 'Wish']];
  for (const [keyword, abbrev] of knownMap) { if (n.includes(keyword)) return abbrev; }
  const words = n.trim().split(/\s+/);
  return words[words.length - 1] || n;
}
const INSURANCE_CATEGORIES = [
  { id: 'life', label: 'ชีวิต', emoji: '❤️' },
  { id: 'health', label: 'สุขภาพ', emoji: '🏥' },
  { id: 'critical', label: 'โรคร้ายแรง', emoji: '🧬' },
  { id: 'accident', label: 'อุบัติเหตุ', emoji: '🚑' },
  { id: 'car', label: 'รถยนต์', emoji: '🚗' },
  { id: 'other', label: 'อื่นๆ', emoji: '📄' },
];
const RIDER_TYPES = [
  { id: 'life', label: 'ชีวิต' },
  { id: 'health', label: 'สุขภาพ (IPD/OPD)' },
  { id: 'critical', label: 'เจอจ่ายจบ/โรคร้ายแรง' },
  { id: 'accident', label: 'อุบัติเหตุ' },
  { id: 'daily_cash', label: 'ชดเชยรายวัน' },
  { id: 'car', label: 'รถยนต์' },
  { id: 'other', label: 'อื่นๆ' },
];
const INSURANCE_OWNERS = [{ id: 'me', label: 'ผม' }, { id: 'spouse', label: 'ภรรยา' }, { id: 'car', label: 'รถยนต์' }];
function RiderExtraFields({ r, onChange }) {
  const numField = (label, key, half) => (
    <div className={half ? '' : 'col-span-2'}><label className="text-[9px]" style={{ color: SLATE }}>{label}</label><NumInput value={r[key]} onChange={(v) => onChange({ [key]: v })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
  );
  if (r.type === 'health') {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {numField('IPD/ปี', 'ipdLimit', true)}
          {numField('OPD/ปี', 'opdLimit', true)}
          {numField('ค่าห้อง/คืน', 'roomLimit', true)}
          {numField('ค่าแพทย์/วัน', 'doctorLimit', true)}
          {numField('ICU/คืน', 'icuLimit', true)}
          {numField('ค่าผ่าตัด', 'surgeryLimit', true)}
          {numField('ER/ครั้ง', 'erLimit', true)}
          {numField('รถพยาบาล', 'ambulanceLimit', true)}
          {numField('มะเร็ง (ก้อน)', 'cancerLimit', true)}
          {numField('ล้างไต', 'dialysisLimit', true)}
          {numField('MRI/CT', 'mriCtLimit', true)}
          {numField('Deductible', 'deductible', true)}
        </div>
        <div className="mb-2"><label className="text-[9px]" style={{ color: SLATE }}>Copayment ผู้เอาประกันจ่ายเอง (%)</label><NumInput value={r.copaymentPct} onChange={(v) => onChange({ copaymentPct: v })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
      </>
    );
  }
  if (r.type === 'daily_cash') {
    return <div className="mb-2"><label className="text-[9px]" style={{ color: SLATE }}>ชดเชยรายวัน (บาท/วัน)</label><NumInput value={r.dailyCashAmount} onChange={(v) => onChange({ dailyCashAmount: v })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>;
  }
  if (r.type === 'life') {
    return (
      <div className="grid grid-cols-2 gap-2 mb-2">
        {numField('เสียชีวิตจากอุบัติเหตุ (เพิ่มเติม)', 'deathAccidentBenefit', true)}
        {numField('ทุพพลภาพ', 'disabilityBenefit', true)}
        {numField('เงินคืนระหว่างสัญญา', 'cashBackAmount', true)}
        {numField('มูลค่าเวนคืนปัจจุบัน', 'surrenderValue', true)}
        {numField('เงินครบกำหนดสัญญา', 'maturityBenefit', false)}
      </div>
    );
  }
  if (r.type === 'critical') {
    return (
      <>
        <label className="text-[9px]" style={{ color: SLATE }}>โรค/ภาวะที่คุ้มครอง</label>
        <textarea value={r.coveredDiseases || ''} onChange={(e) => onChange({ coveredDiseases: e.target.value })} rows={2} placeholder="เช่น มะเร็งระยะลุกลาม, กล้ามเนื้อหัวใจตายเฉียบพลัน..." className="rounded px-2 py-1 text-xs w-full mt-0.5 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <label className="text-[9px]" style={{ color: SLATE }}>เงื่อนไขการวินิจฉัย</label>
        <textarea value={r.diagnosisCondition || ''} onChange={(e) => onChange({ diagnosisCondition: e.target.value })} rows={2} className="rounded px-2 py-1 text-xs w-full mt-0.5 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[9px]" style={{ color: SLATE }}>จ่ายแบบ</label>
            <select value={r.payoutType || 'single'} onChange={(e) => onChange({ payoutType: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <option value="single">ครั้งเดียวจบ</option><option value="multiple">จ่ายได้หลายครั้ง</option>
            </select>
          </div>
          <div><label className="text-[9px]" style={{ color: SLATE }}>หลังเคลมแล้ว</label>
            <select value={r.continuesAfterClaim || 'no'} onChange={(e) => onChange({ continuesAfterClaim: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <option value="no">สัญญาสิ้นสุด</option><option value="yes">คุ้มครองต่อ</option>
            </select>
          </div>
        </div>
      </>
    );
  }
  if (r.type === 'car') {
    return (
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="text-[9px]" style={{ color: SLATE }}>ทะเบียนรถ</label><input value={r.vehiclePlate || ''} onChange={(e) => onChange({ vehiclePlate: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[9px]" style={{ color: SLATE }}>ชั้นประกัน</label>
          <select value={r.insuranceClass || '1'} onChange={(e) => onChange({ insuranceClass: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
            <option value="1">ชั้น 1</option><option value="2+">ชั้น 2+</option><option value="3+">ชั้น 3+</option><option value="2">ชั้น 2</option><option value="3">ชั้น 3</option>
          </select>
        </div>
        {numField('ค่าเสียหายส่วนแรก', 'carDeductible', true)}
        <div><label className="text-[9px]" style={{ color: SLATE }}>รถหาย/ไฟไหม้</label>
          <select value={r.theftFireCoverage || 'no'} onChange={(e) => onChange({ theftFireCoverage: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
            <option value="no">ไม่คุ้มครอง</option><option value="yes">คุ้มครอง</option>
          </select>
        </div>
        {numField('คุ้มครองคู่กรณี', 'thirdPartyCoverage', true)}
        <div><label className="text-[9px]" style={{ color: SLATE }}>พ.ร.บ.</label><input value={r.compulsoryInsurance || ''} onChange={(e) => onChange({ compulsoryInsurance: e.target.value })} placeholder="เลขที่/วันหมดอายุ" className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        <div><label className="text-[9px]" style={{ color: SLATE }}>ซ่อม</label>
          <select value={r.garageType || 'center'} onChange={(e) => onChange({ garageType: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
            <option value="center">ศูนย์</option><option value="garage">อู่</option>
          </select>
        </div>
        <div><label className="text-[9px]" style={{ color: SLATE }}>เบอร์แจ้งเหตุ</label><input value={r.emergencyHotline || ''} onChange={(e) => onChange({ emergencyHotline: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
      </div>
    );
  }
  return null;
}
const BENEFIT_ITEM_PRESETS = ['ค่าห้อง/ค่าอาหาร (ผู้ป่วยใน)', 'ค่าแพทย์ตรวจรักษา', 'ค่ายา/เวชภัณฑ์กลับบ้าน', 'ค่าผ่าตัด', 'ค่าตรวจสุขภาพ/วัคซีนประจำปี', 'ผลประโยชน์สูงสุดต่อปีกรมธรรม์'];
function RiderBenefitItems({ items, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const list = items || [];
  function addItem(label) { onChange([...list, { id: uid(), label: label || '', value: '', maxCount: '' }]); setExpanded(true); }
  function updateItem(id, patch) { onChange(list.map((it) => (it.id === id ? { ...it, ...patch } : it))); }
  function removeItem(id) { onChange(list.filter((it) => it.id !== id)); }
  const highlight = list[0];
  return (
    <div className="mb-2">
      {list.length > 0 && !expanded && (
        <button onClick={() => setExpanded(true)} className="w-full text-left text-[10px] px-2 py-1.5 rounded" style={{ background: 'white', border: `1px solid ${BORDER}`, color: SLATE }}>
          {highlight.label || 'ผลประโยชน์'}: <span style={{ color: INK, fontWeight: 600 }}>{highlight.value || '-'}</span>
          {list.length > 1 ? ` · ดูรายละเอียดผลประโยชน์ทั้งหมด (${list.length}) ▾` : ' · ดูรายละเอียด ▾'}
        </button>
      )}
      {list.length === 0 && !expanded && (
        <button onClick={() => setExpanded(true)} className="text-[10px]" style={{ color: BRASS }}>+ เพิ่มรายละเอียดผลประโยชน์</button>
      )}
      {expanded && (
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 10 }} className="p-2 mt-1">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[10px] font-semibold" style={{ color: SLATE }}>รายละเอียดผลประโยชน์</p>
            <button onClick={() => setExpanded(false)} className="text-[10px]" style={{ color: BRASS }}>ย่อ ▴</button>
          </div>
          {list.map((it) => (
            <div key={it.id} className="flex gap-1 items-center mb-1">
              <input value={it.label} onChange={(e) => updateItem(it.id, { label: e.target.value })} placeholder="รายการ" className="rounded px-1.5 py-1 text-[10px]" style={{ border: `1px solid ${BORDER}`, width: '38%' }} />
              <input value={it.value} onChange={(e) => updateItem(it.id, { value: e.target.value })} placeholder="ผลประโยชน์ (บาท)" className="rounded px-1.5 py-1 text-[10px]" style={{ border: `1px solid ${BORDER}`, width: '30%' }} />
              <input value={it.maxCount} onChange={(e) => updateItem(it.id, { maxCount: e.target.value })} placeholder="จำนวนสูงสุด" className="rounded px-1.5 py-1 text-[10px]" style={{ border: `1px solid ${BORDER}`, width: '22%' }} />
              <button onClick={() => removeItem(it.id)}><Trash2 size={12} color={BAD} /></button>
            </div>
          ))}
          <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
            {BENEFIT_ITEM_PRESETS.filter((p) => !list.some((it) => it.label === p)).map((p) => (
              <button key={p} onClick={() => addItem(p)} className="text-[9px] rounded-full px-2 py-1" style={{ background: PAPER_DIM, color: INK }}>+ {p}</button>
            ))}
          </div>
          <button onClick={() => addItem('')} className="text-[10px]" style={{ color: BRASS }}>+ เพิ่มรายการเอง</button>
        </div>
      )}
    </div>
  );
}
const INSURANCE_SCENARIOS = [
  { id: 'hospital', label: 'เข้า รพ.', emoji: '🏥' },
  { id: 'opd', label: 'OPD', emoji: '🩺' },
  { id: 'critical', label: 'มะเร็ง/โรคร้ายแรง', emoji: '🧬' },
  { id: 'accident', label: 'อุบัติเหตุ', emoji: '🚑' },
  { id: 'death', label: 'เสียชีวิต', emoji: '💀' },
  { id: 'car', label: 'รถชน', emoji: '🚗' },
];
function allRiders(policies) {
  const list = [];
  (policies || []).forEach((p) => (p.riders || []).forEach((r) => list.push({ ...r, policyId: p.id, policyName: p.planName || p.company, owner: p.owner, company: p.company })));
  return list;
}

function InsuranceTab({ policies, claims, onAddPolicy, onUpdatePolicy, onRemovePolicy, onAddRider, onUpdateRider, onRemoveRider, onAddDocument, onRemoveDocument, onAddClaim, onUpdateClaim, onRemoveClaim, googleConnected, onAddToCalendar }) {
  const [section, setSection] = useState('overview');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const filteredPolicies = ownerFilter === 'all' ? policies : policies.filter((p) => p.owner === ownerFilter);
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  return (
    <div className="px-5 pt-5">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: 'overview', l: '🏠 ภาพรวม' }, { id: 'policies', l: '🛡️ กรมธรรม์' }, { id: 'coverage', l: '❤️ ความคุ้มครอง' }, { id: 'claims', l: '🧾 เคลม' }, { id: 'manage', l: '📅 ต่ออายุ/เอกสาร' }].map((s) => (
          <button key={s.id} onClick={() => { setSection(s.id); setSelectedPolicyId(null); }} style={{ background: section === s.id ? INK : PAPER_DIM, color: section === s.id ? 'white' : INK, flexShrink: 0 }} className="rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap">{s.l}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {[{ id: 'all', l: 'ทั้งหมด' }, ...INSURANCE_OWNERS].map((o) => (
          <button key={o.id} onClick={() => setOwnerFilter(o.id)} style={{ background: ownerFilter === o.id ? BRASS : PAPER_DIM, color: ownerFilter === o.id ? 'white' : SLATE }} className="rounded-full px-3 py-1.5 text-xs">{o.l || o.label}</button>
        ))}
      </div>

      {section === 'overview' && <InsuranceOverviewSection policies={filteredPolicies} onGoScenario={(s) => { setSection('coverage'); }} />}
      {section === 'policies' && !selectedPolicy && <InsurancePoliciesList policies={filteredPolicies} onSelect={setSelectedPolicyId} onAddPolicy={onAddPolicy} />}
      {section === 'policies' && selectedPolicy && (
        <InsurancePolicyDetail policy={selectedPolicy} onBack={() => setSelectedPolicyId(null)} onUpdate={onUpdatePolicy} onRemove={() => { onRemovePolicy(selectedPolicy.id); setSelectedPolicyId(null); }}
          onAddRider={onAddRider} onUpdateRider={onUpdateRider} onRemoveRider={onRemoveRider} onAddDocument={onAddDocument} onRemoveDocument={onRemoveDocument}
          googleConnected={googleConnected} onAddToCalendar={onAddToCalendar} />
      )}
      {section === 'coverage' && <InsuranceCoverageSection policies={filteredPolicies} onJumpToPolicy={(id) => { setSelectedPolicyId(id); setSection('policies'); }} />}
      {section === 'claims' && <InsuranceClaimsSection policies={policies} claims={claims} onAddClaim={onAddClaim} onUpdateClaim={onUpdateClaim} onRemoveClaim={onRemoveClaim} />}
      {section === 'manage' && <InsuranceManageSection policies={filteredPolicies} onJumpToPolicy={(id) => { setSelectedPolicyId(id); setSection('policies'); }} />}
    </div>
  );
}

function InsuranceOverviewSection({ policies, onGoScenario }) {
  const riders = allRiders(policies);
  const totalPremium = policies.reduce((s, p) => s + Number(p.premiumAmount || 0) * (p.premiumFrequency === 'month' ? 12 : 1), 0);
  const taxDeductiblePremium = riders.filter((r) => r.taxDeductible === 'yes' || r.taxDeductible === 'partial').reduce((s, r) => s + Number(r.premiumAmount || 0), 0);
  const countByCategory = (cat) => policies.filter((p) => p.category === cat).length;
  const totalDeath = riders.reduce((s, r) => s + Number(r.deathBenefit || 0), 0);
  const totalIPD = riders.reduce((s, r) => s + Number(r.ipdLimit || 0), 0);
  const maxRoom = riders.reduce((m, r) => Math.max(m, Number(r.roomLimit || 0)), 0);
  const totalCritical = riders.filter((r) => r.type === 'critical').reduce((s, r) => s + Number(r.sumInsured || 0), 0);

  return (
    <div>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>เบี้ยประกันรวมต่อปี</p>
        <p className="text-2xl font-bold mb-3" style={{ color: INK }}>฿{fmt(totalPremium)}</p>
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="ชีวิต" value={`${countByCategory('life')} กรมธรรม์`} />
          <StatBox label="สุขภาพ" value={`${countByCategory('health')} กรมธรรม์`} />
          <StatBox label="รถยนต์" value={`${countByCategory('car')} คัน`} />
        </div>
        {taxDeductiblePremium > 0 && <p className="text-xs mt-3" style={{ color: GOOD }}>💡 เบี้ยที่ลดหย่อนภาษีได้ปีนี้ ≈ ฿{fmt(taxDeductiblePremium)}{taxDeductiblePremium > 100000 && ' (เกินเพดานรวม ฿100,000/ปี)'}</p>}
      </Card>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปความคุ้มครองรวม</p>
        {totalDeath > 0 && <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span>❤️ เสียชีวิต</span><span className="font-semibold">฿{fmt(totalDeath)}</span></div>}
        {totalIPD > 0 && <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span>🏥 IPD ต่อปี</span><span className="font-semibold">฿{fmt(totalIPD)}</span></div>}
        {maxRoom > 0 && <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span>🛏️ ค่าห้องสูงสุด</span><span className="font-semibold">฿{fmt(maxRoom)}/คืน</span></div>}
        {totalCritical > 0 && <div className="flex justify-between text-sm py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}><span>🧬 โรคร้ายแรง</span><span className="font-semibold">฿{fmt(totalCritical)}</span></div>}
        {riders.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูลความคุ้มครอง</p>}
      </Card>
      <Card>
        <p className="text-xs mb-3 font-semibold" style={{ color: INK }}>ถ้าเกิดวันนี้...</p>
        <div className="grid grid-cols-3 gap-2">
          {INSURANCE_SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => onGoScenario(s.id)} style={{ border: `1px solid ${BORDER}` }} className="rounded-2xl py-3 text-center">
              <p className="text-xl mb-1">{s.emoji}</p><p className="text-[11px]" style={{ color: INK }}>{s.label}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InsurancePoliciesList({ policies, onSelect, onAddPolicy }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      <button onClick={() => setShowAdd(true)} style={{ border: `1px dashed ${BRASS}`, color: BRASS }} className="w-full rounded-xl py-3 text-sm font-semibold mb-4">+ เพิ่มกรมธรรม์ใหม่</button>
      {policies.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีกรมธรรม์บันทึกไว้</p>}
      {policies.map((p) => {
        const cat = INSURANCE_CATEGORIES.find((c) => c.id === p.category);
        const dl = p.endDate ? daysUntil(p.endDate) : null;
        return (
          <button key={p.id} onClick={() => onSelect(p.id)} className="w-full text-left">
            <Card>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold" style={{ color: INK }}>{cat?.emoji} {p.planName || p.company}</p>
                  <p className="text-xs mt-0.5" style={{ color: SLATE }}>{p.company} · {INSURANCE_OWNERS.find((o) => o.id === p.owner)?.label} · ฿{fmt(p.premiumAmount)}/{p.premiumFrequency === 'month' ? 'เดือน' : 'ปี'}</p>
                  {dl !== null && <p className="text-[11px] mt-1" style={{ color: dl < 0 ? BAD : dl <= 30 ? WARN : GOOD }}>{dl < 0 ? '⚫ หมดอายุแล้ว' : `🟢 มีผลคุ้มครอง (ต่ออายุอีก ${dl} วัน)`}</p>}
                </div>
                <ChevronRight size={16} color={SLATE} />
              </div>
            </Card>
          </button>
        );
      })}
      {showAdd && <InsuranceAddPolicyFlow onClose={() => setShowAdd(false)} onAddPolicy={onAddPolicy} onSelect={onSelect} />}
    </div>
  );
}

function InsuranceAddPolicyFlow({ onClose, onAddPolicy, onSelect }) {
  const [step, setStep] = useState(1); // 1: category, 2: photo/manual, 3: review
  const [category, setCategory] = useState('health');
  const [owner, setOwner] = useState('me');
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [draft, setDraft] = useState(null);

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }
  async function runScan() {
    if (files.length === 0) return;
    setScanning(true); setScanError('');
    try {
      const merged = await scanInsurancePolicyMultiPhoto(files);
      setDraft(merged);
      setStep(3);
    } catch (err) { setScanError('อ่านรูปไม่สำเร็จ: ' + err.message); }
    finally { setScanning(false); }
  }
  function startManual() {
    setDraft({ company: '', policyNumber: '', planName: '', insuredName: '', startDate: '', endDate: '', premiumAmount: 0, premiumFrequency: 'year', riders: [{ name: '', type: category, sumInsured: 0, deathBenefit: 0, premiumAmount: 0, taxDeductible: 'no', notes: '', benefitItems: [] }] });
    setStep(3);
  }
  function saveAll() {
    const policyId = onAddPolicy({ owner, category, company: draft.company, policyNumber: draft.policyNumber, planName: draft.planName, startDate: draft.startDate, endDate: draft.endDate, premiumAmount: draft.premiumAmount, premiumFrequency: draft.premiumFrequency, riders: (draft.riders || []).map((r) => ({ id: uid(), ...r })) });
    onClose();
    onSelect(policyId);
  }

  return (
    <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
      <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><p className="text-sm font-semibold">เพิ่มกรมธรรม์ใหม่</p><button onClick={onClose}><X size={20} color={INK} /></button></div>

        {step === 1 && (
          <Card>
            <p className="text-xs mb-2" style={{ color: SLATE }}>เจ้าของ</p>
            <div className="flex gap-2 mb-4">{INSURANCE_OWNERS.map((o) => <button key={o.id} onClick={() => setOwner(o.id)} style={{ background: owner === o.id ? BRASS : PAPER_DIM, color: owner === o.id ? 'white' : SLATE }} className="rounded-full px-3 py-1.5 text-xs">{o.label}</button>)}</div>
            <p className="text-xs mb-2" style={{ color: SLATE }}>ประเภทกรมธรรม์</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {INSURANCE_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{ background: category === c.id ? BRASS : 'white', color: category === c.id ? 'white' : INK, border: `1px solid ${category === c.id ? BRASS : BORDER}` }} className="rounded-xl py-3 text-center text-[11px] font-semibold">
                  <p className="text-lg mb-1">{c.emoji}</p>{c.label}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm">ถัดไป</button>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <p className="text-xs mb-2" style={{ color: SLATE }}>แนบรูปกรมธรรม์/ตารางผลประโยชน์ (เลือกได้หลายรูป)</p>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            <button onClick={() => fileRef.current && fileRef.current.click()} style={{ border: `2px dashed ${BORDER}` }} className="w-full rounded-2xl py-6 text-center mb-3">
              <Camera size={26} color={SLATE} /><p className="text-xs mt-2" style={{ color: SLATE }}>{files.length > 0 ? `เลือกไว้ ${files.length} รูป` : 'ถ่ายรูป/เลือกรูปตารางผลประโยชน์'}</p>
            </button>
            {scanError && <p className="text-xs mb-2" style={{ color: BAD }}>{scanError}</p>}
            <button onClick={runScan} disabled={files.length === 0 || scanning} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 mb-2">{scanning ? <Loader2 size={14} className="animate-spin" /> : '🤖'} {scanning ? 'กำลังอ่านข้อมูล...' : 'ให้ AI อ่านข้อมูลจากรูป'}</button>
            <button onClick={startManual} style={{ border: `1px solid ${BORDER}` }} className="w-full rounded-lg py-2.5 text-sm">✏️ กรอกเองแทน (ไม่ถ่ายรูป)</button>
          </Card>
        )}

        {step === 3 && draft && (
          <InsurancePolicyReviewForm draft={draft} setDraft={setDraft} onSave={saveAll} category={category} />
        )}
      </div>
    </div>
  );
}

function InsurancePolicyReviewForm({ draft, setDraft, onSave, category }) {
  function setField(k, v) { setDraft({ ...draft, [k]: v }); }
  function setRiderField(idx, k, v) { const riders = [...draft.riders]; riders[idx] = { ...riders[idx], [k]: v }; setDraft({ ...draft, riders }); }
  function setRiderPatch(idx, patch) { const riders = [...draft.riders]; riders[idx] = { ...riders[idx], ...patch }; setDraft({ ...draft, riders }); }
  function addRiderRow() { setDraft({ ...draft, riders: [...(draft.riders || []), { name: '', type: category, sumInsured: 0, deathBenefit: 0, premiumAmount: 0, taxDeductible: 'no', notes: '', benefitItems: [] }] }); }
  function removeRiderRow(idx) { setDraft({ ...draft, riders: draft.riders.filter((_, i) => i !== idx) }); }
  const partialErrors = draft._partialErrors || [];
  return (
    <div>
      <div className="ai-banner" style={{ background: '#FFF6E5', border: '1px solid #E7D0A0', borderRadius: 12, padding: '10px 12px', fontSize: 11.5, color: '#8a6d1f', marginBottom: 12 }}>🤖 เช็คความถูกต้องก่อนบันทึก แก้ไขได้ทุกช่อง — ช่องที่ไม่พบข้อมูลในรูปจะว่างไว้ ไม่ได้เดา</div>
      {partialErrors.length > 0 && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '10px 12px', fontSize: 11, color: '#991B1B', marginBottom: 12 }}>
          ⚠️ อ่านไม่สำเร็จบางรูป ({partialErrors.length}):
          {partialErrors.map((e, i) => <div key={i} style={{ marginTop: 3 }}>• {e}</div>)}
        </div>
      )}
      <Card>
        <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>ข้อมูลกรมธรรม์</p>
        <label className="text-[10px]" style={{ color: SLATE }}>บริษัทประกัน</label>
        <input value={draft.company || ''} onChange={(e) => setField('company', e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <label className="text-[10px]" style={{ color: SLATE }}>ชื่อแผน</label>
        <input value={draft.planName || ''} onChange={(e) => setField('planName', e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <label className="text-[10px]" style={{ color: SLATE }}>เลขกรมธรรม์</label>
        <input value={draft.policyNumber || ''} onChange={(e) => setField('policyNumber', e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>เริ่มคุ้มครอง</label><input type="date" value={draft.startDate || ''} onChange={(e) => setField('startDate', e.target.value)} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ครบกำหนด/ต่ออายุ</label><input type="date" value={draft.endDate || ''} onChange={(e) => setField('endDate', e.target.value)} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>เบี้ยรวม</label><NumInput value={draft.premiumAmount} onChange={(v) => setField('premiumAmount', v)} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ความถี่จ่าย</label>
            <select value={draft.premiumFrequency || 'year'} onChange={(e) => setField('premiumFrequency', e.target.value)} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }}>
              <option value="year">รายปี</option><option value="month">รายเดือน</option>
            </select>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-2"><p className="text-xs font-semibold" style={{ color: SLATE }}>สัญญาหลัก/สัญญาเพิ่มเติม ({(draft.riders || []).length})</p><button onClick={addRiderRow} className="text-xs font-semibold" style={{ color: BRASS }}>+ เพิ่มสัญญา</button></div>
        {(draft.riders || []).map((r, idx) => (
          <div key={idx} style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <input value={r.name || ''} onChange={(e) => setRiderField(idx, 'name', e.target.value)} placeholder="ชื่อสัญญา" className="rounded px-2 py-1 text-xs flex-1 mr-2" style={{ border: `1px solid ${BORDER}` }} />
              <button onClick={() => removeRiderRow(idx)}><Trash2 size={14} color={BAD} /></button>
            </div>
            <select value={r.type} onChange={(e) => setRiderField(idx, 'type', e.target.value)} className="rounded px-2 py-1 text-xs w-full mb-2" style={{ border: `1px solid ${BORDER}` }}>
              {RIDER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div><label className="text-[9px]" style={{ color: SLATE }}>ทุนประกัน/ผลประโยชน์หลัก</label><NumInput value={r.sumInsured} onChange={(v) => setRiderField(idx, 'sumInsured', v)} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
              <div><label className="text-[9px]" style={{ color: SLATE }}>ผลประโยชน์กรณีเสียชีวิต</label><NumInput value={r.deathBenefit} onChange={(v) => setRiderField(idx, 'deathBenefit', v)} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
            </div>
            <RiderExtraFields r={r} onChange={(patch) => setRiderPatch(idx, patch)} />
            <label className="text-[9px]" style={{ color: SLATE }}>รายละเอียดผลประโยชน์ (แยกรายการ)</label>
            <RiderBenefitItems items={r.benefitItems} onChange={(items) => setRiderField(idx, 'benefitItems', items)} />
            <div className="mb-2">
              <label className="text-[9px]" style={{ color: SLATE }}>ลดหย่อนภาษีได้</label>
              <select value={r.taxDeductible || 'no'} onChange={(e) => setRiderField(idx, 'taxDeductible', e.target.value)} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
                <option value="yes">ได้</option><option value="partial">ได้บางส่วน</option><option value="no">ไม่ได้</option>
              </select>
            </div>
            <label className="text-[9px]" style={{ color: SLATE }}>หมายเหตุ (เงื่อนไขสำคัญ/ตามที่จ่ายจริง)</label>
            <textarea value={r.notes || ''} onChange={(e) => setRiderField(idx, 'notes', e.target.value)} rows={2} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} />
          </div>
        ))}
      </Card>
      <button onClick={onSave} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm">บันทึกกรมธรรม์</button>
    </div>
  );
}

function InsurancePolicyDetail({ policy: p, onBack, onUpdate, onRemove, onAddRider, onUpdateRider, onRemoveRider, onAddDocument, onRemoveDocument, googleConnected, onAddToCalendar }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [syncingDue, setSyncingDue] = useState(false);
  const [syncDueMsg, setSyncDueMsg] = useState('');
  async function handleUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { await onAddDocument(p.id, file); } catch (err) { /* เงียบไว้ */ }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  async function syncDueReminder() {
    if (!p.nextDueDate) return;
    setSyncingDue(true); setSyncDueMsg('');
    const r = await onAddToCalendar(`ครบกำหนดจ่ายเบี้ยประกัน: ${p.planName || p.company}`, `บริษัท: ${p.company || '-'}\nเลขกรมธรรม์: ${p.policyNumber || '-'}\nเบี้ย: ฿${fmt(p.premiumAmount)}`, p.nextDueDate, p.reminderDays, p.dueCalendarEventId);
    if (r.ok) { onUpdate(p.id, { dueCalendarEventId: r.eventId }); setSyncDueMsg('เพิ่มลงปฏิทินสำเร็จ ✓'); }
    else setSyncDueMsg(`ไม่สำเร็จ: ${r.message}`);
    setSyncingDue(false);
  }
  function toggleDueReminderDay(d) {
    const cur = p.reminderDays || [7, 3, 1];
    onUpdate(p.id, { reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => b - a) });
  }
  const dl = p.endDate ? daysUntil(p.endDate) : null;
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-xs mb-3" style={{ color: BRASS }}>‹ กลับไปดูทุกกรมธรรม์</button>
      <Card>
        <div className="flex justify-between items-center mb-2">
          <input value={p.planName || ''} onChange={(e) => onUpdate(p.id, { planName: e.target.value })} className="text-base font-bold flex-1 outline-none" style={{ border: 'none', color: INK }} />
          <button onClick={onRemove}><Trash2 size={16} color={BAD} /></button>
        </div>
        {dl !== null && <p className="text-xs mb-2" style={{ color: dl < 0 ? BAD : dl <= 30 ? WARN : GOOD }}>{dl < 0 ? '⚫ หมดอายุแล้ว' : `🟢 มีผลคุ้มครอง (ต่ออายุอีก ${dl} วัน)`}</p>}
        <label className="text-[10px]" style={{ color: SLATE }}>บริษัทประกัน</label>
        <input value={p.company || ''} onChange={(e) => onUpdate(p.id, { company: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <label className="text-[10px]" style={{ color: SLATE }}>เลขกรมธรรม์</label>
        <input value={p.policyNumber || ''} onChange={(e) => onUpdate(p.id, { policyNumber: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>เริ่มคุ้มครอง</label><input type="date" value={p.startDate || ''} onChange={(e) => onUpdate(p.id, { startDate: e.target.value })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ครบกำหนด/ต่ออายุ</label><input type="date" value={p.endDate || ''} onChange={(e) => onUpdate(p.id, { endDate: e.target.value })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>เบี้ยรวม</label><NumInput value={p.premiumAmount} onChange={(v) => onUpdate(p.id, { premiumAmount: v })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ความถี่จ่าย</label>
            <select value={p.premiumFrequency || 'year'} onChange={(e) => onUpdate(p.id, { premiumFrequency: e.target.value })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1" style={{ border: `1px solid ${BORDER}` }}>
              <option value="year">รายปี</option><option value="month">รายเดือน</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>เตือนวันครบกำหนดจ่ายเบี้ยครั้งถัดไป</p>
        <label className="text-[10px]" style={{ color: SLATE }}>วันครบกำหนดจ่ายเบี้ย</label>
        <input type="date" value={p.nextDueDate || ''} onChange={(e) => onUpdate(p.id, { nextDueDate: e.target.value })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        {p.nextDueDate && (() => { const d = daysUntil(p.nextDueDate); return d !== null && <p className="text-xs mb-2" style={{ color: d < 0 ? BAD : d <= 14 ? WARN : SLATE }}>{d < 0 ? `🔴 เลยกำหนดมา ${Math.abs(d)} วัน` : `อีก ${d} วันถึงกำหนด`}</p>; })()}
        <p className="text-[10px] mb-1" style={{ color: SLATE }}>เตือนล่วงหน้ากี่วัน</p>
        <div className="flex gap-1.5 mb-2">
          {[7, 3, 1].map((d) => (
            <button key={d} onClick={() => toggleDueReminderDay(d)} style={{ background: (p.reminderDays || [7, 3, 1]).includes(d) ? BRASS : PAPER_DIM, color: (p.reminderDays || [7, 3, 1]).includes(d) ? 'white' : SLATE }} className="text-xs font-semibold px-3 py-1 rounded-full">{d} วัน</button>
          ))}
        </div>
        {googleConnected ? (
          <button onClick={syncDueReminder} disabled={syncingDue || !p.nextDueDate} style={{ background: INK, opacity: p.nextDueDate ? 1 : 0.5 }} className="w-full text-white rounded-lg py-2 text-xs">{syncingDue ? 'กำลังเพิ่ม...' : (p.dueCalendarEventId ? '🔄 อัพเดทในปฏิทิน' : '📅 เพิ่มลงปฏิทิน')}</button>
        ) : <p className="text-[11px]" style={{ color: SLATE }}>เชื่อมต่อ Google Calendar ที่ ⚙️ ตั้งค่า ก่อน ถึงจะเพิ่มเตือนลงปฏิทินได้</p>}
        {syncDueMsg && <p className="text-[11px] mt-1" style={{ color: syncDueMsg.includes('สำเร็จ') ? GOOD : BAD }}>{syncDueMsg}</p>}
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-2"><p className="text-xs font-semibold" style={{ color: SLATE }}>สัญญาหลัก/สัญญาเพิ่มเติม ({(p.riders || []).length})</p><button onClick={() => onAddRider(p.id, {})} className="text-xs font-semibold" style={{ color: BRASS }}>+ เพิ่มสัญญา</button></div>
        {(p.riders || []).map((r) => (
          <div key={r.id} style={{ background: PAPER_DIM, borderRadius: 12 }} className="p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <input value={r.name || ''} onChange={(e) => onUpdateRider(p.id, r.id, { name: e.target.value })} placeholder="ชื่อสัญญา" className="rounded px-2 py-1 text-xs flex-1 mr-2" style={{ border: `1px solid ${BORDER}` }} />
              <button onClick={() => onRemoveRider(p.id, r.id)}><Trash2 size={14} color={BAD} /></button>
            </div>
            <select value={r.type} onChange={(e) => onUpdateRider(p.id, r.id, { type: e.target.value })} className="rounded px-2 py-1 text-xs w-full mb-2" style={{ border: `1px solid ${BORDER}` }}>
              {RIDER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div><label className="text-[9px]" style={{ color: SLATE }}>ทุนประกัน/ผลประโยชน์หลัก</label><NumInput value={r.sumInsured} onChange={(v) => onUpdateRider(p.id, r.id, { sumInsured: v })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
              <div><label className="text-[9px]" style={{ color: SLATE }}>ผลประโยชน์กรณีเสียชีวิต</label><NumInput value={r.deathBenefit} onChange={(v) => onUpdateRider(p.id, r.id, { deathBenefit: v })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
            </div>
            <RiderExtraFields r={r} onChange={(patch) => onUpdateRider(p.id, r.id, patch)} />
            <label className="text-[9px]" style={{ color: SLATE }}>รายละเอียดผลประโยชน์ (แยกรายการ)</label>
            <RiderBenefitItems items={r.benefitItems} onChange={(items) => onUpdateRider(p.id, r.id, { benefitItems: items })} />
            <div className="mb-2">
              <label className="text-[9px]" style={{ color: SLATE }}>ลดหย่อนภาษีได้</label>
              <select value={r.taxDeductible || 'no'} onChange={(e) => onUpdateRider(p.id, r.id, { taxDeductible: e.target.value })} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
                <option value="yes">ได้</option><option value="partial">ได้บางส่วน</option><option value="no">ไม่ได้</option>
              </select>
            </div>
            <label className="text-[9px]" style={{ color: SLATE }}>หมายเหตุ</label>
            <textarea value={r.notes || ''} onChange={(e) => onUpdateRider(p.id, r.id, { notes: e.target.value })} rows={2} className="rounded px-2 py-1 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} />
          </div>
        ))}
      </Card>

      <Card>
        <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>📎 เอกสารแนบ ({(p.documents || []).length})</p>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-xs flex items-center justify-center gap-2 mb-2">{uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} color="#FBBF24" />}{uploading ? 'กำลังอัพโหลด...' : '+ เพิ่มเอกสาร (บัตรประกัน/ใบเสร็จ/ใบเคลม)'}</button>
        {(p.documents || []).map((d) => (
          <div key={d.id} className="flex justify-between items-center py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            <button onClick={() => setLightboxUrl(d.url)} className="text-xs text-left flex-1" style={{ color: INK }}>📄 {d.name}</button>
            <button onClick={() => onRemoveDocument(p.id, d.id)}><Trash2 size={13} color={BAD} /></button>
          </div>
        ))}
      </Card>
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}

function CoverageRow({ r, value, onJump }) {
  return (
    <button onClick={() => onJump(r.policyId)} className="w-full flex justify-between text-sm py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
      <span style={{ color: SLATE }}>{r.name || r.policyName}</span><span className="font-semibold">฿{fmt(value)}</span>
    </button>
  );
}
function CoverageCard({ title, riders, field, onJump, totalLabel, totalMode }) {
  const list = riders.filter((r) => Number(r[field]) > 0);
  if (list.length === 0) return null;
  const total = totalMode === 'max' ? Math.max(0, ...list.map((r) => Number(r[field]) || 0)) : list.reduce((s, r) => s + Number(r[field] || 0), 0);
  return (
    <Card>
      <p className="text-sm font-bold mb-3" style={{ color: INK }}>{title}</p>
      {list.map((r) => <CoverageRow key={r.id} r={r} value={r[field]} onJump={onJump} />)}
      <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `2px solid ${INK}` }}><p className="text-sm font-bold">{totalLabel}</p><p className="text-lg font-bold" style={{ color: GOOD }}>฿{fmt(total)}</p></div>
    </Card>
  );
}
function InsuranceCoverageSection({ policies, onJumpToPolicy }) {
  const [scenario, setScenario] = useState('hospital');
  const riders = allRiders(policies);
  const healthRiders = riders.filter((r) => r.type === 'health');
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {INSURANCE_SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => setScenario(s.id)} style={{ background: scenario === s.id ? INK : 'white', color: scenario === s.id ? 'white' : INK, border: `1px solid ${scenario === s.id ? INK : BORDER}` }} className="rounded-2xl py-3 text-center">
            <p className="text-xl mb-1">{s.emoji}</p><p className="text-[11px]">{s.label}</p>
          </button>
        ))}
      </div>
      {scenario === 'death' && (
        <>
          <Card>
            <p className="text-sm font-bold mb-3" style={{ color: INK }}>💀 ผลประโยชน์กรณีเสียชีวิต</p>
            {riders.filter((r) => Number(r.deathBenefit) > 0).map((r) => <CoverageRow key={r.id} r={r} value={r.deathBenefit} onJump={onJumpToPolicy} />)}
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `2px solid ${INK}` }}><p className="text-sm font-bold">รวมทั้งหมด</p><p className="text-lg font-bold" style={{ color: GOOD }}>฿{fmt(riders.reduce((s, r) => s + Number(r.deathBenefit || 0), 0))}</p></div>
          </Card>
          <CoverageCard title="🚑 เสียชีวิตจากอุบัติเหตุ (เพิ่มเติม)" riders={riders} field="deathAccidentBenefit" onJump={onJumpToPolicy} totalLabel="รวมทั้งหมด" />
          <CoverageCard title="🦽 ทุพพลภาพถาวร" riders={riders} field="disabilityBenefit" onJump={onJumpToPolicy} totalLabel="รวมทั้งหมด" />
          <CoverageCard title="💰 เงินคืนระหว่างสัญญา" riders={riders} field="cashBackAmount" onJump={onJumpToPolicy} totalLabel="รวมทั้งหมด" />
          <CoverageCard title="📜 มูลค่าเวนคืนปัจจุบัน" riders={riders} field="surrenderValue" onJump={onJumpToPolicy} totalLabel="รวมทั้งหมด" />
          <CoverageCard title="🎁 เงินครบกำหนดสัญญา" riders={riders} field="maturityBenefit" onJump={onJumpToPolicy} totalLabel="รวมทั้งหมด" />
        </>
      )}
      {(scenario === 'hospital' || scenario === 'opd') && (
        <>
          <Card>
            <p className="text-sm font-bold mb-3" style={{ color: INK }}>🛏️ ค่าห้อง/คืน</p>
            {riders.filter((r) => Number(r.roomLimit) > 0).map((r) => <CoverageRow key={r.id} r={r} value={r.roomLimit} onJump={onJumpToPolicy} />)}
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `2px solid ${INK}` }}><p className="text-sm font-bold">รวมสูงสุด/คืน</p><p className="text-lg font-bold" style={{ color: GOOD }}>฿{fmt(riders.reduce((s, r) => s + Number(r.roomLimit || 0), 0))}</p></div>
          </Card>
          <Card>
            <p className="text-sm font-bold mb-3" style={{ color: INK }}>💊 วงเงิน{scenario === 'hospital' ? 'ค่ารักษาต่อปี (IPD)' : 'OPD ต่อปี'}</p>
            {riders.filter((r) => Number(scenario === 'hospital' ? r.ipdLimit : r.opdLimit) > 0).map((r) => <CoverageRow key={r.id} r={r} value={scenario === 'hospital' ? r.ipdLimit : r.opdLimit} onJump={onJumpToPolicy} />)}
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `2px solid ${INK}` }}><p className="text-sm font-bold">วงเงินสูงสุด</p><p className="text-lg font-bold" style={{ color: GOOD }}>฿{fmt(Math.max(0, ...riders.map((r) => Number(scenario === 'hospital' ? r.ipdLimit : r.opdLimit) || 0)))}</p></div>
          </Card>
          {scenario === 'hospital' && (
            <>
              <CoverageCard title="🏥 ICU/คืน" riders={riders} field="icuLimit" onJump={onJumpToPolicy} totalLabel="รวมสูงสุด/คืน" />
              <CoverageCard title="🔪 ค่าผ่าตัด" riders={riders} field="surgeryLimit" onJump={onJumpToPolicy} totalLabel="รวมสูงสุด" />
              <CoverageCard title="🚨 ER (ฉุกเฉิน)" riders={riders} field="erLimit" onJump={onJumpToPolicy} totalLabel="รวมสูงสุด/ครั้ง" />
              <CoverageCard title="🚑 รถพยาบาล" riders={riders} field="ambulanceLimit" onJump={onJumpToPolicy} totalLabel="รวมสูงสุด" />
            </>
          )}
          {riders.filter((r) => Number(r.deductible) > 0 || Number(r.copaymentPct) > 0).length > 0 && (
            <Card>
              <p className="text-xs font-semibold mb-2" style={{ color: WARN }}>⚠️ ต้องจ่ายเองบางส่วน</p>
              {riders.filter((r) => Number(r.deductible) > 0).map((r) => <p key={`d-${r.id}`} className="text-[11px] mb-1" style={{ color: SLATE }}>{r.name || r.policyName} — Deductible จ่ายเอง ฿{fmt(r.deductible)}</p>)}
              {riders.filter((r) => Number(r.copaymentPct) > 0).map((r) => <p key={`c-${r.id}`} className="text-[11px] mb-1" style={{ color: SLATE }}>{r.name || r.policyName} — Copayment {r.copaymentPct}%</p>)}
            </Card>
          )}
        </>
      )}
      {scenario === 'critical' && (
        <>
          <Card>
            <p className="text-sm font-bold mb-3" style={{ color: INK }}>🧬 เงินก้อนที่ได้รับ (เจอจ่ายจบ/โรคร้ายแรง)</p>
            {riders.filter((r) => r.type === 'critical').map((r) => <CoverageRow key={r.id} r={r} value={r.sumInsured} onJump={onJumpToPolicy} />)}
            <div className="flex justify-between mt-2 pt-2" style={{ borderTop: `2px solid ${INK}` }}><p className="text-sm font-bold">รวมทั้งหมด</p><p className="text-lg font-bold" style={{ color: GOOD }}>฿{fmt(riders.filter((r) => r.type === 'critical').reduce((s, r) => s + Number(r.sumInsured || 0), 0))}</p></div>
          </Card>
          <CoverageCard title="🎗️ ค่ารักษามะเร็งที่เบิกได้ (จากประกันสุขภาพ)" riders={healthRiders} field="cancerLimit" onJump={onJumpToPolicy} totalLabel="วงเงินสูงสุด" totalMode="max" />
          {riders.filter((r) => r.type === 'critical' && (r.coveredDiseases || r.diagnosisCondition || r.payoutType || r.continuesAfterClaim)).map((r) => (
            <Card key={`detail-${r.id}`}>
              <p className="text-xs font-semibold mb-1" style={{ color: INK }}>{r.name || r.policyName}</p>
              {r.coveredDiseases && <p className="text-[11px] mb-1" style={{ color: SLATE }}>โรคที่คุ้มครอง: {r.coveredDiseases}</p>}
              {r.diagnosisCondition && <p className="text-[11px] mb-1" style={{ color: SLATE }}>เงื่อนไขวินิจฉัย: {r.diagnosisCondition}</p>}
              <p className="text-[11px]" style={{ color: SLATE }}>{r.payoutType === 'multiple' ? 'จ่ายได้หลายครั้ง' : 'จ่ายครั้งเดียวจบ'} · {r.continuesAfterClaim === 'yes' ? 'เคลมแล้วยังคุ้มครองต่อ' : 'เคลมแล้วสัญญาสิ้นสุด'}</p>
            </Card>
          ))}
        </>
      )}
      {scenario === 'accident' && (
        <Card>
          <p className="text-sm font-bold mb-3" style={{ color: INK }}>🚑 อุบัติเหตุ</p>
          {riders.filter((r) => r.type === 'accident').map((r) => <CoverageRow key={r.id} r={r} value={r.sumInsured} onJump={onJumpToPolicy} />)}
        </Card>
      )}
      {scenario === 'car' && (
        <>
          {riders.filter((r) => r.type === 'car').map((r) => (
            <Card key={r.id}>
              <button onClick={() => onJumpToPolicy(r.policyId)} className="w-full text-left mb-2"><p className="text-sm font-bold" style={{ color: INK }}>🚗 {r.name || r.policyName} {r.vehiclePlate ? `· ${r.vehiclePlate}` : ''}</p></button>
              <div className="grid grid-cols-2 gap-y-1 text-[11px]" style={{ color: SLATE }}>
                {r.insuranceClass && <p>ชั้นประกัน: {r.insuranceClass}</p>}
                {Number(r.sumInsured) > 0 && <p>ทุนประกัน: ฿{fmt(r.sumInsured)}</p>}
                {Number(r.carDeductible) > 0 && <p>ค่าเสียหายส่วนแรก: ฿{fmt(r.carDeductible)}</p>}
                {r.theftFireCoverage && <p>รถหาย/ไฟไหม้: {r.theftFireCoverage === 'yes' ? 'คุ้มครอง' : 'ไม่คุ้มครอง'}</p>}
                {Number(r.thirdPartyCoverage) > 0 && <p>คุ้มครองคู่กรณี: ฿{fmt(r.thirdPartyCoverage)}</p>}
                {r.compulsoryInsurance && <p>พ.ร.บ.: {r.compulsoryInsurance}</p>}
                {r.garageType && <p>ซ่อม: {r.garageType === 'center' ? 'ศูนย์' : 'อู่'}</p>}
                {r.emergencyHotline && <p>เบอร์แจ้งเหตุ: {r.emergencyHotline}</p>}
              </div>
            </Card>
          ))}
          {riders.filter((r) => r.type === 'car').length === 0 && <Card><p className="text-xs text-center py-4" style={{ color: SLATE }}>ยังไม่มีกรมธรรม์รถยนต์บันทึกไว้</p></Card>}
        </>
      )}
      {riders.filter((r) => r.notes).length > 0 && (
        <Card>
          <p className="text-xs font-semibold mb-2" style={{ color: WARN }}>⚠️ ข้อควรระวัง</p>
          {riders.filter((r) => r.notes).map((r) => <p key={r.id} className="text-[11px] mb-1.5" style={{ color: SLATE }}>{r.name}: {r.notes}</p>)}
        </Card>
      )}
    </div>
  );
}

function InsuranceClaimsSection({ policies, claims, onAddClaim, onUpdateClaim, onRemoveClaim }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), policyId: '', hospital: '', diagnosis: '', type: 'opd', billedAmount: 0, paidByInsurance: 0, paidBySelf: 0 });
  const riders = allRiders(policies);
  const opdRiders = riders.filter((r) => Number(r.opdLimit) > 0);
  const thisYear = new Date().getFullYear();
  const opdUsedThisYear = claims.filter((c) => c.type === 'opd' && new Date(c.date).getFullYear() === thisYear).reduce((s, c) => s + Number(c.paidByInsurance || 0), 0);
  const opdMax = Math.max(0, ...opdRiders.map((r) => Number(r.opdLimit) || 0));
  return (
    <div>
      {opdMax > 0 && (
        <Card>
          <div className="flex justify-between text-xs mb-1"><span style={{ color: SLATE }}>OPD ปี {thisYear}</span><span className="font-semibold">฿{fmt(opdUsedThisYear)} / ฿{fmt(opdMax)}</span></div>
          <div style={{ background: PAPER_DIM }} className="h-2 rounded-full overflow-hidden"><div style={{ width: `${Math.min(100, (opdUsedThisYear / opdMax) * 100)}%`, background: BRASS }} className="h-full rounded-full" /></div>
        </Card>
      )}
      <Card>
        <p className="text-xs font-semibold mb-2" style={{ color: SLATE }}>บันทึกการเคลมใหม่</p>
        <label className="text-[10px]" style={{ color: SLATE }}>วันที่</label>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <label className="text-[10px]" style={{ color: SLATE }}>กรมธรรม์ที่ใช้เคลม</label>
        <select value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }}>
          <option value="">— เลือกกรมธรรม์ —</option>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.planName || p.company}</option>)}
        </select>
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label>
        <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: `1px solid ${BORDER}` }} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mb-2" style={{ border: `1px solid ${BORDER}` }}>
          <option value="opd">OPD</option><option value="ipd">IPD</option><option value="other">อื่นๆ</option>
        </select>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div><label className="text-[9px]" style={{ color: SLATE }}>ค่ารักษารวม</label><NumInput value={form.billedAmount} onChange={(v) => setForm({ ...form, billedAmount: v })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[9px]" style={{ color: SLATE }}>ประกันจ่าย</label><NumInput value={form.paidByInsurance} onChange={(v) => setForm({ ...form, paidByInsurance: v })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
          <div><label className="text-[9px]" style={{ color: SLATE }}>จ่ายเอง</label><NumInput value={form.paidBySelf} onChange={(v) => setForm({ ...form, paidBySelf: v })} className="rounded-lg px-2 py-1.5 text-xs w-full mt-0.5" style={{ border: `1px solid ${BORDER}` }} /></div>
        </div>
        <button onClick={() => { onAddClaim(form); setForm({ ...form, hospital: '', diagnosis: '', billedAmount: 0, paidByInsurance: 0, paidBySelf: 0 }); }} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกการเคลม</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติการเคลม</p>
      {claims.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีประวัติ</p>}
      {[...claims].sort((a, b) => b.date.localeCompare(a.date)).map((c) => {
        const pol = policies.find((p) => p.id === c.policyId);
        return (
          <Card key={c.id}>
            <div className="flex justify-between items-center">
              <div><p className="text-sm" style={{ color: INK }}>{c.hospital} · {c.type.toUpperCase()}</p><p className="text-xs" style={{ color: SLATE }}>{formatDateDMY(c.date)}{pol ? ` · ${pol.planName || pol.company}` : ''}</p></div>
              <div className="flex items-center gap-2"><span className="text-sm font-semibold" style={{ color: GOOD }}>+฿{fmt(c.paidByInsurance)}</span><button onClick={() => onRemoveClaim(c.id)}><Trash2 size={14} color={BAD} /></button></div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function InsuranceManageSection({ policies, onJumpToPolicy }) {
  const withEndDate = policies.filter((p) => p.endDate).map((p) => ({ ...p, dl: daysUntil(p.endDate) })).sort((a, b) => a.dl - b.dl);
  const next3MonthsPremium = policies.filter((p) => { const dl = p.endDate ? daysUntil(p.endDate) : null; return dl !== null && dl >= 0 && dl <= 90; }).reduce((s, p) => s + Number(p.premiumAmount || 0), 0);
  return (
    <div>
      {next3MonthsPremium > 0 && (
        <Card><p className="text-xs mb-1" style={{ color: SLATE }}>เบี้ยที่ต้องจ่าย 3 เดือนข้างหน้า</p><p className="text-xl font-bold" style={{ color: INK }}>฿{fmt(next3MonthsPremium)}</p></Card>
      )}
      <p className="text-xs mb-2" style={{ color: SLATE }}>สถานะต่ออายุ/ชำระเบี้ย</p>
      {withEndDate.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีกรมธรรม์ที่มีวันครบกำหนด</p>}
      {withEndDate.map((p) => (
        <button key={p.id} onClick={() => onJumpToPolicy(p.id)} className="w-full text-left">
          <Card>
            <div className="flex items-center gap-2">
              <span>{p.dl < 0 ? '⚫' : p.dl <= 30 ? '🔴' : p.dl <= 90 ? '🟡' : '🟢'}</span>
              <div className="flex-1"><p className="text-sm" style={{ color: INK }}>{p.planName || p.company}</p><p className="text-xs" style={{ color: SLATE }}>{p.dl < 0 ? 'หมดอายุแล้ว' : `ครบกำหนดอีก ${p.dl} วัน`} · {formatDateDMY(p.endDate)}</p></div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

function RealEstateCalendarSection({ properties, googleConnected, onSelectProperty }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed
  const ymKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // รวมเหตุการณ์ของทุกทรัพย์สินในเดือนนี้ — วันครบกำหนดจ่ายค่าเช่า (สถานะ: จ่ายแล้ว/ใกล้ถึง/ค้างชำระ) และวันครบสัญญา
  const events = [];
  properties.forEach((p) => {
    if (p.status === 'occupied' && p.rentDueDay) {
      const dueDate = new Date(year, month, Number(p.rentDueDay));
      const pay = (p.payments || {})[ymKey] || {};
      let status = 'upcoming';
      if (pay.paid) status = 'paid';
      else if (dueDate < today) status = 'overdue';
      events.push({ day: Number(p.rentDueDay), type: 'rent', status, label: `เก็บค่าเช่า ${p.name}`, abbrev: propertyAbbrev(p.name), amount: p.rent, propertyId: p.id });
    }
    if (p.contractEndDate) {
      const d = new Date(p.contractEndDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        events.push({ day: d.getDate(), type: 'contract', status: 'contract', label: `ครบสัญญา ${p.name}`, abbrev: propertyAbbrev(p.name), sub: `ครบกำหนด ${formatDateDMY(p.contractEndDate)}`, propertyId: p.id });
      }
    }
  });
  const eventsByDay = {};
  events.forEach((e) => { if (!eventsByDay[e.day]) eventsByDay[e.day] = []; eventsByDay[e.day].push(e); });
  const statusColor = { paid: GOOD, upcoming: BRASS, overdue: BAD, contract: '#2563EB' };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // จันทร์ = 0
  const cells = [...Array(firstWeekday).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  const sortedEvents = [...events].sort((a, b) => a.day - b.day);

  return (
    <div>
      <Card>
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} color={SLATE} /></button>
          <p className="text-sm font-bold" style={{ color: INK }}>{THAI_MONTHS[month]} {year + 543}</p>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={18} color={SLATE} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((d) => <p key={d} className="text-center text-[10px]" style={{ color: SLATE }}>{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const dayEvents = day ? eventsByDay[day] : null;
            const hasEvents = dayEvents && dayEvents.length > 0;
            const cellColor = hasEvents ? statusColor[dayEvents[0].status] : null;
            const isToday = day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            return (
              <div key={i} className="flex flex-col items-center pt-1" style={{ minHeight: 44, background: cellColor ? `${cellColor}14` : (isToday ? PAPER_DIM : 'transparent'), borderRadius: 10 }}>
                {day && <span className="text-[11px]" style={{ color: cellColor || (isToday ? BRASS : INK), fontWeight: hasEvents || isToday ? 700 : 400 }}>{day}</span>}
                {hasEvents && (
                  <div className="flex flex-col items-center" style={{ maxWidth: 40, lineHeight: 1.25 }}>
                    {dayEvents.map((e, ei) => <span key={ei} style={{ fontSize: 8.5, fontWeight: 700, color: statusColor[e.status] }}>{e.abbrev}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="text-[10px]" style={{ color: GOOD }}>■ จ่ายแล้ว</span>
          <span className="text-[10px]" style={{ color: BRASS }}>■ ใกล้ถึง</span>
          <span className="text-[10px]" style={{ color: BAD }}>■ ค้างชำระ</span>
          <span className="text-[10px]" style={{ color: '#2563EB' }}>■ ครบสัญญา</span>
        </div>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>รายการแจ้งเตือน</p>
        {sortedEvents.length === 0 && <p className="text-xs" style={{ color: SLATE }}>เดือนนี้ไม่มีรายการแจ้งเตือน</p>}
        {sortedEvents.map((e, i) => (
          <button key={i} onClick={() => onSelectProperty && onSelectProperty(e.propertyId)} className="w-full text-left flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ background: `${statusColor[e.status]}18`, color: statusColor[e.status], borderRadius: 10, width: 44, flexShrink: 0, textAlign: 'center', padding: '4px 0' }}>
              <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{e.day}</p>
              <p style={{ fontSize: 9 }}>{THAI_MONTHS[month].slice(0, 3)}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: INK }}>{e.label}</p>
              <p className="text-xs" style={{ color: SLATE }}>{e.sub || (e.amount ? `${fmt(e.amount)} บาท` : '')}</p>
            </div>
            {e.type === 'rent' && (
              <span style={{ background: e.status === 'paid' ? '#E1F5E9' : e.status === 'overdue' ? '#FBE3E1' : '#FBF3E9', color: statusColor[e.status] }} className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                {e.status === 'paid' ? 'เก็บแล้ว' : e.status === 'overdue' ? 'ค้างชำระ' : 'ใกล้ถึง'}
              </span>
            )}
          </button>
        ))}
      </Card>
      {!googleConnected && <p className="text-xs" style={{ color: SLATE }}>เชื่อมต่อ Google Calendar ในหน้าตั้งค่าก่อน เพื่อรับการแจ้งเตือนอัตโนมัติจากหน้าข้อมูลของแต่ละทรัพย์สิน</p>}
    </div>
  );
}

function DogOverviewSection({ dog, setSection, onRunHealthInsight }) {
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (onRunHealthInsight && (!dog.aiHealthInsight || dog.aiHealthInsight.date !== todayStr)) onRunHealthInsight(dog.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dog.id]);
  const sortedWeights = [...(dog.weights || [])].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = sortedWeights[sortedWeights.length - 1];
  const recentWeights = sortedWeights.slice(-8).map((w) => Number(w.weight));
  const weightDelta = recentWeights.length >= 2 ? recentWeights[recentWeights.length - 1] - recentWeights[recentWeights.length - 2] : 0;
  const thisYear = new Date().getFullYear();
  const expensesThisYear = (dog.expenses || []).filter((e) => e.date.startsWith(String(thisYear))).reduce((s, e) => s + Number(e.amount || 0), 0);
  const expensesLifetime = (dog.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const activeMeds = (dog.medications || []).filter((m) => !m.stopDate);
  const nextAppt = [...(dog.appointments || [])].filter((a) => daysUntil(a.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  const lastVetVisit = [...(dog.vetVisits || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
  const ft = dog.fleaTick || {};
  const nextFleaDue = ft.lastGivenDate ? (() => { const d = new Date(ft.lastGivenDate); d.setDate(d.getDate() + Number(ft.intervalDays || 84)); return d.toISOString().slice(0, 10); })() : null;
  const insights = computeDogInsights(dog);

  return (
    <div>
      <Card>
        <p className="text-lg font-semibold mb-1">{dog.name}{dog.nickname && ` (${dog.nickname})`}</p>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="อายุ" value={ageString(dog.birthdate)} />
          <WeightStatBox label="น้ำหนักล่าสุด" value={latestWeight ? `${latestWeight.weight} กก.` : '-'} trendValues={recentWeights.length >= 2 ? recentWeights : null} trendColor={weightDelta < 0 ? BAD : weightDelta > 0 ? GOOD : SLATE} onClick={() => setSection('weight')} />
          <StatBox label="BCS" value={dog.bcs || '-'} />
          <StatBox label="เพศ/สี" value={`${dog.sex || '-'} / ${dog.color || '-'}`} />
        </div>
      </Card>
      {dog.aiHealthInsight && dog.aiHealthInsight.text && (
        <Card>
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: BRASS }}>🤖 AI วิเคราะห์สุขภาพ</p>
          {dog.aiHealthInsight.text.split('\n').filter((line) => line.trim()).map((line, i) => (
            <p key={i} className="text-sm mb-1" style={{ color: INK }}>{line.replace(/^[•\-*]\s*/, '• ')}</p>
          ))}
          <p className="text-[10px] mt-2" style={{ color: SLATE }}>⚠️ เป็นการสรุปเบื้องต้นจากข้อมูลที่บันทึกไว้ ไม่ใช่คำวินิจฉัยทางการแพทย์ ควรปรึกษาสัตวแพทย์เสมอ</p>
        </Card>
      )}
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>สรุปสำคัญ</p>
        <p className="text-sm mb-1">โรคประจำตัว: {dog.chronicDiseases || 'ไม่มี'}</p>
        <p className="text-sm mb-1">แพ้ยา: {dog.drugAllergies || 'ไม่มี'}</p>
        <p className="text-sm mb-1">ยาที่กำลังกิน: {activeMeds.length > 0 ? activeMeds.map((m) => m.name).join(', ') : 'ไม่มี'}</p>
        <button onClick={() => setSection && setSection('vetvisits')} className="flex items-center justify-between w-full text-left mb-1" style={{ background: 'transparent' }}>
          <span className="text-sm">ไปหาหมอล่าสุด: {lastVetVisit ? `${lastVetVisit.date} - ${lastVetVisit.reason || '-'}` : 'ยังไม่มีบันทึก'}</span>
          <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
        </button>
        <button onClick={() => setSection && setSection('appt')} className="flex items-center justify-between w-full text-left mb-1" style={{ background: 'transparent' }}>
          <span className="text-sm">นัดถัดไป: {nextAppt ? `${nextAppt.date} · ${nextAppt.hospital || '-'}` : 'ไม่มี'}</span>
          <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
        </button>
        <button onClick={() => setSection && setSection('flea')} className="flex items-center justify-between w-full text-left mb-1" style={{ background: 'transparent' }}>
          <span className="text-sm">ยาเห็บหมัดครั้งถัดไป: {nextFleaDue || 'ยังไม่ได้ตั้งค่า'}</span>
          <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
        </button>
        <button onClick={() => setSection && setSection('insurance')} className="flex items-center justify-between w-full text-left" style={{ background: 'transparent' }}>
          <span className="text-sm">ประกันหมดอายุ: {dog.insurance?.endDate || 'ไม่มี'}</span>
          <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
        </button>
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
            <button key={r.label} onClick={() => setSection && setSection('records')} className="mb-2 pb-2 w-full text-left" style={{ borderBottom: '1px solid #E7EAF0', background: 'transparent' }}>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">{r.label}</span>
                <span className="flex items-center gap-1">
                  <span style={{ color: r.item ? INK : SLATE }}>{r.item ? r.item.date : 'ยังไม่เคยตรวจ'}</span>
                  <ChevronRight size={15} color={SLATE} style={{ flexShrink: 0 }} />
                </span>
              </div>
              {r.item && r.item.note && <p className="text-xs mt-0.5" style={{ color: SLATE }}>{r.item.note}</p>}
            </button>
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
        {insights.map((it, i) => <InsightRow key={i} tone={it.tone} text={it.text} onClick={it.section ? () => setSection && setSection(it.section) : undefined} />)}
      </Card>
      <DogLatestChecksSummary dog={dog} setSection={setSection} />
      <DogHealthTimeline dog={dog} setSection={setSection} />
    </div>
  );
}

// Timeline รวมประวัติสุขภาพ — เกิดขึ้นแล้ว (✅) เรียงกับกำลังจะมาถึง (⏰) ในเส้นเดียว แตะแต่ละอันกระโดดไปแท็บที่เกี่ยวข้องได้
const TIMELINE_TYPES = [
  { key: 'blood', label: 'ตรวจเลือด', icon: '🩸' },
  { key: 'organ', label: 'อวัยวะ', icon: '🫁' },
  { key: 'imaging', label: 'Imaging', icon: '🩻' },
  { key: 'appt', label: 'นัดหมาย', icon: '📅' },
  { key: 'insurance', label: 'ประกัน', icon: '🛡️' },
];
function buildDogTimelineItems(dog) {
  const items = [];
  (dog.imaging || []).forEach((r) => items.push({ date: r.date, label: r.type || 'Imaging', done: true, section: 'records', type: 'imaging' }));
  (dog.bloodTests || []).forEach((r) => items.push({ date: r.date, label: `ตรวจเลือด${r.type ? ' — ' + r.type : ''}`, done: true, section: 'records', type: 'blood' }));
  (dog.organExams || []).forEach((r) => items.push({ date: r.date, label: `ตรวจอวัยวะ — ${r.organ || ''}`, done: true, section: 'records', type: 'organ' }));
  (dog.appointments || []).forEach((a) => {
    const d = daysUntil(a.date);
    items.push({ date: a.date, label: `นัดหมาย${a.purpose ? ' — ' + a.purpose : ''}`, done: d === null || d < 0, section: 'appt', type: 'appt' });
  });
  if (dog.insurance && dog.insurance.endDate) {
    items.push({ date: dog.insurance.endDate, label: 'ต่อประกัน', done: daysUntil(dog.insurance.endDate) < 0, section: 'insurance', type: 'insurance' });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

// สรุปว่าแต่ละประเภทการตรวจ (ผลเลือด/อวัยวะ/Imaging แยกย่อยตามชนิด) ล่าสุดตรวจไปเมื่อไหร่ — เอาไว้เปิดดูตอนลูกป่วยว่าเช็คอะไรไปล่าสุดตอนไหน
function DogLatestChecksSummary({ dog, setSection }) {
  const latest = {};
  (dog.bloodTests || []).forEach((r) => { const k = `🩸 ตรวจเลือด — ${r.type || 'ทั่วไป'}`; if (!latest[k] || latest[k] < r.date) latest[k] = r.date; });
  (dog.organExams || []).forEach((r) => { const k = `🫁 ตรวจอวัยวะ — ${r.organ || 'ทั่วไป'}`; if (!latest[k] || latest[k] < r.date) latest[k] = r.date; });
  (dog.imaging || []).forEach((r) => { const k = `🩻 ${r.type || 'Imaging'}`; if (!latest[k] || latest[k] < r.date) latest[k] = r.date; });
  const rows = Object.entries(latest).sort((a, b) => a[0].localeCompare(b[0]));
  if (rows.length === 0) return null;
  return (
    <Card>
      <p className="text-xs mb-3" style={{ color: SLATE }}>สรุปการตรวจล่าสุดแยกตามประเภท</p>
      {rows.map(([label, date], i) => (
        <button key={label} onClick={() => setSection && setSection('records')} className="w-full flex justify-between items-center py-2 text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none', background: 'transparent' }}>
          <span className="text-sm" style={{ color: INK }}>{label}</span>
          <span className="text-xs" style={{ color: SLATE }}>{date}</span>
        </button>
      ))}
    </Card>
  );
}

function DogHealthTimeline({ dog, setSection }) {
  const [showAll, setShowAll] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const allItems = buildDogTimelineItems(dog);
  const recent = allItems.slice(-8);
  if (allItems.length === 0) return null;

  function renderList(items) {
    const groupsByYear = {};
    items.forEach((it) => { const y = it.date.slice(0, 4); if (!groupsByYear[y]) groupsByYear[y] = []; groupsByYear[y].push(it); });
    const years = Object.keys(groupsByYear).sort().reverse();
    return years.map((y) => (
      <div key={y} className="mb-3">
        <p className="text-[11px] font-bold mb-2" style={{ color: SLATE }}>{y}</p>
        {[...groupsByYear[y]].reverse().map((it, i) => (
          <button key={i} onClick={() => it.section && setSection && setSection(it.section)} className="w-full text-left flex gap-2.5" style={{ background: 'transparent' }}>
            <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: it.done ? '#E1F5E9' : '#FBF3E9', color: it.done ? GOOD : BRASS, fontSize: 11 }} className="flex items-center justify-center">{it.done ? '✅' : '⏰'}</div>
              {i < groupsByYear[y].length - 1 && <div style={{ width: 2, flex: 1, background: BORDER, minHeight: 14 }} />}
            </div>
            <div className="pb-3.5">
              <p className="text-[11px]" style={{ color: SLATE }}>{it.date}</p>
              <p className="text-sm font-semibold" style={{ color: INK }}>{it.label}</p>
            </div>
          </button>
        ))}
      </div>
    ));
  }

  const filteredAll = filterType === 'all' ? allItems : allItems.filter((it) => it.type === filterType);

  return (
    <>
      <Card>
        <p className="text-xs mb-3" style={{ color: SLATE }}>Timeline ประวัติสุขภาพ</p>
        {renderList(recent)}
        <button onClick={() => setShowAll(true)} className="text-xs font-semibold mt-1" style={{ color: BRASS }}>ดูทั้งหมด ({allItems.length} รายการ)</button>
      </Card>
      {showAll && (
        <div style={{ background: '#00000066' }} className="fixed inset-0 z-50 flex items-end">
          <div style={{ background: PAPER }} className="w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3"><p className="text-sm font-semibold">ประวัติสุขภาพทั้งหมด</p><button onClick={() => setShowAll(false)}><X size={20} color={INK} /></button></div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              <button onClick={() => setFilterType('all')} style={{ background: filterType === 'all' ? BRASS : PAPER_DIM, color: filterType === 'all' ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs">ทั้งหมด</button>
              {TIMELINE_TYPES.map((t) => (
                <button key={t.key} onClick={() => setFilterType(t.key)} style={{ background: filterType === t.key ? BRASS : PAPER_DIM, color: filterType === t.key ? 'white' : SLATE, flexShrink: 0 }} className="rounded-full px-3 py-1.5 text-xs whitespace-nowrap">{t.icon} {t.label}</button>
              ))}
            </div>
            {filteredAll.length === 0 ? <p className="text-xs" style={{ color: SLATE }}>ไม่มีรายการ</p> : renderList(filteredAll)}
          </div>
        </div>
      )}
    </>
  );
}

// ปุ่มคัดลอกข้อมูล (เห็บหมัด/ประกัน/ข้อมูลส่วนตัว) ไปยังลูกตัวอื่น — เลือกได้หลายตัว แล้วค่อยไปแก้เฉพาะจุดที่ต่างทีหลัง
function CopyToOthersButton({ dogs, currentDogId, onCopy, label }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const others = (dogs || []).filter((d) => d.id !== currentDogId);
  function toggle(id) { setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]); }
  function confirm() { onCopy(selected); setSelected([]); setOpen(false); }
  return (
    <div className="mb-3">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: BRASS }}><Share2 size={13} /> คัดลอกไปยังตัวอื่น</button>
      ) : (
        <div style={{ background: PAPER_DIM }} className="rounded-lg p-3">
          <p className="text-xs mb-2" style={{ color: SLATE }}>เลือกลูกที่จะคัดลอก{label || ''}ไปให้ (แก้เฉพาะจุดที่ต่างทีหลังได้)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {others.map((d) => (
              <button key={d.id} onClick={() => toggle(d.id)} style={{ background: selected.includes(d.id) ? BRASS : 'white', color: selected.includes(d.id) ? 'white' : INK, border: `1px solid ${selected.includes(d.id) ? BRASS : BORDER}` }} className="rounded-full px-3 py-1.5 text-xs">{d.name}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={confirm} disabled={selected.length === 0} style={{ background: selected.length ? INK : SLATE }} className="text-white text-xs rounded-lg px-4 py-2 flex-1">คัดลอก ({selected.length})</button>
            <button onClick={() => { setOpen(false); setSelected([]); }} style={{ border: '1px solid #E7EAF0' }} className="text-xs rounded-lg px-4 py-2">ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DogProfileSection({ dog, onUpdateDog, dogs, onCopyToMultipleDogs }) {
  const field = (label, key, type = 'text') => (
    <div className="mb-3">
      <label className="text-xs" style={{ color: SLATE }}>{label}</label>
      <input type={type} value={dog[key] || ''} onChange={(e) => onUpdateDog(dog.id, { [key]: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
    </div>
  );
  return (
    <Card>
      <div className="mb-3"><label className="text-xs" style={{ color: SLATE }}>ชื่อ</label><input value={dog.name} onChange={(e) => onUpdateDog(dog.id, { name: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1 font-semibold" style={{ border: '1px solid #E7EAF0' }} /></div>
      {field('ชื่อเล่น', 'nickname')}
      {field('วันเกิด', 'birthdate', 'date')}
      {field('เพศ', 'sex')}
      {field('สี', 'color')}
      {field('สายพันธุ์', 'breed')}
      <CopyToOthersButton dogs={dogs} currentDogId={dog.id} label="สายพันธุ์" onCopy={(ids) => onCopyToMultipleDogs(ids, () => ({ breed: dog.breed }))} />
      {field('หมายเลขไมโครชิป', 'microchip')}
      {field('ผู้เพาะพันธุ์', 'breeder')}
      <div className="mb-3"><label className="text-xs" style={{ color: SLATE }}>BCS (Body Condition Score)</label><NumInput value={dog.bcs} onChange={(v) => onUpdateDog(dog.id, { bcs: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
      {field('นิสัย', 'personality')}
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>โรคประจำตัว</label><textarea value={dog.chronicDiseases || ''} onChange={(e) => onUpdateDog(dog.id, { chronicDiseases: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} rows={2} /></div>
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>การแพ้ยา</label><textarea value={dog.drugAllergies || ''} onChange={(e) => onUpdateDog(dog.id, { drugAllergies: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} rows={2} /></div>
      <div className="mb-1"><label className="text-xs" style={{ color: SLATE }}>หมายเหตุ</label><textarea value={dog.notes || ''} onChange={(e) => onUpdateDog(dog.id, { notes: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} rows={2} /></div>
    </Card>
  );
}

function DogWeightSection({ dog, onAddWeight, onRemoveWeight, onUpdateWeight, hospitalList, onAddHospital, weigherList, onAddWeigher, onUploadRecordPhoto, onAddMedicalPhoto, onRemoveMedicalPhoto }) {
  const [weight, setWeight] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [weigher, setWeigher] = useState('');
  const [note, setNote] = useState('');
  const [range, setRange] = useState(90);
  const [editingWeight, setEditingWeight] = useState(null);
  const scaleFileRef = useRef(null);
  const [scaleScanning, setScaleScanning] = useState(false);
  const [scaleError, setScaleError] = useState('');
  const hList = hospitalList || [];
  const wList = weigherList || ['พ่อ', 'แม่'];
  const weights = [...(dog.weights || [])].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = weights.filter((w) => range === 9999 || (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24) <= range).map((w) => ({ date: w.date.slice(5), weight: Number(w.weight) }));

  function submit() {
    if (!weight) return;
    onAddWeight(dog.id, { date, time: new Date().toTimeString().slice(0, 5), weight, location, weigher, note });
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
      let entry = { date, time: new Date().toTimeString().slice(0, 5), weight: w, location, weigher, note: 'ถ่ายจากตาชั่ง' };
      if (onUploadRecordPhoto) { try { const photo = await onUploadRecordPhoto(dog.id, 'weights', file); entry = { ...entry, photos: [photo] }; } catch (e) { /* บันทึกน้ำหนักต่อได้แม้แนบรูปไม่สำเร็จ */ } }
      onAddWeight(dog.id, entry);
    } catch (err) { setScaleError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setScaleScanning(false); if (scaleFileRef.current) scaleFileRef.current.value = ''; }
  }

  return (
    <div>
      <Card>
        <input ref={scaleFileRef} type="file" accept="image/*" onChange={handleScalePhoto} className="hidden" />
        <button onClick={() => scaleFileRef.current && scaleFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {scaleScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{scaleScanning ? 'กำลังอ่านตาชั่ง...' : 'ถ่ายรูปตาชั่ง (บันทึกทันที)'}
        </button>
        {scaleError && <p className="text-xs mb-3" style={{ color: BAD }}>{scaleError}</p>}
        <label className="text-xs" style={{ color: SLATE }}>วันที่</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-xs" style={{ color: SLATE }}>หรือกรอกน้ำหนักเอง (กก.)</label>
        <NumInput value={weight} onChange={setWeight} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-xs" style={{ color: SLATE }}>สถานที่ชั่ง (โรงพยาบาล)</label>
        <select value={hList.includes(location) ? location : (location ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') setLocation(''); else setLocation(e.target.value); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— ไม่ระบุ —</option>
          {hList.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ เพิ่มสถานที่ใหม่</option>
        </select>
        {(location && !hList.includes(location)) && (
          <div className="flex gap-2 mb-2">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="พิมพ์ชื่อสถานที่" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7EAF0' }} />
            <button type="button" onClick={() => { if (location) onAddHospital(location); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
        <label className="text-xs" style={{ color: SLATE }}>ผู้ชั่ง</label>
        <select value={wList.includes(weigher) ? weigher : (weigher ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') setWeigher(''); else setWeigher(e.target.value); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— ไม่ระบุ —</option>
          {wList.map((wName) => <option key={wName} value={wName}>{wName}</option>)}
          <option value="__new__">+ เพิ่มชื่อใหม่</option>
        </select>
        {(weigher && !wList.includes(weigher)) && (
          <div className="flex gap-2 mb-3">
            <input value={weigher} onChange={(e) => setWeigher(e.target.value)} placeholder="พิมพ์ชื่อผู้ชั่ง" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7EAF0' }} />
            <button type="button" onClick={() => { if (weigher) onAddWeigher(weigher); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
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
        <Card key={w.id}>
          <div className="flex justify-between items-center"><div><p className="text-sm">{w.weight} กก. {w.location && `· ${w.location}`}{w.weigher && ` · ${w.weigher}`}</p><p className="text-xs" style={{ color: SLATE }}>{w.date} {w.time}</p></div><div className="flex items-center gap-2"><EditButton onClick={() => setEditingWeight(w)} /><button onClick={() => onRemoveWeight(dog.id, w.id)}><Trash2 size={14} color={BAD} /></button></div></div>
          {onAddMedicalPhoto && <MedicalPhotoAttach record={w} onAddPhoto={(file) => onAddMedicalPhoto(dog.id, 'weights', w.id, file)} onRemovePhoto={(pid) => onRemoveMedicalPhoto(dog.id, 'weights', w.id, pid)} />}
        </Card>
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

function DogMedicationSection({ dog, onAddMedication, onUpdateMedication, onRemoveMedication, medicationList, onAddMedicationPreset, onUploadRecordPhoto, doctorList, onAddDoctor, hospitalList, onAddHospital }) {
  const [form, setForm] = useState({ name: '', strength: '', form: '', dose: '', usage: '', timing: '', startDate: new Date().toISOString().slice(0, 10), startReason: '', hospital: '', doctor: '' });
  const [editingMed, setEditingMed] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('');
  const labelFileRef = useRef(null);
  const labelGalleryRef = useRef(null);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [scanLabelError, setScanLabelError] = useState('');
  const [scannedFile, setScannedFile] = useState(null);
  const [attachScannedPhoto, setAttachScannedPhoto] = useState(true);
  const [saving, setSaving] = useState(false);
  const presets = medicationList || [];
  function applyPreset(idx) {
    if (idx === '') { setSelectedPreset(''); return; }
    const p = presets[Number(idx)];
    if (p) setForm({ ...form, name: p.name, strength: p.strength || '', form: p.form || '', dose: p.dose || '', usage: p.usage || '', timing: p.timing || '' });
    setSelectedPreset(idx);
  }
  async function handleLabelPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanningLabel(true); setScanLabelError('');
    try {
      const result = await scanMedicationLabel(file);
      if (!result) { setScanLabelError('อ่านฉลากไม่สำเร็จ ลองภาพที่ชัดกว่านี้ หรือกรอกเองแทน'); return; }
      setForm({
        ...form,
        name: result.name || form.name,
        strength: result.strength || form.strength,
        dose: result.dose || form.dose,
        usage: result.usage || form.usage,
        timing: result.timing || form.timing,
        hospital: result.hospital || form.hospital,
        doctor: result.doctor || form.doctor,
        startDate: result.startDate || form.startDate,
        startReason: result.note || form.startReason,
      });
      if (result.doctor && onAddDoctor) onAddDoctor(result.doctor);
      setSelectedPreset(''); setScannedFile(file); setAttachScannedPhoto(true);
    } catch (err) { setScanLabelError('เกิดข้อผิดพลาด: ' + err.message); }
    finally { setScanningLabel(false); if (labelFileRef.current) labelFileRef.current.value = ''; }
  }
  async function submit() {
    if (!form.name) return;
    setSaving(true);
    try {
      let entry = { ...form, stopDate: '', stopReason: '' };
      if (scannedFile && attachScannedPhoto) {
        const photo = await onUploadRecordPhoto(dog.id, 'medications', scannedFile);
        entry = { ...entry, photos: [photo] };
      }
      onAddMedication(dog.id, entry);
      onAddMedicationPreset({ name: form.name, strength: form.strength, form: form.form, dose: form.dose, usage: form.usage, timing: form.timing });
      setForm({ name: '', strength: '', form: '', dose: '', usage: '', timing: '', startDate: new Date().toISOString().slice(0, 10), startReason: '', hospital: '', doctor: '' });
      setSelectedPreset(''); setScannedFile(null);
    } finally { setSaving(false); }
  }
  const meds = [...(dog.medications || [])].sort((a, b) => b.startDate.localeCompare(a.startDate));
  return (
    <div>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เพิ่มยาใหม่ (ปรับยา = เพิ่มรายการใหม่ ไม่ลบของเดิม)</p>
        <input ref={labelFileRef} type="file" accept="image/*" capture="environment" onChange={handleLabelPhoto} className="hidden" />
        <input ref={labelGalleryRef} type="file" accept="image/*" onChange={handleLabelPhoto} className="hidden" />
        <div className="flex gap-2 mb-2">
          <button onClick={() => labelFileRef.current && labelFileRef.current.click()} disabled={scanningLabel} style={{ background: INK }} className="flex-1 text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
            {scanningLabel ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />} {scanningLabel ? 'กำลังอ่าน...' : 'ถ่ายรูปฉลาก/ซองยา'}
          </button>
          <button onClick={() => labelGalleryRef.current && labelGalleryRef.current.click()} disabled={scanningLabel} style={{ border: '1px solid #E7EAF0' }} className="flex-1 rounded-lg py-2 text-sm flex items-center justify-center gap-2">
            <ImageIcon size={14} /> เลือกจากอัลบั้ม
          </button>
        </div>
        {scanLabelError && <p className="text-xs mb-3" style={{ color: BAD }}>{scanLabelError}</p>}
        {scannedFile && (
          <label className="flex items-center gap-2 mb-3 text-xs" style={{ color: INK }}>
            <input type="checkbox" checked={attachScannedPhoto} onChange={(e) => setAttachScannedPhoto(e.target.checked)} />
            แนบรูปที่ถ่ายนี้ไปกับรายการยาเลย (ไม่ต้องแนบซ้ำทีหลัง)
          </label>
        )}
        <p className="text-[11px] mb-3" style={{ color: SLATE }}>AI จะกรอกฟอร์มด้านล่างให้ — ตรวจสอบและแก้ไขก่อนกด "บันทึกยา" เสมอ (ราคาไม่มีในฉลาก ต้องกรอกเองถ้ามีช่องราคา)</p>
        {presets.length > 0 && (
          <div className="mb-3">
            <label className="text-[10px]" style={{ color: SLATE }}>เลือกจากยาที่เคยใช้ (กับตัวอื่นด้วย)</label>
            <select value={selectedPreset} onChange={(e) => applyPreset(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }}>
              <option value="">— พิมพ์เอง / เพิ่มยาใหม่ —</option>
              {presets.map((p, i) => <option key={i} value={i}>{p.name} {p.strength} · {p.dose}</option>)}
            </select>
          </div>
        )}
        {['name:ชื่อยา', 'strength:ความแรง', 'form:รูปแบบยา', 'dose:ขนาดยา/จำนวน', 'usage:วิธีใช้', 'timing:เวลาใช้ (ก่อน/หลังอาหาร)', 'startReason:เหตุผลที่เริ่ม'].map((f) => {
          const [k, l] = f.split(':');
          return <div key={k} className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>{l}</label><input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>;
        })}
        <div className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label><MemoTextField list={hospitalList} value={form.hospital} onChange={(v) => setForm({ ...form, hospital: v })} onAddToList={onAddHospital} placeholder="ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        <div className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>หมอผู้สั่ง</label><MemoTextField list={doctorList} value={form.doctor} onChange={(v) => setForm({ ...form, doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์" className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        <div className="mb-3"><label className="text-[10px]" style={{ color: SLATE }}>วันที่เริ่ม</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        <button onClick={submit} disabled={saving} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />} บันทึกยา</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติยาทั้งหมด</p>
      {[...meds].sort((a, b) => (!!a.stopDate === !!b.stopDate ? 0 : a.stopDate ? 1 : -1)).map((m) => (
        <Card key={m.id} style={m.stopDate ? { background: PAPER_DIM, opacity: 0.75 } : undefined}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">{m.name} {m.strength}</p>
              <p className="text-xs" style={{ color: SLATE }}>{m.dose} · {m.usage} · {m.timing}</p>
              <p className="text-xs" style={{ color: SLATE }}>เริ่ม {m.startDate}{m.stopDate ? ` · หยุด ${m.stopDate}` : ''}</p>
              {m.hospital && <p className="text-xs" style={{ color: SLATE }}>{m.hospital} · {m.doctor}</p>}
            </div>
            <div className="flex items-center gap-2">
              {!m.stopDate && <span className="text-[10px] rounded-full px-2 py-1" style={{ background: 'white', color: GOOD }}>กำลังใช้</span>}
              {m.stopDate && <span className="text-[10px] rounded-full px-2 py-1" style={{ background: 'white', color: SLATE }}>หยุดใช้แล้ว</span>}
              <EditButton onClick={() => setEditingMed(m)} />
              <button onClick={() => onRemoveMedication(dog.id, m.id)}><Trash2 size={14} color={BAD} /></button>
            </div>
          </div>
          {!m.stopDate && (
            <button onClick={() => { const reason = prompt('เหตุผลที่หยุดยา (ไม่บังคับ)') || ''; onUpdateMedication(dog.id, m.id, { stopDate: new Date().toISOString().slice(0, 10), stopReason: reason }); }} className="text-[11px] mt-2" style={{ color: BAD }}>บันทึกหยุดยา</button>
          )}
        </Card>
      ))}
      {editingMed && (
        <EditModal title="แก้ไขยา" onClose={() => setEditingMed(null)}
          initialValues={{ name: editingMed.name, strength: editingMed.strength || '', form: editingMed.form || '', dose: editingMed.dose || '', usage: editingMed.usage || '', timing: editingMed.timing || '', startDate: editingMed.startDate, hospital: editingMed.hospital || '', doctor: editingMed.doctor || '' }}
          fields={[
            { key: 'name', label: 'ชื่อยา', type: 'text' },
            { key: 'strength', label: 'ความแรง', type: 'text' },
            { key: 'form', label: 'รูปแบบยา', type: 'text' },
            { key: 'dose', label: 'ขนาดยา/จำนวน', type: 'text' },
            { key: 'usage', label: 'วิธีใช้', type: 'text' },
            { key: 'timing', label: 'เวลาใช้', type: 'text' },
            { key: 'startDate', label: 'วันที่เริ่ม', type: 'date' },
            { key: 'hospital', label: 'โรงพยาบาล', type: 'text' },
            { key: 'doctor', label: 'หมอผู้สั่ง', type: 'text' },
          ]}
          onSave={(v) => { onUpdateMedication(dog.id, editingMed.id, v); setEditingMed(null); }}
        />
      )}
    </div>
  );
}

function parseFraction(s) {
  if (!s) return 0;
  const str = String(s).trim();
  if (str.includes('/')) { const [a, b] = str.split('/').map(Number); return b ? a / b : 0; }
  return Number(str) || 0;
      }function DogFleaTickSection({ dog, onLogFleaTick, onRemoveFleaTickHistory, onUpdateFleaTickHistory, onUpdateFleaTickInfo, googleConnected, onAddGenericCalendarEvent, dogs, onCopyToMultipleDogs }) {
  const ft = dog.fleaTick || {};
  const labelFileRef = useRef(null);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [scanLabelError, setScanLabelError] = useState('');
  async function handleLabelPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanningLabel(true); setScanLabelError('');
    try {
      const result = await scanMedicationLabel(file);
      if (!result) { setScanLabelError('อ่านฉลากไม่สำเร็จ ลองภาพที่ชัดกว่านี้ หรือกรอกเองแทน'); return; }
      const mgMatch = (result.strength || '').match(/[\d.]+/);
      const countMatch = (result.dose || '').match(/[\d.]+/);
      onUpdateFleaTickInfo(dog.id, {
        productName: result.name || ft.productName,
        tabletMg: mgMatch ? Number(mgMatch[0]) : ft.tabletMg,
        tabletsPurchased: countMatch ? Number(countMatch[0]) : ft.tabletsPurchased,
      });
    } catch (err) { setScanLabelError('เกิดข้อผิดพลาด: ' + err.message); }
    finally { setScanningLabel(false); if (labelFileRef.current) labelFileRef.current.value = ''; }
  }
  const latestWeight = useMemo(() => { const sorted = [...(dog.weights || [])].sort((a, b) => b.date.localeCompare(a.date)); return sorted[0] ? Number(sorted[0].weight) : null; }, [dog.weights]);
  const lowThreshold = Number(ft.lowWeightThreshold || 15);
  const suggestedDose = latestWeight !== null ? (latestWeight < lowThreshold ? (ft.doseBelowThreshold || '1/4') : (ft.doseAboveThreshold || '1/2')) : '';
  const [doseGiven, setDoseGiven] = useState(suggestedDose);
  const [editingHistory, setEditingHistory] = useState(null);
  const [givenDate, setGivenDate] = useState(new Date().toISOString().slice(0, 10));
  const [cost, setCost] = useState(0);
  const [customReminderDay, setCustomReminderDay] = useState('');
  const [syncingReminder, setSyncingReminder] = useState(false);
  const [reminderSyncMsg, setReminderSyncMsg] = useState('');
  const nextDue = ft.lastGivenDate ? (() => { const d = new Date(ft.lastGivenDate); d.setDate(d.getDate() + Number(ft.intervalDays || 84)); return d.toISOString().slice(0, 10); })() : null;
  const fullTabletCost = ft.tabletsPurchased > 0 ? (Number(ft.totalCost || 0) / Number(ft.tabletsPurchased)) : 0;
  const doseFraction = parseFraction(doseGiven);
  const estimatedCostThisTime = fullTabletCost * doseFraction;
  const reminderDays = ft.reminderDays || [1, 2, 3, 7];
  const daysToNextDue = nextDue ? daysUntil(nextDue) : null;
  const showDueWarning = daysToNextDue !== null && reminderDays.some((d) => daysToNextDue <= d);

  function toggleReminderDay(d) {
    const cur = reminderDays;
    onUpdateFleaTickInfo(dog.id, { reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => a - b) });
  }
  function addCustomReminderDay() {
    const d = Number(customReminderDay);
    if (d > 0 && !reminderDays.includes(d)) onUpdateFleaTickInfo(dog.id, { reminderDays: [...reminderDays, d].sort((a, b) => a - b) });
    setCustomReminderDay('');
  }
  async function syncReminderToCalendar() {
    if (!nextDue) return;
    setSyncingReminder(true);
    const r = await onAddGenericCalendarEvent(`ถึงรอบให้ยา ${ft.productName || 'เห็บหมัด/พยาธิ'}: ${dog.name}`, `ให้ยาครั้งถัดไปของ ${dog.name}`, nextDue, reminderDays);
    setReminderSyncMsg(r.ok ? 'เพิ่มลงปฏิทินสำเร็จ ✓' : `ไม่สำเร็จ: ${r.message}`);
    if (r.ok) onUpdateFleaTickInfo(dog.id, { lastReminderSyncedDate: nextDue });
    setSyncingReminder(false);
  }

  function submit() {
    onLogFleaTick(dog.id, { date: givenDate, doseGiven, cost: cost || Math.round(estimatedCostThisTime) });
    setDoseGiven(suggestedDose); setCost(0); setGivenDate(new Date().toISOString().slice(0, 10));
  }

  return (
    <div>
      {showDueWarning && (
        <div style={{ background: '#FFF6E5', border: '1px solid #E7D0A0' }} className="rounded-xl p-3 mb-3">
          <p className="text-xs" style={{ color: WARN }}>⚠️ ใกล้ถึงรอบให้ยา {ft.productName || ''} แล้ว ({nextDue}, {daysToNextDue >= 0 ? `อีก ${daysToNextDue} วัน` : 'เลยกำหนดแล้ว'})</p>
        </div>
      )}
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ข้อมูลผลิตภัณฑ์</p>
        <input ref={labelFileRef} type="file" accept="image/*" onChange={handleLabelPhoto} className="hidden" />
        <button onClick={() => labelFileRef.current && labelFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-2">
          {scanningLabel ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />} {scanningLabel ? 'กำลังอ่านฉลากยา...' : 'ถ่ายรูปฉลาก/ซองยา ให้ AI กรอกให้'}
        </button>
        {scanLabelError && <p className="text-xs mb-3" style={{ color: BAD }}>{scanLabelError}</p>}
        <p className="text-[11px] mb-3" style={{ color: SLATE }}>AI จะกรอกชื่อผลิตภัณฑ์/ขนาด/จำนวนให้ — ตรวจสอบตัวเลขด้านล่างก่อนใช้งานเสมอ</p>
        <label className="text-[10px]" style={{ color: SLATE }}>ชื่อผลิตภัณฑ์ (เช่น Bravecto)</label>
        <input value={ft.productName || ''} onChange={(e) => onUpdateFleaTickInfo(dog.id, { productName: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ขนาดเม็ดยา (mg)</label><NumInput value={ft.tabletMg} onChange={(v) => onUpdateFleaTickInfo(dog.id, { tabletMg: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>จำนวนเม็ดที่ซื้อ</label><NumInput value={ft.tabletsPurchased} onChange={(v) => onUpdateFleaTickInfo(dog.id, { tabletsPurchased: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ราคารวมที่ซื้อ (บาท)</label><NumInput value={ft.totalCost} onChange={(v) => onUpdateFleaTickInfo(dog.id, { totalCost: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ระยะห่างรอบถัดไป (วัน)</label><NumInput value={ft.intervalDays || 84} onChange={(v) => onUpdateFleaTickInfo(dog.id, { intervalDays: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        {fullTabletCost > 0 && <p className="text-xs mb-3" style={{ color: SLATE }}>ต้นทุนต่อเม็ดเต็ม ≈ ฿{fmt(fullTabletCost)}</p>}
        <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>เกณฑ์แบ่งขนาดตามน้ำหนักตัว (2 ระดับ)</p>
        <div className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>น้ำหนักตัวเกณฑ์แบ่ง (กก.)</label><NumInput value={ft.lowWeightThreshold || 15} onChange={(v) => onUpdateFleaTickInfo(dog.id, { lowWeightThreshold: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ถ้าต่ำกว่าเกณฑ์ ให้เท่าไหร่</label><input value={ft.doseBelowThreshold || '1/4'} onChange={(e) => onUpdateFleaTickInfo(dog.id, { doseBelowThreshold: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>ถ้าเท่ากับ/เกินเกณฑ์ ให้เท่าไหร่</label><input value={ft.doseAboveThreshold || '1/2'} onChange={(e) => onUpdateFleaTickInfo(dog.id, { doseAboveThreshold: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <p className="text-[10px] font-semibold mb-1.5 uppercase" style={{ color: SLATE }}>เตือนล่วงหน้าก่อนถึงรอบ (วัน)</p>
        <div className="flex gap-2 mb-2 flex-wrap">
          {[1, 2, 3, 7].map((d) => (
            <button key={d} onClick={() => toggleReminderDay(d)} style={{ background: reminderDays.includes(d) ? BRASS : PAPER_DIM, color: reminderDays.includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1 text-xs">{d} วัน</button>
          ))}
          {reminderDays.filter((d) => ![1, 2, 3, 7].includes(d)).map((d) => (
            <button key={d} onClick={() => toggleReminderDay(d)} style={{ background: BRASS, color: 'white' }} className="rounded-full px-3 py-1 text-xs">{d} วัน</button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <NumInput value={customReminderDay} onChange={setCustomReminderDay} placeholder="กำหนดเอง (วัน)" className="rounded-lg px-3 py-1.5 text-xs flex-1" style={{ border: '1px solid #E7EAF0' }} />
          <button onClick={addCustomReminderDay} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>เพิ่ม</button>
        </div>
        {googleConnected && nextDue && (
          <button onClick={syncReminderToCalendar} disabled={syncingReminder} className="flex items-center gap-1 text-xs mb-1" style={{ color: BRASS }}>{syncingReminder ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />} เพิ่มเตือนรอบถัดไปลง Google Calendar</button>
        )}
        {reminderSyncMsg ? <p className="text-[11px] mb-2" style={{ color: reminderSyncMsg.includes('สำเร็จ') ? GOOD : BAD }}>{reminderSyncMsg}</p> : (ft.lastReminderSyncedDate === nextDue && nextDue && <p className="text-[11px] mb-2" style={{ color: GOOD }}>เพิ่มลงปฏิทินไว้แล้ว ✓</p>)}
        <CopyToOthersButton dogs={dogs} currentDogId={dog.id} label="ข้อมูลเห็บหมัด/พยาธิ" onCopy={(ids) => onCopyToMultipleDogs(ids, (targetDog) => ({ fleaTick: { ...targetDog.fleaTick, ...ft } }))} />
        <p className="text-[10px]" style={{ color: WARN }}>⚠️ หากแบ่งเม็ดยาเอง ควรเป็นไปตามคำแนะนำของสัตวแพทย์และข้อมูลผู้ผลิตเท่านั้น ยาบางชนิดไม่เหมาะกับการแบ่งเม็ด ระบบนี้ไม่ได้คำนวณขนาดยาที่ถูกต้องให้ กรุณาให้ตามที่สัตวแพทย์สั่งเท่านั้น</p>
      </Card>
      <Card>
        <p className="text-xs mb-1" style={{ color: SLATE }}>ให้ยาล่าสุด: {ft.lastGivenDate || 'ยังไม่เคยบันทึก'}</p>
        <p className="text-xs mb-1" style={{ color: nextDue && daysUntil(nextDue) < 0 ? BAD : GOOD }}>ครั้งถัดไป: {nextDue || '-'}</p>
        <p className="text-[10px] mb-3" style={{ color: SLATE }}>💡 ตั้งเตือนล่วงหน้าก่อนถึงรอบได้ที่การ์ดด้านบน ("เตือนล่วงหน้าก่อนถึงรอบ")</p>
        {latestWeight !== null && <p className="text-[11px] mb-2" style={{ color: BRASS }}>น้ำหนักล่าสุด {latestWeight} กก. → แนะนำให้ {suggestedDose} (แก้ไขได้ถ้าหมอสั่งพิเศษ)</p>}
        <label className="text-[10px]" style={{ color: SLATE }}>วันที่ให้ยา</label>
        <input type="date" value={givenDate} onChange={(e) => setGivenDate(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>ให้ไปเท่าไหร่ (เช่น 1/4)</label>
        <input value={doseGiven} onChange={(e) => setDoseGiven(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        {estimatedCostThisTime > 0 && <p className="text-[11px] mb-2" style={{ color: SLATE }}>ต้นทุนโดยประมาณครั้งนี้ ≈ ฿{fmt(estimatedCostThisTime)}</p>}
        <label className="text-[10px]" style={{ color: SLATE }}>ค่าใช้จ่ายครั้งนี้ (ไม่บังคับ ไม่กรอกจะใช้ค่าประมาณด้านบน)</label>
        <NumInput value={cost} onChange={setCost} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกให้ยา</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติ</p>
      {(dog.fleaTickHistory || []).map((h) => (
        <Card key={h.id}>
          <div className="flex justify-between items-center text-sm">
            <span>{h.date} · {h.doseGiven}</span>
            <div className="flex items-center gap-2">
              <span>{h.cost ? `฿${fmt(h.cost)}` : ''}</span>
              <EditButton onClick={() => setEditingHistory(h)} />
              <button onClick={() => onRemoveFleaTickHistory(dog.id, h.id)}><Trash2 size={14} color={BAD} /></button>
            </div>
          </div>
        </Card>
      ))}
      {editingHistory && (
        <EditModal title="แก้ไขประวัติให้ยา" onClose={() => setEditingHistory(null)}
          initialValues={{ date: editingHistory.date, doseGiven: editingHistory.doseGiven, cost: editingHistory.cost || 0 }}
          fields={[
            { key: 'date', label: 'วันที่ให้ยา', type: 'date' },
            { key: 'doseGiven', label: 'ให้ไปเท่าไหร่ (เช่น 1/4)', type: 'text' },
            { key: 'cost', label: 'ค่าใช้จ่าย', type: 'number' },
          ]}
          onSave={(v) => { onUpdateFleaTickHistory(dog.id, editingHistory.id, { date: v.date, doseGiven: v.doseGiven, cost: Number(v.cost) || 0 }); setEditingHistory(null); }}
        />
      )}
    </div>
  );
}

function DogInsuranceSection({ dog, onUpdateInsurance, onAddInsuranceClaim, onUpdateInsuranceClaim, dogs, onCopyToMultipleDogs, onAddInsuranceDocument, onRemoveInsuranceDocument }) {
  const docFileRef = useRef(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');
  async function handleDocFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setDocUploading(true); setDocError('');
    try { await onAddInsuranceDocument(dog.id, file); } catch (err) { setDocError('อัพโหลดไม่สำเร็จ: ' + err.message); }
    finally { setDocUploading(false); if (docFileRef.current) docFileRef.current.value = ''; }
  }
  const ins = dog.insurance || {};
  const [actualCost, setActualCost] = useState(0);
  const [claimReason, setClaimReason] = useState('');
  const [editingClaim, setEditingClaim] = useState(null);
  const reimbursePct = Number(ins.reimbursementPct || 0);

  // คำนวณวันเริ่มรอบปีกรมธรรม์ปัจจุบัน (จากวันครบรอบปีล่าสุดของ startDate ที่ผ่านมาแล้ว)
  const policyYearStart = useMemo(() => {
    if (!ins.startDate) return null;
    const start = new Date(ins.startDate);
    const today = new Date();
    let anniversary = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    if (anniversary > today) anniversary.setFullYear(anniversary.getFullYear() - 1);
    return anniversary.toISOString().slice(0, 10);
  }, [ins.startDate]);

  const claimsThisYear = (ins.claims || []).filter((c) => !policyYearStart || c.date >= policyYearStart);
  const totalReimbursedThisYear = claimsThisYear.reduce((s, c) => s + Number(c.reimbursedAmount ?? c.amount ?? 0), 0);
  const annualLimit = Number(ins.annualLimit || 0);
  const remaining = annualLimit - totalReimbursedThisYear;

  const daysToExpiry = ins.endDate ? Math.ceil((new Date(ins.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const expiryReminderDays = ins.expiryReminderDays || [];
  const showExpiryWarning = daysToExpiry !== null && daysToExpiry >= 0 && expiryReminderDays.some((d) => daysToExpiry <= d);
  const lowBalanceThreshold = Number(ins.lowBalanceThreshold || 0);
  const showLowBalanceWarning = lowBalanceThreshold > 0 && remaining <= lowBalanceThreshold;

  function toggleExpiryReminder(d) {
    const cur = expiryReminderDays;
    onUpdateInsurance(dog.id, { expiryReminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => a - b) });
  }

  function submitClaim() {
    if (!actualCost) return;
    const reimbursedAmount = Math.round(actualCost * reimbursePct / 100);
    onAddInsuranceClaim(dog.id, { date: new Date().toISOString().slice(0, 10), actualCost, reimbursedAmount, reason: claimReason });
    setActualCost(0); setClaimReason('');
  }
  return (
    <div>
      {showExpiryWarning && (
        <div style={{ background: '#FFF6E5', border: '1px solid #E7D0A0' }} className="rounded-xl p-3 mb-3">
          <p className="text-xs" style={{ color: WARN }}>⚠️ กรมธรรม์ใกล้หมดอายุใน {daysToExpiry} วัน ({ins.endDate})</p>
        </div>
      )}
      {showLowBalanceWarning && (
        <div style={{ background: '#FDECEC', border: '1px solid #F0B8B8' }} className="rounded-xl p-3 mb-3">
          <p className="text-xs" style={{ color: BAD }}>⚠️ วงเงินคงเหลือต่ำ (฿{fmt(remaining)}) จากวงเงินรวม ฿{fmt(annualLimit)}</p>
        </div>
      )}
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>ข้อมูลกรมธรรม์</p>
        {['company:บริษัทประกัน', 'policyNumber:เลขกรมธรรม์'].map((f) => { const [k, l] = f.split(':'); return <div key={k} className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>{l}</label><input value={ins[k] || ''} onChange={(e) => onUpdateInsurance(dog.id, { [k]: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>; })}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันเริ่ม</label><input type="date" value={ins.startDate || ''} onChange={(e) => onUpdateInsurance(dog.id, { startDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันหมดอายุ</label><input type="date" value={ins.endDate || ''} onChange={(e) => onUpdateInsurance(dog.id, { endDate: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div><label className="text-[10px]" style={{ color: SLATE }}>ค่าเบี้ย</label><NumInput value={ins.premium} onChange={(v) => onUpdateInsurance(dog.id, { premium: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>วงเงินรวมต่อปี</label><NumInput value={ins.annualLimit} onChange={(v) => onUpdateInsurance(dog.id, { annualLimit: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>เบิกคืน (%)</label><NumInput value={ins.reimbursementPct} onChange={(v) => onUpdateInsurance(dog.id, { reimbursementPct: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <p className="text-[10px] mb-1" style={{ color: SLATE }}>เตือนล่วงหน้าก่อนหมดอายุ (วัน) — เลือกได้หลายอัน</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {[1, 2, 3, 7, 14, 30].map((d) => (
            <button key={d} onClick={() => toggleExpiryReminder(d)} style={{ background: expiryReminderDays.includes(d) ? BRASS : PAPER_DIM, color: expiryReminderDays.includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1 text-xs">{d} วัน</button>
          ))}
        </div>
        <div className="mb-2"><label className="text-[10px]" style={{ color: SLATE }}>เตือนเมื่อวงเงินคงเหลือต่ำกว่า (บาท)</label><NumInput value={ins.lowBalanceThreshold} onChange={(v) => onUpdateInsurance(dog.id, { lowBalanceThreshold: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        <div style={{ background: PAPER_DIM, borderRadius: 10 }} className="p-2.5 mt-1">
          <p className="text-xs" style={{ color: INK }}>ใช้สิทธิ์ไปแล้ว ฿{fmt(totalReimbursedThisYear)} จาก ฿{fmt(annualLimit)} (รอบปีนี้)</p>
        </div>
        <div className="mt-3">
          <CopyToOthersButton dogs={dogs} currentDogId={dog.id} label="เงื่อนไขประกัน (ไม่รวมเลขกรมธรรม์/ประวัติเคลม)"
            onCopy={(ids) => onCopyToMultipleDogs(ids, (targetDog) => ({
              insurance: {
                ...targetDog.insurance,
                company: ins.company, startDate: ins.startDate, endDate: ins.endDate, premium: ins.premium,
                annualLimit: ins.annualLimit, reimbursementPct: ins.reimbursementPct,
                lowBalanceThreshold: ins.lowBalanceThreshold, expiryReminderDays: ins.expiryReminderDays,
              },
            }))} />
        </div>
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เอกสารกรมธรรม์</p>
        <input ref={docFileRef} type="file" accept="image/*,application/pdf" onChange={handleDocFile} className="hidden" />
        <button onClick={() => docFileRef.current && docFileRef.current.click()} style={{ border: `1px dashed ${BRASS}`, color: BRASS }} className="w-full rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 mb-2">{docUploading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}{docUploading ? 'กำลังอัพโหลด...' : 'แนบเอกสารกรมธรรม์ (รูป/PDF)'}</button>
        {docError && <p className="text-xs mb-2" style={{ color: BAD }}>{docError}</p>}
        {(ins.documents || []).length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีเอกสารแนบไว้</p>}
        {(ins.documents || []).map((doc) => (
          <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-2" style={{ border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 flex-1 min-w-0"><ClipboardList size={16} color={BRASS} style={{ flexShrink: 0 }} /><div className="min-w-0"><p className="text-sm truncate" style={{ color: INK }}>{doc.name}</p><p className="text-[11px]" style={{ color: SLATE }}>{doc.uploadedAt}</p></div></div>
            <button onClick={(e) => { e.preventDefault(); onRemoveInsuranceDocument(dog.id, doc.id); }} style={{ flexShrink: 0 }}><Trash2 size={14} color={BAD} /></button>
          </a>
        ))}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>บันทึกการเคลม</p>
        <label className="text-[10px]" style={{ color: SLATE }}>ค่ารักษาจริง</label>
        <NumInput value={actualCost} onChange={setActualCost} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        {actualCost > 0 && reimbursePct > 0 && <p className="text-xs mb-2" style={{ color: GOOD }}>เบิกได้จริง ≈ ฿{fmt(Math.round(actualCost * reimbursePct / 100))} ({reimbursePct}%)</p>}
        <input value={claimReason} onChange={(e) => setClaimReason(e.target.value)} placeholder="เหตุผล/อาการ" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <button onClick={submitClaim} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกเคลม</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติการเคลม</p>
      {(ins.claims || []).map((c) => (
        <Card key={c.id}>
          <div className="flex justify-between items-center text-sm">
            <div><span>{c.date} · {c.reason}</span><p className="text-[10px]" style={{ color: SLATE }}>ค่ารักษาจริง ฿{fmt(c.actualCost ?? c.amount ?? 0)}</p></div>
            <div className="flex items-center gap-2"><span style={{ color: GOOD }}>เบิกได้ ฿{fmt(c.reimbursedAmount ?? c.amount ?? 0)}</span><EditButton onClick={() => setEditingClaim(c)} /></div>
          </div>
        </Card>
      ))}
      {editingClaim && (
        <EditModal title="แก้ไขการเคลม" onClose={() => setEditingClaim(null)}
          initialValues={{ date: editingClaim.date, actualCost: editingClaim.actualCost ?? editingClaim.amount ?? 0, reimbursedAmount: editingClaim.reimbursedAmount ?? editingClaim.amount ?? 0, reason: editingClaim.reason || '' }}
          fields={[
            { key: 'date', label: 'วันที่', type: 'date' },
            { key: 'actualCost', label: 'ค่ารักษาจริง', type: 'number' },
            { key: 'reimbursedAmount', label: 'เบิกได้จริง', type: 'number' },
            { key: 'reason', label: 'เหตุผล/อาการ', type: 'text' },
          ]}
          onSave={(v) => { onUpdateInsuranceClaim(dog.id, editingClaim.id, { date: v.date, actualCost: Number(v.actualCost) || 0, reimbursedAmount: Number(v.reimbursedAmount) || 0, reason: v.reason }); setEditingClaim(null); }}
        />
      )}
    </div>
  );
}

function DogAppointmentsSection({ dog, onAddAppointment, onRemoveAppointment, onUpdateAppointment, googleConnected, onAddToCalendar, hospitalList, onAddHospital, doctorList, onAddDoctor, onAddMedicalPhoto, onRemoveMedicalPhoto, onUploadRecordPhoto }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), time: '', hospital: '', doctor: '', purpose: '', reminderDays: [7, 3, 1] });
  const [syncingId, setSyncingId] = useState(null);
  const [syncResult, setSyncResult] = useState({});
  const [editingAppt, setEditingAppt] = useState(null);
  const [shareStatus, setShareStatus] = useState({}); // { [apptId]: { loading, message, failedPhotoUrls, isError } }
  const slipFileRef = useRef(null);
  const [scanningSlip, setScanningSlip] = useState(false);
  const [scanSlipError, setScanSlipError] = useState('');
  const [scannedFile, setScannedFile] = useState(null);
  const [attachScannedPhoto, setAttachScannedPhoto] = useState(true);
  const [saving, setSaving] = useState(false);
  const list = hospitalList || [];
  async function submit() {
    if (!form.date) return;
    setSaving(true);
    try {
      let entry = form;
      if (scannedFile && attachScannedPhoto) {
        const photo = await onUploadRecordPhoto(dog.id, 'appointments', scannedFile);
        entry = { ...form, photos: [photo] };
      }
      onAddAppointment(dog.id, entry);
      setForm({ date: new Date().toISOString().slice(0, 10), time: '', hospital: '', doctor: '', purpose: '', reminderDays: [7, 3, 1] });
      setScannedFile(null);
    } finally { setSaving(false); }
  }
  function toggleReminderDay(d) {
    const cur = form.reminderDays || [];
    setForm({ ...form, reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort((a, b) => b - a) });
  }
  async function handleSlipPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setScanningSlip(true); setScanSlipError('');
    try {
      const result = await scanAppointmentSlip(file);
      if (!result) { setScanSlipError('อ่านใบนัดไม่สำเร็จ ลองภาพที่ชัดกว่านี้ หรือกรอกเองแทน'); return; }
      setForm({
        ...form,
        date: result.date || form.date,
        time: result.time || form.time,
        hospital: result.hospital || form.hospital,
        doctor: result.doctor || form.doctor,
        purpose: result.purpose || result.note || form.purpose,
      });
      if (result.doctor && onAddDoctor) onAddDoctor(result.doctor);
      setScannedFile(file); setAttachScannedPhoto(true);
    } catch (err) { setScanSlipError('เกิดข้อผิดพลาด: ' + err.message); }
    finally { setScanningSlip(false); if (slipFileRef.current) slipFileRef.current.value = ''; }
  }
  async function syncToCalendar(a) {
    setSyncingId(a.id);
    const result = await onAddToCalendar(dog.name, a, a.calendarEventId);
    setSyncResult({ ...syncResult, [a.id]: result });
    if (result.ok) onUpdateAppointment(dog.id, a.id, { calendarSynced: true, calendarEventId: result.eventId });
    setSyncingId(null);
  }
  const appts = [...(dog.appointments || [])].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      {!googleConnected && <Card><p className="text-xs" style={{ color: SLATE }}>ยังไม่ได้เชื่อมต่อ Google Calendar — ไปที่ไอคอนตั้งค่า ⚙️ ที่หน้าภาพรวมเพื่อเชื่อมต่อก่อน จะได้กดเพิ่มนัดลงปฏิทินได้</p></Card>}
      <Card>
        <input ref={slipFileRef} type="file" accept="image/*" onChange={handleSlipPhoto} className="hidden" />
        <button onClick={() => slipFileRef.current && slipFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-2">
          {scanningSlip ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />} {scanningSlip ? 'กำลังอ่านใบนัด...' : 'ถ่ายรูปใบนัด ให้ AI กรอกให้'}
        </button>
        {scanSlipError && <p className="text-xs mb-3" style={{ color: BAD }}>{scanSlipError}</p>}
        {scannedFile && (
          <label className="flex items-center gap-2 mb-3 text-xs" style={{ color: INK }}>
            <input type="checkbox" checked={attachScannedPhoto} onChange={(e) => setAttachScannedPhoto(e.target.checked)} />
            แนบรูปที่ถ่ายนี้ไปกับนัดหมายเลย (ไม่ต้องแนบซ้ำทีหลัง)
          </label>
        )}
        <p className="text-[11px] mb-3" style={{ color: SLATE }}>AI จะกรอกฟอร์มด้านล่างให้ — ตรวจสอบก่อนกด "เพิ่มนัดหมาย" เสมอ</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div><label className="text-[10px]" style={{ color: SLATE }}>วันที่</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
          <div><label className="text-[10px]" style={{ color: SLATE }}>เวลา</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
        </div>
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label>
        <select value={list.includes(form.hospital) ? form.hospital : (form.hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') { setForm({ ...form, hospital: '' }); } else { setForm({ ...form, hospital: e.target.value }); } }} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— เลือกโรงพยาบาล —</option>
          {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ เพิ่มโรงพยาบาลใหม่</option>
        </select>
        {(!list.includes(form.hospital)) && (
          <div className="flex gap-2 mt-1 mb-2">
            <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} placeholder="พิมพ์ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7EAF0' }} />
            <button type="button" onClick={() => { if (form.hospital) onAddHospital(form.hospital); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
        {list.includes(form.hospital) && <div className="mb-2" />}
        <label className="text-[10px]" style={{ color: SLATE }}>สัตวแพทย์</label>
        <MemoTextField list={doctorList} value={form.doctor} onChange={(v) => setForm({ ...form, doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์" className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
        <div className="mb-2" />
        <label className="text-[10px]" style={{ color: SLATE }}>วัตถุประสงค์</label>
        <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>เตือนล่วงหน้ากี่วัน (เลือกได้หลายอัน)</label>
        <div className="flex gap-2 mt-1 mb-3">
          {[1, 2, 3, 7].map((d) => (
            <button key={d} type="button" onClick={() => toggleReminderDay(d)} style={{ background: (form.reminderDays || []).includes(d) ? BRASS : PAPER_DIM, color: (form.reminderDays || []).includes(d) ? 'white' : SLATE }} className="rounded-full px-3 py-1.5 text-xs">{d} วัน</button>
          ))}
        </div>
        <button onClick={submit} disabled={saving} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />} เพิ่มนัดหมาย</button>
      </Card>
      <p className="text-xs mb-2" style={{ color: SLATE }}>นัดหมายทั้งหมด</p>
      {appts.map((a) => {
        const d = daysUntil(a.date);
        const result = syncResult[a.id];
        return (
          <Card key={a.id}>
            <div className="flex justify-between items-center">
              <div><p className="text-sm">{a.hospital} · {a.purpose}</p><p className="text-xs" style={{ color: d < 0 ? SLATE : GOOD }}>{formatDateDMY(a.date)} {a.time} {d >= 0 && `(อีก ${d} วัน)`}</p></div>
              <div className="flex items-center gap-2">
                <button onClick={async () => {
                  const photoUrls = a.photos ? a.photos.map((p) => p.url) : [];
                  setShareStatus((prev) => ({ ...prev, [a.id]: { loading: true } }));
                  const res = await shareContent(buildAppointmentShareText(dog, a), photoUrls);
                  if (res.error) setShareStatus((prev) => ({ ...prev, [a.id]: { loading: false, message: `แชร์ไม่สำเร็จ: ${res.error}`, failedPhotoUrls: photoUrls, isError: true } }));
                  else if (photoUrls.length > 0 && !res.sharedWithPhotos) setShareStatus((prev) => ({ ...prev, [a.id]: { loading: false, message: `ส่งได้แค่ข้อความ อุปกรณ์นี้แนบรูปไม่ได้ — กดดาวน์โหลดรูปไว้แนบเองได้`, failedPhotoUrls: photoUrls, isError: false } }));
                  else if (res.sharedWithPhotos) setShareStatus((prev) => ({ ...prev, [a.id]: { loading: false, message: `ส่งรูปแล้ว — บางแอป (เช่น LINE) อาจไม่แปะข้อความสรุปมาด้วยตอนส่งพร้อมรูป ${res.textCopiedToClipboard ? 'ผมคัดลอกข้อความไว้ในคลิปบอร์ดให้แล้ว วางเพิ่มในแชทได้เลย' : ''}`, isError: false } }));
                  else setShareStatus((prev) => ({ ...prev, [a.id]: null }));
                }}><Share2 size={14} color={BRASS} /></button>
                <EditButton onClick={() => setEditingAppt(a)} /><button onClick={() => onRemoveAppointment(dog.id, a.id)}><Trash2 size={14} color={BAD} /></button>
              </div>
            </div>
            {shareStatus[a.id] && (
              <div style={{ background: shareStatus[a.id].isError ? '#FBE3E1' : PAPER_DIM, borderRadius: 10 }} className="p-2 mt-2">
                {shareStatus[a.id].loading ? (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: SLATE }}><Loader2 size={12} className="animate-spin" /> กำลังแชร์...</p>
                ) : (
                  <>
                    <p className="text-xs mb-1.5" style={{ color: shareStatus[a.id].isError ? BAD : INK }}>{shareStatus[a.id].message}</p>
                    <div className="flex items-center gap-3">
                      {shareStatus[a.id].failedPhotoUrls && <button onClick={async () => { const r = await downloadPhotos(shareStatus[a.id].failedPhotoUrls); setShareStatus((prev) => ({ ...prev, [a.id]: { loading: false, message: r.success > 0 ? `ดาวน์โหลดสำเร็จ ${r.success} รูป` : `ดาวน์โหลดไม่สำเร็จเลยสักรูป — น่าจะเป็นปัญหาการตั้งค่าเซิร์ฟเวอร์รูปภาพ (CORS)`, isError: r.success === 0 } })); }} className="text-xs font-semibold" style={{ color: BRASS }}>ดาวน์โหลดรูป</button>}
                      <button onClick={() => setShareStatus((prev) => ({ ...prev, [a.id]: null }))} className="text-xs" style={{ color: SLATE }}>ปิด</button>
                    </div>
                  </>
                )}
              </div>
            )}
            {googleConnected && (
              <button onClick={() => syncToCalendar(a)} disabled={syncingId === a.id} className="flex items-center gap-1 text-[11px] mt-2" style={{ color: BRASS }}>
                {syncingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />} {a.calendarSynced ? 'เพิ่มลง Google Calendar อีกครั้ง' : 'เพิ่มลง Google Calendar'}
              </button>
            )}
            {result ? (result.ok ? <p className="text-[11px] mt-1" style={{ color: GOOD }}>เพิ่มลงปฏิทินสำเร็จ ✓</p> : <p className="text-[11px] mt-1" style={{ color: BAD }}>ไม่สำเร็จ: {result.message}</p>) : (a.calendarSynced && <p className="text-[11px] mt-1" style={{ color: GOOD }}>เพิ่มลงปฏิทินไว้แล้ว ✓</p>)}
            {onAddMedicalPhoto && <MedicalPhotoAttach record={a} onAddPhoto={(file) => onAddMedicalPhoto(dog.id, 'appointments', a.id, file)} onRemovePhoto={(pid) => onRemoveMedicalPhoto(dog.id, 'appointments', a.id, pid)} />}
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

const VET_RECORD_TYPES = [
  { type: 'appointments', label: 'นัดหมาย', getLabel: (r) => `${r.date}${r.hospital ? ' · ' + r.hospital : ''}${r.purpose ? ' · ' + r.purpose : ''}`, getDetail: (r) => r.note || r.diagnosis || null },
  { type: 'weights', label: 'น้ำหนัก', getLabel: (r) => `${r.date} · ${r.weight} กก.`, getDetail: (r) => r.note || null },
  { type: 'bloodTests', label: 'ผลเลือด', getLabel: (r) => `${r.date} · ${r.type || 'ผลเลือด'}`, getDetail: (r) => r.note || null },
  { type: 'organExams', label: 'ตรวจอวัยวะ', getLabel: (r) => `${r.date} · ${r.organ || 'อวัยวะ'}`, getDetail: (r) => r.note || null },
  { type: 'imaging', label: 'Imaging', getLabel: (r) => `${r.date} · ${r.type || 'Imaging'}`, getDetail: (r) => r.note || null },
  { type: 'medications', label: 'ยา', getLabel: (r) => `${r.startDate || r.date || ''} · ${r.name || 'ยา'}`, getDetail: (r) => [r.strength, r.dose, r.usage, r.timing].filter(Boolean).join(' · ') || null },
  { type: 'expenses', label: 'ค่าใช้จ่าย', getLabel: (r) => `${r.date} · ${r.category || ''}${r.hospital ? ' · ' + r.hospital : ''} · ฿${fmt(r.amount)}`, getDetail: (r) => r.note || null },
];

// เลือกรูปหลายรูปเก็บไว้ในเครื่องก่อน (ยังไม่อัพโหลด เพราะตัว "ครั้งที่ไปหาหมอ" ยังไม่ถูกสร้างจนกว่าจะกดบันทึกทั้งหมด)
function VisitPhotoPicker({ files, onChange }) {
  const fileRef = useRef(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  function handlePick(e) {
    const picked = e.target.files && e.target.files[0];
    if (picked) onChange([...files, picked]);
    if (fileRef.current) fileRef.current.value = '';
  }
  return (
    <div className="mt-1">
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
      <button onClick={() => fileRef.current && fileRef.current.click()} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><Camera size={13} /> แนบรูปอาการ</button>
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {previews.map((url, idx) => (
            <div key={idx} className="relative">
              <button onClick={() => setLightboxUrl(url)} className="w-full block"><img src={url} alt="" className="w-full h-16 object-cover rounded-lg" /></button>
              <button onClick={() => onChange(files.filter((_, i) => i !== idx))} style={{ background: 'rgba(0,0,0,0.5)' }} className="absolute top-0.5 right-0.5 rounded-full p-0.5"><Trash2 size={10} color="white" /></button>
            </div>
          ))}
        </div>
      )}
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}

const VISIT_SECTION_DEFS = [
  { key: 'appointment', label: 'นัดหมาย', icon: '📅', field: 'appointments', multi: false },
  { key: 'weight', label: 'ชั่งน้ำหนัก', icon: '⚖️', field: 'weights', multi: false },
  { key: 'medication', label: 'ยา/ปรับยา', icon: '💊', field: 'medications', multi: true },
  { key: 'bloodTest', label: 'ผลเลือด', icon: '🩸', field: 'bloodTests', multi: true },
  { key: 'imaging', label: 'X-ray/CT/MRI/Ultrasound', icon: '🩻', field: 'imaging', multi: true },
  { key: 'organExam', label: 'ตรวจอวัยวะ', icon: '🫁', field: 'organExams', multi: true },
  { key: 'expense', label: 'ค่าใช้จ่าย', icon: '💰', field: 'expenses', multi: true },
];
function makeVisitSectionRow(key, form) {
  const today = form.date;
  if (key === 'appointment') return { date: today, time: '', hospital: form.hospital, doctor: '', purpose: form.reason || '', reminderDays: [7, 3, 1] };
  if (key === 'weight') return { date: today, time: '', weight: 0, location: form.hospital, weigher: '', note: '' };
  if (key === 'medication') return { name: '', strength: '', dose: '', usage: '', timing: '', startDate: today, startReason: form.reason || '', hospital: form.hospital, doctor: '', stopDate: '', stopReason: '' };
  if (key === 'bloodTest') return { type: BLOOD_TEST_TYPES[0], date: today, note: '' };
  if (key === 'imaging') return { type: IMAGING_TYPES[0], date: today, note: '' };
  if (key === 'organExam') return { organ: ORGAN_TYPES[0], date: today, note: '' };
  if (key === 'expense') return { date: today, amount: 0, category: PET_EXPENSE_CATEGORIES[0], hospital: form.hospital, note: '' };
  return {};
}

function DogVetVisitsSection({ dog, hospitalList, onAddHospital, doctorList, onAddDoctor, departmentList, onAddDepartment, doctorDepartments, onSetDoctorDepartment, weigherList, medicationList, onAddMedicationPreset, onUpdateDog, onUpdateVetVisit, onRemoveVetVisit, onLinkRecordToVisit, onUnlinkRecordFromVisit, onUploadRecordPhoto, setSection, bloodTestTypeList, onAddBloodTestType, organTypeList, onAddOrganType, imagingTypeList, onAddImagingType, onAddOrganExam }) {
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), hospital: '', doctor: '', department: '', reason: '', diagnosis: '', cost: 0 });
  const [activeSections, setActiveSections] = useState([]); // array of VISIT_SECTION_DEFS keys
  const [sectionData, setSectionData] = useState({}); // key -> object (single) or array of objects (multi)
  const [sectionPhotos, setSectionPhotos] = useState({}); // key -> File (แนบรูปเดียวต่อหมวด ผูกเข้ากับทุกรายการที่สร้างในหมวดนั้น)
  const [visitPhotos, setVisitPhotos] = useState([]); // File[] — รูปอาการที่ผูกกับ "ครั้งที่ไปหาหมอ" นี้โดยตรง ไม่ใช่ของหมวดย่อยใดหมวดหนึ่ง
  const [submitting, setSubmitting] = useState(false);
  const visits = [...(dog.vetVisits || [])].sort((a, b) => b.date.localeCompare(a.date));
  const list = hospitalList || [];
  const selected = (dog.vetVisits || []).find((v) => v.id === selectedVisitId);

  function toggleSection(key) {
    const def = VISIT_SECTION_DEFS.find((s) => s.key === key);
    if (activeSections.includes(key)) {
      setActiveSections((prev) => prev.filter((k) => k !== key));
      setSectionData((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } else {
      setActiveSections((prev) => [...prev, key]);
      setSectionData((prev) => ({ ...prev, [key]: def.multi ? [makeVisitSectionRow(key, form)] : makeVisitSectionRow(key, form) }));
    }
  }
  function updateSingleSection(key, patch) { setSectionData((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })); }
  // ใช้ functional setState (prev =>) เสมอในนี้ กัน state เก่าค้าง (เช่น ถ่ายรูปให้ AI อ่านทันทีหลังเพิ่งเปิดหมวด
  // ก่อนที่แถวแรกจะถูกสร้างเสร็จ) และกัน error ถ้าหมวดนั้นดันยังไม่มีแถวเลยด้วย fallback || []
  function updateRowInSection(key, idx, patch) { setSectionData((prev) => ({ ...prev, [key]: (prev[key] || []).map((r, i) => (i === idx ? { ...r, ...patch } : r)) })); }
  function addRowToSection(key) { setSectionData((prev) => ({ ...prev, [key]: [...(prev[key] || []), makeVisitSectionRow(key, form)] })); }
  function removeRowFromSection(key, idx) {
    const rows = (sectionData[key] || []).filter((_, i) => i !== idx);
    if (rows.length === 0) { toggleSection(key); } else { setSectionData((prev) => ({ ...prev, [key]: rows })); }
  }

  async function submitAll() {
    if (!form.date) return;
    setSubmitting(true);
    try {
      // อัพโหลดรูปของแต่ละหมวดก่อน (ถ้ามี) แล้วค่อยผูกเข้ากับทุกรายการที่สร้างในหมวดนั้น
      const uploadedPhotos = {};
      for (const def of VISIT_SECTION_DEFS) {
        if (activeSections.includes(def.key) && sectionPhotos[def.key] && onUploadRecordPhoto) {
          try { uploadedPhotos[def.key] = await onUploadRecordPhoto(dog.id, def.field, sectionPhotos[def.key]); } catch (e) { /* ข้ามรูปที่อัพโหลดไม่สำเร็จ ยังบันทึกข้อมูลต่อได้ */ }
        }
      }
      // อัพโหลดรูปอาการที่ผูกกับตัวครั้งไปหาหมอเองโดยตรง
      const uploadedVisitPhotos = [];
      if (onUploadRecordPhoto) {
        for (const file of visitPhotos) {
          try { uploadedVisitPhotos.push(await onUploadRecordPhoto(dog.id, 'vetVisits', file)); } catch (e) { /* ข้ามรูปที่อัพโหลดไม่สำเร็จ */ }
        }
      }
      const visitId = uid();
      const linkedRecords = [];
      const patch = {};
      VISIT_SECTION_DEFS.forEach((def) => {
        if (!activeSections.includes(def.key)) return;
        const rows = def.multi ? sectionData[def.key] : [sectionData[def.key]];
        const existing = dog[def.field] || [];
        const photo = uploadedPhotos[def.key];
        const newEntries = rows.map((row) => { const id = uid(); linkedRecords.push({ type: def.field, id }); return { id, ...row, ...(photo ? { photos: [photo] } : {}) }; });
        patch[def.field] = [...newEntries, ...existing];
        // ถ้าเป็นหมวด Imaging และมีการเลือก "อวัยวะที่เกี่ยวข้อง" ไว้ ให้สร้างรายการอวัยวะให้อัตโนมัติด้วย
        if (def.key === 'imaging') {
          const organNewEntries = [];
          rows.forEach((row) => {
            (row.relatedOrgans || []).forEach((organ) => {
              const id = uid();
              linkedRecords.push({ type: 'organExams', id });
              organNewEntries.push({ id, organ, date: row.date, note: row.note });
            });
          });
          if (organNewEntries.length) patch.organExams = [...organNewEntries, ...(patch.organExams || dog.organExams || [])];
        }
      });
      patch.vetVisits = [{ id: visitId, date: form.date, hospital: form.hospital, doctor: form.doctor, department: form.department, reason: form.reason, diagnosis: form.diagnosis, cost: form.cost, photos: uploadedVisitPhotos, linkedRecords }, ...(dog.vetVisits || [])];
      onUpdateDog(dog.id, patch);
      // แจ้งเตือน LINE สรุปรวมทุกอย่างจากการไปหาหมอครั้งนี้ — เป็นการ์ด Flex Message (แสดงเฉพาะช่องที่มีข้อมูล ข้ามช่องว่าง)
      {
        const meds = (sectionData.medication || []).filter((m) => m.name).map((m) => `${m.name}${m.dose ? ' ' + m.dose : ''}`);
        const nextAppt = activeSections.includes('appointment') ? sectionData.appointment : null;
        const nextApptDate = nextAppt && nextAppt.date ? nextAppt.date : null;
        const altText = `${dog.name} ไปหาหมอ${form.hospital ? ' ที่ ' + form.hospital : ''}${form.cost ? ' ฿' + fmt(form.cost) : ''}`;
        sendLineFlex(altText, buildVetVisitFlexCard(dog.name, form, meds, nextApptDate));
      }
      // บันทึกยาที่พิมพ์เองใหม่เข้ารายการ "ยาที่เคยใช้" ด้วย เหมือน Tab ยาโดยตรง (แก้บั๊กที่เคยตกหล่นมาก่อน)
      if (activeSections.includes('medication') && onAddMedicationPreset) {
        (sectionData.medication || []).forEach((row) => {
          if (!row.name) return;
          const alreadyPreset = (medicationList || []).some((p) => p.name === row.name && p.strength === row.strength && p.dose === row.dose && p.usage === row.usage);
          if (!alreadyPreset) onAddMedicationPreset({ name: row.name, strength: row.strength, dose: row.dose, usage: row.usage, timing: row.timing });
        });
      }
      setForm({ date: new Date().toISOString().slice(0, 10), hospital: '', doctor: '', department: '', reason: '', diagnosis: '', cost: 0 });
      setActiveSections([]); setSectionData({}); setSectionPhotos({}); setVisitPhotos([]);
      setShowAddForm(false);
    } finally { setSubmitting(false); }
  }

  // ปุ่มแนบรูปเล็กๆ ใช้ร่วมกันได้ทุกหมวดในฟอร์มนี้ — 1 รูปต่อหมวด ผูกเข้ากับทุกรายการที่สร้างในหมวดนั้น
  // เรียก AI อ่านภาพให้ตรงกับประเภทของหมวดนั้นๆ (ใช้ฟังก์ชัน scan ตัวเดียวกับที่ใช้ใน Tab เฉพาะทุกอัน)
  async function scanForSection(key, file) {
    if (key === 'appointment') return scanAppointmentSlip(file);
    if (key === 'weight') return scanWeightScale(file);
    if (key === 'medication') return scanMedicationLabel(file);
    if (key === 'bloodTest') return scanMedicalResult(file, 'bloodTest');
    if (key === 'imaging') return scanMedicalResult(file, 'imaging');
    if (key === 'organExam') return scanMedicalResult(file, 'organExam');
    if (key === 'expense') return scanPetExpenseReceipt(file, PET_EXPENSE_CATEGORIES);
    return null;
  }
  // เอาผลที่ AI อ่านได้ไปกรอกลงฟอร์มของหมวดนั้น — หมวดเดี่ยว (นัดหมาย/น้ำหนัก) กรอกลงฟอร์มเดียว
  // หมวดที่เพิ่มได้หลายรายการ (ยา/ผลเลือด/Imaging/อวัยวะ/ค่าใช้จ่าย) กรอกลงแถวล่าสุดที่เพิ่งเพิ่ม
  function applyScanResult(key, result) {
    if (!result) return;
    if (key === 'appointment') {
      updateSingleSection('appointment', { date: result.date || sectionData.appointment?.date, purpose: result.purpose || sectionData.appointment?.purpose, hospital: result.hospital || sectionData.appointment?.hospital, doctor: result.doctor || sectionData.appointment?.doctor });
      if (result.doctor && onAddDoctor) onAddDoctor(result.doctor);
      return;
    }
    if (key === 'weight') { const w = Number(result.weight); if (w) updateSingleSection('weight', { weight: w }); return; }
    const rows = sectionData[key] || [];
    const idx = rows.length - 1;
    if (idx < 0) return;
    if (key === 'medication') updateRowInSection('medication', idx, { name: result.name || rows[idx].name, strength: result.strength || rows[idx].strength, dose: result.dose || rows[idx].dose, usage: result.usage || rows[idx].usage, timing: result.timing || rows[idx].timing });
    else if (key === 'bloodTest') updateRowInSection('bloodTest', idx, { type: BLOOD_TEST_TYPES.includes(result.type) ? result.type : rows[idx].type, date: result.date || rows[idx].date, note: result.note || rows[idx].note });
    else if (key === 'imaging') updateRowInSection('imaging', idx, { type: IMAGING_TYPES.includes(result.type) ? result.type : rows[idx].type, date: result.date || rows[idx].date, note: result.note || rows[idx].note });
    else if (key === 'organExam') updateRowInSection('organExam', idx, { organ: ORGAN_TYPES.includes(result.type) ? result.type : rows[idx].organ, date: result.date || rows[idx].date, note: result.note || rows[idx].note });
    else if (key === 'expense') updateRowInSection('expense', idx, { amount: Number(result.amount) || rows[idx].amount, category: PET_EXPENSE_CATEGORIES.includes(result.category) ? result.category : rows[idx].category, date: result.date || rows[idx].date });
  }

  function SectionPhotoAttach({ sectionKey }) {
    const fileRef = useRef(null);
    const file = sectionPhotos[sectionKey];
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    async function handleFile(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      setSectionPhotos({ ...sectionPhotos, [sectionKey]: f });
      setScanning(true); setScanError('');
      try {
        const result = await scanForSection(sectionKey, f);
        applyScanResult(sectionKey, result);
      } catch (err) { setScanError('AI อ่านภาพไม่สำเร็จ กรอกเองแทนได้ (รูปยังแนบไว้อยู่)'); }
      finally { setScanning(false); if (fileRef.current) fileRef.current.value = ''; }
    }
    return (
      <div className="mb-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {file ? (
          <div style={{ border: `1px solid ${GOOD}`, borderRadius: 10 }} className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs" style={{ color: scanning ? BRASS : GOOD }}>
              {scanning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {scanning ? 'AI กำลังอ่าน...' : 'แนบรูปแล้ว'} ({file.name.slice(0, 14)})
              <button onClick={() => { const next = { ...sectionPhotos }; delete next[sectionKey]; setSectionPhotos(next); }} style={{ color: BAD }}>ลบ</button>
            </div>
            {scanError && <p className="text-[11px] mt-1" style={{ color: BAD }}>{scanError}</p>}
          </div>
        ) : (
          <button onClick={() => fileRef.current && fileRef.current.click()} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs w-full py-2.5"><Camera size={14} /> ถ่ายรูปให้ AI อ่าน</button>
        )}
      </div>
    );
  }

  if (selected) return (
    <VetVisitDetail dog={dog} visit={selected} hospitalList={hospitalList} onAddHospital={onAddHospital} doctorList={doctorList} onAddDoctor={onAddDoctor} departmentList={departmentList} onAddDepartment={onAddDepartment} doctorDepartments={doctorDepartments} onSetDoctorDepartment={onSetDoctorDepartment}
      onBack={() => setSelectedVisitId(null)} onUpdateVetVisit={onUpdateVetVisit} onUpdateDog={onUpdateDog}
      onRemoveVetVisit={(id) => { onRemoveVetVisit(dog.id, id); setSelectedVisitId(null); }}
      onLinkRecordToVisit={onLinkRecordToVisit} onUnlinkRecordFromVisit={onUnlinkRecordFromVisit} onUploadRecordPhoto={onUploadRecordPhoto} setSection={setSection}
      weigherList={weigherList} medicationList={medicationList} onAddMedicationPreset={onAddMedicationPreset}
      bloodTestTypeList={bloodTestTypeList} onAddBloodTestType={onAddBloodTestType} organTypeList={organTypeList} onAddOrganType={onAddOrganType} imagingTypeList={imagingTypeList} onAddImagingType={onAddImagingType} />
  );

  return (
    <div>
      {showAddForm ? (
        <>
        <Card>
          <p className="text-xs mb-2" style={{ color: SLATE }}>ข้อมูลพื้นฐาน</p>
          <label className="text-[10px]" style={{ color: SLATE }}>วันที่ไป</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label>
          <select value={list.includes(form.hospital) ? form.hospital : (form.hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') setForm({ ...form, hospital: '' }); else setForm({ ...form, hospital: e.target.value }); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
            <option value="">— เลือกโรงพยาบาล —</option>
            {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
            <option value="__new__">+ เพิ่มโรงพยาบาลใหม่</option>
          </select>
          {(form.hospital && !list.includes(form.hospital)) && (
            <div className="flex gap-2 mb-2">
              <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} placeholder="พิมพ์ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7EAF0' }} />
              <button type="button" onClick={() => { if (form.hospital) onAddHospital(form.hospital); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
            </div>
          )}
          <label className="text-[10px]" style={{ color: SLATE }}>เหตุผลที่ไป</label>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="เช่น ตรวจติดตามอาการต่อมไร้ท่อ" className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>แผนก</label>
          <TypeSelectWithCustom options={departmentList || []} value={form.department} onChange={(v) => { setForm({ ...form, department: v }); if (v && form.doctor) onSetDoctorDepartment(form.doctor, v); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>สัตวแพทย์ผู้ตรวจ</label>
          <MemoTextField list={doctorList} value={form.doctor} onChange={(v) => {
            const knownDept = (doctorDepartments || {})[v];
            setForm({ ...form, doctor: v, department: knownDept || form.department });
          }} onAddToList={(name) => { onAddDoctor(name); if (form.department) onSetDoctorDepartment(name, form.department); }} placeholder="ชื่อสัตวแพทย์" className="rounded-lg px-3 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
          <p className="text-[10px] mb-2" style={{ color: SLATE }}>💡 เลือกหมอที่เคยบันทึกไว้แล้ว ระบบจะเติมแผนกให้อัตโนมัติ</p>
          <label className="text-[10px]" style={{ color: SLATE }}>ผลวินิจฉัย/การรักษา</label>
          <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="เช่น วินิจฉัยว่า... รักษาโดย..." rows={3} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>ค่าใช้จ่ายรวมครั้งนี้ (ไม่บังคับ)</label>
          <NumInput value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
          <label className="text-[10px]" style={{ color: SLATE }}>รูปอาการ (เช่น ถ่ายแผล/จุดที่เป็น)</label>
          <VisitPhotoPicker files={visitPhotos} onChange={setVisitPhotos} />
        </Card>

        <Card>
          <p className="text-xs mb-1" style={{ color: SLATE }}>มีอะไรเกิดขึ้นในการไปครั้งนี้บ้าง?</p>
          <p className="text-[11px] mb-3" style={{ color: SLATE }}>แตะเพื่อเพิ่มรายละเอียด ระบบจะสร้างรายการให้อัตโนมัติในเมนูของมันเอง แล้วผูกกลับมาที่ครั้งนี้ให้เสร็จ ไม่ต้องไปกรอกซ้ำที่อื่น</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {VISIT_SECTION_DEFS.map((def) => {
              const active = activeSections.includes(def.key);
              return (
                <button key={def.key} onClick={() => toggleSection(def.key)} style={{ background: active ? BRASS : PAPER_DIM, color: active ? 'white' : BRASS, border: active ? 'none' : `1.5px dashed ${BRASS}` }} className="rounded-full px-3 py-2 text-xs font-semibold">
                  {def.icon} {def.label}
                </button>
              );
            })}
          </div>

          {activeSections.includes('appointment') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>📅 นัดหมาย</span><button onClick={() => toggleSection('appointment')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div><label className="text-[10px]" style={{ color: SLATE }}>วันนัดครั้งถัดไป</label><input type="date" value={sectionData.appointment?.date || ''} onChange={(e) => updateSingleSection('appointment', { date: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
                <div><label className="text-[10px]" style={{ color: SLATE }}>วัตถุประสงค์</label><input value={sectionData.appointment?.purpose || ''} onChange={(e) => updateSingleSection('appointment', { purpose: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
              </div>
              <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาลที่นัด</label>
              <select value={(hospitalList || []).includes(sectionData.appointment?.hospital) ? sectionData.appointment.hospital : ''} onChange={(e) => updateSingleSection('appointment', { hospital: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
                <option value="">— เลือกโรงพยาบาล —</option>
                {(hospitalList || []).map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <input value={sectionData.appointment?.hospital || ''} onChange={(e) => updateSingleSection('appointment', { hospital: e.target.value })} placeholder="หรือพิมพ์ชื่อโรงพยาบาลเอง" className="rounded-lg px-2 py-1.5 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
              <label className="text-[10px]" style={{ color: SLATE }}>หมอที่นัด</label>
              <MemoTextField list={doctorList} value={sectionData.appointment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
              <SectionPhotoAttach sectionKey="appointment" />
            </div>
          )}

          {activeSections.includes('weight') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>⚖️ น้ำหนักตัว</span><button onClick={() => toggleSection('weight')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px]" style={{ color: SLATE }}>น้ำหนัก (กก.)</label><NumInput value={sectionData.weight?.weight} onChange={(v) => updateSingleSection('weight', { weight: v })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} /></div>
                <div><label className="text-[10px]" style={{ color: SLATE }}>ชั่งโดย</label>
                  <select value={sectionData.weight?.weigher || ''} onChange={(e) => updateSingleSection('weight', { weigher: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }}>
                    <option value="">— เลือก —</option>
                    {(weigherList || []).map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <SectionPhotoAttach sectionKey="weight" />
            </div>
          )}

          {activeSections.includes('medication') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>💊 ยา/ปรับยา</span><button onClick={() => toggleSection('medication')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              {(sectionData.medication || []).map((row, idx) => (
                <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                  <div className="flex justify-between items-center mb-1"><p className="text-[11px] font-semibold" style={{ color: SLATE }}>ยาตัวที่ {idx + 1}</p>{(sectionData.medication || []).length > 1 && <button onClick={() => removeRowFromSection('medication', idx)} className="text-[11px]" style={{ color: BAD }}>ลบ</button>}</div>
                  {(medicationList || []).length > 0 && (
                    <select value="" onChange={(e) => { const p = (medicationList || [])[Number(e.target.value)]; if (p) updateRowInSection('medication', idx, { name: p.name, strength: p.strength || '', dose: p.dose || '', usage: p.usage || '', timing: p.timing || '' }); }} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0', color: SLATE }}>
                      <option value="">— เลือกจากยาที่เคยใช้ (กับตัวอื่นด้วย) —</option>
                      {(medicationList || []).map((p, pi) => <option key={pi} value={pi}>{p.name}{p.strength ? ` ${p.strength}` : ''}</option>)}
                    </select>
                  )}
                  <input value={row.name} onChange={(e) => updateRowInSection('medication', idx, { name: e.target.value })} placeholder="ชื่อยา" className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={row.dose} onChange={(e) => updateRowInSection('medication', idx, { dose: e.target.value })} placeholder="ขนาดยา/จำนวน" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                    <input value={row.usage} onChange={(e) => updateRowInSection('medication', idx, { usage: e.target.value })} placeholder="วิธีใช้" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => addRowToSection('medication')} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs py-2.5"><PlusCircle size={14} /> เพิ่มยาอีกตัว</button>
                <SectionPhotoAttach sectionKey="medication" />
              </div>
            </div>
          )}

          {activeSections.includes('bloodTest') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>🩸 ผลเลือด</span><button onClick={() => toggleSection('bloodTest')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              {(sectionData.bloodTest || []).map((row, idx) => (
                <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                  <div className="flex justify-between items-center mb-1">{(sectionData.bloodTest || []).length > 1 && <button onClick={() => removeRowFromSection('bloodTest', idx)} className="text-[11px] ml-auto" style={{ color: BAD }}>ลบ</button>}</div>
                  <TypeSelectWithCustom options={bloodTestTypeList} value={row.type} onChange={(v) => updateRowInSection('bloodTest', idx, { type: v })} onAddToList={onAddBloodTestType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                  <textarea value={row.note} onChange={(e) => updateRowInSection('bloodTest', idx, { note: e.target.value })} placeholder="ผลตรวจ/ค่าที่ได้" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => addRowToSection('bloodTest')} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs py-2.5"><PlusCircle size={14} /> เพิ่มอีกรายการ</button>
                <SectionPhotoAttach sectionKey="bloodTest" />
              </div>
            </div>
          )}

          {activeSections.includes('imaging') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>🩻 X-ray/CT/MRI/Ultrasound</span><button onClick={() => toggleSection('imaging')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              {(sectionData.imaging || []).map((row, idx) => (
                <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                  <div className="flex justify-between items-center mb-1">{(sectionData.imaging || []).length > 1 && <button onClick={() => removeRowFromSection('imaging', idx)} className="text-[11px] ml-auto" style={{ color: BAD }}>ลบ</button>}</div>
                  <TypeSelectWithCustom options={imagingTypeList} value={row.type} onChange={(v) => updateRowInSection('imaging', idx, { type: v })} onAddToList={onAddImagingType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                  <textarea value={row.note} onChange={(e) => updateRowInSection('imaging', idx, { note: e.target.value })} placeholder="ผลอ่านภาพ/รายงาน" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1.5" style={{ border: '1px solid #E7EAF0' }} />
                  <p className="text-[10px] mb-1" style={{ color: SLATE }}>อวัยวะที่เกี่ยวข้อง (สร้างในแท็บอวัยวะให้อัตโนมัติ)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {organTypeList.map((o) => {
                      const active = (row.relatedOrgans || []).includes(o);
                      return (
                        <button key={o} type="button" onClick={() => updateRowInSection('imaging', idx, { relatedOrgans: active ? row.relatedOrgans.filter((x) => x !== o) : [...(row.relatedOrgans || []), o] })} style={{ background: active ? BRASS : PAPER_DIM, color: active ? 'white' : SLATE }} className="rounded-full px-2 py-1 text-[10px]">{o}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => addRowToSection('imaging')} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs py-2.5"><PlusCircle size={14} /> เพิ่มอีกรายการ</button>
                <SectionPhotoAttach sectionKey="imaging" />
              </div>
            </div>
          )}

          {activeSections.includes('organExam') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>🫁 ตรวจอวัยวะ</span><button onClick={() => toggleSection('organExam')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              {(sectionData.organExam || []).map((row, idx) => (
                <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                  <div className="flex justify-between items-center mb-1">{(sectionData.organExam || []).length > 1 && <button onClick={() => removeRowFromSection('organExam', idx)} className="text-[11px] ml-auto" style={{ color: BAD }}>ลบ</button>}</div>
                  <TypeSelectWithCustom options={organTypeList} value={row.organ} onChange={(v) => updateRowInSection('organExam', idx, { organ: v })} onAddToList={onAddOrganType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                  <textarea value={row.note} onChange={(e) => updateRowInSection('organExam', idx, { note: e.target.value })} placeholder="ผลตรวจ/ลักษณะที่พบ" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => addRowToSection('organExam')} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs py-2.5"><PlusCircle size={14} /> เพิ่มอีกรายการ</button>
                <SectionPhotoAttach sectionKey="organExam" />
              </div>
            </div>
          )}

          {activeSections.includes('expense') && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14 }} className="p-3 mb-3">
              <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold" style={{ color: BRASS }}>💰 ค่าใช้จ่าย</span><button onClick={() => toggleSection('expense')} className="text-[11px]" style={{ color: SLATE }}>ลบส่วนนี้ ✕</button></div>
              {(sectionData.expense || []).map((row, idx) => (
                <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                  <div className="flex justify-between items-center mb-1">{(sectionData.expense || []).length > 1 && <button onClick={() => removeRowFromSection('expense', idx)} className="text-[11px] ml-auto" style={{ color: BAD }}>ลบ</button>}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumInput value={row.amount} onChange={(v) => updateRowInSection('expense', idx, { amount: v })} placeholder="จำนวนเงิน" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                    <select value={row.category} onChange={(e) => updateRowInSection('expense', idx, { category: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }}>{PET_EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => addRowToSection('expense')} style={{ border: `1px solid ${BRASS}`, borderRadius: 10, color: BRASS }} className="flex items-center justify-center gap-1.5 text-xs py-2.5"><PlusCircle size={14} /> เพิ่มอีกรายการ</button>
                <SectionPhotoAttach sectionKey="expense" />
              </div>
            </div>
          )}

          {activeSections.length > 0 && (
            <div style={{ background: PAPER_DIM }} className="rounded-lg p-2.5 mb-3">
              <p className="text-[11px]" style={{ color: INK }}>กดบันทึกแล้วระบบจะสร้างให้อัตโนมัติ: {activeSections.map((k) => VISIT_SECTION_DEFS.find((d) => d.key === k)).map((def) => `${def.multi ? (sectionData[def.key] || []).length : 1} ${def.label}`).join(' · ')} — ทั้งหมดผูกกับการไปหาหมอครั้งนี้ให้เสร็จ</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={submitAll} disabled={submitting} style={{ background: INK }} className="text-white text-sm rounded-lg py-2.5 flex-1 font-semibold flex items-center justify-center gap-2">{submitting && <Loader2 size={14} className="animate-spin" />}{submitting ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</button>
            <button onClick={() => { setShowAddForm(false); setActiveSections([]); setSectionData({}); setVisitPhotos([]); }} style={{ border: '1px solid #E7EAF0' }} className="text-sm rounded-lg py-2.5 px-4">ยกเลิก</button>
          </div>
        </Card>
        </>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="flex items-center justify-center gap-1 text-sm w-full py-2.5 rounded-lg mb-4" style={{ border: `1px dashed ${BRASS}`, color: BRASS }}><PlusCircle size={15} /> บันทึกการไปหาหมอครั้งใหม่</button>
      )}
      <p className="text-xs mb-2" style={{ color: SLATE }}>ประวัติการไปหาหมอ</p>
      {visits.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีบันทึก</p>}
      {visits.map((v) => (
        <button key={v.id} onClick={() => setSelectedVisitId(v.id)} className="w-full text-left" style={{ display: 'block' }}>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold" style={{ color: INK }}>{formatDateDMY(v.date)} · {v.hospital || 'ไม่ระบุโรงพยาบาล'}</p>
                <p className="text-xs" style={{ color: SLATE }}>{v.reason || 'ไม่ได้ระบุเหตุผล'}{v.cost ? ` · ฿${fmt(v.cost)}` : ''}</p>
                {(v.linkedRecords || []).length > 0 && <p className="text-[11px] mt-1" style={{ color: BRASS }}>🔗 เชื่อมโยงไว้ {v.linkedRecords.length} รายการ</p>}
              </div>
              <ChevronRight size={15} color={SLATE} />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

const VET_RECORD_TAB_MAP = { appointments: 'appt', weights: 'weight', medications: 'meds', bloodTests: 'records', organExams: 'records', imaging: 'records', expenses: 'expenses' };

function VetVisitDetail({ dog, visit, hospitalList, onAddHospital, doctorList, onAddDoctor, departmentList, onAddDepartment, doctorDepartments, onSetDoctorDepartment, onBack, onUpdateVetVisit, onUpdateDog, onRemoveVetVisit, onLinkRecordToVisit, onUnlinkRecordFromVisit, onUploadRecordPhoto, setSection, weigherList, medicationList, onAddMedicationPreset, bloodTestTypeList, onAddBloodTestType, organTypeList, onAddOrganType, imagingTypeList, onAddImagingType }) {
  const [showLinker, setShowLinker] = useState(false);
  const [linkType, setLinkType] = useState(VET_RECORD_TYPES[0].type);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [shareStatus, setShareStatus] = useState(null); // { loading, message, failedPhotoUrls }
  const photoFileRef = useRef(null);
  const list = hospitalList || [];
  const linkedRecords = visit.linkedRecords || [];

  // เพิ่มหัตถการใหม่เข้ากับครั้งที่ไปหาหมอนี้ทีหลังได้ (ไม่ใช่แค่ตอนสร้างครั้งแรก) — ใช้ระบบชิปเดียวกับหน้าสร้างครั้งใหม่
  const [showAddProcedure, setShowAddProcedure] = useState(false);
  const [procSections, setProcSections] = useState([]);
  const [procData, setProcData] = useState({});
  const [procSubmitting, setProcSubmitting] = useState(false);
  function toggleProcSection(key) {
    const def = VISIT_SECTION_DEFS.find((s) => s.key === key);
    if (procSections.includes(key)) {
      setProcSections((prev) => prev.filter((k) => k !== key));
      setProcData((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } else {
      setProcSections((prev) => [...prev, key]);
      setProcData((prev) => ({ ...prev, [key]: def.multi ? [makeVisitSectionRow(key, visit)] : makeVisitSectionRow(key, visit) }));
    }
  }
  function updateProcSingle(key, patch) { setProcData((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })); }
  function updateProcRow(key, idx, patch) { setProcData((prev) => ({ ...prev, [key]: (prev[key] || []).map((r, i) => (i === idx ? { ...r, ...patch } : r)) })); }
  function addProcRow(key) { setProcData((prev) => ({ ...prev, [key]: [...(prev[key] || []), makeVisitSectionRow(key, visit)] })); }
  function removeProcRow(key, idx) {
    const rows = (procData[key] || []).filter((_, i) => i !== idx);
    if (rows.length === 0) toggleProcSection(key); else setProcData((prev) => ({ ...prev, [key]: rows }));
  }
  async function submitAddedProcedures() {
    setProcSubmitting(true);
    try {
      const newLinks = [...linkedRecords];
      const patch = {};
      VISIT_SECTION_DEFS.forEach((def) => {
        if (!procSections.includes(def.key)) return;
        const rows = def.multi ? procData[def.key] : [procData[def.key]];
        const existing = patch[def.field] || dog[def.field] || [];
        const newEntries = rows.map((row) => { const id = uid(); newLinks.push({ type: def.field, id }); return { id, ...row }; });
        patch[def.field] = [...newEntries, ...existing];
      });
      patch.vetVisits = (dog.vetVisits || []).map((v) => (v.id === visit.id ? { ...v, linkedRecords: newLinks } : v));
      onUpdateDog(dog.id, patch);
      setProcSections([]); setProcData({}); setShowAddProcedure(false);
    } finally { setProcSubmitting(false); }
  }

  function recordsOfType(type) { return dog[type] || []; }
  function isLinked(type, id) { return linkedRecords.some((r) => r.type === type && r.id === id); }
  const linkableRecords = recordsOfType(linkType).filter((r) => !isLinked(linkType, r.id));
  const meta = VET_RECORD_TYPES.find((t) => t.type === linkType);

  async function handleSymptomPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !onUploadRecordPhoto) return;
    setPhotoUploading(true);
    try {
      const photo = await onUploadRecordPhoto(dog.id, 'vetVisits', file);
      onUpdateVetVisit(dog.id, visit.id, { photos: [...(visit.photos || []), photo] });
    } catch (err) { /* เงียบไว้ */ }
    finally { setPhotoUploading(false); if (photoFileRef.current) photoFileRef.current.value = ''; }
  }
  function removeSymptomPhoto(photoId) {
    onUpdateVetVisit(dog.id, visit.id, { photos: (visit.photos || []).filter((p) => p.id !== photoId) });
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-xs mb-3" style={{ color: BRASS }}>‹ กลับไปดูทุกครั้ง</button>
      <Card>
        <div className="flex justify-between items-center mb-2">
          <p className="text-base font-bold" style={{ color: INK }}>{visit.date}</p>
          <div className="flex items-center gap-3">
            <button onClick={async () => {
              const allPhotoUrls = [...(visit.photos || []).map((p) => p.url)];
              (visit.linkedRecords || []).forEach((lr) => {
                const record = (dog[lr.type] || []).find((r) => r.id === lr.id);
                if (record && record.photos) allPhotoUrls.push(...record.photos.map((p) => p.url));
              });
              setShareStatus({ loading: true });
              const res = await shareContent(buildVetVisitShareText(dog, visit), allPhotoUrls);
              if (res.error) setShareStatus({ loading: false, message: `แชร์ไม่สำเร็จ: ${res.error}`, failedPhotoUrls: allPhotoUrls, isError: true });
              else if (allPhotoUrls.length > 0 && !res.sharedWithPhotos) setShareStatus({ loading: false, message: `ส่งได้แค่ข้อความ อุปกรณ์นี้แนบรูปพร้อมกัน ${allPhotoUrls.length} รูปไม่ได้ — กดดาวน์โหลดรูปไว้แนบเองได้`, failedPhotoUrls: allPhotoUrls, isError: false });
              else if (res.sharedWithPhotos) setShareStatus({ loading: false, message: `ส่งรูปแล้ว — บางแอป (เช่น LINE) อาจไม่แปะข้อความสรุปมาด้วยตอนส่งพร้อมรูป ${res.textCopiedToClipboard ? 'ผมคัดลอกข้อความไว้ในคลิปบอร์ดให้แล้ว วางเพิ่มในแชทได้เลย' : ''}`, isError: false });
              else setShareStatus(null);
            }}><Share2 size={16} color={BRASS} /></button>
            <button onClick={() => onRemoveVetVisit(visit.id)}><Trash2 size={16} color={BAD} /></button>
          </div>
        </div>
        {shareStatus && (
          <div style={{ background: shareStatus.isError ? '#FBE3E1' : PAPER_DIM, borderRadius: 10 }} className="p-2.5 mb-2">
            {shareStatus.loading ? (
              <p className="text-xs flex items-center gap-1.5" style={{ color: SLATE }}><Loader2 size={12} className="animate-spin" /> กำลังแชร์...</p>
            ) : (
              <>
                <p className="text-xs mb-1.5" style={{ color: shareStatus.isError ? BAD : INK }}>{shareStatus.message}</p>
                <div className="flex items-center gap-3">
                  {shareStatus.failedPhotoUrls && <button onClick={async () => { const r = await downloadPhotos(shareStatus.failedPhotoUrls); setShareStatus({ loading: false, message: r.success > 0 ? `ดาวน์โหลดสำเร็จ ${r.success} รูป` : `ดาวน์โหลดไม่สำเร็จเลยสักรูป — น่าจะเป็นปัญหาการตั้งค่าเซิร์ฟเวอร์รูปภาพ (CORS) ต้องแก้ที่ตั้งค่า Firebase Storage`, isError: r.success === 0 }); }} className="text-xs font-semibold" style={{ color: BRASS }}>ดาวน์โหลดรูปทั้งหมด</button>}
                  <button onClick={() => setShareStatus(null)} className="text-xs" style={{ color: SLATE }}>ปิด</button>
                </div>
              </>
            )}
          </div>
        )}
        <label className="text-[10px]" style={{ color: SLATE }}>วันที่ไป</label>
        <input type="date" value={visit.date} onChange={(e) => onUpdateVetVisit(dog.id, visit.id, { date: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล</label>
        <select value={list.includes(visit.hospital) ? visit.hospital : (visit.hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value !== '__new__') onUpdateVetVisit(dog.id, visit.id, { hospital: e.target.value }); }} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— เลือกโรงพยาบาล —</option>
          {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ พิมพ์เอง</option>
        </select>
        <label className="text-[10px]" style={{ color: SLATE }}>เหตุผลที่ไป</label>
        <input value={visit.reason || ''} onChange={(e) => onUpdateVetVisit(dog.id, visit.id, { reason: e.target.value })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>แผนก</label>
        <TypeSelectWithCustom options={departmentList || []} value={visit.department || ''} onChange={(v) => { onUpdateVetVisit(dog.id, visit.id, { department: v }); if (v && visit.doctor) onSetDoctorDepartment(visit.doctor, v); }} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>สัตวแพทย์ผู้ตรวจ</label>
        <MemoTextField list={doctorList} value={visit.doctor || ''} onChange={(v) => {
          const knownDept = (doctorDepartments || {})[v];
          onUpdateVetVisit(dog.id, visit.id, { doctor: v, ...(knownDept ? { department: knownDept } : {}) });
        }} onAddToList={(name) => { onAddDoctor(name); if (visit.department) onSetDoctorDepartment(name, visit.department); }} placeholder="ชื่อสัตวแพทย์" className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>ผลวินิจฉัย/การรักษา</label>
        <textarea value={visit.diagnosis || ''} onChange={(e) => onUpdateVetVisit(dog.id, visit.id, { diagnosis: e.target.value })} rows={3} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>ค่าใช้จ่าย</label>
        <NumInput value={visit.cost} onChange={(v) => onUpdateVetVisit(dog.id, visit.id, { cost: v })} className="rounded-lg px-3 py-1.5 text-sm w-full mt-1 mb-3" style={{ border: '1px solid #E7EAF0' }} />
        <label className="text-[10px]" style={{ color: SLATE }}>รูปอาการ (เช่น ถ่ายแผล/จุดที่เป็น)</label>
        <input ref={photoFileRef} type="file" accept="image/*" onChange={handleSymptomPhoto} className="hidden" />
        <button onClick={() => photoFileRef.current && photoFileRef.current.click()} className="flex items-center gap-1 text-xs mt-1" style={{ color: BRASS }}>
          {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} {photoUploading ? 'กำลังอัพโหลด...' : 'แนบรูปอาการ'}
        </button>
        {(visit.photos || []).length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {visit.photos.map((ph) => (
              <div key={ph.id} className="relative">
                <button onClick={() => setLightboxUrl(ph.url)} className="w-full block"><img src={ph.url} alt="" className="w-full h-16 object-cover rounded-lg" /></button>
                <button onClick={() => removeSymptomPhoto(ph.id)} style={{ background: 'rgba(0,0,0,0.5)' }} className="absolute top-0.5 right-0.5 rounded-full p-0.5"><Trash2 size={10} color="white" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>เพิ่มหัตถการอื่นๆ ให้ครั้งนี้</p>
        {!showAddProcedure ? (
          <button onClick={() => setShowAddProcedure(true)} className="flex items-center gap-1 text-xs" style={{ color: BRASS }}><PlusCircle size={13} /> เพิ่มหัตถการใหม่ (เช่น เพิ่งนึกได้ว่ามีตรวจเลือด/CT เพิ่ม)</button>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {VISIT_SECTION_DEFS.map((def) => {
                const active = procSections.includes(def.key);
                return (
                  <button key={def.key} onClick={() => toggleProcSection(def.key)} style={{ background: active ? BRASS : PAPER_DIM, color: active ? 'white' : BRASS, border: active ? 'none' : `1.5px dashed ${BRASS}` }} className="rounded-full px-3 py-1.5 text-xs font-semibold">{def.icon} {def.label}</button>
                );
              })}
            </div>
            {procSections.includes('appointment') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>📅 นัดหมาย</p>
                <input type="date" value={procData.appointment?.date || ''} onChange={(e) => updateProcSingle('appointment', { date: e.target.value })} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1.5" style={{ border: '1px solid #E7EAF0' }} />
                <input value={procData.appointment?.purpose || ''} onChange={(e) => updateProcSingle('appointment', { purpose: e.target.value })} placeholder="วัตถุประสงค์" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
              </div>
            )}
            {procSections.includes('weight') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>⚖️ น้ำหนัก</p>
                <NumInput value={procData.weight?.weight} onChange={(v) => updateProcSingle('weight', { weight: v })} placeholder="น้ำหนัก (กก.)" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
              </div>
            )}
            {procSections.includes('medication') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>💊 ยา</p>
                {(procData.medication || []).map((row, idx) => (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                    <input value={row.name} onChange={(e) => updateProcRow('medication', idx, { name: e.target.value })} placeholder="ชื่อยา" className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={row.dose} onChange={(e) => updateProcRow('medication', idx, { dose: e.target.value })} placeholder="ขนาดยา" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                      <input value={row.usage} onChange={(e) => updateProcRow('medication', idx, { usage: e.target.value })} placeholder="วิธีใช้" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addProcRow('medication')} className="text-xs font-semibold mt-2" style={{ color: BRASS }}>+ เพิ่มยาอีกตัว</button>
              </div>
            )}
            {procSections.includes('bloodTest') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>🩸 ผลเลือด</p>
                {(procData.bloodTest || []).map((row, idx) => (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                    <TypeSelectWithCustom options={bloodTestTypeList} value={row.type} onChange={(v) => updateProcRow('bloodTest', idx, { type: v })} onAddToList={onAddBloodTestType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                    <textarea value={row.note} onChange={(e) => updateProcRow('bloodTest', idx, { note: e.target.value })} placeholder="ผลตรวจ" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                  </div>
                ))}
                <button onClick={() => addProcRow('bloodTest')} className="text-xs font-semibold mt-2" style={{ color: BRASS }}>+ เพิ่มอีกรายการ</button>
              </div>
            )}
            {procSections.includes('imaging') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>🩻 Imaging</p>
                {(procData.imaging || []).map((row, idx) => (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                    <TypeSelectWithCustom options={imagingTypeList} value={row.type} onChange={(v) => updateProcRow('imaging', idx, { type: v })} onAddToList={onAddImagingType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                    <textarea value={row.note} onChange={(e) => updateProcRow('imaging', idx, { note: e.target.value })} placeholder="ผลอ่านภาพ" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                  </div>
                ))}
                <button onClick={() => addProcRow('imaging')} className="text-xs font-semibold mt-2" style={{ color: BRASS }}>+ เพิ่มอีกรายการ</button>
              </div>
            )}
            {procSections.includes('organExam') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>🫁 อวัยวะ</p>
                {(procData.organExam || []).map((row, idx) => (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                    <TypeSelectWithCustom options={organTypeList} value={row.organ} onChange={(v) => updateProcRow('organExam', idx, { organ: v })} onAddToList={onAddOrganType} className="rounded-lg px-2 py-1.5 text-sm w-full mb-1" style={{ border: '1px solid #E7EAF0' }} />
                    <textarea value={row.note} onChange={(e) => updateProcRow('organExam', idx, { note: e.target.value })} placeholder="ผลตรวจ" rows={2} className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                  </div>
                ))}
                <button onClick={() => addProcRow('organExam')} className="text-xs font-semibold mt-2" style={{ color: BRASS }}>+ เพิ่มอีกรายการ</button>
              </div>
            )}
            {procSections.includes('expense') && (
              <div style={{ border: `1px solid ${BORDER}` }} className="rounded-xl p-2.5 mb-2">
                <p className="text-[11px] font-bold mb-1.5" style={{ color: BRASS }}>💰 ค่าใช้จ่าย</p>
                {(procData.expense || []).map((row, idx) => (
                  <div key={idx} style={{ borderTop: idx > 0 ? `1px dashed ${BORDER}` : 'none' }} className="pt-2 mt-2 first:pt-0 first:mt-0">
                    <NumInput value={row.amount} onChange={(v) => updateProcRow('expense', idx, { amount: v })} placeholder="จำนวนเงิน" className="rounded-lg px-2 py-1.5 text-sm w-full" style={{ border: '1px solid #E7EAF0' }} />
                  </div>
                ))}
                <button onClick={() => addProcRow('expense')} className="text-xs font-semibold mt-2" style={{ color: BRASS }}>+ เพิ่มอีกรายการ</button>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={submitAddedProcedures} disabled={procSubmitting || procSections.length === 0} style={{ background: INK }} className="text-white text-sm rounded-lg py-2 flex-1">{procSubmitting ? 'กำลังบันทึก...' : 'บันทึกหัตถการที่เพิ่ม'}</button>
              <button onClick={() => { setShowAddProcedure(false); setProcSections([]); setProcData({}); }} style={{ border: '1px solid #E7EAF0' }} className="text-sm rounded-lg py-2 px-4">ยกเลิก</button>
            </div>
          </div>
        )}
      </Card>
      <Card>
        <p className="text-xs mb-2" style={{ color: SLATE }}>รายการที่เชื่อมโยงไว้ ({linkedRecords.length})</p>
        {linkedRecords.length === 0 && <p className="text-xs mb-2" style={{ color: SLATE }}>ยังไม่ได้เชื่อมโยงอะไร</p>}
        {linkedRecords.map((lr, i) => {
          const typeMeta = VET_RECORD_TYPES.find((t) => t.type === lr.type);
          const record = recordsOfType(lr.type).find((r) => r.id === lr.id);
          if (!record || !typeMeta) return null;
          const targetTab = VET_RECORD_TAB_MAP[lr.type];
          const detail = typeMeta.getDetail ? typeMeta.getDetail(record) : null;
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div>
                <p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p>
                <p className="text-sm">{typeMeta.getLabel(record)}</p>
                {detail && <p className="text-xs mt-0.5" style={{ color: SLATE }}>{detail}</p>}
              </div>
              <div className="flex items-center gap-2">
                {targetTab && <ChevronRight size={14} color={SLATE} />}
                <button onClick={(e) => { e.stopPropagation(); onUnlinkRecordFromVisit(dog.id, visit.id, lr.type, lr.id); }}><Trash2 size={13} color={BAD} /></button>
              </div>
            </button>
          );
        })}
        {showLinker ? (
          <div style={{ background: PAPER_DIM }} className="rounded-lg p-2 mt-2">
            <select value={linkType} onChange={(e) => setLinkType(e.target.value)} className="rounded-lg px-3 py-1.5 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }}>
              {VET_RECORD_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
            {linkableRecords.length === 0 && <p className="text-xs" style={{ color: SLATE }}>ไม่มีรายการ{meta?.label}ที่ยังไม่ได้เชื่อมโยง</p>}
            {linkableRecords.map((r) => (
              <button key={r.id} onClick={() => onLinkRecordToVisit(dog.id, visit.id, linkType, r.id)} className="w-full text-left text-sm py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
                <span>{meta.getLabel(r)}</span><span className="text-[11px]" style={{ color: BRASS }}>+ เชื่อมโยง</span>
              </button>
            ))}
            <button onClick={() => setShowLinker(false)} className="text-xs mt-2" style={{ color: SLATE }}>ปิด</button>
          </div>
        ) : (
          <button onClick={() => setShowLinker(true)} className="flex items-center gap-1 text-xs mt-2" style={{ color: BRASS }}><PlusCircle size={13} /> เชื่อมโยงรายการที่มีอยู่แล้ว</button>
        )}
      </Card>
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}

function DogMedicalRecordsSection({ dog, onAddBloodTest, onUpdateBloodTest, onAddOrganExam, onUpdateOrganExam, onAddImaging, onUpdateImaging, onAddMedicalPhoto, onRemoveMedicalPhoto, onUploadRecordPhoto, bloodTestTypeList, onAddBloodTestType, organTypeList, onAddOrganType, imagingTypeList, onAddImagingType, onAddImagingWithOrgans }) {
  const [subTab, setSubTab] = useState('blood');
  const [bt, setBt] = useState({ type: BLOOD_TEST_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '' });
  const [oe, setOe] = useState({ organ: ORGAN_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '' });
  const [im, setIm] = useState({ type: IMAGING_TYPES[0], date: new Date().toISOString().slice(0, 10), note: '', relatedOrgans: [] });
  const [editingBt, setEditingBt] = useState(null);
  const [editingOe, setEditingOe] = useState(null);
  const [editingIm, setEditingIm] = useState(null);

  // สร้าง state/logic ชุดถ่ายรูป+AI อ่าน+แนบรูป ใช้ร่วมกันได้ทั้ง 3 หมวด (blood/organ/imaging)
  function useScanState() {
    const fileRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const [scannedFile, setScannedFile] = useState(null);
    const [attach, setAttach] = useState(true);
    return { fileRef, scanning, setScanning, scanError, setScanError, scannedFile, setScannedFile, attach, setAttach };
  }
  const btScan = useScanState();
  const oeScan = useScanState();
  const imScan = useScanState();

  async function handleScan(kind, file, applyResult) {
    const scan = kind === 'bloodTest' ? btScan : kind === 'organExam' ? oeScan : imScan;
    scan.setScanning(true); scan.setScanError('');
    try {
      const result = await scanMedicalResult(file, kind);
      applyResult(result);
      scan.setScannedFile(file); scan.setAttach(true);
    } catch (err) { scan.setScanError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { scan.setScanning(false); if (scan.fileRef.current) scan.fileRef.current.value = ''; }
  }
  async function submitWithPhoto(kind, entry, scan, onAdd, resetForm) {
    let finalEntry = entry;
    if (scan.scannedFile && scan.attach) {
      const photo = await onUploadRecordPhoto(dog.id, kind, scan.scannedFile);
      finalEntry = { ...entry, photos: [photo] };
    }
    onAdd(dog.id, finalEntry);
    resetForm();
    scan.setScannedFile(null);
  }

  function ScanButton({ scan, kind, label, onResult }) {
    return (
      <>
        <input ref={scan.fileRef} type="file" accept="image/*" onChange={(e) => { const file = e.target.files && e.target.files[0]; if (file) handleScan(kind, file, onResult); }} className="hidden" />
        <button onClick={() => scan.fileRef.current && scan.fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-2">
          {scan.scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />} {scan.scanning ? 'กำลังอ่านภาพ...' : label}
        </button>
        {scan.scanError && <p className="text-xs mb-3" style={{ color: BAD }}>{scan.scanError}</p>}
        {scan.scannedFile && (
          <label className="flex items-center gap-2 mb-3 text-xs" style={{ color: INK }}>
            <input type="checkbox" checked={scan.attach} onChange={(e) => scan.setAttach(e.target.checked)} />
            แนบรูปที่ถ่ายนี้ไปกับรายการเลย (ไม่ต้องแนบซ้ำทีหลัง)
          </label>
        )}
      </>
    );
  }

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
            <ScanButton scan={btScan} kind="bloodTests" label="ถ่ายรูปผลตรวจเลือด ให้ AI กรอกให้" onResult={(r) => setBt({ type: BLOOD_TEST_TYPES.includes(r.type) ? r.type : bt.type, date: r.date || bt.date, note: r.note || bt.note })} />
            <TypeSelectWithCustom options={bloodTestTypeList} value={bt.type} onChange={(v) => setBt({ ...bt, type: v })} onAddToList={onAddBloodTestType} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <input type="date" value={bt.date} onChange={(e) => setBt({ ...bt, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <textarea value={bt.note} onChange={(e) => setBt({ ...bt, note: e.target.value })} placeholder="ผลตรวจ/ค่าที่ได้" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }} rows={3} />
            <button onClick={() => submitWithPhoto('bloodTests', bt, btScan, onAddBloodTest, () => setBt({ ...bt, note: '' }))} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผลตรวจเลือด</button>
          </Card>
          {[...(dog.bloodTests || [])].reverse().map((r) => (
            <Card key={r.id}>
              <div className="flex justify-between items-start">
                <div><p className="text-sm font-semibold">{r.type} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div>
                <EditButton onClick={() => setEditingBt(r)} />
              </div>
              <MedicalPhotoAttach record={r} onAddPhoto={(file) => onAddMedicalPhoto(dog.id, 'bloodTests', r.id, file)} onRemovePhoto={(pid) => onRemoveMedicalPhoto(dog.id, 'bloodTests', r.id, pid)} />
            </Card>
          ))}
        </>
      )}
      {subTab === 'organ' && (
        <>
          <Card>
            <ScanButton scan={oeScan} kind="organExams" label="ถ่ายรูปผลตรวจอวัยวะ ให้ AI กรอกให้" onResult={(r) => setOe({ organ: ORGAN_TYPES.includes(r.type) ? r.type : oe.organ, date: r.date || oe.date, note: r.note || oe.note })} />
            <TypeSelectWithCustom options={organTypeList} value={oe.organ} onChange={(v) => setOe({ ...oe, organ: v })} onAddToList={onAddOrganType} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <input type="date" value={oe.date} onChange={(e) => setOe({ ...oe, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <textarea value={oe.note} onChange={(e) => setOe({ ...oe, note: e.target.value })} placeholder="ผลตรวจ/ลักษณะที่พบ" className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }} rows={3} />
            <button onClick={() => submitWithPhoto('organExams', oe, oeScan, onAddOrganExam, () => setOe({ ...oe, note: '' }))} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผลตรวจอวัยวะ</button>
          </Card>
          {[...(dog.organExams || [])].reverse().map((r) => (
            <Card key={r.id}>
              <div className="flex justify-between items-start">
                <div><p className="text-sm font-semibold">{r.organ} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div>
                <EditButton onClick={() => setEditingOe(r)} />
              </div>
              <MedicalPhotoAttach record={r} onAddPhoto={(file) => onAddMedicalPhoto(dog.id, 'organExams', r.id, file)} onRemovePhoto={(pid) => onRemoveMedicalPhoto(dog.id, 'organExams', r.id, pid)} />
            </Card>
          ))}
        </>
      )}
      {subTab === 'imaging' && (
        <>
          <Card>
            <ScanButton scan={imScan} kind="imaging" label="ถ่ายรูปผล Imaging ให้ AI กรอกให้" onResult={(r) => setIm({ ...im, type: IMAGING_TYPES.includes(r.type) ? r.type : im.type, date: r.date || im.date, note: r.note || im.note })} />
            <TypeSelectWithCustom options={imagingTypeList} value={im.type} onChange={(v) => setIm({ ...im, type: v })} onAddToList={onAddImagingType} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <input type="date" value={im.date} onChange={(e) => setIm({ ...im, date: e.target.value })} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
            <textarea value={im.note} onChange={(e) => setIm({ ...im, note: e.target.value })} placeholder="ผลอ่านภาพ/รายงาน" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} rows={3} />
            <p className="text-[11px] mb-1.5" style={{ color: SLATE }}>อวัยวะที่เกี่ยวข้อง (เลือกได้หลายอวัยวะ — จะสร้างรายการในแท็บอวัยวะให้อัตโนมัติ)</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {organTypeList.map((o) => {
                const active = (im.relatedOrgans || []).includes(o);
                return (
                  <button key={o} type="button" onClick={() => setIm({ ...im, relatedOrgans: active ? im.relatedOrgans.filter((x) => x !== o) : [...(im.relatedOrgans || []), o] })} style={{ background: active ? BRASS : PAPER_DIM, color: active ? 'white' : SLATE }} className="rounded-full px-2.5 py-1 text-[11px]">{o}</button>
                );
              })}
            </div>
            <button onClick={async () => {
              const organs = im.relatedOrgans || [];
              if (imScan.scannedFile && imScan.attach) {
                const photo = await onUploadRecordPhoto(dog.id, 'imaging', imScan.scannedFile);
                onAddImagingWithOrgans(dog.id, { ...im, photos: [photo] }, organs);
              } else {
                onAddImagingWithOrgans(dog.id, im, organs);
              }
              setIm({ ...im, note: '', relatedOrgans: [] });
              imScan.setScannedFile(null);
            }} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกผล Imaging</button>
          </Card>
          {[...(dog.imaging || [])].reverse().map((r) => (
            <Card key={r.id}>
              <div className="flex justify-between items-start">
                <div><p className="text-sm font-semibold">{r.type} · {r.date}</p><p className="text-xs" style={{ color: SLATE }}>{r.note}</p></div>
                <EditButton onClick={() => setEditingIm(r)} />
              </div>
              <MedicalPhotoAttach record={r} onAddPhoto={(file) => onAddMedicalPhoto(dog.id, 'imaging', r.id, file)} onRemovePhoto={(pid) => onRemoveMedicalPhoto(dog.id, 'imaging', r.id, pid)} />
            </Card>
          ))}
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

// อัลบั้มรูปสำคัญของลูกๆ — ไม่ผูกกับบันทึกไหนเป็นพิเศษ ถ่าย/เลือกได้หลายรูป
function DogAlbumSection({ dog, onAddAlbumPhoto, onRemoveAlbumPhoto }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  async function handleFile(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try { for (const file of files) await onAddAlbumPhoto(dog.id, file); } catch (err) { /* เงียบไว้ */ }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  const photos = dog.albumPhotos || [];
  return (
    <div>
      <Card>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 mb-3">{uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color="#FBBF24" />}{uploading ? 'กำลังอัพโหลด...' : 'เพิ่มรูป (เลือกได้หลายรูป)'}</button>
        {photos.length === 0 ? (
          <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีรูปในอัลบั้ม</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((ph) => (
              <div key={ph.id} className="relative">
                <button onClick={() => setLightboxUrl(ph.url)} className="w-full block"><img src={ph.url} alt="" className="w-full h-24 object-cover rounded-lg" /></button>
                <button onClick={() => onRemoveAlbumPhoto(dog.id, ph.id)} style={{ background: 'rgba(0,0,0,0.5)' }} className="absolute top-1 right-1 rounded-full p-1"><Trash2 size={12} color="white" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  );
}

function DogExpensesSection({ dog, onAddDogExpense, onRemoveDogExpense, onUpdateDogExpense, hospitalList, onAddHospital, onAddPersonalExpense, expenseCategories, onUploadRecordPhoto }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(PET_EXPENSE_CATEGORIES[0]);
  const [hospital, setHospital] = useState('');
  const [note, setNote] = useState('');
  const [alsoPersonal, setAlsoPersonal] = useState(false);
  const [periodType, setPeriodType] = useState('month');
  const [editingExp, setEditingExp] = useState(null);
  const receiptFileRef = useRef(null);
  const receiptGalleryRef = useRef(null);
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

  function mapToPersonalCategory(petCategory) {
    const cats = expenseCategories || [];
    if (cats.includes(petCategory)) return petCategory;
    if (cats.includes('อื่นๆ')) return 'อื่นๆ';
    return cats[0] || 'อื่นๆ';
  }
  function logToPersonalIfChecked(entryDate, entryAmount, entryCategory, entryNote) {
    if (alsoPersonal && onAddPersonalExpense) {
      onAddPersonalExpense({ date: entryDate, amount: entryAmount, category: mapToPersonalCategory(entryCategory), note: `${dog.name}${entryNote ? ' · ' + entryNote : ''}` });
    }
  }

  function submit() {
    if (!amount) return;
    const date = new Date().toISOString().slice(0, 10);
    onAddDogExpense(dog.id, { date, amount, category, hospital, note });
    logToPersonalIfChecked(date, amount, category, note);
    setAmount(0); setNote('');
  }

  async function handleReceiptPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setReceiptScanning(true); setReceiptError('');
    try {
      const result = await scanPetExpenseReceipt(file, PET_EXPENSE_CATEGORIES);
      const amt = Number(result.amount);
      if (!amt) { setReceiptError('อ่านยอดเงินจากภาพไม่สำเร็จ ลองภาพที่ชัดกว่านี้'); return; }
      const cat = PET_EXPENSE_CATEGORIES.includes(result.category) ? result.category : 'อื่นๆ';
      const entryDate = result.date || new Date().toISOString().slice(0, 10);
      const entryNote = result.note || (result.sourceType === 'transfer_slip' ? 'ถ่ายจากสลิปโอนเงิน' : 'ถ่ายจากใบเสร็จ');
      let entry = { date: entryDate, amount: amt, category: cat, hospital, note: entryNote };
      if (onUploadRecordPhoto) { try { const photo = await onUploadRecordPhoto(dog.id, 'expenses', file); entry = { ...entry, photos: [photo] }; } catch (e) { /* บันทึกรายการต่อได้แม้แนบรูปไม่สำเร็จ */ } }
      onAddDogExpense(dog.id, entry);
      logToPersonalIfChecked(entryDate, amt, cat, entryNote);
    } catch (err) { setReceiptError('อ่านภาพไม่สำเร็จ: ' + err.message); }
    finally { setReceiptScanning(false); if (receiptFileRef.current) receiptFileRef.current.value = ''; }
  }

  return (
    <div>
      <Card>
        <input ref={receiptFileRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptPhoto} className="hidden" />
        <input ref={receiptGalleryRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <div className="flex gap-2 mb-3">
          <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} disabled={receiptScanning} style={{ background: INK }} className="flex-1 text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2">
            {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูป (บันทึกทันที)'}
          </button>
          <button onClick={() => receiptGalleryRef.current && receiptGalleryRef.current.click()} disabled={receiptScanning} style={{ border: '1px solid #E7EAF0' }} className="flex-1 rounded-lg py-2 text-sm flex items-center justify-center gap-2" >
            <ImageIcon size={14} /> เลือกจากอัลบั้ม
          </button>
        </div>
        {receiptError && <p className="text-xs mb-3" style={{ color: BAD }}>{receiptError}</p>}
        <label className="text-xs" style={{ color: SLATE }}>หรือกรอกเอง</label>
        <NumInput value={amount} onChange={setAmount} placeholder="จำนวนเงิน" className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }}>{PET_EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <label className="text-[10px]" style={{ color: SLATE }}>โรงพยาบาล (ไม่บังคับ)</label>
        <select value={list.includes(hospital) ? hospital : (hospital ? '__custom__' : '')} onChange={(e) => { if (e.target.value === '__new__') setHospital(''); else setHospital(e.target.value); }} className="rounded-lg px-3 py-2 text-sm w-full mt-1 mb-1" style={{ border: '1px solid #E7EAF0' }}>
          <option value="">— ไม่ระบุ —</option>
          {list.map((hName) => <option key={hName} value={hName}>{hName}</option>)}
          <option value="__new__">+ เพิ่มโรงพยาบาลใหม่</option>
        </select>
        {(hospital && !list.includes(hospital)) && (
          <div className="flex gap-2 mb-2">
            <input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="พิมพ์ชื่อโรงพยาบาล" className="rounded-lg px-3 py-1.5 text-sm flex-1" style={{ border: '1px solid #E7EAF0' }} />
            <button type="button" onClick={() => { if (hospital) onAddHospital(hospital); }} className="text-xs rounded-lg px-3" style={{ border: '1px solid #E7EAF0', color: BRASS }}>บันทึกชื่อนี้ไว้</button>
          </div>
        )}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="โน้ต" className="rounded-lg px-3 py-2 text-sm w-full mb-2" style={{ border: '1px solid #E7EAF0' }} />
        <label className="flex items-center gap-2 mb-3 text-xs" style={{ color: INK }}>
          <input type="checkbox" checked={alsoPersonal} onChange={(e) => setAlsoPersonal(e.target.checked)} />
          นับเป็นรายจ่ายประจำวันด้วย
        </label>
        <button onClick={submit} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm">บันทึกค่าใช้จ่าย</button>
      </Card>
      <Card>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPeriodType('month')} style={{ background: periodType === 'month' ? INK : PAPER_DIM, color: periodType === 'month' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายเดือน</button>
          <button onClick={() => setPeriodType('year')} style={{ background: periodType === 'year' ? INK : PAPER_DIM, color: periodType === 'year' ? 'white' : INK }} className="rounded-full px-3 py-1.5 text-xs">รายปี</button>
        </div>
        {periods.length > 0 ? <select value={selPeriod} onChange={(e) => setSelPeriod(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-full mb-3" style={{ border: '1px solid #E7EAF0' }}>{periods.map((p) => <option key={p} value={p}>{p}</option>)}</select> : <p className="text-xs" style={{ color: SLATE }}>ยังไม่มีข้อมูล</p>}
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
