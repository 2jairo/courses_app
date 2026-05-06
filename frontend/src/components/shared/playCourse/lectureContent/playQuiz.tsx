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
import { Separator } from "@/components/ui/separator"
import type { PlayLectureResponse, PlayLectureResponseKindQuiz } from "@/types/client/lectures"
import { useStartQuizAttemptQuery } from "@/queries/client/quizzes/useStartQuizAttemptQuery"
import { QuizAttempt } from "../../playCourseQuiz/playQuizAttempt"
import { formatDuration } from "@/lib/format"
import { useGetQuizAttemptDetailsQuery } from "@/queries/client/quizzes/useGetQuizAttemptDetailsQuery"
import { useQueryParams } from "@/hooks/useQueryParams"

interface PlayQuizProps {
  lecture: PlayLectureResponse & { kind: "Quiz"; data: PlayLectureResponseKindQuiz }
}

type Phase = "idle" | "attempt" | "finished"
 
export function PlayQuiz({ lecture }: PlayQuizProps) {
  const { queryParams, setQueryParams } = useQueryParams({
    defaultValues: { phase: 'idle' as Phase },
    parseParams: (params) => {
      const phaseParam = params.get("phase") || "idle"

      return {
        phase: (["idle", "attempt", "finished"].includes(phaseParam) ? phaseParam : "idle") as Phase
      }
    },
    setParams: (params) => {
      const searchParams = new URLSearchParams()
      searchParams.set("phase", params.phase)
      return searchParams 
    }
  })
  
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const quiz = lecture.data
  const activeAttempt = quiz.activeAttempt && (timeRemaining !== null && timeRemaining > 0)

  const startQuizAttemptQuery = useStartQuizAttemptQuery(
    { lectureSlug: lecture.slug },
    queryParams.phase === "attempt"
  )
  const quizAttemptDetailsQuery = useGetQuizAttemptDetailsQuery(
    { attemptId: startQuizAttemptQuery.data?.attemptId as number },
    queryParams.phase === "finished" && startQuizAttemptQuery.data !== undefined
  )

  // Timer for activeAttemptExpiresAt
  useEffect(() => {
    if (!quiz.activeAttempt || !quiz.lastAttempt?.expiresAt) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      if(!quiz.lastAttempt?.expiresAt) {
        setTimeRemaining(null)
        return
      }

      const expiresAt = new Date(quiz.lastAttempt.expiresAt).getTime()
      const now = Date.now()
      const remaining = Math.max(0, expiresAt - now)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [quiz])

  if (queryParams.phase === "finished") {
    const details = quizAttemptDetailsQuery.data

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
            {quizAttemptDetailsQuery.isLoading && (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Cargando resultados...</p>
              </div>
            )}
            {quizAttemptDetailsQuery.isError && (
              <div className="flex flex-col items-center gap-3 py-12">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">Error al cargar los resultados.</p>
                <Button variant="outline" size="sm" onClick={() => setQueryParams({ phase: 'idle' })}>
                  Volver
                </Button>
              </div>
            )}
            {details && (
              <div className="flex flex-col items-center text-center gap-6">
                {details.passed ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-destructive" />
                )}
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">
                    {details.passed ? "¡Aprobado!" : "No aprobado"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {details.passed
                      ? "Has superado el cuestionario correctamente."
                      : `Necesitas al menos ${details.passingScorePercentage}% para aprobar.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
                    <span className="text-2xl font-bold">{details.scorePercentage.toFixed(2)}%</span>
                    <span className="text-xs text-muted-foreground">puntuación</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
                    <span className="text-2xl font-bold">
                      {details.pointsEarned.toFixed(2)} / {details.maxPoints.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">puntos</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setQueryParams({ phase: 'idle' })} className="mt-2">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Volver al cuestionario
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (queryParams.phase === "attempt") {
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
                <Button variant="outline" size="sm" onClick={() => setQueryParams({ phase: 'idle' })}>
                  Volver
                </Button>
              </div>
            )}
            {startQuizAttemptQuery.data && !startQuizAttemptQuery.isFetching && (
              <QuizAttempt
                attempt={startQuizAttemptQuery.data}
                lecture={lecture}
                onFinished={() => setQueryParams({ phase: 'finished' })}
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
          
          {/* Last Attempt Result */}
          {quiz.lastAttempt?.completedAt && (
            <div className={`rounded-lg border p-4 ${quiz.lastAttempt.passed ? "border-green-500/50 bg-green-500/10" : "border-destructive/50 bg-destructive/10"}`}>
              <div className="flex items-start gap-3">
                {quiz.lastAttempt.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                )}
                <div className="space-y-1 flex-1">
                  <h4 className={`text-sm font-semibold ${quiz.lastAttempt.passed ? "text-green-500" : "text-destructive"}`}>
                    {quiz.lastAttempt.passed ? "Último intento aprobado" : "Último intento no aprobado"}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Puntuación:{" "}
                      <span className="font-semibold text-foreground">
                        {quiz.lastAttempt.maxPoints > 0
                          ? `${Math.round((quiz.lastAttempt.pointsEarned / quiz.lastAttempt.maxPoints) * 100)}%`
                          : "—"}
                      </span>
                    </span>
                    <span>
                      Puntos:{" "}
                      <span className="font-semibold text-foreground">
                        {quiz.lastAttempt.pointsEarned.toFixed(2)} / {quiz.lastAttempt.maxPoints.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Attempt Warning */}
          {activeAttempt && (
            <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-orange-500">
                    Tienes un intento activo
                  </h4>
                  {timeRemaining !== null && (
                    <p className="text-xs text-muted-foreground">
                      Tiempo restante:{" "}
                      <span className="text-orange-600 font-semibold">
                        {formatDuration(timeRemaining / 1000, true)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">  
            <Button 
              onClick={() => setQueryParams({ phase: 'attempt' })} 
              className="flex-1"
              variant={activeAttempt ? "default" : "default"}
            >
              {activeAttempt ? (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continuar cuestionario 
                </>
              ) : lecture.seen ? (
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
