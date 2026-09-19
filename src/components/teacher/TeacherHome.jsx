import React from 'react';
import { useSchool } from '../../context/SchoolContext';
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
  Sparkles
} from 'lucide-react';

export default function TeacherHome({ onNavigate }) {
  const { currentUser, attendanceStats, attendanceSubmittedTime, notices } = useSchool();

  const periods = [
    { period: '1st Period', time: '08:00 - 08:45 AM', subject: 'Grade 8-A Mathematics', room: 'Room 204', status: 'In Progress' },
    { period: '2nd Period', time: '08:50 - 09:35 AM', subject: 'Grade 8-B Algebra Practice', room: 'Room 206', status: 'Upcoming' },
    { period: '4th Period', time: '10:30 - 11:15 AM', subject: 'Math Geometry Lab', room: 'STEM Lab 1', status: 'Upcoming' }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Teacher Identity & Morning Header */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Class 8-A Incharge</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Term 1 • Academic Year 2026
          </span>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Good Morning, {currentUser?.name || 'Teacher'}</span>
            <span className="text-xl">👩‍🏫</span>
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser?.department} Department • {currentUser?.assignedClass}
          </p>
        </div>
      </div>

      {/* Primary Action Modules Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* QR Attendance Action */}
        <button
          onClick={() => onNavigate('attendance')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700 transition-colors">
              QR & Roll-Call
            </span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{attendanceStats.present} Present Today</span>
            </span>
          </div>
        </button>

        {/* Faculty Chat Channel */}
        <button
          onClick={() => onNavigate('chat')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700 transition-colors">
              Faculty Common
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Teacher-to-Teacher Chat
            </span>
          </div>
        </button>

        {/* Class Study Hub (Upload Notes & Notices) */}
        <button
          onClick={() => onNavigate('hub')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
              Class Study Hub
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Notes, Notices & Doubts
            </span>
          </div>
        </button>

        {/* Circulars */}
        <button
          onClick={() => onNavigate('notices')}
          className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div className="mt-auto">
            <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
              School Circulars
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {notices.length} Active Notices
            </span>
          </div>
        </button>
      </div>


      {/* Daily Instruction Schedule */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Today's Class Schedule</h2>
          </div>
          <span className="text-[10.5px] font-bold text-blue-700">3 Sessions</span>
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
