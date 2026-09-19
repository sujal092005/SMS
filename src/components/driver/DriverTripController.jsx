import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import {
  Navigation,
  Play,
  Square,
  MapPin,
  CheckCircle2,
  Clock,
  Bus,
  Phone,
  Signal,
  ArrowLeft,
  Users,
  ChevronDown,
  Loader2,
  Radio,
  AlertCircle
} from 'lucide-react';

export default function DriverTripController({ onBack }) {
  const { isTripActive, startTrip, stopTrip, addToast, updateBusCoords } = useSchool();
  const { t } = useTranslation();

  const BUS_OPTIONS = [
    { id: 'BUS-01', label: t('driver.bus1'), plateNumber: 'MH-04-AB-1234', color: 'from-blue-600 to-indigo-700' },
    { id: 'BUS-02', label: t('driver.bus2'), plateNumber: 'MH-04-CD-5678', color: 'from-emerald-600 to-teal-700' },
  ];

  // Form state
  const [step, setStep] = useState('form'); // 'form' | 'trip'
  const [selectedBus, setSelectedBus] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalStudents, setTotalStudents] = useState('');
  const [formError, setFormError] = useState('');

  // GPS / trip state
  const [gpsStatus, setGpsStatus] = useState('Acquiring GPS…');
  const [coords, setCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Stop timers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const validateForm = () => {
    if (!selectedBus) return 'Please select a bus.';
    if (!driverName.trim()) return 'Please enter driver name.';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'Enter a valid 10-digit Indian mobile number.';
    if (!totalStudents || Number(totalStudents) < 1) return 'Enter total number of students.';
    return '';
  };

  const handleStartJourney = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError('');

    const driverDetails = {
      driverName: driverName.trim(),
      driverPhone: phone.trim(),
      totalStudents: totalStudents
    };

    // Start GPS watch
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          setSpeed(pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0);
          setGpsStatus('GPS Live ✓');
          // Push to shared context & Firebase Cloud
          updateBusCoords(selectedBus, c, driverDetails);
        },
        () => setGpsStatus('GPS unavailable'),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } else {
      setGpsStatus('GPS not supported');
    }

    // Elapsed timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    startTrip({
      busId: selectedBus,
      ...driverDetails
    });
    setStep('trip');
    addToast(`Journey started! ${selectedBus} is now broadcasting location.`, 'success');
  };

  const handleStopJourney = () => {
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopTrip();
    setStep('form');
    setCoords(null);
    setSpeed(0);
    setElapsed(0);
    setGpsStatus('Acquiring GPS…');
    addToast('Trip ended. GPS broadcasting stopped.', 'info');
  };

  const formatElapsed = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h > 0 ? `${h}h` : null, `${m}m`, `${sec}s`].filter(Boolean).join(' ');
  };

  const busInfo = BUS_OPTIONS.find((b) => b.id === selectedBus);

  // ─── TRIP ACTIVE VIEW ────────────────────────────────────────────────────────
  if (step === 'trip') {
    return (
      <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${busInfo?.color} flex items-center justify-center shadow-md`}>
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{busInfo?.label} • {t('driver.journeyLive')}</h1>
            <p className="text-[11px] text-slate-500">{driverName} · {phone}</p>
          </div>
        </div>

        {/* Live GPS Card */}
        <div className="bg-gradient-to-tr from-emerald-700 via-teal-800 to-emerald-900 rounded-3xl p-5 text-white shadow-xl ring-4 ring-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('driver.gpsActive')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-400/40">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{gpsStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-700/50">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">{t('parent.speed')}</span>
              <p className="text-2xl font-black">{speed} <span className="text-sm font-semibold">km/h</span></p>
            </div>
            <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-700/50">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">{t('common.time')}</span>
              <p className="text-lg font-black">{formatElapsed(elapsed)}</p>
            </div>
          </div>

          {coords && (
            <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-700/50 text-[11px] font-mono">
              <span className="text-emerald-300 font-bold block mb-0.5">Coordinates</span>
              <span>{coords.lat.toFixed(6)}°N, {coords.lng.toFixed(6)}°E</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-emerald-950/30 rounded-2xl p-2.5 border border-emerald-700/40">
              <span className="text-emerald-300 block font-bold">{t('driver.totalStudents')}</span>
              <span className="font-extrabold text-lg">{totalStudents}</span>
            </div>
            <div className="bg-emerald-950/30 rounded-2xl p-2.5 border border-emerald-700/40">
              <span className="text-emerald-300 block font-bold">Bus</span>
              <span className="font-extrabold text-lg">{selectedBus}</span>
            </div>
          </div>
        </div>

        {/* Share Location Link */}
        {coords && (
          <a
            href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-blue-200 text-blue-700 font-bold text-sm shadow-xs hover:bg-blue-50 transition-all"
          >
            <MapPin className="w-4 h-4" />
            {t('driver.openGoogleMaps')}
          </a>
        )}

        {/* Stop Button */}
        <button
          onClick={handleStopJourney}
          className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Square className="w-5 h-5 fill-white" />
          {t('driver.stopJourney')}
        </button>
      </div>
    );
  }

  // ─── FORM VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-28 space-y-5">
      {/* Header */}
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
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{t('driver.tripConsole')}</h1>
          <p className="text-[11px] text-slate-500">{t('driver.enterDetails')}</p>
        </div>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Bus Selection */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5 text-blue-600" />
          {t('driver.selectBus')}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {BUS_OPTIONS.map((bus) => {
            const isSelected = selectedBus === bus.id;
            return (
              <button
                key={bus.id}
                onClick={() => setSelectedBus(bus.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${bus.color} flex items-center justify-center mb-2 shadow-md`}>
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">{bus.label}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{bus.plateNumber}</span>
                {isSelected && (
                  <span className="mt-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Driver Details Form */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.driver')}</span>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">{t('driver.driverName')}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">{t('driver.driverPhone')}</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Total Students */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">{t('driver.totalStudents')}</label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="1"
              max="60"
              value={totalStudents}
              onChange={(e) => setTotalStudents(e.target.value)}
              placeholder="e.g. 35"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/* GPS Info Note */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium">
        <Navigation className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{t('driver.enterDetails')}</span>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartJourney}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white font-extrabold text-sm shadow-lg hover:from-blue-900 hover:to-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-white" />
        {t('driver.startJourney')}
      </button>
    </div>
  );
}
