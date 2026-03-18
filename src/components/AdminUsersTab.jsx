import { FaEdit, FaTrash } from "react-icons/fa";
import Spinner from "./Spinner";
import Pagination from "./Pagination";

export default function AdminUsersTab({
  users,
  paginatedUsers,
  totalUserPages,
  userPage,
  setUserPage,
  loading,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  currentUserId,
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">{users.length} total users</p>
        <button
          onClick={onCreateUser}
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + Create User
        </button>
      </div>

      {loading ? (
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
                    onClick={() => onEditUser(u)}
                    className="cursor-pointer flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit /> Edit
                  </button>
                  {u._id !== currentUserId && (
                    <button
                      onClick={() => onDeleteUser(u._id)}
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
                        onClick={() => onEditUser(u)}
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      {u._id !== currentUserId && (
                        <button
                          onClick={() => onDeleteUser(u._id)}
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
  );
}
