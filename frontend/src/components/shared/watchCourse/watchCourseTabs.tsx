import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface WatchCourseTabsProps {
  defaultTab: string
  tabsConfig: {
    [tabName: string]: {
      label: string
      id: string
      onlyOnMobile?: boolean 
    }
  }
  scrollToSection: (id: string) => void
}

export function WatchCourseTabs({ tabsConfig, defaultTab, scrollToSection }: WatchCourseTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const tabs = Object.values(tabsConfig)

  useEffect(() => {
    const handleScroll = () => {
      const sections = window.innerWidth < 768 // md
        ? tabs.map(({ id }) => document.getElementById(id))
        : tabs.filter((tab) => !tab.onlyOnMobile).map(({ id }) => document.getElementById(id))

      const scrollPosition = window.scrollY + (window.innerHeight / 2)

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(tabs[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [tabs])

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-350 px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, onlyOnMobile }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                onlyOnMobile && "md:hidden block"
              )}
            >
              {label}
              {activeTab === id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
