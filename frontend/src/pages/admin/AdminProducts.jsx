import { useEffect, useState } from 'react'
import api from '../../services/api'
import Spinner from '../../components/Spinner'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = async () => {
    const [pr, cr] = await Promise.all([api.get('/products?limit=100'), api.get('/categories')])
    setProducts(pr.data.products)
    setCategories(cr.data.categories)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const reset = () => { setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' }); setEditId(null); setError('') }

  const submit = async () => {
    setError(''); setSuccess('')
    if (!form.name || !form.price || !form.categoryId) return setError('Name, price and category are required')
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form)
        setSuccess('Product updated')
      } else {
        await api.post('/products', form)
        setSuccess('Product created')
      }
      reset(); fetchAll()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) { setError(err.response?.data?.message || 'Error') }
  }

  const startEdit = (p) => {
    setEditId(p.id)
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, imageUrl: p.imageUrl || '', categoryId: p.categoryId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchAll()
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <h1 className="page-title">Manage Products</h1>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group"><label className="label">Name *</label><input className="input" name="name" value={form.name} onChange={handle} /></div>
          <div className="form-group">
            <label className="label">Category *</label>
            <select className="input" name="categoryId" value={form.categoryId} onChange={handle}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Price (₹) *</label><input className="input" name="price" type="number" value={form.price} onChange={handle} /></div>
          <div className="form-group"><label className="label">Stock</label><input className="input" name="stock" type="number" value={form.stock} onChange={handle} /></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Description</label><textarea className="input" name="description" rows={2} value={form.description} onChange={handle} /></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="label">Image URL</label><input className="input" name="imageUrl" value={form.imageUrl} onChange={handle} /></div>
        </div>
        {error && <p className="error-msg" style={{ marginBottom: '0.75rem' }}>{error}</p>}
        {success && <p className="success-msg" style={{ marginBottom: '0.75rem' }}>{success}</p>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={submit}>{editId ? 'Update Product' : 'Add Product'}</button>
          {editId && <button className="btn btn-secondary" onClick={reset}>Cancel</button>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>All Products ({products.length})</h3>
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.category?.name}</td>
                <td>₹{p.price.toLocaleString()}</td>
                <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}