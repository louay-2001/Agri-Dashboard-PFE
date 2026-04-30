'use client';

import PropTypes from 'prop-types';

function resolveValue(row, key) {
  if (typeof key === 'function') {
    return key(row);
  }

  return row?.[key] ?? '';
}

export default function DataTable({
  columns,
  rows,
  emptyMessage,
  getRowKey,
  onRowClick,
  selectedRowKey,
  className,
  tableClassName,
}) {
  return (
    <div className={`overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-950/50 ${className}`}>
      <div className="overflow-x-auto">
      <table className={`min-w-full text-sm ${tableClassName}`}>
        <thead className="border-b border-neutral-200/90 bg-neutral-50/85 text-left dark:border-neutral-800/80 dark:bg-neutral-900/75">
          <tr>
            {columns.map((column) => (
              <th key={column.label} className={`px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400 ${column.headerClassName || ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows.length ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400"
              >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                    Empty State
                  </span>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowKey = getRowKey(row);
              const isSelected = selectedRowKey === rowKey;

              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-neutral-100/90 transition duration-200 last:border-b-0 dark:border-neutral-900/90 ${
                    onRowClick ? 'cursor-pointer hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20' : ''
                  } ${
                    isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30' : index % 2 === 0 ? 'bg-white/75 dark:bg-transparent' : 'bg-neutral-50/40 dark:bg-neutral-950/18'
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.label} className={`px-4 py-3.5 align-top text-sm leading-6 text-neutral-700 dark:text-neutral-200 ${column.cellClassName || ''}`}>
                      {resolveValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
      cellClassName: PropTypes.string,
      headerClassName: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  emptyMessage: PropTypes.string,
  getRowKey: PropTypes.func,
  onRowClick: PropTypes.func,
  selectedRowKey: PropTypes.string,
  className: PropTypes.string,
  tableClassName: PropTypes.string,
};

DataTable.defaultProps = {
  emptyMessage: 'No data available.',
  getRowKey: (row) => row.id,
  onRowClick: null,
  selectedRowKey: '',
  className: '',
  tableClassName: '',
};
