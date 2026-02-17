import type { PlayLectureAssetsResponse } from "@/types/client/lectures"
import { FileKindIcon } from "../filesUtils/fileKindIcon"
import { formatFileKind, formatFileSize } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PlayLectureAssetsProps {
  assets: PlayLectureAssetsResponse[]
}

export function PlayLectureAssets({ assets }: PlayLectureAssetsProps) {

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recursos descargables
      </h2>

      <div className="space-y-2">
        {assets.map((asset) => {
          const downloadUrl = `${asset.cdn.base}/${asset.name}`
          
          return (
            <div
              key={asset.fileId}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileKindIcon fileKind={asset.kind} className="h-5 w-5 text-muted-foreground shrink-0"/>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileKind(asset.kind)} &nbsp;•&nbsp; {formatFileSize(asset.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 shrink-0"
                asChild
              >
                <a
                  href={downloadUrl}
                  download={asset.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )

}