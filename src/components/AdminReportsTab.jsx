import { FaCheck, FaUndo, FaDownload, FaChevronDown } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";
import { exportSingleReport } from "../utils/exportExcel";
import { MONTHS } from "../constants";
import toast from "react-hot-toast";

export default function AdminReportsTab({
  reports,
  paginatedReports,
  totalReportPages,
  reportPage,
  setReportPage,
  loading,
  togglingId,
  onToggleComplete,
  bulkMonth,
  setBulkMonth,
  onBulkDownload,
}) {
  const handleDownload = async (r) => {
    await exportSingleReport(r);
  };

  const handleBulkDownloadClick = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-800">
            Download all{" "}
            <span className="text-blue-600 font-semibold">{bulkMonth}</span>{" "}
            reports?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="cursor-pointer text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onBulkDownload();
              }}
              className="cursor-pointer text-sm px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              Download
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
        <p className="text-sm text-gray-500">{reports.length} total reports</p>
        <div className="flex gap-2 items-end">
          {/* ✅ improved select month */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Month
            </label>
            <div className="relative">
              <select
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                className="cursor-pointer appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 w-44 transition outline-none shadow-sm"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {/* custom chevron icon */}
              <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </div>

          <button
            onClick={handleBulkDownloadClick}
            className="cursor-pointer flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap shadow-sm transition"
          >
            <FaDownload /> Download Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="flex flex-col gap-3 sm:hidden">
            {paginatedReports.map((r) => (
              <div
                key={r._id}
                className="bg-white shadow rounded-xl p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{r.worker}</p>
                    <p className="text-sm text-gray-500">
                      {r.month} {r.year}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${r.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {r.completed ? "Approved" : "For Review"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {r.areaAssignment}
                </p>
                <p className="text-sm text-gray-600 mb-3">⛪ {r.churchName}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onToggleComplete(r._id)}
                    disabled={togglingId === r._id}
                    className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${r.completed ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
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
                    onClick={() => handleDownload(r)}
                    className="cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    <FaDownload className="h-3 w-3" /> Excel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block bg-white shadow rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">WORKER</th>
                  <th className="p-3">MONTH</th>
                  <th className="p-3">YEAR</th>
                  <th className="p-3">AREA OF ASSIGNMENT</th>
                  <th className="p-3">CHURCH</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">ACTION</th>
                  <th className="p-3">DOWNLOAD</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{r.worker}</td>
                    <td className="p-3">{r.month}</td>
                    <td className="p-3">{r.year}</td>
                    <td className="p-3">{r.areaAssignment}</td>
                    <td className="p-3">{r.churchName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${r.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {r.completed ? "Approved" : "For Review"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onToggleComplete(r._id)}
                        disabled={togglingId === r._id}
                        className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${r.completed ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
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
                    <td className="p-3">
                      <button
                        onClick={() => handleDownload(r)}
                        title="Download as Excel"
                        className="cursor-pointer flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                      >
                        <FaDownload /> Excel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={reportPage}
            totalPages={totalReportPages}
            setPage={setReportPage}
          />
        </>
      )}
    </>
  );
}
