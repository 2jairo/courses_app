import { useUserSessionsQuery } from "@/queries/client/auth/useUserSessionsQuery"
import { Sessions } from "@/components/shared/settings/sessions/sessions"
import { useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function SessionsPage() {
  useEffect(() => {
    setDocumentTitle("Sesiones activas", true)		
  }, [])
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
