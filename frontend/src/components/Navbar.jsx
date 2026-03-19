import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const navLink = (to, label) => (
    <Link to={to} style={{
      color: pathname === to ? 'var(--indigo-light)' : 'var(--text-secondary)',
      fontSize: '0.9rem',
      fontWeight: pathname === to ? 600 : 400,
      transition: 'color 0.15s',
    }}>
      {label}
    </Link>
  )

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60,
      }}>
        <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--indigo-light)' }}>
          🛍️ ShopSphere
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {navLink('/products', 'Products')}

          {user && (
            <Link to="/cart" style={{
              color: pathname === '/cart' ? 'var(--indigo-light)' : 'var(--text-secondary)',
              fontSize: '0.9rem', position: 'relative',
            }}>
              Cart
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -10,
                  background: 'var(--indigo)', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: '0.65rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user && navLink('/orders', 'Orders')}
          {isAdmin && navLink('/admin', 'Dashboard')}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {navLink('/profile', 'Profile')}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}