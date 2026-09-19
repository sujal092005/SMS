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
  Image as ImageIcon,
  Key,
  X,
  Zap,
  Check
} from 'lucide-react';

export default function AIDoubtAssistant({ onBack }) {
  const { 
    aiMessages, 
    isAiThinking, 
    askAIDoubt, 
    geminiApiKey, 
    updateGeminiApiKey, 
    addToast 
  } = useSchool();

  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');

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

  const handleSaveKey = (e) => {
    e.preventDefault();
    updateGeminiApiKey(tempApiKey.trim());
    setShowKeyModal(false);
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
            <p className="text-[10.5px] text-slate-500">Google Gemini Powered • CBSE Tutor</p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyModal(true)}
          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
            geminiApiKey
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
          }`}
        >
          <Key className="w-3 h-3" />
          <span>{geminiApiKey ? 'Gemini Key Configured' : 'Add Gemini Key'}</span>
        </button>
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
                Ask any question about CBSE physics formulas, biology concepts, math equations, or history chapters.
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="w-full pt-2 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Syllabus Queries
              </span>
              <div className="flex flex-col gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => askAIDoubt(chip.query)}
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all active:scale-98 shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{chip.icon}</span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        {chip.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-blue-600">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-3xl p-4 shadow-xs space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-[#1E3A8A] text-white rounded-br-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {msg.title || 'AI Explanation'}
                    </span>
                  </div>
                  {msg.isGeminiLive ? (
                    <span className="text-[9.5px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      ⚡ Gemini 1.5 Live
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      CBSE Knowledge
                    </span>
                  )}
                </div>
              )}

              {/* Steps or Raw Text */}
              {msg.steps && Array.isArray(msg.steps) ? (
                <div className="space-y-2 pt-1 text-xs">
                  {msg.steps.map((step, sIdx) => (
                    <div key={sIdx} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 leading-relaxed text-slate-700">
                      {step.split('**').map((chunk, cIdx) => 
                        cIdx % 2 === 1 ? <strong key={cIdx} className="text-slate-900 font-bold">{chunk}</strong> : chunk
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}

              {/* Exam Tip Alert */}
              {msg.examTip && (
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5 mt-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">Board Exam Tip: </span>
                    <span>{msg.examTip}</span>
                  </div>
                </div>
              )}

              <span className={`text-[9.5px] block text-right pt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Thinking Animation */}
        {isAiThinking && (
          <div className="flex gap-2.5 items-center text-slate-500 text-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-semibold text-slate-500 ml-1">Consulting Google Gemini AI...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200/80 sticky bottom-0 z-20 space-y-2">
        {attachedImage && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
            <span className="truncate">Attached: {attachedImage}</span>
            <button onClick={() => setAttachedImage(null)} className="text-blue-700 font-bold">✕</button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttachMock}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            title="Attach Textbook Snapshot"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Ask anything (e.g. Solve quadratic equation, photosynthesis...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="button"
            onClick={handleVoiceSim}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 active:scale-95 text-white shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* MODAL: GEMINI API KEY CONFIGURATION */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Gemini API Key</h3>
                  <p className="text-[10.5px] text-slate-500">Live AI Tutoring Engine</p>
                </div>
              </div>

              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your Google Gemini API key to enable live AI question answering. You can obtain a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Google AI Studio</a>.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Gemini API Key</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
