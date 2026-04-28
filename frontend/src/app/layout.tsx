import { Header } from '@/components/layout/header/header'
// import { SubHeader } from '@/components/layout/subHeader/subHeader'
import { Footer } from '@/components/layout/footer/footer'
import { Toaster } from 'sonner'
import React, { useContext } from 'react'
import { BackToTop } from '@/components/shared/backToTop/backToTop'
import { ThemeProviderContext } from '@/context/theme/createThemeProvider'

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useContext(ThemeProviderContext)

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      {/* <SubHeader /> */}
      <Toaster position='bottom-left' theme={theme} richColors />

      <div className='flex-1 flex flex-col'>
        {children}
      </div>

      <Footer />
      <BackToTop />
    </div>
  )
}