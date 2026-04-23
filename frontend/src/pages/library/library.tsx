import { Library } from "@/components/shared/library/library"
import { setDocumentTitle } from "@/lib/documentTitle"
import { useEffect } from "react"

export default function LibraryPage() {
  useEffect(() => {
    setDocumentTitle("Mi biblioteca", true)
  }, [])
  return (
    <div className="mx-auto w-full max-w-7xl py-8">
      <Library />
    </div>
  )
}
