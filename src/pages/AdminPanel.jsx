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
import { ITEMS_PER_PAGE, MONTHS } from "../constants";
import AdminReportsTab from "../components/AdminReportsTab";
import AdminTrackerTab from "../components/AdminTrackerTab";
import AdminUsersTab from "../components/AdminUsersTab";
import AdminLogsTab from "../components/AdminLogsTab";
import UserFormModal from "../components/UserFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

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

  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await API.get("/reports", {
        params: { month: bulkMonth, year: bulkYear, limit: 9999 },
      });
      setReports(res.data.data);
    } catch {
      toast.error("Failed to fetch reports.");
    } finally {
      setLoadingReports(false);
    }
  }, [bulkMonth, bulkYear]);

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
    fetchUsers();
  }, []);
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  useEffect(() => {
    setReportPage(1);
  }, [bulkMonth, bulkYear]);

  const toggleComplete = async (id) => {
    try {
      setTogglingId(id);
      const res = await API.patch(`/reports/${id}/complete`);
      const updated = res.data.data;
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkDownload = async () => {
    const approvedReports = reports.filter((r) => r.completed === true);
    if (approvedReports.length === 0) {
      toast.error(`No approved reports found for ${bulkMonth} ${bulkYear}.`);
      return;
    }
    try {
      await exportBulkReports(approvedReports, `${bulkMonth} ${bulkYear}`);
      toast.success(
        `Downloading ${approvedReports.length} approved reports...`,
      );
    } catch {
      toast.error("Failed to export reports.");
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
      fetchReports();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeletingUser(false);
    }
  };

  // Derived values
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
      {/* 2-col on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg shrink-0">
            <FaFileAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 truncate leading-tight">
              {bulkMonth} {bulkYear} Reports
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {totalReports}
            </p>
          </div>
        </div>

        {/* Card 2 */}
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
            {/* stacked on mobile, inline on sm+ */}
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

        {/* Card 3 */}
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

        {/* Card 4 */}
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
      {/* scrollable on very small screens */}
      <div className="flex gap-0 mb-5 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-none">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
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
          paginatedReports={paginatedReports}
          totalReportPages={totalReportPages}
          reportPage={reportPage}
          setReportPage={setReportPage}
          loading={loadingReports}
          togglingId={togglingId}
          onToggleComplete={toggleComplete}
          bulkMonth={bulkMonth}
          setBulkMonth={setBulkMonth}
          bulkYear={bulkYear}
          setBulkYear={setBulkYear}
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
        />
      )}

      {activeTab === "users" && (
        <AdminUsersTab
          users={users}
          paginatedUsers={paginatedUsers}
          totalUserPages={totalUserPages}
          userPage={userPage}
          setUserPage={setUserPage}
          loading={loadingUsers}
          onCreateUser={openCreateUser}
          onEditUser={openEditUser}
          onDeleteUser={setConfirmDeleteUserId}
          currentUserId={user?.id}
        />
      )}

      {activeTab === "logs" && <AdminLogsTab />}

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
