import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchCart } = useCart()
  const { addToast } = useToast()
  const [adding, setAdding] = useState(false)

  const addToCart = async (e) => {
    e.stopPropagation()
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 })
      await fetchCart()
      addToast(`${product.name} added to cart`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding to cart', 'error')
    } finally { setAdding(false) }
  }

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 200, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem' }}>🛍️</span>}
      </div>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--indigo-light)', marginBottom: '0.3rem' }}>
          {product.category?.name}
        </p>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {avgRating && (
          <p style={{ fontSize: '0.78rem', color: 'var(--warning)', marginBottom: '0.4rem' }}>
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              {avgRating} ({product.reviews.length})
            </span>
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--indigo-light)' }}>
            ₹{product.price.toLocaleString()}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={addToCart}
            disabled={adding || product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : adding ? '...' : 'Add to Cart'}
          </button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.4rem' }}>
            Only {product.stock} left
          </p>
        )}
      </div>
    </div>
  )
}