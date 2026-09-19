import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Users, 
  ShieldCheck, 
  Search, 
  Hash, 
  Paperclip,
  CheckCheck
} from 'lucide-react';

export default function TeacherFacultyChat({ onBack }) {
  const { facultyChats, sendFacultyChat, currentUser } = useSchool();
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const channels = [
    { id: 'general', label: 'General Lounge', icon: '💬', count: facultyChats.length },
    { id: 'academics', label: 'Academic Board', icon: '📚', count: 4 },
    { id: 'exam', label: 'Exam Duties', icon: '📝', count: 6 },
    { id: 'transport', label: 'Fleet Alerts', icon: '🚌', count: 2 }
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendFacultyChat(inputText.trim());
    setInputText('');
  };

  const filteredChats = facultyChats.filter((chat) =>
    chat.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF8FF] pb-28">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200/90 shadow-xs flex items-center justify-between sticky top-0 z-20">
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
            <h1 className="text-base font-extrabold text-[#00236F] tracking-tight flex items-center gap-1.5">
              <span>Faculty Common Room</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h1>
            <p className="text-[11px] text-slate-500">Official Staff & Administrative Channel</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Encrypted
        </span>
      </div>

      {/* Channel Selector Chips */}
      <div className="p-2.5 bg-white border-b border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeChannel === ch.id
                ? 'bg-[#00236F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{ch.icon}</span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discussion or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {filteredChats.map((chat) => {
          const isMe = chat.isSelf || (currentUser && chat.sender?.includes(currentUser.name));

          return (
            <div
              key={chat.id}
              className={`flex gap-2.5 max-w-[88%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <img
                src={chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={chat.sender}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-1"
              />

              <div
                className={`p-3 rounded-2xl space-y-1 ${
                  isMe
                    ? 'bg-[#00236F] text-white rounded-tr-xs shadow-sm'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold ${isMe ? 'text-blue-200' : 'text-slate-800'}`}>
                    {chat.sender}
                  </span>
                  <span className={`text-[9px] ${isMe ? 'text-blue-300' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>

                <p className="text-xs leading-relaxed">{chat.message}</p>

                <div className="flex items-center justify-end gap-1 pt-0.5">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    isMe ? 'bg-blue-800/80 text-blue-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {chat.roleTag || 'Staff'}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-300" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Message Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 sticky bottom-0 z-20">
        <input
          type="text"
          placeholder="Share update with faculty staff..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          className="p-2.5 bg-[#00236F] hover:bg-blue-900 text-white rounded-xl active:scale-95 transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
