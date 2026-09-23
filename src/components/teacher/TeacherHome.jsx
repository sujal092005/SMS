import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import { 
  CheckSquare, 
  BookOpen, 
  Bell, 
  MessageSquare, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Sparkles,
  QrCode,
  MapPin,
  UploadCloud,
  Bus,
  UserPlus
} from 'lucide-react';

export default function TeacherHome({ onNavigate }) {
  const { 
    currentUser,
    selectedClassId,
    todayTeacherCheckIn, 
    classNotes, 
    notices,
    studentsList 
  } = useSchool();
  const { t } = useTranslation();

  const assignedClass = currentUser?.classId || selectedClassId || '10A';
  const classStudents = studentsList.filter(s => !s.classId || s.classId === assignedClass || studentsList.length <= 50);

  const safeCheckIn = todayTeacherCheckIn || { checkedIn: false, time: '--:--', gate: 'N/A' };

  const periods = [
    { period: '1st Period', time: '08:00 - 08:45 AM', subject: `Grade ${assignedClass} Mathematics`, room: 'Room 204', status: 'In Progress' },
    { period: '2nd Period', time: '08:50 - 09:35 AM', subject: `Grade ${assignedClass} Science Lab`, room: 'Room 206', status: 'Upcoming' },
    { period: '4th Period', time: '10:30 - 11:15 AM', subject: 'Classroom Connect & Doubts', room: 'Room 204', status: 'Upcoming' }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Teacher Identity & Morning Header */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Class {assignedClass} Incharge</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
            {currentUser?.loginId || 'TCH-FACULTY'}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{currentUser?.name || 'Faculty Member'}</span>
            <span className="text-xl">👩‍🏫</span>
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser?.department || 'Academic'} • Class {assignedClass}
          </p>
        </div>
      </div>

      {/* Class Roster & Admissions Highlight Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-900 to-blue-800 text-white shadow-xl shadow-blue-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              Class {assignedClass} Roster
            </span>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>{classStudents.length} Students Enrolled</span>
            </h3>
            <p className="text-[10.5px] text-blue-100 mt-0.5">
              Single & bulk CSV enrollment with auto-parent login
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('roster')}
          className="px-3.5 py-2 rounded-xl bg-white text-blue-900 font-extrabold text-xs shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Student Attendance Tracker Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs text-white">
            <CheckSquare className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              Student Attendance Tracker
            </span>
            <h3 className="text-sm font-extrabold text-white">
              Mark Roll-Call (Present / Absent)
            </h3>
            <p className="text-[10.5px] text-emerald-100 mt-0.5">
              Updates Admin Dashboard & notifies parents in real-time
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('rollcall')}
          className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>Mark Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Campus Gate Clock-In Status Alert Card */}
      <div className="p-3.5 rounded-3xl bg-slate-900 text-white shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('teacher.gateCheckIn')}
            </span>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>{safeCheckIn.checkedIn ? t('common.verified') : t('common.standby')}</span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-400/30">
                {safeCheckIn.time}
              </span>
            </h3>
            <p className="text-[10.5px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[140px]">{safeCheckIn.gate}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('attendance')}
          className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs active:scale-95 transition-all"
        >
          {t('common.view')}
        </button>
      </div>

      {/* Primary Action Modules Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Class Notes & Study Hub */}
        <button
          onClick={() => onNavigate('hub')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
              {t('teacher.uploadNotes')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Class {assignedClass} Notes & Chat
            </span>
          </div>
        </button>

        {/* Faculty Common Chat */}
        <button
          onClick={() => onNavigate('chat')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700 transition-colors">
              {t('teacher.facultyChat')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('teacher.chatSubtitle')}
            </span>
          </div>
        </button>

        {/* School Circulars */}
        <button
          onClick={() => onNavigate('notices')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
              {t('nav.notices')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {notices.length} {t('common.all')}
            </span>
          </div>
        </button>

        {/* Bus Live Tracker */}
        <button
          onClick={() => onNavigate('bus')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
            <Bus className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
              {t('teacher.busTracking')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('teacher.busSubtitle')}
            </span>
          </div>
        </button>
      </div>

      {/* Daily Instruction Schedule */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('student.timetable')}</h2>
          </div>
          <span className="text-[10.5px] font-bold text-indigo-700">3 Sessions</span>
        </div>

        <div className="space-y-2">
          {periods.map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{item.subject}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.room}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'In Progress'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
