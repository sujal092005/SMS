import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  MessageSquare, 
  Bus, 
  Sparkles, 
  FileText, 
  MapPin, 
  Navigation,
  UserCheck
} from 'lucide-react';

export default function BottomNav({ currentTab, onTabChange }) {
  const { activeRole } = useSchool();

  const getNavItems = () => {
    switch (activeRole) {
      case 'ADMIN':
        return [
          { id: 'home', label: 'Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance', icon: CheckSquare },
          { id: 'notices', label: 'Notices', icon: Bell },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'fleet', label: 'Fleet GPS', icon: Bus },
        ];
      case 'TEACHER':
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'attendance', label: 'Roll Call', icon: CheckSquare },
          { id: 'chat', label: 'Faculty', icon: MessageSquare },
          { id: 'notices', label: 'Notices', icon: Bell },
        ];
      case 'STUDENT':
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'ai_doubt', label: 'Ask AI', icon: Sparkles, highlight: true },
          { id: 'notes', label: 'Class Notes', icon: FileText },
          { id: 'notices', label: 'Notices', icon: Bell },
        ];
      case 'PARENT':
        return [
          { id: 'bus', label: 'Bus GPS', icon: Bus, highlight: true },
          { id: 'attendance', label: 'Child Status', icon: UserCheck },
          { id: 'notices', label: 'Circulars', icon: Bell },
        ];
      case 'DRIVER':
        return [
          { id: 'trip', label: 'Trip Console', icon: Navigation, highlight: true },
          { id: 'stops', label: 'Route Stops', icon: MapPin },
          { id: 'notices', label: 'Transit Alerts', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  if (!navItems.length) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.04)] pb-safe">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative -top-2 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white ring-4 ring-blue-100 shadow-blue-500/25'
                      : 'bg-[#1E3A8A] text-white hover:bg-blue-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? 'text-blue-700' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${
                isActive ? 'text-[#1E3A8A]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1E3A8A]"></span>
                )}
              </div>
              <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
