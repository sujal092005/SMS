import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS_8A,
  CLASSES_CONFIG,
  INITIAL_ABSENT_FACULTY,
  INITIAL_NOTICES,
  INITIAL_BUSES,
  INITIAL_FACULTY_CHATS,
  INITIAL_CLASS_NOTES,
  INITIAL_CLASS_CHATS,
  INITIAL_TEACHER_ATTENDANCE_LOGS
} from '../mockData/schoolData';
import {
  isFirebaseConnected,
  auth,
  db,
  firebaseSignInWithId,
  bootstrapAdminAccount,
  firebaseSignOut,
  listenToAuthState,
  updateUserAccountPassword,
  createTeacherCallable,
  createStudentCallable,
  createStudentsBulkCallable,
  resetUserPasswordCallable,
  setUserActiveStatusCallable,
  askAIDoubtCallable,
  seedSchoolConfigCallable,
  listenToUserProfile,
  listenToSchoolConfig,
  listenToTeachersList,
  listenToStudentsList,
  listenToClassesList,
  listenToNotices,
  addNoticeToCloud,
  deleteNoticeFromCloud,
  listenToClassNotes,
  syncNotesToCloud,
  listenToFacultyChat,
  sendFacultyChatMessage,
  listenToClassChat,
  sendClassChatToCloud,
  listenToBusLocations,
  updateBusLocationInCloud,
  listenToTeacherAttendance,
  syncAttendanceToCloud,
  submitStudentAttendanceToCloud,
  listenToStudentAttendance,
  uploadFileToCloudStorage,
  getBackendStatus
} from '../services/firebase';
import { askGeminiTutor } from '../services/gemini';

const SchoolContext = createContext();

