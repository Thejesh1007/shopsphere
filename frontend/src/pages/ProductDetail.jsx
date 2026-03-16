import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchCart } = useCart()
  const { addToast } = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const fetchProduct = () => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProduct() }, [id])

  const addToCart = async () => {
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await api.post('/cart', { productId: product.id, quantity })
      await fetchCart()
      addToast(`${product.name} added to cart`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding to cart', 'error')
    } finally { setAdding(false) }
  }

  const toggleWishlist = async () => {
    if (!user) return navigate('/login')
    try {
      const res = await api.post(`/wishlist/${product.id}`)
      setWishlisted(res.data.wishlisted)
      addToast(res.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist', 'info')
    } catch { }
  }

  const submitReview = async () => {
    if (!user) return navigate('/login')
    setSubmittingReview(true)
    try {
      await api.post(`/reviews/${product.id}`, review)
      addToast('Review submitted!', 'success')
      setReview({ rating: 5, comment: '' })
      fetchProduct()
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting review', 'error')
    } finally { setSubmittingReview(false) }
  }

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`)
      addToast('Review deleted', 'success')
      fetchProduct()
    } catch { }
  }

  if (loading) return <Spinner />
  if (!product) return null

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  const alreadyReviewed = product.reviews?.some(r => r.user.id === user?.id)

  return (
    <div className="page">
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>← Back</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '6rem' }}>🛍️</span>}
        </div>
        <div>
          <p style={{ color: 'var(--indigo-light)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{product.category?.name}</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h1>
          {avgRating && (
            <p style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>
              ★ {avgRating} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.reviews.length} reviews)</span>
            </p>
          )}
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--indigo-light)', margin: '1rem 0' }}>₹{product.price.toLocaleString()}</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{product.description}</p>
          <p style={{ fontSize: '0.85rem', color: product.stock > 5 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--danger)', marginBottom: '1rem' }}>
            {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : `In Stock (${product.stock})`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span style={{ minWidth: 32, textAlign: 'center' }}>{quantity}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary" onClick={addToCart} disabled={adding || product.stock === 0} style={{ flex: 1 }}>
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="btn btn-secondary" onClick={toggleWishlist} title="Wishlist">
              {wishlisted ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          Reviews {product.reviews?.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({product.reviews.length})</span>}
        </h2>

        {user && !alreadyReviewed && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Write a Review</h3>
            <div className="form-group">
              <label className="label">Rating</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setReview(r => ({ ...r, rating: star }))} style={{
                    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                    color: star <= review.rating ? 'var(--warning)' : 'var(--text-muted)',
                    padding: '0.1rem'
                  }}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Comment (optional)</label>
              <textarea className="input" rows={3} placeholder="Share your thoughts..."
                value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {product.reviews?.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <h3>No reviews yet</h3>
            <p>Be the first to review this product</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {product.reviews.map(r => (
              <div key={r.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{r.user.name}</span>
                    <span style={{ color: 'var(--warning)', marginLeft: '0.75rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {(user?.id === r.user.id || user?.role === 'admin') && (
                    <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>Delete</button>
                  )}
                </div>
                {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}