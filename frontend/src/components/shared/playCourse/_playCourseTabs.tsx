import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageSquare, Info } from "lucide-react"
import type { PlayLectureResponse } from "@/types/client/lectures"

interface PlayTabsProps {
  lecture: PlayLectureResponse
}

export function PlayCourseTabs({ lecture }: PlayTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
        <TabsTrigger 
          value="overview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <Info className="h-4 w-4 mr-2" />
          Descripción
        </TabsTrigger>
        <TabsTrigger 
          value="resources"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <FileText className="h-4 w-4 mr-2" />
          Recursos
        </TabsTrigger>
        <TabsTrigger 
          value="comments"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comentarios
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="flex-1">
        <TabsContent value="overview" className="mt-0 p-4">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">{lecture.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lecture.description || "Sin descripción disponible."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-0 p-4">
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay recursos disponibles para esta lección.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-0 p-4">
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Los comentarios estarán disponibles próximamente.
            </p>
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}
