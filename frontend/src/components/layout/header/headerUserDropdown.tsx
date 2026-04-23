import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { UserContext } from "@/context/user/createUserContext"
import { LogIn, LogOut, User, UserPlus, GraduationCap, MonitorSmartphone, Heart, Settings, CreditCard, Receipt, Library, RectangleEllipsis } from "lucide-react"
import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserAvatar } from "../../shared/userAvatar/userAvatar"
import { ReddeemCourseGiftCodeDialog } from "@/components/courseGiftCode/redeemCourseGiftCodeDialog"

export const HeaderUserDropdownMenu = () => {
  const navigate = useNavigate()
  const { isLogged, user, logout } = useContext(UserContext)
  
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = useState(false)
  
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

      <ReddeemCourseGiftCodeDialog 
        open={redeemCodeDialogOpen}
        onOpenChange={setRedeemCodeDialogOpen}
      />

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

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/courses" className="flex w-full items-center gap-2">
                  <GraduationCap className="size-4" />
                  Gestor de cursos
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>Mi cuenta</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full items-center gap-2">
                        <User className="size-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild >
                      <Link to="/fav-courses" className="flex w-full items-center gap-2">
                        <Heart className="size-4" />
                        Cursos favoritos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setRedeemCodeDialogOpen(true)}
                      className="flex w-full items-center gap-2"
                    >
                      <RectangleEllipsis className="size-4" />
                      Canjear código de regalo
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/library" className="flex w-full items-center gap-2">
                        <Library className="size-4" />
                        Biblioteca
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <CreditCard className="size-4" />
                  <span>Pagos</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/payment-methods" className="flex w-full items-center gap-2">
                        <CreditCard className="size-4" />
                        Métodos de pago
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/billing" className="flex w-full items-center gap-2">
                        <Receipt className="size-4" />
                        Facturación
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <Settings className="size-4" />
                  <span>Ajustes</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/sessions" className="flex w-full items-center gap-2">
                        <MonitorSmartphone className="size-4" />
                        Sesiones
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

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