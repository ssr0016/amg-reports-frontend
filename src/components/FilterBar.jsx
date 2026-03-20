// /src/components/FilterBar.jsx
import { FaTimes, FaChevronDown } from "react-icons/fa";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function FilterBar({
  filters,
  setFilters,
  defaultMonth,
  defaultYear,
}) {
  const hasFilters =
    filters.worker !== "" || filters.area !== "" || filters.church !== "";

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ✅ Reset to default month/year — hindi sa blank
  const clearFilters = () => {
    setFilters({
      month: defaultMonth || "",
      year: defaultYear || currentYear,
      worker: "",
      area: "",
      church: "",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Search Filters
        </p>
        <div
          className={`transition-all duration-200 ${
            hasFilters
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={clearFilters}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition"
          >
            <FaTimes className="h-2.5 w-2.5" />
            Clear filters
          </button>
        </div>
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Month */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Month
          </label>
          <div className="relative">
            <select
              name="month"
              value={filters.month}
              onChange={handleChange}
              className="cursor-pointer appearance-none w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm"
            >
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
          </div>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Year
          </label>
          <div className="relative">
            <select
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="cursor-pointer appearance-none w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
          </div>
        </div>

        {/* Worker */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Worker
          </label>
          <input
            name="worker"
            placeholder="e.g. Juan Dela Cruz"
            value={filters.worker}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm rounded-lg px-3 py-2 transition outline-none shadow-sm placeholder:text-gray-400"
          />
        </div>

        {/* Area */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Area
          </label>
          <input
            name="area"
            placeholder="e.g. Metro Manila"
            value={filters.area}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm rounded-lg px-3 py-2 transition outline-none shadow-sm placeholder:text-gray-400"
          />
        </div>

        {/* Church */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Church
          </label>
          <input
            name="church"
            placeholder="e.g. AMGC Church"
            value={filters.church}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm rounded-lg px-3 py-2 transition outline-none shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
