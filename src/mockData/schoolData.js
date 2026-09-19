// Initial Mock Data for RAVS Smart School Ecosystem
// Aligned with Stitch Project 8284308281264775318 & PRD v2.0

export const INITIAL_USERS = {
  admin: {
    id: 'usr_admin_01',
    role: 'ADMIN',
    name: 'Dr. Arvind Sharma',
    title: 'School Administrator & Principal',
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'admin@ravsschool.edu',
    badge: 'Campus Authority'
  },
  teacher: {
    id: 'usr_teacher_01',
    role: 'TEACHER',
    name: 'Priya Sharma',
    title: 'Senior Mathematics & Class 8-A Incharge',
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'priya.sharma@ravsschool.edu',
    assignedClass: 'Class 8-A',
    department: 'Mathematics',
    employeeId: 'EMP-T482'
  },
  student: {
    id: 'usr_student_01',
    role: 'STUDENT',
    name: 'Aarav Sharma',
    title: 'Student • Class 8-A',
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    email: 'aarav.s8a@ravsschool.edu',
    rollNumber: '8A-14',
    classId: '8A',
    assignedBus: 'BUS-01',
    attendanceToday: 'PRESENT'
  },
  parent: {
    id: 'usr_parent_01',
    role: 'PARENT',
    name: 'Sunita Sharma',
    title: "Parent of Aarav Sharma (Class 8-A)",
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'sunita.sharma@gmail.com',
    childName: 'Aarav Sharma',
    childClass: 'Class 8-A',
    assignedBus: 'BUS-01'
  },
  driver: {
    id: 'usr_driver_01',
    role: 'DRIVER',
    name: 'Rajesh Kumar',
    title: 'Senior Transit Captain',
    institution: 'RAVS Smart School',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rajesh.driver@ravsschool.edu',
    assignedBus: 'BUS-01',
    route: 'Route #4 (South Corridor)',
    phone: '+91 98765 43210'
  }
};

export const CLASSES_CONFIG = [
  { id: '5A', label: 'Class 5-A', category: 'Primary', strength: 22, teacher: 'Mrs. Sunita Sen', room: 'Room 102' },
  { id: '6A', label: 'Class 6-A', category: 'Middle', strength: 24, teacher: 'Mr. Alok Verma', room: 'Room 105' },
  { id: '7A', label: 'Class 7-A', category: 'Middle', strength: 25, teacher: 'Ms. Deepika Roy', room: 'Room 201' },
  { id: '8A', label: 'Class 8-A', category: 'Secondary', strength: 24, teacher: 'Mrs. Priya Sharma', room: 'Room 204' },
  { id: '9A', label: 'Class 9-A', category: 'Secondary', strength: 26, teacher: 'Mr. Rajesh Mehra', room: 'Room 208' },
  { id: '10A', label: 'Class 10-A (CBSE)', category: 'Secondary Board', strength: 28, teacher: 'Dr. Vivek Saxena', room: 'Room 302' },
  { id: '11A_SCI', label: 'Class 11-A (Science)', category: 'Senior Secondary', strength: 30, teacher: 'Dr. R. K. Verma', room: 'Science Block S-1' },
  { id: '12A_SCI', label: 'Class 12-A (Science)', category: 'Senior Secondary Board', strength: 32, teacher: 'Mrs. Kavita Chawla', room: 'Science Block S-3' }
];

