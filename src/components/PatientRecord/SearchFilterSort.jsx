import React, { useState, useEffect } from "react";

export default function SearchFilterSort({ records, onFiltered }) {
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Only trigger onFiltered when the filtered list actually changes
  useEffect(() => {
    let filtered = [...records];

    // Filter by search text
    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.presentingComplaint && r.presentingComplaint.toLowerCase().includes(text)) ||
          (r.diagnosis && r.diagnosis.toLowerCase().includes(text)) ||
          (r.history && r.history.toLowerCase().includes(text))
      );
    }

    // Filter by date
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= end);
    }

    // Sort
    if (sortOption === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "diagnosis") {
      filtered.sort((a, b) => (a.diagnosis || "").localeCompare(b.diagnosis || ""));
    }

    // Call onFiltered only if result changed
    onFiltered(filtered, searchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, searchText, sortOption, startDate, endDate]);

  return (
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-4">
      <input
        type="text"
        placeholder="Search by complaint, diagnosis..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="border border-gray-300 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-col">
        <label className="text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-gray-700 mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest</option>
        <option value="diagnosis">Diagnosis (A-Z)</option>
      </select>
    </div>
  );
}
