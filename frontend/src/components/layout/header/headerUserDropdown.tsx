import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserContext } from "@/context/user/createUserContext"
import { LogIn, LogOut, User, UserPlus, GraduationCap, MonitorSmartphone, Heart } from "lucide-react"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserAvatar } from "../../shared/userAvatar/userAvatar"

export const HeaderUserDropdownMenu = () => {
  const navigate = useNavigate()
  const { isLogged, user, logout } = useContext(UserContext)
  
  const handleLogout = async () => {
    // event.preventDefault()
    await logout()
    navigate("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center md:w-auto md:h-auto w-9 h-9 gap-3 p-3 border px-2 py-1 rounded-full"
        >
          <UserAvatar avatar={user?.avatar} username={user?.username}/>

          {user && (
            <div className="hidden text-left leading-tight md:block">
              <p className="text-sm font-medium">{user.username}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {isLogged?.logged ? (
          <>
            <DropdownMenuLabel className="space-y-0.5">
              <div className="text-sm font-semibold">{user?.username ?? "Tu perfil"}</div>
              {user?.email && (
                <div className="text-xs text-muted-foreground">{user.email}</div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/courses" className="flex w-full items-center gap-2">
                <GraduationCap className="size-4" />
                Gestor de cursos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex w-full items-center gap-2">
                <User className="size-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/fav-courses" className="flex w-full items-center gap-2">
                <Heart className="size-4" />
                Cursos favoritos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings/sessions" className="flex w-full items-center gap-2">
                <MonitorSmartphone className="size-4" />
                Sesiones
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/login" className="flex w-full items-center gap-2">
                <LogIn className="size-4" />
                Iniciar sesión
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/register" className="flex w-full items-center gap-2">
                <UserPlus className="size-4" />
                Registrarse
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}