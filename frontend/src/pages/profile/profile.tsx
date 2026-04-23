import { Profile } from "@/components/shared/profile/profile"
import { setDocumentTitle } from "@/lib/documentTitle"
import { useEffect } from "react"

export default function ProfilePage() {
  useEffect(() => {
    setDocumentTitle("Perfil", true)
  }, [])
  return (
    <div className="mx-auto w-full max-w-350">
      <Profile />
    </div>
  )
}