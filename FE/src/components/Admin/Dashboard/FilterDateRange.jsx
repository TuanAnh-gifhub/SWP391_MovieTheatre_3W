import React from "react";

const FilterDateRange = ({ fromDate, toDate, onChange }) => {
  return (
    <div className="flex gap-2 items-center mb-4">
      <label className="font-medium">Từ ngày:</label>
      <input type="date" value={fromDate} onChange={e => onChange('from', e.target.value)} className="border rounded px-2 py-1" />
      <label className="font-medium">Đến ngày:</label>
      <input type="date" value={toDate} onChange={e => onChange('to', e.target.value)} className="border rounded px-2 py-1" />
    </div>
  );
};

export default FilterDateRange;

