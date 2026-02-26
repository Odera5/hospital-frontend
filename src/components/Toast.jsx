import React, { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50
        ${type === "success" ? "bg-green-600" : "bg-red-600"} 
        transform transition-transform duration-500`}
    >
      {message}
    </div>
  );
}
