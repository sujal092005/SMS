import React from 'react';
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
  CalendarCheck
} from 'lucide-react';

export default function AdminAttendance({ onBack }) {
  const { 
    attendanceStats, 
    absentFaculty, 
    attendanceSubmittedTime, 
    students8A 
  } = useSchool();

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
            <p className="text-[11px] text-slate-500">Live Campus Roll-Call Audit</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Synced {attendanceSubmittedTime}</span>
        </div>
      </div>

      {/* Primary Metrics: Clean Numeric Student Count */}
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
            <span className="text-[10px] font-bold text-amber-700 mt-1 uppercase tracking-wider">Late Marked</span>
          </div>
        </div>
      </div>

      {/* Absent Faculty List (PRD Requirement: Non-judgmental list of absent teachers) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <UserX className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Faculty Leave Audit</h2>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            {absentFaculty.length} Instructors
          </span>
        </div>

        <div className="space-y-2">
          {absentFaculty.map((faculty) => (
            <div
              key={faculty.id}
              className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {faculty.name.split(' ')[1]?.[0] || 'T'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{faculty.name}</p>
                  <p className="text-[10px] text-slate-500">{faculty.department}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {faculty.leaveType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Absent Students Quick Inspection */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Absent Students (Class 8-A)</span>
          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
            Parents Notified
          </span>
        </div>

        <div className="space-y-1.5">
          {students8A
            .filter((s) => s.status === 'ABSENT')
            .map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-rose-50/40 border border-rose-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{s.roll}</span>
                  <span className="font-bold text-slate-900">{s.name}</span>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  Unexcused
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
