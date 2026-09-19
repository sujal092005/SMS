import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import { 
  Bus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  User, 
  Phone, 
  Bell, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ParentDashboard({ onNavigate }) {
  const { currentUser, isTripActive, currentSpeed, currentEta, busCoords, notices } = useSchool();
  const { t } = useTranslation();

  const activeBusCount = Object.keys(busCoords).length;

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Parent Greeting */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {t('parent.consoleTitle')}
          </span>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {t('auth.student')}: {t('parent.childName')} ({t('parent.childClass')})
          </span>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Namaste, {currentUser?.name?.split(' ')[0] || 'Parent'}</span>
            <span className="text-xl">🙏</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('parent.busTracking')} & {t('teacher.todayStatus')}
          </p>
        </div>
      </div>

      {/* Child Status Summary Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('teacher.todayStatus')}</span>
          </div>
          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {t('teacher.present')}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
            alt="Aarav Sharma"
            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">{t('parent.childName')}</h3>
            <p className="text-xs text-slate-500">Roll #14 • {t('parent.childClass')}</p>
            <p className="text-[10.5px] text-emerald-700 font-semibold mt-0.5">
              Attendance verified • 08:20 AM
            </p>
          </div>
        </div>
      </div>

      {/* Live Transit Tracking Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] to-blue-800 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">{t('parent.busStatus')}</span>
              <h3 className="text-base font-extrabold tracking-tight">Bus 1 & Bus 2</h3>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
              activeBusCount > 0 || isTripActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse'
                : 'bg-white/10 text-blue-200 border-white/20'
            }`}
          >
            {activeBusCount > 0 || isTripActive ? t('driver.journeyLive') : t('common.standby')}
          </span>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed">
          {activeBusCount > 0 || isTripActive
            ? `${t('parent.speed')}: ${currentSpeed} km/h • Live GPS telemetry streaming`
            : 'Both buses on standby at campus. Live location will stream once the driver starts the journey.'}
        </p>

        <button
          onClick={() => onNavigate('bus')}
          className="w-full py-2.5 rounded-2xl bg-white text-[#1E3A8A] font-bold text-xs shadow-md hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <span>{t('parent.viewBusLocation')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Parent Circulars */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('nav.notices')}</h3>
          </div>
          <button onClick={() => onNavigate('notices')} className="text-[11px] font-bold text-blue-700 hover:underline">
            {t('common.all')}
          </button>
        </div>

        <div className="space-y-2">
          {notices.slice(0, 2).map((notice) => (
            <div key={notice.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{notice.title}</span>
                <span className="text-[10px] text-slate-400">{notice.date}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">{notice.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
