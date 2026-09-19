import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Mic, 
  Info, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2,
  Bot,
  User,
  Image as ImageIcon
} from 'lucide-react';

export default function AIDoubtAssistant({ onBack }) {
  const { aiMessages, isAiThinking, askAIDoubt, addToast } = useSchool();
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);

  const suggestionChips = [
    { label: 'Explain photosynthesis', query: 'Explain photosynthesis in simple steps', icon: '🌱' },
    { label: 'Solve quadratic equation', query: 'Solve quadratic equation: 2x² + 5x - 3 = 0', icon: '📐' },
    { label: 'Summary of Chapter 3', query: 'Summary of Chapter 3: The Rise of Nationalism in Europe', icon: '📜' }
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const query = attachedImage 
      ? `${inputText || 'Please analyze this textbook question'} [Attached: ${attachedImage}]` 
      : inputText;

    askAIDoubt(query);
    setInputText('');
    setAttachedImage(null);
  };

  const handleVoiceSim = () => {
    setInputText('Explain Newton third law with everyday examples');
    addToast('Voice captured: "Explain Newton third law with everyday examples"', 'info');
  };

  const handleAttachMock = () => {
    setAttachedImage('Math_Problem_Page42.png');
    addToast('Textbook snapshot attached: Math_Problem_Page42.png', 'info');
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
              <span>AI Study Assistant</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </h1>
            <p className="text-[11px] text-slate-500">24/7 CBSE Syllabus Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Welcome Empty State if only 1 message */}
        {aiMessages.length === 1 && (
          <div className="flex flex-col items-center text-center py-6 px-3 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#1E3A8A] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-slate-900">How can I help you study?</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Ask a question about physics formulas, biology concepts, math equations, or history chapters.
              </p>
            </div>

            {/* Suggestion Chips matching Stitch Screen SCREEN_16 */}
            <div className="w-full pt-2 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Syllabus Queries
              </span>
              <div className="flex flex-col gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => askAIDoubt(chip.query)}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 active:scale-98 transition-all text-left shadow-xs flex items-center gap-2.5 group"
                  >
                    <span className="text-lg">{chip.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {chip.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {aiMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-xs space-y-2.5 ${
                  isUser
                    ? 'bg-[#1E3A8A] text-white rounded-br-xs'
                    : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75">
                  <span className="font-bold">{isUser ? 'You' : 'RAVS Study AI'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {msg.title && (
                  <h3 className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                    {msg.title}
                  </h3>
                )}

                <p className="text-xs leading-relaxed">{msg.text}</p>

                {/* Step-by-Step Structured Output */}
                {msg.steps && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    {msg.steps.map((step, idx) => (
                      <p key={idx} className="text-[11.5px] text-slate-700 leading-snug">
                        {step}
                      </p>
                    ))}
                  </div>
                )}

                {/* Exam Tip Card */}
                {msg.examTip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      <span className="font-bold">Exam Tip:</span> {msg.examTip}
                    </p>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isAiThinking && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-white rounded-2xl border border-slate-200 w-fit">
            <Bot className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="font-semibold">AI is formulating syllabus solution...</span>
          </div>
        )}
      </div>

      {/* Message Input Dock */}
      <div className="p-3 bg-white border-t border-slate-200/80 sticky bottom-16 z-20 space-y-2">
        {attachedImage && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
            <span className="flex items-center gap-1.5 font-bold">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{attachedImage}</span>
            </span>
            <button
              onClick={() => setAttachedImage(null)}
              className="text-blue-600 font-bold hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAttachMock}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95 transition-all"
            title="Attach Textbook Photo"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything from your syllabus..."
            className="flex-1 px-4 py-2.5 bg-slate-100 text-xs font-medium rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="button"
            onClick={handleVoiceSim}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center active:scale-95 transition-all"
            title="Voice Dictation"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() && !attachedImage}
            className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-800 active:scale-95 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400">
          RAVS Curated Educational AI • Verify critical examination formulas with your subject teacher.
        </p>
      </div>
    </div>
  );
}
