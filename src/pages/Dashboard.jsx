// Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../services/api";
import ReportList from "../components/ReportList";
import FilterBar from "../components/FilterBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 26;

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ministry Reports</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{user?.name}</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  user?.role === "admin"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="cursor-pointer flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => navigate("/create-report")}
            className="cursor-pointer flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Create Report
          </button>

          <button
            onClick={handleLogout}
            className="cursor-pointer flex-1 sm:flex-none bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">
            Showing {paginatedReports.length} of {filteredReports.length}{" "}
            reports
          </p>

          <ReportList reports={paginatedReports} />

          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-1 sm:gap-2 mt-6 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`cursor-pointer px-2 sm:px-3 py-1 rounded-lg text-sm border ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
