// Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import ReportList from "../components/ReportList";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ITEMS_PER_PAGE } from "../constants";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";

function getPrevMonthName() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return prev.toLocaleString("en-US", { month: "long" });
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const currentYear = new Date().getFullYear();
  const prevMonthIndex = new Date().getMonth() - 1;

  const [filters, setFilters] = useState({
    month: getPrevMonthName(), // ✅ default previous month
    year:
      prevMonthIndex < 0 // ✅ default current year
        ? currentYear - 1 //    kung January, previous year
        : currentYear,
    worker: "",
    area: "",
    church: "",
  });

  const debouncedFilters = useDebounce(filters, 300);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports", {
        params: {
          month: debouncedFilters.month || undefined,
          year: debouncedFilters.year, // ✅ laging may year — hindi undefined
          worker: debouncedFilters.worker || undefined,
          area: debouncedFilters.area || undefined,
          church: debouncedFilters.church || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });
      setReports(res.data.data);
      setTotalReports(res.data.total);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, currentPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const showingFrom =
    totalReports === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalReports);

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
            {totalReports === 0
              ? `No reports found${filters.month ? ` for ${filters.month}` : ""} ${filters.year}`
              : `Showing ${showingFrom} – ${showingTo} of ${totalReports} reports${filters.month ? ` for ${filters.month}` : " for All Months"} ${filters.year}`}
          </p>

          <ReportList reports={reports} onDelete={fetchReports} />

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
