import { useEffect, useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'

const statusBadge = (s) => {
  const map = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' }
  return map[s] || 'badge-secondary'
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="page">
      <h1 className="page-title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state"><h3>No orders yet</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>Order #{order.id}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
                  <p style={{ fontWeight: 700, color: 'var(--indigo-light)', marginTop: '0.3rem' }}>₹{order.total.toLocaleString()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {order.orderItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.85rem' }}>
                    <span>{item.product.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {order.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}