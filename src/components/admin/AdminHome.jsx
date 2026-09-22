import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
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
  MapPin,
  GraduationCap,
  Plus
} from 'lucide-react';

export default function AdminHome({ onNavigate }) {
  const { 
    currentUser, 
    attendanceStats, 
    notices, 
    buses, 
    facultyChats, 
    teachersList,
    schoolConfig,
    isTripActive,
    busCoords,
    isFirebaseConnected
  } = useSchool();
  const { t } = useTranslation();

  const activeBusesCount = Object.keys(busCoords).length || buses.filter(b => b.status === 'ON_ROUTE').length;
  const currentCount = schoolConfig.currentUserCount || teachersList.length + 1;
  const maxCapacity = schoolConfig.maxUsers || 500;
  const capacityPercent = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[#FAF8FF] pb-24">
      <div className="space-y-4">
        {/* Context & Greeting */}
        <div className="pt-1 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10.5px] font-bold tracking-wider uppercase">{t('app.tagline')}</span>
            </div>

            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              isFirebaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isFirebaseConnected ? <Cloud className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isFirebaseConnected ? t('app.cloudConnected') : 'Local'}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <span>{t('admin.workspaceTitle')}</span>
              <span className="inline-block animate-bounce text-[22px]">👋</span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Institutional Administration & Capacity Hub
            </p>
          </div>
        </div>

        {/* Highlighted Faculty Management Card */}
        <div className="bg-gradient-to-tr from-[#1E3A8A] via-indigo-900 to-blue-800 rounded-3xl p-4 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Faculty Management</h2>
                <p className="text-[11px] text-blue-200">
                  {teachersList.length} Registered Teachers • {capacityPercent}% Capacity
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('teachers')}
              className="px-3 py-1.5 rounded-xl bg-white text-blue-900 text-xs font-bold shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Capacity Indicator */}
          <div className="pt-1 space-y-1">
            <div className="flex justify-between text-[10.5px] text-blue-200 font-medium">
              <span>School Users: {currentCount} / {maxCapacity}</span>
              <span>{maxCapacity - currentCount} seats left</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${capacityPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 2x2 Primary Module Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* 1. Attendance Card */}
          <button
            onClick={() => onNavigate('attendance')}
            className="group relative flex flex-col justify-between p-4 h-[170px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>
            
            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[9.5px] font-bold text-blue-700">
                  {attendanceStats.rate}%
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[14px] text-slate-900 group-hover:text-blue-700 transition-colors">
                {t('nav.attendance')}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                {attendanceStats.present} {t('teacher.present')} / {attendanceStats.total}
              </span>
            </div>
          </button>

          {/* 2. Notices Card */}
          <button
            onClick={() => onNavigate('notices')}
            className="group relative flex flex-col justify-between p-4 h-[170px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9.5px] font-bold text-emerald-700">
                  {notices.length}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[14px] text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t('nav.notices')}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                {t('admin.broadcastNotice')}
              </span>
            </div>
          </button>

          {/* 3. Teacher Chat Card */}
          <button
            onClick={() => onNavigate('chat')}
            className="group relative flex flex-col justify-between p-4 h-[170px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-purple-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[9.5px] font-bold text-purple-700">
                  {t('common.active')}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[14px] text-slate-900 group-hover:text-purple-700 transition-colors">
                {t('teacher.facultyChat')}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                Staff Communication
              </span>
            </div>
          </button>

          {/* 4. Bus Tracking Card */}
          <button
            onClick={() => onNavigate('fleet')}
            className="group relative flex flex-col justify-between p-4 h-[170px] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-amber-300 active:scale-[0.98] transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-100/50 group-hover:scale-125 transition-transform duration-500 pointer-events-none blur-lg"></div>

            <div className="flex items-start justify-between w-full relative z-10">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Bus className="w-5 h-5" />
                </div>
                <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md border text-[9.5px] font-bold flex items-center gap-1 ${
                  activeBusesCount > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeBusesCount > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                  <span>{activeBusesCount > 0 ? `${activeBusesCount} Live` : t('common.standby')}</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 relative z-10 mt-auto">
              <span className="font-bold text-[14px] text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('teacher.busTracking')}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                {t('admin.fleetMonitor')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Grounding Footer */}
      <div className="pt-4 flex flex-col items-center gap-1 text-center">
        <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
          RAVS Smart School • Institutional Administration
        </span>
      </div>
    </div>
  );
}
