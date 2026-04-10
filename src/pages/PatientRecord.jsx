// src/pages/PatientRecord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";
import Modal from "../components/PatientRecord/Modal";
import RecordForm from "../components/PatientRecord/RecordForm";
import RecordItem from "../components/PatientRecord/RecordItem";
import SearchFilterSort from "../components/PatientRecord/SearchFilterSort";
import { createEmptyRecord } from "../components/PatientRecord/recordUtils";
import { getEntityId } from "../utils/entityId";

const RECORDS_PER_PAGE = 10;

export default function PatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const canEditPatient =
    storedUser.role === "admin" || storedUser.role === "doctor";

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [patientForm, setPatientForm] = useState({
    name: "",
    cardNumber: "",
    age: "",
    gender: "other",
    phone: "",
    email: "",
    address: "",
  });

  const [newRecord, setNewRecord] = useState(createEmptyRecord());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [toast, setToast] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [patientSaveLoading, setPatientSaveLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / RECORDS_PER_PAGE),
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStartIndex = (currentPageSafe - 1) * RECORDS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(
    pageStartIndex,
    pageStartIndex + RECORDS_PER_PAGE,
  );

  // ---------------- Helper: Convert record object to FormData ----------------
  const createFormData = (recordData, removedAttachments = []) => {
    const formData = new FormData();

    Object.keys(recordData).forEach((key) => {
      if (key === "attachments") {
        recordData.attachments.forEach((file) => {
          if (file instanceof File) {
            formData.append("attachments", file);
          }
        });
      } else if (key === "teeth") {
        formData.append("teeth", JSON.stringify(recordData.teeth || []));
      } else {
        formData.append(key, recordData[key] || "");
      }
    });

    removedAttachments.forEach((filename) =>
      formData.append("removedAttachments", filename)
    );

    return formData;
  };

  // ---------------- Fetch patient + records ----------------
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);

        const resPatient = await api.get(`/patients/${id}`, {
        });

        setPatient(resPatient.data);
        setPatientForm({
          name: resPatient.data?.name || "",
          cardNumber: resPatient.data?.cardNumber || "",
          age: resPatient.data?.age || "",
          gender: resPatient.data?.gender || "other",
          phone: resPatient.data?.phone || "",
          email: resPatient.data?.email || "",
          address: resPatient.data?.address || "",
        });

        const resRecords = await api.get(`/patients/${id}/records`, {
        });

        setRecords(resRecords.data);
        setFilteredRecords(resRecords.data);
      } catch (err) {
        console.error(err);
        showToast("Failed to fetch patient data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // ---------------- Add record ----------------
  const handleAddRecord = async (recordData) => {
    try {
      setAddLoading(true);

      const formData = createFormData(recordData);

      const res = await api.post(`/patients/${id}/records`, formData);

      const updatedRecords = [...records, res.data];
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);

      showToast("Record added successfully!", "success");
      return true;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to add record", "error");
      return false;
    } finally {
      setAddLoading(false);
    }
  };

  // ---------------- Delete record ----------------
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?"))
      return;

    try {
      await api.delete(`/patients/${id}/records/${recordId}`);

      const updatedRecords = records.filter(
        (r) => getEntityId(r) !== recordId
      );

      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);

      showToast("Record deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete record", "error");
    }
  };

  // ---------------- Edit record ----------------
  const handleSaveEdit = async (
    recordId,
    updatedData,
    removedAttachments = []
  ) => {
    try {
      const formData = createFormData(updatedData, removedAttachments);

      const res = await api.put(`/patients/${id}/records/${recordId}`, formData);

      const updatedRecords = records.map((r) =>
        getEntityId(r) === recordId ? res.data : r
      );

      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);

      showToast("Record updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update record", "error");
    }
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditPatientModal = () => {
    if (!patient) return;

    setPatientForm({
      name: patient.name || "",
      cardNumber: patient.cardNumber || "",
      age: patient.age || "",
      gender: patient.gender || "other",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
    });
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();

    if (!patientForm.name.trim()) {
      showToast("Patient name cannot be empty.", "error");
      return;
    }

    if (!patientForm.age || Number(patientForm.age) <= 0) {
      showToast("Age must be greater than 0.", "error");
      return;
    }

    if (
      patientForm.email &&
      !/\S+@\S+\.\S+/.test(patientForm.email)
    ) {
      showToast("Invalid email address.", "error");
      return;
    }

    try {
      setPatientSaveLoading(true);

      const payload = {
        name: patientForm.name.trim(),
        cardNumber: patientForm.cardNumber.trim(),
        age: patientForm.age.toString(),
        gender: patientForm.gender || "other",
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        address: patientForm.address.trim(),
      };

      const res = await api.put(`/patients/${id}`, payload);
      setPatient(res.data);
      setPatientForm({
        name: res.data?.name || "",
        cardNumber: res.data?.cardNumber || "",
        age: res.data?.age || "",
        gender: res.data?.gender || "other",
        phone: res.data?.phone || "",
        email: res.data?.email || "",
        address: res.data?.address || "",
      });
      setShowEditPatientModal(false);
      showToast("Patient information updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to update patient information",
        "error",
      );
    } finally {
      setPatientSaveLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRecords.length, searchKeyword]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ---------------- Render ----------------
  if (loading)
    return <p className="p-6">Loading patient data...</p>;

  if (!patient)
    return (
      <p className="p-6 text-red-600">
        Patient not found.
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-2">
        {patient.name}'s Records
      </h1>

      <div className="mb-4 space-y-1 text-gray-600">
        <p>Age: {patient.age}</p>
        <p>Sex: {patient.gender || "Not specified"}</p>
        <p>Phone: {patient.phone || "No phone number"}</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {canEditPatient && (
          <button
            onClick={openEditPatientModal}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            Edit Patient Info
          </button>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Record
        </button>
      </div>

      <SearchFilterSort
        records={records}
        onFiltered={(filtered, keyword) => {
          setFilteredRecords(filtered);
          setSearchKeyword(keyword);
        }}
      />

      {/* SIMPLE NORMAL RENDER — NO VIRTUALIZATION */}
      <div className="space-y-4 rounded bg-white p-6 shadow-md">
        <div className="max-h-[70vh] overflow-auto">
          {filteredRecords.length === 0 ? (
            <p>No records found.</p>
          ) : (
            paginatedRecords.map((record) => (
              <RecordItem
                patientId={id}
                key={getEntityId(record)}
                record={record}
                expandedRecordId={expandedRecordId}
                setExpandedRecordId={setExpandedRecordId}
                handleDelete={handleDeleteRecord}
                handleSaveEdit={handleSaveEdit}
                searchKeyword={searchKeyword}
              />
            ))
          )}
        </div>

        {filteredRecords.length > 0 && (
          <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {pageStartIndex + 1}-
              {Math.min(pageStartIndex + RECORDS_PER_PAGE, filteredRecords.length)} of{" "}
              {filteredRecords.length} records
            </p>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPageSafe === 1}
                className="rounded border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-medium text-gray-700">
                Page {currentPageSafe} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPageSafe === totalPages}
                className="rounded border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <h2 className="text-xl font-semibold mb-4">
            Add New Record
          </h2>

          <RecordForm
            patientId={id}
            recordData={newRecord}
            setRecordData={setNewRecord}
            onSubmit={async (e) => {
              e.preventDefault();
              const created = await handleAddRecord(newRecord);
              if (!created) return;

              setNewRecord(createEmptyRecord());

              setShowAddModal(false);
            }}
            submitLabel={addLoading ? "Adding..." : "Add Record"}
            loading={addLoading}
          />
        </Modal>
      )}

      {showEditPatientModal && (
        <Modal onClose={() => setShowEditPatientModal(false)}>
          <h2 className="text-xl font-semibold mb-4">Edit Patient Information</h2>

          <form onSubmit={handleUpdatePatient} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={patientForm.name}
                onChange={handlePatientFormChange}
                className="w-full rounded border px-3 py-2"
                disabled={patientSaveLoading}
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Patient Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={patientForm.cardNumber}
                onChange={handlePatientFormChange}
                className="w-full rounded border px-3 py-2"
                disabled={patientSaveLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium">Age</label>
                <input
                  type="number"
                  name="age"
                  value={patientForm.age}
                  onChange={handlePatientFormChange}
                  className="w-full rounded border px-3 py-2"
                  disabled={patientSaveLoading}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Sex</label>
                <select
                  name="gender"
                  value={patientForm.gender}
                  onChange={handlePatientFormChange}
                  className="w-full rounded border px-3 py-2"
                  disabled={patientSaveLoading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={patientForm.phone}
                  onChange={handlePatientFormChange}
                  className="w-full rounded border px-3 py-2"
                  disabled={patientSaveLoading}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handlePatientFormChange}
                  className="w-full rounded border px-3 py-2"
                  disabled={patientSaveLoading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={patientForm.address}
                onChange={handlePatientFormChange}
                className="w-full rounded border px-3 py-2"
                disabled={patientSaveLoading}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowEditPatientModal(false)}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                disabled={patientSaveLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={patientSaveLoading}
              >
                {patientSaveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
