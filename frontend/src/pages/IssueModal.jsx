import { useEffect, useState } from "react";
import API from "../services/api";
import CommentList from "../components/CommentList";
import AttachmentUploader from "../components/AttachmentUploader";

export default function IssueModal({ issue, onClose }) {
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issue) return;

    document.body.style.overflow = "hidden";
    fetchAll();

    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [issue]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [c, a] = await Promise.all([
        API.get(`/comments/issues/${issue.id}`),
        API.get(`/attachments/issues/${issue.id}`),
      ]);
      setComments(c.data);
      setAttachments(a.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteIssue() {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await API.delete(`/issues/${issue.id}`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete issue");
    }
  }

  async function deleteAttachment(attachmentId) {
    if (!window.confirm("Delete this attachment?")) return;
    try {
      await API.delete(`/attachments/${attachmentId}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete attachment");
    }
  }

  if (!issue) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 w-2/3 max-w-4xl rounded shadow max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{issue.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={deleteIssue}
              className="px-2 py-1 rounded bg-red-600 text-white text-sm"
            >
              Delete Issue
            </button>
            <button onClick={onClose} className="text-gray-600">
              x
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm">{issue.description}</p>

        {loading ? (
          <div className="mt-4 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Attachments</h3>
              <ul className="space-y-1">
                {attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <a
                      className="text-blue-600 text-sm"
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.filename}
                    </a>
                    <button
                      onClick={() => deleteAttachment(a.id)}
                      className="px-2 py-0.5 rounded bg-red-600 text-white text-xs"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>

              <AttachmentUploader issueId={issue.id} onUploaded={fetchAll} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-1">Comments</h3>
              <CommentList comments={comments} refresh={fetchAll} issueId={issue.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
