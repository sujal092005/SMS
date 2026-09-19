import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS_8A,
  INITIAL_ABSENT_FACULTY,
  INITIAL_NOTICES,
  INITIAL_BUSES,
  INITIAL_FACULTY_CHATS,
  INITIAL_CLASS_NOTES,
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
  };

  const markAllStudentsPresent = () => {
    setStudents8A((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
    addToast('Marked all 24 students as Present', 'info');
  };

  const submitAttendance = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    setAttendanceSubmittedTime(nowStr);
    localStorage.setItem('ravs_attendance_sync_time', nowStr);
    broadcastEvent('ATTENDANCE_UPDATED', { students: students8A, time: nowStr });
    addToast('Attendance submitted and synchronized with School Cloud!', 'success');
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
