import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Bus,
  MapPin,
  ArrowLeft,
  Gauge,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  X,
  Radio,
  Users
} from 'lucide-react';

export default function AdminFleet({ onBack }) {
  const { buses, isTripActive, currentSpeed, currentEta, busCoords } = useSchool();
  const [selectedBus, setSelectedBus] = useState(null);

  const handleBusTap = (bus) => setSelectedBus(bus);
  const handleClose = () => setSelectedBus(null);

  const openInMaps = (busId) => {
    const coords = busCoords[busId];
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
    }
  };

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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fleet Tracking</h1>
            <p className="text-[11px] text-slate-500">Tap a bus to see live location</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10.5px] font-bold text-amber-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{buses.length} Buses</span>
        </div>
      </div>

      {/* Bus Cards — tap to see live location */}
      <div className="space-y-3">
        {buses.map((bus) => {
          const liveCoords = busCoords[bus.id];
          const isActive = Boolean(liveCoords) || bus.status === 'ON_ROUTE';
          const speed = liveCoords?.speed !== undefined ? liveCoords.speed : (isActive ? currentSpeed : 0);
          const eta = bus.etaMinutes || 0;

          return (
            <button
              key={bus.id}
              onClick={() => handleBusTap(bus)}
              className="w-full bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden text-left active:scale-[0.98] transition-all hover:shadow-md hover:border-blue-200"
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-100/40 blur-xl pointer-events-none"></div>
              )}

              {/* Bus header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-white ${isActive ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' : 'bg-gradient-to-tr from-amber-500 to-orange-500'}`}>
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

                <div className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                  <span>{isActive ? 'On Route' : 'Standby'}</span>
                </div>
              </div>

              {/* Telemetry row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Speed</span>
                  <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-600" />
                    {speed} km/h
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">ETA</span>
                  <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {isActive ? `${eta} min` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Students</span>
                  <span className="text-xs font-black text-slate-800">{bus.capacity?.split(' ')[0]}</span>
                </div>
              </div>

              {/* Driver info + live location prompt */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-bold text-[10px] flex items-center justify-center">
                    {bus.driverName?.[0] || '?'}
                  </span>
                  <div>
                    <span className="font-bold text-[11px] block text-slate-900">{bus.driverName}</span>
                    <span className="text-[10px] text-slate-500">{bus.driverPhone}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${liveCoords ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {liveCoords ? <Radio className="w-3 h-3 animate-pulse" /> : <MapPin className="w-3 h-3" />}
                  {liveCoords ? 'Tap for Live Location' : 'No GPS yet'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Location Modal */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${Boolean(busCoords[selectedBus.id]) || selectedBus.status === 'ON_ROUTE' ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' : 'bg-gradient-to-tr from-amber-500 to-orange-500'}`}>
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm">{selectedBus.busNumber} — Live Location</h2>
                  <p className="text-[10.5px] text-slate-500">{selectedBus.plateNumber}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Driver details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Driver</span>
                <p className="text-sm font-extrabold text-slate-900">{selectedBus.driverName}</p>
                <p className="text-[10.5px] text-slate-500">{selectedBus.driverPhone}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Students</span>
                <p className="text-xl font-extrabold text-slate-900">{selectedBus.capacity?.split(' ')[0]}</p>
              </div>
            </div>

            {/* GPS Coords */}
            {busCoords[selectedBus.id] ? (
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  GPS Broadcasting Live
                </div>
                <p className="font-mono text-[11px] text-slate-700">
                  {busCoords[selectedBus.id].lat.toFixed(6)}°N, {busCoords[selectedBus.id].lng.toFixed(6)}°E
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center text-xs text-slate-500">
                GPS coordinates not yet available — bus may not have started journey.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => openInMaps(selectedBus.id)}
                disabled={!busCoords[selectedBus.id]}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                Open in Google Maps
              </button>
              <a
                href={`tel:${selectedBus.driverPhone}`}
                className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
