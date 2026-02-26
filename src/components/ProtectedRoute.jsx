// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  // If no token, redirect to login page
  if (!token) return <Navigate to="/login" replace />;

  // Otherwise, render the protected component
  return children;
}
