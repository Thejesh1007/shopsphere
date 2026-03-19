import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8'),
      api.get('/categories')
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.products)
      setCategories(cRes.data.categories)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-hover) 50%, var(--bg-card) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '20px', padding: '4px 14px', marginBottom: '24px',
            fontSize: '11px', fontWeight: '700', color: 'var(--indigo-light)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            ✦ Free delivery on all orders
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800, lineHeight: 1.15,
            marginBottom: '1rem', letterSpacing: '-0.02em',
          }}>
            Shop the <span style={{ color: 'var(--indigo-light)' }}>Future</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '1.05rem',
            marginBottom: '2rem', lineHeight: 1.7,
          }}>
            Discover premium products at unbeatable prices. Fast delivery, easy returns.
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
            onClick={() => navigate('/products')}
          >
            Shop Now →
          </button>
        </div>
      </div>

      <div className="page">
        {/* Categories */}
        {categories.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              SHOP BY CATEGORY
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          LATEST PRODUCTS
        </h2>
        {loading ? <Spinner /> : (
          <div className="grid-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}