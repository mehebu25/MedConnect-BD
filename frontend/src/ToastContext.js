import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let id = 0;
const recentToasts = new Map();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const dedupeKey = `${type}:${message}`;
    const now = Date.now();
    const lastSeen = recentToasts.get(dedupeKey);

    if (lastSeen && now - lastSeen < 4000) {
      return;
    }

    recentToasts.set(dedupeKey, now);
    const key = ++id;
    setToasts(p => [...p, { key, message, type }]);
    setTimeout(() => {
      setToasts(p => p.filter(t => t.key !== key));
      if (recentToasts.get(dedupeKey) === now) {
        recentToasts.delete(dedupeKey);
      }
    }, duration);
  }, []);

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.key} className={`toast toast-${t.type}`}>
            <span style={{ fontSize: '1rem' }}>{icons[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
