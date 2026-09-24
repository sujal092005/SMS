import { useState, useEffect, useCallback } from 'react';

/**
 * In-app notification toast that appears at the top of the screen.
 * Listens for 'ravs-notification' custom events dispatched by the notification service.
 */
export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { title, body, icon, timestamp } = e.detail;
      const id = `toast-${timestamp}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts(prev => [...prev.slice(-4), { id, title, body, icon, timestamp }]);
      // Auto-remove after 6 seconds
      setTimeout(() => removeToast(id), 6000);
    };
    window.addEventListener('ravs-notification', handler);
    return () => window.removeEventListener('ravs-notification', handler);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 12, right: 12, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 8,
      maxWidth: 360, width: '90vw', pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          style={{
            pointerEvents: 'auto', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            color: '#fff', borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.35)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{toast.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>
              {toast.title}
            </div>
            <div style={{
              fontSize: 12, opacity: 0.85, lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
            }}>
              {toast.body}
            </div>
          </div>
          <span style={{ fontSize: 16, opacity: 0.6, cursor: 'pointer', padding: '0 4px' }}>✕</span>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
