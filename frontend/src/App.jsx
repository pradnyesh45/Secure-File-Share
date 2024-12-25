import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import FileList from "./components/files/FileList";
import SharedFiles from "./components/files/SharedFiles";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <FileList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/files"
        element={
          <PrivateRoute>
            <Layout>
              <FileList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/shared"
        element={
          <PrivateRoute>
            <Layout>
              <SharedFiles />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
