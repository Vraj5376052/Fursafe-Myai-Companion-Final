from fastapi import FastAPI 
from app.socket.socket import sio
import socketio
from contextlib import asynccontextmanager
from app.auth.router import router as auth_router
from app.chat.router import router as chat_router
from app.core.database import Base, engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.scan.router import router as scan_router
import os

load_dotenv(override=True)  # Load environment variables from .env file


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Verify connection

    print("Starting up MyAI Companion...")

    Base.metadata.create_all(bind=engine)

    yield
    
    # Shutdown: Close connection
    engine.dispose()
    print("Database connection closed.")

app = FastAPI(title="MyAI Companion", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(scan_router, prefix="/api", tags=["Scan"])
@app.get("/")
async def health_check():
    return {"status": "online"}