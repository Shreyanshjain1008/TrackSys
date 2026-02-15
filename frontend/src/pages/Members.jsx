import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

export default function Members() {
  const { id: projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  async function fetchMembers() {
    try {
      setLoading(true);
      const res = await API.get(`/projects/${projectId}/members`);
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  async function addMember() {
    if (!email.trim()) return;

    try {
      setAdding(true);
      await API.post(`/projects/${projectId}/members`, {
        email: email.trim(),
        role,
      });
      setEmail("");
      setRole("developer");
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(userId) {
    if (!window.confirm("Remove this member from project?")) return;
    try {
      await API.delete(`/projects/${projectId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove member");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Members</h2>
        <Link
          to={`/projects/${projectId}`}
          className="px-3 py-1 rounded border text-sm"
        >
          Back to Board
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="email"
          className="flex-1 p-2 border rounded shadow-sm"
          placeholder="Add member by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="p-2 border rounded shadow-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={addMember}
          disabled={adding}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading members...</div>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id} className="p-4 border rounded bg-white shadow-sm flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{m.full_name || "No name"}</div>
                <div className="text-sm text-gray-600">{m.email}</div>
                <div className="text-xs text-gray-500 mt-1">Role: {m.role}</div>
              </div>
              <button
                onClick={() => removeMember(m.id)}
                className="px-2 py-1 rounded bg-red-600 text-white text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
