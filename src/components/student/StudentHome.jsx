import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Sparkles, 
  CheckCircle2, 
  Bus, 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Award,
  FileText,
  QrCode,
  Check,
  ShieldCheck,
  X,
  Radio,
  Send,
  Bell
} from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const { 
    currentUser, 
    notices, 
    isTripActive, 
    currentEta, 
    students8A, 
    activeQrSession, 
    markStudentAttendanceByQR,
    addToast 
  } = useSchool();

  const [showQRModal, setShowQRModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Check current student's status
  const currentStudent = students8A.find((s) => s.isFeatured || s.roll === '8A-14') || {
    name: currentUser?.name || 'Aarav Sharma',
    roll: '8A-14',
    status: 'PRESENT'
  };

  const isPresent = currentStudent.status === 'PRESENT';

  const handleVerifyQR = (e) => {
    e?.preventDefault();
    const pin = enteredPin.trim() || activeQrSession.sessionCode;
    const res = markStudentAttendanceByQR(pin, '8A');
    if (res.success) {
      setShowQRModal(false);
      setEnteredPin('');
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      markStudentAttendanceByQR(activeQrSession.sessionCode, '8A');
      setIsScanning(false);
      setShowQRModal(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Student Profile Card & Attendance Badge */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowQRModal(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-xs ${
              isPresent
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {isPresent ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isPresent ? 'Present Today (QR Verified)' : 'Tap to Mark QR Attendance'}</span>
          </button>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {currentStudent.roll} • Class 8-A
          </span>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-[#00236F] tracking-tight flex items-center gap-2">
            <span>Hi, {currentUser?.name || 'Aarav'}</span>
            <span className="text-xl">🎒</span>
          </h1>
          <p className="text-xs text-slate-500">
            RAVS Smart School • CBSE Secondary Board 2026
          </p>
        </div>
      </div>

      {/* Featured AI Doubt Assistant Banner */}
      <div className="relative p-4 rounded-3xl bg-gradient-to-tr from-[#00236F] via-blue-900 to-indigo-800 text-white shadow-lg overflow-hidden space-y-3">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-blue-200 uppercase tracking-wider block">Gemini Powered</span>
              <h2 className="text-base font-extrabold tracking-tight">AI Study & Doubt Bot</h2>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
            24/7 CBSE Tutor
          </span>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed relative z-10">
          Got stuck solving quadratic equations, biology diagrams, or history questions? Get instant step-by-step NCERT explanations!
        </p>

        <button
          onClick={() => onNavigate('ai_doubt')}
          className="w-full py-2.5 rounded-2xl bg-white text-[#00236F] font-bold text-xs shadow-md hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-2 relative z-10"
        >
          <span>Ask Study Question Now</span>
          <ArrowRight className="w-4 h-4 text-[#00236F]" />
        </button>
      </div>

      {/* 2x2 Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* QR Attendance Action */}
        <button
          onClick={() => setShowQRModal(true)}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
              QR Check-In
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isPresent ? 'Verified Today' : 'Scan Teacher QR'}
            </span>
          </div>
        </button>

        {/* Study Handouts & Q&A */}
        <button
          onClick={() => onNavigate('notes')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700 transition-colors">
              Notes & Q&A
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Teacher Handouts
            </span>
          </div>
        </button>

        {/* School Notices */}
        <button
          onClick={() => onNavigate('notices')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
              Circulars
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {notices.length} Active alerts
            </span>
          </div>
        </button>

        {/* Live Bus Tracker */}
        <button
          onClick={() => onNavigate('bus')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700 transition-colors">
              Bus Tracker
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isTripActive ? `${currentEta}m ETA` : 'BUS-01 Standby'}
            </span>
          </div>
        </button>
      </div>

      {/* Assigned Bus Status Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assigned School Bus</span>
          </div>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            BUS-01
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-bold text-slate-900">Stop: Maple Heights (08:15 AM)</p>
            <p className="text-[11px] text-slate-500">Route #4 (South Corridor) • Rajesh Kumar</p>
          </div>

          <button
            onClick={() => onNavigate('bus')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold transition-all flex items-center gap-1 hover:bg-blue-100"
          >
            <span>Track Bus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL: STUDENT QR ATTENDANCE SCANNER */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Class 8-A QR Check-In</h3>
                  <p className="text-[10.5px] text-slate-500">Daily Attendance Verification</p>
                </div>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Viewfinder Simulation */}
            <div className="bg-slate-900 rounded-2xl h-44 relative overflow-hidden flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center overflow-hidden">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />
                <QrCode className="w-12 h-12 text-white/50" />
              </div>

              <div className="absolute bottom-2 text-center">
                <span className="text-[10px] text-slate-300">Point at teacher's screen QR code</span>
              </div>
            </div>

            {/* Tap to simulate camera scan */}
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isScanning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Teacher QR...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Scan Teacher QR Code Now</span>
                </>
              )}
            </button>

            {/* Manual PIN Fallback Form */}
            <form onSubmit={handleVerifyQR} className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Or Enter 4-Digit Classroom PIN</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder={`e.g. ${activeQrSession.sessionCode}`}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center tracking-widest text-[#00236F] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00236F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-xs"
                >
                  Submit PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
