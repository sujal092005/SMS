import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Send, 
  Search, 
  ArrowLeft,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

export default function AttendanceRoster({ onBack }) {
  const { 
    currentUser,
    selectedClassId,
    studentsList,
    submitAttendance,
    uploadFileToCloudStorage,
    addToast
  } = useSchool();

  const assignedClass = currentUser?.classId || selectedClassId || '10A';

  // State for each student's attendance: { [studentId]: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [attendanceMap, setAttendanceMap] = useState({});

  // When students load or change, initialize attendance map with PRESENT for new students
  useEffect(() => {
    const classStudentsLocal = studentsList.filter(
      (s) => s.classId === assignedClass
    );
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      classStudentsLocal.forEach((s) => {
        const sId = s.uid || s.id;
        if (!updated[sId]) {
          updated[sId] = s.status === 'absent' ? 'ABSENT' : 'PRESENT';
        }
      });
      return updated;
    });
  }, [studentsList, assignedClass]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Proof State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Filter students
  const classStudents = studentsList.filter((s) => s.classId === assignedClass);

  const filteredStudents = classStudents.filter((student) => {
    const sId = student.uid || student.id;
    const currentStatus = attendanceMap[sId] || 'PRESENT';

    const matchesQuery =
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.rollNo || student.roll || '').toString().includes(searchQuery) ||
      (student.loginId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'ALL' || currentStatus === filterStatus;
    return matchesQuery && matchesFilter;
  });

  const presentCount = classStudents.filter((s) => (attendanceMap[s.uid || s.id] || 'PRESENT') === 'PRESENT').length;
  const absentCount = classStudents.filter((s) => attendanceMap[s.uid || s.id] === 'ABSENT').length;
  const lateCount = classStudents.filter((s) => attendanceMap[s.uid || s.id] === 'LATE').length;

  const setStudentStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllStudentsPresent = () => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s.uid || s.id] = 'PRESENT';
    });
    setAttendanceMap(updated);
    addToast('Marked all students as Present', 'info');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAttendance = async () => {
    if (classStudents.length === 0) {
      addToast('No students enrolled in this class to mark attendance.', 'error');
      return;
    }

    setIsSubmitting(true);
    let photoUrl = null;

    if (photoFile) {
      const uploadRes = await uploadFileToCloudStorage(photoFile, `attendance_photos/${assignedClass}`);
      if (uploadRes?.success) {
        photoUrl = uploadRes.url;
      }
    }

    const payloadStudents = classStudents.map((s) => {
      const sId = s.uid || s.id;
      return {
        id: sId,
        name: s.name,
        rollNo: s.rollNo || s.roll,
        loginId: s.loginId,
        parentPhone: s.parentPhone,
        status: attendanceMap[sId] || 'PRESENT'
      };
    });

    const res = await submitAttendance(assignedClass, payloadStudents, photoUrl);
    setIsSubmitting(false);

    addToast(`Attendance submitted for Class ${assignedClass}! Absentee parents notified.`, 'success');
    if (onBack) onBack();
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#FAF8FF] pb-32 space-y-4">
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
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Class {assignedClass} Roll Call</span>
            </h1>
            <p className="text-[11px] text-slate-500">Photo Proof & Parent FCM Notifications</p>
          </div>
        </div>

        <button
          onClick={markAllStudentsPresent}
          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Present</span>
        </button>
      </div>

      {/* Classroom Photo Proof Upload Section */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-blue-700" />
            Classroom Photo Proof
          </span>
          {photoPreview && (
            <button
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
              className="text-[11px] text-rose-600 font-bold hover:underline"
            >
              Remove
            </button>
          )}
        </div>

        {photoPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-36">
            <img src={photoPreview} alt="Class Proof" className="w-full h-36 object-cover" />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Photo Attached</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 text-center cursor-pointer transition-all flex items-center justify-center gap-2 text-slate-600"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Snap or Upload Classroom Photo Proof</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Counter Filter Card */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => setFilterStatus(filterStatus === 'PRESENT' ? 'ALL' : 'PRESENT')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'PRESENT'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Present</span>
            <span className="text-xl font-black text-emerald-800">{presentCount}</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === 'ABSENT' ? 'ALL' : 'ABSENT')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'ABSENT'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Absent</span>
            <span className="text-xl font-black text-rose-800">{absentCount}</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === 'LATE' ? 'ALL' : 'LATE')}
            className={`p-2 rounded-2xl border transition-all ${
              filterStatus === 'LATE'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
                : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Late</span>
            <span className="text-xl font-black text-amber-800">{lateCount}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student by name or roll number..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
        />
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No students found</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const sId = student.uid || student.id;
            const status = attendanceMap[sId] || 'PRESENT';
            const isPresent = status === 'PRESENT';
            const isAbsent = status === 'ABSENT';
            const isLate = status === 'LATE';
            const rollStr = String(student.rollNo || student.roll || '0').padStart(3, '0');

            return (
              <div
                key={sId}
                className={`p-3 rounded-2xl bg-white border transition-all flex items-center justify-between ${
                  isAbsent
                    ? 'border-rose-200 bg-rose-50/20'
                    : isLate
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isPresent
                        ? 'bg-blue-50 text-blue-700'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    #{rollStr}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                      <span className="font-mono">{student.loginId || `RAVS-${assignedClass}-${rollStr}`}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Status Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setStudentStatus(sId, 'PRESENT')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    P
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentStatus(sId, 'ABSENT')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                      isAbsent
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    A
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentStatus(sId, 'LATE')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold transition-all active:scale-95 ${
                      isLate
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    L
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Submit Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="text-[11px] text-slate-600 leading-tight">
            <span className="font-bold block text-slate-900">{presentCount} Present</span>
            <span>{absentCount} absent {photoFile ? '• Photo ready' : ''}</span>
          </div>

          <button
            onClick={handleSubmitAttendance}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md hover:bg-blue-800 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Saving & Syncing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Roll Call with Proof</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
