// /src/components/AdminUsersTab.jsx
import { FaEdit, FaTrash, FaUserPlus, FaChevronDown } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  on_leave: {
    label: "On Leave",
    color: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
  },
  inactive: {
    label: "Inactive",
    color: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
  disciplinary: {
    label: "Disciplinary",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  deceased: {
    label: "Deceased",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-500",
  },
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "on_leave", label: "On Leave" },
  { key: "inactive", label: "Inactive" },
  { key: "disciplinary", label: "Disciplinary" },
  { key: "deceased", label: "Deceased" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function AdminUsersTab({
  users,
  paginatedUsers,
  totalUserPages,
  totalUserCount,
  userPage,
  setUserPage,
  loading,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  currentUserId,
  statusFilter, // ✅ from parent
  setStatusFilter, // ✅ from parent
}) {
  // ✅ Data already filtered from backend — use directly
  const filtered = paginatedUsers;

  return (
    <>
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {totalUserCount ?? users.length} total users
        </p>

        <div className="flex flex-row gap-2 items-end justify-end flex-wrap">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Filter Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm font-medium rounded-lg pl-3 pr-8 py-2 transition outline-none shadow-sm w-[150px]"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
            </div>
          </div>

          <button
            onClick={onCreateUser}
            className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition self-end"
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            Create User
          </button>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <p className="text-base font-medium">No users found</p>
          <p className="text-sm">Try changing the status filter.</p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((u) => (
              <div
                key={u._id}
                className="bg-white shadow-sm rounded-xl p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      @{u.username}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role}
                    </span>
                    <StatusBadge status={u.status || "active"} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{u.email}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEditUser(u)}
                    className="cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <FaEdit className="h-3 w-3" /> Edit
                  </button>
                  {u._id !== currentUserId && (
                    <button
                      onClick={() => onDeleteUser(u._id)}
                      className="cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <FaTrash className="h-3 w-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Name",
                    "Username",
                    "Email",
                    "Role",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className={`transition ${
                      u.status === "inactive" || u.status === "deceased"
                        ? "bg-gray-50/60 hover:bg-gray-100/60"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {u.name}
                      {u._id === currentUserId && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      @{u.username}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status || "active"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditUser(u)}
                          title="Edit"
                          className="cursor-pointer p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="h-3.5 w-3.5" />
                        </button>
                        {u._id !== currentUserId ? (
                          <button
                            onClick={() => onDeleteUser(u._id)}
                            title="Delete"
                            className="cursor-pointer p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 text-gray-300 cursor-not-allowed"
                            title="Cannot delete yourself"
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
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
  );
}
