import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Send, 
  Search, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function AttendanceRoster({ onBack }) {
  const { 
    students8A, 
    setStudentStatus, 
    markAllStudentsPresent, 
    submitAttendance,
    attendanceStats,
    attendanceSubmittedTime
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredStudents = students8A.filter((student) => {
    const matchesQuery = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.roll.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || student.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Top Header */}
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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Class 8-A Attendance</h1>
            <p className="text-[11px] text-slate-500">1-Tap Roll Call & Parent Alerts</p>
          </div>
        </div>

        <button
          onClick={markAllStudentsPresent}
          className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mark All Present</span>
        </button>
      </div>

      {/* Floating Counter Card */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => setFilterStatus(filterStatus === 'PRESENT' ? 'ALL' : 'PRESENT')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'PRESENT'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Present</span>
            <span className="text-xl font-black text-emerald-800">{attendanceStats.present}</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === 'ABSENT' ? 'ALL' : 'ABSENT')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'ABSENT'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Absent</span>
            <span className="text-xl font-black text-rose-800">{attendanceStats.absent}</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === 'LATE' ? 'ALL' : 'LATE')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'LATE'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Late</span>
            <span className="text-xl font-black text-amber-800">{attendanceStats.late}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student by name or roll number..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
        />
      </div>

      {/* Student List with 1-Tap Pills matching Stitch Screen SCREEN_12 */}
      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const isPresent = student.status === 'PRESENT';
          const isAbsent = student.status === 'ABSENT';
          const isLate = student.status === 'LATE';

          return (
            <div
              key={student.id}
              className={`p-3 rounded-2xl bg-white border transition-all flex items-center justify-between ${
                isAbsent
                  ? 'border-rose-200 bg-rose-50/20'
                  : isLate
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Student Identity */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isPresent
                      ? 'bg-blue-50 text-blue-700'
                      : isAbsent
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {student.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">{student.name}</span>
                    {student.isFeatured && (
                      <span className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 px-1 rounded">
                        Class Rep
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                    <span className="font-mono font-semibold">{student.roll}</span>
                    <span>•</span>
                    <span className="font-medium">{student.busId}</span>
                  </div>
                </div>
              </div>

              {/* 1-Tap Status Pills (Present / Absent / Late) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'PRESENT')}
                  className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                    isPresent
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  P
                </button>

                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'ABSENT')}
                  className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                    isAbsent
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  A
                </button>

                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'LATE')}
                  className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                    isLate
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  L
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Submit Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="text-[11px] text-slate-600 leading-tight">
            <span className="font-bold block text-slate-900">{attendanceStats.present} Present</span>
            <span>3 unexcused absences</span>
          </div>

          <button
            onClick={submitAttendance}
            className="flex-1 py-3 rounded-2xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md hover:bg-blue-800 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Roll-Call to Cloud</span>
          </button>
        </div>
      </div>
    </div>
  );
}
