import { useEffect, useState } from "react";
import API, { clearToken } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    API.get("/projects/")
      .then((res) => setProjects(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          nav("/login");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function createProject() {
    if (!name.trim()) return alert("Project name required");

    try {
      setCreating(true);
      const res = await API.post("/projects/", {
        name: name.trim(),
        description: "",
      });
      setProjects((prev) => [...prev, res.data]);
      setName("");
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  function changeUser() {
    clearToken();
    nav("/login");
  }

  async function deleteProject(projectId) {
    if (!window.confirm("Delete this project?")) return;
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete project");
    }
  }

  if (loading) {
    return <div className="p-6">Loading projects…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <button
          onClick={changeUser}
          className="px-3 py-1 rounded border text-sm"
        >
          Change User
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          className="p-2 border rounded flex-1 shadow-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
        />
        <button
          onClick={createProject}
          disabled={creating}
          className="bg-green-600 text-white px-4 rounded disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-gray-500">No projects yet</div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="p-4 border rounded shadow-sm hover:bg-gray-50 flex items-center justify-between gap-3"
            >
              <Link
                className="text-blue-600 font-semibold"
                to={`/projects/${p.id}`}
              >
                {p.name}
              </Link>
              <button
                onClick={() => deleteProject(p.id)}
                className="px-2 py-1 rounded bg-red-600 text-white text-xs"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
