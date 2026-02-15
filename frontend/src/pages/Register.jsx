import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) return alert("All fields required");

    try {
      setLoading(true);
      await API.post("/auth/register", {
        full_name: fullName || null,
        email,
        password,
      });
      alert("Account created. Please login.");
      nav("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="p-8 bg-white rounded shadow border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">
          TrackSys Signup
        </h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          Create your account and join your team
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            className="p-2 border rounded"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-green-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        {/* 👇 LOGIN LINK */}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
