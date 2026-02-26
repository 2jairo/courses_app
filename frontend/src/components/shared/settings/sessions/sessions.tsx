import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, RefreshCw } from "lucide-react"
import { UserContext } from "@/context/user/createUserContext"
import type { UserAuthServiceGetUserSesssion } from "@/types/client/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { WFullSpinner } from "../../fullPageSpinner/fullPageSpinner"
import { formatDate, timeSince } from "@/lib/format"
import { SessionBrowserBadge } from "@/components/shared/sessionsUtils/sessionBrowser"
import { SessionOsBadge } from "@/components/shared/sessionsUtils/sessionOs"
import { SessionDeviceBadge, SessionDeviceIcon } from "@/components/shared/sessionsUtils/sessionDevice"
import { SessionCurrentBadge, SessionOnlineBadge } from "@/components/shared/sessionsUtils/sessionStatus"

interface SessionsProps {
  sessions: UserAuthServiceGetUserSesssion[] | undefined
  isLoading: boolean
  isRefetching: boolean
  refetch: () => void
}

export function Sessions({ sessions = [], isLoading, isRefetching, refetch }: SessionsProps) {
  const { logout, logoutAll } = useContext(UserContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const handleLogoutAll = async () => {
    await logoutAll()
    navigate("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex pt-4 px-4 max-w-350 mx-auto items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sesiones activas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los dispositivos donde has iniciado sesión.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refetch}
          disabled={isRefetching}
          title="Actualizar sesiones"
        >
          <RefreshCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex items-center justify-end pt-4 px-4 max-w-350 mx-auto flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Cerrar sesión actual
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={handleLogoutAll}
        >
          <LogOut className="size-4" />
          Cerrar todas las sesiones
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 pt-4 px-4 max-w-350 mx-auto">
        {isLoading ? (           
          <WFullSpinner className="w-8 h-8" />
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className={session.is_current ? "border-primary" : ""}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-muted-foreground shrink-0">
                  <SessionDeviceIcon device={session.device} className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SessionBrowserBadge browser={session.browser} variant="outline" />
                    <SessionOsBadge os={session.os} variant="secondary" />
                    <SessionDeviceBadge device={session.device} variant="outline" />
                    {session.is_current && <SessionCurrentBadge />}
                    {session.is_online && <SessionOnlineBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Último acceso:{" "}
                    <time title={formatDate(session.updated_at)}>{timeSince(session.updated_at)}</time>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sesión iniciada:{" "}
                    <time title={formatDate(session.created_at)}>{timeSince(session.created_at)}</time>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
