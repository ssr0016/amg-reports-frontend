export default function FilterBar({ filters, setFilters }) {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      <input
        name="month"
        placeholder="Month"
        value={filters.month}
        onChange={handleChange}
        className="input"
      />

      <input
        name="worker"
        placeholder="Worker"
        value={filters.worker}
        onChange={handleChange}
        className="input"
      />

      <input
        name="area"
        placeholder="Area Of Assignment"
        value={filters.area}
        onChange={handleChange}
        className="input"
      />

      <input
        name="church"
        placeholder="Church Name"
        value={filters.church}
        onChange={handleChange}
        className="input"
      />
    </div>
  );
}
