import { useEffect, useState } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import { useDebounce } from '../hooks/useDebounce'

const PAGE_SIZE = 8

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // the input updates instantly; only this debounced value triggers a fetch
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  // if the user is on page 4 and changes a filter, jump back to page 1 -
  // otherwise they could land on a page that no longer has any results
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, category, sort])

  useEffect(() => {
    setLoading(true)
    const params = { page: currentPage, limit: PAGE_SIZE }
    if (category) params.category = category
    if (debouncedSearch) params.search = debouncedSearch
    if (sort) params.sort = sort

    api.get('/products', { params })
      .then(res => {
        setProducts(res.data.products)
        setTotalPages(res.data.total_pages)
        setTotal(res.data.total)
        setError('')
      })
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [currentPage, debouncedSearch, category, sort])

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Sort: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <p className="result-count">
          Showing {products.length} of {total} product{total === 1 ? '' : 's'}
        </p>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
