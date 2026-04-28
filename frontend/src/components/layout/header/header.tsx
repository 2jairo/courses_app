import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { ThemeToggle } from "../../shared/themeToggle/themeToggle"
import { HeaderUserDropdownMenu } from "./headerUserDropdown"
import { NotificationsSheet } from "../../shared/notifications/notificationsSheet"
import { ShoppingCartSheet } from "../../shared/shoppingCart/shoppingCartSheet"
import { UserContext } from "@/context/user/createUserContext"
import { AppLogo } from "@/components/shared/appLogo/appLogo"
import { ButtonGroup } from "@/components/ui/button-group"
import { SearchInput } from "../searchInput/searchInput"

export const Header = () => {
  const { populate } = useContext(UserContext)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024)

  useEffect(() => {
    populate()
  }, [])

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 1024)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const hideOthers = isSmallScreen && isSearchFocused

  return (
    <header className="border-b">
      <div className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-all duration-150 ${hideOthers ? "gap-0" : "gap-4 md:gap-10"}`}>
        <div className={`flex items-center transition-all duration-300 overflow-hidden whitespace-nowrap shrink-0 ${hideOthers ? "max-w-0 opacity-0 gap-0" : "opacity-100 gap-4"}`}>

          <Link to="/" className="underline underline-offset-2">
            <div className="flex items-center gap-1">
              <AppLogo className="w-12 h-12 shrink-0"/>
              <p className="hidden lg:block">{import.meta.env.VITE_COURSE_APP_NAME}</p>
            </div>
          </Link>
        </div>
        
        <SearchInput focused={isSearchFocused} setFocused={setIsSearchFocused} />
        
        <div className={`flex items-center transition-all duration-150 whitespace-nowrap shrink-0 ${hideOthers ? "max-w-0 opacity-0 gap-0" : "opacity-100 gap-4"}`}>
          <HeaderUserDropdownMenu />

          <div>
            <ButtonGroup>
              <ThemeToggle />
              <NotificationsSheet />
              <ShoppingCartSheet />
            </ButtonGroup>
          </div>
        </div>
      </div>
    </header>
  )
}