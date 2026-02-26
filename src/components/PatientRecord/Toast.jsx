// components/PatientRecord/Toast.jsx
import React from "react";

export default function Toast({ toast, show }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white transform transition-transform duration-500 z-50 ${
        toast.type === "success" ? "bg-green-600" : "bg-red-600"
      } ${show ? "translate-x-0" : "translate-x-24 opacity-0"}`}
    >
      {toast.message}
    </div>
  );
}
