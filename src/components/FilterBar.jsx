// FilterBar.jsx
import { FaTimes } from "react-icons/fa";

export default function FilterBar({ filters, setFilters }) {
  const hasFilters = Object.values(filters).some((v) => v !== "");

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({ month: "", worker: "", area: "", church: "" });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Search Filters</h2>

        {/* ✅ improved clear filters button */}
        <div
          className={`transition-all duration-200 ${
            hasFilters
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <button
            onClick={clearFilters}
            className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            <FaTimes className="h-3 w-3" />
            Clear filters
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="month" className="text-sm font-medium text-gray-600">
            Month
          </label>
          <input
            id="month"
            name="month"
            placeholder="e.g. January"
            value={filters.month}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="worker" className="text-sm font-medium text-gray-600">
            Worker
          </label>
          <input
            id="worker"
            name="worker"
            placeholder="e.g. Juan Dela Cruz"
            value={filters.worker}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="area" className="text-sm font-medium text-gray-600">
            Area of Assignment
          </label>
          <input
            id="area"
            name="area"
            placeholder="e.g. Metro Manila"
            value={filters.area}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="church" className="text-sm font-medium text-gray-600">
            Church Name
          </label>
          <input
            id="church"
            name="church"
            placeholder="e.g. AMGC Church"
            value={filters.church}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>
    </div>
  );
}
