// FilterBar.jsx
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

export default function FilterBar({ filters, setFilters }) {
  // ✅ hasFilters — hindi kasama ang year kasi laging may year selected
  const hasFilters =
    filters.month !== "" ||
    filters.worker !== "" ||
    filters.area !== "" ||
    filters.church !== "";

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ✅ clear — month lang ang na-clear, year stays sa current year
  const clearFilters = () => {
    setFilters({
      month: "",
      year: currentYear,
      worker: "",
      area: "",
      church: "",
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Search Filters</h2>

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* ✅ Month dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="month" className="text-sm font-medium text-gray-600">
            Month
          </label>
          <div className="relative">
            <select
              id="month"
              name="month"
              value={filters.month}
              onChange={handleChange}
              className="cursor-pointer appearance-none w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm rounded-lg pl-3 pr-8 py-2 outline-none transition shadow-sm text-gray-800"
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

        {/* ✅ Year dropdown — laging may selected, default current year */}
        <div className="flex flex-col gap-1">
          <label htmlFor="year" className="text-sm font-medium text-gray-600">
            Year
          </label>
          <div className="relative">
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleChange}
              className="cursor-pointer appearance-none w-full bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm rounded-lg pl-3 pr-8 py-2 outline-none transition shadow-sm text-gray-800"
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
