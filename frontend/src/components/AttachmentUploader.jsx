import { useState } from "react";
import API from "../services/api";

export default function AttachmentUploader({ issueId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function upload() {
    if (!file || !issueId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await API.post(`/attachments/issues/${issueId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      onUploaded && onUploaded();
    } catch (err) {
      console.error(err);
      alert("Attachment upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm"
      />
      <button
        onClick={upload}
        disabled={!file || uploading}
        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
