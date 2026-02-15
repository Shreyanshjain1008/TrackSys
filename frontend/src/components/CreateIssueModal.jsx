import { useEffect, useState } from "react";
import API from "../services/api";

export default function CreateIssueModal({ projectId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/users/")
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setLoading(true);
      await API.post(`/issues/projects/${projectId}`, {
        title,
        description,
        type: "task",
        priority: 2,
        assignee_id: assigneeId ? Number(assigneeId) : null,
      });

      onCreated(); // refresh board
      onClose();   // close modal
    } catch (err) {
      console.error(err);
      alert("Failed to create issue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 w-full max-w-lg rounded shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-3">Create Issue</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name ? `${user.full_name} (${user.email})` : user.email}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
