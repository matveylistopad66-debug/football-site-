"use client";

import { useEffect, useState } from "react";

// Переключатель светлой и тёмной темы. Выбор запоминается в браузере.
export default function ThemeToggle({ toLight, toDark }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  const label = theme === "light" ? toDark : toLight;
  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label={label} title={label}>
      {theme === "light" ? "🌙" : theme === "dark" ? "☀️" : "◐"}
    </button>
  );
}
