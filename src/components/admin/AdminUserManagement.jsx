import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useTranslation } from 'react-i18next';
import { 
  CLASSES_CONFIG 
} from '../../mockData/schoolData';
import { 
  bulkImportStudentsToCloud, 
  bulkImportTeachersToCloud 
} from '../../services/firebase';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  GraduationCap, 
  Database, 
  Search, 
  Plus, 
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function AdminUserManagement({ onBack }) {
  const { roster, classesConfig, activeClassId, setActiveClassId } = useSchool();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' | 'roster' | 'teachers'
  const [selectedClassId, setSelectedClassId] = useState(activeClassId || '10A');
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Single User State
  const [newStudent, setNewStudent] = useState({ roll: '', name: '', busId: 'BUS-01' });

  // Generate Sample CSV Template for Download
  const downloadSampleCSV = () => {
    const csvContent = 
`RollNumber,FullName,BusID,Status,ParentPhone
10A-01,Aarav Sharma,BUS-01,PRESENT,+919876543210
10A-02,Ananya Patel,BUS-02,PRESENT,+919876543211
10A-03,Devansh Gupta,BUS-01,ABSENT,+919876543212
10A-04,Ishita Verma,BUS-03,PRESENT,+919876543213
10A-05,Kavya Nair,BUS-01,PRESENT,+919876543214`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_students_${selectedClassId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  // Execute Bulk Import to Firestore & Context
  const handleExecuteImport = async () => {
    if (!csvText.trim()) {
      setImportStatus({ type: 'error', message: 'Please upload or paste CSV data first.' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const lines = csvText.split('\n').filter(l => l.trim().length > 0);
      const parsedStudents = [];

      // Skip header row if exists
      const startIndex = lines[0].toLowerCase().includes('roll') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          const roll = cols[0];
          const name = cols[1];
          const busId = cols[2] || 'BUS-01';
          const status = cols[3] || 'PRESENT';
          const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          parsedStudents.push({
            id: `st_${selectedClassId}_${roll.replace(/[^a-zA-Z0-9]/g, '')}`,
            roll,
            name,
            status,
            busId,
            avatarInitials: initials,
            classId: selectedClassId
          });
        }
      }

      if (parsedStudents.length === 0) {
        throw new Error('No valid student rows found in CSV.');
      }

      // Sync to Firebase Isolated Collection
      const result = await bulkImportStudentsToCloud(selectedClassId, parsedStudents);

      setImportStatus({
        type: 'success',
        message: `Successfully imported ${parsedStudents.length} students into ${selectedClassId} database!`
      });
      setCsvText('');
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message || 'Import failed.' });
    } finally {
      setIsImporting(false);
    }
  };

  // Filter current class roster
  const currentRoster = roster[selectedClassId] || [];
  const filteredRoster = currentRoster.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-[#1E3A8A] text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-300" />
              <span>User & Roster Database</span>
            </h1>
            <p className="text-[11px] text-blue-200">
              Isolated Class Storage • 500+ Student Batch Importer
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-blue-950/50 p-1 rounded-xl mt-3 border border-blue-800">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bulk' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'roster' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Class Rosters ({currentRoster.length})</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full flex-1">
        {/* Class Selection Selector Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Target Class:</span>
          </div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {CLASSES_CONFIG.map(c => (
              <option key={c.id} value={c.id}>{c.label} ({c.strength} Students)</option>
            ))}
          </select>
        </div>

        {/* TAB 1: BULK CSV IMPORT */}
        {activeTab === 'bulk' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* CSV Template Download Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Download CSV Template</span>
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Formatted for 500+ bulk student records.
                </p>
              </div>
              <button
                onClick={downloadSampleCSV}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* File Upload / Drag Drop */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload CSV / Excel Text File
              </label>

              <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-2xl p-5 text-center transition-all relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Click or drag CSV file here to auto-fill
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports .csv and text exports from school ERPs
                </p>
              </div>

              {/* Paste or Edit Raw CSV Text */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Raw CSV Preview / Editor
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`RollNumber,FullName,BusID,Status\n10A-01,Aarav Sharma,BUS-01,PRESENT\n10A-02,Ananya Patel,BUS-02,PRESENT`}
                  className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Status Banner */}
              {importStatus && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                  importStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}>
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleExecuteImport}
                disabled={isImporting || !csvText.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md hover:from-blue-800 hover:to-indigo-900 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Writing Batch to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload to Class {selectedClassId} Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS ROSTER EXPLORER */}
        {activeTab === 'roster' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search Class ${selectedClassId} roster...`}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Roster List */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {filteredRoster.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No students found in Class {selectedClassId} database. Use the Bulk Import tab to upload records!
                </div>
              ) : (
                filteredRoster.map((st) => (
                  <div key={st.id || st.roll} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                        {st.avatarInitials || st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{st.name}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                            {st.roll}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Bus: {st.busId || 'BUS-01'} • Grade: {selectedClassId}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {st.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
