export function createBoardSocket(token, projectId) {
  const base = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const url = new URL(base);

  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${url.host}/ws/boards?token=${token}&project_id=${projectId}`;

  return new WebSocket(wsUrl);
}
