// src/components/PatientRecord/RecordForm.jsx
import React, { useState, useEffect } from "react";

export default function RecordForm({ recordData, setRecordData, onSubmit, submitLabel, loading }) {
  const [previews, setPreviews] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);

  // Update previews whenever attachments change
  useEffect(() => {
    const newPreviews = (recordData.attachments || []).map((file) => {
      if (file.url) {
        // Existing backend file
        return { type: "image", url: file.url, name: file.name || file.url, existing: true };
      } else if (file instanceof File && file.type.startsWith("image/")) {
        // New uploaded image
        return { type: "image", url: URL.createObjectURL(file), name: file.name, existing: false };
      } else if (file instanceof File) {
        // Other new files (PDF, docx, etc.)
        return { type: "file", name: file.name, existing: false };
      }
      return { type: "file", name: file.name || "Attachment", existing: false };
    });

    setPreviews(newPreviews);

    // Cleanup object URLs for new files
    return () => {
      newPreviews.forEach((p) => {
        if (p.type === "image" && !p.existing && p.url.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [recordData.attachments]);

  // Handle text/textarea changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecordData({ ...recordData, [name]: value });
  };

  // Handle file input
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Keep existing backend files
    const existingFiles = (recordData.attachments || []).filter((f) => f.url);
    setRecordData({ ...recordData, attachments: [...existingFiles, ...files] });
  };

  // Remove an attachment (existing or new)
  const handleRemoveAttachment = (index) => {
    const removed = recordData.attachments[index];

    // Track removed backend files
    if (removed.url) setRemovedFiles([...removedFiles, removed.name]);

    const updated = [...recordData.attachments];
    updated.splice(index, 1);
    setRecordData({ ...recordData, attachments: updated });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Presenting Complaint */}
      <div>
        <label className="block font-semibold mb-1">Presenting Complaint</label>
        <textarea
          name="presentingComplaint"
          value={recordData.presentingComplaint}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      {/* History */}
      <div>
        <label className="block font-semibold mb-1">History of Presenting Complaint</label>
        <textarea
          name="history"
          value={recordData.history}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Examination */}
      <div>
        <label className="block font-semibold mb-1">Examination</label>
        <textarea
          name="examination"
          value={recordData.examination}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Investigation */}
      <div>
        <label className="block font-semibold mb-1">Investigation</label>
        <textarea
          name="investigation"
          value={recordData.investigation}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Diagnosis */}
      <div>
        <label className="block font-semibold mb-1">Diagnosis</label>
        <textarea
          name="diagnosis"
          value={recordData.diagnosis}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Treatment Plan */}
      <div>
        <label className="block font-semibold mb-1">Treatment Plan</label>
        <textarea
          name="treatmentPlan"
          value={recordData.treatmentPlan}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Medication */}
      <div>
        <label className="block font-semibold mb-1">Medication</label>
        <textarea
          name="medication"
          value={recordData.medication}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block font-semibold mb-1">Attachments (images, PDFs)</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {previews.map((p, idx) => (
              <div key={idx} className="relative">
                {p.type === "image" ? (
                  <img src={p.url} alt={p.name} className="w-full h-24 object-cover border rounded" />
                ) : (
                  <div className="p-2 border rounded bg-gray-100 text-sm truncate" title={p.name}>
                    📄 {p.name}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none ${
          loading ? "bg-blue-300 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}