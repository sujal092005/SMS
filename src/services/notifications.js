// Push Notification Service for RAVS Smart School
// Integrates WhatsApp-style Heads-Up Banners (Capacitor LocalNotifications + PushNotifications + Web API)
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

let notificationPermission = 'default';

/**
 * Initialize High-Importance WhatsApp-style Notification Channel on Android
 */
async function setupNativeChannels() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.createChannel({
        id: 'ravs_high_alerts',
        name: 'RAVS Campus Urgent Alerts',
        description: 'High priority heads-up notifications for attendance, notices & bus tracking',
        importance: 5, // IMPORTANCE_HIGH (displays heads-up banner over apps, sound & vibration)
        visibility: 1, // VISIBILITY_PUBLIC (shows on lock screen)
        vibration: true,
        sound: 'default'
      });
      console.log('[Native Push] High Importance Notification Channel Created');
    } catch (err) {
      console.warn('[Native Push] Channel creation warning:', err.message);
    }
  }
}

// Auto-run channel creation
setupNativeChannels();

/**
 * Request notification permission from the user (Native Android + Web)
 */
export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      const localReq = await LocalNotifications.requestPermissions();
      const pushStatus = await PushNotifications.checkPermissions();
      if (pushStatus.receive === 'prompt' || pushStatus.receive === 'prompt-with-rationale') {
        const req = await PushNotifications.requestPermissions();
        if (req.receive === 'granted') {
          await PushNotifications.register();
        }
      } else if (pushStatus.receive === 'granted') {
        await PushNotifications.register();
      }
      return localReq.display === 'granted';
    } catch (e) {
      console.warn('[Native Push] Permission request error:', e.message);
    }
  }

  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported in this browser');
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    notificationPermission = result;
    return result === 'granted';
  } catch (err) {
    console.warn('[Notifications] Permission error:', err);
    return false;
  }
}

/**
 * Show a WhatsApp-style heads-up banner notification (Native Android + Web)
 */
export async function showNotification(title, body, options = {}) {
  // Always dispatch in-app notification event for React toast
  window.dispatchEvent(new CustomEvent('ravs-notification', {
    detail: { title, body, icon: options.icon || '📢', tag: options.tag || '', timestamp: Date.now() }
  }));

  // Trigger Native Android Heads-Up Banner Notification (WhatsApp Style)
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 100000) + 1,
            channelId: 'ravs_high_alerts', // High priority channel -> Heads-up banner
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
            actionTypeId: '',
            extra: options
          }
        ]
      });
      return;
    } catch (nativeErr) {
      console.warn('[Native Push] Schedule error:', nativeErr.message);
    }
  }

  if (!('Notification' in window) || notificationPermission !== 'granted') {
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
