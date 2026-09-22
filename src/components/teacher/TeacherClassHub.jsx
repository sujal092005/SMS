import React, { useState, useRef } from 'react';
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
  Layers,
  Image as ImageIcon,
  X,
  Eye,
  FileSpreadsheet,
  Paperclip
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  // Lightbox preview for images
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Teacher Reply State
  const [replyText, setReplyText] = useState('');
  const [replyClassId, setReplyClassId] = useState('8A');

  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb > 0 ? sizeInMb : '0.4'} MB`);

    if (file.type.startsWith('image/')) {
      setFileType('IMAGE');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('pdf')) {
      setFileType('PDF');
      setFilePreview(null);
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      setFileType('DOCX');
      setFilePreview(null);
    } else {
      setFileType('DOCUMENT');
      setFilePreview(null);
    }

    if (!title.trim()) {
      // Auto populate title from file name without extension
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
    setSelectedFile(file);
    addToast(`Attached "${file.name}"`, 'info');
  };

  const handleRemoveAttachedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !selectedFile) {
      addToast('Please enter a note title or attach a file', 'error');
      return;
    }

    let storageDownloadUrl = null;
    if (selectedFile) {
      const uploadRes = await uploadFileToCloudStorage(selectedFile, 'class_notes');
      if (uploadRes?.success) {
        storageDownloadUrl = uploadRes.url;
      }
    }

    const matchedClass = (classesList || []).find((c) => (c.id || c.classId) === targetClassId);
    const targetClassName = matchedClass ? (matchedClass.label || matchedClass.className) : (targetClassId === 'ALL' ? 'All Classes' : `Class ${targetClassId}`);

    uploadClassNote({
      subject,
      title: title.trim() || fileName,
      chapter: chapter.trim(),
      summary: summary.trim() || `Study notes published for ${targetClassName}.`,
      fileType: filePreview ? 'IMAGE' : (fileType || 'PDF'),
      fileName: fileName || 'Class_Notes.pdf',
      fileSize: fileSize || '1.4 MB',
      fileUrl: storageDownloadUrl || null,
      fileData: filePreview || null,
      targetClassId,
      targetClassName
    });

    // Reset fields
    setTitle('');
    setChapter('');
    setSummary('');
    handleRemoveAttachedFile();
  };

  const handleSendTeacherMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendClassTeacherMessage(replyClassId, replyText, true, 'Teacher Announcement');
    setReplyText('');
    addToast(`Announcement sent to ${classesList.find(c => c.id === replyClassId)?.label || replyClassId}!`, 'success');
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
            <span>Upload File or Image</span>
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
            <span>Class Teacher Chat</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TAB 1: UPLOAD NOTES / FILES / IMAGES */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Upload Form Card */}
            <form onSubmit={handleUploadSubmit} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Send Notes, Document, or Image</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Attach files or photos directly from your device and choose target classroom.
                </p>
              </div>

              {/* File / Image Attachment Drag & Pick Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                  <span>Attach Document or Image</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="teacher-file-input"
                />

                {!selectedFile ? (
                  <label
                    htmlFor="teacher-file-input"
                    className="cursor-pointer border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Click to select PDF, Document or Photo
                      </span>
                      <span className="text-[10.5px] text-slate-500">
                        Supports PDF, PNG, JPG, Word (.docx) up to 25MB
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-xl border border-amber-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                          {fileType}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate max-w-[180px]">
                          {fileName}
                        </span>
                        <span className="text-[10.5px] text-amber-800 font-semibold">
                          {fileSize} • Ready to Publish
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveAttachedFile}
                      className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-rose-600 flex items-center justify-center border border-slate-200 shadow-xs active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Subject */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-800">
                  Note / Handout Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Quadratic Formula Proofs & Graphs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Target Classroom Selector */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send to Classroom (Target Audience)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 text-xs font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">🌐 All Classes (School-Wide)</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.category}) — {c.strength} Students
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject & Chapter */}
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
                  <label className="text-xs font-bold text-slate-800">Chapter / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 4: Algebra"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Brief Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please solve the exercise on page 4 before Monday class."
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
                <span>Publish Notes & File to Classroom</span>
              </button>
            </form>

            {/* Uploaded Handouts Directory */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Published Handouts ({displayedNotes.length})
                  </h3>
                </div>

                {/* Filter Selector */}
                <select
                  value={selectedFilterClass}
                  onChange={(e) => setSelectedFilterClass(e.target.value)}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none"
                >
                  <option value="ALL">Show All Classes</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {displayedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
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

                    <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                      {note.summary}
                    </p>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-200/60 pt-2">
                      <span>By {note.teacher} • {note.time}</span>
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
                    <p className="text-[11px] text-slate-500">Direct student doubts & homework announcements.</p>
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
                  {classesList.find(c => c.id === replyClassId)?.label} Classroom Discussion
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Direct Student Q&A
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {currentClassMessages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No questions posted for this class yet.
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
              <span className="text-xs text-slate-300 font-semibold">Handout Image Attachment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
