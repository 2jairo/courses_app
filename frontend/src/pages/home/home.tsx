import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/shared/course/courseCard"
import { UserContext } from "@/context/user/createUserContext"
import { useTopCoursesQuery } from "@/queries/client/search/useTopCoursesQuery"
import {
  ArrowRight,
  CirclePlay,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay'
import { setDocumentTitle } from "@/lib/documentTitle"

const featureList = [
  {
    title: "Rutas de aprendizaje practico",
    description: "Construye proyectos reales desde el primer dia con modulos enfocados en resultados.",
    icon: Layers,
  },
  {
    title: "Aprende a tu ritmo",
    description: "Pausa, retoma y continua exactamente donde te quedaste en cualquier dispositivo.",
    icon: CirclePlay,
  },
  {
    title: "Instructores de confianza",
    description: "Los cursos se curan y revisan para que tu tiempo de aprendizaje siempre valga la pena.",
    icon: ShieldCheck,
  },
]

export default function Home() {
  const { isLogged } = useContext(UserContext)
  const { data: topCourses, isLoading: isTopCoursesLoading } = useTopCoursesQuery()

  const autoplayPlugin = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  )

  useEffect(() => {
    setDocumentTitle()
  }, [])

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 -top-32 h-88 w-88 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-chart-2/20 blur-3xl" />
        <div className="absolute -left-24 top-112 h-72 w-72 rounded-full bg-chart-1/15 blur-3xl" />
      </div>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-10 md:px-8 md:pt-14 lg:gap-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]" variant="outline">
              <Sparkles className="size-3.5" />
              Aprende con impulso
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Construye habilidades de nivel profesional.
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
                Descubre cursos y convierte tu aprendizaje en resultados listos para tu portafolio.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-10 rounded-full px-5 text-sm md:h-11 md:px-6">
                <Link to="/search">
                  Explorar cursos
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="h-10 rounded-full px-5 text-sm md:h-11 md:px-6" variant="outline">
                <Link to="/dashboard/courses">Comenzar a enseñar</Link>
              </Button>
            </div>

            <div className="grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <div className="rounded-2xl border bg-card/80 p-3 backdrop-blur">
                <p className="text-2xl font-semibold">250+</p>
                <p className="text-xs text-muted-foreground">Lecciones guiadas</p>
              </div>
              <div className="rounded-2xl border bg-card/80 p-3 backdrop-blur">
                <p className="text-2xl font-semibold">40k+</p>
                <p className="text-xs text-muted-foreground">Estudiantes activos</p>
              </div>
              <div className="rounded-2xl border bg-card/80 p-3 backdrop-blur">
                <p className="text-2xl font-semibold">4.8</p>
                <p className="text-xs text-muted-foreground">Valoracion promedio</p>
              </div>
              <div className="rounded-2xl border bg-card/80 p-3 backdrop-blur">
                <p className="text-2xl font-semibold">98%</p>
                <p className="text-xs text-muted-foreground">Satisfaccion</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Estilo de progreso</p>
              <p className="mt-2 text-2xl font-semibold">Basado en sprints</p>
              <p className="mt-2 text-sm text-muted-foreground">Metas semanales cortas para mantener la motivacion alta.</p>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Puntuacion en vivo</p>
              <p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold">
                4.9
                <Star className="size-5 fill-current text-amber-500" />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Los estudiantes valoran claridad, profundidad y resultados practicos.</p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {featureList.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-3xl border bg-card p-5 transition-transform hover:-translate-y-0.5">
              <div className="inline-flex rounded-xl border bg-background p-2">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold md:text-3xl">Top cursos</h2>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link to="/search">Ver todos</Link>
            </Button>
          </div>

          {isTopCoursesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent>
                {(topCourses || []).map((c) => (
                  <CarouselItem key={c.id} className="pl-4 basis-auto">
                    <div className="w-70 shrink-0 flex flex-col">
                      <CourseCard course={c} viewSource="Category" scrollToTop />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <div className="hidden sm:block">
                <CarouselPrevious className="absolute -left-4 z-999 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute -right-4 z-999 top-1/2 -translate-y-1/2" />
              </div>
            </Carousel>
          )}
        </section>


        {isLogged?.logged === false && (
          <section className="overflow-hidden rounded-3xl border bg-linear-to-r from-primary/10 via-chart-2/10 to-chart-1/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">Listo para subir de nivel esta semana?</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                  Define tu primera meta, elige una ruta y deja que la constancia haga el resto.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-6">
                  <Link to="/register">Crear cuenta</Link>
                </Button>
                <Button asChild className="rounded-full px-6" variant="outline">
                  <Link to="/login">Iniciar sesion</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
