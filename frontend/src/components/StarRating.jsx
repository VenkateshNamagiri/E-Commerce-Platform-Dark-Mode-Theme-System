export function StarDisplay({ rating, count, hideCount }) {
  const rounded = Math.round(rating || 0)
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rounded ? 'star star-filled' : 'star'}>★</span>
      ))}
      {!hideCount && (
        count > 0 ? (
          <span className="star-count">({count})</span>
        ) : (
          <span className="star-count">No ratings yet</span>
        )
      )}
    </div>
  )
}

export function StarInput({ value, onChange }) {
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={n <= value ? 'star star-filled' : 'star'}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  )
}
