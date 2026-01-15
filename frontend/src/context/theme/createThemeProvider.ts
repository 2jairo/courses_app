import { createContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

export const useCreateThemeProvider = (storageKey: string) => {
  const [theme, setThemeInner] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || 'system'
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme)
    setThemeInner(theme)
  }

  return {
    theme,
    setTheme,
  }
}

export const ThemeProviderContext = createContext<ReturnType<typeof useCreateThemeProvider>>(
  {} as ReturnType<typeof useCreateThemeProvider>
)