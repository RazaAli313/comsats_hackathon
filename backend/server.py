from fastapi import FastAPI,WebSocket, WebSocketDisconnect,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.api.Contact import router as contact_router
from dotenv import load_dotenv
import os
clients = []
load_dotenv()
PORT = int(os.getenv("PORT", 8000)) 
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

from backend.core.logging import configure_logging, logger
from backend.middleware.exception_handlers import http_exception_handler, validation_exception_handler, generic_exception_handler
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from slowapi.middleware import SlowAPIMiddleware
from backend.config.limiter import limiter

configure_logging()

app = FastAPI()
# Attach limiter to app state and add middleware
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(contact_router, prefix="/api")
from backend.routes.api.auth import router as auth_router
app.include_router(auth_router, prefix="/api")
from backend.routes.api.products import router as products_router
app.include_router(products_router, prefix="/api")
from backend.routes.api.cart import router as cart_router
app.include_router(cart_router, prefix="/api")
from backend.routes.api.orders import router as orders_router
app.include_router(orders_router, prefix="/api")
from backend.routes.api.payments import router as payments_router
app.include_router(payments_router, prefix="/api")
from backend.routes.api.debug import router as debug_router
app.include_router(debug_router, prefix="/api")
from backend.routes.api.admin import router as admin_router
app.include_router(admin_router, prefix="/api")


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