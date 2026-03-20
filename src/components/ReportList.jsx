// /src/components/ReportList.jsx
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import Spinner from "./Spinner";
import { useAuth } from "../context/AuthContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function ReportList({ reports, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id) => {
    setEditingId(id);
    navigate(`/edit-report/${id}`);
  };

  const deleteReport = async () => {
    if (!confirmId) return;
    try {
      setDeleting(true);
      await API.delete(`/reports/${confirmId}`);
      toast.success("Report deleted successfully!");
      setConfirmId(null);
      onDelete?.();
    } catch {
      toast.error("Failed to delete report.");
    } finally {
      setDeleting(false);
    }
  };

  const canModify = (report) =>
    user?.role === "admin" || report.createdBy === user?.id;

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-4">
        <p className="text-base font-medium">No reports found</p>
        <p className="text-sm">Try adjusting the filters above.</p>
      </div>
    );
  }

  return (
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
            {canModify(r) && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(r._id)}
                  disabled={editingId === r._id}
                  className="cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition"
                >
                  {editingId === r._id ? (
                    <Spinner className="h-3 w-3" />
                  ) : (
                    <FaEdit className="h-3 w-3" />
                  )}
                  Edit
                </button>
                <button
                  onClick={() => setConfirmId(r._id)}
                  disabled={deleting}
                  className="cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                >
                  <FaTrash className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── DESKTOP TABLE — same style as AdminPanel ── */}
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
                "Actions",
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
                  {canModify(r) ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(r._id)}
                        disabled={editingId === r._id}
                        title="Edit"
                        className="cursor-pointer p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition"
                      >
                        {editingId === r._id ? (
                          <Spinner className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <FaEdit className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmId(r._id)}
                        disabled={deleting}
                        title="Delete"
                        className="cursor-pointer p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        show={!!confirmId}
        title="Delete Report?"
        loading={deleting}
        onConfirm={deleteReport}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
