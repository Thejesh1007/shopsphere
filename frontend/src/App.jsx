import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.message))
      .catch(() => setStatus('Backend not reachable'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f13',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        🛍️ ShopSphere
      </h1>
      <p style={{ color: '#a0a0b0', fontSize: '1rem' }}>
        API Status: <span style={{ color: '#6366f1' }}>{status}</span>
      </p>
    </div>
  )
}

export default App