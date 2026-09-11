import { useState, useEffect } from 'react'

/**
 * Returns a "debounced" copy of `value` that only updates once `value`
 * has stopped changing for `delay` ms. Useful for search inputs: the
 * input itself updates instantly (no lag while typing), but the value
 * used to trigger an API call only updates after the user pauses.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)

    // every time value changes, cancel the pending timer and start a new one
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
