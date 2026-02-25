import { useEffect, useState } from "react"
import {
  HelpCircle,
  Clock,
  Target,
  ListOrdered,
  Eye,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { PlayLectureResponse, PlayLectureResponseKindQuiz } from "@/types/client/lectures"
import { useStartQuizAttemptQuery } from "@/queries/client/quizzes/useStartQuizAttemptQuery"
import { QuizAttempt } from "../../playCourseQuiz/playQuizAttempt"
import { formatDuration } from "@/lib/format"
import { useLocation, useNavigate } from "react-router-dom"

interface PlayQuizProps {
  lecture: PlayLectureResponse & { kind: "Quiz"; data: PlayLectureResponseKindQuiz }
}

type Phase = "idle" | "attempt" | "finished"

const getPhase = () => {
  const params = new URLSearchParams(location.search)
  const phaseParam = params.get("phase") || "idle"
  return (["idle", "attempt", "finished"].includes(phaseParam) ? phaseParam : "idle") as Phase
}
 
export function PlayQuiz({ lecture }: PlayQuizProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [phase, setPhase] = useState<Phase>(() => getPhase())
  const quiz = lecture.data

  useEffect(() => {
    const searchParams = new URLSearchParams()
    searchParams.set("phase", phase)
    
    const newSearch = searchParams.toString()  
    navigate(`?${newSearch}`, { replace: true })
  }, [phase, navigate])

  useEffect(() => {
    setPhase(getPhase())
  }, [location])

  const startQuizAttemptQuery = useStartQuizAttemptQuery(
    { lectureSlug: lecture.slug },
    phase === "attempt"
  )

  if (phase === "finished") {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="flex flex-col items-center text-center py-16 gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">¡Intento finalizado!</h3>
              <p className="text-muted-foreground text-sm">
                Tu respuestas han sido registradas correctamente.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPhase("idle")}
              className="mt-2"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Ver detalles del cuestionario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === "attempt") {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-5 w-5" />
              {lecture.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {startQuizAttemptQuery.isLoading && (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Cargando cuestionario...</p>
              </div>
            )}
            {startQuizAttemptQuery.isError && (
              <div className="flex flex-col items-center gap-3 py-12">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">Error al cargar el cuestionario.</p>
                <Button variant="outline" size="sm" onClick={() => setPhase("idle")}>
                  Volver
                </Button>
              </div>
            )}
            {startQuizAttemptQuery.data && (
              <QuizAttempt
                attempt={startQuizAttemptQuery.data}
                lecture={lecture}
                onFinished={() => setPhase("finished")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // idle phase — show quiz info
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {lecture.title}
          </CardTitle>
          {lecture.description && (
            <p className="text-sm text-muted-foreground pt-1">{lecture.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-3 text-center">
              <ListOrdered className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{quiz.questionsAmount}</span>
              <span className="text-xs text-muted-foreground">preguntas</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-3 text-center">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{quiz.passingScorePercentage}%</span>
              <span className="text-xs text-muted-foreground">para aprobar</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-3 text-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {quiz.timeLimitSecs ? formatDuration(quiz.timeLimitSecs, true) : "Sin límite"}
              </span>
              <span className="text-xs text-muted-foreground">tiempo límite</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-3 text-center">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{quiz.showCorrectAnswers ? "Sí" : "No"}</span>
              <span className="text-xs text-muted-foreground">ver respuestas</span>
            </div>
          </div>

          <Separator />

          {/* Rules */}
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              Solo puede haber un intento activo a la vez.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              Puedes guardar cada respuesta de forma individual y cambiarla antes de finalizar.
            </li>
            {quiz.timeLimitSecs && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">•</span>
                Al agotarse el tiempo, el intento se finalizará automáticamente.
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              Necesitas {quiz.passingScorePercentage}% o más para aprobar.
            </li>
          </ul>

          <div className="flex items-center gap-3 pt-2">
            {lecture.seen && (
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completado
              </Badge>
            )}
            <Button onClick={() => setPhase("attempt")} className="flex-1">
              {lecture.seen ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reintentar cuestionario
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Comenzar cuestionario
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
