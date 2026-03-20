// /src/components/AdminReportsTab.jsx
import { useState } from "react";
import { FaCheck, FaUndo, FaDownload, FaChevronDown } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";
import ExcelPreviewModal from "./ExcelPreviewModal";
import { exportSingleReport } from "../utils/exportExcel";
import { MONTHS } from "../constants";

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function AdminReportsTab({
  reports, // ✅ already paginated from backend — use directly
  paginatedReports, // same as reports (kept for compatibility)
  totalReportPages, // ✅ from backend
  totalReportCount, // ✅ total count from backend
  reportPage,
  setReportPage,
  loading,
  togglingId,
  onToggleComplete,
  bulkMonth,
  setBulkMonth,
  bulkYear,
  setBulkYear,
  onBulkDownload,
}) {
  const [previewModal, setPreviewModal] = useState({
    show: false,
    mode: null,
    report: null,
  });

  const openSinglePreview = (r) =>
    setPreviewModal({ show: true, mode: "single", report: r });

  const openBulkPreview = () =>
    setPreviewModal({ show: true, mode: "bulk", report: null });

  const closePreview = () =>
    setPreviewModal({ show: false, mode: null, report: null });

  const handleConfirmSingleDownload = async () => {
    if (previewModal.report) await exportSingleReport(previewModal.report);
  };

  return (
    <>
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        {/* ✅ totalReportCount — accurate total from backend */}
        <p className="text-sm text-gray-500">
          {totalReportCount ?? reports.length} total reports
        </p>

        {/* Controls — right side, inline always */}
        <div className="flex flex-row gap-2 items-end justify-end flex-wrap">
          {/* Month */}
          <div className="flex flex-col gap-1 w-[160px] sm:w-[175px]">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Month
            </label>
            <div className="relative">
              <select
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
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

          {/* Year */}
          <div className="flex flex-col gap-1 w-[100px] sm:w-[110px]">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Year
            </label>
            <div className="relative">
              <select
                value={bulkYear}
                onChange={(e) => setBulkYear(parseInt(e.target.value))}
                className="cursor-pointer w-full appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm"
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

          {/* Bulk Download */}
          <button
            onClick={openBulkPreview}
            className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap shadow-sm transition self-end"
          >
            <FaDownload className="shrink-0" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* ── STATES ── */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-4">
          <p className="text-base font-medium">No reports found</p>
          <p className="text-sm">
            No reports submitted for {bulkMonth} {bulkYear} yet.
          </p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {reports.map((r) => (
              <div
                key={r._id}
                className="bg-white shadow-sm rounded-xl p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {r.worker}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.month} {r.year}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${
                      r.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.completed ? "Approved" : "For Review"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5 truncate">
                  📍 {r.areaAssignment}
                </p>
                <p className="text-xs text-gray-500 mb-3 truncate">
                  ⛪ {r.churchName}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleComplete(r._id)}
                    disabled={togglingId === r._id}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg disabled:opacity-50 transition ${
                      r.completed
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {togglingId === r._id ? (
                      <Spinner className="h-3 w-3" />
                    ) : r.completed ? (
                      <FaUndo className="h-3 w-3" />
                    ) : (
                      <FaCheck className="h-3 w-3" />
                    )}
                    {r.completed ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => openSinglePreview(r)}
                    className="cursor-pointer flex items-center justify-center gap-1 text-xs px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    <FaDownload className="h-3 w-3" /> Excel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Worker",
                    "Month",
                    "Year",
                    "Area of Assignment",
                    "Church",
                    "Status",
                    "Action",
                    "Download",
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
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {r.worker}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {r.month}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.year}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {r.areaAssignment}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                      {r.churchName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          r.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.completed ? "Approved" : "For Review"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleComplete(r._id)}
                        disabled={togglingId === r._id}
                        className={`cursor-pointer flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 whitespace-nowrap transition ${
                          r.completed
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {togglingId === r._id ? (
                          <Spinner className="h-3 w-3" />
                        ) : r.completed ? (
                          <>
                            <FaUndo className="h-3 w-3" /> Unapprove
                          </>
                        ) : (
                          <>
                            <FaCheck className="h-3 w-3" /> Approve
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openSinglePreview(r)}
                        className="cursor-pointer flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition"
                      >
                        <FaDownload className="h-3 w-3" /> Excel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination — uses backend total pages */}
          <Pagination
            currentPage={reportPage}
            totalPages={totalReportPages}
            setPage={setReportPage}
          />
        </>
      )}

      {/* ── PREVIEW MODAL ── */}
      <ExcelPreviewModal
        show={previewModal.show}
        onClose={closePreview}
        onConfirmDownload={
          previewModal.mode === "bulk"
            ? onBulkDownload
            : handleConfirmSingleDownload
        }
        report={previewModal.mode === "single" ? previewModal.report : null}
        reports={previewModal.mode === "bulk" ? reports : null}
        bulkMonth={bulkMonth}
        bulkYear={bulkYear}
      />
    </>
  );
}
