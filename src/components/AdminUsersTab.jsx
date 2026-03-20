// /src/components/AdminUsersTab.jsx
import { useState } from "react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";

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
}) {
  const [loadingPage, setLoadingPage] = useState(false);

  const handlePageChange = (newPage) => {
    setLoadingPage(true);
    setUserPage(newPage);
    setTimeout(() => setLoadingPage(false), 300);
  };
  return (
    <>
      {/* ── TOOLBAR ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {totalUserCount ?? users.length} total users
        </p>
        <button
          onClick={onCreateUser}
          className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition"
        >
          <FaUserPlus className="h-3.5 w-3.5" />
          Create User
        </button>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <p className="text-base font-medium">No users found</p>
        </div>
      ) : loadingPage ? (
        // ✅ Spinner kapag nag-page change
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : (
        <>
          {/* ── MOBILE CARDS ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {paginatedUsers.map((u) => (
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
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>
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
                  {["Name", "Username", "Email", "Role", "Actions"].map((h) => (
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
                {paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
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
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          u.role === "admin"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
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
            setPage={handlePageChange}
          />
        </>
      )}
    </>
  );
}
