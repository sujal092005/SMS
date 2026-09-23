// IndexedDB Persistent Storage for RAVS Smart School Notes & Files
// Allows unlimited size file attachments (PDFs, Docs, Images) offline and locally

const DB_NAME = 'RAVS_SCHOOL_STORAGE';
const DB_VERSION = 1;
const STORE_NAME = 'noteFiles';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB open error:', request.error);
      resolve(null);
    };
  });
}

export async function saveNoteFileToStorage(noteId, file, meta = {}) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: noteId,
        fileBlob: file,
        name: file.name || meta.fileName || 'note_document',
        type: file.type || meta.fileType || 'application/octet-stream',
        size: file.size || meta.fileSize || 0,
        savedAt: Date.now(),
        ...meta
      };
      store.put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.warn('Failed to save file to IndexedDB:', tx.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('IndexedDB save error:', err);
    return false;
  }
}

export async function getNoteFileFromStorage(noteId) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(noteId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function downloadNoteMaterial(note) {
  if (!note) return false;

  // 1. If Direct Cloud Storage URL exists (http/https)
  if (note.fileUrl && typeof note.fileUrl === 'string' && note.fileUrl.startsWith('http')) {
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || `${note.title || 'study_note'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  // 2. If Base64 Data URL exists
  if (note.fileData && typeof note.fileData === 'string' && note.fileData.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = note.fileData;
    link.download = note.fileName || `${note.title || 'study_note'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  // 3. If stored in local IndexedDB
  if (note.id) {
    const stored = await getNoteFileFromStorage(note.id);
    if (stored && stored.fileBlob) {
      const blobUrl = URL.createObjectURL(stored.fileBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = stored.name || note.fileName || `${note.title || 'study_note'}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      return true;
    }
  }

  // 4. Universal Fallback: Generate structured formatted printable Study Handout document
  const handoutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${note.title || 'Class Study Handout'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; background: #fff; line-height: 1.6; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .school { font-size: 24px; font-weight: 800; color: #1e40af; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; margin-top: 12px; border: 1px solid #bfdbfe; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .meta-item { font-size: 13px; }
    .meta-label { font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; }
    .meta-value { font-weight: 700; color: #0f172a; margin-top: 2px; }
    .content-box { margin-top: 24px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .content-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .summary-text { font-size: 14px; white-space: pre-wrap; color: #334155; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school">RAVS SMART SCHOOL</h1>
    <div class="subtitle">Official Academic Study Handout & Revision Notes</div>
    <div class="badge">${note.subject || 'General Academic'} • Target: ${note.targetClassName || 'All Classes'}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Topic / Note Title</div>
      <div class="meta-value">${note.title || 'Class Handout'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Chapter / Unit</div>
      <div class="meta-value">${note.chapter || 'Comprehensive Unit'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Author / Faculty</div>
      <div class="meta-value">${note.teacher || note.teacherName || 'Faculty Member'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Published Date</div>
      <div class="meta-value">${note.time || note.uploadedAt || new Date().toLocaleDateString('en-IN')}</div>
    </div>
  </div>

  <div class="content-box">
    <div class="content-title">Study Summary & Key Concepts</div>
    <div class="summary-text">${note.summary || 'Study material uploaded for class preparation.'}</div>
  </div>

  <div class="footer">
    Verified Institutional Material • RAVS Smart School Cloud Network • Generated on ${new Date().toLocaleString('en-IN')}
  </div>
</body>
</html>`;

  const blob = new Blob([handoutHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(note.title || 'study_notes').replace(/[^a-zA-Z0-9_-]/g, '_')}_Handout.html`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
  return true;
}
