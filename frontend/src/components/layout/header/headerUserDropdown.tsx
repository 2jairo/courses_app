import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserContext } from "@/context/user/createUserContext"
import { LogIn, LogOut, Settings, User, UserPlus } from "lucide-react"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"

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
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar as string | undefined} alt="User avatar" />
            <AvatarFallback>
              {user && user.avatar
                ? user.avatar
                : <User />
              }
            </AvatarFallback>
          </Avatar>

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
              <Link to="/profile" className="flex w-full items-center gap-2">
                <User className="size-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex w-full items-center gap-2">
                <Settings className="size-4" />
                Ajustes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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