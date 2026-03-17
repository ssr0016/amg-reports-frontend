// /src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-10 w-10 text-blue-600" />
      </div>
    );
  }

  // ✅ hindi naka-login — redirect sa login
  if (!user) return <Navigate to="/login" replace />;

  // ✅ user lang ang nag-access ng admin route
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
