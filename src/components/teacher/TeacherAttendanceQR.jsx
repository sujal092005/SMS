import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import QRCodeSVG from '../common/QRCodeSVG';
import { 
  QrCode, 
  Camera, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  ChevronDown,
  Save,
  Radio
} from 'lucide-react';

export default function TeacherAttendanceQR({ onBack }) {
  const { 
    classesList,
    selectedClassId, 
    setSelectedClassId,
    multiClassRoster,
    setClassStudentStatus,
    markAllClassStudentsPresent,
    activeQrSession,
    regenerateQRSession,
    qrScannedLogs,
    markStudentAttendanceByQR,
    submitAttendance,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'camera' | 'roster'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Current class roster
  const currentClassObj = classesList.find((c) => c.id === selectedClassId) || classesList[3];
  const roster = multiClassRoster[selectedClassId] || [];

  const presentCount = roster.filter((s) => s.status === 'PRESENT').length;
  const absentCount = roster.filter((s) => s.status === 'ABSENT').length;
  const lateCount = roster.filter((s) => s.status === 'LATE').length;
  const totalCount = roster.length;
  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Filtered roster for manual roll-call
  const filteredStudents = roster.filter((student) => {
    const matchesQuery = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.roll.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || student.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  // Camera stream handler
  useEffect(() => {
    if (activeTab === 'camera' && isCameraActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Camera access denied/unavailable:', err);
            addToast('Camera preview simulated for browser compatibility', 'info');
          });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeTab, isCameraActive]);

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(activeQrSession.sessionCode);
    setCopiedPin(true);
    addToast(`Session PIN ${activeQrSession.sessionCode} copied!`, 'info');
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleManualScanSubmit = (e) => {
    e?.preventDefault();
    if (!manualCodeInput.trim()) return;
    markStudentAttendanceByQR(manualCodeInput, selectedClassId);
    setManualCodeInput('');
  };

  const handleSimulateStudentScan = (student) => {
    markStudentAttendanceByQR(student.roll, selectedClassId);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Top Header & Class Switcher */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-[#00236F] tracking-tight">QR Attendance System</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-500">Smart Classroom Verification • CBSE 2026</p>
            </div>
          </div>

          {/* Class Dropdown */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                regenerateQRSession(e.target.value);
              }}
              className="appearance-none bg-white border border-blue-200 text-[#00236F] font-bold text-xs py-1.5 pl-3 pr-7 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-blue-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Live Attendance Rate Strip */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
              <span className="text-base font-black text-[#00236F]">{presentPercent}%</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Rate</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{currentClassObj.label} • {currentClassObj.room}</span>
              <span className="text-[11px] text-slate-500">Incharge: {currentClassObj.teacher}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs font-extrabold text-emerald-700">{presentCount} Present</span>
              <span className="text-[11px] text-rose-600 font-medium block">{absentCount} Absent</span>
            </div>
            <div className="w-2 h-8 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-emerald-500 transition-all duration-500" 
                style={{ height: `${presentPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'qr'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Screen QR</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('camera');
            setIsCameraActive(true);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'camera'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'roster'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roll-Call</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC SCREEN QR GENERATOR */}
      {activeTab === 'qr' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Projector Broadcast Mode • Active</span>
            </div>

            {/* High-Contrast SVG QR Code */}
            <div className="p-3 bg-white rounded-2xl border-2 border-[#00236F] shadow-md hover:scale-101 transition-transform">
              <QRCodeSVG
                value={activeQrSession.token}
                size={220}
                fgColor="#00236F"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Session Token & Manual PIN Entry */}
            <div className="w-full bg-[#FAF8FF] rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Session Entry PIN
                </span>
                <span className="text-2xl font-black text-[#00236F] tracking-widest">
                  {activeQrSession.sessionCode}
                </span>
                <span className="text-[10px] text-slate-500 block">Valid until {activeQrSession.expiresAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPin}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs flex items-center gap-1 text-xs font-bold"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPin ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => regenerateQRSession(selectedClassId)}
                  className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition-all border border-blue-200 shadow-xs"
                  title="Regenerate QR"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-xs">
              Students open their RAVS Smart School App → Tap <strong>"QR Attendance"</strong> to scan this code or enter the 4-digit PIN.
            </p>
          </div>

          {/* Live Scanned Students Ticker */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Verified Check-Ins</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {presentCount} / {totalCount} Checked-in
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {qrScannedLogs.map((log, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 transition-all animate-fadeIn"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{log.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{log.roll}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMERA SCANNER (TEACHER SCANS STUDENT BADGES) */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl p-4 text-white relative overflow-hidden shadow-md flex flex-col items-center justify-center min-h-[260px]">
            {/* Viewfinder Target Frame */}
            <div className="relative w-48 h-48 border-2 border-emerald-400 rounded-2xl flex items-center justify-center overflow-hidden bg-black/30">
              {/* Animated Laser Line */}
              <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-lg shadow-emerald-500/50" />
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-80"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none">
                <QrCode className="w-10 h-10 text-emerald-400/80 mb-1" />
                <span className="text-[11px] font-bold text-white/90">Point camera at Student ID Badge</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs text-slate-300 block">Auto-detection active for {currentClassObj.label}</span>
            </div>
          </div>

          {/* Quick Manual Roll / Barcode Entry */}
          <form onSubmit={handleManualScanSubmit} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex gap-2">
            <input
              type="text"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
              placeholder="Enter Roll No (e.g. 8A-04 or student name)..."
              className="flex-1 px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00236F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs"
            >
              Verify
            </button>
          </form>

          {/* Rapid Test Simulation Grid */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Tap Student Card to Simulate Quick Scan
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {roster.slice(0, 8).map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSimulateStudentScan(student)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    student.status === 'PRESENT'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <span className="text-[11px] font-bold block truncate">{student.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{student.roll}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    student.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {student.status === 'PRESENT' ? 'P' : 'Scan'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANUAL ROSTER ROLL-CALL */}
      {activeTab === 'roster' && (
        <div className="space-y-3">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roll or name..."
                className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
              />
            </div>

            <button
              onClick={() => markAllClassStudentsPresent(selectedClassId)}
              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {['ALL', 'PRESENT', 'ABSENT', 'LATE'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === filter
                    ? 'bg-[#00236F] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Student Roster Table */}
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                    {student.avatarInitials || student.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{student.name}</span>
                      {student.isFeatured && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Lead</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{student.roll} • {student.busId}</span>
                  </div>
                </div>

                {/* Status Toggles: P / A / L */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setClassStudentStatus(selectedClassId, student.id, 'PRESENT')}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                      student.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    P
                  </button>

                  <button
                    onClick={() => setClassStudentStatus(selectedClassId, student.id, 'ABSENT')}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                      student.status === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    A
                  </button>

                  <button
                    onClick={() => setClassStudentStatus(selectedClassId, student.id, 'LATE')}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                      student.status === 'LATE'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Save & Cloud Sync Button */}
      <div className="pt-2">
        <button
          onClick={submitAttendance}
          className="w-full py-3.5 bg-gradient-to-r from-[#00236F] to-[#1E3A8A] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Sync Attendance to Portal</span>
        </button>
      </div>
    </div>
  );
}
