import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  LocateFixed,
  ArrowLeft
} from 'lucide-react';

export default function ParentBusTracker({ onBack }) {
  const { 
    buses, 
    isTripActive, 
    currentSpeed, 
    currentEta, 
    busRouteProgress, 
    addToast 
  } = useSchool();

  const [isCentered, setIsCentered] = useState(false);
  const bus = buses.find((b) => b.id === 'BUS-01');

  const handleRecenter = () => {
    setIsCentered(true);
    addToast('Map re-centered on BUS-01', 'info');
    setTimeout(() => setIsCentered(false), 600);
  };

  const handleEmergencyCall = () => {
    addToast(`Dialing Driver ${bus.driverName} (${bus.driverPhone})...`, 'info');
  };

  // Compute animated coordinates along route
  const busX = 70 + (busRouteProgress / 100) * 230;
  const busY = 480 - (busRouteProgress / 100) * 360;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF8FF] pb-24 relative overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-30">
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
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Child Transit Tracking</h1>
            <p className="text-[11px] text-slate-500">Live GPS beacon strictly for BUS-01</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{isTripActive ? 'On Route' : 'Scheduled'}</span>
        </div>
      </div>

      {/* Vector Map Canvas matching Stitch Screen SCREEN_7 & SCREEN_9 */}
      <div className="relative w-full flex-1 min-h-[360px] overflow-hidden bg-[#F4F6FC]">
        <svg 
          className="absolute inset-0 w-full h-full object-cover select-none" 
          viewBox="0 0 400 600" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Land Parcels */}
          <rect width="400" height="600" fill="#F4F6FC" />
          <rect x="20" y="30" width="160" height="110" rx="12" fill="#EAEDF8" />
          <rect x="210" y="20" width="170" height="150" rx="12" fill="#EAEDF8" />
          <rect x="20" y="160" width="140" height="120" rx="12" fill="#EAEDF8" />
          <rect x="230" y="190" width="150" height="140" rx="12" fill="#E2EBE5" />
          <rect x="30" y="300" width="150" height="130" rx="12" fill="#EAEDF8" />
          <rect x="220" y="350" width="160" height="130" rx="12" fill="#EAEDF8" />
          <rect x="40" y="450" width="340" height="130" rx="12" fill="#EAEDF8" />

          {/* Minor Street Grids */}
          <path d="M 0 150 L 400 150" stroke="#E2E7F5" strokeWidth="10" strokeLinecap="round" />
          <path d="M 0 290 L 400 290" stroke="#E2E7F5" strokeWidth="8" strokeLinecap="round" />
          <path d="M 0 440 L 400 440" stroke="#E2E7F5" strokeWidth="9" strokeLinecap="round" />
          <path d="M 180 0 L 180 600" stroke="#E2E7F5" strokeWidth="12" strokeLinecap="round" />
          <path d="M 280 0 L 280 600" stroke="#E2E7F5" strokeWidth="8" strokeLinecap="round" />

          {/* Primary Traveled Route Arterial */}
          <path 
            d="M 70 480 C 70 380, 180 340, 180 260 C 180 180, 300 160, 300 120" 
            stroke="#CBD5E1" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 70 480 C 70 380, 180 340, 180 260 C 180 180, 300 160, 300 120" 
            stroke="#1E3A8A" 
            strokeWidth="4" 
            strokeDasharray="6 6" 
            strokeOpacity="0.4" 
            strokeLinecap="round" 
          />

          {/* Child Pickup / Home Stop Marker */}
          <circle cx="180" cy="260" r="14" fill="#2563EB" fillOpacity="0.15" />
          <circle cx="180" cy="260" r="6" fill="#2563EB" />
          <text x="180" y="244" textAnchor="middle" fill="#1E3A8A" fontSize="10" fontWeight="700">
            Aarav's Stop (Maple Heights)
          </text>

          {/* Final School Destination Marker */}
          <circle cx="300" cy="120" r="16" fill="#10B981" fillOpacity="0.2" />
          <circle cx="300" cy="120" r="7" fill="#10B981" />
          <text x="300" y="104" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="700">
            RAVS Senior Campus
          </text>
        </svg>

        {/* Live School Bus Marker Animated along Route */}
        <div 
          style={{
            left: `${busX}px`,
            top: `${busY}px`,
            transform: `translate(-50%, -50%) scale(${isCentered ? 1.25 : 1})`,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          className="absolute flex items-center justify-center pointer-events-none z-20"
        >
          {/* Pulsing Radar Ring */}
          <span className="absolute w-14 h-14 rounded-full bg-blue-500/20 animate-ping"></span>
          <span className="absolute w-10 h-10 rounded-full bg-blue-500/30"></span>

          {/* Core Bus Badge */}
          <div className="relative z-10 w-10 h-10 rounded-full bg-[#1E3A8A] text-white shadow-xl flex items-center justify-center border-2 border-white">
            <Bus className="w-5 h-5" />
          </div>

          <div className="absolute top-11 px-2 py-0.5 rounded-md bg-[#1E3A8A] text-white font-mono font-bold text-[9px] shadow-sm whitespace-nowrap">
            BUS-01 • {isTripActive ? `${currentSpeed} km/h` : 'Standby'}
          </div>
        </div>

        {/* Re-center Control Button */}
        <div className="absolute right-4 bottom-4 z-20">
          <button
            onClick={handleRecenter}
            className="w-11 h-11 rounded-full bg-white text-[#1E3A8A] shadow-lg flex items-center justify-center active:scale-95 transition-all border border-slate-200"
            title="Recenter on Child's Bus"
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Telemetry Card matching Stitch Screen SCREEN_7 */}
      <div className="p-4 -mt-6 relative z-30">
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-200/90 space-y-3.5">
          {/* Identification & Live Status */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">BUS-01</span>
                <span className="text-[10.5px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {bus.plateNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{bus.route}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${isTripActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{isTripActive ? 'On Route' : 'Trip Standby'}</span>
            </div>
          </div>

          {/* Arrival ETA & Driver Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Expected Pickup</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {isTripActive ? `ETA: ${currentEta} mins` : '08:15 AM'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Driver</span>
                <span className="text-xs font-extrabold text-slate-900 block">{bus.driverName}</span>
                <span className="text-[10px] text-slate-500">{bus.driverPhone}</span>
              </div>

              <button
                onClick={handleEmergencyCall}
                className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center active:scale-95 transition-all shadow-sm"
                title="Call Driver"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Child Boarding Safety Confirmation */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-950">Aarav Sharma • Boarded Safely</span>
            </div>
            <span className="text-[10.5px] font-bold text-emerald-700">08:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
