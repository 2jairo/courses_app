import { useUserSessionsQuery } from "@/queries/client/auth/useUserSessionsQuery"
import { Sessions } from "@/components/shared/settings/sessions/sessions"

export default function SessionsPage() {
  const userSessionsQuery = useUserSessionsQuery()

  return (
    <div>
      <Sessions
        sessions={userSessionsQuery.data}
        isLoading={userSessionsQuery.isLoading}
        isRefetching={userSessionsQuery.isRefetching}
        refetch={userSessionsQuery.refetch}
      />
    </div>
  )
}
