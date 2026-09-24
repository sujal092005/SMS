import React, { useState } from 'react';
import { useSchool } from './context/SchoolContext';

// Common Layout Elements
import DeviceFrame from './components/common/DeviceFrame';
import TopHeader from './components/common/TopHeader';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';
import NotificationToast from './components/NotificationToast';
import ClassTimetable from './components/common/ClassTimetable';

// Auth Screens
import SignInScreen from './components/auth/SignInScreen';
import SetNewPasswordModal from './components/auth/SetNewPasswordModal';

// Admin Suite
import AdminHome from './components/admin/AdminHome';
import AdminTeachers from './components/admin/AdminTeachers';
import AdminAttendance from './components/admin/AdminAttendance';
import AdminNotices from './components/admin/AdminNotices';
import AdminChat from './components/admin/AdminChat';
import AdminFleet from './components/admin/AdminFleet';

// Teacher Suite
import TeacherHome from './components/teacher/TeacherHome';
import TeacherStudentRoster from './components/teacher/TeacherStudentRoster';
import AttendanceRoster from './components/teacher/AttendanceRoster';
import TeacherAttendanceQR from './components/teacher/TeacherAttendanceQR';
import TeacherFacultyChat from './components/teacher/TeacherFacultyChat';
import TeacherClassHub from './components/teacher/TeacherClassHub';

// Student Suite
import StudentHome from './components/student/StudentHome';
import AIDoubtAssistant from './components/student/AIDoubtAssistant';
import ClassChatbox from './components/student/ClassChatbox';
import StudentNotices from './components/student/StudentNotices';

// Parent Suite
import ParentBusTracker from './components/parent/ParentBusTracker';
import ParentDashboard from './components/parent/ParentDashboard';

// Driver Suite
import DriverTripController from './components/driver/DriverTripController';

export default function App() {
  const { activeRole, mustChangePassword } = useSchool();
  const [currentTab, setCurrentTab] = useState('home');

  // When active role changes, reset tab to default for that role
  React.useEffect(() => {
    if (activeRole === 'ADMIN') setCurrentTab('home');
    else if (activeRole === 'TEACHER') setCurrentTab('home');
    else if (activeRole === 'STUDENT') setCurrentTab('home');
    else if (activeRole === 'PARENT') setCurrentTab('bus');
    else if (activeRole === 'DRIVER') setCurrentTab('trip');
    else setCurrentTab('home');
  }, [activeRole]);

  // If not logged in, show the role selection and authentication gateway
  if (!activeRole) {
    return (
      <DeviceFrame>
        <SignInScreen />
        <Toast />
        <NotificationToast />
      </DeviceFrame>
    );
  }

  // Render content based on activeRole and currentTab
  const renderRoleScreen = () => {
    switch (activeRole) {
      case 'ADMIN':
        if (currentTab === 'teachers') return <AdminTeachers onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'attendance') return <AdminAttendance onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'notices') return <AdminNotices onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'chat') return <AdminChat onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'fleet') return <AdminFleet onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'timetable') return <ClassTimetable onBack={() => setCurrentTab('home')} />;

        return <AdminHome onNavigate={(tab) => setCurrentTab(tab)} />;

      case 'TEACHER':
        if (currentTab === 'roster') return <TeacherStudentRoster onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'rollcall') return <AttendanceRoster onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'attendance') return <TeacherAttendanceQR onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'chat') return <TeacherFacultyChat onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'hub') return <TeacherClassHub onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'notices') return <StudentNotices onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'timetable') return <ClassTimetable onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'bus') return <ParentBusTracker onBack={() => setCurrentTab('home')} />;
        return <TeacherHome onNavigate={(tab) => setCurrentTab(tab)} />;

      case 'STUDENT':
        if (currentTab === 'ai_doubt') return <AIDoubtAssistant onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'notes') return <ClassChatbox onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'notices') return <StudentNotices onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'timetable') return <ClassTimetable onBack={() => setCurrentTab('home')} />;
        if (currentTab === 'bus') return <ParentBusTracker onBack={() => setCurrentTab('home')} />;
        return <StudentHome onNavigate={(tab) => setCurrentTab(tab)} />;

      case 'PARENT':
        if (currentTab === 'attendance') return <ParentDashboard onNavigate={(tab) => setCurrentTab(tab)} onBack={() => setCurrentTab('bus')} />;
        if (currentTab === 'notices') return <StudentNotices onBack={() => setCurrentTab('bus')} />;
        if (currentTab === 'timetable') return <ClassTimetable onBack={() => setCurrentTab('attendance')} />;
        return <ParentBusTracker onBack={() => setCurrentTab('attendance')} />;

      case 'DRIVER':
        if (currentTab === 'notices') return <StudentNotices onBack={() => setCurrentTab('trip')} />;
        return <DriverTripController onBack={() => setCurrentTab('trip')} />;

      default:
        return <AdminHome onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <DeviceFrame>
      <TopHeader onNavigate={setCurrentTab} currentTab={currentTab} />
      <main className="flex-1 flex flex-col">
        {renderRoleScreen()}
      </main>
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      <Toast />
      <NotificationToast />

      {/* Forced first-login password change modal */}
      {mustChangePassword && <SetNewPasswordModal />}
    </DeviceFrame>
  );
}
