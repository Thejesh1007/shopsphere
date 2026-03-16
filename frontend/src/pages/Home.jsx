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
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '5rem 1.5rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Shop the <span style={{ color: 'var(--indigo-light)' }}>Future</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Discover premium products at unbeatable prices. Fast delivery, easy returns.
          </p>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
            onClick={() => navigate('/products')}>
            Shop Now →
          </button>
        </div>
      </div>

      <div className="page">
        {categories.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>Shop by Category</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat.id} className="btn btn-secondary"
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>Latest Products</h2>
        {loading ? <Spinner /> : (
          <div className="grid-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}