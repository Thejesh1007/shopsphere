import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Spinner from '../../components/Spinner'

const statusBadge = (s) => {
  const map = { pending: 'badge-warning', confirmed: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' }
  return map[s] || 'badge-secondary'
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/stats')
        setData(res.data)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <Spinner />

  const { stats, recentOrders, lowStockProducts } = data

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
    { label: 'Products', value: stats.totalProducts, icon: '📦' },
    { label: 'Orders', value: stats.totalOrders, icon: '🛒' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰' },
  ]

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/products')}>Manage Products</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/orders')}>Manage Orders</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>Manage Users</button>
        </div>
      </div>

      {/* Stat cards — responsive grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--indigo-light)' }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>
          ) : (
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.user.name}</td>
                    <td>₹{o.total.toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Low Stock Alert</h3>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--success)' }}>All products well stocked</p>
          ) : (
            <table>
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}