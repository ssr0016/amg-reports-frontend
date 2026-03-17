import { useParams } from "react-router-dom";
import ReportForm from "../components/ReportForm";

function EditReport() {
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Report</h1>

      <ReportForm reportId={id} />
    </div>
  );
}

export default EditReport;
