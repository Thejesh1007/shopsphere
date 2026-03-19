import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/Skeleton'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryId = searchParams.get('categoryId') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search) params.set('search', search)
      if (categoryId) params.set('categoryId', categoryId)
      const res = await api.get(`/products?${params}`)
      setProducts(res.data.products)
      setPagination(res.data.pagination)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories))
  }, [])

  useEffect(() => { fetchProducts() }, [page, categoryId])

  const handleSearch = () => {
    setSearchParams({})
    fetchProducts()
  }

  return (
    <div className="page">
      <h1 className="page-title">All Products</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 200 }}>
          <input
            className="input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 160 }}
          value={categoryId}
          onChange={e => setSearchParams(e.target.value ? { categoryId: e.target.value } : {})}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <>
          <div className="grid-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setSearchParams({ page: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}