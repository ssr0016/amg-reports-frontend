import { MONTHS } from "../constants";

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
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={trackerMonth}
          onChange={(e) => setTrackerMonth(e.target.value)}
          className="input cursor-pointer sm:w-48"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={trackerYear}
          onChange={(e) => setTrackerYear(Number(e.target.value))}
          className="input cursor-pointer sm:w-32"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{submittedCount}</p>
          <p className="text-xs text-green-600 font-medium">Submitted</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{notSubmittedCount}</p>
          <p className="text-xs text-red-500 font-medium">Not Submitted</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
          <p className="text-xs text-blue-500 font-medium">Approved</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 border border-gray-100 mb-4">
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
            className="bg-green-500 h-3 rounded-full transition-all"
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

      {/* MOBILE */}
      <div className="flex flex-col gap-3 sm:hidden">
        {trackerData.map(({ worker: w, report: r, submitted, approved }) => (
          <div
            key={w._id}
            className={`rounded-xl p-4 border ${submitted ? "bg-white border-gray-100" : "bg-red-50 border-red-200"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{w.name}</p>
                <p className="text-xs text-gray-500">@{w.username}</p>
                {r && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    ⛪ {r.churchName}
                  </p>
                )}
                {r && (
                  <p className="text-xs text-gray-500">📍 {r.areaAssignment}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${submitted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                >
                  {submitted ? "✓ Submitted" : "✗ Not Submitted"}
                </span>
                {submitted && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {approved ? "Approved" : "For Review"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">WORKER</th>
              <th className="p-3">CHURCH</th>
              <th className="p-3">AREA OF ASSIGNMENT</th>
              <th className="p-3">SUBMITTED</th>
              <th className="p-3">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {trackerData.map(
              ({ worker: w, report: r, submitted, approved }) => (
                <tr
                  key={w._id}
                  className={`border-b ${!submitted ? "bg-red-50" : "hover:bg-gray-50"}`}
                >
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{w.name}</p>
                    <p className="text-xs text-gray-500">@{w.username}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {r?.churchName || "—"}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {r?.areaAssignment || "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${submitted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {submitted ? "✓ Submitted" : "✗ Not Yet"}
                    </span>
                  </td>
                  <td className="p-3">
                    {submitted ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
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
    </>
  );
}
