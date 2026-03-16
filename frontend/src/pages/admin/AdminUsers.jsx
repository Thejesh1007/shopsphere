import { useEffect, useState } from 'react'
import api from '../../services/api'
import Spinner from '../../components/Spinner'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: me } = useAuth()

  const fetchUsers = () => {
    api.get('/admin/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { await api.delete(`/admin/users/${id}`); fetchUsers() } catch (err) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <h1 className="page-title">Manage Users</h1>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name} {u.id === me.id && <span style={{ fontSize: '0.7rem', color: 'var(--indigo-light)' }}>(you)</span>}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-secondary'}`}>{u.role}</span></td>
                <td>{u._count.orders}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.id !== me.id && u.role !== 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}