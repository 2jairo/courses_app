import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatSearchMode, formatViews } from "@/lib/format"
import type { SearchMode } from "@/types/common/search"
import type { GetCourseAnalyticsCompactResponse } from "@/types/dashboard/analytics"

interface AnalyticsSearchQueriesTablesProps {
  data: Pick<GetCourseAnalyticsCompactResponse, "searchQueries" | "searchQueriesRecent">
}

const isSearchMode = (mode: string): mode is SearchMode => mode === "ai" || mode === "fts"

const getModeLabel = (mode: string) => {
  if (isSearchMode(mode)) {
    return formatSearchMode(mode, true)
  }

  return mode
}

interface SearchQueryTableCardProps {
  title: string
  countLabel: string
  rows: Array<[string, string, boolean, number, string]>
}

const SearchQueryTableCard = ({ title, countLabel, rows }: SearchQueryTableCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Busqueda</TableHead>
              <TableHead>Modo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>{countLabel}</TableHead>
              <TableHead>Ultima busqueda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Sin datos
                </TableCell>
              </TableRow>
            ) : (
              rows.map(([query, mode, seen, count, lastSearched], index) => (
                <TableRow key={`${query}-${mode}-${lastSearched}-${index}`}>
                  <TableCell className="max-w-60 truncate">{query}</TableCell>
                  <TableCell>{getModeLabel(mode)}</TableCell>
                  <TableCell>
                    <Badge variant={seen ? "outline" : "secondary"}>{seen ? "Vista" : "Nueva"}</Badge>
                  </TableCell>
                  <TableCell>{formatViews(count)}</TableCell>
                  <TableCell>{formatDate(lastSearched)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export const AnalyticsSearchQueriesTables = ({ data }: AnalyticsSearchQueriesTablesProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:col-span-2">
      <SearchQueryTableCard
        title="Consultas de busqueda"
        countLabel="Busquedas"
        rows={data.searchQueries.rows}
      />
      <SearchQueryTableCard
        title="Consultas recientes"
        countLabel="Conteo"
        rows={data.searchQueriesRecent.rows}
      />
    </div>
  )
}
