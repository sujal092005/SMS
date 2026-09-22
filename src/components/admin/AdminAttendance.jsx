import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Building2, 
  UserX,
  ArrowLeft,
  CalendarCheck,
  QrCode,
  MapPin,
  ShieldCheck,
  Sparkles,
  Filter
} from 'lucide-react';

export default function AdminAttendance({ onBack }) {
  const { 
    attendanceStats = { present: 0, absent: 0, late: 0, total: 0, rate: 100 }, 
    absentFaculty = [], 
    attendanceSubmittedTime = null, 
    students8A = [],
    teacherPunchLogs = [],
    todayTeacherCheckIn = { checkedIn: true, time: '07:45 AM', gate: 'Main Campus Gate A' }
  } = useSchool();

  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' | 'students'

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Header */}
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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Attendance</h1>
            <p className="text-[11px] text-slate-500">Live Campus Roll-Call & Faculty Clock-In Audit</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cloud Live</span>
        </div>
      </div>

      {/* Tab Switcher: Faculty Gate Attendance vs Student Attendance */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'faculty'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Faculty Gate Clock-In</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Roll-Call</span>
        </button>
      </div>

      {/* SECTION 1: FACULTY GATE ATTENDANCE (SAVED TO BACKEND & VISIBLE TO ADMIN) */}
      {activeTab === 'faculty' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">On-Campus Today</span>
              <span className="text-xl font-black text-indigo-950 block mt-0.5">
                {teacherPunchLogs.length > 0 ? '18 / 21' : '18 Faculty'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">On-Time Rate</span>
              <span className="text-xl font-black text-emerald-950 block mt-0.5">97.2%</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase">On Leave</span>
              <span className="text-xl font-black text-rose-950 block mt-0.5">{absentFaculty.length}</span>
            </div>
          </div>

          {/* Real-time Faculty Gate Check-in Feed */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Faculty Punch-In Records
                </h3>
              </div>
              <span className="text-[10.5px] font-bold text-indigo-600">Saved to Cloud Database</span>
            </div>

            <div className="space-y-2.5">
              {/* Active Teacher Check-In Record */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    PS
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-slate-900">Mrs. Priya Sharma</h4>
                      <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200">
                        EMP-T482
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Senior Mathematics • Class 8-A Incharge
                    </p>
                    <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{todayTeacherCheckIn.gate}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 block">
                    {todayTeacherCheckIn.time}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Today</span>
                </div>
              </div>

              {/* Other Faculty Members in Log */}
              {teacherPunchLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {log.teacherName || 'Faculty Member'}
                      </span>
                      <span className="text-[9.5px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {log.teacherId || 'EMP-FAC'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      📍 {log.gate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {log.checkInTime}
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Absent Faculty Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Faculty On Approved Leave ({absentFaculty.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {absentFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900">{faculty.name}</span>
                    <p className="text-[10.5px] text-slate-500">{faculty.department}</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {faculty.leaveType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STUDENT ATTENDANCE */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Class 8-A Roll-Call</span>
              </div>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {attendanceStats.rate}% Attendance
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-2xl font-black text-emerald-800 leading-none">{attendanceStats.present}</span>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 uppercase tracking-wider">Students Present</span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col items-center justify-center text-center">
                <XCircle className="w-5 h-5 text-rose-600 mb-1" />
                <span className="text-2xl font-black text-rose-800 leading-none">{attendanceStats.absent}</span>
                <span className="text-[10px] font-bold text-rose-700 mt-1 uppercase tracking-wider">Absent</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col items-center justify-center text-center">
                <Clock className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-2xl font-black text-amber-800 leading-none">{attendanceStats.late}</span>
                <span className="text-[10px] font-bold text-amber-700 mt-1 uppercase tracking-wider">Late</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
