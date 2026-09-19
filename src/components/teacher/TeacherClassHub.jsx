import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BookOpen,
  UploadCloud,
  FileText,
  MessageSquare,
  Users,
  Send,
  CheckCircle2,
  ArrowLeft,
  Filter,
  Sparkles,
  Download,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function TeacherClassHub({ onBack }) {
  const {
    currentUser,
    classesList,
    classNotes,
    uploadClassNote,
    classChats,
    sendClassTeacherMessage,
    addToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'interact'
  const [selectedFilterClass, setSelectedFilterClass] = useState('ALL');

  // Upload Form State
  const [subject, setSubject] = useState('Mathematics');
  const [targetClassId, setTargetClassId] = useState('8A');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [summary, setSummary] = useState('');
  const [fileType, setFileType] = useState('PDF');

  // Teacher Reply State
  const [replyText, setReplyText] = useState('');
  const [replyClassId, setReplyClassId] = useState('8A');

  const subjects = [
    'Mathematics',
    'Science (Physics)',
    'Science (Chemistry)',
    'Science (Biology)',
    'English Literature',
    'Social Science (History)',
    'Hindi',
    'Computer Science'
  ];

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please provide a document title', 'error');
      return;
    }

    const matchedClass = classesList.find((c) => c.id === targetClassId);
    const targetClassName = matchedClass ? matchedClass.label : (targetClassId === 'ALL' ? 'All Classes' : targetClassId);

    uploadClassNote({
      subject,
      title: title.trim(),
      chapter: chapter.trim(),
      summary: summary.trim(),
      fileType,
      targetClassId,
      targetClassName
    });

    // Reset fields
    setTitle('');
    setChapter('');
    setSummary('');
  };

  const handleSendTeacherMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendClassTeacherMessage(replyClassId, replyText, true, 'Teacher Announcement');
    setReplyText('');
    addToast(`Message sent to ${classesList.find(c => c.id === replyClassId)?.label || replyClassId}!`, 'success');
  };

  // Filter notes
  const displayedNotes = selectedFilterClass === 'ALL'
    ? classNotes
    : classNotes.filter((n) => n.targetClassId === selectedFilterClass || n.targetClassId === 'ALL');

  const currentClassMessages = classChats[replyClassId] || [];

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
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                Academic Distribution & Student Interaction
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Classroom Portal & Notes
              </h1>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {currentUser?.assignedClass || 'Class 8-A'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-3 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Notes (Class Selector)</span>
          </button>

          <button
            onClick={() => setActiveTab('interact')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'interact'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Class Teacher & Student Chat</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TAB 1: UPLOAD NOTES WITH CLASSROOM TARGETING */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Upload Card */}
            <form onSubmit={handleUploadSubmit} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Publish Study Notes to Specific Class</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select the exact classroom so notes go only to intended students with zero conflict.
                </p>
              </div>

              {/* Target Classroom Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Target Classroom (Select Class)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">🌐 All Classes (School-Wide)</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.category}) — {c.strength} Students
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject & File Type */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="PDF">PDF Handout</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="SLIDES">PowerPoint Slides (.pptx)</option>
                    <option value="ZIP">Question Bank Archive (.zip)</option>
                  </select>
                </div>
              </div>

              {/* Document Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Quadratic Formula Derivations & Examples"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Chapter / Topic */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Chapter / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Quadratic Equations"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Highlights Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Summary & Study Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Contains step-by-step discriminant formula proofs and 10 practice problems for Friday submission."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publish Notes to Selected Classroom</span>
              </button>
            </form>

            {/* Uploaded Handouts Directory */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Published Class Notes
                  </h3>
                </div>

                {/* Filter Selector */}
                <select
                  value={selectedFilterClass}
                  onChange={(e) => setSelectedFilterClass(e.target.value)}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none"
                >
                  <option value="ALL">Show All Classes</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                {displayedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {note.targetClassName || note.targetClassId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {note.subject}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{note.title}</h4>
                      </div>

                      <span className="text-[10px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {note.fileType}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">{note.summary}</p>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-200/60 pt-2">
                      <span>Uploaded by {note.teacher} • {note.time}</span>
                      <span className="font-semibold text-indigo-600">{note.downloads} Downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS TEACHER & STUDENT INTERACTION */}
        {activeTab === 'interact' && (
          <div className="space-y-4">
            {/* Classroom Selector Card */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-slate-900">Class Incharge Communication</h2>
                    <p className="text-[11px] text-slate-500">Interact with students of your assigned classroom.</p>
                  </div>
                </div>

                <select
                  value={replyClassId}
                  onChange={(e) => setReplyClassId(e.target.value)}
                  className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 focus:outline-none"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  {classesList.find(c => c.id === replyClassId)?.label} Student Discussion Feed
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Classroom Hub
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {currentClassMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No doubts or questions posted for this class yet.
                  </div>
                ) : (
                  currentClassMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl border flex flex-col gap-1 ${
                        msg.role === 'TEACHER'
                          ? 'bg-amber-50/70 border-amber-200 ml-4'
                          : 'bg-slate-50 border-slate-200/80 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{msg.sender}</span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                              msg.role === 'TEACHER'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {msg.badge || (msg.role === 'TEACHER' ? 'Teacher' : 'Student')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                      </div>

                      <p className="text-xs text-slate-800 font-medium">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Teacher Broadcast / Reply Input Form */}
              <form onSubmit={handleSendTeacherMessage} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Post announcement or reply to ${classesList.find(c => c.id === replyClassId)?.label}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-xs transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
