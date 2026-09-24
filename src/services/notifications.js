// Push Notification Service for RAVS Smart School
// Uses Web Notifications API + Firestore listeners
// Works in browser and Capacitor Android WebView

let notificationPermission = 'default';

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported in this browser');
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    notificationPermission = result;
    console.log('[Notifications] Permission:', result);
    return result === 'granted';
  } catch (err) {
    console.warn('[Notifications] Permission error:', err);
    return false;
  }
}

/**
 * Show a local push notification
 */
export function showNotification(title, body, options = {}) {
  // Also dispatch a custom event for in-app notification toast
  window.dispatchEvent(new CustomEvent('ravs-notification', {
    detail: { title, body, icon: options.icon || '📢', tag: options.tag || '', timestamp: Date.now() }
  }));

  if (!('Notification' in window) || notificationPermission !== 'granted') {
    console.log('[Notifications] In-app only:', title, body);
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: options.tag || `ravs-${Date.now()}`,
      vibrate: [200, 100, 200],
      requireInteraction: options.persistent || false,
      ...options
    });

    // Auto-close after 8 seconds
    setTimeout(() => notification.close(), 8000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('[Notifications] Show error:', err);
  }
}

// ─── Specific notification helpers ───────────────────────────────────────────

export function notifyBusTripStarted(busNumber, driverName, route) {
  showNotification(
    '🚌 Bus Trip Started!',
    `Bus ${busNumber} has started its route${route ? ` (${route})` : ''}. Driver: ${driverName || 'Assigned Driver'}`,
    { tag: `bus-start-${busNumber}` }
  );
}

export function notifyBusTripEnded(busNumber) {
  showNotification(
    '🏫 Bus Trip Ended',
    `Bus ${busNumber} has reached the destination and stopped.`,
    { tag: `bus-end-${busNumber}` }
  );
}

export function notifyBusNearby(busNumber, minutesAway) {
  showNotification(
    '📍 Bus Arriving Soon!',
    `Bus ${busNumber} is approximately ${minutesAway} minutes away from the stop.`,
    { tag: `bus-nearby-${busNumber}`, persistent: true }
  );
}

export function notifyAttendanceMarked(studentName, status, className) {
  const statusEmoji = status === 'present' ? '✅' : status === 'absent' ? '❌' : '⏰';
  showNotification(
    `${statusEmoji} Attendance: ${studentName}`,
    `${studentName} has been marked ${status.toUpperCase()} in ${className || 'class'} today.`,
    { tag: `attendance-${studentName}-${Date.now()}` }
  );
}

export function notifyNewNote(title, subject, teacherName) {
  showNotification(
    '📝 New Note Uploaded!',
    `${teacherName || 'Teacher'} uploaded "${title}" for ${subject || 'your class'}.`,
    { tag: `note-${Date.now()}` }
  );
}

export function notifyNewFile(fileName, subject) {
  showNotification(
    '📎 New File Shared!',
    `New file "${fileName}" uploaded for ${subject || 'your class'}.`,
    { tag: `file-${Date.now()}` }
  );
}

export function notifyNewNotice(title) {
  showNotification(
    '📢 New School Notice!',
    title || 'A new notice has been posted. Check the announcements section.',
    { tag: `notice-${Date.now()}`, persistent: true }
  );
}

export function notifyNewMessage(senderName, preview) {
  showNotification(
    `💬 Message from ${senderName || 'School'}`,
    preview || 'You have a new message. Tap to read.',
    { tag: `message-${Date.now()}` }
  );
}
