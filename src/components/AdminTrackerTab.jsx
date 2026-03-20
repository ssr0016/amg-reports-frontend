// /src/components/AdminTrackerTab.jsx
import { useState, useMemo } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";
import { MONTHS } from "../constants";

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "not_submitted", label: "Not Submitted" },
  { key: "approved", label: "Approved" },
  { key: "for_review", label: "For Review" },
];

export default function AdminTrackerTab({
  trackerData,
  trackerMonth,
  setTrackerMonth,
  trackerYear,
  setTrackerYear,
  submittedCount,
  notSubmittedCount,
  approvedCount,
  workers,
  years,
  loading, // ✅ new prop
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);

  const filtered = useMemo(() => {
    return trackerData.filter(({ worker: w, submitted, approved }) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.username.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && submitted) ||
        (statusFilter === "not_submitted" && !submitted) ||
        (statusFilter === "approved" && approved) ||
        (statusFilter === "for_review" && submitted && !approved);

      return matchSearch && matchStatus;
    });
  }, [trackerData, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleStatusFilter = (key) => {
    setStatusFilter(key);
    setPage(1);
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleMonthChange = (e) => {
    setTrackerMonth(e.target.value);
    setPage(1);
  };
  const handleYearChange = (e) => {
    setTrackerYear(Number(e.target.value));
    setPage(1);
  };

  // ✅ Brief spinner kapag nag-page change
  const handlePageChange = (newPage) => {
    setLoadingPage(true);
    setPage(newPage);
    setTimeout(() => setLoadingPage(false), 300);
  };

  return (
    <>
      {/* ── MONTH / YEAR DROPDOWNS ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">{workers.length} total workers</p>

        <div className="flex flex-row gap-2 items-end justify-end flex-wrap">
          <div className="flex flex-col gap-1 w-[160px] sm:w-[175px]">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Month
            </label>
            <div className="relative">
              <select
                value={trackerMonth}
                onChange={handleMonthChange}
                className="cursor-pointer w-full appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </div>

          <div className="flex flex-col gap-1 w-[100px] sm:w-[110px]">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Year
            </label>
            <div className="relative">
              <select
                value={trackerYear}
                onChange={handleYearChange}
                className="cursor-pointer w-full appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : (
        <>
          {/* ── SUMMARY CARDS ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {submittedCount}
              </p>
              <p className="text-xs text-green-600 font-medium">Submitted</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {notSubmittedCount}
              </p>
              <p className="text-xs text-red-500 font-medium">Not Submitted</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {approvedCount}
              </p>
              <p className="text-xs text-blue-500 font-medium">Approved</p>
            </div>
          </div>

          {/* ── PROGRESS BAR ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                {trackerMonth} {trackerYear} Submission Progress
              </p>
              <p className="text-sm font-bold text-gray-800">
                {submittedCount} / {workers.length}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width:
                    workers.length > 0
                      ? `${(submittedCount / workers.length) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {workers.length > 0
                ? `${Math.round((submittedCount / workers.length) * 100)}% submitted`
                : "No workers found"}
            </p>
          </div>

          {/* ── SEARCH + FILTER BUTTONS ── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              <input
                type="text"
                placeholder="Search worker..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleStatusFilter(key)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    statusFilter === key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      statusFilter === key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {key === "all"
                      ? trackerData.length
                      : key === "submitted"
                        ? submittedCount
                        : key === "not_submitted"
                          ? notSubmittedCount
                          : key === "approved"
                            ? approvedCount
                            : trackerData.filter(
                                (d) => d.submitted && !d.approved,
                              ).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── EMPTY STATE ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <p className="text-base font-medium">No workers found</p>
              <p className="text-sm">Try changing the filter or search term.</p>
            </div>
          ) : loadingPage ? (
            // ✅ Spinner kapag nag-page change
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-10 w-10 text-blue-600" />
            </div>
          ) : (
            <>
              {/* ── MOBILE CARDS ── */}
              <div className="flex flex-col gap-3 sm:hidden">
                {paginated.map(
                  ({ worker: w, report: r, submitted, approved }) => (
                    <div
                      key={w._id}
                      className={`rounded-xl p-4 border shadow-sm ${
                        submitted
                          ? "bg-white border-gray-100"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {w.name}
                          </p>
                          <p className="text-xs text-gray-400">@{w.username}</p>
                          {r && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              ⛪ {r.churchName}
                            </p>
                          )}
                          {r && (
                            <p className="text-xs text-gray-500 truncate">
                              📍 {r.areaAssignment}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              submitted
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {submitted ? "✓ Submitted" : "✗ Not Yet"}
                          </span>
                          {submitted && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                approved
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {approved ? "Approved" : "For Review"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden sm:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        "Worker",
                        "Church",
                        "Year",
                        "Area of Assignment",
                        "Submitted",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map(
                      ({ worker: w, report: r, submitted, approved }) => (
                        <tr
                          key={w._id}
                          className={`transition ${!submitted ? "bg-red-50 hover:bg-red-100/60" : "hover:bg-gray-50"}`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {w.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{w.username}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                            {r?.churchName || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {r?.year || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                            {r?.areaAssignment || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                submitted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {submitted ? "✓ Submitted" : "✗ Not Yet"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {submitted ? (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  approved
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {approved ? "Approved" : "For Review"}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                setPage={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
