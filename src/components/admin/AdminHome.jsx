import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  CheckSquare, 
  Bell, 
  MessageSquare, 
  Bus, 
  ArrowRight, 
  Cloud, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Sparkles,
  MapPin
} from 'lucide-react';

export default function AdminHome({ onNavigate }) {
  const { 
    currentUser, 
    attendanceStats, 
    notices, 
    buses, 
    facultyChats, 
    isTripActive 
  } = useSchool();

  const activeBusesCount = buses.filter(b => b.status === 'ON_ROUTE').length;

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[#FAF8FF] pb-24">
      <div className="space-y-5">
        {/* Context & Greeting */}
        <div className="pt-1 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10.5px] font-bold tracking-wider uppercase">Term 1 • 2024–25</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Cloud Sync</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <span>Good Morning, Admin</span>
              <span className="inline-block animate-bounce text-[22px]">👋</span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Welcome back to RAVS institutional hub. What would you like to manage?
            </p>
          </div>
        </div>

        {/* 2x2 Primary Module Grid matching Stitch Screen SCREEN_43 */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* 1. Attendance Card */}
          <button
            onClick={() => onNavigate('attendance')}
            className="group relative flex flex-col justify-between p-4 h-[184px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>
            
            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[9.5px] font-bold text-blue-700">
                  {attendanceStats.rate}%
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[15px] text-slate-900 group-hover:text-blue-700 transition-colors">
                Attendance
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                {attendanceStats.present} present of {attendanceStats.total} students today
              </span>
            </div>
          </button>

          {/* 2. Notices Card */}
          <button
            onClick={() => onNavigate('notices')}
            className="group relative flex flex-col justify-between p-4 h-[184px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9.5px] font-bold text-emerald-700">
                  {notices.length} New
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[15px] text-slate-900 group-hover:text-emerald-700 transition-colors">
                Notices
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                Broadcast official circulars & campus news
              </span>
            </div>
          </button>

          {/* 3. Teacher Chat Card */}
          <button
            onClick={() => onNavigate('chat')}
            className="group relative flex flex-col justify-between p-4 h-[184px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-purple-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[9.5px] font-bold text-purple-700">
                  Active
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[15px] text-slate-900 group-hover:text-purple-700 transition-colors">
                Teacher Chat
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                Direct Admin ↔ Faculty messaging channel
              </span>
            </div>
          </button>

          {/* 4. Bus Tracking Card */}
          <button
            onClick={() => onNavigate('fleet')}
            className="group relative flex flex-col justify-between p-4 h-[184px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-amber-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Bus className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[9.5px] font-bold text-amber-800 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTripActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                  <span>{activeBusesCount + (isTripActive ? 1 : 0)} Live</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[15px] text-slate-900 group-hover:text-amber-700 transition-colors">
                Bus Tracking
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                Fleet GPS coordinates & route telemetrics
              </span>
            </div>
          </button>
        </div>

        {/* Live Operational Status Strip */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Campus Operational Pulse</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] font-semibold text-slate-500 block">Class 8-A Headcount</span>
              <span className="text-sm font-extrabold text-blue-700">{attendanceStats.present} / {attendanceStats.total}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] font-semibold text-slate-500 block">Staff on Leave</span>
              <span className="text-sm font-extrabold text-amber-700">3 Faculty</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] font-semibold text-slate-500 block">Connected Buses</span>
              <span className="text-sm font-extrabold text-emerald-700">{buses.length} Vehicles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding Footer matching Stitch Screen */}
      <div className="pt-6 flex flex-col items-center gap-1.5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-700">RAVS Smart School Cloud</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-[10.5px] font-medium text-slate-500">Encrypted & Synchronized</span>
        </div>
        <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
          v2.4.0 • Enterprise Edition
        </span>
      </div>
    </div>
  );
}
