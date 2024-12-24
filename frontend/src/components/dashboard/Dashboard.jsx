import React from "react";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {user?.username}!
      </h1>
      <p className="mt-2 text-gray-600">
        This is your secure file sharing dashboard. You can upload, manage, and
        share your files securely.
      </p>
    </div>
  );
};

export default Dashboard;
