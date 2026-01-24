import { Header } from '@/components/layout/header/header'
// import { SubHeader } from '@/components/layout/subHeader/subHeader'
import { Footer } from '@/components/layout/footer/footer'
import { Toaster } from 'sonner'
import React, { useContext } from 'react'
import { ThemeProviderContext } from '@/context/theme/createThemeProvider'
import { useLocation } from 'react-router-dom'

const DashboardSidebar = React.lazy(() => import('@/components/layout/dashboardSidebar/dashboardSidebar'))
const DefaultSidebar = React.lazy(() => import('@/components/layout/defaultSidebar/defaultSidebar'))

const AppSidebar = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  if(location.pathname.startsWith('/dashboard')) {
    return <DashboardSidebar>{children}</DashboardSidebar>
  }

  return <DefaultSidebar>{children}</DefaultSidebar>
}

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useContext(ThemeProviderContext)

  return (
    <AppSidebar>
      <div className='flex flex-col min-h-screen'>
        <Header />
        {/* <SubHeader /> */}
        <Toaster position='bottom-left' theme={theme} />

        <div className='flex-1 flex flex-col'>
          {children}
        </div>

        <Footer />
      </div>
    </AppSidebar>
  )
}