'use client';

function DeviceListModal({ isOpen, setIsOpen, data, columns, isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Device List</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Close
                    </button>
                </div>

                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="border-b p-2 text-left font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.id || item.gatewayId || item.nodeId}>
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className="border-b p-2 text-gray-600 dark:text-gray-400"
                                                >
                                                    {item[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center p-4">
                                            No data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeviceListModal;