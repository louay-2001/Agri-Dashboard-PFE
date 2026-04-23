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
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-neutral-200 text-left dark:border-neutral-800">
          <tr>
            {columns.map((column) => (
              <th key={column.label} className="px-3 py-3 font-medium text-neutral-500 dark:text-neutral-400">
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
                className="px-3 py-8 text-center text-neutral-500 dark:text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const rowKey = getRowKey(row);
              const isSelected = selectedRowKey === rowKey;

              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-neutral-100 transition last:border-b-0 dark:border-neutral-900 ${
                    onRowClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900' : ''
                  } ${
                    isSelected ? 'bg-green-50 dark:bg-green-950/30' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.label} className="px-3 py-3 align-top text-neutral-700 dark:text-neutral-200">
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
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  emptyMessage: PropTypes.string,
  getRowKey: PropTypes.func,
  onRowClick: PropTypes.func,
  selectedRowKey: PropTypes.string,
};

DataTable.defaultProps = {
  emptyMessage: 'No data available.',
  getRowKey: (row) => row.id,
  onRowClick: null,
  selectedRowKey: '',
};
