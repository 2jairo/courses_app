import { ThemeProviderContext, useCreateThemeProvider } from "./createThemeProvider"

interface ThemeProviderProps {
  children: React.ReactNode
  storageKey?: string
}

export function ThemeProvider({ children, storageKey = "vite-ui-theme" }: ThemeProviderProps) {
  const value = useCreateThemeProvider(storageKey)

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}