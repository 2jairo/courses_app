import { useValidId } from "@/hooks/useValidId"
import { useParams } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { WFullSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/shared/player/player"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileVideo, Subtitles, Bell, Split } from "lucide-react"

export default function ModifyVideoContentDashboardPage() {
  const { fileId: fileIdStr } = useParams()
  const fileId = useValidId(fileIdStr!, "/dashboard/courses")

  // TODO: Add query to fetch video file details
  // const videoFile = useFileQuery({ fileId: fileId! })
  const isLoading = false
  const videoFile = null

  if (!fileId) {
    return <Spinner />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <WFullSpinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Editar contenido de video</h1>
            <Badge variant="secondary">
              <FileVideo className="w-3 h-3 mr-1" />
              Video
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona el video, subtítulos, notificaciones y segmentos
          </p>
        </div>

        {/* Video metadata */}
        <Card className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Duración: --:--</span>
            </div>
            <div className="flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-muted-foreground" />
              <span>Resolución: 1920x1080</span>
            </div>
          </div>
        </Card>
      </section>

      <div className="py-4">
        <Separator />
      </div>

      {/* Video Preview */}
      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <div>
          <h2 className="text-xl font-bold mb-2">Vista previa</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Previsualiza el video con todos los ajustes aplicados
          </p>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {/* TODO: Connect to actual video source */}
          {/* <VideoPlayer
            baseUrl=""
            videoSrc=""
            poster=""
            thumbnails=""
            subtitles={[]}
          /> */}
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>Video Preview (Conectar con fuente de video)</p>
          </div>
        </div>
      </section>

      <div className="py-4">
        <Separator />
      </div>

      {/* Video Management Tabs */}
      <section className="flex flex-1 flex-col gap-4 p-4 max-w-350 m-auto">
        <Tabs defaultValue="subtitles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subtitles" className="flex items-center gap-2">
              <Subtitles className="w-4 h-4" />
              Subtítulos
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <Split className="w-4 h-4" />
              Segmentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subtitles" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Gestionar subtítulos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sube, edita y gestiona los archivos de subtítulos para este video
              </p>
            </div>
            
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Subtitles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Funcionalidad de subtítulos en desarrollo</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Gestionar notificaciones</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea notificaciones que aparecerán en momentos específicos del video
              </p>
            </div>
            
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Funcionalidad de notificaciones en desarrollo</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Gestionar segmentos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Divide el video en segmentos o capítulos para facilitar la navegación
              </p>
            </div>
            
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <Split className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Funcionalidad de segmentos en desarrollo</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}