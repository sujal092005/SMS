import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import QRCodeSVG from '../common/QRCodeSVG';
import {
  QrCode,
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Building2,
  UserCheck,
  History,
  FileCheck2
} from 'lucide-react';

export default function TeacherAttendanceQR({ onBack }) {
  const {
    currentUser,
    campusGateQR,
    todayTeacherCheckIn,
    teacherPunchLogs,
    logTeacherGateCheckIn,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'form' | 'logs' | 'kiosk_qr'
  const [selectedGate, setSelectedGate] = useState('Main Campus Gate A (North)');
  const [selectedShift, setSelectedShift] = useState('Morning Shift (07:45 AM - 02:30 PM)');
  const [assignedWing, setAssignedWing] = useState('Academic Block 2 • Room 204');
  const [temperature, setTemperature] = useState('98.4°F (Normal)');
  const [remarks, setRemarks] = useState('Reported for 1st period Mathematics & morning class incharge duty.');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  const gatesList = [
    'Main Campus Gate A (North)',
    'Science Wing Gate B (East)',
    'Administrative Block Gate C',
    'Senior Secondary Gate D (South)'
  ];

  const shiftsList = [
    'Morning Shift (07:45 AM - 02:30 PM)',
    'Full Day Shift (07:45 AM - 05:00 PM)',
    'Examination Duty Shift (08:30 AM - 01:30 PM)'
  ];

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedSuccess(true);
      addToast('Campus Gate QR Code detected! Please confirm your entry details.', 'success');
      setActiveTab('form');
    }, 1200);
  };

  const handleConfirmPunchIn = (e) => {
    e.preventDefault();
    logTeacherGateCheckIn({
      gate: selectedGate,
      shift: selectedShift,
      assignedWing,
      temperature,
      remarks
    });
    setScannedSuccess(true);
    setActiveTab('logs');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8FF] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/90 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Faculty Campus Attendance
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Teacher QR Clock-In
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">{currentUser?.name}</span>
            <span className="text-[11px] text-slate-500 font-medium">{currentUser?.employeeId || 'EMP-T482'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-3 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Gate QR</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Clock-In Details</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosk_qr')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kiosk_qr'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="View Gate QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Today's Punch-In Status Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Today's Campus Entry Status
              </span>
              <div className="text-2xl font-black mt-1 flex items-center gap-2">
                <span>{todayTeacherCheckIn.checkedIn ? 'Punched In' : 'Pending Check-In'}</span>
                <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {todayTeacherCheckIn.time}
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1">
                📍 {todayTeacherCheckIn.gate} • {todayTeacherCheckIn.shift.split('(')[0]}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* TAB 1: SCAN GATE QR */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs text-center space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">Scan Entrance Gate QR Code</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Upon entering the campus, point your camera at the gate QR scanner to clock-in and record your entry.
                </p>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative mx-auto w-64 h-64 rounded-3xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-indigo-500 shadow-inner">
                {isScanning ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-indigo-300">Reading Campus QR...</span>
                  </div>
                ) : (
                  <>
                    {/* Viewfinder Corners */}
                    <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                    {/* Animated Scanning Laser */}
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse"></div>

                    <div className="text-center p-4 text-white/80 space-y-1">
                      <Camera className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-300 block">
                        Align Gate QR within frame
                      </span>
                      <span className="text-[10.5px] text-slate-400">
                        {selectedGate}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Verifying Gate QR...' : 'Simulate Scan Gate QR Code'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('form')}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Manual Details Entry Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLOCK-IN & ENTRY DETAILS FORM */}
        {activeTab === 'form' && (
          <form onSubmit={handleConfirmPunchIn} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Confirm Faculty Entry Details</h2>
              <p className="text-xs text-slate-500">Record your location, duty shift, and daily reporting notes.</p>
            </div>

            {/* Teacher Details */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                  PS
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{currentUser?.name || 'Mrs. Priya Sharma'}</span>
                  <span className="text-[11px] text-indigo-700 font-bold">
                    {currentUser?.employeeId || 'EMP-T482'} • Senior Math & Class Incharge
                  </span>
                </div>
              </div>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                Verified ID
              </span>
            </div>

            {/* Gate Location Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Campus Entry Point / Gate</span>
              </label>
              <select
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              >
                {gatesList.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Duty Shift Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duty Shift</span>
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              >
                {shiftsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Assigned Wing & Room */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reporting Wing & Classroom</span>
              </label>
              <input
                type="text"
                value={assignedWing}
                onChange={(e) => setAssignedWing(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            {/* Temperature & Health Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Temperature / Health Screening</span>
              </label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Arrival Remarks / Notes</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Campus Check-In</span>
            </button>
          </form>
        )}

        {/* TAB 3: MY ATTENDANCE LOGS & HISTORY */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {/* Monthly Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Days Present</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">22 Days</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">On-Time Rate</span>
                <span className="text-lg font-black text-emerald-600 block mt-0.5">98.5%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Leaves Balance</span>
                <span className="text-lg font-black text-indigo-600 block mt-0.5">4 Days</span>
              </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Punch-In Activity
                  </h3>
                </div>
                <span className="text-[10.5px] font-bold text-indigo-600">This Month</span>
              </div>

              <div className="space-y-2.5">
                {teacherPunchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{log.date}</span>
                      <span className="text-[10.5px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>In at {log.checkInTime}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{log.gate}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200/60">
                      "{log.remarks}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPUS GATE QR CODE (KIOSK DISPLAY) */}
        {activeTab === 'kiosk_qr' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Main Campus Gate Kiosk Token
              </span>
              <h2 className="text-lg font-bold text-slate-900">{campusGateQR.gateName}</h2>
              <p className="text-xs text-slate-500">Security Incharge: {campusGateQR.securityOfficer}</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-indigo-200 max-w-xs mx-auto flex flex-col items-center">
              <QRCodeSVG
                value={campusGateQR.token}
                size={200}
                fgColor="#1e1b4b"
                level="H"
                includeMargin={true}
              />
              <span className="mt-2 text-xs font-mono font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">
                {campusGateQR.token}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Teachers scan this official QR Code when entering the campus gate to clock in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
