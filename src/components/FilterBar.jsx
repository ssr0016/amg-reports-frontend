export default function FilterBar({ filters, setFilters }) {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Search Filters
      </h2>
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
            placeholder="e.g. AMGC Churches"
            value={filters.church}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>
    </div>
  );
}
