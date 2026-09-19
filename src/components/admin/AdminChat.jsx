import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Send, 
  ArrowLeft, 
  Pin, 
  MessageSquare, 
  Users, 
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

export default function AdminChat({ onBack }) {
  const { facultyChats, sendFacultyChat, currentUser } = useSchool();
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendFacultyChat(inputText);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF8FF] pb-24">
      {/* Sticky Header */}
      <div className="p-4 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Admin ↔ Faculty Common Room</span>
            </h1>
            <p className="text-[11px] text-slate-500">Official Staff Collaboration Channel</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>14 Online</span>
        </div>
      </div>

      {/* Pinned Broadcast Banner matching Stitch Screen SCREEN_34 */}
      <div className="px-4 pt-3 pb-1">
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
          <Pin className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Pinned Announcement: Term 1 Roll-Call Sync</span>
            <p className="text-[11px] text-amber-800 leading-snug">
              Please finalize attendance logs by 08:30 AM every morning. For lab requisitions, submit forms by 2:00 PM.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {facultyChats.map((chat) => {
          const isSelf = chat.isSelf;
          return (
            <div
              key={chat.id}
              className={`flex gap-2.5 items-end ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {!isSelf && (
                <img
                  src={chat.avatar}
                  alt={chat.sender}
                  className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-slate-200 shadow-xs"
                />
              )}

              <div
                className={`max-w-[78%] p-3 rounded-2xl shadow-xs space-y-1 ${
                  isSelf
                    ? 'bg-[#1E3A8A] text-white rounded-br-xs'
                    : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold ${isSelf ? 'text-blue-200' : 'text-slate-500'}`}>
                    {chat.sender}
                  </span>
                  <span className={`text-[9px] ${isSelf ? 'text-blue-300' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{chat.message}</p>
              </div>

              {isSelf && (
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Self"
                  className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-blue-200 shadow-xs"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Message Composer */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-16 z-20">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Broadcast a note to faculty members..."
            className="flex-1 px-4 py-2.5 bg-slate-100 text-xs font-medium rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-800 active:scale-95 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
