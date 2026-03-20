// /src/pages/AdminPanel.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  FaUsers,
  FaFileAlt,
  FaUserShield,
  FaCalendarAlt,
} from "react-icons/fa";
import { exportBulkReports } from "../utils/exportExcel";
import { MONTHS } from "../constants";
import AdminReportsTab from "../components/AdminReportsTab";
import AdminTrackerTab from "../components/AdminTrackerTab";
import AdminUsersTab from "../components/AdminUsersTab";
import AdminLogsTab from "../components/AdminLogsTab";
import UserFormModal from "../components/UserFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

// ─── Constants ────────────────────────────────────────────────────────────────
const REPORTS_PER_PAGE = 10;
const USERS_PER_PAGE = 10;

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

  // ── Reports state ────────────────────────────────────────────────────────────
  const [reports, setReports] = useState([]);
  const [totalReportCount, setTotalReportCount] = useState(0);
  const [totalReportPages, setTotalReportPages] = useState(1);
  const [loadingReports, setLoadingReports] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [reportPage, setReportPage] = useState(() => {
    const p = parseInt(
      new URLSearchParams(window.location.search).get("rpage"),
    );
    return p > 0 ? p : 1;
  });

  // ── Tracker page state ───────────────────────────────────────────────────────
  const [trackerPage, setTrackerPage] = useState(() => {
    const p = parseInt(
      new URLSearchParams(window.location.search).get("tpage"),
    );
    return p > 0 ? p : 1;
  });

  // ── Logs page state ──────────────────────────────────────────────────────────
  const [logsPage, setLogsPage] = useState(() => {
    const p = parseInt(
      new URLSearchParams(window.location.search).get("lpage"),
    );
    return p > 0 ? p : 1;
  });

  // ── Users state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userPage, setUserPage] = useState(() => {
    const p = parseInt(
      new URLSearchParams(window.location.search).get("upage"),
    );
    return p > 0 ? p : 1;
  });
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // ── User form state ──────────────────────────────────────────────────────────
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
    areaAssignment: "",
    churchName: "", // ✅ new fields
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [savingUser, setSavingUser] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return ["reports", "tracker", "users", "logs"].includes(tab)
      ? tab
      : "reports";
  });

  // ✅ Helper — i-update ang URL params
  const updateURL = (updates) => {
    const url = new URL(window.location);
    Object.entries(updates).forEach(([k, v]) => url.searchParams.set(k, v));
    window.history.pushState({}, "", url);
  };

  const handleTrackerPageChange = (page) => {
    setTrackerPage(page);
    updateURL({ tpage: page });
  };

  const handleLogsPageChange = (page) => {
    setLogsPage(page);
    updateURL({ lpage: page });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    updateURL({ tab: key });
    // ✅ Hindi na nire-reset ang page — pinapanatili ang existing page sa URL
    if (key === "tracker") {
      setLoadingTracker(true);
      fetchAllReportsForTracker();
    }
    if (key === "users") {
      setLoadingUsers(true);
      fetchUsers();
    }
    if (key === "reports") {
      setLoadingReports(true);
      fetchReports();
    }
  };

  // ✅ Page change handlers na nag-u-update ng URL
  const handleReportPageChange = (page) => {
    setLoadingReports(true);
    setReportPage(page);
    updateURL({ rpage: page });
  };

  const handleUserPageChange = (page) => {
    setLoadingUsers(true);
    setUserPage(page);
    updateURL({ upage: page });
  };

  const currentYear = new Date().getFullYear();
  const prevMonthIndex = new Date().getMonth() - 1;

  const [bulkMonth, setBulkMonth] = useState(
    MONTHS[prevMonthIndex >= 0 ? prevMonthIndex : 11],
  );
  const [bulkYear, setBulkYear] = useState(
    prevMonthIndex < 0 ? currentYear - 1 : currentYear,
  );
  const [trackerMonth, setTrackerMonth] = useState(
    MONTHS[prevMonthIndex >= 0 ? prevMonthIndex : 11],
  );
  const [trackerYear, setTrackerYear] = useState(
    prevMonthIndex < 0 ? currentYear - 1 : currentYear,
  );

  // ── Fetch #1: Paginated display (10 per page) ─────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await API.get("/reports", {
        params: {
          month: bulkMonth,
          year: bulkYear,
          page: reportPage,
          limit: REPORTS_PER_PAGE, // ✅ 10 lang — hindi 9999
        },
      });
      setReports(res.data.data);
      setTotalReportCount(res.data.total); // ✅ total count from backend
      setTotalReportPages(res.data.pages); // ✅ total pages from backend
    } catch {
      toast.error("Failed to fetch reports.");
    } finally {
      setLoadingReports(false);
    }
  }, [bulkMonth, bulkYear, reportPage]);

  // ── Fetch #2: All reports — called on demand for bulk download only ────────
  const handleBulkDownload = async () => {
    try {
      const res = await API.get("/reports", {
        params: {
          month: bulkMonth,
          year: bulkYear,
          limit: 9999, // ✅ 9999 dito lang — para sa Excel, hindi sa display
        },
      });

      const allReports = res.data.data;
      const approvedReports = allReports.filter((r) => r.completed === true);

      if (approvedReports.length === 0) {
        toast.error(`No approved reports found for ${bulkMonth} ${bulkYear}.`);
        return;
      }

      await exportBulkReports(approvedReports, `${bulkMonth} ${bulkYear}`);
      toast.success(
        `Downloading ${approvedReports.length} approved reports...`,
      );
    } catch {
      toast.error("Failed to export reports.");
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      // ✅ Paginated + filtered by status
      const params = { page: userPage, limit: 10 };
      if (userStatusFilter !== "all") params.status = userStatusFilter;
      const res = await API.get("/auth/users", { params });
      setUsers(res.data.data);
      setTotalUserCount(res.data.total);
      setTotalUserPages(res.data.pages);

      // All users — para sa Tracker (walang filter)
      const allRes = await API.get("/auth/users", {
        params: { page: 1, limit: 9999 },
      });
      setAllUsers(allRes.data.data);
    } catch {
      toast.error("Failed to fetch users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userStatusFilter]); // ✅ re-fetch kapag nagbago ang filter

  // ── Fetch #3: All reports for tracker (separate — hindi affected ng pagination) ──
  const [allReports, setAllReports] = useState([]);
  const [loadingTracker, setLoadingTracker] = useState(true); // ✅ sariling loading state

  const fetchAllReportsForTracker = useCallback(async () => {
    try {
      setLoadingTracker(true);
      const res = await API.get("/reports", {
        params: {
          month: trackerMonth,
          year: trackerYear,
          limit: 9999,
        },
      });
      setAllReports(res.data.data);
    } catch {
      // silent fail
    } finally {
      setLoadingTracker(false);
    }
  }, [trackerMonth, trackerYear]);

  useEffect(() => {
    fetchAllReportsForTracker();
  }, [fetchAllReportsForTracker]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  // ✅ No more useEffect resets — page resets are handled directly in handlers

  const toggleComplete = async (id) => {
    try {
      setTogglingId(id);
      const res = await API.patch(`/reports/${id}/complete`);
      const updated = res.data.data;
      // ✅ Update lang yung current page — hindi na kailangan ng full refetch
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
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
      status: "active",
      areaAssignment: "",
      churchName: "",
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
      status: u.status || "active", // ✅
      areaAssignment: u.areaAssignment || "", // ✅
      churchName: u.churchName || "", // ✅
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
      status: "active",
      areaAssignment: "",
      churchName: "",
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
      fetchReports();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeletingUser(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const prevMonthLabel = getPreviousMonthLabel();
  const prevMonth = getPrevMonth();
  // ✅ allUsers — accurate count kahit paginated ang users tab
  const totalUsers = allUsers.filter((u) => u.role === "user").length;
  const totalAdmins = allUsers.filter((u) => u.role === "admin").length;
  const prevMonthReports = reports.filter((r) =>
    r.month?.toLowerCase().includes(prevMonth),
  ).length;
  const prevMonthApproved = reports.filter(
    (r) => r.month?.toLowerCase().includes(prevMonth) && r.completed === true,
  ).length;
  const prevMonthPending = prevMonthReports - prevMonthApproved;

  const workers = allUsers.filter((u) => u.role === "user"); // ✅ allUsers — lahat, hindi paginated
  const trackerData = workers.map((w) => {
    // ✅ allReports — hindi paginated, lahat ng reports para sa selected month/year
    const report = allReports.find(
      (r) =>
        r.createdBy === w._id &&
        r.month?.toLowerCase() === trackerMonth.toLowerCase() &&
        String(r.year) === String(trackerYear),
    );
    return {
      worker: w,
      report: report || null,
      submitted: !!report,
      approved: report?.completed === true,
    };
  });

  const submittedCount = trackerData.filter((d) => d.submitted).length;
  const notSubmittedCount = trackerData.filter((d) => !d.submitted).length;
  const approvedCount = trackerData.filter((d) => d.approved).length;

  // ✅ Users — backend pagination na, hindi na kailangan ng slice
  const paginatedUsers = users; // already paginated from backend

  const years = [currentYear, currentYear - 1, currentYear - 2];

  const TABS = [
    { key: "reports", label: "Reports" },
    { key: "tracker", label: "📋 Tracker" },
    { key: "users", label: "Users" },
    { key: "logs", label: "🕵️ Logs" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer shrink-0 flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">
            Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage reports and users
          </p>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaFileAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight">
              {bulkMonth} {bulkYear} Reports
            </p>
            {/* ✅ totalReportCount — accurate kahit paginated */}
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {totalReportCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaCalendarAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight">
              {prevMonthLabel}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {prevMonthReports}
            </p>
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-2 mt-0.5">
              <span className="text-[10px] sm:text-xs text-green-600 font-medium whitespace-nowrap">
                ✓ {prevMonthApproved} approved
              </span>
              <span className="text-[10px] sm:text-xs text-red-500 font-medium whitespace-nowrap">
                ● {prevMonthPending} pending
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaUsers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight">
              Total Users
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {totalUsers}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaUserShield className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight">
              Total Admins
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {totalAdmins}
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-0 mb-5 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`cursor-pointer shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "reports" && (
        <AdminReportsTab
          reports={reports}
          paginatedReports={reports}
          totalReportPages={totalReportPages}
          totalReportCount={totalReportCount}
          reportPage={reportPage}
          setReportPage={handleReportPageChange}
          loading={loadingReports}
          togglingId={togglingId}
          onToggleComplete={toggleComplete}
          bulkMonth={bulkMonth}
          setBulkMonth={(val) => {
            setBulkMonth(val);
            setReportPage(1);
            updateURL({ rpage: 1 });
          }}
          bulkYear={bulkYear}
          setBulkYear={(val) => {
            setBulkYear(val);
            setReportPage(1);
            updateURL({ rpage: 1 });
          }}
          onBulkDownload={handleBulkDownload}
        />
      )}

      {activeTab === "tracker" && (
        <AdminTrackerTab
          trackerData={trackerData}
          trackerMonth={trackerMonth}
          setTrackerMonth={setTrackerMonth}
          trackerYear={trackerYear}
          setTrackerYear={setTrackerYear}
          submittedCount={submittedCount}
          notSubmittedCount={notSubmittedCount}
          approvedCount={approvedCount}
          workers={workers}
          years={years}
          loading={loadingTracker}
          trackerPage={trackerPage}
          onTrackerPageChange={handleTrackerPageChange}
        />
      )}

      {activeTab === "users" && (
        <AdminUsersTab
          users={users}
          paginatedUsers={paginatedUsers}
          totalUserPages={totalUserPages}
          totalUserCount={totalUserCount}
          userPage={userPage}
          setUserPage={handleUserPageChange}
          loading={loadingUsers}
          onCreateUser={openCreateUser}
          onEditUser={openEditUser}
          onDeleteUser={setConfirmDeleteUserId}
          currentUserId={user?.id}
          statusFilter={userStatusFilter}
          setStatusFilter={(val) => {
            setUserStatusFilter(val);
            setUserPage(1);
            updateURL({ upage: 1 });
          }}
        />
      )}

      {activeTab === "logs" && (
        <AdminLogsTab
          logsPage={logsPage}
          onLogsPageChange={handleLogsPageChange}
        />
      )}

      <UserFormModal
        show={showUserForm}
        editingUserId={editingUserId}
        form={userForm}
        onChange={handleUserFormChange}
        onClose={closeUserForm}
        onSave={saveUser}
        saving={savingUser}
        showPassword={showUserPassword}
        onTogglePassword={() => setShowUserPassword((prev) => !prev)}
      />

      <DeleteConfirmModal
        show={!!confirmDeleteUserId}
        title="Delete User?"
        loading={deletingUser}
        onConfirm={deleteUser}
        onCancel={() => setConfirmDeleteUserId(null)}
      />
    </div>
  );
}
