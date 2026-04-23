import { Bell, Loader2 } from "lucide-react"

import type { NotificationResponse } from "@/types/client/notifications"
import { NotificationCard } from "./notificationCard"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"

interface NotificationsListProps {
  notifications: NotificationResponse[]
  onLoadMore: () => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
}

export function NotificationsList({
  notifications,
  onLoadMore,
  isFetchingNextPage,
  hasNextPage,
}: NotificationsListProps) {
  const observerTarget = useInfiniteScroll({ fetchNextPage: onLoadMore, isFetchingNextPage, hasNextPage })

  if (notifications.length === 0 && !isFetchingNextPage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Sin notificaciones</h3>
        <p className="mt-2 text-sm text-muted-foreground">No tienes notificaciones nuevas.</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4 mx-auto space-y-4">
      <div className="rounded-lg border bg-card divide-y">
        {notifications.map((notification, index) => (
          <NotificationCard
            key={`${notification.notificationType}-${notification.seenAt ?? "unseen"}-${index}`}
            notification={notification}
          />
        ))}
      </div>

      <div ref={observerTarget} className="h-2" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
