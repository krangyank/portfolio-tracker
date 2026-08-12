````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
````jsx
tment?.doctor || ''} onChange={(v) => updateSingleSection('appointment', { doctor: v })} onAddToList={onAddDoctor} placeholder="ชื่อสัตวแพทย์ (ถ้ามี)" className="rounded-lg px-2 py-1.5 text-sm w-full mt-1" style={{ border: '1px solid #E7EAF0' }} />
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
          return (
            <button key={`${lr.type}-${lr.id}`} onClick={() => targetTab && setSection && setSection(targetTab)} className="flex justify-between items-center py-2 w-full text-left" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
              <div><p className="text-[10px]" style={{ color: BRASS }}>{typeMeta.label}</p><p className="text-sm">{typeMeta.getLabel(record)}</p></div>
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
        <input ref={receiptFileRef} type="file" accept="image/*" onChange={handleReceiptPhoto} className="hidden" />
        <button onClick={() => receiptFileRef.current && receiptFileRef.current.click()} style={{ background: INK }} className="w-full text-white rounded-lg py-2 text-sm flex items-center justify-center gap-2 mb-3">
          {receiptScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} color={BRASS} />}{receiptScanning ? 'กำลังอ่านภาพ...' : 'ถ่ายรูปใบเสร็จหรือสลิปโอน (บันทึกทันที)'}
        </button>
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

````
