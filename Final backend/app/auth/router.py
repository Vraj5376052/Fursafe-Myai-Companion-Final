import os
from datetime import datetime, timedelta, timezone
from typing import Union
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.database import SessionLocal
from app.model.user import User
from .schemas import UserRegister, UserLogin
import bcrypt

router = APIRouter()

# JWT Configuration
SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer(auto_error=False)


# --- Password Utilities ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# --- JWT Utility ---
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# --- Auth Dependency ---
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# --- Routes ---

@router.post("/register")
async def register(user_data: UserRegister):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    user_data_out = {"id": new_user.id, "name": new_user.name, "email": new_user.email}
    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data_out,
    }


@router.post("/login")
async def login(credentials: UserLogin):
    db = SessionLocal()
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    user_data_out = {"id": user.id, "name": user.name, "email": user.email}
    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data_out,
    }


@router.post("/translate")
async def translate(data: dict):
    text = data.get("text")
    target_language = data.get("target_language")

    if not text or not target_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text and target language are required"
        )

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured"
        )

    try:
        import requests as req
        resp = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a translator. Translate the user's text to the requested language. "
                            "Output only the translated text, no explanations."
                        ),
                    },
                    {"role": "user", "content": f"Translate to {target_language}: {text}"},
                ],
                "max_tokens": 1024,
            },
            timeout=30,
        )
        result = resp.json()
        translated = result["choices"][0]["message"]["content"].strip()
        return {"translated_text": translated}
    except Exception as e:
        print("TRANSLATE ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Translation unavailable right now. Please try again shortly."
        )


@router.put("/update-profile")
async def update_profile(data: dict, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    if "name" in data and data["name"]:
        user.name = data["name"]

    if "new_password" in data and data["new_password"]:
        user.password_hash = hash_password(data["new_password"])

    db.commit()
    db.refresh(user)

    result = {"id": user.id, "name": user.name, "email": user.email}
    db.close()

    return result
