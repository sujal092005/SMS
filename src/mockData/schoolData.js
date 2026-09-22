// Initial Data Configuration for RAVS Smart School Ecosystem
// Reset to Fresh State - Only Fresh Institutional Admin exists by default

export const INITIAL_USERS = {
  admin: {
    id: 'usr_admin_0924',
    role: 'ADMIN',
    loginId: 'ADMIN-0924',
    name: 'Institutional Administrator',
    title: 'School Administrator & Principal',
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'admin-0924@ravs.school',
    badge: 'Campus Authority'
  }
};

export const CLASSES_CONFIG = [
  { id: '5A', label: 'Class 5-A', category: 'Primary', strength: 0, teacher: 'Unassigned', room: 'Room 102' },
  { id: '6A', label: 'Class 6-A', category: 'Middle', strength: 0, teacher: 'Unassigned', room: 'Room 105' },
  { id: '7A', label: 'Class 7-A', category: 'Middle', strength: 0, teacher: 'Unassigned', room: 'Room 201' },
  { id: '8A', label: 'Class 8-A', category: 'Secondary', strength: 0, teacher: 'Unassigned', room: 'Room 204' },
  { id: '9A', label: 'Class 9-A', category: 'Secondary', strength: 0, teacher: 'Unassigned', room: 'Room 208' },
  { id: '10A', label: 'Class 10-A (CBSE)', category: 'Secondary Board', strength: 0, teacher: 'Unassigned', room: 'Room 302' },
  { id: '11A', label: 'Class 11-A (Science)', category: 'Senior Secondary', strength: 0, teacher: 'Unassigned', room: 'Science Block S-1' },
  { id: '12A', label: 'Class 12-A (Science)', category: 'Senior Secondary Board', strength: 0, teacher: 'Unassigned', room: 'Science Block S-3' }
];

export const INITIAL_STUDENTS_8A = [];
export const INITIAL_MULTI_CLASS_ROSTER = {};
export const INITIAL_ABSENT_FACULTY = [];
export const INITIAL_TEACHER_ATTENDANCE_LOGS = [];
export const INITIAL_NOTICES = [];
export const INITIAL_BUSES = [
  {
    id: 'BUS-01',
    busNumber: 'Bus 1',
    plateNumber: 'MH-04-AB-1234',
    driverName: 'Unassigned',
    driverPhone: '—',
    route: 'Bus 1 (North Route)',
    status: 'STANDBY',
    speed: 0,
    etaMinutes: 0,
    lastCoordinate: null,
    capacity: 'Standby',
    stops: [
      { name: 'Central Campus Gate', time: '07:15 AM', status: 'SCHEDULED' },
      { name: 'Sector 14 Metro Station', time: '07:35 AM', status: 'SCHEDULED' },
      { name: 'Green Park Avenue', time: '07:55 AM', status: 'SCHEDULED' },
      { name: 'RAVS Senior School', time: '08:45 AM', status: 'SCHEDULED' }
    ]
  }
];

export const INITIAL_FACULTY_CHATS = [];
export const INITIAL_CLASS_NOTES = [];
export const PRESET_AI_KNOWLEDGE = {};
export const INITIAL_CLASS_CHATS = {};
