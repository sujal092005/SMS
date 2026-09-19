import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bell, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  UserCircle2, 
  ChevronDown,
  Bus,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function TopHeader({ onNavigate, currentTab }) {
  const { activeRole, currentUser, logout, isTripActive, currentSpeed } = useSchool();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleLabel = () => {
    switch (activeRole) {
      case 'ADMIN':
        return { name: 'Admin Workspace', badge: 'Authority', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'TEACHER':
        return { name: 'Faculty Portal', badge: 'Class 8-A', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'STUDENT':
        return { name: 'Student Hub', badge: 'Grade 8', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PARENT':
        return { name: 'Parent Console', badge: 'BUS-01 Track', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'DRIVER':
        return { name: 'In-Cab Console', badge: 'Fleet GPS', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { name: 'Campus Portal', badge: 'Portal', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-700 to-blue-600 p-[1.5px] shadow-sm shadow-indigo-950/15 flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" className="w-7 h-7">
                <rect width="80" height="80" rx="16" fill="#1E3A8A" />
                <path d="M40 18L18 29L40 40L62 29L40 18Z" fill="#60A5FA" />
                <path d="M26 36.5V47.5C26 53.5 32 58 40 58C48 58 54 53.5 54 47.5V36.5L40 44.5L26 36.5Z" fill="#FFFFFF" />
                <circle cx="58" cy="38" r="3.5" fill="#93C5FD" />
                <path d="M58 41.5V50" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[16px] tracking-tight text-slate-900 leading-tight">RAVS</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${roleInfo.color}`}>
                {roleInfo.badge}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-medium text-slate-500">{roleInfo.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Active Trip Beacon Chip for Drivers / Parents */}
          {isTripActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>GPS Live</span>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 transition-all border border-slate-200"
              aria-label="User Profile Menu"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-xl object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 pb-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.title}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Role: {currentUser?.role}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Persona / Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
