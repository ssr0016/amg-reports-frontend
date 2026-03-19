// Dashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../services/api";
import ReportList from "../components/ReportList";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ITEMS_PER_PAGE } from "../constants";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";

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

  // ✅ debounce filters — wait 300ms after user stops typing before filtering
  const debouncedFilters = useDebounce(filters, 300);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports");
      setReports(res.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ✅ useMemo — only recomputes when debouncedFilters or reports change
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const monthDisplay = `${r.month || ""} ${r.year || ""}`.toLowerCase();
      const worker = (r.worker || "").toLowerCase();
      const area = (r.areaAssignment || "").toLowerCase();
      const church = (r.churchName || "").toLowerCase();

      return (
        (debouncedFilters.month === "" ||
          monthDisplay.includes(debouncedFilters.month.toLowerCase())) &&
        (debouncedFilters.worker === "" ||
          worker.includes(debouncedFilters.worker.toLowerCase())) &&
        (debouncedFilters.area === "" ||
          area.includes(debouncedFilters.area.toLowerCase())) &&
        (debouncedFilters.church === "" ||
          church.includes(debouncedFilters.church.toLowerCase()))
      );
    });
  }, [reports, debouncedFilters]);

  // ✅ reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

  // ✅ useMemo for paginated slice too
  const paginatedReports = useMemo(() => {
    return filteredReports.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filteredReports, currentPage]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
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

          <ReportList reports={paginatedReports} onDelete={fetchReports} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
