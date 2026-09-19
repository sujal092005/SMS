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
  PRESET_AI_KNOWLEDGE
} from '../mockData/schoolData';

const SchoolContext = createContext();

export function SchoolProvider({ children }) {
  // Session / Authentication state
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('ravs_active_role') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const role = localStorage.getItem('ravs_active_role');
    return role ? INITIAL_USERS[role.toLowerCase()] || null : null;
  });

  // Students & Attendance
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

  const [isTripActive, setIsTripActive] = useState(() => {
    return localStorage.getItem('ravs_is_trip_active') === 'true';
  });

  const [driverGPSStatus, setDriverGPSStatus] = useState('STANDBY'); // 'STANDBY' | 'ACQUIRING' | 'LIVE_HARDWARE' | 'SIMULATED'
  const [busRouteProgress, setBusRouteProgress] = useState(35); // 0 to 100%
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentEta, setCurrentEta] = useState(15);

  // Faculty Chat & Class Chat
  const [facultyChats, setFacultyChats] = useState(() => {
    const saved = localStorage.getItem('ravs_faculty_chats');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY_CHATS;
  });

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

  const [classChats, setClassChats] = useState(() => {
    const saved = localStorage.getItem('ravs_class_chats');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_CHATS;
  });

  // Active QR Attendance Session
  const [activeQrSession, setActiveQrSession] = useState({
    classId: '8A',
    sessionCode: '8942',
    token: 'RAVS-8A-8942',
    expiresAt: '10:45 AM',
    active: true
  });

  const [qrScannedLogs, setQrScannedLogs] = useState([
    { roll: '8A-14', name: 'Aarav Sharma', time: '08:14 AM' },
    { roll: '8A-01', name: 'Aakash Mehra', time: '08:16 AM' },
    { roll: '8A-05', name: 'Bhavna Kulkarni', time: '08:18 AM' }
  ]);

  // AI Study Assistant Chat
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai_welcome',
      sender: 'assistant',
      text: 'Hello! I am your RAVS AI Study Assistant. You can ask me any question related to CBSE/K-12 Math, Science, Social Studies, or English!',
      timestamp: 'Just now'
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

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
    localStorage.setItem('ravs_students_8a', JSON.stringify(students8A));
  }, [students8A]);

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
          setCurrentSpeed(payload.speed);
          setBusRouteProgress(payload.progress);
          setCurrentEta(payload.eta);
          setBuses((prev) =>
            prev.map((b) =>
              b.id === 'BUS-01'
                ? { ...b, status: payload.isTripActive ? 'ON_ROUTE' : 'STANDBY', speed: payload.speed, etaMinutes: payload.eta }
                : b
            )
          );
        } else if (type === 'NEW_NOTICE') {
          setNotices((prev) => [payload.notice, ...prev]);
          addToast(`New notice published: ${payload.notice.title}`, 'info');
        } else if (type === 'ATTENDANCE_UPDATED') {
          setStudents8A(payload.students);
          setAttendanceSubmittedTime(payload.time);
          addToast('Class 8-A attendance records synchronized', 'success');
        } else if (type === 'NEW_CHAT') {
          setFacultyChats((prev) => [...prev, payload.message]);
        }
      };
    }
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
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
  const loginAsRole = (roleKey) => {
    const user = INITIAL_USERS[roleKey.toLowerCase()];
    if (user) {
      setActiveRole(user.role);
      setCurrentUser(user);
      addToast(`Logged in as ${user.name} (${user.role})`, 'success');
    }
  };

  const logout = () => {
    setActiveRole(null);
    setCurrentUser(null);
    addToast('Logged out successfully', 'info');
  };

  // Attendance methods
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
    addToast('Attendance submitted and synchronized with School Cloud!', 'success');
  };

  // Multi-Class methods
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

  // QR Session generator & validator
  const regenerateQRSession = (classId = '8A') => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newSession = {
      classId,
      sessionCode: pin,
      token: `RAVS-${classId}-${pin}`,
      expiresAt: '11:00 AM',
      active: true
    };
    setActiveQrSession(newSession);
    addToast(`New QR Session active: PIN ${pin}`, 'info');
    return newSession;
  };

  // QR check-in by student (self or camera scanned)
  const markStudentAttendanceByQR = (identifier, targetClass = '8A') => {
    const list = multiClassRoster[targetClass] || students8A;
    const cleanId = String(identifier).trim().toUpperCase();

    // Check if input matches roll, id, name or session pin
    let found = list.find((s) =>
      s.roll.toUpperCase() === cleanId ||
      s.id.toUpperCase() === cleanId ||
      s.name.toUpperCase().includes(cleanId)
    );

    if (!found && (cleanId === activeQrSession.sessionCode || cleanId.includes(activeQrSession.sessionCode))) {
      found = list.find((s) => s.isFeatured || s.roll === '8A-14') || list[0];
    }

    if (found) {
      setClassStudentStatus(targetClass, found.id, 'PRESENT');
      if (targetClass === '8A') {
        setStudents8A((prev) => prev.map((s) => (s.id === found.id ? { ...s, status: 'PRESENT' } : s)));
      }
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setQrScannedLogs((prev) => [
        { roll: found.roll, name: found.name, time: timeStr },
        ...prev.filter((l) => l.roll !== found.roll)
      ]);
      addToast(`Verified! ${found.name} (${found.roll}) marked Present`, 'success');
      return { success: true, student: found };
    } else {
      addToast(`Student or Code "${cleanId}" not recognized`, 'error');
      return { success: false, message: 'Student not found in active class' };
    }
  };

  // Upload Class Note
  const uploadClassNote = ({ subject, title, chapter, summary, fileType = 'PDF', classId = '8A' }) => {
    const newNote = {
      id: 'cn_' + Date.now(),
      subject: subject || 'General',
      title: title || 'Class Study Material',
      teacher: currentUser?.name || 'Class Teacher',
      time: 'Just now',
      downloads: 0,
      summary: summary || `${chapter ? 'Chapter: ' + chapter + '. ' : ''}Uploaded for class revision.`,
      fileType: fileType || 'PDF',
      classId
    };
    setClassNotes((prev) => {
      const updated = [newNote, ...prev];
      localStorage.setItem('ravs_class_notes', JSON.stringify(updated));
      return updated;
    });
    addToast(`Handout "${newNote.title}" uploaded to class portal!`, 'success');
  };

  // Post Class Notice
  const publishClassNotice = ({ title, content, targetClass = 'Class 8-A', priority = 'Normal' }) => {
    const noticeObj = {
      id: 'not_' + Date.now(),
      title,
      content,
      category: 'Class Notice',
      date: 'Just now',
      pinned: priority === 'Urgent',
      badgeColor: priority === 'Urgent' ? 'rose' : priority === 'Important' ? 'amber' : 'blue',
      targetClass
    };
    setNotices((prev) => {
      const updated = [noticeObj, ...prev];
      localStorage.setItem('ravs_notices', JSON.stringify(updated));
      return updated;
    });
    broadcastEvent('NEW_NOTICE', { notice: noticeObj });
    addToast(`Class circular published to ${targetClass}!`, 'success');
  };

  // Class chat send
  const sendClassChatMessage = (classId, messageText) => {
    if (!messageText.trim()) return;
    const msg = {
      id: 'cc_' + Date.now(),
      sender: currentUser ? currentUser.name : 'Participant',
      role: activeRole || 'STUDENT',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: messageText.trim(),
      badge: activeRole === 'TEACHER' ? 'Teacher' : 'Student'
    };
    setClassChats((prev) => {
      const currentList = prev[classId] || [];
      const updated = { ...prev, [classId]: [...currentList, msg] };
      localStorage.setItem('ravs_class_chats', JSON.stringify(updated));
      return updated;
    });
  };


  // Compute attendance stats
  const presentCount = students8A.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students8A.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students8A.filter((s) => s.status === 'LATE').length;
  const totalCount = students8A.length;
  const attendanceRate = ((presentCount / totalCount) * 100).toFixed(1);

  // Notice methods
  const addNotice = (newNotice) => {
    const noticeObj = {
      id: 'not_' + Date.now(),
      date: 'Just now',
      pinned: false,
      badgeColor:
        newNotice.category === 'Examinations'
          ? 'blue'
          : newNotice.category === 'Transportation'
          ? 'amber'
          : 'emerald',
      ...newNotice
    };
    setNotices((prev) => [noticeObj, ...prev]);
    broadcastEvent('NEW_NOTICE', { notice: noticeObj });
    addToast('Official circular broadcasted to school portal', 'success');
  };

  const deleteNotice = (noticeId) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    addToast('Circular removed', 'info');
  };

  // Driver GPS & Trip methods
  const gpsWatchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  const startTrip = () => {
    setIsTripActive(true);
    setCurrentSpeed(32);
    setDriverGPSStatus('ACQUIRING');

    setBuses((prev) =>
      prev.map((b) =>
        b.id === 'BUS-01' ? { ...b, status: 'ON_ROUTE', speed: 32, etaMinutes: 14 } : b
      )
    );

    // Attempt native hardware geolocation
    if ('geolocation' in navigator) {
      try {
        gpsWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setDriverGPSStatus('LIVE_HARDWARE');
            const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 34;
            setCurrentSpeed(speedKmh || 32);
          },
          (err) => {
            console.warn('Geolocation denied or unavailable, switching to simulated telemetry', err);
            setDriverGPSStatus('SIMULATED');
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } catch (e) {
        setDriverGPSStatus('SIMULATED');
      }
    } else {
      setDriverGPSStatus('SIMULATED');
    }

    // Live Route simulation step loop (updates progress & ETA every 3 seconds)
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = setInterval(() => {
      setBusRouteProgress((prev) => {
        const next = prev >= 95 ? 20 : prev + 3;
        const newEta = Math.max(2, Math.round(18 * (1 - next / 100)));
        setCurrentEta(newEta);

        broadcastEvent('TRIP_STATUS_CHANGE', {
          isTripActive: true,
          speed: 34,
          progress: next,
          eta: newEta
        });
        return next;
      });
    }, 2800);

    broadcastEvent('TRIP_STATUS_CHANGE', {
      isTripActive: true,
      speed: 32,
      progress: busRouteProgress,
      eta: currentEta
    });

    addToast('Trip Started! Hardware GPS Telemetry is now streaming live', 'success');
  };

  const stopTrip = () => {
    setIsTripActive(false);
    setCurrentSpeed(0);
    setDriverGPSStatus('STANDBY');

    if (gpsWatchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }

    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setBuses((prev) =>
      prev.map((b) =>
        b.id === 'BUS-01' ? { ...b, status: 'STANDBY', speed: 0, etaMinutes: 0 } : b
      )
    );

    broadcastEvent('TRIP_STATUS_CHANGE', {
      isTripActive: false,
      speed: 0,
      progress: busRouteProgress,
      eta: 0
    });

    addToast('Trip Completed! Bus telemetry returned to standby', 'info');
  };

  // Faculty Chat send
  const sendFacultyChat = (text) => {
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
    broadcastEvent('NEW_CHAT', { message: msg });
  };

  // AI Study Assistant query handler
  const askAIDoubt = (questionText) => {
    if (!questionText.trim()) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    setTimeout(() => {
      // Find matching preset or generate intelligent answer
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
            `**1. Concept Overview**: In the CBSE secondary curriculum, understanding the fundamental principles behind "${questionText}" is critical.`,
            `**2. Core Principle**: Break the problem down into its governing components, define variables, and apply standard formulas.`,
            `**3. Application & Derivation**: Check for boundary conditions and practice numerical or qualitative sample questions from NCERT Exemplar chapters.`,
            `**4. Quick Summary**: Review key definitions, standard units (SI), and diagrams where applicable.`
          ],
          examTip: 'High yield topic! Practice writing point-wise answers with labelled diagrams for full marks.'
        };
      }

      const assistantMsg = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        title: responsePayload.title,
        steps: responsePayload.steps,
        examTip: responsePayload.examTip,
        text: `Here is the structured breakdown for: **${questionText}**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiMessages((prev) => [...prev, assistantMsg]);
      setIsAiThinking(false);
    }, 900);
  };

  return (
    <SchoolContext.Provider
      value={{
        activeRole,
        currentUser,
        loginAsRole,
        logout,
        // Attendance
        students8A,
        absentFaculty,
        setStudentStatus,
        markAllStudentsPresent,
        submitAttendance,
        attendanceSubmittedTime,
        attendanceStats: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: totalCount,
          rate: attendanceRate
        },
        // Notices
        notices,
        addNotice,
        deleteNotice,
        // Telemetry & Buses
        buses,
        isTripActive,
        driverGPSStatus,
        busRouteProgress,
        currentSpeed,
        currentEta,
        startTrip,
        stopTrip,
        // Chats
        facultyChats,
        sendFacultyChat,
        classNotes,
        // Multi-Class Management (Classes 5 to 12)
        classesList: CLASSES_CONFIG,
        selectedClassId,
        setSelectedClassId,
        multiClassRoster,
        setClassStudentStatus,
        markAllClassStudentsPresent,
        // QR Attendance Session
        activeQrSession,
        setActiveQrSession,
        regenerateQRSession,
        qrScannedLogs,
        markStudentAttendanceByQR,
        // Class Hub & Communication
        classChats,
        sendClassChatMessage,
        uploadClassNote,
        publishClassNotice,
        // AI Study Assistant
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
