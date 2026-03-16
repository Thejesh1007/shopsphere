import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999
      }}>
        {toasts.map(t => (
          <div key={t.id} onClick={() => removeToast(t.id)} style={{
            padding: '0.75rem 1.2rem', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 500, minWidth: 220, maxWidth: 340,
            background: t.type === 'success' ? '#14532d' : t.type === 'error' ? '#450a0a' : '#1e1b4b',
            color: t.type === 'success' ? '#86efac' : t.type === 'error' ? '#fca5a5' : '#a5b4fc',
            border: `1px solid ${t.type === 'success' ? '#166534' : t.type === 'error' ? '#7f1d1d' : '#3730a3'}`,
            animation: 'slideIn 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : 'ℹ '}{t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)