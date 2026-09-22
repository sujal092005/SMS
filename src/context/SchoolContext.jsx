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

    return () => {
      unsubConfig();
      unsubTeachers();
      unsubClasses();
      unsubNotices();
      unsubBuses();
      unsubAtt();
    };
  }, []);

  // Subscribe to students list based on active class
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const targetClass = currentUser?.classId || selectedClassId || '8A';
    const unsubStudents = listenToStudentsList(currentUser?.role === 'admin' ? 'ALL' : targetClass, (list) => {
      if (list) setStudentsList(list);
    });
    return () => unsubStudents();
  }, [currentUser?.classId, currentUser?.role, selectedClassId]);

  // Subscribe to class notes
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const targetClass = currentUser?.classId || selectedClassId || '8A';
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
    // Write directly to Firestore (Cloud Functions not required)
    try {
      if (!db) throw new Error('Database not connected.');
      const docId = `tch_${Date.now()}`;
      const nameSlug = (teacherData.name || 'FACULTY').trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const loginId = `TCH-${nameSlug}${Math.floor(100 + Math.random() * 900)}`;
      // Use phone number as the password, fallback to a default if not provided
      const tempPassword = (teacherData.phone && teacherData.phone.trim() !== '') ? teacherData.phone.trim() : '1234567890';

      const teacherDoc = {
        uid: docId,
        loginId,
        email: `${loginId.toLowerCase()}@ravs.school`,
        name: teacherData.name,
        phone: teacherData.phone || '',
        role: teacherData.type || 'classTeacher',
        classId: teacherData.type === 'classTeacher' ? teacherData.classId : null,
        sections: teacherData.type === 'subjectTeacher' ? teacherData.sections : [teacherData.classId],
        department: teacherData.department || 'Academic',
        active: true,
        mustChangePassword: true,
        password: tempPassword, // stored for Firestore-based login
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', docId), teacherDoc);

      if (teacherData.type === 'classTeacher' && teacherData.classId) {
        await setDoc(doc(db, 'classes', teacherData.classId), {
          classId: teacherData.classId,
          classTeacherUid: docId,
          classTeacherName: teacherData.name,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      const res = {
        success: true,
        teacher: {
          uid: docId,
          loginId,
          email: `${loginId.toLowerCase()}@ravs.school`,
          name: teacherData.name,
          role: teacherData.type || 'classTeacher',
          tempPassword
        }
      };

      setAuthLoading(false);
      addToast(`✅ Teacher ${teacherData.name} added! Credentials ready.`, 'success');
      return res;
    } catch (err) {
      console.error('addTeacher error:', err);
      setAuthLoading(false);
      addToast('Failed to add teacher: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const addStudent = async (studentData) => {
    setAuthLoading(true);
    // Write directly to Firestore (Cloud Functions not required)
    try {
      if (!db) throw new Error('Database not connected.');
      const docId = `st_${Date.now()}`;
      const cleanRoll = String(studentData.rollNo || '001').trim().padStart(3, '0');
      const cleanClass = (studentData.classId || '8A').trim().toUpperCase();
      const studentLoginId = `RAVS-${cleanClass}-${cleanRoll}`;
      const studentInitialPassword = studentData.dob || '15082012';

      // 1. Write students/{id}
      await setDoc(doc(db, 'students', docId), {
        id: docId,
        uid: docId,
        name: studentData.name,
        rollNo: cleanRoll,
        classId: cleanClass,
        loginId: studentLoginId,
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
        dob: studentInitialPassword,
        active: true,
        mustChangePassword: false,
        createdAt: serverTimestamp()
      });

      // 2. Write studentPrivate/{id}
      await setDoc(doc(db, 'studentPrivate', docId), {
        studentId: docId,
        uid: docId,
        classId: cleanClass,
        dob: studentInitialPassword,
        parentPhone: studentData.parentPhone || '',
        createdAt: serverTimestamp()
      });

      const res = {
        success: true,
        student: {
          id: docId,
          name: studentData.name,
          rollNo: cleanRoll,
          classId: cleanClass,
          loginId: studentLoginId,
          initialPassword: studentInitialPassword
        },
        parent: studentData.parentPhone ? {
          loginId: `PAR-${studentData.parentPhone.slice(-10)}`,
          name: studentData.parentName || 'Parent',
          tempPassword: studentData.parentPhone
        } : null
      };

      setAuthLoading(false);
      addToast(`✅ Student ${studentData.name} enrolled in Class ${cleanClass}!`, 'success');
      return res;
    } catch (err) {
      console.error('addStudent error:', err);
      setAuthLoading(false);
      addToast('Failed to enroll student: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const addStudentsBulk = async (classId, students) => {
    setAuthLoading(true);
    // Write directly to Firestore (Cloud Functions not required)
    try {
      if (!db) throw new Error('Database not connected.');
      const results = [];
      for (const s of students) {
        const docId = `st_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const cleanRoll = String(s.rollNo || '001').trim().padStart(3, '0');
        const studentLoginId = `RAVS-${classId}-${cleanRoll}`;
        const cleanDob = String(s.dob || '15082012').replace(/[^0-9]/g, '');

        await setDoc(doc(db, 'students', docId), {
          id: docId,
          uid: docId,
          name: s.name,
          rollNo: cleanRoll,
          classId: classId,
          loginId: studentLoginId,
          dob: cleanDob,
          parentName: s.parentName || '',
          parentPhone: s.parentPhone || '',
          active: true,
          mustChangePassword: false,
          createdAt: serverTimestamp()
        });

        results.push({
          name: s.name,
          rollNo: cleanRoll,
          classId,
          loginId: studentLoginId,
          initialPassword: cleanDob
        });
      }

      const res = {
        success: true,
        successfulCount: results.length,
        failedCount: 0,
        results
      };

      setAuthLoading(false);
      addToast(`✅ Bulk enrollment complete: ${results.length} students added!`, 'success');
      return res;
    } catch (err) {
      console.error('addStudentsBulk error:', err);
      setAuthLoading(false);
      addToast('Bulk enrollment failed: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
    return res;
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
    setClassNotes((prev) => [newNote, ...prev]);
    const res = await syncNotesToCloud(newNote);
    if (res?.success) {
      addToast('Class notes uploaded to student hub!', 'success');
    }
    return res;
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
    if (res?.success) {
      addToast(`Attendance submitted for Class ${classId}!`, 'success');
    }
    return res;
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
        replyData = { text: result.answer };
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
        buses,
        busCoords,
        isTripActive,
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
