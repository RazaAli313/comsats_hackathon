from fastapi import FastAPI,WebSocket, WebSocketDisconnect

from fastapi.middleware.cors import CORSMiddleware
from backend.routes.api.Contact import router as contact_router
from dotenv import load_dotenv
import os
clients = []
load_dotenv()
PORT = int(os.getenv("PORT", 8000)) 
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(contact_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Server is running"}


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            # Broadcast to all connected clients
            for client in clients:
                await client.send_text(message)

    except WebSocketDisconnect:
        clients.remove(websocket)