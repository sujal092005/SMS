import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Radio,
  X,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const BUS_COLORS = {
  'BUS-01': 'from-blue-600 to-indigo-700',
  'BUS-02': 'from-emerald-600 to-teal-700',
};

export default function ParentBusTracker({ onBack }) {
  const {
    buses,
    isTripActive,
    currentSpeed,
    currentEta,
    busCoords,
    addToast
  } = useSchool();
  const { t } = useTranslation();

  const [selectedBus, setSelectedBus] = useState(null);

  const openInMaps = (busId) => {
    const coords = busCoords[busId];
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
    } else {
      addToast('Live location not available yet — driver may not have started journey.', 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8FF] pb-24">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">{t('teacher.busTracking')}</h1>
            <p className="text-[11px] text-slate-500">{t('parent.viewBusLocation')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{isTripActive ? t('common.active') : t('common.standby')}</span>
        </div>
      </div>

      {/* Bus Selection Cards */}
      <div className="p-4 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">{t('driver.selectBus')}</p>

        {buses.map((bus) => {
          const liveCoords = busCoords[bus.id];
          const isActive = Boolean(liveCoords) || bus.status === 'ON_ROUTE';
          const color = BUS_COLORS[bus.id] || 'from-slate-500 to-slate-700';
          const speed = liveCoords?.speed !== undefined ? liveCoords.speed : (isActive ? currentSpeed : 0);
          const eta = bus.etaMinutes && bus.etaMinutes > 0 ? bus.etaMinutes : null;

          return (
            <button
              key={bus.id}
              onClick={() => setSelectedBus(bus)}
              className="w-full text-left p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-98 transition-all space-y-3"
            >
              {/* Bus Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-sm`}>
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-900">{bus.busNumber}</span>
                    <span className="text-[11px] text-slate-500 block">{bus.route}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isActive ? t('driver.journeyLive') : t('common.standby')}
                </span>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-500 block font-medium">{t('parent.speed')}</span>
                  <span className="text-xs font-bold text-slate-900">{speed} km/h</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-500 block font-medium">{t('parent.eta')}</span>
                  <span className="text-xs font-bold text-slate-900">{eta ? `${eta}m` : '—'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-500 block font-medium">GPS</span>
                  <span className={`text-xs font-bold ${liveCoords ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {liveCoords ? t('common.active') : t('common.standby')}
                  </span>
                </div>
              </div>

              {/* Driver and Location status bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{bus.driverName}</span>
                  <span>·</span>
                  <span>{bus.driverPhone}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-700 font-bold">
                  {liveCoords ? (
                    <>
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{t('parent.viewBusLocation')}</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t('driver.gpsStandby')}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Safety note */}
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t('driver.enterDetails')}</span>
        </div>
      </div>

      {/* Bus Detail Modal */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${BUS_COLORS[selectedBus.id] || 'from-slate-500 to-slate-700'} flex items-center justify-center text-white`}>
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm">{selectedBus.busNumber}</h2>
                  <p className="text-[10.5px] text-slate-500">{selectedBus.plateNumber} · {selectedBus.driverName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBus(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live GPS */}
            {busCoords[selectedBus.id] ? (
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {t('driver.gpsActive')}
                </div>
                <p className="font-mono text-[11px] text-slate-700">
                  {busCoords[selectedBus.id].lat.toFixed(6)}°N, {busCoords[selectedBus.id].lng.toFixed(6)}°E
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center text-xs text-slate-500">
                {t('driver.gpsStandby')}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { openInMaps(selectedBus.id); setSelectedBus(null); }}
                disabled={!busCoords[selectedBus.id]}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                {t('parent.viewBusLocation')}
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
