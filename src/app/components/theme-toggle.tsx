"use client";

type ThemeToggleProps = {
  className?: string;
};

function SunIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.72 5.28l-1.42 1.42M6.7 17.3l-1.42 1.42M18.72 18.72l-1.42-1.42M6.7 6.7 5.28 5.28" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.4 8.4 0 1 0 20.4 15.1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === "dark"
      ? "dark"
      : document.documentElement.dataset.theme === "light"
        ? "light"
        : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  }

  return (
    <button
      aria-label="Cambiar modo de color"
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      onClick={toggleTheme}
      title="Cambiar modo de color"
      type="button"
    >
      <span className="theme-toggle-moon"><MoonIcon /></span>
      <span className="theme-toggle-sun"><SunIcon /></span>
    </button>
  );
}
