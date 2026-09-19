import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Calendar,
  Share2
} from 'lucide-react';

export default function ClassChatbox({ onBack }) {
  const { classNotes, addToast } = useSchool();

  const handleDownload = (noteTitle) => {
    addToast(`Handout downloaded: ${noteTitle}`, 'success');
  };

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Class 8-A Notes & Handouts</h1>
            <p className="text-[11px] text-slate-500">Official Syllabus Reference Materials</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {classNotes.length} Documents
        </span>
      </div>

      {/* Handouts List matching Stitch Screen SCREEN_22 */}
      <div className="space-y-3">
        {classNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {note.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mt-1">
                    {note.title}
                  </h3>
                </div>
              </div>

              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {note.fileType}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {note.summary}
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="text-[10.5px] text-slate-500">
                <span className="font-semibold text-slate-700">{note.teacher}</span>
                <span> • {note.time}</span>
              </div>

              <button
                onClick={() => handleDownload(note.title)}
                className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Handout</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
