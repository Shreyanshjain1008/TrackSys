import { useState } from "react";
import API, { setToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) return alert("Email and password required");

    try {
      setLoading(true);
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await API.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setToken(res.data.access_token);
      nav("/projects");
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="p-8 bg-white rounded shadow border w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">
          TrackSys Login
        </h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          Continue to your workspace
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
            className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {/* 👇 SIGNUP LINK */}
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
