import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bell, 
  Pin, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Tag, 
  Search 
} from 'lucide-react';

export default function StudentNotices({ onBack }) {
  const { notices } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['ALL', 'Examinations', 'Sports & Co-curricular', 'Transportation', 'Administration'];

  const filteredNotices = notices.filter((n) => {
    const matchesCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
    const titleText = (n.title || '').toLowerCase();
    const contentText = (n.content || n.summary || '').toLowerCase();
    const queryText = searchTerm.toLowerCase();
    const matchesSearch = titleText.includes(queryText) || contentText.includes(queryText);
    return matchesCategory && matchesSearch;
  });

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Official Circulars</h1>
            <p className="text-[11px] text-slate-500">Live School Notices & Guidelines</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Bell className="w-3.5 h-3.5" />
          <span>{notices.length} Notices</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Updates' : cat}
          </button>
        ))}
      </div>

      {/* Notices Stream matching Stitch Screen SCREEN_18 */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2 relative"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {notice.category}
              </span>

              <div className="flex items-center gap-1.5">
                {notice.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Pin className="w-3 h-3" />
                    <span>Important</span>
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">
                  {notice.date}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{notice.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {notice.content}
            </p>

            <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1">
              <span>Audience: {notice.targetAudience}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Circular</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
