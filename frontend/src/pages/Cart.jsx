import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function Cart() {
  const { cartItems, subtotal, fetchCart } = useCart()
  const navigate = useNavigate()

  const update = async (productId, quantity) => {
    try {
      await api.put(`/cart/${productId}`, { quantity })
      await fetchCart()
    } catch { }
  }

  const remove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`)
      await fetchCart()
    } catch { }
  }

  if (!cartItems) return <Spinner />

  return (
    <div className="page">
      <h1 className="page-title">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Add some products to get started</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'var(--bg-secondary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    : <span style={{ fontSize: '2rem' }}>🛍️</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.product.name}</p>
                  <p style={{ color: 'var(--indigo-light)', fontWeight: 600 }}>₹{item.product.price.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => update(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                  <span style={{ minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => update(item.product.id, item.quantity + 1)}>+</button>
                </div>
                <p style={{ minWidth: 80, textAlign: 'right', fontWeight: 600 }}>₹{(item.product.price * item.quantity).toLocaleString()}</p>
                <button className="btn btn-danger btn-sm" onClick={() => remove(item.product.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Shipping</span><span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
              <span>Total</span><span style={{ color: 'var(--indigo-light)' }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}