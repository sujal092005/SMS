import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { db, isFirebaseConnected } from '../../services/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import {
  Calendar,
  Clock,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  MapPin,
  User,
  Sparkles
} from 'lucide-react';

const DEFAULT_TIMETABLE_8A = {
  Monday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Mathematics', teacher: 'Prof. Sunita Rao', room: 'Room 204' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Science (Physics)', teacher: 'Mr. Rajesh Sharma', room: 'Physics Lab' },
    { id: 'p3', time: '09:40 - 10:25 AM', subject: 'English Literature', teacher: 'Mrs. Kavita Roy', room: 'Room 204' },
    { id: 'p4', time: '10:45 - 11:30 AM', subject: 'Social Science', teacher: 'Mr. Amit Verma', room: 'Room 204' },
    { id: 'p5', time: '11:35 - 12:20 PM', subject: 'Computer Science', teacher: 'Ms. Pooja Nair', room: 'Computer Lab 2' }
  ],
  Tuesday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Science (Chemistry)', teacher: 'Dr. Vikram Sethi', room: 'Chemistry Lab' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Mathematics', teacher: 'Prof. Sunita Rao', room: 'Room 204' },
    { id: 'p3', time: '09:40 - 10:25 AM', subject: 'Hindi', teacher: 'Mrs. Rekha Joshi', room: 'Room 204' },
    { id: 'p4', time: '10:45 - 11:30 AM', subject: 'Physical Education', teacher: 'Coach R. Yadav', room: 'Sports Ground' }
  ],
  Wednesday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Science (Biology)', teacher: 'Dr. Anita Sen', room: 'Biology Lab' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Mathematics', teacher: 'Prof. Sunita Rao', room: 'Room 204' },
    { id: 'p3', time: '09:40 - 10:25 AM', subject: 'Social Science', teacher: 'Mr. Amit Verma', room: 'Room 204' },
    { id: 'p4', time: '10:45 - 11:30 AM', subject: 'English Grammar', teacher: 'Mrs. Kavita Roy', room: 'Room 204' }
  ],
  Thursday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Mathematics', teacher: 'Prof. Sunita Rao', room: 'Room 204' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Science (Physics)', teacher: 'Mr. Rajesh Sharma', room: 'Physics Lab' },
    { id: 'p3', time: '09:40 - 10:25 AM', subject: 'Computer Lab Practical', teacher: 'Ms. Pooja Nair', room: 'Computer Lab 2' },
    { id: 'p4', time: '10:45 - 11:30 AM', subject: 'Art & Craft', teacher: 'Mr. Manoj Kumar', room: 'Art Studio' }
  ],
  Friday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Science Revision & Test', teacher: 'Mr. Rajesh Sharma', room: 'Room 204' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Mathematics Derivations', teacher: 'Prof. Sunita Rao', room: 'Room 204' },
    { id: 'p3', time: '09:40 - 10:25 AM', subject: 'Library / Self Study', teacher: 'Librarian', room: 'Central Library' },
    { id: 'p4', time: '10:45 - 11:30 AM', subject: 'Class Discussion & Doubts', teacher: 'Prof. Sunita Rao', room: 'Room 204' }
  ],
  Saturday: [
    { id: 'p1', time: '08:00 - 08:45 AM', subject: 'Co-Curricular Club Activity', teacher: 'Club Incharge', room: 'Auditorium' },
    { id: 'p2', time: '08:50 - 09:35 AM', subject: 'Sports & Athletics', teacher: 'Coach R. Yadav', room: 'Playground' }
  ]
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassTimetable({ classId = '8A', onBack }) {
  const { currentUser, addToast } = useSchool();
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayIndex = new Date().getDay(); // 0 is Sunday
    return todayIndex >= 1 && todayIndex <= 6 ? DAYS[todayIndex - 1] : 'Monday';
  });

  const [timetable, setTimetable] = useState(DEFAULT_TIMETABLE_8A);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDaySchedule, setEditedDaySchedule] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const targetClass = currentUser?.classId || classId || '8A';

  // Check if current user is allowed to edit
  const canEdit =
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'classTeacher' && (currentUser?.classId === targetClass || !currentUser?.classId));

  // Subscribe to live Firestore timetable
  useEffect(() => {
    if (!isFirebaseConnected || !db) return;
    const docRef = doc(db, 'timetable', targetClass);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setTimetable(snap.data().schedule || DEFAULT_TIMETABLE_8A);
      }
    });
    return () => unsub();
  }, [targetClass]);

  const handleStartEdit = () => {
    setEditedDaySchedule([...(timetable[selectedDay] || [])]);
    setIsEditing(true);
  };

  const handleAddPeriod = () => {
    const newPeriod = {
      id: `p_${Date.now()}`,
      time: '11:45 - 12:30 PM',
      subject: 'New Subject',
      teacher: currentUser?.name || 'Faculty',
      room: 'Room 204'
    };
    setEditedDaySchedule((prev) => [...prev, newPeriod]);
  };

  const handleRemovePeriod = (index) => {
    setEditedDaySchedule((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePeriodChange = (index, field, value) => {
    setEditedDaySchedule((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    const updatedTimetable = {
      ...timetable,
      [selectedDay]: editedDaySchedule
    };

    setTimetable(updatedTimetable);

    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, 'timetable', targetClass), {
          classId: targetClass,
          schedule: updatedTimetable,
          updatedBy: currentUser?.uid || 'user',
          updatedAt: serverTimestamp()
        }, { merge: true });
        addToast(`Timetable for ${selectedDay} (Class ${targetClass}) saved to Cloud!`, 'success');
      } catch (err) {
        addToast('Saved locally.', 'info');
      }
    } else {
      addToast('Timetable updated locally.', 'success');
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  const currentPeriods = timetable[selectedDay] || [];

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-24 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-700" />
              <span>Class {targetClass} Timetable</span>
            </h1>
            <p className="text-[11px] text-slate-500">
              {canEdit ? 'Editable by Class Teacher • Live sync for students' : 'Live weekly academic routine'}
            </p>
          </div>
        </div>

        {canEdit && (
          <div>
            {isEditing ? (
              <button
                onClick={handleSaveSchedule}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Day</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Days Tabs Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                setIsEditing(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-tr from-[#1E3A8A] to-blue-700 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Schedule Card / Edit Mode */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{selectedDay} Schedule</span>
          </span>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {isEditing ? editedDaySchedule.length : currentPeriods.length} Sessions
          </span>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-2.5">
            {currentPeriods.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No scheduled sessions for {selectedDay}</p>
                {canEdit && <p className="text-[11px]">Click "Edit Day" to configure periods.</p>}
              </div>
            ) : (
              currentPeriods.map((period, idx) => (
                <div
                  key={period.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                        P{idx + 1}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 truncate">{period.subject}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700">{period.time}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{period.room || 'Classroom'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10.5px] font-bold text-indigo-900 block truncate max-w-[120px]">
                      {period.teacher}
                    </span>
                    <span className="text-[9.5px] text-slate-400">Instructor</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Edit Mode for Class Teacher */
          <div className="space-y-3">
            {editedDaySchedule.map((period, idx) => (
              <div key={period.id || idx} className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900">Period {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePeriod(idx)}
                    className="w-6 h-6 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Subject</label>
                    <input
                      type="text"
                      value={period.subject}
                      onChange={(e) => handlePeriodChange(idx, 'subject', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Time Interval</label>
                    <input
                      type="text"
                      value={period.time}
                      onChange={(e) => handlePeriodChange(idx, 'time', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Teacher Name</label>
                    <input
                      type="text"
                      value={period.teacher}
                      onChange={(e) => handlePeriodChange(idx, 'teacher', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Room / Lab</label>
                    <input
                      type="text"
                      value={period.room}
                      onChange={(e) => handlePeriodChange(idx, 'room', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPeriod}
              className="w-full py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-700 bg-blue-50/50 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100/50 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Period</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
