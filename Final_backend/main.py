from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.auth.router import router as auth_router
from app.chat.router import router as chat_router
from app.scan.router import router as scan_router
from app.core.database import Base, engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(override=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up MyAI Companion...")
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()
    print("Database connection closed.")


app = FastAPI(title="MyAI Companion", lifespan=lifespan)

# Open CORS so any phone/device can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(scan_router, prefix="/api", tags=["Scan"])


@app.get("/")
async def health_check():
    return {"status": "online"}
