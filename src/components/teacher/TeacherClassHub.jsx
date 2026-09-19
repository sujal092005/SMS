import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Send, 
  Bell, 
  MessageSquare, 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  Paperclip,
  Download
} from 'lucide-react';

export default function TeacherClassHub({ onBack }) {
  const { 
    classesList, 
    selectedClassId, 
    setSelectedClassId,
    classNotes, 
    uploadClassNote,
    publishClassNotice,
    classChats,
    sendClassChatMessage,
    currentUser,
    notices
  } = useSchool();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'notices' | 'chat'
  
  // Note Form State
  const [noteSubject, setNoteSubject] = useState('Mathematics');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteChapter, setNoteChapter] = useState('');
  const [noteSummary, setNoteSummary] = useState('');

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState('Normal');

  // Chat Input State
  const [chatInput, setChatInput] = useState('');

  const currentClassObj = classesList.find((c) => c.id === selectedClassId) || classesList[3];
  const currentChats = classChats[selectedClassId] || [];

  // Filter notes for selected class or general
  const filteredNotes = classNotes.filter(
    (n) => !n.classId || n.classId === selectedClassId || n.classId === '8A'
  );

  const handleUploadNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    uploadClassNote({
      subject: noteSubject,
      title: noteTitle.trim(),
      chapter: noteChapter.trim(),
      summary: noteSummary.trim() || 'Uploaded by subject teacher for term revision.',
      fileType: 'PDF',
      classId: selectedClassId
    });

    setNoteTitle('');
    setNoteChapter('');
    setNoteSummary('');
  };

  const handlePublishNoticeSubmit = (e) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    publishClassNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim() || 'Please refer to classroom guidelines for this notice.',
      targetClass: currentClassObj.label,
      priority: noticePriority
    });

    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendClassChatMessage(selectedClassId, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
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
              <h1 className="text-xl font-extrabold text-[#00236F] tracking-tight">Class Study Hub</h1>
              <p className="text-xs text-slate-500">Teacher ↔ Student Notes & Announcements</p>
            </div>
          </div>

          {/* Class Dropdown */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-white border border-blue-200 text-[#00236F] font-bold text-xs py-1.5 pl-3 pr-7 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-blue-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'notes'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Upload Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'notices'
              ? 'bg-white text-[#00236F] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Class Notice</span>
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
          <span>Student Q&A</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD CLASS NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Note Upload Card */}
          <form onSubmit={handleUploadNoteSubmit} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Handout for {currentClassObj.label}</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                NCERT Aligned
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Mathematics</option>
                  <option>Science (Physics)</option>
                  <option>Science (Chemistry)</option>
                  <option>Science (Biology)</option>
                  <option>Social Science</option>
                  <option>English Literature</option>
                  <option>Computer Science</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Chapter / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4"
                  value={noteChapter}
                  onChange={(e) => setNoteChapter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Title & Description</label>
              <input
                type="text"
                placeholder="Topic Title (e.g. Quadratic Equations & Formulas)..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
              />
              <textarea
                placeholder="Summary notes, formulas, homework question list..."
                value={noteSummary}
                onChange={(e) => setNoteSummary(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Format: PDF / Docx / Slides</span>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#00236F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Note</span>
              </button>
            </div>
          </form>

          {/* Uploaded Notes Feed */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Handouts in {currentClassObj.label} ({filteredNotes.length})
            </span>

            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        {note.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{note.title}</h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {note.fileType || 'PDF'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{note.summary}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>By {note.teacher} • {note.time}</span>
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <Download className="w-3 h-3" />
                    <span>{note.downloads} Downloads</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: POST CLASS NOTICE */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <form onSubmit={handlePublishNoticeSubmit} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Broadcast Class Circular</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Target: {currentClassObj.label}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notice Heading</label>
              <input
                type="text"
                placeholder="e.g. Bring Geometry Instrument Box for Period 2..."
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notice Content</label>
              <textarea
                placeholder="Details of instructions, date, homework expectation..."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                rows={3}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                {['Normal', 'Important', 'Urgent'].map((pri) => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => setNoticePriority(pri)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      noticePriority === pri
                        ? pri === 'Urgent'
                          ? 'bg-rose-600 text-white'
                          : pri === 'Important'
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#00236F] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </form>

          {/* Active Notices Feed */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Announcements
            </span>

            {notices.slice(0, 4).map((n) => (
              <div key={n.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{n.date}</span>
                </div>
                <p className="text-xs text-slate-600">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TWO-WAY CLASS CHAT (TEACHER ↔ STUDENTS) */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col space-y-3">
          <div className="bg-blue-50/80 rounded-2xl p-2.5 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <span>Direct Doubt & Discussion Channel for {currentClassObj.label}</span>
            <span className="font-bold bg-white px-2 py-0.5 rounded-full border border-blue-200 text-[10px]">
              {currentChats.length} Messages
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {currentChats.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 p-4">
                No questions yet in {currentClassObj.label}. Start by posting a classroom discussion prompt!
              </div>
            ) : (
              currentChats.map((chat) => (
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
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
            <input
              type="text"
              placeholder={`Send message to students in ${currentClassObj.label}...`}
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
