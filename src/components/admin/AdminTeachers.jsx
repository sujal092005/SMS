import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  KeyRound,
  UserX,
  UserCheck,
  Shield,
  BookOpen,
  ArrowLeft,
  X,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Users
} from 'lucide-react';

export default function AdminTeachers({ onBack }) {
  const {
    teachersList,
    schoolConfig,
    addTeacher,
    resetPassword,
    setUserActive,
    classesList,
    addToast
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'classTeacher' | 'subjectTeacher'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCredentialsModal, setNewCredentialsModal] = useState(null); // data to reveal once
  const [resetModalData, setResetModalData] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('classTeacher');
  const [assignedClassId, setAssignedClassId] = useState('8A');
  const [assignedSections, setAssignedSections] = useState(['8A', '9A']);
  const [department, setDepartment] = useState('Mathematics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const defaultClasses = classesList.length > 0 ? classesList : [
    { classId: '5A', className: 'Class 5-A' },
    { classId: '6A', className: 'Class 6-A' },
    { classId: '7A', className: 'Class 7-A' },
    { classId: '8A', className: 'Class 8-A' },
    { classId: '9A', className: 'Class 9-A' },
    { classId: '10A', className: 'Class 10-A' },
    { classId: '11A', className: 'Class 11-A' },
    { classId: '12A', className: 'Class 12-A' },
  ];

  const filteredTeachers = teachersList.filter((t) => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.loginId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'ALL' ||
      t.role === roleFilter ||
      (roleFilter === 'classTeacher' && t.role === 'classTeacher');
    return matchesSearch && matchesRole;
  });

  const handleSectionToggle = (classId) => {
    setAssignedSections((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter teacher full name.');
      return;
    }

    if (type === 'classTeacher' && !assignedClassId) {
      setFormError('Please select assigned class for the Class Teacher.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      type,
      classId: type === 'classTeacher' ? assignedClassId : null,
      sections: type === 'subjectTeacher' ? assignedSections : [assignedClassId],
      department: department.trim()
    };

    const res = await addTeacher(payload);
    setIsSubmitting(false);

    if (res?.success && res.teacher) {
      setShowAddModal(false);
      setNewCredentialsModal(res.teacher);
      // Reset form
      setName('');
      setPhone('');
      setType('classTeacher');
    } else {
      setFormError(res?.error || 'Failed to create teacher account.');
    }
  };

  const handleResetPassword = async (teacher) => {
    if (!window.confirm(`Reset password for ${teacher.name}? A new temporary password will be generated.`)) {
      return;
    }
    const res = await resetPassword(teacher.uid || teacher.id);
    if (res?.success) {
      setResetModalData(res);
    }
  };

  const handleToggleActive = async (teacher) => {
    const newStatus = !(teacher.active !== false);
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${teacher.name}? ${!newStatus ? 'They will not be able to log in.' : ''}`)) {
      return;
    }
    await setUserActive(teacher.uid || teacher.id, newStatus);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Credentials copied to clipboard!', 'success');
  };

  const currentCount = schoolConfig.currentUserCount || teachersList.length + 1;
  const maxCapacity = schoolConfig.maxUsers || 500;
  const capacityPercent = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#FAF8FF] pb-24 space-y-4">
      <div className="space-y-4">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-700" />
                <span>Faculty Management</span>
              </h1>
              <p className="text-xs text-slate-500">Add, provision & manage institutional faculty</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold shadow-md shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        </div>

        {/* Capacity Meter Bar */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Institutional Capacity
            </span>
            <span className="font-bold text-slate-900">
              {currentCount} <span className="text-slate-400 font-normal">/ {maxCapacity} Users ({capacityPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent > 90 ? 'bg-rose-500' : capacityPercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>Enforces per-school capacity limits</span>
            <span>{maxCapacity - currentCount} seats remaining</span>
          </div>
        </div>

        {/* Search & Role Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                roleFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('classTeacher')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                roleFilter === 'classTeacher' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Class Tutors
            </button>
          </div>
        </div>

        {/* Faculty Cards List */}
        <div className="space-y-2.5">
          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No teachers found</p>
              <p className="text-[11px] text-slate-400">Add a new faculty member using the button above.</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => {
              const isActive = teacher.active !== false;
              const isClassTch = teacher.role === 'classTeacher';

              return (
                <div
                  key={teacher.uid || teacher.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs space-y-2.5 ${
                    isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                          isClassTch ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {teacher.name ? teacher.name.charAt(0) : 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-xs font-bold text-slate-900">{teacher.name}</h2>
                          {!isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9.5px] font-bold">
                              Deactivated
                            </span>
                          )}
                          {teacher.mustChangePassword && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 text-[9.5px] font-bold">
                              Pending Setup
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-0.5">
                          <code className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700 font-semibold">
                            {teacher.loginId || teacher.email}
                          </code>
                          <span>•</span>
                          <span>{teacher.department || 'Academic'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isClassTch
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {isClassTch ? `Class Tutor (${teacher.classId || 'Assigned'})` : 'Subject Teacher'}
                    </span>
                  </div>

                  {/* Class assignments strip */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Classrooms: </span>
                      <strong className="text-slate-800">
                        {isClassTch
                          ? `Class ${teacher.classId || '8A'}`
                          : (teacher.sections || []).join(', ') || 'General'}
                      </strong>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetPassword(teacher)}
                        title="Reset temporary password"
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span>Reset Pass</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(teacher)}
                        title={isActive ? 'Deactivate user' : 'Reactivate user'}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── ADD TEACHER MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Provision Faculty Account</h2>
                  <p className="text-[11px] text-slate-500">Auto-generates Login ID & initial temp password</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Role Type Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Faculty Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('classTeacher')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      type === 'classTeacher'
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Class Teacher</p>
                    <p className="text-[10px] text-slate-500">Manages attendance & students of a specific class</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('subjectTeacher')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      type === 'subjectTeacher'
                        ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Subject Teacher</p>
                    <p className="text-[10px] text-slate-500">Uploads notes & chats across multiple classes</p>
                  </button>
                </div>
              </div>

              {/* Class Selection for Class Teacher */}
              {type === 'classTeacher' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Class & Section
                  </label>
                  <select
                    value={assignedClassId}
                    onChange={(e) => setAssignedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {defaultClasses.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        Class {c.className || c.classId}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Multiple Sections for Subject Teacher */
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teaching Classrooms (Select All Applicable)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {defaultClasses.map((c) => {
                      const isSelected = assignedSections.includes(c.classId);
                      return (
                        <button
                          key={c.classId}
                          type="button"
                          onClick={() => handleSectionToggle(c.classId)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {c.classId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Department / Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Specialization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, English"
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Faculty Account...</span>
                  </>
                ) : (
                  <span>Create Account & Generate Slip</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREDENTIALS REVEAL SLIP MODAL (Shown Once) ──────────────────── */}
      {newCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Faculty Provisioned!</h2>
              <p className="text-xs text-slate-500">
                Please share these initial credentials with the faculty member.
              </p>
            </div>

            {/* Slip Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-blue-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Teacher:</span>
                <strong className="text-slate-900">{newCredentialsModal.name}</strong>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Login ID:</span>
                <code className="font-mono font-bold text-blue-700 text-[13px] bg-blue-50 px-2 py-0.5 rounded-md">
                  {newCredentialsModal.loginId}
                </code>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Temp Password:</span>
                <code className="font-mono font-bold text-emerald-700 text-[13px] bg-emerald-50 px-2 py-0.5 rounded-md">
                  {newCredentialsModal.tempPassword}
                </code>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-800 capitalize">{newCredentialsModal.role}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-800 font-medium">
              🔒 The faculty member will be required to set their own permanent password upon first login.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    `RAVS Smart School Faculty Credentials:\nName: ${newCredentialsModal.name}\nLogin ID: ${newCredentialsModal.loginId}\nTemp Password: ${newCredentialsModal.tempPassword}\nPortal: ravs.school`
                  )
                }
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Slip</span>
              </button>

              <button
                onClick={() => setNewCredentialsModal(null)}
                className="flex-1 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESET PASSWORD RESULT MODAL ─────────────────────────────────── */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 mt-0.5">{resetModalData.name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-500">New Temporary Password:</span>
              <p className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 py-1 rounded-lg">
                {resetModalData.newPassword}
              </p>
            </div>

            <button
              onClick={() => setResetModalData(null)}
              className="w-full py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
