import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import CryptoJS from 'crypto-js'

export default function Checkout() {
  const { cartItems, subtotal, fetchCart } = useCart()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!address.trim()) return setError('Delivery address is required')
    setLoading(true)
    setError('')
    try {
      const orderRes = await api.post('/orders', { address })
      const order = orderRes.data.order

      const payRes = await api.post('/payments/create-order', { orderId: order.id })
      const { razorpayOrderId } = payRes.data

      const MOCK_SECRET = 'mock_secret_shopsphere_2024'
      const mockPaymentId = `pay_mock_${Date.now()}`
      const signatureBody = razorpayOrderId + '|' + mockPaymentId
      const signature = CryptoJS.HmacSHA256(signatureBody, MOCK_SECRET).toString(CryptoJS.enc.Hex)

      await api.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: signature,
        orderId: order.id
      })

      await fetchCart()
      addToast('Order placed successfully!', 'success')
      navigate('/orders')
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed'
      setError(msg)
      addToast(msg, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <h1 className="page-title">Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Delivery Address</h3>
          <div className="form-group">
            <label className="label">Full Address</label>
            <textarea className="input" rows={4} placeholder="Street, City, State, PIN Code"
              value={address} onChange={e => setAddress(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout} disabled={loading || cartItems.length === 0}>
            {loading ? 'Processing Payment...' : 'Place Order & Pay'}
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            🔒 Secured by mock payment gateway (demo)
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Order Items</h3>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.product.name} × {item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span><span style={{ color: 'var(--indigo-light)' }}>₹{subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}