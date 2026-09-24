import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  CheckCircle2, 
  Bus, 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  FileText,
  MessageSquare,
  Bell,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const { 
    currentUser, 
    notices = [], 
    isTripActive = false, 
    currentSpeed = 0,
    students8A = [],
    classNotes = []
  } = useSchool();
  const { t } = useTranslation();

  const studentClassId = currentUser?.classId || '8A';
  const studentClassName = currentUser?.assignedClass || `Class ${studentClassId}`;
  const studentRollNo = currentUser?.rollNo || currentUser?.roll || '001';

  // Strict notes count for this class
  const classNotesCount = (classNotes || []).filter(
    (n) => n.targetClassId === studentClassId || n.targetClassId === 'ALL'
  ).length;

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Student Profile & Status Header */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{studentClassName} • Roll #{studentRollNo}</span>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('teacher.present')} {t('common.today')}</span>
          </span>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-[#00236F] tracking-tight flex items-center gap-2">
            <span>{currentUser?.name || 'Aarav'}</span>
            <span className="text-xl">🎒</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('app.title')} • {t('student.semiEnglishNote')}
          </p>
        </div>
      </div>

      {/* Featured AI Doubt Assistant Banner */}
      <div className="relative p-4 rounded-3xl bg-gradient-to-tr from-[#00236F] via-blue-900 to-indigo-800 text-white shadow-lg overflow-hidden space-y-3">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-blue-200 uppercase tracking-wider block">Gemini AI Assistant</span>
              <h2 className="text-base font-extrabold tracking-tight">{t('student.askAIDoubts')}</h2>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
            Semi-English 24/7
          </span>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed relative z-10">
          {t('student.aiSubtitle')} — Science & Maths in English with Marathi/Hindi guidance!
        </p>

        <button
          onClick={() => onNavigate('ai_doubt')}
          className="w-full py-2.5 rounded-2xl bg-white text-[#00236F] font-bold text-xs shadow-md hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-2 relative z-10"
        >
          <span>{t('student.askAIDoubts')}</span>
          <ArrowRight className="w-4 h-4 text-[#00236F]" />
        </button>
      </div>

      {/* 2x2 Primary Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Classroom Connect (Class Teacher & Notes) */}
        <button
          onClick={() => onNavigate('notes')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-34 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700 transition-colors">
              {t('student.studyNotes')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {classNotesCount} {t('nav.study')}
            </span>
          </div>
        </button>

        {/* AI Doubts Assistant */}
        <button
          onClick={() => onNavigate('ai_doubt')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-34 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700 transition-colors">
              {t('student.askAIDoubts')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('nav.doubts')}
            </span>
          </div>
        </button>

        {/* School Circulars */}
        <button
          onClick={() => onNavigate('notices')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-34 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
              {t('nav.notices')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {notices.length} {t('common.all')}
            </span>
          </div>
        </button>

        {/* Live Bus Tracker */}
        <button
          onClick={() => onNavigate('bus')}
          className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all text-left flex flex-col justify-between h-34 relative overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
              {t('student.liveBusTrack')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isTripActive ? (currentSpeed > 0 ? `${currentSpeed} km/h` : t('common.active')) : t('common.standby')}
            </span>
          </div>
        </button>
      </div>

      {/* Class Incharge Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
            👩‍🏫
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class 8-A Incharge</span>
            <h3 className="text-xs font-bold text-slate-900">Mrs. Priya Sharma</h3>
            <p className="text-[11px] text-slate-500">Mathematics & Science</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('notes')}
          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all flex items-center gap-1"
        >
          <span>{t('student.askTeacher')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
