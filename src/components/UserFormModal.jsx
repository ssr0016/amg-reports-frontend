// /src/components/UserFormModal.jsx
import { FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import Spinner from "./Spinner";

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "🟢 Active",
    desc: "Actively working and submitting reports",
  },
  {
    value: "on_leave",
    label: "🟡 On Leave",
    desc: "Temporarily unavailable, will return",
  },
  { value: "inactive", label: "🔴 Inactive", desc: "No longer working" },
  {
    value: "disciplinary",
    label: "🔵 Disciplinary",
    desc: "Under disciplinary action",
  },
  { value: "deceased", label: "⚫ Deceased", desc: "Has passed away" },
];

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white placeholder:text-gray-400";
const selectClass =
  "cursor-pointer appearance-none w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            {editingUserId ? "Edit User" : "Create User"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {editingUserId
              ? "Update user information"
              : "Add a new user to the system"}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex flex-col gap-3 max-h-[65vh] overflow-y-auto">
          <Field label="Full Name">
            <input
              name="name"
              placeholder="e.g. Juan dela Cruz"
              value={form.name}
              onChange={onChange}
              className={inputClass}
            />
          </Field>

          <Field label="Username">
            <input
              name="username"
              placeholder="e.g. juandc"
              value={form.username}
              onChange={onChange}
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              name="email"
              placeholder="e.g. juan@amgc.com"
              type="email"
              value={form.email}
              onChange={onChange}
              className={inputClass}
            />
          </Field>

          <Field
            label={
              editingUserId ? "New Password (leave blank to keep)" : "Password"
            }
          >
            <div className="relative">
              <input
                name="password"
                placeholder={
                  editingUserId
                    ? "Leave blank to keep current"
                    : "Enter password"
                }
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-4 w-4" />
                ) : (
                  <FaEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  className={selectClass}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              </div>
            </Field>

            <Field label="Status">
              <div className="relative">
                <select
                  name="status"
                  value={form.status || "active"}
                  onChange={onChange}
                  className={selectClass}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3" />
              </div>
            </Field>
          </div>

          {/* Status hint */}
          {form.status && form.status !== "active" && (
            <div
              className={`text-xs px-3 py-2 rounded-lg border ${
                form.status === "on_leave"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : form.status === "inactive"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : form.status === "disciplinary"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : form.status === "deceased"
                        ? "bg-gray-100 text-gray-600 border-gray-200"
                        : "bg-gray-50 text-gray-500 border-gray-100"
              }`}
            >
              {STATUS_OPTIONS.find((s) => s.value === form.status)?.desc}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-sm"
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
