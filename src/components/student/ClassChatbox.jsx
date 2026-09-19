import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Send, 
  MessageSquare, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Layers,
  HelpCircle,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';

export default function ClassChatbox({ onBack }) {
  const { 
    currentUser, 
    classNotes, 
    classChats, 
    sendClassTeacherMessage, 
    addToast 
  } = useSchool();

  const [activeTab, setActiveTab] = useState('handouts'); // 'handouts' | 'doubts'
  const [doubtText, setDoubtText] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState(null);

  const studentClassId = currentUser?.classId || '8A';
  const studentClassName = currentUser?.assignedClass || 'Class 8-A';

  // Strict Classroom filtering for zero conflict
  const studentNotes = classNotes.filter(
    (n) => n.targetClassId === studentClassId || n.targetClassId === 'ALL'
  );

  const classMessages = classChats[studentClassId] || [];

  const handleSendDoubt = (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    sendClassTeacherMessage(studentClassId, doubtText.trim(), false, 'Student Doubt');
    setDoubtText('');
    addToast('Doubt submitted to your Class Teacher!', 'success');
  };

  const handleDownload = (note) => {
    addToast(`Downloading "${note.title}" (${note.fileName || note.fileType || 'File'})...`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8FF] pb-24">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200/90 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {studentClassName} Dedicated Portal
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Classroom Connect
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-slate-900 block">{currentUser?.name}</span>
            <span className="text-[10.5px] text-slate-500 font-semibold">{currentUser?.rollNumber || '8A-14'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-3 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('handouts')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'handouts'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Notes & Handouts ({studentNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'doubts'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Class Teacher / Doubts</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Assigned Class Teacher Card */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl backdrop-blur-xs">
              👩‍🏫
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
                Assigned Class Teacher
              </span>
              <h3 className="text-sm font-extrabold">Mrs. Priya Sharma</h3>
              <p className="text-[11px] text-blue-100">
                Mathematics & {studentClassName} Incharge
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Online</span>
          </span>
        </div>

        {/* TAB 1: STUDY HANDOUTS & NOTES */}
        {activeTab === 'handouts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800">
                Study Materials Released for {studentClassName}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Zero Conflict • Verified by Teachers
              </span>
            </div>

            {studentNotes.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Notes Available Yet</h3>
                <p className="text-xs text-slate-500">
                  Notes uploaded by your teachers for {studentClassName} will appear here.
                </p>
              </div>
            ) : (
              studentNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {note.subject}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          For {note.targetClassName || studentClassName}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{note.title}</h3>
                    </div>

                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      {note.fileType || 'PDF'}
                    </span>
                  </div>

                  {/* Image Attachment Preview */}
                  {note.fileData && (
                    <div
                      onClick={() => setPreviewImageModal(note.fileData)}
                      className="cursor-pointer relative rounded-2xl overflow-hidden border border-slate-200/80 max-h-48 group shadow-xs"
                    >
                      <img
                        src={note.fileData}
                        alt={note.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Tap to view full image</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                    {note.summary}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] text-slate-500">
                      By {note.teacher} • {note.time}
                    </span>

                    <button
                      onClick={() => handleDownload(note)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ASK CLASS TEACHER / DOUBTS */}
        {activeTab === 'doubts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {studentClassName} Classroom Doubt Forum
                  </h3>
                </div>
                <span className="text-[10.5px] font-bold text-blue-700">Live Connect</span>
              </div>

              {/* Messages Container */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {classMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border flex flex-col gap-1 ${
                      msg.role === 'TEACHER'
                        ? 'bg-amber-50/80 border-amber-200 ml-4'
                        : 'bg-blue-50/60 border-blue-100 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{msg.sender}</span>
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                            msg.role === 'TEACHER'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}
                        >
                          {msg.badge || (msg.role === 'TEACHER' ? 'Teacher Reply' : 'Student')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Student Question Input */}
              <form onSubmit={handleSendDoubt} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or doubt to your Class Teacher..."
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* FULL-SCREEN IMAGE PREVIEW LIGHTBOX */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-slate-950 rounded-3xl p-3 border border-white/20 shadow-2xl space-y-3">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Handout Attachment"
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />
            <div className="text-center">
              <span className="text-xs text-slate-300 font-semibold">Handout Image Preview</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
