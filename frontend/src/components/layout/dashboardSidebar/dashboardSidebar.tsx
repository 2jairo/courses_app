import { Link, useLocation } from "react-router-dom"
import { BookOpenIcon, GaugeIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith("/dashboard/courses")}
                    tooltip="Cursos"
                  >
                    <Link to="/dashboard/courses">
                      <BookOpenIcon />
                      <span>Cursos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="mx-0"/>
        <SidebarFooter>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
          >
            <GaugeIcon className="mr-2 h-4 w-4" />
            <span className="truncate">Go to overview</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
