// /src/pages/CreateReport.jsx
import { useNavigate } from "react-router-dom";
import ReportForm from "../components/ReportForm";

function CreateReport() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer shrink-0 flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Create Monthly Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Fill in your ministry report for the month
          </p>
        </div>
      </div>

      <ReportForm />
    </div>
  );
}

export default CreateReport;