export function SchoolProvider({ children }) {
  // ─── Authentication & User Session ──────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ravs_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('ravs_active_role') || null;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ─── School Config & Capacity ───────────────────────────────────────────────
  const [schoolConfig, setSchoolConfig] = useState({
    name: 'RAVS Smart School',
    maxUsers: 500,
    currentUserCount: 1
  });

  // ─── Lists & Collections ───────────────────────────────────────────────────
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState(INITIAL_STUDENTS_8A);
  const [classesList, setClassesList] = useState(CLASSES_CONFIG);
  const [selectedClassId, setSelectedClassId] = useState('8A');
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [classNotes, setClassNotes] = useState(INITIAL_CLASS_NOTES);
  const [facultyChats, setFacultyChats] = useState(INITIAL_FACULTY_CHATS);
  const [classChats, setClassChats] = useState(INITIAL_CLASS_CHATS);
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [busCoords, setBusCoords] = useState({});
  const [teacherPunchLogs, setTeacherPunchLogs] = useState(INITIAL_TEACHER_ATTENDANCE_LOGS);
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentEta, setCurrentEta] = useState(12);

  // Gemini AI Chat State
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('ravs_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai_welcome',
      sender: 'assistant',
      text: 'Hello! I am your RAVS AI Study Assistant. Ask me any school syllabus question, science derivation, or math problem!',
      timestamp: 'Just now'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // ─── Firebase Auth State Subscription ─────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConnected) {
      // Fallback for offline mode
      return;
    }

    const unsubAuth = listenToAuthState(async (fbUser) => {
      if (fbUser) {
        try {
          const tokenResult = await fbUser.getIdTokenResult(true);
          const rawRole = tokenResult.claims.role || 'student';
          const classId = tokenResult.claims.classId || '8A';

          // Map claim role to UI activeRole format
          let normalizedRole = 'STUDENT';
          if (rawRole === 'admin') normalizedRole = 'ADMIN';
          else if (rawRole === 'classTeacher' || rawRole === 'subjectTeacher' || rawRole === 'teacher') normalizedRole = 'TEACHER';
          else if (rawRole === 'student') normalizedRole = 'STUDENT';
          else if (rawRole === 'parent') normalizedRole = 'PARENT';
          else if (rawRole === 'driver') normalizedRole = 'DRIVER';

          setActiveRole(normalizedRole);
          localStorage.setItem('ravs_active_role', normalizedRole);

          // Listen to user profile doc
          listenToUserProfile(fbUser.uid, (userDoc) => {
            if (userDoc) {
              const fullProfile = {
                uid: fbUser.uid,
                email: fbUser.email,
                name: userDoc.name || fbUser.displayName || 'User',
                role: rawRole,
                uiRole: normalizedRole,
                classId: userDoc.classId || classId,
                sections: userDoc.sections || (userDoc.classId ? [userDoc.classId] : []),
                loginId: userDoc.loginId,
                active: userDoc.active !== false,
                mustChangePassword: !!userDoc.mustChangePassword
              };
              setCurrentUser(fullProfile);
              setMustChangePassword(!!userDoc.mustChangePassword);
              localStorage.setItem('ravs_current_user', JSON.stringify(fullProfile));
            }
          });
        } catch (err) {
          console.warn('Error fetching token claims:', err);
        }
      } else {
        setCurrentUser(null);
        setActiveRole(null);
        setMustChangePassword(false);
        localStorage.removeItem('ravs_active_role');
        localStorage.removeItem('ravs_current_user');
      }
    });

    return () => unsubAuth();
  }, []);

  // ─── Real-time Firestore Subscriptions ────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConnected) return;

    // School config
    const unsubConfig = listenToSchoolConfig((cfg) => {
      if (cfg) setSchoolConfig(cfg);
    });

    // Teachers list
    const unsubTeachers = listenToTeachersList((teachers) => {
      if (teachers) setTeachersList(teachers);
    });

    // Classes list
    const unsubClasses = listenToClassesList((cls) => {
      if (cls && cls.length > 0) setClassesList(cls);
    });

    // Notices
    const unsubNotices = listenToNotices((items) => {
      if (items) setNotices(items);
    });

    // Buses
    const unsubBuses = listenToBusLocations((coords) => {
      setBusCoords(coords);
    });

    // Student Attendance Records
    const unsubAtt = listenToStudentAttendance((records) => {
      if (records) setAttendanceRecords(records);
    });

    // Teacher Campus Gate Attendance
    const unsubTeacherAtt = listenToTeacherAttendance((logs) => {
      if (logs && logs.length > 0) setTeacherPunchLogs(logs);
    });

    return () => {
      unsubConfig();
      unsubTeachers();
      unsubClasses();
      unsubNotices();
      unsubBuses();
      unsubAtt();
      unsubTeacherAtt();
    };
  }, []);

  // Subscribe to students list based on active class
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const targetClass = currentUser?.classId || selectedClassId || '10A';
    const unsubStudents = listenToStudentsList(currentUser?.role === 'admin' ? 'ALL' : targetClass, (list) => {
      if (list) setStudentsList(list);
    });
    return () => unsubStudents();
  }, [currentUser?.classId, currentUser?.role, selectedClassId]);

  // Subscribe to class notes
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const targetClass = currentUser?.classId || selectedClassId || '10A';
    const unsubNotes = listenToClassNotes(targetClass, (notes) => {
      if (notes) setClassNotes(notes);
    });
    return () => unsubNotes();
  }, [currentUser?.classId, selectedClassId]);

  // Subscribe to faculty chat
  useEffect(() => {
    if (!isFirebaseConnected) return;
    if (activeRole === 'ADMIN' || activeRole === 'TEACHER') {
      const unsubFaculty = listenToFacultyChat('general', (msgs) => {
        if (msgs) {
          const formatted = msgs.map(m => ({
            id: m.id || `f_${Date.now()}_${Math.random()}`,
            sender: m.sender || 'Faculty Member',
            senderRole: m.senderRole || 'Teacher',
            senderUid: m.senderUid,
            message: m.message || m.text || '',
            text: m.text || m.message || '',
            time: m.time || 'Just now',
            avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            isSelf: m.senderUid === currentUser?.uid || (currentUser && m.sender?.includes(currentUser.name))
          }));
          setFacultyChats(formatted);
        }
      });
      return () => unsubFaculty();
    }
  }, [activeRole, currentUser]);

  // Subscribe to class chat
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const targetClass = currentUser?.classId || selectedClassId || '8A';
    const unsubClassChat = listenToClassChat(targetClass, (msgs) => {
      if (msgs) {
        const formatted = msgs.map(m => ({
          id: m.id || `c_${Date.now()}_${Math.random()}`,
          sender: m.sender || 'Class Member',
          senderRole: m.senderRole || 'Student',
          senderUid: m.senderUid,
          message: m.message || m.text || '',
          text: m.text || m.message || '',
          time: m.time || 'Just now',
          role: m.role || (m.isTeacher ? 'TEACHER' : 'STUDENT'),
          badge: m.badge || (m.role === 'TEACHER' || m.isTeacher ? 'Teacher Reply' : 'Student')
        }));
        setClassChats(prev => ({
          ...(typeof prev === 'object' && !Array.isArray(prev) ? prev : {}),
          [targetClass]: formatted
        }));
      }
    });
    return () => unsubClassChat();
  }, [currentUser?.classId, selectedClassId]);

  // ─── Auth Handlers ────────────────────────────────────────────────────────
  const loginAsRole = (roleId, customData = {}) => {
    const normalized = (roleId || 'admin').toLowerCase();
    const profile = INITIAL_USERS[normalized] || INITIAL_USERS.admin;
    const uiRole = profile.role || 'ADMIN';

    setActiveRole(uiRole);
    setCurrentUser({ ...profile, ...customData });
    setMustChangePassword(false);
    localStorage.setItem('ravs_active_role', uiRole);
    localStorage.setItem('ravs_current_user', JSON.stringify({ ...profile, ...customData }));
    addToast(`Signed in as ${profile.name} (${uiRole})`, 'success');
  };

  const loginWithId = async (loginId, password) => {
    setAuthLoading(true);
    const res = await firebaseSignInWithId(loginId, password);
    setAuthLoading(false);
    if (res.success) {
      // If we got userData from Firestore lookup (no Firebase Auth user), set state directly
      if (res.userData && !res.user) {
        const profile = res.userData;
        const uiRole = profile.uiRole || 'STUDENT';
        setActiveRole(uiRole);
        setCurrentUser(profile);
        setMustChangePassword(!!profile.mustChangePassword);
        localStorage.setItem('ravs_active_role', uiRole);
        localStorage.setItem('ravs_current_user', JSON.stringify(profile));
      }
      addToast(`Welcome back, ${res.userData?.name || 'User'}!`, 'success');
    }
    return res;
  };

  const bootstrapAdmin = async (loginId = 'ADMIN-0924', password = 'Admin@12345') => {
    setAuthLoading(true);
    const res = await bootstrapAdminAccount(loginId, password);
    setAuthLoading(false);
    if (res.success) {
      addToast(`Institutional Administrator initialized & signed in!`, 'success');
    }
    return res;
  };

  const logout = async () => {
    await firebaseSignOut();
    setCurrentUser(null);
    setActiveRole(null);
    setMustChangePassword(false);
    localStorage.removeItem('ravs_active_role');
    localStorage.removeItem('ravs_current_user');
    addToast('Signed out successfully.', 'info');
  };

  const changePassword = async (newPassword) => {
    const res = await updateUserAccountPassword(newPassword, currentUser);
    if (res.success) {
      setMustChangePassword(false);
    }
    return res;
  };

  // ─── Account Creation & Management ────────────────────────────────────────
  const addTeacher = async (teacherData) => {
    setAuthLoading(true);
    try {
      if (!db) throw new Error('Database not connected.');
      const docId = `tch_${Date.now()}`;
      const nameSlug = (teacherData.name || 'FACULTY').trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const loginId = `TCH-${nameSlug}${Math.floor(100 + Math.random() * 900)}`;
      // Password = phone number, fallback to default
      const tempPassword = (teacherData.phone && teacherData.phone.trim() !== '') ? teacherData.phone.trim() : '1234567890';
      const assignedClass = teacherData.type === 'classTeacher' ? teacherData.classId : null;

      // Shared doc fields (camelCase + snake_case for full compatibility)
      const teacherDoc = {
        uid: docId,
        loginId,
        login_id: loginId,
        email: `${loginId.toLowerCase()}@ravs.school`,
        name: teacherData.name,
        phone: teacherData.phone || '',
        subject: teacherData.subject || teacherData.department || '',
        role: teacherData.type || 'classTeacher',
        classId: assignedClass,
        sections: teacherData.type === 'subjectTeacher' ? teacherData.sections : (assignedClass ? [assignedClass] : []),
        department: teacherData.department || 'Academic',
        active: true,
        mustChangePassword: true,
        password: tempPassword,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 1. Flat teachers collection — used for login lookup
      await setDoc(doc(db, 'teachers', docId), teacherDoc);
      // 2. Flat users collection — backward compat
      await setDoc(doc(db, 'users', docId), teacherDoc);

      // 3. New: classes/{classId}/class_teacher/{docId}
      if (assignedClass) {
        await setDoc(doc(db, 'classes', assignedClass, 'class_teacher', docId), teacherDoc);
        // Update class root doc with teacher info
        await setDoc(doc(db, 'classes', assignedClass), {
          classId: assignedClass,
          classTeacherUid: docId,
          classTeacherName: teacherData.name,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      setAuthLoading(false);
      addToast(`✅ Teacher ${teacherData.name} added! Credentials ready.`, 'success');
      return {
        success: true,
        teacher: { uid: docId, loginId, name: teacherData.name, role: teacherData.type || 'classTeacher', tempPassword }
      };
    } catch (err) {
      console.error('addTeacher error:', err);
      setAuthLoading(false);
      addToast('Failed to add teacher: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const addStudent = async (studentData) => {
    setAuthLoading(true);
    try {
      if (!db) throw new Error('Database not connected.');
      const cleanRoll = String(studentData.rollNo || '001').trim().padStart(3, '0');
      const cleanClass = (studentData.classId || '8A').trim().toUpperCase();
      const loginId = `RAVS-${cleanClass}-${cleanRoll}`;  // used as document ID
      const password = studentData.dob || '15082012';
      const parentNumber = (studentData.parentPhone || '').trim();

      // Strict schema fields as requested
      const studentDoc = {
        name: studentData.name,
        login_id: loginId,
        password,
        parent_name: studentData.parentName || '',
        parent_number: parentNumber,
        rollNo: cleanRoll,
        classId: cleanClass,
        active: true,
        mustChangePassword: false,
        createdAt: serverTimestamp()
      };

      // 1. PRIMARY: classes/{cleanClass}/class_student/{loginId}  (doc ID = loginId)
      await setDoc(doc(db, 'classes', cleanClass, 'class_student', loginId), studentDoc);

      // 2. COMPAT: flat students/{loginId}  (kept so admin ALL-class view works)
      await setDoc(doc(db, 'students', loginId), studentDoc);

      setAuthLoading(false);
      addToast(`✅ Student ${studentData.name} enrolled in Class ${cleanClass}!`, 'success');
      return {
        success: true,
        student: { id: loginId, name: studentData.name, rollNo: cleanRoll, classId: cleanClass, loginId, initialPassword: password },
        parent: parentNumber ? { loginId: `PAR-${parentNumber.slice(-10)}`, name: studentData.parentName || 'Parent', tempPassword: parentNumber } : null
      };
    } catch (err) {
      console.error('addStudent error:', err);
      setAuthLoading(false);
      addToast('Failed to enroll student: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const addStudentsBulk = async (classId, students) => {
    setAuthLoading(true);
    try {
      if (!db) throw new Error('Database not connected.');
      const results = [];
      for (const s of students) {
        const cleanRoll = String(s.rollNo || '001').trim().padStart(3, '0');
        const loginId = `RAVS-${classId}-${cleanRoll}`;
        const password = String(s.dob || '15082012').replace(/[^0-9]/g, '');
        const parentNumber = (s.parentPhone || '').trim();

        const studentDoc = {
          name: s.name,
          login_id: loginId,
          password,
          parent_name: s.parentName || '',
          parent_number: parentNumber,
          rollNo: cleanRoll,
          classId,
          active: true,
          mustChangePassword: false,
          createdAt: serverTimestamp()
        };

        // 1. Primary: class_student subcollection (doc ID = loginId)
        await setDoc(doc(db, 'classes', classId, 'class_student', loginId), studentDoc);
        // 2. Compat: flat students collection
        await setDoc(doc(db, 'students', loginId), studentDoc);

        results.push({ name: s.name, rollNo: cleanRoll, classId, loginId, initialPassword: password });
      }

      setAuthLoading(false);
      addToast(`✅ Bulk enrollment complete: ${results.length} students added!`, 'success');
      return { success: true, successfulCount: results.length, failedCount: 0, results };
    } catch (err) {
      console.error('addStudentsBulk error:', err);
      setAuthLoading(false);
      addToast('Bulk enrollment failed: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (targetUid) => {
    const res = await resetUserPasswordCallable(targetUid);
    if (res.success) {
      addToast(`Password reset successfully for ${res.name}!`, 'success');
    } else {
      addToast(res.error || 'Failed to reset password', 'error');
    }
    return res;
  };

  const setUserActive = async (targetUid, active) => {
    const res = await setUserActiveStatusCallable(targetUid, active);
    if (res.success) {
      addToast(`Account status updated to ${active ? 'Active' : 'Deactivated'}.`, 'info');
    } else {
      addToast(res.error || 'Failed to update account status', 'error');
    }
    return res;
  };

  // ─── Other Feature Handlers ───────────────────────────────────────────────
  const addNotice = async (noticeData) => {
    const newNotice = {
      ...noticeData,
      author: currentUser?.name || 'Administrator',
      authorRole: currentUser?.role || 'Admin',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const res = await addNoticeToCloud(newNotice);
    if (res?.success) {
      addToast('Notice published to campus network!', 'success');
    }
    return res;
  };

  const deleteNotice = async (noticeId) => {
    await deleteNoticeFromCloud(noticeId);
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    addToast('Notice deleted.', 'info');
  };

  const uploadClassNote = async (noteData) => {
    const newNote = {
      id: `cn_${Date.now()}`,
      ...noteData,
      teacher: currentUser?.name || noteData.teacherName || 'Faculty',
      teacherName: currentUser?.name || noteData.teacherName || 'Faculty',
      teacherId: currentUser?.uid || 'tch',
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      createdAt: new Date().toISOString()
    };

    // Optimistic local update - always succeeds immediately
    setClassNotes((prev) => [newNote, ...prev]);

    // Asynchronously sync to cloud without blocking UI
    try {
      const result = await syncNotesToCloud(newNote);
      if (result?.success) {
        console.log('Note synced to cloud:', result.id);
      } else {
        console.warn('Note saved locally only:', result?.error || 'Cloud sync unavailable');
      }
    } catch (e) {
      console.warn('Non-blocking note sync error:', e.message);
    }

    return { success: true, id: newNote.id };
  };

  const sendFacultyMessage = async (messageText) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = {
      id: `f_${Date.now()}`,
      sender: currentUser?.name || 'Faculty Member',
      senderRole: currentUser?.role || 'Teacher',
      senderUid: currentUser?.uid || 'user',
      text: messageText,
      message: messageText,
      time: timeStr,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isSelf: true
    };
    setFacultyChats((prev) => [...prev, message]);
    await sendFacultyChatMessage('general', message);
  };

  const sendClassMessage = async (classId, messageText, isTeacher = false, badge = '') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetClass = classId || currentUser?.classId || '8A';
    const message = {
      id: `c_${Date.now()}`,
      sender: currentUser?.name || (isTeacher ? 'Class Teacher' : 'Student'),
      senderRole: currentUser?.role || (isTeacher ? 'Teacher' : 'Student'),
      senderUid: currentUser?.uid || 'user',
      text: messageText,
      message: messageText,
      time: timeStr,
      role: isTeacher ? 'TEACHER' : 'STUDENT',
      badge: badge || (isTeacher ? 'Teacher Announcement' : 'Student Doubt')
    };

    setClassChats((prev) => {
      const currentList = (typeof prev === 'object' && !Array.isArray(prev) && Array.isArray(prev[targetClass])) ? prev[targetClass] : [];
      return {
        ...(typeof prev === 'object' && !Array.isArray(prev) ? prev : {}),
        [targetClass]: [...currentList, message]
      };
    });

    await sendClassChatToCloud(targetClass, message);
  };

  const submitAttendance = async (classId, students, photoUrl = null) => {
    const res = await submitStudentAttendanceToCloud(classId, students, currentUser?.uid, photoUrl);

    // Update local attendanceRecords state immediately for Admin & Teacher visibility
    const newRecord = {
      id: res?.id || `att_${classId}_${Date.now()}`,
      classId,
      students,
      teacherId: currentUser?.uid || 'tch',
      photoUrl: photoUrl || null,
      date: new Date().toLocaleDateString('en-IN'),
      submittedAt: new Date().toISOString()
    };

    setAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.classId !== classId)]);

    // Update studentsList in state to reflect the latest status
    setStudentsList((prev) =>
      prev.map((s) => {
        const matchingSubmitted = students.find((st) => (st.id || st.uid) === (s.uid || s.id));
        if (matchingSubmitted) {
          return { ...s, status: matchingSubmitted.status.toLowerCase() };
        }
        return s;
      })
    );

    addToast(`Attendance submitted for Class ${classId}!`, 'success');
    return res;
  };

  const todayLog = (teacherPunchLogs || []).find(
    (l) => (l.teacherId === currentUser?.uid || l.loginId === currentUser?.loginId || l.teacherName === currentUser?.name)
  ) || (teacherPunchLogs || [])[0];

  const todayTeacherCheckIn = {
    checkedIn: !!todayLog,
    time: todayLog?.checkInTime || todayLog?.time || '07:45 AM',
    gate: todayLog?.gate || 'Main Campus Gate A (North)'
  };

  const campusGateQR = {
    gateName: 'Main Campus Gate A (North)',
    securityOfficer: 'Inspector R. S. Verma',
    token: 'GATE_NORTH_SECURE_TOKEN_2026'
  };

  const logTeacherGateCheckIn = async (details = {}) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-IN');
    const newLog = {
      id: `tch_att_${Date.now()}`,
      teacherId: currentUser?.uid || currentUser?.loginId || 'EMP-T482',
      loginId: currentUser?.loginId || 'EMP-T482',
      teacherName: currentUser?.name || 'Faculty Member',
      date: dateStr,
      checkInTime: timeStr,
      time: timeStr,
      gate: details.gate || 'Main Campus Gate A (North)',
      shift: details.shift || 'Morning Shift',
      assignedWing: details.assignedWing || 'Academic Block 2',
      temperature: details.temperature || '98.4°F',
      remarks: details.remarks || 'Automated campus QR scan verified upon entry.',
      status: 'VERIFIED'
    };

    setTeacherPunchLogs((prev) => [newLog, ...(prev || [])]);
    const res = await syncAttendanceToCloud(newLog);
    if (res?.success) {
      addToast(`Attendance Verified! Welcome ${currentUser?.name || 'Teacher'}`, 'success');
    }
    return res || { success: true };
  };

  const startTrip = async (busId = 'BUS-01', driverDetails = {}) => {
    setIsTripActive(true);
    setCurrentSpeed(28);
    setCurrentEta(12);
    setBuses((prev) =>
      (prev || []).map((b) =>
        b.id === busId
          ? { ...b, status: 'ON_ROUTE', driverName: driverDetails.driverName || b.driverName, driverPhone: driverDetails.driverPhone || b.driverPhone }
          : b
      )
    );
    addToast(`🚌 Bus Journey Started for ${busId}! GPS tracking active.`, 'success');
  };

  const stopTrip = async (busId = 'BUS-01') => {
    setIsTripActive(false);
    setCurrentSpeed(0);
    setBuses((prev) =>
      (prev || []).map((b) => (b.id === busId ? { ...b, status: 'STANDBY' } : b))
    );
    addToast('🛑 Bus Journey Ended. Status updated to Standby.', 'info');
  };

  const updateBusCoords = async (busId, coords, driverInfo = {}) => {
    if (driverInfo.speed !== undefined) {
      setCurrentSpeed(driverInfo.speed);
    }
    setBusCoords((prev) => ({
      ...prev,
      [busId]: {
        lat: coords.lat,
        lng: coords.lng,
        speed: driverInfo.speed || 28,
        ...driverInfo,
        updatedAt: Date.now()
      }
    }));
    await updateBusLocationInCloud(busId, coords, driverInfo);
  };

  // AI Doubt Tutor (Calls Server-Side Cloud Function with Groq/Llama or Gemini & FAQ Fallback)
  const askAiAssistant = async (questionText, subject = 'General Academic') => {
    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const classId = currentUser?.classId || '8A';
      const result = await askAIDoubtCallable(questionText, classId, subject);

      let replyData = null;
      if (result?.success && result.answer) {
        replyData = { text: result.answer, title: `Academic Guide (${subject})`, isGeminiLive: true };
      } else {
        replyData = await askGeminiTutor(questionText, geminiApiKey);
      }

      const botText = typeof replyData === 'string'
        ? replyData
        : (replyData?.text || replyData?.title || 'Academic guide generated.');

      const botMsg = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: botText,
        title: typeof replyData === 'object' ? replyData?.title : null,
        steps: typeof replyData === 'object' ? replyData?.steps : null,
        examTip: typeof replyData === 'object' ? replyData?.examTip : null,
        isGeminiLive: typeof replyData === 'object' ? !!replyData?.isGeminiLive : false,
        modelUsed: typeof replyData === 'object' ? replyData?.modelUsed : null,
        aiData: typeof replyData === 'object' ? replyData : null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('AI Assistant error:', err);
      const fallbackData = await askGeminiTutor(questionText, geminiApiKey);
      const botText = typeof fallbackData === 'string'
        ? fallbackData
        : (fallbackData?.text || 'Guide generated.');
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: botText,
          title: typeof fallbackData === 'object' ? fallbackData?.title : null,
          steps: typeof fallbackData === 'object' ? fallbackData?.steps : null,
          examTip: typeof fallbackData === 'object' ? fallbackData?.examTip : null,
          isGeminiLive: typeof fallbackData === 'object' ? !!fallbackData?.isGeminiLive : false,
          modelUsed: typeof fallbackData === 'object' ? fallbackData?.modelUsed : null,
          aiData: typeof fallbackData === 'object' ? fallbackData : null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const getClassAttendance = (classId) => {
    const classSts = studentsList.filter((s) => s.classId === classId);
    if (classSts.length === 0) {
      return { classId, total: 0, present: 0, absent: 0, late: 0, rate: 100, isSubmitted: false, students: [] };
    }

    const latestRecord = attendanceRecords.find((r) => r.classId === classId);
    let present = 0;
    let absent = 0;
    let late = 0;

    if (latestRecord && Array.isArray(latestRecord.students)) {
      latestRecord.students.forEach((s) => {
        const st = (s.status || '').toUpperCase();
        if (st === 'ABSENT') absent++;
        else if (st === 'LATE') late++;
        else present++;
      });
    } else {
      classSts.forEach((s) => {
        const st = (s.status || '').toUpperCase();
        if (st === 'ABSENT') absent++;
        else if (st === 'LATE') late++;
        else present++;
      });
    }

    const total = classSts.length;
    const rate = Math.round((present / total) * 100);

    return {
      classId,
      total,
      present,
      absent,
      late,
      rate,
      isSubmitted: !!latestRecord,
      submittedAt: latestRecord?.date || null,
      photoUrl: latestRecord?.photoUrl || null,
      students: latestRecord?.students || classSts
    };
  };

  const calculateTotalAttendance = () => {
    if (studentsList.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, rate: 100 };
    }

    let totPresent = 0;
    let totAbsent = 0;
    let totLate = 0;

    classesList.forEach((c) => {
      const cId = c.id || c.classId;
      const cStats = getClassAttendance(cId);
      totPresent += cStats.present;
      totAbsent += cStats.absent;
      totLate += cStats.late;
    });

    const tot = studentsList.length;
    return {
      total: tot,
      present: totPresent,
      absent: totAbsent,
      late: totLate,
      rate: Math.round((totPresent / tot) * 100)
    };
  };

  const attendanceStats = calculateTotalAttendance();

  return (
    <SchoolContext.Provider
      value={{
        // Auth & User
        currentUser,
        activeRole,
        authLoading,
        mustChangePassword,
        loginAsRole,
        loginWithId,
        bootstrapAdmin,
        logout,
        changePassword,
        toasts,
        addToast,

        // Capacity & Config
        schoolConfig,

        // Management API
        teachersList,
        studentsList,
        classesList,
        selectedClassId,
        setSelectedClassId,
        addTeacher,
        addStudent,
        addStudentsBulk,
        resetPassword,
        setUserActive,

        // Core Modules
        notices,
        addNotice,
        deleteNotice,
        classNotes,
        uploadClassNote,
        facultyChats,
        sendFacultyMessage,
        sendFacultyChat: sendFacultyMessage, // alias for AdminChat & TeacherFacultyChat
        classChats,
        sendClassMessage,
        sendClassTeacherMessage: sendClassMessage, // alias for TeacherClassHub
        submitAttendance,
        attendanceStats,
        attendanceRecords,
        getClassAttendance,
        teacherPunchLogs,
        todayTeacherCheckIn,
        logTeacherGateCheckIn,
        campusGateQR,
        buses,
        busCoords,
        isTripActive,
        currentSpeed,
        currentEta,
        startTrip,
        stopTrip,
        updateBusCoords,
        uploadFileToCloudStorage,

        // AI Assistant
        aiMessages,
        isAiThinking,
        askAiAssistant,
        askAIDoubt: askAiAssistant, // alias for AIDoubtAssistant
        geminiApiKey,
        setGeminiApiKey,
        updateGeminiApiKey: setGeminiApiKey, // alias for AIDoubtAssistant
        isFirebaseConnected
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error('useSchool must be used within a SchoolProvider');
  return ctx;
}
