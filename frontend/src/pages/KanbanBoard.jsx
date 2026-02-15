import { useEffect, useState, useRef } from "react";
import API, { getToken } from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import IssueModal from "./IssueModal";
import { createBoardSocket } from "../services/ws";
import CreateIssueModal from "../components/CreateIssueModal";

const columnsOrder = ["todo", "in_progress", "done"];
const columnNames = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function KanbanBoard() {
  const { id: projectId } = useParams();
  const nav = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const wsRef = useRef(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    fetchIssues();

    const token = getToken();
    if (!token) {
      nav("/login");
      return;
    }

    const ws = createBoardSocket(token, projectId);
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type?.startsWith("issue:")) {
        fetchIssues();
      }
    };

    ws.onerror = () => {
      if (ws.readyState !== WebSocket.CLOSED) {
        console.warn("WebSocket error");
      }
    };
    wsRef.current = ws;

    return () => ws.close();
  }, [projectId]);

  async function fetchIssues() {
    try {
      setLoading(true);
      const r = await API.get(`/issues/projects/${projectId}`);
      setIssues(r.data);
    } catch (err) {
      if (err.response?.status === 401) nav("/login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function grouped() {
    const map = { todo: [], in_progress: [], done: [] };
    issues.forEach((i) => map[i.status]?.push(i));
    return map;
  }

  async function onDragEnd(result) {
    if (!result.destination) return;

    const issueId = result.draggableId;
    const dest = result.destination.droppableId;

    const prev = issues;

    setIssues((curr) =>
      curr.map((i) =>
        i.id.toString() === issueId ? { ...i, status: dest } : i
      )
    );

    try {
      await API.patch(`/issues/${issueId}/status`, null, {
        params: { status: dest },
      });
    } catch (err) {
      console.error(err);
      setIssues(prev);
      alert("Failed to update issue status");
    }
  }

  const groups = grouped();

  if (loading) return <div className="p-6">Loading board…</div>;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${projectId}/members`}
            className="px-3 py-1 border rounded text-sm"
          >
            Members
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            + New Issue
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 min-w-max">
          {columnsOrder.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 bg-gray-100 p-3 rounded shadow-sm border"
                >
                  <h3 className="font-bold mb-3">{columnNames[col]}</h3>

                  {groups[col].map((issue, index) => (
                    <Draggable
                      draggableId={issue.id.toString()}
                      index={index}
                      key={issue.id}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 my-2 rounded shadow cursor-pointer border"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {issue.description}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {showCreate && (
        <CreateIssueModal
          projectId={projectId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchIssues}
        />
      )}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          projectId={projectId}
          onClose={() => {
            setSelectedIssue(null);
            fetchIssues();
          }}
        />
      )}
    </div>
  );
}
