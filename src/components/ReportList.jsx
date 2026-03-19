// ReportList.jsx
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

  const canModify = (report) => {
    return user?.role === "admin" || report.createdBy === user?.id;
  };

  if (!reports || reports.length === 0) {
    return <p className="text-gray-500 mt-6">No reports found</p>;
  }

  return (
    <>
      {/* CARD LAYOUT — mobile only */}
      <div className="flex flex-col gap-3 sm:hidden">
        {reports.map((r) => (
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
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  r.completed === true
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.completed ? "Approved" : "For Review"}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-1">📍 {r.areaAssignment}</p>
            <p className="text-sm text-gray-600 mb-3">⛪ {r.churchName}</p>

            {canModify(r) && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleEdit(r._id)}
                  disabled={editingId === r._id}
                  className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {editingId === r._id ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <FaEdit />
                  )}
                  Edit
                </button>
                <button
                  onClick={() => setConfirmId(r._id)}
                  disabled={deleting}
                  className="cursor-pointer flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TABLE LAYOUT — desktop only */}
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
              <th className="p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.worker}</td>
                <td className="p-3">{r.month}</td>
                <td className="p-3">{r.year}</td>
                <td className="p-3">{r.areaAssignment}</td>
                <td className="p-3">{r.churchName}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      r.completed === true
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.completed ? "Approved" : "For Review"}
                  </span>
                </td>
                <td className="p-3 flex gap-4 items-center min-h-[48px]">
                  {canModify(r) ? (
                    <>
                      <button
                        onClick={() => handleEdit(r._id)}
                        disabled={editingId === r._id}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {editingId === r._id ? (
                          <Spinner className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FaEdit />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmId(r._id)}
                        disabled={deleting}
                        className="cursor-pointer text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <FaTrash />
                      </button>
                    </>
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
