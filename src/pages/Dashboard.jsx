import { useEffect, useState } from "react";
import API from "../services/api";
import ReportList from "../components/ReportList";
import FilterBar from "../components/FilterBar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    month: "",
    worker: "",
    area: "",
    church: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await API.get("/reports");
      console.log(res.data);
      setReports(res.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    return (
      (filters.month === "" ||
        r.month.toLowerCase().includes(filters.month.toLowerCase())) &&
      (filters.worker === "" ||
        r.worker.toLowerCase().includes(filters.worker.toLowerCase())) &&
      (filters.area === "" ||
        r.areaAssignment.toLowerCase().includes(filters.area.toLowerCase())) &&
      (filters.church === "" ||
        r.churchName.toLowerCase().includes(filters.church.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ministry Reports</h1>

        <button
          onClick={() => navigate("/create-report")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Report
        </button>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ReportList reports={filteredReports} />
      )}
    </div>
  );
}

export default Dashboard;
