import { Routes, Route } from "react-router-dom";
import Register from "./components/auth/Register";
import MFASetup from "./components/auth/MFASetup";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import SharedLink from "./components/files/SharedLink";
import Files from "./components/files/Files";
import SharedFiles from "./components/files/SharedFiles";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:token" element={<SharedLink />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="files" element={<Files />} />
        <Route path="shared" element={<SharedFiles />} />
        <Route path="mfa-setup" element={<MFASetup />} />
      </Route>
    </Routes>
  );
}

export default App;
