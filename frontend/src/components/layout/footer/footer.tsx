import { AppLogo } from "@/components/shared/appLogo/appLogo"
import { Link } from "react-router-dom"

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-card/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AppLogo className="w-8 h-8" />
              <p className="text-base font-semibold tracking-tight">{import.meta.env.VITE_COURSE_APP_NAME}</p>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Aprende con contenido curado para crecer de forma constante.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/search">
              Cursos
            </Link>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/library">
              Mi biblioteca
            </Link>
            <Link className="text-muted-foreground transition-colors hover:text-foreground" to="#">
              Configuracion
            </Link>
          </nav>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {import.meta.env.VITE_COURSE_APP_NAME}. Todos los derechos reservados.</p>
          <p>Hecho para aprender sin friccion.</p>
        </div>
      </div>
    </footer>
  )
}