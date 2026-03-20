// /src/components/ReportForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import Spinner from "./Spinner";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
const MONTHS_DISPLAY = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentYear = new Date().getFullYear();

function parseMonthFromInput(input) {
  const lower = input.trim().toLowerCase();
  return VALID_MONTHS.find((m) => lower.includes(m));
}

// ── Collapsible Section ───────────────────────────────────────────────────────
function FormSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        {open ? (
          <FaChevronUp className="h-3 w-3 text-gray-400" />
        ) : (
          <FaChevronDown className="h-3 w-3 text-gray-400" />
        )}
      </button>
      {open && <div className="px-4 pt-3 pb-4 bg-white">{children}</div>}
    </div>
  );
}

// ── Week Row ──────────────────────────────────────────────────────────────────
function WeekRow({ title, category, handler, values = {} }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 last:mb-0">
      <p className="text-xs font-medium text-gray-500 w-full sm:w-44 shrink-0">
        {title}
      </p>
      <div className="grid grid-cols-5 gap-1.5 flex-1">
        {[1, 2, 3, 4, 5].map((w) => (
          <input
            key={w}
            type="number"
            min="0"
            placeholder={`Wk ${w}`}
            className="w-full text-center text-sm border border-gray-200 rounded-lg px-2 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white placeholder:text-gray-300"
            value={values[`week${w}`] ?? ""}
            onChange={(e) => handler(category, `week${w}`, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white placeholder:text-gray-400";
const selectClass =
  "cursor-pointer appearance-none w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white";
const textareaClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white placeholder:text-gray-400 resize-none";

const defaultForm = {
  month: "",
  year: currentYear - 1,
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
};

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function ReportForm({ reportId }) {
  const navigate = useNavigate();
  const isEditing = !!reportId;

  // Unique localStorage key per mode — create vs edit
  const storageKey = isEditing
    ? `reportForm_edit_${reportId}`
    : "reportForm_new";

  // Lazy init: load from localStorage if available, otherwise use defaults
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...defaultForm };
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  // Guard flag: huwag mag-auto-save habang nag-fe-fetch pa (edit mode)
  // Para hindi ma-overwrite ng empty form ang saved draft bago dumating ang API data
  const [readyToSave, setReadyToSave] = useState(!isEditing);

  // Auto-save to localStorage — only after fetch is done (or create mode agad)
  useEffect(() => {
    if (!readyToSave) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(form));
    } catch {}
  }, [form, storageKey, readyToSave]);

  // Edit mode: fetch report from API
  useEffect(() => {
    if (isEditing) {
      const fetchReport = async () => {
        try {
          setFetching(true);
          const res = await API.get(`/reports/${reportId}`);

          // Kung may saved draft na sa localStorage, gamitin yun (retain ang edits)
          // Kung wala pa, gamitin ang data mula sa API
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              setForm(JSON.parse(saved));
            } catch {
              setForm(res.data.data);
            }
          } else {
            setForm(res.data.data);
          }
        } catch {
          toast.error("Failed to load report.");
        } finally {
          setFetching(false);
          // Safe na mag-save ngayon — may data na ang form
          setReadyToSave(true);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "month") {
      const now = new Date();
      const monthIndex = VALID_MONTHS.indexOf(value.toLowerCase());
      const autoYear =
        monthIndex < now.getMonth() ? now.getFullYear() : now.getFullYear();
      setForm({ ...form, month: value, year: autoYear });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleWeekChange = (category, week, value) => {
    setForm({ ...form, [category]: { ...form[category], [week]: value } });
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.month.trim()) return toast.error("Month is required.");
    if (!form.worker.trim()) return toast.error("Worker name is required.");
    if (!form.areaAssignment.trim())
      return toast.error("Area assignment is required.");
    if (!form.churchName.trim()) return toast.error("Church name is required.");

    const parsedMonth = parseMonthFromInput(form.month);
    if (!parsedMonth)
      return toast.error("Please enter a valid month (e.g. February).");

    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const inputMonthIndex = VALID_MONTHS.indexOf(parsedMonth);
    const inputYear = parseInt(form.year);

    const inputDate = new Date(inputYear, inputMonthIndex, 1);
    const currentDate = new Date(currentYear, currentMonthIndex, 1);

    if (inputDate >= currentDate) {
      const monthName =
        parsedMonth.charAt(0).toUpperCase() + parsedMonth.slice(1);
      toast.error(
        `You cannot report for ${monthName} ${inputYear} yet. Please report for a previous month only.`,
      );
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await API.put(`/reports/${reportId}`, form);
        toast.success("Report updated successfully!");
      } else {
        await API.post("/reports", form);
        toast.success("Report created successfully!");
      }
      // Clear draft after successful submit
      clearDraft();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report.");
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
    <form onSubmit={submit} className="mb-10">
      {/* ── BASIC INFO ── */}
      <FormSection title="Basic Information" icon="📋" defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Month" required>
            <div className="relative">
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select Month</option>
                {MONTHS_DISPLAY.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </Field>

          <Field label="Worker Name" required>
            <input
              name="worker"
              placeholder="e.g. Juan dela Cruz"
              onChange={handleChange}
              value={form.worker}
              className={inputClass}
            />
          </Field>

          <Field label="Area Assignment" required>
            <input
              name="areaAssignment"
              placeholder="e.g. Metro Manila"
              onChange={handleChange}
              value={form.areaAssignment}
              className={inputClass}
            />
          </Field>

          <Field label="Church Name" required>
            <input
              name="churchName"
              placeholder="e.g. AMGC Church"
              onChange={handleChange}
              value={form.churchName}
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── WEEKLY ATTENDANCE ── */}
      <FormSection title="Weekly Attendance" icon="🙏" defaultOpen={true}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <div className="hidden sm:block w-44 shrink-0" />
          <div className="grid grid-cols-5 gap-1.5 flex-1">
            {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((w) => (
              <p
                key={w}
                className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >
                {w}
              </p>
            ))}
          </div>
        </div>
        <WeekRow
          title="Worship Service"
          category="worshipService"
          handler={handleWeekChange}
          values={form.worshipService}
        />
        <WeekRow
          title="Sunday School"
          category="sundaySchool"
          handler={handleWeekChange}
          values={form.sundaySchool}
        />
        <WeekRow
          title="Prayer Meeting"
          category="prayerMeeting"
          handler={handleWeekChange}
          values={form.prayerMeeting}
        />
        <WeekRow
          title="Bible Studies"
          category="bibleStudies"
          handler={handleWeekChange}
          values={form.bibleStudies}
        />
      </FormSection>

      {/* ── FELLOWSHIP ── */}
      <FormSection title="Fellowship" icon="👥" defaultOpen={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <div className="hidden sm:block w-44 shrink-0" />
          <div className="grid grid-cols-5 gap-1.5 flex-1">
            {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((w) => (
              <p
                key={w}
                className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >
                {w}
              </p>
            ))}
          </div>
        </div>
        <WeekRow
          title="Men's Fellowship"
          category="mensFellowship"
          handler={handleWeekChange}
          values={form.mensFellowship}
        />
        <WeekRow
          title="Women's Fellowship"
          category="womensFellowship"
          handler={handleWeekChange}
          values={form.womensFellowship}
        />
        <WeekRow
          title="Youth Fellowship"
          category="youthFellowship"
          handler={handleWeekChange}
          values={form.youthFellowship}
        />
        <WeekRow
          title="Children Fellowship"
          category="childrenFellowship"
          handler={handleWeekChange}
          values={form.childrenFellowship}
        />
        <WeekRow
          title="Tithes & Offering (₱)"
          category="tithesOffering"
          handler={handleWeekChange}
          values={form.tithesOffering}
        />
      </FormSection>

      {/* ── WEEKLY MINISTRY ── */}
      <FormSection title="Weekly Ministry" icon="📖" defaultOpen={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <div className="hidden sm:block w-44 shrink-0" />
          <div className="grid grid-cols-5 gap-1.5 flex-1">
            {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((w) => (
              <p
                key={w}
                className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >
                {w}
              </p>
            ))}
          </div>
        </div>
        <WeekRow
          title="Homes Visited"
          category="homeVisited"
          handler={handleWeekChange}
          values={form.homeVisited}
        />
        <WeekRow
          title="Bible Study Group Led"
          category="bibleStudyGroupLed"
          handler={handleWeekChange}
          values={form.bibleStudyGroupLed}
        />
        <WeekRow
          title="Sermon Preached"
          category="sermonPreached"
          handler={handleWeekChange}
          values={form.sermonPreached}
        />
        <WeekRow
          title="Newly Contacted"
          category="personNewlyContacted"
          handler={handleWeekChange}
          values={form.personNewlyContacted}
        />
        <WeekRow
          title="Person Followed Up"
          category="personFollowedUp"
          handler={handleWeekChange}
          values={form.personFollowedUp}
        />
        <WeekRow
          title="Person Evangelized"
          category="personEvangelized"
          handler={handleWeekChange}
          values={form.personEvangelized}
        />
      </FormSection>

      {/* ── MINISTRY ACTIVITIES ── */}
      <FormSection title="Ministry Activities" icon="⛪" defaultOpen={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <div className="hidden sm:block w-44 shrink-0" />
          <div className="grid grid-cols-5 gap-1.5 flex-1">
            {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((w) => (
              <p
                key={w}
                className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >
                {w}
              </p>
            ))}
          </div>
        </div>
        <WeekRow
          title="Outreach"
          category="outreach"
          handler={handleWeekChange}
          values={form.outreach}
        />
        <WeekRow
          title="Training"
          category="training"
          handler={handleWeekChange}
          values={form.training}
        />
        <WeekRow
          title="Leadership"
          category="leadership"
          handler={handleWeekChange}
          values={form.leadership}
        />
        <WeekRow
          title="Baptism"
          category="baptism"
          handler={handleWeekChange}
          values={form.baptism}
        />
        <WeekRow
          title="Other"
          category="other"
          handler={handleWeekChange}
          values={form.other}
        />
        <WeekRow
          title="Family Day"
          category="familyDay"
          handler={handleWeekChange}
          values={form.familyDay}
        />
      </FormSection>

      {/* ── REPORT DETAILS ── */}
      <FormSection title="Report Details" icon="📝" defaultOpen={true}>
        <div className="flex flex-col gap-4">
          <Field label="Names of new believers / baptized">
            <textarea
              name="names"
              placeholder="e.g. Juan dela Cruz, Maria Santos"
              onChange={handleChange}
              value={form.names}
              rows={2}
              className={textareaClass}
            />
          </Field>
          <Field label="Narrative Report">
            <textarea
              name="narrativeReport"
              placeholder="Describe what happened this month in your ministry..."
              onChange={handleChange}
              value={form.narrativeReport}
              rows={4}
              className={textareaClass}
            />
          </Field>
          <Field label="Challenges">
            <textarea
              name="challenges"
              placeholder="What challenges or difficulties did you encounter this month?"
              onChange={handleChange}
              value={form.challenges}
              rows={3}
              className={textareaClass}
            />
          </Field>
          <Field label="Prayer Requests">
            <textarea
              name="prayerRequest"
              placeholder="List your prayer requests here..."
              onChange={handleChange}
              value={form.prayerRequest}
              rows={3}
              className={textareaClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── SUBMIT ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            clearDraft();
            navigate("/");
          }}
          className="cursor-pointer flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
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
      </div>
    </form>
  );
}
