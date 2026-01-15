import { ThemeProviderContext, useCreateThemeProvider } from "./createThemeProvider"

interface Props {
  children: React.ReactNode
  storageKey?: string
}

export function ThemeProvider({ children, storageKey = "vite-ui-theme" }: Props) {
  const value = useCreateThemeProvider(storageKey)

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}