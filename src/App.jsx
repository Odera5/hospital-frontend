import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const RegisterClinic = lazy(() => import("./pages/RegisterClinic"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Signup = lazy(() => import("./pages/Signup"));
const ClinicSettings = lazy(() => import("./pages/ClinicSettings"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RegisterPatient = lazy(() => import("./pages/RegisterPatient"));
const PatientRecord = lazy(() => import("./pages/PatientRecord"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Billing = lazy(() => import("./pages/Billing"));
const WaitingRoom = lazy(() => import("./pages/WaitingRoom"));
const Support = lazy(() => import("./pages/Support"));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <p className="text-sm font-medium text-gray-700">Loading page...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-clinic" element={<RegisterClinic />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/support" element={<Support />} />
          <Route
            path="/signup"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Signup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinic-settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ClinicSettings />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-patient"
            element={
              <ProtectedRoute>
                <RegisterPatient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/records"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                <PatientRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting-room"
            element={
              <ProtectedRoute>
                <WaitingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
