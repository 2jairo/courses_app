import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"


export default function DefaultSidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="offExamples" >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/"}
                    tooltip="Home"
                  >
                    <Link to="/">
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}