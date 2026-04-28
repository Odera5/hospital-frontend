import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CalendarClock, RefreshCcw, AlertCircle } from "lucide-react";
import api from "../services/api";
import Button from "../components/ui/Button";

const actionMeta = {
  confirm: {
    title: "Confirm appointment",
    button: "Confirm Appointment",
    icon: CheckCircle2,
  },
  reschedule: {
    title: "Request reschedule",
    button: "Request Reschedule",
    icon: RefreshCcw,
  },
};

export default function AppointmentResponse() {
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const token = params.get("token") || "";
  const action = params.get("action") || "confirm";
  const meta = useMemo(() => actionMeta[action] || actionMeta.confirm, [action]);
  const Icon = meta.icon;

  const submitResponse = async () => {
    try {
      setSubmitting(true);
      const response = await api.post("/appointments/respond", {
        token,
        action,
      });
      setResult({
        type: "success",
        message:
          response.data?.message ||
          (action === "confirm"
            ? "Appointment confirmed successfully."
            : "Reschedule request received successfully."),
      });
    } catch (error) {
      setResult({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not process this appointment response.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
              PrimuxCare
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{meta.title}</h1>
          </div>
        </div>

        {result ? (
          <div
            className={`rounded-2xl border p-5 ${
              result.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.type === "success" ? (
                <CheckCircle2 size={22} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={22} className="mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{result.message}</p>
                <p className="mt-2 text-sm opacity-80">
                  You can close this page now.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Use the button below to tell the clinic whether you will attend
              this appointment or need a different time.
            </p>

            {!token ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                This response link is missing its token and cannot be used.
              </div>
            ) : (
              <Button
                onClick={submitResponse}
                isLoading={submitting}
                className="w-full"
              >
                <Icon size={18} className="mr-2" />
                {meta.button}
              </Button>
            )}
          </>
        )}

        <div className="mt-8 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Staff login
          </Link>
        </div>
      </div>
    </div>
  );
}
