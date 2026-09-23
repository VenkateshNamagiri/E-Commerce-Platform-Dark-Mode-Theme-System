import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    // 1. Check localStorage first - the user's explicit choice wins
    const saved = localStorage.getItem('theme')
    if (saved) return saved

    // 2. Fall back to the OS/browser-level preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    // Applying data-theme on <html> is what makes every CSS variable
    // in index.css switch at once - no per-component changes needed.
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
