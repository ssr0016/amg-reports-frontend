// /src/components/ExcelPreviewModal.jsx
import { FaDownload, FaTimes, FaFileExcel } from "react-icons/fa";

// ─── SINGLE REPORT PREVIEW ────────────────────────────────────────────────────

function SingleReportPreview({ report }) {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

  const attendanceRows = [
    ["Worship Service", report.worshipService],
    ["Sunday School", report.sundaySchool],
    ["Prayer Meeting", report.prayerMeeting],
    ["Bible Studies", report.bibleStudies],
    ["Men's Fellowship", report.mensFellowship],
    ["Women's Fellowship", report.womensFellowship],
    ["Youth Fellowship", report.youthFellowship],
    ["Children Fellowship", report.childrenFellowship],
    ["Outreach", report.outreach],
  ];

  const ministryRows = [
    ["Home Visited", report.homeVisited],
    ["Bible Study Group Led", report.bibleStudyGroupLed],
    ["Sermon/Message Preached", report.sermonPreached],
    ["Person Newly Contacted", report.personNewlyContacted],
    ["Person Followed-up", report.personFollowedUp],
    ["Person Led To Christ", report.personEvangelized],
  ];

  const avg = (data) => {
    if (!data) return "-";
    const vals = [data.week1, data.week2, data.week3, data.week4, data.week5]
      .map(Number)
      .filter((v) => !isNaN(v) && v !== 0);
    if (!vals.length) return "-";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const TableSection = ({ title, rows }) => (
    <div className="mb-4">
      <div className="bg-black text-white text-xs font-bold px-3 py-1.5">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1.5 text-left w-40">
                Activity
              </th>
              {weeks.map((w) => (
                <th
                  key={w}
                  className="border border-gray-300 px-2 py-1.5 text-center"
                >
                  {w}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-1.5 text-center bg-yellow-50">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, data]) => (
              <tr key={label} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1.5 font-medium text-gray-700">
                  {label}
                </td>
                {["week1", "week2", "week3", "week4", "week5"].map((wk) => (
                  <td
                    key={wk}
                    className="border border-gray-300 px-2 py-1.5 text-center text-gray-600"
                  >
                    {data?.[wk] ?? "-"}
                  </td>
                ))}
                <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-blue-700 bg-yellow-50">
                  {avg(data)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="text-sm">
      {/* Info */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 rounded-lg p-3 text-xs">
        <div>
          <span className="text-gray-500">Worker:</span>{" "}
          <span className="font-semibold text-gray-800">{report.worker}</span>
        </div>
        <div>
          <span className="text-gray-500">Month/Year:</span>{" "}
          <span className="font-semibold text-gray-800">
            {report.month} {report.year}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Area:</span>{" "}
          <span className="font-semibold text-gray-800">
            {report.areaAssignment}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Church:</span>{" "}
          <span className="font-semibold text-gray-800">
            {report.churchName}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>{" "}
          <span
            className={`font-semibold px-1.5 py-0.5 rounded-full text-xs ${report.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
          >
            {report.completed ? "Approved" : "For Review"}
          </span>
        </div>
      </div>

      <TableSection title="Weekly Attendance" rows={attendanceRows} />
      <TableSection title="Ministry Activities" rows={ministryRows} />

      {/* Narrative / Challenges / Prayer */}
      {(report.narrativeReport ||
        report.challenges ||
        report.prayerRequest) && (
        <div className="grid grid-cols-1 gap-2 text-xs">
          {report.narrativeReport && (
            <div className="bg-gray-50 rounded p-2">
              <p className="font-semibold text-gray-700 mb-1">
                Narrative Report
              </p>
              <p className="text-gray-600">{report.narrativeReport}</p>
            </div>
          )}
          {report.challenges && (
            <div className="bg-gray-50 rounded p-2">
              <p className="font-semibold text-gray-700 mb-1">
                Challenges / Problems
              </p>
              <p className="text-gray-600">{report.challenges}</p>
            </div>
          )}
          {report.prayerRequest && (
            <div className="bg-gray-50 rounded p-2">
              <p className="font-semibold text-gray-700 mb-1">Prayer Request</p>
              <p className="text-gray-600">{report.prayerRequest}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BULK REPORTS PREVIEW ─────────────────────────────────────────────────────

function BulkReportsPreview({ reports, bulkMonth, bulkYear }) {
  const approved = reports.filter((r) => r.completed === true);
  const forReview = reports.filter((r) => r.completed !== true);

  return (
    <div className="text-sm">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{reports.length}</p>
          <p className="text-xs text-blue-500 mt-0.5">Total Reports</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{approved.length}</p>
          <p className="text-xs text-green-500 mt-0.5">Approved</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{forReview.length}</p>
          <p className="text-xs text-red-400 mt-0.5">For Review</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">
        Only <span className="font-semibold text-green-600">Approved</span>{" "}
        reports will be included in the download.
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 px-3 py-2 text-left">
                #
              </th>
              <th className="border-b border-gray-200 px-3 py-2 text-left">
                Church / Worker
              </th>
              <th className="border-b border-gray-200 px-3 py-2 text-center">
                Month
              </th>
              <th className="border-b border-gray-200 px-3 py-2 text-center">
                Year
              </th>
              <th className="border-b border-gray-200 px-3 py-2 text-center">
                Status
              </th>
              <th className="border-b border-gray-200 px-3 py-2 text-center">
                Support
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr
                key={r._id}
                className={`${r.completed ? "bg-white" : "bg-red-50/40"} hover:bg-gray-50`}
              >
                <td className="border-b border-gray-100 px-3 py-2 text-gray-400">
                  {i + 1}
                </td>
                <td className="border-b border-gray-100 px-3 py-2 font-medium text-gray-800">
                  {r.churchName || r.worker}
                </td>
                <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">
                  {r.month}
                </td>
                <td className="border-b border-gray-100 px-3 py-2 text-center text-gray-600">
                  {r.year}
                </td>
                <td className="border-b border-gray-100 px-3 py-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {r.completed ? "Approved" : "For Review"}
                  </span>
                </td>
                <td className="border-b border-gray-100 px-3 py-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.completed ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {r.completed ? "Ready" : "On Hold"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

export default function ExcelPreviewModal({
  show,
  onClose,
  onConfirmDownload,
  // For single report preview:
  report = null,
  // For bulk preview:
  reports = null,
  bulkMonth = "",
  bulkYear = "",
}) {
  if (!show) return null;

  const isBulk = !!reports;
  const title = isBulk
    ? `Bulk Download Preview — ${bulkMonth} ${bulkYear}`
    : `Report Preview — ${report?.worker}`;

  const fileName = isBulk
    ? `Reports_${bulkMonth}_${bulkYear}.xlsx`
    : `${report?.worker}_${report?.month}_${report?.year}.xlsx`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaFileExcel className="text-green-600 h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{title}</h2>
              <p className="text-xs text-gray-400">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {isBulk ? (
            <BulkReportsPreview
              reports={reports}
              bulkMonth={bulkMonth}
              bulkYear={bulkYear}
            />
          ) : report ? (
            <SingleReportPreview report={report} />
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDownload();
              onClose();
            }}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-sm"
          >
            <FaDownload className="h-3 w-3" />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}
