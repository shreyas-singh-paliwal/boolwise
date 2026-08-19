import { useEffect, useState } from 'react';
import './ThemeToggle.css';

const STORAGE_KEY = 'boolean-tool-theme';

function systemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) { /* storage unavailable */ }
  return systemTheme();
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = e => {
      let hasManual = false;
      try { hasManual = !!localStorage.getItem(STORAGE_KEY); } catch (err) { /* ignore */ }
      if (!hasManual) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener ? media.addEventListener('change', onChange) : media.addListener(onChange);
    return () => {
      media.removeEventListener ? media.removeEventListener('change', onChange) : media.removeListener(onChange);
    };
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
  }

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
    >
      <span className="theme-toggle-icon" aria-hidden="true">☀</span>
      <span className="theme-toggle-icon" aria-hidden="true">☾</span>
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  );
}
