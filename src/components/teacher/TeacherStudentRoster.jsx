import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  X,
  ArrowLeft,
  UserCheck,
  UserX,
  Sparkles,
  Phone,
  Calendar,
  Shield,
  Download,
  Upload
} from 'lucide-react';

export default function TeacherStudentRoster({ onBack }) {
  const {
    currentUser,
    selectedClassId,
    studentsList,
    addStudent,
    addStudentsBulk,
    resetPassword,
    setUserActive,
    addToast
  } = useSchool();

  const assignedClass = currentUser?.classId || selectedClassId || '10A';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PENDING'
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);
  const [credentialsModalData, setCredentialsModalData] = useState(null); // revealed once
  const [resetModalData, setResetModalData] = useState(null);

  // Single Student Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState(''); // DDMMYYYY format
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Bulk CSV State
  const [csvFile, setCsvFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  // Filter students
  const filteredStudents = studentsList.filter((s) => {
    // Only show students belonging to this class if class teacher
    const isThisClass = !s.classId || s.classId === assignedClass || studentsList.length <= 50;
    if (!isThisClass && currentUser?.role !== 'admin') return false;

    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNo || s.roll || '').toString().includes(searchQuery) ||
      (s.loginId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isPending = s.mustChangePassword;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && isPending) ||
      (statusFilter === 'ACTIVE' && !isPending && s.active !== false);

    return matchesSearch && matchesStatus;
  });

  const activeCount = studentsList.filter((s) => !s.mustChangePassword && s.active !== false).length;
  const pendingCount = studentsList.filter((s) => s.mustChangePassword).length;

  // Single Student Submit
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanDob = dob.replace(/[^0-9]/g, '');
    if (cleanDob.length !== 8) {
      setFormError('Date of Birth must be exactly 8 digits in DDMMYYYY format (e.g. 15082012).');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      rollNo: rollNo.trim(),
      dob: cleanDob,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      classId: assignedClass
    };

    const res = await addStudent(payload);
    setIsSubmitting(false);

    if (res?.success) {
      setShowAddSingleModal(false);
      setCredentialsModalData(res);
      // Reset form
      setName('');
      setRollNo('');
      setDob('');
      setParentName('');
      setParentPhone('');
    } else {
      setFormError(res?.error || 'Failed to enroll student.');
    }
  };

  // CSV Parsing
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setCsvErrors(['CSV file must have a header row and at least one student row.']);
        return;
      }

      // Format: name,rollNo,dob,parentName,parentPhone
      const rows = [];
      const errs = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 3) {
          errs.push(`Row ${i + 1}: Insufficient columns (expected: name, rollNo, dob, parentName, parentPhone).`);
          continue;
        }

        const [rName, rRoll, rDob, rParentName, rParentPhone] = parts;
        const cleanDob = (rDob || '').replace(/[^0-9]/g, '');

        if (!rName || !rRoll || cleanDob.length !== 8) {
          errs.push(`Row ${i + 1} (${rName || 'Unknown'}): Invalid format (Name, Roll, and 8-digit DDMMYYYY DOB are required).`);
          continue;
        }

        rows.push({
          name: rName,
          rollNo: rRoll,
          dob: cleanDob,
          parentName: rParentName || '',
          parentPhone: rParentPhone || ''
        });
      }

      setParsedRows(rows);
      setCsvErrors(errs);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);
    const res = await addStudentsBulk(assignedClass, parsedRows);
    setIsSubmitting(false);

    if (res?.success) {
      setBulkResult(res);
      setParsedRows([]);
      setCsvFile(null);
    }
  };

  const handleResetPassword = async (student) => {
    if (!window.confirm(`Reset password for ${student.name}? Student's password will revert to their Date of Birth.`)) {
      return;
    }
    const res = await resetPassword(student.uid || student.id);
    if (res?.success) {
      setResetModalData(res);
    }
  };

  const handleToggleActive = async (student) => {
    const newStatus = !(student.active !== false);
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${student.name}?`)) {
      return;
    }
    await setUserActive(student.uid || student.id, newStatus);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'name,rollNo,dob,parentName,parentPhone\n' +
      'Aarav Sharma,14,15082012,Sunita Sharma,9876543210\n' +
      'Riya Patel,15,22032012,Mahesh Patel,9823456781\n' +
      'Vihaan Gupta,16,05112011,Kavita Gupta,9811223344\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ravs_students_template_${assignedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Credentials slip copied to clipboard!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#FAF8FF] pb-24 space-y-4">
      <div className="space-y-4">
        {/* Header */}
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
                <Users className="w-6 h-6 text-blue-700" />
                <span>Class {assignedClass} Roster</span>
              </h1>
              <p className="text-xs text-slate-500">Student admissions, auto-parent accounts & login slips</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setShowBulkCsvModal(true)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk CSV</span>
            </button>

            <button
              onClick={() => setShowAddSingleModal(true)}
              className="px-3 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold shadow-md shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Roster</span>
            <span className="text-lg font-extrabold text-slate-900">{studentsList.length}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Activated</span>
            <span className="text-lg font-extrabold text-emerald-800">{activeCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">First-Login Due</span>
            <span className="text-lg font-extrabold text-amber-800">{pendingCount}</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll no, or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No students enrolled yet</p>
              <p className="text-[11px] text-slate-400">Enroll students individually or bulk upload a CSV.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isPending = !!student.mustChangePassword;
              const isActive = student.active !== false;
              const rollStr = String(student.rollNo || student.roll || '0').padStart(3, '0');
              const studentLoginId = student.loginId || `RAVS-${assignedClass}-${rollStr}`;

              return (
                <div
                  key={student.uid || student.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs space-y-2.5 ${
                    isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-extrabold text-xs">
                        #{rollStr}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-xs font-bold text-slate-900">{student.name}</h2>
                          {isPending ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[9.5px] font-bold flex items-center gap-0.5">
                              <span>Initial DOB Pass</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9.5px] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Activated</span>
                            </span>
                          )}
                          {!isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9.5px] font-bold">
                              Deactivated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-0.5">
                          <code className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700 font-semibold">
                            {studentLoginId}
                          </code>
                          {student.parentPhone && (
                            <>
                              <span>•</span>
                              <span>Parent: {student.parentPhone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Class {student.classId || assignedClass}
                    </span>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 text-[10.5px]">
                      {student.parentName ? `Parent: ${student.parentName}` : 'No parent linked'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetPassword(student)}
                        title="Reset student password to DOB"
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span>Reset DOB</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(student)}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{isActive ? 'Block' : 'Unblock'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── ENROLL SINGLE STUDENT MODAL ──────────────────────────────────── */}
      {showAddSingleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Enroll Student — Class {assignedClass}</h2>
                  <p className="text-[11px] text-slate-500">Auto-provisions student & parent accounts</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll No
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* DOB formatted as DDMMYYYY */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth (Initial Student Password: DDMMYYYY)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="DDMMYYYY (e.g. 15082012 for 15 Aug 2012)"
                    maxLength={8}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Student logs in with ID <span className="font-mono font-bold">RAVS-{assignedClass}-{rollNo.padStart(3, '0') || '001'}</span> and DOB as initial password.
                </p>
              </div>

              {/* Parent Info */}
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-700" />
                  Parent Account Details (Auto-Created)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-0.5">
                      Parent Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase tracking-wider mb-0.5">
                      Parent Phone (10 digits)
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
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
                    <span>Enrolling Student in Cloud Database...</span>
                  </>
                ) : (
                  <span>Enroll Student & Generate Login Slip</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── BULK CSV MODAL ──────────────────────────────────────────────── */}
      {showBulkCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bulk CSV Student Enrollment</h2>
                  <p className="text-[11px] text-slate-500">Batch upload entire class roster into Firebase</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkCsvModal(false);
                  setParsedRows([]);
                  setCsvErrors([]);
                  setBulkResult(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800">CSV Structure Guide</p>
                <p className="text-[11px] text-slate-500">Columns: <code className="font-mono">name, rollNo, dob, parentName, parentPhone</code></p>
              </div>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample</span>
              </button>
            </div>

            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 text-center cursor-pointer transition-all space-y-1.5"
            >
              <Upload className="w-8 h-8 text-blue-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                {csvFile ? csvFile.name : 'Click to select CSV roster file'}
              </p>
              <p className="text-[11px] text-slate-400">Supports .csv files with up to 100 students per batch</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </div>

            {/* Validation Errors */}
            {csvErrors.length > 0 && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-1 text-xs text-red-700">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> CSV Format Issues:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {csvErrors.slice(0, 4).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {csvErrors.length > 4 && <li>...and {csvErrors.length - 4} more errors</li>}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">
                    Ready to Enroll: <strong className="text-blue-700">{parsedRows.length} Students</strong>
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[10.5px] uppercase text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2">Roll</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">DOB</th>
                        <th className="p-2">Parent Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold">{row.rollNo}</td>
                          <td className="p-2 font-semibold">{row.name}</td>
                          <td className="p-2 font-mono text-slate-500">{row.dob}</td>
                          <td className="p-2 font-mono text-slate-500">{row.parentPhone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteBulkImport}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing Bulk Enrollment in Cloud...</span>
                    </>
                  ) : (
                    <span>Execute Bulk Enrollment ({parsedRows.length} Students)</span>
                  )}
                </button>
              </div>
            )}

            {/* Bulk Result Summary */}
            {bulkResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">Bulk Import Successful!</h3>
                <p className="text-xs text-emerald-700">
                  {bulkResult.successfulCount} students enrolled and provisional accounts initialized.
                </p>
                <button
                  onClick={() => {
                    setShowBulkCsvModal(false);
                    setBulkResult(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  View Updated Roster
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CREDENTIALS SLIP MODAL (Shown Once on Enrollment) ───────────── */}
      {credentialsModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Student Enrolled!</h2>
              <p className="text-xs text-slate-500">
                Institutional credentials generated for student and parent.
              </p>
            </div>

            {/* Student Slip */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex justify-between items-center text-xs pb-1.5 border-b border-blue-200/60">
                <span className="font-bold text-blue-900">🎓 Student Login Slip</span>
                <span className="font-bold text-blue-700">{credentialsModalData.student.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Login ID:</span>
                <code className="font-mono font-bold text-blue-800 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                  {credentialsModalData.student.loginId}
                </code>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Initial Password:</span>
                <code className="font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                  {credentialsModalData.student.initialPassword} (DOB)
                </code>
              </div>
            </div>

            {/* Parent Slip (if created) */}
            {credentialsModalData.parent && (
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-purple-200/60">
                  <span className="font-bold text-purple-900">👨‍👩‍👧 Parent Account Slip</span>
                  <span className="font-bold text-purple-700">{credentialsModalData.parent.name || 'Parent'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Parent Login ID:</span>
                  <code className="font-mono font-bold text-purple-800 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                    {credentialsModalData.parent.loginId}
                  </code>
                </div>
                {credentialsModalData.parent.tempPassword && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Temp Password:</span>
                    <code className="font-mono font-bold text-purple-800 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                      {credentialsModalData.parent.tempPassword}
                    </code>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    `RAVS Smart School — Admission Credentials Slip\nStudent: ${credentialsModalData.student.name}\nClass: ${credentialsModalData.student.classId}\nRoll: ${credentialsModalData.student.rollNo}\nLogin ID: ${credentialsModalData.student.loginId}\nInitial Password: ${credentialsModalData.student.initialPassword}\n\n${
                      credentialsModalData.parent
                        ? `Parent Login ID: ${credentialsModalData.parent.loginId}\nParent Temp Pass: ${credentialsModalData.parent.tempPassword || 'Linked to existing parent account'}\n`
                        : ''
                    }Portal: ravs.school`
                  )
                }
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Slip</span>
              </button>

              <button
                onClick={() => setCredentialsModalData(null)}
                className="flex-1 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESET PASSWORD MODAL ────────────────────────────────────────── */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Password Reset</h2>
              <p className="text-xs text-slate-500 mt-0.5">{resetModalData.name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-500">Reverted to Date of Birth:</span>
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
