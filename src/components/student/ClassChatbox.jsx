import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  BookOpen, 
  MessageSquare, 
  Send, 
  Sparkles,
  Calendar,
  Share2,
  CheckCircle2
} from 'lucide-react';

export default function ClassChatbox({ onBack }) {
  const { 
    classNotes, 
    classChats, 
    sendClassChatMessage, 
    currentUser, 
    selectedClassId, 
    addToast 
  } = useSchool();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'chat'
  const [chatInput, setChatInput] = useState('');

  const classId = currentUser?.assignedClass?.replace('Class ', '') || selectedClassId || '8A';
  const chats = classChats[classId] || classChats['8A'] || [];

  const handleDownload = (noteTitle) => {
    addToast(`Handout downloaded: ${noteTitle}`, 'success');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendClassChatMessage(classId, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
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
            <h1 className="text-lg font-bold text-[#00236F] tracking-tight">Class {classId} Notes & Discussion</h1>
            <p className="text-[11px] text-slate-500">Official Handouts & Teacher Q&A Channel</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Academic 2026
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'notes'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Handouts ({classNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Teacher Q&A ({chats.length})</span>
        </button>
      </div>

      {/* TAB 1: STUDY HANDOUTS */}
      {activeTab === 'notes' && (
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
                  {note.fileType || 'PDF'}
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
                  className="px-3 py-1.5 rounded-xl bg-[#00236F] text-white text-xs font-bold hover:bg-blue-900 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TEACHER Q&A CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col space-y-3">
          <div className="bg-blue-50/90 rounded-2xl p-2.5 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <span>Ask questions directly to your subject teachers</span>
            <span className="font-bold text-[10px] bg-white px-2 py-0.5 rounded-full border border-blue-200">
              Class {classId} Board
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-2xl border transition-all ${
                  chat.role === 'TEACHER'
                    ? 'bg-blue-50/70 border-blue-200 mr-4'
                    : 'bg-white border-slate-200 ml-4 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{chat.sender}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      chat.role === 'TEACHER' ? 'bg-[#00236F] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {chat.badge || chat.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-700">{chat.message}</p>
              </div>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
            <input
              type="text"
              placeholder="Ask a question to your class teacher..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#00236F] hover:bg-blue-900 text-white rounded-xl active:scale-95 transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
