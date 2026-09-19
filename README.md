# RAVS Smart School (SMS)

> **Unified Campus Management & Connected Fleet Telemetry Ecosystem**  
> *Mobile-first Progressive Web Application (PWA) built from Stitch project `8284308281264775318`.*

---

## 📱 Overview

**RAVS Smart School (SMS)** is an integrated digital campus and connected student transportation platform. It bridges the gap between school administration, classroom teachers, students, parents, and school bus drivers into a singular, high-reliability mobile application.

### Key Highlights
- 🔐 **5 Distinct Personas**: Role-Based Access Control (Admin, Teacher, Student, Parent, Driver) with instant 1-tap fast demo authentication.
- 🚌 **Connected Fleet GPS Telemetry**: Real-time vehicle coordinate streaming from in-cab driver devices (`navigator.geolocation.watchPosition` with route fallback simulation).
- 📍 **Privacy-Scoped Parent Transit View**: Live vector map strictly centered on the enrolled child's vehicle (`BUS-01`), dynamic ETA countdown, speed gauge, and driver card.
- 🤖 **Pedagogical AI Study Assistant**: Syllabus-aligned 24/7 CBSE doubt solver ("Ask Doubt with AI") with step-by-step derivations, formula proofs, exam tips, and simulated voice/photo attachments.
- 📋 **Zero-Friction Roll Call**: 1-tap Present / Absent / Late attendance roster for teachers with instant cloud sync to administrative audit dashboards and parent alerts.
- 📢 **Campus Circular Center**: Official notice composer and broadcasting engine categorized by audience (All Campus, Teachers, Students, Parents).
- ⚡ **Real-Time Cross-Tab Synchronization**: `BroadcastChannel` reactive data store ensuring multi-window updates in real-time without manual refreshing.
- 📲 **Mobile Viewport Frame**: Realistic smartphone mockup shell with live time, battery, 5G status bar, and a toggle between **📱 Mobile Frame** and **💻 Full Width** desktop mode.

---

## 👥 Personas & Features

| Persona | Key Workflows & Features |
| :--- | :--- |
| **👑 Administrator** | Campus-wide overview, 2x2 primary grid, student headcount audit, non-judgmental absent faculty tracking, circular broadcast composer, direct teacher chat, and multi-bus fleet satellite map. |
| **👩‍🏫 Teacher** | Class 8-A home dashboard, period schedule, 1-tap attendance roll-call with "Mark All Present", and faculty collaboration room. |
| **🎒 Student** | Daily study dashboard, assigned bus widget, Class 8-A downloadable study handouts, circulars stream, and the **AI Study Assistant**. |
| **👨‍👩‍👧 Parent** | Privacy-enforced live GPS bus tracking for `BUS-01`, dynamic ETA, driver card (Rajesh Kumar), 1-tap emergency call, and verified morning boarding status. |
| **🚌 Driver** | Ergonomic in-cab transit cockpit, big touch buttons, hardware/simulated GPS beacon broadcaster, speed telemetry, and route milestone stop checklist. |

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Tailwind CSS design tokens + Vanilla CSS variables & mobile ergonomics
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [Inter](https://fonts.google.com/specimen/Inter)
- **Icons**: [Lucide React](https://lucide.dev/) & [Google Material Symbols](https://fonts.google.com/icons)
- **State Management**: Reactive React Context (`SchoolContext`) with `localStorage` persistence and `BroadcastChannel` real-time sync
- **PWA Ready**: Web app manifest (`manifest.json`) and vector favicon

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/sujal092005/SMS.git
cd SMS

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
SMS/
├── public/
│   ├── favicon.svg             # Official RAVS Smart School SVG emblem
│   └── manifest.json           # PWA web manifest
├── src/
│   ├── main.jsx                # Application root
│   ├── App.jsx                 # Main application shell & persona router
│   ├── context/
│   │   └── SchoolContext.jsx   # Reactive store (attendance, notices, GPS telemetry, chats)
│   ├── mockData/
│   │   └── schoolData.js       # Prepopulated realistic data from Stitch PRD
│   ├── styles/
│   │   └── index.css           # Global tokens & mobile keyframe animations
│   └── components/
│       ├── common/
│       │   ├── DeviceFrame.jsx # Mobile notch wrapper with toggle
│       │   ├── TopHeader.jsx   # Institutional bar & profile menu
│       │   ├── BottomNav.jsx   # Role-tailored navigation
│       │   └── Toast.jsx       # Alert notifications
│       ├── auth/
│       │   └── SignInScreen.jsx# 5-role picker & 1-tap demo logins
│       ├── admin/
│       │   ├── AdminHome.jsx
│       │   ├── AdminAttendance.jsx
│       │   ├── AdminNotices.jsx
│       │   ├── AdminChat.jsx
│       │   └── AdminFleet.jsx
│       ├── teacher/
│       │   ├── TeacherHome.jsx
│       │   └── AttendanceRoster.jsx
│       ├── student/
│       │   ├── StudentHome.jsx
│       │   ├── AIDoubtAssistant.jsx
│       │   ├── ClassChatbox.jsx
│       │   └── StudentNotices.jsx
│       ├── parent/
│       │   ├── ParentBusTracker.jsx
│       │   └── ParentDashboard.jsx
│       └── driver/
│           └── DriverTripController.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 📄 License
MIT License. Crafted for RAVS Smart School.
