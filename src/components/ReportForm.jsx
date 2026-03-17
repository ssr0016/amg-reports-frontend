// ReportForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import Spinner from "./Spinner";

export default function ReportForm({ fetchReports, reportId }) {
  const navigate = useNavigate();
  const isEditing = !!reportId;

  const [form, setForm] = useState({
    month: "",
    worker: "",
    areaAssignment: "",
    churchName: "",
    worshipService: { week1: "", week2: "", week3: "", week4: "" },
    sundaySchool: { week1: "", week2: "", week3: "", week4: "" },
    prayerMeeting: { week1: "", week2: "", week3: "", week4: "" },
    outreach: "",
    training: "",
    leadership: "",
    baptism: "",
    names: "",
    narrativeReport: "",
    challenges: "",
    prayerRequest: "",
  });

  const [loading, setLoading] = useState(false); // ✅ loading sa submit button
  const [fetching, setFetching] = useState(false); // ✅ loading habang nag-fetch ng data

  useEffect(() => {
    if (isEditing) {
      const fetchReport = async () => {
        try {
          setFetching(true);
          const res = await API.get(`/reports/${reportId}`);
          setForm(res.data.data);
        } catch (error) {
          toast.error("Failed to load report.");
          console.error("Error fetching report:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWeekChange = (category, week, value) => {
    setForm({
      ...form,
      [category]: {
        ...form[category],
        [week]: value,
      },
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditing) {
        await API.put(`/reports/${reportId}`, form);
        toast.success("Report updated successfully!");
      } else {
        await API.post("/reports", form);
        toast.success("Report created successfully!");
      }

      setTimeout(() => navigate("/"), 1000); // ✅ may time para makita ang toast
    } catch (error) {
      toast.error("Failed to submit report.");
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  const weeks = [1, 2, 3, 4];

  // ✅ loading screen habang nag-fetch ng existing report
  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white shadow-lg rounded-xl p-8 mb-10 border border-gray-100"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {isEditing ? "Edit Monthly Report" : "Create Monthly Report"}
      </h2>

      {/* BASIC INFO */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <input
          name="month"
          placeholder="Month (ex. April 2026)"
          onChange={handleChange}
          value={form.month}
          className="input"
        />
        <input
          name="worker"
          placeholder="Worker Name"
          onChange={handleChange}
          value={form.worker}
          className="input"
        />
        <input
          name="areaAssignment"
          placeholder="Area Assignment"
          onChange={handleChange}
          value={form.areaAssignment}
          className="input"
        />
        <input
          name="churchName"
          placeholder="Church Name"
          onChange={handleChange}
          value={form.churchName}
          className="input"
        />
      </div>

      {/* WEEKLY REPORTS */}
      <Section
        title="Worship Service"
        weeks={weeks}
        category="worshipService"
        handler={handleWeekChange}
        values={form.worshipService}
      />
      <Section
        title="Sunday School"
        weeks={weeks}
        category="sundaySchool"
        handler={handleWeekChange}
        values={form.sundaySchool}
      />
      <Section
        title="Prayer Meeting"
        weeks={weeks}
        category="prayerMeeting"
        handler={handleWeekChange}
        values={form.prayerMeeting}
      />

      {/* MINISTRY COUNTS */}
      <h3 className="section-title">Ministry Activities</h3>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <input
          name="outreach"
          placeholder="Outreach"
          type="number"
          onChange={handleChange}
          value={form.outreach}
          className="input"
        />
        <input
          name="training"
          placeholder="Training"
          type="number"
          onChange={handleChange}
          value={form.training}
          className="input"
        />
        <input
          name="leadership"
          placeholder="Leadership"
          type="number"
          onChange={handleChange}
          value={form.leadership}
          className="input"
        />
        <input
          name="baptism"
          placeholder="Baptism"
          type="number"
          onChange={handleChange}
          value={form.baptism}
          className="input"
        />
      </div>

      {/* TEXT AREAS */}
      <textarea
        name="names"
        placeholder="Names"
        onChange={handleChange}
        value={form.names}
        className="textarea"
      />
      <textarea
        name="narrativeReport"
        placeholder="Narrative Report"
        onChange={handleChange}
        value={form.narrativeReport}
        className="textarea"
      />
      <textarea
        name="challenges"
        placeholder="Challenges"
        onChange={handleChange}
        value={form.challenges}
        className="textarea"
      />
      <textarea
        name="prayerRequest"
        placeholder="Prayer Requests"
        onChange={handleChange}
        value={form.prayerRequest}
        className="textarea"
      />

      {/* ✅ SUBMIT BUTTON WITH SPINNER */}
      <button
        className="submit-btn flex items-center justify-center gap-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            {isEditing ? "Updating..." : "Submitting..."}
          </>
        ) : isEditing ? (
          "Update Report"
        ) : (
          "Submit Report"
        )}
      </button>
    </form>
  );
}

function Section({ title, weeks, category, handler, values = {} }) {
  return (
    <>
      <h3 className="section-title">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {weeks.map((w) => (
          <input
            key={w}
            type="number"
            placeholder={`Week ${w}`}
            className="input"
            value={values[`week${w}`] ?? ""}
            onChange={(e) => handler(category, `week${w}`, e.target.value)}
          />
        ))}
      </div>
    </>
  );
}
