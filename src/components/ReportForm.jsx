// ReportForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import Spinner from "./Spinner";

const defaultWeeks5 = { week1: "", week2: "", week3: "", week4: "", week5: "" };

const VALID_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseMonthFromInput(input) {
  const lower = input.trim().toLowerCase();
  return VALID_MONTHS.find((m) => lower.includes(m));
}

function parseYearFromInput(input) {
  const match = input.match(/\d{4}/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

export default function ReportForm({ reportId }) {
  const navigate = useNavigate();
  const isEditing = !!reportId;

  const [form, setForm] = useState({
    month: "",
    year: new Date().getFullYear(), // ✅ explicit year field
    worker: "",
    areaAssignment: "",
    churchName: "",
    worshipService: { ...defaultWeeks5 },
    sundaySchool: { ...defaultWeeks5 },
    prayerMeeting: { ...defaultWeeks5 },
    bibleStudies: { ...defaultWeeks5 },
    tithesOffering: { ...defaultWeeks5 },
    homeVisited: { ...defaultWeeks5 },
    bibleStudyGroupLed: { ...defaultWeeks5 },
    sermonPreached: { ...defaultWeeks5 },
    personNewlyContacted: { ...defaultWeeks5 },
    personFollowedUp: { ...defaultWeeks5 },
    personEvangelized: { ...defaultWeeks5 },
    mensFellowship: { ...defaultWeeks5 },
    womensFellowship: { ...defaultWeeks5 },
    youthFellowship: { ...defaultWeeks5 },
    childrenFellowship: { ...defaultWeeks5 },
    outreach: { ...defaultWeeks5 },
    training: { ...defaultWeeks5 },
    leadership: { ...defaultWeeks5 },
    baptism: { ...defaultWeeks5 },
    other: { ...defaultWeeks5 },
    familyDay: { ...defaultWeeks5 },
    names: "",
    narrativeReport: "",
    challenges: "",
    prayerRequest: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchReport = async () => {
        try {
          setFetching(true);
          const res = await API.get(`/reports/${reportId}`);
          setForm(res.data.data);
        } catch {
          toast.error("Failed to load report.");
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

  // ✅ dedicated handler for month — keeps year in sync
  const handleMonthChange = (e) => {
    const value = e.target.value;
    const parsed = parseMonthFromInput(value);
    const parsedYear = parseYearFromInput(value);
    setForm({
      ...form,
      month: parsed ? parsed.charAt(0).toUpperCase() + parsed.slice(1) : value,
      year: parsedYear,
    });
  };

  const handleWeekChange = (category, week, value) => {
    setForm({
      ...form,
      [category]: { ...form[category], [week]: value },
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.month.trim()) return toast.error("Month is required.");
    if (!form.worker.trim()) return toast.error("Worker name is required.");
    if (!form.areaAssignment.trim())
      return toast.error("Area assignment is required.");
    if (!form.churchName.trim()) return toast.error("Church name is required.");

    const parsedMonth = parseMonthFromInput(form.month);
    if (!parsedMonth) {
      toast.error("Please enter a valid month (e.g. February).");
      return;
    }

    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const inputMonthIndex = VALID_MONTHS.indexOf(parsedMonth);

    const inputDate = new Date(form.year, inputMonthIndex, 1); // ✅ use form.year
    const currentDate = new Date(currentYear, currentMonthIndex, 1);

    if (inputDate >= currentDate) {
      const monthName =
        parsedMonth.charAt(0).toUpperCase() + parsedMonth.slice(1);
      toast.error(
        `You cannot report for ${monthName} ${form.year} yet. Please report for a previous month only.`,
      );
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await API.put(`/reports/${reportId}`, form); // ✅ form already has year
        toast.success("Report updated successfully!");
      } else {
        await API.post("/reports", form); // ✅ form already has year
        toast.success("Report created successfully!");
      }
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit report.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
      className="bg-white shadow-lg rounded-xl p-4 sm:p-8 mb-10 border border-gray-100"
    >
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {isEditing ? "Edit Monthly Report" : "Create Monthly Report"}
        </h2>
      </div>

      {/* BASIC INFO */}
      <h3 className="section-title">Basic Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <label htmlFor="month" className="text-sm font-medium text-gray-700">
            Month
          </label>
          <input
            id="month"
            name="month"
            placeholder="e.g. February"
            onChange={handleMonthChange} // ✅ dedicated handler
            value={form.month}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="worker" className="text-sm font-medium text-gray-700">
            Worker Name
          </label>
          <input
            id="worker"
            name="worker"
            placeholder="e.g. Juan dela Cruz"
            onChange={handleChange}
            value={form.worker}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="areaAssignment"
            className="text-sm font-medium text-gray-700"
          >
            Area Assignment
          </label>
          <input
            id="areaAssignment"
            name="areaAssignment"
            placeholder="e.g. Metro Manila"
            onChange={handleChange}
            value={form.areaAssignment}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="churchName"
            className="text-sm font-medium text-gray-700"
          >
            Church Name
          </label>
          <input
            id="churchName"
            name="churchName"
            placeholder="e.g. AMGC Church"
            onChange={handleChange}
            value={form.churchName}
            className="input"
          />
        </div>
      </div>

      {/* WEEKLY ATTENDANCE */}
      <h3 className="section-title">Weekly Attendance</h3>
      <Section
        title="Worship Service"
        weeks={5}
        category="worshipService"
        handler={handleWeekChange}
        values={form.worshipService}
      />
      <Section
        title="Sunday School"
        weeks={5}
        category="sundaySchool"
        handler={handleWeekChange}
        values={form.sundaySchool}
      />
      <Section
        title="Prayer Meeting"
        weeks={5}
        category="prayerMeeting"
        handler={handleWeekChange}
        values={form.prayerMeeting}
      />
      <Section
        title="Bible Studies"
        weeks={5}
        category="bibleStudies"
        handler={handleWeekChange}
        values={form.bibleStudies}
      />

      {/* FELLOWSHIP */}
      <h3 className="section-title">Fellowship</h3>
      <Section
        title="Men's Fellowship"
        weeks={5}
        category="mensFellowship"
        handler={handleWeekChange}
        values={form.mensFellowship}
      />
      <Section
        title="Women's Fellowship"
        weeks={5}
        category="womensFellowship"
        handler={handleWeekChange}
        values={form.womensFellowship}
      />
      <Section
        title="Youth Fellowship"
        weeks={5}
        category="youthFellowship"
        handler={handleWeekChange}
        values={form.youthFellowship}
      />
      <Section
        title="Children Fellowship"
        weeks={5}
        category="childrenFellowship"
        handler={handleWeekChange}
        values={form.childrenFellowship}
      />
      <Section
        title="Tithes & Offering (₱)"
        weeks={5}
        category="tithesOffering"
        handler={handleWeekChange}
        values={form.tithesOffering}
      />

      {/* WEEKLY MINISTRY */}
      <h3 className="section-title">Weekly Ministry</h3>
      <Section
        title="Homes Visited"
        weeks={5}
        category="homeVisited"
        handler={handleWeekChange}
        values={form.homeVisited}
      />
      <Section
        title="Bible Study Group Led"
        weeks={5}
        category="bibleStudyGroupLed"
        handler={handleWeekChange}
        values={form.bibleStudyGroupLed}
      />
      <Section
        title="Sermon Preached"
        weeks={5}
        category="sermonPreached"
        handler={handleWeekChange}
        values={form.sermonPreached}
      />
      <Section
        title="Person Newly Contacted"
        weeks={5}
        category="personNewlyContacted"
        handler={handleWeekChange}
        values={form.personNewlyContacted}
      />
      <Section
        title="Person Followed Up"
        weeks={5}
        category="personFollowedUp"
        handler={handleWeekChange}
        values={form.personFollowedUp}
      />
      <Section
        title="Person Evangelized"
        weeks={5}
        category="personEvangelized"
        handler={handleWeekChange}
        values={form.personEvangelized}
      />

      {/* MINISTRY ACTIVITIES */}
      <h3 className="section-title">Ministry Activities</h3>
      <Section
        title="Outreach"
        weeks={5}
        category="outreach"
        handler={handleWeekChange}
        values={form.outreach}
      />
      <Section
        title="Training"
        weeks={5}
        category="training"
        handler={handleWeekChange}
        values={form.training}
      />
      <Section
        title="Leadership"
        weeks={5}
        category="leadership"
        handler={handleWeekChange}
        values={form.leadership}
      />
      <Section
        title="Baptism"
        weeks={5}
        category="baptism"
        handler={handleWeekChange}
        values={form.baptism}
      />
      <Section
        title="Other"
        weeks={5}
        category="other"
        handler={handleWeekChange}
        values={form.other}
      />
      <Section
        title="Family Day"
        weeks={5}
        category="familyDay"
        handler={handleWeekChange}
        values={form.familyDay}
      />

      {/* REPORT DETAILS */}
      <h3 className="section-title">Report Details</h3>
      <div className="flex flex-col gap-1 mb-4">
        <label htmlFor="names" className="text-sm font-medium text-gray-700">
          Names of new believers / baptized
        </label>
        <textarea
          id="names"
          name="names"
          placeholder="e.g. Juan dela Cruz, Maria Santos"
          onChange={handleChange}
          value={form.names}
          className="textarea"
        />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label
          htmlFor="narrativeReport"
          className="text-sm font-medium text-gray-700"
        >
          Narrative Report
        </label>
        <textarea
          id="narrativeReport"
          name="narrativeReport"
          placeholder="Describe what happened this month in your ministry..."
          onChange={handleChange}
          value={form.narrativeReport}
          className="textarea"
        />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label
          htmlFor="challenges"
          className="text-sm font-medium text-gray-700"
        >
          Challenges
        </label>
        <textarea
          id="challenges"
          name="challenges"
          placeholder="What challenges or difficulties did you encounter this month?"
          onChange={handleChange}
          value={form.challenges}
          className="textarea"
        />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label
          htmlFor="prayerRequest"
          className="text-sm font-medium text-gray-700"
        >
          Prayer Requests
        </label>
        <textarea
          id="prayerRequest"
          name="prayerRequest"
          placeholder="List your prayer requests here..."
          onChange={handleChange}
          value={form.prayerRequest}
          className="textarea"
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        className="cursor-pointer submit-btn w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
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

// Section Component — 3 cols on mobile, 5 cols on desktop
function Section({ title, weeks, category, handler, values = {} }) {
  return (
    <>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-5">
        {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
          <input
            key={w}
            type="number"
            min="0"
            placeholder={`Wk ${w}`}
            className="input text-sm"
            value={values[`week${w}`] ?? ""}
            onChange={(e) => handler(category, `week${w}`, e.target.value)}
          />
        ))}
      </div>
    </>
  );
}
