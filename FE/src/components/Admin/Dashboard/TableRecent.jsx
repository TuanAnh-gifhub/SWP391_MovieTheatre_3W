import React from "react";

const TableRecent = ({ data, columns, title }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-2 py-1 text-left font-semibold text-gray-700">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  {columns.map((col, cidx) => (
                    <td key={cidx} className="px-2 py-1">{row[col.accessor]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr><td colSpan={columns.length} className="text-center py-2">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableRecent;

