import { Header } from '@/components/layout/header/header'
import { SubHeader } from '@/components/layout/subHeader/subHeader'
import { Footer } from '@/components/layout/footer/footer'
import { Toaster } from 'sonner'
import { useContext } from 'react'
import { ThemeProviderContext } from '@/context/theme/createThemeProvider'

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useContext(ThemeProviderContext)

  return (
    <main className='flex flex-col min-h-screen'>
      <Header />
      <SubHeader />
      <Toaster position='bottom-left' theme={theme} />

      <main className='flex flex-1'>
        {children}
      </main>
      <Footer />
    </main>
  )
}