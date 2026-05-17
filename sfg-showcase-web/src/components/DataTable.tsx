import type { ReactNode } from 'react'
import './DataTable.scss'

export interface Column<T> {
  key: keyof T
  label: string
  render?: (value: unknown, row: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="data-table">
      {title && <h3 className="data-table__title">{title}</h3>}
      <div className="data-table__wrapper">
        <table className="data-table__table">
          <thead>
            <tr className="data-table__header-row">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="data-table__header-cell"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="data-table__row">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="data-table__cell"
                      style={{ width: column.width }}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
