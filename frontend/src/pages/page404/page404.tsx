import { Button } from "@/components/ui/button"
import { Home, Search, Undo2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function Page404() {
  useEffect(() => {
    setDocumentTitle("Página no encontrada", true)
  }, [])
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          ERROR 404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Esta pagina no existe
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          La URL que intentaste abrir no se encuentra disponible. Puede que haya sido movida,
          eliminada o que el enlace este incompleto.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/search" className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar cursos
            </Link>
          </Button>

          <Button variant="ghost" onClick={() => navigate(-1)}>
            <Undo2 className="h-4 w-4" />
            Volver atras
          </Button>
        </div>
      </div>
    </section>
  )
}