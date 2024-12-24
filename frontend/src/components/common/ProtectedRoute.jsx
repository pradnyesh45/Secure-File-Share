import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, mfaRequired } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mfaRequired && !location.pathname.includes("/mfa")) {
    return <Navigate to="/mfa-setup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
