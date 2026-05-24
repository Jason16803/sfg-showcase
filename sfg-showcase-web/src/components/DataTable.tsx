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
  emptyIcon?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  emptyMessage = 'No data available',
  emptyIcon = '📋',
}: DataTableProps<T>) {
  return (
    <div className="data-table">
      {title && (
        <div className="data-table__header">
          <h3 className="data-table__title">{title}</h3>
          {data.length > 0 && (
            <span className="data-table__count">{data.length}</span>
          )}
        </div>
      )}
      <div className="data-table__wrapper">
        <table className="data-table__table">
          <thead>
            <tr className="data-table__header-row">
              {columns.map((col, i) => (
                <th
                  key={String(col.key)}
                  className={['data-table__header-cell', i === 0 ? 'data-table__header-cell--first' : ''].filter(Boolean).join(' ')}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  <span className="data-table__empty-icon" aria-hidden="true">{emptyIcon}</span>
                  <span>{emptyMessage}</span>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="data-table__row">
                  {columns.map((col, i) => (
                    <td
                      key={String(col.key)}
                      className={['data-table__cell', i === 0 ? 'data-table__cell--first' : ''].filter(Boolean).join(' ')}
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '—')}
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
