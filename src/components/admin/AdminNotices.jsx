import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bell, 
  Plus, 
  Send, 
  Pin, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  Users,
  Sparkles
} from 'lucide-react';

export default function AdminNotices({ onBack }) {
  const { notices, addNotice, deleteNotice } = useSchool();
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Examinations');
  const [targetAudience, setTargetAudience] = useState('All Campus');
  const [content, setContent] = useState('');

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNotice({
      title: title.trim(),
      category,
      targetAudience,
      content: content.trim()
    });

    setTitle('');
    setContent('');
    setShowComposer(false);
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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Notice Broadcast Hub</h1>
            <p className="text-[11px] text-slate-500">Campus Circulars & Announcements</p>
          </div>
        </div>

        <button
          onClick={() => setShowComposer(!showComposer)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-800 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showComposer ? 'Cancel' : 'Post Notice'}</span>
        </button>
      </div>

      {/* Inline Notice Composer matching Stitch Screen SCREEN_40 */}
      {showComposer && (
        <form onSubmit={handlePostNotice} className="bg-white rounded-3xl p-4 border border-blue-200 shadow-lg space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compose Official Circular</span>
            </span>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Circular Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Exhibition Registration Deadline"
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Examinations">Examinations</option>
                <option value="Administration">Administration</option>
                <option value="Sports & Co-curricular">Sports & Co-curricular</option>
                <option value="Transportation">Transportation</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All Campus">All Campus</option>
                <option value="Students & Parents">Students & Parents</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Parents & Drivers">Parents & Drivers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Description / Directive</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full instructions, dates, and action items..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#1E3A8A] text-white font-bold text-xs hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Circular Now</span>
          </button>
        </form>
      )}

      {/* Active Notices List */}
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2 relative"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {notice.category}
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium">
                  {notice.date}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {notice.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </span>
                )}
                <button
                  onClick={() => deleteNotice(notice.id)}
                  className="w-7 h-7 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors"
                  title="Remove notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{notice.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Audience: {notice.targetAudience}</span>
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Synced</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
