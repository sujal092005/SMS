import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS_8A,
  INITIAL_MULTI_CLASS_ROSTER,
  CLASSES_CONFIG,
  INITIAL_ABSENT_FACULTY,
  INITIAL_NOTICES,
  INITIAL_BUSES,
  INITIAL_FACULTY_CHATS,
  INITIAL_CLASS_NOTES,
  INITIAL_CLASS_CHATS,
  INITIAL_TEACHER_ATTENDANCE_LOGS,
  PRESET_AI_KNOWLEDGE
} from '../mockData/schoolData';
import { 
  syncAttendanceToCloud, 
  syncNotesToCloud, 
  sendFacultyChatMessage,
  addNoticeToCloud,
  listenToNotices,
  listenToClassNotes,
  listenToFacultyChat,
  listenToClassChat,
  listenToBusLocations,
  listenToTeacherAttendance,
  submitStudentAttendanceToCloud,
  sendClassChatToCloud,
  updateBusLocationInCloud,
  deleteNoticeFromCloud,
  getBackendStatus,
  isFirebaseConnected
} from '../services/firebase';
import { askGeminiTutor } from '../services/gemini';

const SchoolContext = createContext();

export function SchoolProvider({ children }) {
  // Session / Authentication state
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('ravs_active_role') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ravs_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const role = localStorage.getItem('ravs_active_role');
    return role ? INITIAL_USERS[role.toLowerCase()] || null : null;
  });

  // Students & Student Attendance
  const [students8A, setStudents8A] = useState(() => {
    const saved = localStorage.getItem('ravs_students_8a');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_8A;
  });

  const [absentFaculty, setAbsentFaculty] = useState(() => {
    const saved = localStorage.getItem('ravs_absent_faculty');
    return saved ? JSON.parse(saved) : INITIAL_ABSENT_FACULTY;
  });

  const [attendanceSubmittedTime, setAttendanceSubmittedTime] = useState(() => {
    return localStorage.getItem('ravs_attendance_sync_time') || '08:20 AM Today';
  });

  // Teacher / Faculty Campus Entry & QR Punch-In Attendance
  const [teacherPunchLogs, setTeacherPunchLogs] = useState(() => {
    const saved = localStorage.getItem('ravs_teacher_punch_logs');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ATTENDANCE_LOGS;
  });

  const [todayTeacherCheckIn, setTodayTeacherCheckIn] = useState(() => {
    const saved = localStorage.getItem('ravs_today_teacher_checkin');
    return saved ? JSON.parse(saved) : {
      checkedIn: true,
      time: '07:42 AM',
      gate: 'Main Campus Gate A (North)',
      shift: 'Morning Shift (07:45 AM - 02:30 PM)',
      assignedWing: 'Academic Block 2 • Room 204',
      status: 'ON_TIME',
      temperature: '98.4°F'
    };
  });

  // Notices
  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('ravs_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // Buses & Fleet Telemetry
  const [buses, setBuses] = useState(() => {
    const saved = localStorage.getItem('ravs_buses');
    return saved ? JSON.parse(saved) : INITIAL_BUSES;
  });

  const [isTripActive, setIsTripActive] = useState(false);

  const [driverGPSStatus, setDriverGPSStatus] = useState('STANDBY');
  const [busRouteProgress, setBusRouteProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentEta, setCurrentEta] = useState(0);
  // Per-bus live GPS coordinates: { 'BUS-01': { lat, lng }, 'BUS-02': { lat, lng } }
  const [busCoords, setBusCoords] = useState({});

  const updateBusCoords = (busId, coords, driverInfo = {}) => {
    setIsTripActive(true);
    setBusCoords((prev) => ({
      ...prev,
      [busId]: { ...coords, ...driverInfo, updatedAt: new Date().toLocaleTimeString() }
    }));
    if (driverInfo.speed !== undefined) {
      setCurrentSpeed(driverInfo.speed);
    }
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              status: 'ON_ROUTE',
              speed: driverInfo.speed || b.speed || 0,
              lastCoordinate: coords,
              ...(driverInfo.driverName ? { driverName: driverInfo.driverName } : {}),
              ...(driverInfo.driverPhone ? { driverPhone: driverInfo.driverPhone } : {}),
              ...(driverInfo.totalStudents ? { capacity: `${driverInfo.totalStudents} Students` } : {})
            }
          : b
      )
    );
    broadcastEvent('BUS_LOCATION_UPDATE', { busId, coords, driverInfo });
    updateBusLocationInCloud(busId, coords, driverInfo);
  };

  // Faculty Chat
  const [facultyChats, setFacultyChats] = useState(() => {
    const saved = localStorage.getItem('ravs_faculty_chats');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY_CHATS;
  });

  // Targeted Class Notes (Filtered strictly by classId to prevent conflict)
  const [classNotes, setClassNotes] = useState(() => {
    const saved = localStorage.getItem('ravs_class_notes');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_NOTES;
  });

  // Multi-Class Management (Classes 5th to 12th)
  const [selectedClassId, setSelectedClassId] = useState('8A');
  const [multiClassRoster, setMultiClassRoster] = useState(() => {
    const saved = localStorage.getItem('ravs_multi_class_roster');
    return saved ? JSON.parse(saved) : INITIAL_MULTI_CLASS_ROSTER;
  });

  // Class Teacher <-> Student Interaction Chats
  const [classChats, setClassChats] = useState(() => {
    const saved = localStorage.getItem('ravs_class_chats');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_CHATS;
  });

  // Campus Entrance QR Code Token (for scanning when arriving at school/college)
  const [campusGateQR, setCampusGateQR] = useState({
    gateId: 'GATE_NORTH_A',
    gateName: 'Main Campus Entrance Gate (North)',
    securityOfficer: 'Capt. R. S. Rathore',
    token: 'RAVS-CAMPUS-GATE-NORTH-2026',
    validShift: 'Morning Shift'
  });

  // AI Study Assistant Chat & Gemini API Key Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('ravs_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai_welcome',
      sender: 'assistant',
      text: 'Hello! I am your RAVS AI Study Assistant powered by Google Gemini. Ask me any Semi-English syllabus question, math derivation, or science concept!',
      timestamp: 'Just now'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const updateGeminiApiKey = (newKey) => {
    setGeminiApiKey(newKey);
    localStorage.setItem('ravs_gemini_api_key', newKey);
    addToast('Gemini API key updated successfully!', 'success');
  };

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Sync to localStorage
  useEffect(() => {
    if (activeRole) {
      localStorage.setItem('ravs_active_role', activeRole);
    } else {
      localStorage.removeItem('ravs_active_role');
    }
  }, [activeRole]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ravs_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ravs_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ravs_students_8a', JSON.stringify(students8A));
  }, [students8A]);

  useEffect(() => {
    localStorage.setItem('ravs_teacher_punch_logs', JSON.stringify(teacherPunchLogs));
  }, [teacherPunchLogs]);

  useEffect(() => {
    localStorage.setItem('ravs_today_teacher_checkin', JSON.stringify(todayTeacherCheckIn));
  }, [todayTeacherCheckIn]);

  useEffect(() => {
    localStorage.setItem('ravs_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('ravs_buses', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem('ravs_faculty_chats', JSON.stringify(facultyChats));
  }, [facultyChats]);

  useEffect(() => {
    localStorage.setItem('ravs_class_notes', JSON.stringify(classNotes));
  }, [classNotes]);

  useEffect(() => {
    localStorage.setItem('ravs_is_trip_active', String(isTripActive));
  }, [isTripActive]);

  // Real-time multi-tab cross-sync via BroadcastChannel
  const channelRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      channelRef.current = new BroadcastChannel('ravs_school_network');
      channelRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'TRIP_STATUS_CHANGE') {
          setIsTripActive(payload.isTripActive);
          setCurrentSpeed(payload.speed || 0);
          setBusRouteProgress(payload.progress || 0);
          setCurrentEta(payload.eta || 0);
          setBuses((prev) =>
            prev.map((b) =>
              b.id === (payload.busId || 'BUS-01')
                ? { ...b, status: payload.isTripActive ? 'ON_ROUTE' : 'STANDBY', speed: payload.speed || 0, etaMinutes: payload.eta || 0 }
                : b
            )
          );
        } else if (type === 'BUS_LOCATION_UPDATE') {
          setIsTripActive(true);
          setBusCoords((prev) => ({ ...prev, [payload.busId]: { ...payload.coords, ...payload.driverInfo } }));
          if (payload.driverInfo?.speed !== undefined) setCurrentSpeed(payload.driverInfo.speed);
          setBuses((prev) =>
            prev.map((b) =>
              b.id === payload.busId
                ? {
                    ...b,
                    status: 'ON_ROUTE',
                    speed: payload.driverInfo?.speed || b.speed || 0,
                    lastCoordinate: payload.coords,
                    ...(payload.driverInfo?.driverName ? { driverName: payload.driverInfo.driverName } : {}),
                    ...(payload.driverInfo?.driverPhone ? { driverPhone: payload.driverInfo.driverPhone } : {}),
                    ...(payload.driverInfo?.totalStudents ? { capacity: `${payload.driverInfo.totalStudents} Students` } : {})
                  }
                : b
            )
          );
        } else if (type === 'NEW_NOTICE') {
          setNotices((prev) => [payload.notice, ...prev]);
          addToast(`New notice: ${payload.notice.title}`, 'info');
        } else if (type === 'NEW_CLASS_NOTE') {
          setClassNotes((prev) => [payload.note, ...prev]);
          addToast(`New notes uploaded for ${payload.note.targetClassName}: ${payload.note.title}`, 'info');
        } else if (type === 'NEW_FACULTY_CHAT') {
          setFacultyChats((prev) => [...prev, payload.message]);
        } else if (type === 'NEW_CLASS_CHAT') {
          setClassChats((prev) => {
            const list = prev[payload.classId] || [];
            return { ...prev, [payload.classId]: [...list, payload.message] };
          });
        } else if (type === 'TEACHER_CHECKIN') {
          setTeacherPunchLogs((prev) => [payload.log, ...prev]);
        }
      };
    }
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  // ─── Firebase real-time listeners (run when Firebase is connected) ─────────
  useEffect(() => {
    if (!isFirebaseConnected) return;
    const unsubs = [];

    // Notices
    unsubs.push(listenToNotices((cloudNotices) => {
      if (cloudNotices.length > 0) setNotices(cloudNotices);
    }));

    // Faculty chat (general channel)
    unsubs.push(listenToFacultyChat('general', (msgs) => {
      if (msgs.length > 0) setFacultyChats(msgs);
    }));

    // Class notes for 8A
    unsubs.push(listenToClassNotes('8A', (notes) => {
      if (notes.length > 0) setClassNotes(notes);
    }));

    // Class chat for 8A
    unsubs.push(listenToClassChat('8A', (msgs) => {
      if (msgs.length > 0) {
        setClassChats((prev) => ({ ...prev, '8A': msgs }));
      }
    }));

    // Bus GPS locations
    unsubs.push(listenToBusLocations((coordsMap) => {
      setBusCoords(coordsMap);
    }));

    // Teacher attendance logs
    unsubs.push(listenToTeacherAttendance((logs) => {
      if (logs.length > 0) setTeacherPunchLogs(logs);
    }));

    return () => unsubs.forEach((u) => u && u());
  }, []);

  const broadcastEvent = (type, payload) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type, payload });
      } catch (err) {
        console.warn('Broadcast failed:', err);
      }
    }
  };

  // Auth methods
  const loginAsRole = (roleKey, customUserData = null) => {
    const roleUpper = roleKey.toUpperCase();
    let baseUser = INITIAL_USERS[roleKey.toLowerCase()];

    if (customUserData && customUserData.userId) {
      const cleanId = customUserData.userId.trim();
      const displayName = customUserData.userName || cleanId;
      baseUser = {
        id: cleanId,
        role: roleUpper,
        name: displayName,
        title: `${roleUpper.charAt(0) + roleUpper.slice(1).toLowerCase()} • ID: ${cleanId}`,
        institution: 'RAVS Smart School',
        avatar: baseUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@ravsschool.edu`
      };
    }

    if (baseUser) {
      setActiveRole(roleUpper);
      setCurrentUser(baseUser);
      addToast(`Logged in as ${baseUser.name} (${roleUpper})`, 'success');
    }
  };

  const logout = () => {
    setActiveRole(null);
    setCurrentUser(null);
    addToast('Logged out successfully', 'info');
  };

  // 1. TEACHER CAMPUS GATE QR ATTENDANCE / PUNCH-IN
  const logTeacherGateCheckIn = ({
    gate = 'Main Campus Gate A (North)',
    shift = 'Morning Shift (07:45 AM - 02:30 PM)',
    assignedWing = 'Academic Block 2 • Room 204',
    temperature = '98.4°F (Normal)',
    remarks = 'Punched in on schedule via Campus Gate QR scanner'
  }) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = 'Today (' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';

    const checkInRecord = {
      id: 'tlog_' + Date.now(),
      date: todayStr,
      checkInTime: nowStr,
      gate,
      shift,
      status: 'ON_TIME',
      assignedWing,
      temperature,
      remarks,
      teacherId: currentUser?.employeeId || 'EMP-T482',
      teacherName: currentUser?.name || 'Faculty Member'
    };

    setTodayTeacherCheckIn({
      checkedIn: true,
      time: nowStr,
      gate,
      shift,
      assignedWing,
      status: 'ON_TIME',
      temperature
    });

    setTeacherPunchLogs((prev) => [checkInRecord, ...prev]);
    broadcastEvent('TEACHER_CHECKIN', { log: checkInRecord });
    syncAttendanceToCloud(checkInRecord);
    addToast(`Campus Check-In verified at ${gate} (${nowStr})!`, 'success');
    return checkInRecord;
  };

  // 2. TEACHER NOTES UPLOAD WITH TARGET CLASSROOM SELECTOR (NO CONFLICT)
  const uploadClassNote = ({
    subject,
    title,
    chapter,
    summary,
    fileType = 'PDF',
    fileName = 'document.pdf',
    fileSize = '1.2 MB',
    fileData = null,
    targetClassId = '8A',
    targetClassName = 'Class 8-A'
  }) => {
    const newNote = {
      id: 'cn_' + Date.now(),
      subject: subject || 'General',
      title: title || 'Class Study Material',
      teacher: currentUser?.name || 'Class Teacher',
      time: 'Just now',
      downloads: 0,
      summary: summary || `${chapter ? 'Chapter: ' + chapter + '. ' : ''}Uploaded for revision.`,
      fileType: fileType || 'PDF',
      fileName: fileName || (fileType === 'IMAGE' ? 'image_handout.jpg' : 'study_notes.pdf'),
      fileSize: fileSize || '1.5 MB',
      fileData: fileData || null,
      targetClassId: targetClassId || '8A',
      targetClassName: targetClassName || (CLASSES_CONFIG.find(c => c.id === targetClassId)?.label || targetClassId)
    };

    setClassNotes((prev) => {
      const updated = [newNote, ...prev];
      localStorage.setItem('ravs_class_notes', JSON.stringify(updated));
      return updated;
    });

    broadcastEvent('NEW_CLASS_NOTE', { note: newNote });
    syncNotesToCloud(newNote);
    addToast(`Handout published specifically for ${newNote.targetClassName}!`, 'success');
    return newNote;
  };

  // Strict Class Filter for Notes (Eliminates Conflict for Students)
  const getNotesForClass = (classId = '8A') => {
    return classNotes.filter((n) => n.targetClassId === classId || n.targetClassId === 'ALL');
  };

  // 3. CLASS TEACHER <-> STUDENT INTERACTION
  const sendClassTeacherMessage = (classId = '8A', text, isTeacher = false, badgeType = 'General') => {
    if (!text.trim()) return;
    const msg = {
      id: 'cc_' + Date.now(),
      sender: currentUser ? currentUser.name : (isTeacher ? 'Class Teacher' : 'Student'),
      role: activeRole || (isTeacher ? 'TEACHER' : 'STUDENT'),
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: text.trim(),
      badge: badgeType || (isTeacher ? 'Teacher Reply' : 'Student Doubt')
    };

    setClassChats((prev) => {
      const currentList = prev[classId] || [];
      const updated = { ...prev, [classId]: [...currentList, msg] };
      localStorage.setItem('ravs_class_chats', JSON.stringify(updated));
      return updated;
    });

    broadcastEvent('NEW_CLASS_CHAT', { classId, message: msg });
    sendClassChatToCloud(classId, msg);
  };

  // Multi-Class Student Attendance roll call
  const setStudentStatus = (studentId, status) => {
    setStudents8A((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
    setClassStudentStatus('8A', studentId, status);
  };

  const markAllStudentsPresent = () => {
    setStudents8A((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
    markAllClassStudentsPresent('8A');
    addToast('Marked all 24 students as Present', 'info');
  };

  const submitAttendance = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    setAttendanceSubmittedTime(nowStr);
    localStorage.setItem('ravs_attendance_sync_time', nowStr);
    broadcastEvent('ATTENDANCE_UPDATED', { students: students8A, time: nowStr });
    submitStudentAttendanceToCloud('8A', students8A, currentUser?.employeeId || 'EMP-T482');
    addToast('Class 8-A attendance submitted & synchronized with cloud!', 'success');
  };

  // Campus Notices (Broadcast & Manage)
  const addNotice = (noticeData) => {
    const newNotice = {
      id: 'nt_' + Date.now(),
      title: noticeData.title,
      category: noticeData.category || 'General',
      targetAudience: noticeData.targetAudience || 'All Campus',
      content: noticeData.content,
      postedBy: currentUser?.name || 'School Administration',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pinned: !!noticeData.pinned
    };

    setNotices((prev) => {
      const updated = [newNotice, ...prev];
      localStorage.setItem('ravs_notices', JSON.stringify(updated));
      return updated;
    });

    broadcastEvent('NEW_NOTICE', { notice: newNotice });
    addNoticeToCloud(newNotice);
    addToast('Notice published & broadcast to campus network!', 'success');
    return newNotice;
  };

  const deleteNotice = (noticeId) => {
    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== noticeId);
      localStorage.setItem('ravs_notices', JSON.stringify(updated));
      return updated;
    });
    deleteNoticeFromCloud(noticeId);
    addToast('Notice removed', 'info');
  };

  const setClassStudentStatus = (classId, studentId, status) => {
    setMultiClassRoster((prev) => {
      const list = prev[classId] || [];
      const updated = {
        ...prev,
        [classId]: list.map((s) => (s.id === studentId ? { ...s, status } : s))
      };
      localStorage.setItem('ravs_multi_class_roster', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllClassStudentsPresent = (classId) => {
    setMultiClassRoster((prev) => {
      const list = prev[classId] || [];
      const updated = {
        ...prev,
        [classId]: list.map((s) => ({ ...s, status: 'PRESENT' }))
      };
      localStorage.setItem('ravs_multi_class_roster', JSON.stringify(updated));
      return updated;
    });
  };

  // Faculty Chat send
  const sendFacultyChat = (text, channelId = 'general') => {
    if (!text.trim()) return;
    const msg = {
      id: 'fc_' + Date.now(),
      sender: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Staff Member',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: text.trim(),
      isSelf: true,
      roleTag: currentUser?.role || 'Staff'
    };
    setFacultyChats((prev) => [...prev, msg]);
    broadcastEvent('NEW_FACULTY_CHAT', { message: msg });
    sendFacultyChatMessage(channelId, msg);
  };

  // Driver GPS & Real Fleet Tracking (Zero Demo/Simulated intervals)
  const gpsWatchIdRef = useRef(null);

  const startTrip = (tripDetails = {}) => {
    const { busId = 'BUS-01', driverName, driverPhone, totalStudents } = tripDetails;
    setIsTripActive(true);
    setDriverGPSStatus('STREAMING');

    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === busId) {
          return {
            ...b,
            status: 'ON_ROUTE',
            ...(driverName ? { driverName } : {}),
            ...(driverPhone ? { driverPhone } : {}),
            ...(totalStudents ? { capacity: `${totalStudents} Students` } : {}),
          };
        }
        return b;
      })
    );

    broadcastEvent('TRIP_STATUS_CHANGE', {
      busId,
      isTripActive: true,
      speed: 0,
      progress: 0,
      eta: 0
    });

    addToast('Trip Started! GPS Telemetry streaming live', 'success');
  };

  const stopTrip = (busId = null) => {
    setIsTripActive(false);
    setCurrentSpeed(0);
    setCurrentEta(0);
    setBusRouteProgress(0);
    setDriverGPSStatus('STANDBY');

    setBuses((prev) =>
      prev.map((b) =>
        (!busId || b.id === busId) ? { ...b, status: 'STANDBY', speed: 0, etaMinutes: 0 } : b
      )
    );

    if (busId) {
      setBusCoords((prev) => {
        const copy = { ...prev };
        delete copy[busId];
        return copy;
      });
    } else {
      setBusCoords({});
    }

    broadcastEvent('TRIP_STATUS_CHANGE', {
      busId,
      isTripActive: false,
      speed: 0,
      progress: 0,
      eta: 0
    });

    addToast('Trip Completed! Bus returned to standby', 'info');
  };

  // AI Assistant with live Google Gemini API
  const askAIDoubt = async (questionText) => {
    if (!questionText.trim()) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    // Try Google Gemini AI Cloud API first
    const geminiResponse = await askGeminiTutor(questionText, geminiApiKey);

    if (geminiResponse) {
      const assistantMsg = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        title: geminiResponse.title,
        steps: geminiResponse.steps,
        examTip: geminiResponse.examTip,
        text: geminiResponse.text,
        isGeminiLive: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
      setIsAiThinking(false);
      return;
    }

    // Fallback to offline educational knowledge engine
    setTimeout(() => {
      const matchedKey = Object.keys(PRESET_AI_KNOWLEDGE).find((k) =>
        questionText.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(questionText.toLowerCase())
      );
      let responsePayload;
      if (matchedKey) {
        responsePayload = PRESET_AI_KNOWLEDGE[matchedKey];
      } else {
        responsePayload = {
          title: `Comprehensive Guide: ${questionText}`,
          steps: [
            `**1. Concept Overview**: In the secondary curriculum, understanding the fundamental principles behind "${questionText}" is critical.`,
            `**2. Core Principle**: Break the problem down into its governing components, define variables, and apply standard formulas.`,
            `**3. Application**: Practice sample questions from textbook chapters.`,
            `**4. Quick Summary**: Review key definitions, standard units, and labelled diagrams.`
          ],
          examTip: 'High yield topic! Practice writing point-wise answers for full marks.'
        };
      }

      const assistantMsg = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        title: responsePayload.title,
        steps: responsePayload.steps,
        examTip: responsePayload.examTip,
        text: `Here is the structured explanation for: **${questionText}**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages((prev) => [...prev, assistantMsg]);
      setIsAiThinking(false);
    }, 700);
  };

  return (
    <SchoolContext.Provider
      value={{
        activeRole,
        currentUser,
        loginAsRole,
        logout,
        // Teacher Campus Gate QR Attendance
        campusGateQR,
        todayTeacherCheckIn,
        teacherPunchLogs,
        logTeacherGateCheckIn,
        // Class Student Attendance
        students8A,
        absentFaculty,
        setStudentStatus,
        markAllStudentsPresent,
        submitAttendance,
        attendanceSubmittedTime,
        attendanceStats: {
          present: students8A.filter((s) => s.status === 'PRESENT').length,
          absent: students8A.filter((s) => s.status === 'ABSENT').length,
          late: students8A.filter((s) => s.status === 'LATE').length,
          total: students8A.length,
          rate: ((students8A.filter((s) => s.status === 'PRESENT').length / students8A.length) * 100).toFixed(1)
        },
        // Notices
        notices,
        addNotice,
        deleteNotice,
        // Backend / Firebase Connectivity
        isFirebaseConnected,
        getBackendStatus,
        // Buses & Telemetry
        buses,
        isTripActive,
        driverGPSStatus,
        busRouteProgress,
        currentSpeed,
        currentEta,
        busCoords,
        updateBusCoords,
        startTrip,
        stopTrip,
        // Faculty Chat
        facultyChats,
        sendFacultyChat,
        // Class Notes (with Target Classroom Selector)
        classNotes,
        uploadClassNote,
        getNotesForClass,
        // Multi-Class Management (Classes 5 to 12)
        classesList: CLASSES_CONFIG,
        selectedClassId,
        setSelectedClassId,
        multiClassRoster,
        setClassStudentStatus,
        markAllClassStudentsPresent,
        // Class Teacher <-> Student Interaction
        classChats,
        sendClassTeacherMessage,
        // AI Assistant & Gemini Config
        geminiApiKey,
        updateGeminiApiKey,
        aiMessages,
        isAiThinking,
        askAIDoubt,
        // Toasts
        toasts,
        addToast
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
