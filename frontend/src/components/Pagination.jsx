/**
 * Reusable pagination controls.
 * Props:
 *   currentPage - the page currently shown (1-indexed)
 *   totalPages  - total number of pages available
 *   onPageChange(page) - called with the new page number when the user acts
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="pagination">
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className="pagination-numbers">
        {pages.map(p => (
          <button
            key={p}
            className={`pagination-number ${p === currentPage ? 'pagination-number-active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      <span className="pagination-label">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}
