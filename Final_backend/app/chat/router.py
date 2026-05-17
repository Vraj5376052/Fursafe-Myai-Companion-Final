import os
import requests as req
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.model.chat import Chat, ChatMessage
from app.model.user import User
from datetime import datetime, timezone
from app.auth.router import get_current_user
from cryptography.fernet import Fernet

router = APIRouter()

# --- Encryption Setup ---
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    raise RuntimeError("ENCRYPTION_KEY not found in environment variables")
cipher_suite = Fernet(ENCRYPTION_KEY.encode())

def encrypt_text(text: str) -> str:
    if not text: return ""
    return cipher_suite.encrypt(text.encode()).decode()

def decrypt_text(text: str) -> str:
    if not text: return ""
    try:
        return cipher_suite.decrypt(text.encode()).decode()
    except Exception:
        return text

# System prompt for the AI — keeps responses safe and patient-appropriate
SYSTEM_PROMPT = (
    "You are MyAI Companion, a supportive assistant for patients in healthcare settings. "
    "Your role is to help patients understand medical information in plain, everyday language "
    "and where appropriate suggest very basic first-aid comfort measures. "
    "\n\nCORE CAPABILITY — MEDICAL LANGUAGE SIMPLIFICATION:\n"
    "When a user shares medical terms, a doctor's note, a diagnosis, test results, a prescription label, "
    "or any clinical language they do not understand, your PRIMARY job is to explain it clearly "
    "in simple words a non-medical person can understand. "
    "Break down each term or phrase one by one. Use everyday analogies where helpful. "
    "Never leave a medical term unexplained — always replace it with plain language.\n"
    "\n\nSTRICT RULES:\n"
    "- NEVER provide a medical diagnosis or clinical assessment.\n"
    "- NEVER suggest medications, dosages, or anything requiring a prescription or pharmacist.\n"
    "- You MAY suggest basic first-aid comfort measures only — such as applying ice, resting, "
    "using a bandage, drinking water, elevating a limb, or using items from a standard home medical kit.\n"
    "- If the situation sounds serious or beyond basic first-aid, always direct the user to see a healthcare professional.\n"
    "- Always end with a gentle reminder to speak with their healthcare professional for proper advice.\n"
    "- Keep responses short, calm, and reassuring — suitable for elderly or stressed patients.\n"
    "- Use simple words. Avoid medical jargon.\n"
    "\n\nLANGUAGE ACCURACY:\n"
    "When responding in a language other than English, you MUST use medically and linguistically accurate "
    "translations — not word-for-word literal translations. Use natural, everyday phrasing that a native "
    "speaker of that language would use. Medical concepts must be explained using terms commonly understood "
    "in that language and culture, not just translated from English. Accuracy and natural fluency are essential."
)


@router.get("/fetch-chats")
async def fetch_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is fetching their chat list.")

    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()).all()

    # Return serialised list so SQLAlchemy objects don't cause issues
    return [
        {
            "id": c.id, 
            "title": decrypt_text(c.title), 
            "created_at": str(c.created_at)
        }
        for c in chats
    ]


@router.get("/fetch-chat/{chat_id}")
async def fetch_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is fetching messages for chat {chat_id}.")

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()

    if not chat:
        print(f"[DEBUG] User {current_user.id} tried to access chat {chat_id} (Unauthorized/Not Found)")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )

    messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.timestamp.asc()).all()

    return {
        "id": chat.id,
        "title": decrypt_text(chat.title),
        "messages": [
            {
                "id": m.id, 
                "role": m.role, 
                "message": decrypt_text(m.message), 
                "timestamp": str(m.timestamp)
            }
            for m in messages
        ]
    }


@router.post("/create-chat")
async def create_chat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is creating a new chat.")

    new_chat = Chat(
        title=encrypt_text("New Chat"),
        user_id=current_user.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    print(f"[DEBUG] Successfully created Chat ID {new_chat.id} for User {current_user.id}.")
    return {"chatId": new_chat.id, "title": "New Chat", "created_at": str(new_chat.created_at)}


@router.post("/add-chat/{chat_id}")
async def add_chat(chat_id: int, request: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    message_text = request.get("message", "").strip()
    target_language = request.get("target_language", "English").strip() or "English"
    print(f"[DEBUG] User {current_user.id} is sending a message to chat {chat_id} (language: {target_language}).")

    if not message_text:
        raise HTTPException(status_code=400, detail="Message is required")

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()

    if not chat:
        print(f"[DEBUG] Chat {chat_id} not found or doesn't belong to User {current_user.id}.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or access denied"
        )

    # Fetch past history from DB (Cody's original logic, kept as-is)
    past_messages = db.query(ChatMessage).filter(
        ChatMessage.chat_id == chat_id
    ).order_by(ChatMessage.timestamp.asc()).all()

    # Save new user message to DB
    user_message = ChatMessage(
        chat_id=chat_id,
        user_id=current_user.id,
        message=encrypt_text(message_text),
        role="user",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(user_message)
    db.commit()

    # CHANGED: Gemini → Groq (Gemini had daily quota issues)
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print(f"[ERROR] GROQ_API_KEY missing during request from User {current_user.id}.")
        raise HTTPException(status_code=500, detail="API key not configured")

    print(f"[DEBUG] Calling Groq API for User {current_user.id}...")

    try:
        # Build conversation history in OpenAI format (same concept as Cody's Gemini history)
        lang_instruction = (
            f"\n\nIMPORTANT: You must respond entirely in {target_language}. Do not use any other language."
            if target_language.lower() != "english" else ""
        )
        messages_payload = [{"role": "system", "content": SYSTEM_PROMPT + lang_instruction}]

        for msg in past_messages:
            role = "user" if msg.role == "user" else "assistant"
            messages_payload.append({"role": role, "content": decrypt_text(msg.message)})
        messages_payload.append({"role": "user", "content": message_text})

        response = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages_payload,
                "max_tokens": 512,
            },
            timeout=30,
        )
        ai_text = response.json()["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print(f"[ERROR] Groq API call failed for User {current_user.id}: {e}")
        raise HTTPException(status_code=503, detail="AI processing failed. Please try again.")

    # Save AI reply to DB
    ai_message = ChatMessage(
        chat_id=chat_id,
        user_id=current_user.id,
        message=encrypt_text(ai_text),
        role="ai",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)

    # Update chat title from first message
    if decrypt_text(chat.title) == "New Chat":
        short_title = message_text[:40] + ("..." if len(message_text) > 40 else "")
        chat.title = encrypt_text(short_title)

    db.commit()

    print(f"[DEBUG] Chat {chat_id} updated with AI response for User {current_user.id}.")
    return {"user_message": message_text, "ai_message": ai_text}


# ADDED: delete chat endpoint (not in Cody's original, needed by frontend)
@router.delete("/delete-chat/{chat_id}")
async def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is deleting chat {chat_id}.")

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or access denied")

    db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).delete()
    db.delete(chat)
    db.commit()

    print(f"[DEBUG] Chat {chat_id} deleted for User {current_user.id}.")
    return {"message": "Chat deleted"}
