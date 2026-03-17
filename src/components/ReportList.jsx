// ReportList.jsx
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import Spinner from "./Spinner";

export default function ReportList({ reports }) {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false); // ✅
  const [editingId, setEditingId] = useState(null); // ✅

  const handleEdit = (id) => {
    setEditingId(id);
    navigate(`/edit-report/${id}`);
  };

  const deleteReport = async () => {
    if (!confirmId) return;

    try {
      setDeleting(true); // ✅
      await API.delete(`/reports/${confirmId}`);
      toast.success("Report deleted successfully!");
      setConfirmId(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to delete report.");
    } finally {
      setDeleting(false); // ✅
    }
  };

  if (!reports || reports.length === 0) {
    return <p className="text-gray-500 mt-6">No reports found</p>;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Worker</th>
              <th className="p-3">Month</th>
              <th className="p-3">Area</th>
              <th className="p-3">Church</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((r) => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.worker}</td>
                <td className="p-3">{r.month}</td>
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

                <td className="p-3 flex gap-4 items-center">
                  {/* ✅ EDIT WITH SPINNER */}
                  <button
                    onClick={() => handleEdit(r._id)}
                    disabled={editingId === r._id}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {editingId === r._id ? (
                      <Spinner className="h-4 w-4 text-blue-600" />
                    ) : (
                      <FaEdit />
                    )}
                  </button>

                  {/* ✅ DELETE WITH SPINNER */}
                  <button
                    onClick={() => setConfirmId(r._id)}
                    disabled={deleting}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Delete Report?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteReport}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {/* ✅ SPINNER SA DELETE BUTTON */}
                {deleting ? (
                  <>
                    <Spinner className="h-4 w-4 text-white" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