export const INITIAL_STUDENTS_8A = [
  { id: 'st_1', roll: '8A-01', name: 'Aakash Mehra', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AM' },
  { id: 'st_2', roll: '8A-02', name: 'Aditi Rao', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'AR' },
  { id: 'st_3', roll: '8A-03', name: 'Ananya Verma', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AV' },
  { id: 'st_4', roll: '8A-04', name: 'Arjun Das', status: 'LATE', busId: 'BUS-03', avatarInitials: 'AD' },
  { id: 'st_5', roll: '8A-05', name: 'Bhavna Kulkarni', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'BK' },
  { id: 'st_6', roll: '8A-06', name: 'Chetan Bhagat', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'CB' },
  { id: 'st_7', roll: '8A-07', name: 'Devika Pillai', status: 'ABSENT', busId: 'BUS-01', avatarInitials: 'DP' },
  { id: 'st_8', roll: '8A-08', name: 'Dhruv Kapoor', status: 'PRESENT', busId: 'BUS-04', avatarInitials: 'DK' },
  { id: 'st_9', roll: '8A-09', name: 'Diya Patel', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'DP' },
  { id: 'st_10', roll: '8A-10', name: 'Ishaan Joshi', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'IJ' },
  { id: 'st_11', roll: '8A-11', name: 'Jaspreet Singh', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'JS' },
  { id: 'st_12', roll: '8A-12', name: 'Kabir Singhania', status: 'ABSENT', busId: 'BUS-03', avatarInitials: 'KS' },
  { id: 'st_13', roll: '8A-13', name: 'Kavya Nair', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'KN' },
  { id: 'st_14', roll: '8A-14', name: 'Aarav Sharma', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AS', isFeatured: true },
  { id: 'st_15', roll: '8A-15', name: 'Manish Rawat', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'MR' },
  { id: 'st_16', roll: '8A-16', name: 'Meera Iyer', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'MI' },
  { id: 'st_17', roll: '8A-17', name: 'Nikhil Saxena', status: 'LATE', busId: 'BUS-01', avatarInitials: 'NS' },
  { id: 'st_18', roll: '8A-18', name: 'Pranav Roy', status: 'PRESENT', busId: 'BUS-04', avatarInitials: 'PR' },
  { id: 'st_19', roll: '8A-19', name: 'Riya Sen', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'RS' },
  { id: 'st_20', roll: '8A-20', name: 'Rohan Gupta', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'RG' },
  { id: 'st_21', roll: '8A-21', name: 'Siddharth Jain', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'SJ' },
  { id: 'st_22', roll: '8A-22', name: 'Tanvi Deshmukh', status: 'ABSENT', busId: 'BUS-03', avatarInitials: 'TD' },
  { id: 'st_23', roll: '8A-23', name: 'Varun Dhawan', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'VD' },
  { id: 'st_24', roll: '8A-24', name: 'Zoya Khan', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'ZK' },
];

export const INITIAL_MULTI_CLASS_ROSTER = {
  '5A': [
    { id: 'st_5_1', roll: '5A-01', name: 'Aarohi Das', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AD' },
    { id: 'st_5_2', roll: '5A-02', name: 'Aryan Bhatt', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'AB' },
    { id: 'st_5_3', roll: '5A-03', name: 'Devansh Roy', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'DR' },
    { id: 'st_5_4', roll: '5A-04', name: 'Kiara Advani', status: 'ABSENT', busId: 'BUS-03', avatarInitials: 'KA' },
    { id: 'st_5_5', roll: '5A-05', name: 'Reyansh Gupta', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'RG' }
  ],
  '6A': [
    { id: 'st_6_1', roll: '6A-01', name: 'Ananya Roy', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AR' },
    { id: 'st_6_2', roll: '6A-02', name: 'Daksh Mittal', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'DM' },
    { id: 'st_6_3', roll: '6A-03', name: 'Harshita Sen', status: 'ABSENT', busId: 'BUS-01', avatarInitials: 'HS' },
    { id: 'st_6_4', roll: '6A-04', name: 'Krishna Murthy', status: 'PRESENT', busId: 'BUS-03', avatarInitials: 'KM' }
  ],
  '7A': [
    { id: 'st_7_1', roll: '7A-01', name: 'Aditya Birla', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AB' },
    { id: 'st_7_2', roll: '7A-02', name: 'Charu Lata', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'CL' },
    { id: 'st_7_3', roll: '7A-03', name: 'Kushagra Soni', status: 'PRESENT', busId: 'BUS-04', avatarInitials: 'KS' },
    { id: 'st_7_4', roll: '7A-04', name: 'Prerna Sharma', status: 'LATE', busId: 'BUS-01', avatarInitials: 'PS' }
  ],
  '8A': INITIAL_STUDENTS_8A,
  '9A': [
    { id: 'st_9_1', roll: '9A-01', name: 'Arman Malik', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AM' },
    { id: 'st_9_2', roll: '9A-02', name: 'Bhumika Chawla', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'BC' },
    { id: 'st_9_3', roll: '9A-03', name: 'Chirag Paswan', status: 'ABSENT', busId: 'BUS-03', avatarInitials: 'CP' },
    { id: 'st_9_4', roll: '9A-04', name: 'Divyansh Tiwari', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'DT' }
  ],
  '10A': [
    { id: 'st_10_1', roll: '10A-01', name: 'Anirudh Ravichander', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AR' },
    { id: 'st_10_2', roll: '10A-02', name: 'Bipasha Basu', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'BB' },
    { id: 'st_10_3', roll: '10A-03', name: 'Devendra Pandey', status: 'PRESENT', busId: 'BUS-04', avatarInitials: 'DP' },
    { id: 'st_10_4', roll: '10A-04', name: 'Garima Sethi', status: 'ABSENT', busId: 'BUS-01', avatarInitials: 'GS' }
  ],
  '11A_SCI': [
    { id: 'st_11_1', roll: '11S-01', name: 'Aryavart Somani', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AS' },
    { id: 'st_11_2', roll: '11S-02', name: 'Esha Deol', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'ED' },
    { id: 'st_11_3', roll: '11S-03', name: 'Farhan Akhtar', status: 'PRESENT', busId: 'BUS-03', avatarInitials: 'FA' },
    { id: 'st_11_4', roll: '11S-04', name: 'Gauri Shinde', status: 'LATE', busId: 'BUS-01', avatarInitials: 'GS' }
  ],
  '12A_SCI': [
    { id: 'st_12_1', roll: '12S-01', name: 'Abhay Deol', status: 'PRESENT', busId: 'BUS-01', avatarInitials: 'AD' },
    { id: 'st_12_2', roll: '12S-02', name: 'Kareena Kapoor', status: 'PRESENT', busId: 'BUS-02', avatarInitials: 'KK' },
    { id: 'st_12_3', roll: '12S-03', name: 'Ranbir Kapoor', status: 'PRESENT', busId: 'BUS-04', avatarInitials: 'RK' },
    { id: 'st_12_4', roll: '12S-04', name: 'Shraddha Kapoor', status: 'ABSENT', busId: 'BUS-01', avatarInitials: 'SK' }
  ]
};

export const INITIAL_ABSENT_FACULTY = [
  { id: 'fac_1', name: 'Mr. R. K. Verma', department: 'Physics & Senior Sciences', leaveType: 'Medical Casual' },
  { id: 'fac_2', name: 'Mrs. Anjali Sengupta', department: 'English Literature', leaveType: 'Official Duty (CBSE Inspection)' },
  { id: 'fac_3', name: 'Mr. Amitav Ghosh', department: 'Social Sciences', leaveType: 'Personal Casual' }
];

// Faculty / Teacher Campus Gate Attendance Logs
export const INITIAL_TEACHER_ATTENDANCE_LOGS = [
  {
    id: 'tlog_1',
    date: 'Today (19 Sep 2026)',
    checkInTime: '07:42 AM',
    gate: 'Main Campus Gate A (North)',
    shift: 'Morning Shift (07:45 AM - 02:30 PM)',
    status: 'ON_TIME',
    assignedWing: 'Academic Block 2 • Room 204',
    temperature: '98.4°F (Normal)',
    remarks: 'Reported for 1st period Mathematics & Class 8-A morning roll-call.'
  },
  {
    id: 'tlog_2',
    date: '18 Sep 2026',
    checkInTime: '07:40 AM',
    gate: 'Main Campus Gate A (North)',
    shift: 'Morning Shift (07:45 AM - 02:30 PM)',
    status: 'ON_TIME',
    assignedWing: 'Academic Block 2 • Room 204',
    temperature: '98.2°F (Normal)',
    remarks: 'Punched in on schedule.'
  }
];

export const INITIAL_NOTICES = [
  {
    id: 'not_1',
    title: 'Term 1 CBSE Mid-Term Examination Schedule Released',
    date: 'Today, 09:30 AM',
    category: 'Examinations',
    targetAudience: 'Students & Parents',
    badgeColor: 'blue',
    content: 'The official datesheet for the Term 1 Mid-Term examinations has been finalized. Assessments commence from October 4th. Download syllabus revisions from Classroom Connect.',
    pinned: true
  },
  {
    id: 'not_2',
    title: 'Inter-School Annual Sports Meet & Track Trials',
    date: 'Yesterday',
    category: 'Sports & Co-curricular',
    targetAudience: 'All Campus',
    badgeColor: 'emerald',
    content: 'Athletic selection trials for Under-14 and Under-17 categories will be conducted this Friday on the central grounds starting 7:30 AM. Sports kits mandatory.',
    pinned: false
  }
];

export const INITIAL_BUSES = [
  {
    id: 'BUS-01',
    busNumber: 'BUS-01',
    plateNumber: 'DL-01-AB-4029',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    route: 'Route #4 (South Corridor)',
    status: 'STANDBY',
    speed: 0,
    etaMinutes: 15,
    lastCoordinate: { lat: 28.61842, lng: 77.21568 },
    capacity: '32 / 36 Enrolled',
    stops: [
      { name: 'Central Campus Gate', time: '07:15 AM', status: 'SCHEDULED' },
      { name: 'Sector 14 Metro Station', time: '07:35 AM', status: 'SCHEDULED' },
      { name: 'Green Park Avenue', time: '07:55 AM', status: 'SCHEDULED' },
      { name: 'Maple Heights (Aarav Stop)', time: '08:15 AM', status: 'SCHEDULED', isChildStop: true },
      { name: 'Lotus Valley Junction', time: '08:30 AM', status: 'SCHEDULED' },
      { name: 'RAVS Senior School', time: '08:45 AM', status: 'SCHEDULED' }
    ]
  },
  {
    id: 'BUS-02',
    busNumber: 'BUS-02',
    plateNumber: 'DL-01-CD-8192',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 11223',
    route: 'Route #2 (North Campus Link)',
    status: 'ON_ROUTE',
    speed: 28,
    etaMinutes: 22,
    lastCoordinate: { lat: 28.6341, lng: 77.2285 },
    capacity: '28 / 32 Enrolled',
    stops: [
      { name: 'Model Town Crossing', time: '07:20 AM', status: 'PASSED' },
      { name: 'Civil Lines Roundabout', time: '07:45 AM', status: 'PASSED' },
      { name: 'Kalyan Vihar', time: '08:10 AM', status: 'PASSED' },
      { name: 'RAVS Senior School', time: '08:35 AM', status: 'SCHEDULED' }
    ]
  }
];

// Clean Essential Faculty Chat (No noisy demo messages)
export const INITIAL_FACULTY_CHATS = [
  {
    id: 'fc_1',
    sender: 'Dr. Arvind Sharma (Principal)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    time: '08:00 AM',
    message: 'Welcome teachers! Please complete your Gate QR Clock-In and upload required class revision notes to your respective classrooms.',
    isSelf: false,
    roleTag: 'Admin'
  }
];

// Notes with image / file attachments support
export const INITIAL_CLASS_NOTES = [
  {
    id: 'cn_1',
    subject: 'Mathematics',
    title: 'Chapter 4: Quadratic Equations & Formula Proof',
    teacher: 'Priya Sharma',
    time: 'Yesterday, 02:40 PM',
    downloads: 38,
    targetClassId: '8A',
    targetClassName: 'Class 8-A',
    summary: 'Standard form ax² + bx + c = 0, derivation of discriminant Δ = b² - 4ac, and 10 practice problems.',
    fileType: 'PDF',
    fileName: 'Quadratic_Equations_Formula_Sheet.pdf',
    fileSize: '1.8 MB',
    fileData: null
  },
  {
    id: 'cn_2',
    subject: 'Science (Biology)',
    title: 'Photosynthesis Chloroplast Anatomy Diagram',
    teacher: 'Kavita Chawla',
    time: '17 Sep 2026',
    downloads: 42,
    targetClassId: '8A',
    targetClassName: 'Class 8-A',
    summary: 'High-resolution anatomical diagram of plant thylakoid membranes, stroma, and chlorophyll light reactions.',
    fileType: 'IMAGE',
    fileName: 'chloroplast_diagram_hd.jpg',
    fileSize: '2.4 MB',
    fileData: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'cn_3',
    subject: 'Social Science',
    title: 'Rise of Nationalism in Europe Mindmap',
    teacher: 'Sanjay Deshpande',
    time: '16 Sep 2026',
    downloads: 45,
    targetClassId: '10A',
    targetClassName: 'Class 10-A (CBSE)',
    summary: 'Treaty of Vienna (1815), French Revolution ripple effects, and unification milestones.',
    fileType: 'PDF',
    fileName: 'Nationalism_In_Europe_Mindmap.pdf',
    fileSize: '3.1 MB',
    fileData: null
  }
];

export const PRESET_AI_KNOWLEDGE = {
  'Explain photosynthesis in simple steps': {
    title: 'Photosynthesis Explained (CBSE Grade 8-10)',
    steps: [
      '**1. Light Absorption**: Chlorophyll inside green plant chloroplasts absorbs sunlight (photons).',
      '**2. Water Splitting**: Roots absorb water (H₂O) from soil, which is split into hydrogen and oxygen (released into air).',
      '**3. Carbon Fixation**: Leaves intake Carbon Dioxide (CO₂) through microscopic pores called stomata.',
      '**4. Glucose Production**: Chemical energy converts CO₂ and Hydrogen into Glucose (C₆H₁₂O₆) to nourish the plant.',
      '**Formula**: `6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂`'
    ],
    examTip: 'Remember: Light reactions occur in thylakoid membranes, while dark reactions (Calvin cycle) occur in the stroma.'
  },
  'Solve quadratic equation: 2x² + 5x - 3 = 0': {
    title: 'Step-by-Step Quadratic Equation Solution',
    steps: [
      '**Equation**: `2x² + 5x - 3 = 0` (Standard form `ax² + bx + c = 0`, where a = 2, b = 5, c = -3).',
      '**1. Find Discriminant**: `Δ = b² - 4ac = (5)² - 4(2)(-3) = 25 + 24 = 49`.',
      '**2. Real Roots Check**: Since `Δ = 49 > 0` and is a perfect square (√49 = 7), the roots are real and rational.',
      '**3. Apply Quadratic Formula**: `x = (-b ± √Δ) / 2a = (-5 ± 7) / (2 × 2) = (-5 ± 7) / 4`.',
      '**Case 1 (+)**: `x = (-5 + 7) / 4 = 2 / 4 = 1/2` (or 0.5)',
      '**Case 2 (-)**: `x = (-5 - 7) / 4 = -12 / 4 = -3`',
      '**Final Answer**: Roots are `x = 1/2` and `x = -3`.'
    ],
    examTip: 'You can verify by substituting x = -3: 2(-3)² + 5(-3) - 3 = 2(9) - 15 - 3 = 18 - 18 = 0. Verified!'
  }
};

// Clean Starter Classroom Chat (1 official teacher welcome)
export const INITIAL_CLASS_CHATS = {
  '8A': [
    {
      id: 'cc_1',
      sender: 'Priya Sharma (Class Teacher)',
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      time: '08:15 AM',
      message: 'Welcome Class 8-A students. Check your notes tab for new Mathematics handouts and ask any homework questions here.',
      badge: 'Teacher Announcement'
    }
  ]
};
