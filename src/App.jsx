// /src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import EditReport from "./pages/EditReport";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel"; // ✅

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* ✅ public route */}
          <Route path="/login" element={<Login />} />

          {/* ✅ protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-report"
            element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-report/:id"
            element={
              <ProtectedRoute>
                <EditReport />
              </ProtectedRoute>
            }
          />
          {/* ✅ admin only route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
