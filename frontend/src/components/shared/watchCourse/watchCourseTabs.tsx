import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface WatchCourseTabsProps {
  defaultTab: string
  tabsConfig: {
    label: string
    id: string
  }[]
}

export function WatchCourseTabs({ tabsConfig, defaultTab }: WatchCourseTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    const handleScroll = () => {
      const sections = tabsConfig.map(({ id }) => document.getElementById(id))
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(tabsConfig[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [tabsConfig])

  const scrollToSection = (key: string) => {
    const element = document.getElementById(key)
    if (element) {
      const offset = 80
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-350 px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabsConfig.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
