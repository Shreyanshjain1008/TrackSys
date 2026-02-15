from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

from app.api.deps import get_current_user_ws
from app.db.session import SessionLocal

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user):
        await websocket.accept()
        websocket.state.user = user
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, data: dict):
        for ws in list(self.active):
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(ws)


manager = ConnectionManager()


@router.websocket("/ws/boards")
async def board_ws(websocket: WebSocket):
    db = SessionLocal()
    try:
        user = await get_current_user_ws(websocket, db)
        if not user:
            return

        await manager.connect(websocket, user)

        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()