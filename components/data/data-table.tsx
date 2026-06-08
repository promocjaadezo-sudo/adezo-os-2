import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T>({
  title,
  columns,
  data,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="font-display text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-black/10 border border-gold/5 rounded-xl text-center space-y-3">
            <p className="text-zinc-400 font-medium text-sm">
              {emptyMessage}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Skorzystaj z sekcji Importu CSV/Excel lub utwórz nowy rekord bezpośrednio w menu, aby zasilić bazę produkcyjną.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
