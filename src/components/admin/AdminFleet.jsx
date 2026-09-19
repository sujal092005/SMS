import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bus, 
  MapPin, 
  ArrowLeft, 
  Gauge, 
  Clock, 
  Phone, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function AdminFleet({ onBack }) {
  const { buses, isTripActive, currentSpeed, currentEta, busRouteProgress } = useSchool();

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Connected Fleet Telemetry</h1>
            <p className="text-[11px] text-slate-500">Live GPS tracking for all school transit buses</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10.5px] font-bold text-amber-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{buses.length} Buses Monitored</span>
        </div>
      </div>

      {/* Fleet Live Summary Vector Map Canvas */}
      <div className="relative w-full h-44 rounded-3xl overflow-hidden border border-slate-200 shadow-xs bg-[#F4F6FC]">
        <svg className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" viewBox="0 0 400 200" fill="none">
          <rect width="400" height="200" fill="#F4F6FC" />
          <rect x="20" y="20" width="100" height="60" rx="8" fill="#EAEFF8" />
          <rect x="140" y="30" width="120" height="70" rx="8" fill="#EAEFF8" />
          <rect x="280" y="20" width="100" height="80" rx="8" fill="#E2EBE5" />
          <rect x="40" y="110" width="160" height="70" rx="8" fill="#EAEFF8" />
          <rect x="220" y="120" width="160" height="60" rx="8" fill="#EAEFF8" />
          {/* Main Highway Route */}
          <path d="M 10 100 Q 150 70 200 110 T 390 80" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
          <path d="M 10 100 Q 150 70 200 110 T 390 80" stroke="#1E3A8A" strokeWidth="4" strokeDasharray="6 6" strokeOpacity="0.4" />
          {/* Active Bus Markers */}
          {/* BUS-01 Animated Position */}
          <circle cx={40 + busRouteProgress * 3.2} cy={100 - (busRouteProgress > 50 ? 10 : -5)} r="12" fill="#1E3A8A" fillOpacity="0.2" className="animate-ping" />
          <circle cx={40 + busRouteProgress * 3.2} cy={100 - (busRouteProgress > 50 ? 10 : -5)} r="7" fill="#1E3A8A" />
          {/* BUS-02 Static Point */}
          <circle cx="280" cy="90" r="6" fill="#2563EB" />
          {/* Campus Destination */}
          <circle cx="370" cy="80" r="9" fill="#10B981" />
        </svg>

        <div className="absolute top-2.5 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live GPS Satellite Map</span>
        </div>

        <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-[9.5px] font-bold text-slate-500">
          Main Campus GPS Geofence
        </div>
      </div>

      {/* Buses Detailed Roster */}
      <div className="space-y-3">
        {buses.map((bus) => {
          const isBus1 = bus.id === 'BUS-01';
          const isCurrentlyActive = isBus1 ? isTripActive : bus.status === 'ON_ROUTE';
          const speed = isBus1 ? currentSpeed : bus.speed;
          const eta = isBus1 ? currentEta : bus.etaMinutes;

          return (
            <div
              key={bus.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden"
            >
              {isCurrentlyActive && (
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-100/40 blur-xl pointer-events-none"></div>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-extrabold text-slate-900">{bus.busNumber}</h2>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {bus.plateNumber}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500">{bus.route}</p>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 border ${
                    isCurrentlyActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrentlyActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                    }`}
                  ></span>
                  <span>{isCurrentlyActive ? 'On Route' : 'Standby'}</span>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Speed</span>
                  <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-600" />
                    <span>{speed} km/h</span>
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Campus ETA</span>
                  <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{isCurrentlyActive ? `${eta} min` : 'Standby'}</span>
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Students</span>
                  <span className="text-xs font-black text-slate-800">
                    {bus.capacity.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Driver Lockup */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-bold text-[10px] flex items-center justify-center">
                    {bus.driverName[0]}
                  </span>
                  <div>
                    <span className="font-bold text-[11px] block">{bus.driverName}</span>
                    <span className="text-[10px] text-slate-500">{bus.driverPhone}</span>
                  </div>
                </div>

                <a
                  href={`tel:${bus.driverPhone}`}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call In-Cab</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
