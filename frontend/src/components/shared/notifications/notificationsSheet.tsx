import { useContext, useState } from "react"
import { Bell, Loader2 } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserContext } from "@/context/user/createUserContext"
import { useMarkNotificationsAsSeenMutation } from "@/mutations/client/notifications/useMarkNotificationsAsSeenMutation"
import { useNotificationsQuery } from "@/queries/client/notifications/useNotificationsQuery"
import { NotificationsList } from "./notificationsList"

export const NotificationsSheet = () => {
  const { user, setUnreadNotifications } = useContext(UserContext)
  const [modalOpen, setModalOpen] = useState(false)

  const notificationsQuery = useNotificationsQuery({}, modalOpen)
  const markAsSeenMutation = useMarkNotificationsAsSeenMutation()
  const notifications = notificationsQuery.data?.pages.flat() || []
  const unreadCount = user?.unread_notifications || 0

  const handleMarkAllAsSeen = () => {
    markAsSeenMutation.mutate(undefined, {
      onSuccess: () => {
        setUnreadNotifications(0)
      },
    })
  }

  return (
    <Sheet open={modalOpen} onOpenChange={setModalOpen}>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative shrink-0">
              <Bell />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary z-49 text-primary-foreground text-xs flex items-center justify-center font-medium animate-in zoom-in group-active:scale-90 transition-all">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Notificaciones</TooltipContent>
      </Tooltip>

      <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2 pr-8">
            <SheetTitle>Notificaciones ({notifications.length})</SheetTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsSeen}
              disabled={unreadCount === 0 || markAsSeenMutation.isLoading}
            >
              {markAsSeenMutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Marcar como visto
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 -mx-4">
          {notificationsQuery.isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : (
            <NotificationsList
              notifications={notifications}
              onLoadMore={() => notificationsQuery.fetchNextPage()}
              isFetchingNextPage={notificationsQuery.isFetchingNextPage}
              hasNextPage={notificationsQuery.hasNextPage ?? false}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
