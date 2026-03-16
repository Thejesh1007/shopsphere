import { useEffect, useState } from 'react'
import api from '../../services/api'
import Spinner from '../../components/Spinner'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusBadge = (s) => {
  const map = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' }
  return map[s] || 'badge-secondary'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    api.get('/admin/orders?limit=50').then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      fetchOrders()
    } finally { setUpdating(null) }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <h1 className="page-title">Manage Orders</h1>
      <div className="card">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 500 }}>#{o.id}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</span></td>
                <td><p style={{ fontWeight: 500 }}>{o.user.name}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.user.email}</p></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{o.orderItems.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}</td>
                <td style={{ fontWeight: 600 }}>₹{o.total.toLocaleString()}</td>
                <td><span className={`badge ${o.payment?.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{o.payment?.status || 'unpaid'}</span></td>
                <td>
                  <select className="input" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                    value={o.status} onChange={e => updateStatus(o.id, e.target.value)} disabled={updating === o.id}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}