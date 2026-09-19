import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Navigation, 
  Play, 
  Square, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  ShieldAlert, 
  Bus, 
  Phone,
  Signal,
  ArrowLeft
} from 'lucide-react';

export default function DriverTripController({ onBack }) {
  const { 
    buses, 
    isTripActive, 
    startTrip, 
    stopTrip, 
    driverGPSStatus, 
    currentSpeed, 
    currentEta, 
    busRouteProgress,
    addToast 
  } = useSchool();

  const bus = buses.find((b) => b.id === 'BUS-01');
  const [stopsList, setStopsList] = useState(bus.stops);

  const toggleStopStatus = (index) => {
    setStopsList((prev) =>
      prev.map((stop, i) =>
        i === index
          ? {
              ...stop,
              status: stop.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED'
            }
          : stop
      )
    );
    addToast(`Stop status updated`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
      {/* Driver Header */}
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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Driver Transit Cockpit</h1>
            <p className="text-[11px] text-slate-500">In-Cab Hardware GPS & Student Roster</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          <Signal className="w-3.5 h-3.5 text-emerald-600" />
          <span>{driverGPSStatus}</span>
        </div>
      </div>

      {/* Assigned Vehicle Card matching Stitch Screen SCREEN_4 */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Bus Details</span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Vehicle Linked</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-0.5">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Assigned Bus</span>
            <p className="text-lg font-black text-slate-900 tracking-tight">{bus.busNumber}</p>
            <span className="text-[10px] font-mono text-slate-500">{bus.plateNumber}</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Transit Captain</span>
            <p className="text-sm font-extrabold text-slate-900 truncate">{bus.driverName}</p>
            <span className="text-[10px] text-slate-500">{bus.route.split('(')[0]}</span>
          </div>
        </div>
      </div>

      {/* Prominent High-Contrast Big Touch Trip Controller (Safety Ergonomics) */}
      <div
        className={`rounded-3xl p-5 text-white shadow-xl transition-all ${
          isTripActive
            ? 'bg-gradient-to-tr from-emerald-700 via-teal-800 to-emerald-900 ring-4 ring-emerald-100'
            : 'bg-gradient-to-tr from-[#1E3A8A] via-blue-900 to-indigo-950'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isTripActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
              }`}
            ></span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {isTripActive ? 'Trip Started • Location Sharing ON' : 'Trip Not Started • Standby'}
            </span>
          </div>

          {isTripActive && (
            <span className="text-xs font-black bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
              {currentSpeed} km/h
            </span>
          )}
        </div>

        <p className="text-xs text-blue-100/80 mb-5 leading-relaxed">
          {isTripActive
            ? 'Real-time GPS coordinate deltas are streaming to parent tracking portal. Drive safely.'
            : 'Starting the trip initiates student stop logging and broadcasts coordinate beacons to school authority.'}
        </p>

        {/* Start / Stop Huge Touch Button */}
        {isTripActive ? (
          <button
            onClick={stopTrip}
            className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Square className="w-5 h-5 fill-white" />
            <span>STOP TRIP • RETURN TO STANDBY</span>
          </button>
        ) : (
          <button
            onClick={startTrip}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>START TRIP • BROADCAST GPS</span>
          </button>
        )}
      </div>

      {/* Route Stops Milestone Checklist */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Route #4 Stop Milestones</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-500">Tap to Mark Boarded</span>
        </div>

        <div className="space-y-2">
          {stopsList.map((stop, idx) => {
            const isDone = stop.status === 'COMPLETED';

            return (
              <div
                key={idx}
                onClick={() => toggleStopStatus(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : stop.isChildStop
                    ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200/70 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{stop.name}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{stop.time}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {isDone ? 'Completed' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
