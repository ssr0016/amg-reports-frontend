import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "./Spinner";

export default function UserFormModal({
  show,
  editingUserId,
  form,
  onChange,
  onClose,
  onSave,
  saving,
  showPassword,
  onTogglePassword,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editingUserId ? "Edit User" : "Create User"}
        </h2>
        <div className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            className="input"
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={onChange}
            className="input"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="input"
          />
          <div className="relative">
            <input
              name="password"
              placeholder={
                editingUserId ? "New Password (leave blank to keep)" : "Password"
              }
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="input"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
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
  );
}
