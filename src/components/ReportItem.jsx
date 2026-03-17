// ReportItem.jsx
import API from "../services/api";
import Spinner from "./Spinner";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ReportItem({ report, fetchReports }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleComplete = async () => {
    try {
      setToggling(true);
      await API.patch(`/reports/${report._id}/complete`);
      fetchReports();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  const deleteReport = async () => {
    try {
      setDeleting(true);
      await API.delete(`/reports/${report._id}`);
      toast.success("Report deleted!");
      fetchReports();
    } catch {
      toast.error("Failed to delete report.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      {" "}
      {/* stacks sa mobile */}
      <div>
        <p className="font-semibold text-gray-800">{report.worker}</p>
        <p className="text-sm text-gray-500">{report.month}</p>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={toggleComplete}
          disabled={toggling}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
        >
          {toggling ? <Spinner className="h-4 w-4" /> : null}
          {report.completed ? "Completed" : "Mark Complete"}
        </button>

        <button
          onClick={deleteReport}
          disabled={deleting}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {deleting ? <Spinner className="h-4 w-4" /> : null}
          Delete
        </button>
      </div>
    </div>
  );
}
