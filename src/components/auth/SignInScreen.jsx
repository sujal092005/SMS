import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  School,
  GraduationCap,
  Bus,
  Users,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';

export default function SignInScreen() {
  const { loginAsRole } = useSchool();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [userId, setUserId] = useState('ADMIN-0924');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const roles = [
    {
      id: 'admin',
      title: t('auth.admin'),
      desc: t('auth.adminDesc'),
      icon: School,
      color: 'from-blue-700 to-indigo-800',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      sampleId: 'ADMIN-0924'
    },
    {
      id: 'teacher',
      title: t('auth.teacher'),
      desc: t('auth.teacherDesc'),
      icon: GraduationCap,
      color: 'from-blue-600 to-blue-800',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      sampleId: 'TCH-PRIYA8A'
    },
    {
      id: 'student',
      title: t('auth.student'),
      desc: t('auth.studentDesc'),
      icon: Sparkles,
      color: 'from-emerald-600 to-teal-700',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      sampleId: 'STD-AARAV14'
    },
    {
      id: 'parent',
      title: t('auth.parent'),
      desc: t('auth.parentDesc'),
      icon: Users,
      color: 'from-purple-600 to-indigo-700',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      sampleId: 'PAR-SUNITA'
    },
    {
      id: 'driver',
      title: t('auth.driver'),
      desc: t('auth.driverDesc'),
      icon: Bus,
      color: 'from-amber-600 to-orange-700',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      sampleId: 'DRV-RAJESH4'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setUserId(role.sampleId);
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    loginAsRole(selectedRole);
  };

  const currentRoleObj = roles.find((r) => r.id === selectedRole) || roles[0];
  const CurrentIcon = currentRoleObj.icon;

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[#FAF8FF] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none"></div>

      <div className="space-y-5 pt-1 relative z-10">
        {/* Top Header bar with Language Switcher */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            {t('app.tagline')}
          </span>
          <LanguageSwitcher />
        </div>

        {/* Emblem & School Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-700 to-blue-600 p-0.5 shadow-xl shadow-indigo-950/20 mb-2.5 animate-float">
            <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" className="w-11 h-11">
                <rect width="80" height="80" rx="20" fill="#1E3A8A" />
                <path d="M40 18L18 29L40 40L62 29L40 18Z" fill="#60A5FA" />
                <path d="M26 36.5V47.5C26 53.5 32 58 40 58C48 58 54 53.5 54 47.5V36.5L40 44.5L26 36.5Z" fill="#FFFFFF" />
                <circle cx="58" cy="38" r="3.5" fill="#93C5FD" />
                <path d="M58 41.5V50" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('app.title')}</h1>
          <p className="text-xs text-slate-500 max-w-[280px] mt-0.5">
            {t('auth.subWelcome')}
          </p>
        </div>

        {/* 1-Tap Fast Persona Switches */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('auth.selectRole')}</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">1-Tap Demo</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all active:scale-95 ${
                    isSelected
                      ? `${role.bgColor} ${role.borderColor} ring-2 ring-blue-600 shadow-md`
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${
                      isSelected ? `bg-gradient-to-tr ${role.color} text-white` : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10.5px] font-bold leading-tight truncate max-w-[55px] ${isSelected ? role.textColor : 'text-slate-700'}`}>
                    {role.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Card Info */}
        <div className={`p-3.5 rounded-2xl border ${currentRoleObj.bgColor} ${currentRoleObj.borderColor} flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentRoleObj.color} text-white flex items-center justify-center shadow-sm flex-shrink-0`}>
            <CurrentIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{currentRoleObj.title}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-600 truncate">{currentRoleObj.desc}</p>
          </div>
          <button
            onClick={() => loginAsRole(selectedRole)}
            className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold shadow-sm hover:bg-blue-800 active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
          >
            <span>{t('auth.login')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Traditional Form Login Option */}
        <form onSubmit={handleManualLogin} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              {t('auth.enterId')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder={t('auth.enterId')}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {t('auth.enterPassword')}
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] text-blue-700 font-semibold hover:underline"
              >
                Help?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder={t('auth.enterPassword')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-900/20 hover:from-blue-900 hover:to-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('auth.signIn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Grounding Security Footer */}
      <div className="pt-4 pb-1 flex flex-col items-center gap-1 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Campus Gateway</span>
        </div>
        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
          {t('app.title')} • {t('app.tagline')}
        </span>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Campus Help Desk</h2>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Institutional credentials are provisioned by the RAVS IT Administrator. For password resets or student bus reassignments, contact:
            </p>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">IT Administrative Office</p>
              <p className="text-slate-600">Email: helpdesk@ravsschool.edu</p>
              <p className="text-slate-600">Phone: +91 11 2789 0044</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
