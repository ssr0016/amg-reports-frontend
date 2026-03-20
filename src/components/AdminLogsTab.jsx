// /src/components/AdminLogsTab.jsx
import { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import Spinner from "./Spinner";
import Pagination from "./Spinner";

const ACTION_LABELS = {
  APPROVE_REPORT: {
    label: "Approved Report",
    color: "bg-green-100 text-green-700",
  },
  UNAPPROVE_REPORT: {
    label: "Unapproved Report",
    color: "bg-yellow-100 text-yellow-700",
  },
  DELETE_REPORT: { label: "Deleted Report", color: "bg-red-100 text-red-700" },
  CREATE_USER: { label: "Created User", color: "bg-blue-100 text-blue-700" },
  UPDATE_USER: {
    label: "Updated User",
    color: "bg-indigo-100 text-indigo-700",
  },
  DELETE_USER: { label: "Deleted User", color: "bg-red-100 text-red-700" },
  DOWNLOAD_SINGLE_EXCEL: {
    label: "Downloaded Excel",
    color: "bg-teal-100 text-teal-700",
  },
  DOWNLOAD_BULK_EXCEL: {
    label: "Bulk Downloaded Excel",
    color: "bg-teal-100 text-teal-700",
  },
  LOGIN: { label: "Logged In", color: "bg-gray-100 text-gray-600" },
  LOGOUT: { label: "Logged Out", color: "bg-gray-100 text-gray-600" },
};

const ACTION_ICONS = {
  APPROVE_REPORT: "✅",
  UNAPPROVE_REPORT: "↩️",
  DELETE_REPORT: "🗑️",
  CREATE_USER: "➕",
  UPDATE_USER: "✏️",
  DELETE_USER: "🗑️",
  DOWNLOAD_SINGLE_EXCEL: "📥",
  DOWNLOAD_BULK_EXCEL: "📦",
  LOGIN: "🔐",
  LOGOUT: "🚪",
};

const ITEMS_PER_PAGE = 15;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: ITEMS_PER_PAGE };
      if (filterAction) params.action = filterAction;

      const res = await API.get("/audit-logs", { params });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch {
      // silently fail — logs are non-critical
    } finally {
      setLoading(false);
    }
  }, [page, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  useEffect(() => {
    setPage(1);
  }, [filterAction]);

  return (
    <div>
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">{total} total logs</p>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
            Filter
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="cursor-pointer appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 text-gray-800 text-sm font-medium rounded-lg px-3 py-2 outline-none shadow-sm transition"
          >
            <option value="">All Actions</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <p className="text-base font-medium">No logs found</p>
          <p className="text-sm">
            Actions will appear here once admins start using the system.
          </p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {logs.map((log) => {
              const meta = ACTION_LABELS[log.action] || {
                label: log.action,
                color: "bg-gray-100 text-gray-600",
              };
              return (
                <div
                  key={log._id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {ACTION_ICONS[log.action] || "📋"}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {log.performedByName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {log.performedByRole}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {log.targetName && (
                    <p className="text-xs text-gray-600 mb-1 truncate">
                      🎯 {log.targetName}
                    </p>
                  )}
                  {log.details?.month && (
                    <p className="text-xs text-gray-400 mb-1">
                      📅 {log.details.month} {log.details.year}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-2">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Date & Time",
                    "Admin",
                    "Role",
                    "Action",
                    "Target",
                    "Details",
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
                {logs.map((log) => {
                  const meta = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {log.performedByName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.performedByRole === "admin"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {log.performedByRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold w-fit ${meta.color}`}
                        >
                          <span>{ACTION_ICONS[log.action]}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                        {log.targetName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {log.details?.month
                          ? `${log.details.month} ${log.details.year ?? ""}`
                          : log.details?.updatedFields
                            ? `Fields: ${log.details.updatedFields.join(", ")}`
                            : log.details?.count
                              ? `${log.details.count} reports`
                              : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
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
