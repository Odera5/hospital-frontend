// src/components/PatientRecord/RecordItem.jsx
import React, { useState, useCallback, useEffect } from "react";
import RecordForm from "./RecordForm";
import Modal from "./Modal";
import HighlightText from "../../utils/highlightText";

function RecordItem({
  record,
  expandedRecordId,
  setExpandedRecordId,
  handleDelete,
  handleSaveEdit,
  searchKeyword,
  virtualizer, // 👈 NEW
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordData, setEditingRecordData] = useState({ ...record });
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const isExpanded = expandedRecordId === record._id;

  // 🔥 Force re-measure when expanding/collapsing
  useEffect(() => {
    if (virtualizer) {
      virtualizer.measure();
    }
  }, [isExpanded, virtualizer]);

  // Reset editing state
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingRecordData({ ...record });
    setRemovedAttachments([]);
    setLoading(false);
  }, [record]);

  const saveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await handleSaveEdit(record._id, editingRecordData, removedAttachments);
      cancelEditing();
    } catch (err) {
      console.error("Failed to update record:", err);
      setLoading(false);
    }
  };

  // 🔥 Force re-measure after images load
  const handleImageLoad = () => {
    if (virtualizer) {
      virtualizer.measure();
    }
  };

  return (
    <div className="border rounded bg-gray-50 mb-2">
      {/* Collapsed Header */}
      <div
        onClick={() =>
          setExpandedRecordId(
            isExpanded ? null : record._id
          )
        }
        className="flex justify-between items-center cursor-pointer px-4 py-2 bg-gray-200"
      >
        <span>
          <strong>Date:</strong>{" "}
          {record.createdAt
            ? new Date(record.createdAt).toLocaleDateString()
            : "-"}{" "}
          | <strong>Complaint:</strong>{" "}
          <HighlightText
            text={record.presentingComplaint || ""}
            keyword={searchKeyword}
          />{" "}
          | <strong>Diagnosis:</strong>{" "}
          <HighlightText
            text={record.diagnosis || ""}
            keyword={searchKeyword}
          />
        </span>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          <p>
            <strong>History:</strong>{" "}
            <HighlightText text={record.history || ""} keyword={searchKeyword} />
          </p>

          <p>
            <strong>Examination:</strong>{" "}
            <HighlightText text={record.examination || ""} keyword={searchKeyword} />
          </p>

          <p>
            <strong>Investigation:</strong>{" "}
            <HighlightText text={record.investigation || ""} keyword={searchKeyword} />
          </p>

          <p>
            <strong>Treatment Plan:</strong>{" "}
            <HighlightText text={record.treatmentPlan || ""} keyword={searchKeyword} />
          </p>

          <p>
            <strong>Medication:</strong>{" "}
            <HighlightText text={record.medication || ""} keyword={searchKeyword} />
          </p>

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <div>
              <strong>Attachments:</strong>
              <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                {record.attachments.map((file, idx) => {
                  const url = file.url || file;
                  const name = file.name || file;
                  const isImage = url.match(/\.(jpeg|jpg|png|gif)$/i);

                  return isImage ? (
                    <img
                      key={idx}
                      src={url}
                      alt={name}
                      onLoad={handleImageLoad} // 🔥 CRITICAL
                      className="w-full h-24 object-cover border rounded"
                    />
                  ) : (
                    <div
                      key={idx}
                      className="p-2 border rounded bg-gray-100 text-sm truncate"
                      title={name}
                    >
                      📄 {name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p>
            <strong>Created At:</strong>{" "}
            {record.createdAt
              ? new Date(record.createdAt).toLocaleString()
              : "-"}
          </p>

          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(record._id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>

          {isEditing && (
            <Modal onClose={cancelEditing}>
              <h2 className="text-xl font-semibold mb-4">Edit Record</h2>
              <RecordForm
                recordData={editingRecordData}
                setRecordData={setEditingRecordData}
                onSubmit={saveEdit}
                submitLabel="Save"
                loading={loading}
              />
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(RecordItem);