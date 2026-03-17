import API from "../services/api";

export default function ReportItem({ report, fetchReports }) {
  const toggleComplete = async () => {
    await API.patch(`/reports/${report._id}/complete`);
    fetchReports();
  };

  const deleteReport = async () => {
    await API.delete(`/reports/${report._id}`);
    fetchReports();
  };

  return (
    <div className="border p-4 rounded flex justify-between">
      <div>
        <p className="font-semibold">{report.worker}</p>

        <p className="text-sm">{report.month}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={toggleComplete} className="text-green-600">
          {report.completed ? "Completed" : "Mark Complete"}
        </button>

        <button onClick={deleteReport} className="text-red-500">
          Delete
        </button>
      </div>
    </div>
  );
}
