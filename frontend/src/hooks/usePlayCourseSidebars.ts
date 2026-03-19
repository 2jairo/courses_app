import { useEffect, useRef, useState, type SetStateAction, useCallback } from "react"

const MAX_WIDTH_CONCURRENT_SIDEBARS = 1280

export const usePlayCourseSidebars = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpenInner] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpenInner] = useState(false)
  const lastSidebarOpen = useRef<'left' | 'right'>('left')

  useEffect(() => {
    const listenerFn = () => {
      if(window.innerWidth <= MAX_WIDTH_CONCURRENT_SIDEBARS && isLeftSidebarOpen && isRightSidebarOpen) {
        const notLast = lastSidebarOpen.current === 'left' ? 'right' : 'left'
        if (notLast === 'left') {
          setIsLeftSidebarOpenInner(false)
        } else {
          setIsRightSidebarOpenInner(false)
        }
      }
    }

    window.addEventListener('resize', listenerFn)
    listenerFn()
    return () => window.removeEventListener('resize', listenerFn)
    
  }, [isLeftSidebarOpen, isRightSidebarOpen])

  const setIsLeftSidebarOpen = useCallback((s: SetStateAction<boolean>) => {
    setIsLeftSidebarOpenInner(prev => {
      const next = typeof s === 'function' ? s(prev) : s
      // Si se está abriendo y estamos en pantalla pequeña, cerrar la derecha
      if (next && window.innerWidth <= MAX_WIDTH_CONCURRENT_SIDEBARS) {
        setIsRightSidebarOpenInner(false)
      }
      return next
    })
    lastSidebarOpen.current = 'left'
  }, [])

  const setIsRightSidebarOpen = useCallback((s: SetStateAction<boolean>) => {
    setIsRightSidebarOpenInner(prev => {
      const next = typeof s === 'function' ? s(prev) : s
      if (next && window.innerWidth <= MAX_WIDTH_CONCURRENT_SIDEBARS) {
        setIsLeftSidebarOpenInner(false)
      }
      return next
    })
    lastSidebarOpen.current = 'right'
  }, [])

  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(prev => !prev)
  }, [setIsLeftSidebarOpen])

  const toggleRightSidebar = useCallback(() => {
    setIsRightSidebarOpen(prev => !prev)
  }, [setIsRightSidebarOpen])

  return {
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    toggleLeftSidebar,

    isRightSidebarOpen,
    setIsRightSidebarOpen,
    toggleRightSidebar
  }
}
