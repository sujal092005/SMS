import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Sparkles, 
  CheckCircle2, 
  Bus, 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Award,
  FileText
} from 'lucide-react';

export default function StudentHome({ onNavigate }) {
  const { currentUser, notices, isTripActive, currentEta } = useSchool();

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Student Profile Card */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attendance: Present Today</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Roll #14 • Class 8-A
          </span>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hi, {currentUser?.name || 'Aarav'}</span>
            <span className="text-xl">🎒</span>
          </h1>
          <p className="text-xs text-slate-500">
            CBSE Secondary Curriculum • Academic Year 2024-25
          </p>
        </div>
      </div>

      {/* Featured AI Doubt Assistant Banner matching Stitch Screen SCREEN_16 */}
      <div className="relative p-4 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-900 to-blue-800 text-white shadow-lg overflow-hidden space-y-3">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-blue-200 uppercase tracking-wider block">Pedagogical AI</span>
              <h2 className="text-base font-extrabold tracking-tight">Ask Doubt with AI</h2>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
            CBSE 8-10 Aligned
          </span>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed relative z-10">
          Got stuck in a physics equation or biology diagram? Instant step-by-step NCERT explanations anytime.
        </p>

        <button
          onClick={() => onNavigate('ai_doubt')}
          className="w-full py-2.5 rounded-2xl bg-white text-[#1E3A8A] font-bold text-xs shadow-md hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-2 relative z-10"
        >
          <span>Ask a Question Now</span>
          <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
        </button>
      </div>

      {/* Assigned Bus Status Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assigned School Bus</span>
          </div>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            BUS-01
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-bold text-slate-900">Stop: Maple Heights (08:15 AM)</p>
            <p className="text-[11px] text-slate-500">Route #4 (South Corridor)</p>
          </div>

          <button
            onClick={() => onNavigate('bus')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
          >
            <span>Live GPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Today's Homework & Notes Handouts */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Class Notes & Handouts</h3>
          </div>
          <button
            onClick={() => onNavigate('notes')}
            className="text-[11px] font-bold text-blue-700 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          <div
            onClick={() => onNavigate('notes')}
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Quadratic Equations Proof Handout</p>
                <p className="text-[10px] text-slate-500">Mathematics • Priya Sharma</p>
              </div>
            </div>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => onNavigate('notes')}
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Photosynthesis vs Respiration Chart</p>
                <p className="text-[10px] text-slate-500">Science • Kavita Chawla</p>
              </div>
            </div>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
