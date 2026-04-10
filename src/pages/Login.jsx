import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const canResendVerification =
    error ===
    "Please confirm your email address to activate your account before signing in.";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.accessToken || res.data.token;
      if (!token) throw new Error("No access token returned from API");

      const refreshToken = res.data.refreshToken;
      if (!refreshToken) throw new Error("No refresh token returned from API");

      const user = res.data.user;
      if (!user) throw new Error("No user data returned from API");

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message || err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Enter your email address first so we know where to send the verification link.");
      return;
    }

    try {
      setResending(true);
      setError("");
      setSuccess("");

      const response = await api.post("/auth/resend-verification", {
        email,
      });

      setSuccess(
        response.data?.message ||
          "A new verification email has been sent. Please check your inbox and spam folder.",
      );
    } catch (err) {
      console.error(
        "Resend verification error:",
        err.response?.data || err.message || err,
      );
      setError(
        err.response?.data?.message ||
          "We could not resend the verification email.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-blue-700 mb-3">
          BHF by PrimuxCare
        </p>
        <h1 className="text-center text-2xl font-semibold mb-2">Clinic Login</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Sign in with a staff account created by your clinic administrator.
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {canResendVerification && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>Need another confirmation email?</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="mt-2 font-medium text-amber-700 hover:text-amber-800 disabled:text-amber-400"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        )}

        <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-gray-700">
          <p className="font-medium text-gray-900">New clinic?</p>
          <p className="mt-1">
            <Link
              to="/register-clinic"
              className="text-blue-700 hover:text-blue-800"
            >
              Create a clinic account
            </Link>{" "}
            to register your clinic details and set up the first admin login.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Built by PrimuxCare
        </p>
      </div>
    </div>
  );
}
