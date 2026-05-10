import os
import requests as req
from datetime import datetime, timedelta, timezone
from typing import Union
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.model.user import User
from .schemas import UserRegister, UserLogin
import bcrypt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

# --- JWT Configuration ---
SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours so token doesn't expire during use

# --- Password Utilities ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)

# --- JWT Utility ---
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Auth Dependency (Cody's original, kept as-is) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---

@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
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

    # ADDED: return user object so frontend can display name/email
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}
    }


@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    # ADDED: return user object so frontend can display name/email
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }


# ADDED: translate endpoint using Groq instead of Gemini
@router.post("/translate")
async def translate(data: dict, current_user: User = Depends(get_current_user)):
    text = data.get("text")
    target_language = data.get("target_language")

    if not text or not target_language:
        raise HTTPException(status_code=400, detail="Text and target_language are required")

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        resp = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a translator. Output only the translated text with no explanation."
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
        raise HTTPException(status_code=503, detail="Translation unavailable. Please try again.")


# ADDED: update profile endpoint
@router.put("/update-profile")
async def update_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.get("name"):
        user.name = data["name"]

    if data.get("new_password"):
        user.password_hash = hash_password(data["new_password"])

    db.commit()
    db.refresh(user)

    return {"id": user.id, "name": user.name, "email": user.email}
