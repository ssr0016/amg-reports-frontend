// /src/pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaUndo,
  FaUsers,
  FaFileAlt,
  FaUserShield,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaDownload, // ✅
} from "react-icons/fa";
import { exportSingleReport, exportBulkReports } from "../utils/exportExcel"; // ✅

const ITEMS_PER_PAGE = 26;

const MONTHS = [
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

function getPreviousMonthLabel() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return prev.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getPrevMonth() {
  return new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [reportPage, setReportPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [savingUser, setSavingUser] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("reports");

  // ✅ Bulk download state
  const [bulkMonth, setBulkMonth] = useState("");

  const currentYear = new Date().getFullYear();
  const prevMonthIndex = new Date().getMonth() - 1;
  const [trackerMonth, setTrackerMonth] = useState(
    MONTHS[prevMonthIndex] ?? MONTHS[11],
  );
  const [trackerYear, setTrackerYear] = useState(
    prevMonthIndex < 0 ? currentYear - 1 : currentYear,
  );

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const res = await API.get("/reports");
      setReports(res.data.data);
    } catch {
      toast.error("Failed to fetch reports.");
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await API.get("/auth/users");
      setUsers(res.data.data);
    } catch {
      toast.error("Failed to fetch users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchUsers();
  }, []);

  const toggleComplete = async (id) => {
    try {
      setTogglingId(id);
      await API.patch(`/reports/${id}/complete`);
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, completed: !r.completed } : r)),
      );
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  // ✅ Bulk download handler
  const handleBulkDownload = () => {
    const filtered = bulkMonth
      ? reports.filter((r) =>
          r.month?.toLowerCase().includes(bulkMonth.toLowerCase()),
        )
      : reports;

    if (filtered.length === 0) {
      toast.error("No reports found for selected month.");
      return;
    }

    exportBulkReports(filtered, bulkMonth || "All");
    toast.success(`Downloading ${filtered.length} reports...`);
  };

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "user",
    });
    setShowUserPassword(false);
    setShowUserForm(true);
  };

  const openEditUser = (u) => {
    setEditingUserId(u._id);
    setUserForm({
      name: u.name,
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
    });
    setShowUserPassword(false);
    setShowUserForm(true);
  };

  const closeUserForm = () => {
    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "user",
    });
    setShowUserPassword(false);
  };

  const saveUser = async () => {
    try {
      setSavingUser(true);
      if (editingUserId) {
        const body = { ...userForm };
        if (!body.password) delete body.password;
        await API.put(`/auth/users/${editingUserId}`, body);
        toast.success("User updated successfully!");
      } else {
        await API.post("/auth/users", userForm);
        toast.success("User created successfully!");
      }
      closeUserForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save user.");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async () => {
    if (!confirmDeleteUserId) return;
    try {
      setDeletingUser(true);
      await API.delete(`/auth/users/${confirmDeleteUserId}`);
      toast.success("User deleted successfully!");
      setConfirmDeleteUserId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeletingUser(false);
    }
  };

  const prevMonthLabel = getPreviousMonthLabel();
  const prevMonth = getPrevMonth();
  const totalReports = reports.length;
  const totalUsers = users.filter((u) => u.role === "user").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const prevMonthReports = reports.filter((r) =>
    r.month?.toLowerCase().includes(prevMonth),
  ).length;
  const prevMonthApproved = reports.filter(
    (r) => r.month?.toLowerCase().includes(prevMonth) && r.completed === true,
  ).length;
  const prevMonthPending = prevMonthReports - prevMonthApproved;

  const workers = users.filter((u) => u.role === "user");

  const trackerData = workers.map((w) => {
    const report = reports.find(
      (r) =>
        r.createdBy === w._id &&
        r.month?.toLowerCase().includes(trackerMonth.toLowerCase()) &&
        r.month?.toLowerCase().includes(String(trackerYear)),
    );
    const reportFallback = reports.find(
      (r) =>
        r.createdBy === w._id &&
        r.month?.toLowerCase().includes(trackerMonth.toLowerCase()),
    );
    const matched = report || reportFallback;
    return {
      worker: w,
      report: matched || null,
      submitted: !!matched,
      approved: matched?.completed === true,
    };
  });

  const submittedCount = trackerData.filter((d) => d.submitted).length;
  const notSubmittedCount = trackerData.filter((d) => !d.submitted).length;
  const approvedCount = trackerData.filter((d) => d.approved).length;

  const totalReportPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const paginatedReports = reports.slice(
    (reportPage - 1) * ITEMS_PER_PAGE,
    reportPage * ITEMS_PER_PAGE,
  );
  const totalUserPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (userPage - 1) * ITEMS_PER_PAGE,
    userPage * ITEMS_PER_PAGE,
  );
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage reports and users</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total Reports */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaFileAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Total Reports</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {totalReports}
            </p>
          </div>
        </div>

        {/* Previous Month Reports */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaCalendarAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">
              {prevMonthLabel} Reports
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {prevMonthReports}
            </p>
            <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-2 mt-0.5">
              <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                ✓ {prevMonthApproved} approved
              </span>
              <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                ● {prevMonthPending} pending
              </span>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaUsers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Total Users</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {totalUsers}
            </p>
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-white rounded-xl shadow p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaUserShield className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">Total Admins</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {totalAdmins}
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["reports", "tracker", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition capitalize ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "tracker"
              ? "📋 Submission Tracker"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ==================== REPORTS TAB ==================== */}
      {activeTab === "reports" && (
        <>
          {/* ✅ BULK DOWNLOAD HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
            <p className="text-sm text-gray-500">
              {reports.length} total reports
            </p>
            <div className="flex gap-2 items-center">
              <select
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                className="input cursor-pointer text-sm py-1.5 w-44"
              >
                <option value="">All months</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkDownload}
                className="cursor-pointer flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
              >
                <FaDownload /> Download Excel
              </button>
            </div>
          </div>

          {loadingReports ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-10 w-10 text-blue-600" />
            </div>
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="flex flex-col gap-3 sm:hidden">
                {paginatedReports.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white shadow rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.worker}
                        </p>
                        <p className="text-sm text-gray-500">{r.month}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${r.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {r.completed ? "Approved" : "For Review"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {r.areaAssignment}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      ⛪ {r.churchName}
                    </p>
                    {/* ✅ MOBILE ACTIONS */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => toggleComplete(r._id)}
                        disabled={togglingId === r._id}
                        className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${r.completed ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                      >
                        {togglingId === r._id ? (
                          <Spinner className="h-3 w-3" />
                        ) : r.completed ? (
                          <FaUndo className="h-3 w-3" />
                        ) : (
                          <FaCheck className="h-3 w-3" />
                        )}
                        {r.completed ? "Unapprove" : "Approve"}
                      </button>
                      {/* ✅ Individual download */}
                      <button
                        onClick={() => exportSingleReport(r)}
                        className="cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        <FaDownload className="h-3 w-3" /> Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden sm:block bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">WORKER</th>
                      <th className="p-3">MONTH</th>
                      <th className="p-3">AREA</th>
                      <th className="p-3">CHURCH</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">ACTION</th>
                      <th className="p-3">DOWNLOAD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((r) => (
                      <tr key={r._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{r.worker}</td>
                        <td className="p-3">{r.month}</td>
                        <td className="p-3">{r.areaAssignment}</td>
                        <td className="p-3">{r.churchName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${r.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {r.completed ? "Approved" : "For Review"}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleComplete(r._id)}
                            disabled={togglingId === r._id}
                            className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${r.completed ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                          >
                            {togglingId === r._id ? (
                              <Spinner className="h-3 w-3" />
                            ) : r.completed ? (
                              <>
                                <FaUndo className="h-3 w-3" /> Unapprove
                              </>
                            ) : (
                              <>
                                <FaCheck className="h-3 w-3" /> Approve
                              </>
                            )}
                          </button>
                        </td>
                        {/* ✅ Individual download */}
                        <td className="p-3">
                          <button
                            onClick={() => exportSingleReport(r)}
                            title="Download as Excel"
                            className="cursor-pointer flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                          >
                            <FaDownload /> Excel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={reportPage}
                totalPages={totalReportPages}
                setPage={setReportPage}
              />
            </>
          )}
        </>
      )}

      {/* ==================== SUBMISSION TRACKER TAB ==================== */}
      {activeTab === "tracker" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={trackerMonth}
              onChange={(e) => setTrackerMonth(e.target.value)}
              className="input cursor-pointer sm:w-48"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={trackerYear}
              onChange={(e) => setTrackerYear(Number(e.target.value))}
              className="input cursor-pointer sm:w-32"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {submittedCount}
              </p>
              <p className="text-xs text-green-600 font-medium">Submitted</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {notSubmittedCount}
              </p>
              <p className="text-xs text-red-500 font-medium">Not Submitted</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {approvedCount}
              </p>
              <p className="text-xs text-blue-500 font-medium">Approved</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                {trackerMonth} {trackerYear} Submission Progress
              </p>
              <p className="text-sm font-bold text-gray-800">
                {submittedCount} / {workers.length}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width:
                    workers.length > 0
                      ? `${(submittedCount / workers.length) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {workers.length > 0
                ? `${Math.round((submittedCount / workers.length) * 100)}% submitted`
                : "No workers found"}
            </p>
          </div>

          {/* MOBILE */}
          <div className="flex flex-col gap-3 sm:hidden">
            {trackerData.map(
              ({ worker: w, report: r, submitted, approved }) => (
                <div
                  key={w._id}
                  className={`rounded-xl p-4 border ${submitted ? "bg-white border-gray-100" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{w.name}</p>
                      <p className="text-xs text-gray-500">@{w.username}</p>
                      {r && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ⛪ {r.churchName}
                        </p>
                      )}
                      {r && (
                        <p className="text-xs text-gray-500">
                          📍 {r.areaAssignment}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${submitted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {submitted ? "✓ Submitted" : "✗ Not Submitted"}
                      </span>
                      {submitted && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {approved ? "Approved" : "For Review"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden sm:block bg-white shadow rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">WORKER</th>
                  <th className="p-3">CHURCH</th>
                  <th className="p-3">AREA</th>
                  <th className="p-3">SUBMITTED</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.map(
                  ({ worker: w, report: r, submitted, approved }) => (
                    <tr
                      key={w._id}
                      className={`border-b ${!submitted ? "bg-red-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{w.name}</p>
                        <p className="text-xs text-gray-500">@{w.username}</p>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {r?.churchName || "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {r?.areaAssignment || "—"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${submitted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {submitted ? "✓ Submitted" : "✗ Not Yet"}
                        </span>
                      </td>
                      <td className="p-3">
                        {submitted ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {approved ? "Approved" : "For Review"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ==================== USERS TAB ==================== */}
      {activeTab === "users" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">{users.length} total users</p>
            <button
              onClick={openCreateUser}
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              + Create User
            </button>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-10 w-10 text-blue-600" />
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="flex flex-col gap-3 sm:hidden">
                {paginatedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white shadow rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">@{u.username}</p>
                    <p className="text-sm text-gray-500 mb-3">{u.email}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditUser(u)}
                        className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit /> Edit
                      </button>
                      {u._id !== user?.id && (
                        <button
                          onClick={() => setConfirmDeleteUserId(u._id)}
                          className="cursor-pointer flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden sm:block bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">NAME</th>
                      <th className="p-3">USERNAME</th>
                      <th className="p-3">EMAIL</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">@{u.username}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 flex gap-3 items-center">
                          <button
                            onClick={() => openEditUser(u)}
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          {u._id !== user?.id && (
                            <button
                              onClick={() => setConfirmDeleteUserId(u._id)}
                              className="cursor-pointer text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={userPage}
                totalPages={totalUserPages}
                setPage={setUserPage}
              />
            </>
          )}
        </>
      )}

      {/* USER FORM MODAL */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingUserId ? "Edit User" : "Create User"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                name="name"
                placeholder="Full Name"
                value={userForm.name}
                onChange={handleUserFormChange}
                className="input"
              />
              <input
                name="username"
                placeholder="Username"
                value={userForm.username}
                onChange={handleUserFormChange}
                className="input"
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                className="input"
              />
              <div className="relative">
                <input
                  name="password"
                  placeholder={
                    editingUserId
                      ? "New Password (leave blank to keep)"
                      : "Password"
                  }
                  type={showUserPassword ? "text" : "password"}
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword((prev) => !prev)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showUserPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <select
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
                className="input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={closeUserForm}
                disabled={savingUser}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                disabled={savingUser}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingUser ? (
                  <>
                    <Spinner className="h-4 w-4 text-white" /> Saving...
                  </>
                ) : editingUserId ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {confirmDeleteUserId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Delete User?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteUserId(null)}
                disabled={deletingUser}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                disabled={deletingUser}
                className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingUser ? (
                  <>
                    <Spinner className="h-4 w-4 text-white" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, setPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-end items-center gap-1 sm:gap-2 mt-6 flex-wrap">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`cursor-pointer px-2 sm:px-3 py-1 rounded-lg text-sm border ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
