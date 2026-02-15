import { useState } from "react";
import API from "../services/api";

export default function CommentList({ comments = [], refresh, issueId }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function post() {
    if (!text.trim()) return;

    try {
      setPosting(true);
      await API.post(`/comments/issues/${issueId}`, {
        content: text,
      });
      setText("");
      refresh && refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  async function removeComment(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${commentId}`);
      refresh && refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="p-2 border rounded bg-white">
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>
                User {c.author_id} | {new Date(c.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => removeComment(c.id)}
                className="bg-red-600 text-white px-2 py-0.5 rounded"
              >
                Delete
              </button>
            </div>
            <div className="text-sm">{c.content}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button
          onClick={post}
          disabled={posting}
          className="bg-blue-600 text-white px-3 rounded disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
