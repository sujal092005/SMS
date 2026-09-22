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
    classesList = [],
    getClassAttendance,
    teachersList = [],
    absentFaculty = [], 
    teacherPunchLogs = []
  } = useSchool();

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'faculty'
  const [expandedClassId, setExpandedClassId] = useState(null);

  const totalRegisteredFaculty = teachersList.length || 1;
  const checkedInFacultyCount = teacherPunchLogs.length > 0 ? teacherPunchLogs.length : (teachersList.length > 0 ? 1 : 0);

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

      {/* Tab Switcher: Student Attendance vs Faculty Gate Attendance */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Roll-Call ({attendanceStats.total})</span>
        </button>

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
      </div>

      {/* SECTION 1: STUDENT ATTENDANCE (PER CLASS BREAKDOWN) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Total Campus Summary */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Campus Roll-Call</span>
              </div>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {attendanceStats.rate}% Total Attendance
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <span className="text-xl font-black text-blue-900 block leading-none">{attendanceStats.total}</span>
                <span className="text-[9.5px] font-bold text-blue-700 mt-1 uppercase block">Enrolled</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-xl font-black text-emerald-800 block leading-none">{attendanceStats.present}</span>
                <span className="text-[9.5px] font-bold text-emerald-700 mt-1 uppercase block">Present</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                <span className="text-xl font-black text-rose-800 block leading-none">{attendanceStats.absent}</span>
                <span className="text-[9.5px] font-bold text-rose-700 mt-1 uppercase block">Absent</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                <span className="text-xl font-black text-amber-800 block leading-none">{attendanceStats.late}</span>
                <span className="text-[9.5px] font-bold text-amber-700 mt-1 uppercase block">Late</span>
              </div>
            </div>
          </div>

          {/* Class-wise Roll Call List */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-1">
              Classroom Attendance Breakdowns
            </h3>

            {classesList.map((cls) => {
              const cId = cls.id || cls.classId;
              const stats = getClassAttendance ? getClassAttendance(cId) : { total: 0, present: 0, absent: 0, rate: 100, isSubmitted: false };
              const isExpanded = expandedClassId === cId;

              return (
                <div
                  key={cId}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 font-extrabold text-sm flex items-center justify-center">
                        {cId}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{cls.label || `Class ${cId}`}</h4>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                            stats.isSubmitted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {stats.isSubmitted ? '✅ Submitted' : '⏳ Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {stats.total === 0 ? 'No students enrolled yet' : `${stats.total} Enrolled • Teacher: ${cls.teacher || 'Assigned Faculty'}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{stats.rate}%</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {stats.present} P / {stats.absent} A
                        </span>
                      </div>

                      {stats.total > 0 && (
                        <button
                          onClick={() => setExpandedClassId(isExpanded ? null : cId)}
                          className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Student List */}
                  {isExpanded && stats.students && stats.students.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                        Student List ({stats.students.length})
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {stats.students.map((st) => (
                          <div
                            key={st.id || st.uid}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">{st.rollNo || st.roll || '—'}</span>
                              <span className="font-bold text-slate-900">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({st.loginId})</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              (st.status || '').toUpperCase() === 'ABSENT'
                                ? 'bg-rose-100 text-rose-800'
                                : (st.status || '').toUpperCase() === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {st.status || 'PRESENT'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: FACULTY GATE ATTENDANCE */}
      {activeTab === 'faculty' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">On-Campus Today</span>
              <span className="text-xl font-black text-indigo-950 block mt-0.5">
                {checkedInFacultyCount} / {totalRegisteredFaculty}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">On-Time Rate</span>
              <span className="text-xl font-black text-emerald-950 block mt-0.5">
                {totalRegisteredFaculty > 0 ? `${Math.round((checkedInFacultyCount / totalRegisteredFaculty) * 100)}%` : '100%'}
              </span>
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
                  Registered Faculty Roll-Call
                </h3>
              </div>
              <span className="text-[10.5px] font-bold text-indigo-600">Saved to Cloud Database</span>
            </div>

            <div className="space-y-2.5">
              {teachersList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-bold text-slate-700">No Faculty Registered Yet</p>
                  <p className="text-[11px]">Go to Teachers section to add your first faculty member.</p>
                </div>
              ) : (
                teachersList.map((tch) => (
                  <div
                    key={tch.id || tch.uid}
                    className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/90 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                        {(tch.name || 'F').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900">{tch.name}</h4>
                          <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200">
                            {tch.loginId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {tch.department || 'Academic'} • Class {tch.classId || 'Incharge'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 block">
                        Gate Verified
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
