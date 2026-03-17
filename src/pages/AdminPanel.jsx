// /src/pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaCheck, FaUndo } from "react-icons/fa";

const ITEMS_PER_PAGE = 26;

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

  const [activeTab, setActiveTab] = useState("reports");

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

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("reports")}
          className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Users
        </button>
      </div>

      {/* ==================== REPORTS TAB ==================== */}
      {activeTab === "reports" && (
        <>
          <p className="text-sm text-gray-500 mb-3">
            {reports.length} total reports
          </p>

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
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          r.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
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
                    <div className="flex justify-end">
                      {/* ✅ cursor-pointer */}
                      <button
                        onClick={() => toggleComplete(r._id)}
                        disabled={togglingId === r._id}
                        className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${
                          r.completed
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
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
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              r.completed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.completed ? "Approved" : "For Review"}
                          </span>
                        </td>
                        <td className="p-3">
                          {/* ✅ cursor-pointer */}
                          <button
                            onClick={() => toggleComplete(r._id)}
                            disabled={togglingId === r._id}
                            title={
                              r.completed ? "Mark as For Review" : "Approve"
                            }
                            className={`cursor-pointer flex items-center gap-1 text-sm px-3 py-1 rounded-lg disabled:opacity-50 ${
                              r.completed
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
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
              {/* MOBILE CARDS */}
              <div className="flex flex-col gap-3 sm:hidden">
                {paginatedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white shadow rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
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

              {/* DESKTOP TABLE */}
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
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
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

      {/* ==================== USER FORM MODAL ==================== */}
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
              <input
                name="password"
                placeholder={
                  editingUserId
                    ? "New Password (leave blank to keep)"
                    : "Password"
                }
                type="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                className="input"
              />
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

      {/* ==================== DELETE USER CONFIRM MODAL ==================== */}
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

// ==================== REUSABLE PAGINATION ====================
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
          className={`cursor-pointer px-2 sm:px-3 py-1 rounded-lg text-sm border ${
            currentPage === page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
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
