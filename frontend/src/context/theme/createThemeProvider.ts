import { createContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

export const useCreateThemeProvider = (storageKey: string) => {
  const [theme, setThemeInner] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || 'system'
  )

  const lightOrDark = (t: Theme) => {
    if(t === 'system') {
      return window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
    }

    return t
  } 

  useEffect(() => {
    const root = window.document.documentElement

    console.log(lightOrDark(theme))

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
    lightOrDark
  }
}

export const ThemeProviderContext = createContext<ReturnType<typeof useCreateThemeProvider>>(
  {} as ReturnType<typeof useCreateThemeProvider>
)