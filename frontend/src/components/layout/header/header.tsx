import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpIcon, Search } from "lucide-react"


import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { ThemeToggle } from "../../shared/themeToggle/themeToggle"
import { SearchSuggestion } from "./searchSuggestion"
import { HeaderUserDropdownMenu } from "./headerUserDropdown"
import { UserContext } from "@/context/user/createUserContext"
import { SidebarTrigger } from "@/components/ui/sidebar"

const suggestions = [
  "React Basics",
  "Advanced React",
  "Shadcn UI Components",
  "React Router",
  "Tailwind CSS",
  "Frontend Development",
]

export const Header = () => {
  const { populate } = useContext(UserContext)
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    populate()
  }, [])

  const filtered = suggestions
    .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5)

  return (
    <header className="border-b">
      <div className="mx-auto flex gap-4 md:gap-10 h-16 max-w-7xl items-center justify-between px-4 ">
        <SidebarTrigger />

        <Link to="/" className="underline underline-offset-2">My app</Link>

        <div className="relative flex-1">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>

            <InputGroupInput
              placeholder="Buscar cursos..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 100)}
            />

            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                className="rounded-full cursor-pointer"
                size="icon-xs"
              >
                <ArrowUpIcon />
                <span className="sr-only">Buscar</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          {focused && filtered.length > 0 && (
            <ul className="absolute bg-background z-10 w-full mt-1 border rounded-md overflow-hidden">
              {filtered.map((item, i) => (
                <SearchSuggestion key={i} isLast={i === filtered.length - 1} setValue={setValue} value={item} />
              ))}
            </ul>
          )}
        </div>

        <HeaderUserDropdownMenu />
        
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}