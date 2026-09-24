import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function DeviceFrame({ children }) {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const [isMobileFrame, setIsMobileFrame] = useState(!isNative);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col items-center justify-start sm:py-6 selection:bg-blue-200">
      {/* Top Floating Viewport Switcher */}
      <aside aria-label="Device Viewport Controls" className="fixed top-2 right-4 z-50 flex items-center gap-1.5 p-1 bg-slate-800/90 backdrop-blur-md rounded-full border border-slate-700 shadow-xl">
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            isMobileFrame ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          title="Switch to Mobile Screen Preview"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile Frame</span>
        </button>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            !isMobileFrame ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
          title="Switch to Full View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full Width</span>
        </button>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[412px] bg-slate-50 min-h-screen sm:min-h-[860px] sm:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-0 sm:border-[8px] sm:border-slate-800 relative overflow-hidden flex flex-col'
            : 'max-w-2xl bg-slate-50 min-h-screen shadow-2xl relative flex flex-col'
        }`}
      >
        {/* Mobile Status Bar (Visible in frame mode) */}
        {isMobileFrame && (
          <div className="w-full bg-white/95 backdrop-blur-md px-6 pt-2 pb-1.5 flex items-center justify-between z-50 text-[11px] font-bold text-slate-800 select-none border-b border-slate-100/50">
            <span>{currentTime}</span>
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 rounded-full bg-slate-900 mx-auto -mt-1 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
