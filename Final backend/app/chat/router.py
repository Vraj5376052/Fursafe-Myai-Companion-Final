import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.model.chat import Chat, ChatMessage
from app.model.user import User
from app.auth.router import get_current_user
from datetime import datetime, timezone

router = APIRouter()

SYSTEM_PROMPT = (
    "You are MyAI Companion, a supportive assistant for patients in healthcare settings. "
    "Your ONLY role is to listen to what the user describes and provide a clear, plain-language summary of their situation. "
    "\n\nSTRICT RULES — follow ALL of these without exception:\n"
    "- NEVER provide a medical diagnosis, clinical advice, or treatment recommendations.\n"
    "- NEVER suggest medications, dosages, or any form of treatment.\n"
    "- NEVER tell the user what they should do medically.\n"
    "- ONLY summarise and simplify what the user has shared, in plain, easy-to-understand language.\n"
    "- Always end with a gentle reminder to speak with their healthcare professional.\n"
    "- Keep responses short, calm, and reassuring — suitable for elderly or stressed patients.\n"
    "- Use simple words. Avoid medical jargon.\n"
    "- You are a supportive tool, not a replacement for a doctor."
)


# CREATE CHAT
@router.post("/create-chat")
async def create_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_chat = Chat(
        title="New Chat",
        user_id=current_user.id,
        created_at=datetime.now(timezone.utc)
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {"chatId": new_chat.id, "title": new_chat.title, "created_at": str(new_chat.created_at)}


# FETCH ALL CHATS
@router.get("/fetch-chats")
async def fetch_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()).all()

    return [
        {"id": c.id, "title": c.title, "created_at": str(c.created_at)}
        for c in chats
    ]


# FETCH SINGLE CHAT WITH MESSAGES
@router.get("/fetch-chat/{chat_id}")
async def fetch_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = db.query(ChatMessage).filter(
        ChatMessage.chat_id == chat_id
    ).order_by(ChatMessage.timestamp.asc()).all()

    return {
        "id": chat.id,
        "title": chat.title,
        "messages": [
            {"id": m.id, "role": m.role, "message": m.message, "timestamp": str(m.timestamp)}
            for m in messages
        ]
    }


# ADD MESSAGE + GET AI RESPONSE
@router.post("/add-chat/{chat_id}")
async def add_chat(
    chat_id: int,
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message_text = request.get("message", "").strip()

    if not message_text:
        raise HTTPException(status_code=400, detail="Message is required")

    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save user message
    user_message = ChatMessage(
        chat_id=chat_id,
        user_id=current_user.id,
        message=message_text,
        role="user",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(user_message)
    db.commit()

    # Get AI response
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    try:
        import requests as req

        # Fetch recent conversation history for context
        history = db.query(ChatMessage).filter(
            ChatMessage.chat_id == chat_id
        ).order_by(ChatMessage.timestamp.asc()).limit(20).all()

        messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history:
            role = "user" if m.role == "user" else "assistant"
            messages_payload.append({"role": role, "content": m.message})

        resp = req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {groq_api_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": messages_payload,
                "max_tokens": 512,
            },
            timeout=30,
        )

        ai_text = resp.json()["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print("AI ERROR:", e)
        ai_text = "I'm having trouble right now. Please try again shortly."

    # Save AI message
    ai_message = ChatMessage(
        chat_id=chat_id,
        user_id=current_user.id,
        message=ai_text,
        role="ai",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)

    # Update chat title from first user message
    if chat.title == "New Chat":
        chat.title = message_text[:40] + ("..." if len(message_text) > 40 else "")

    db.commit()

    return {"user_message": message_text, "ai_message": ai_text}


# DELETE CHAT
@router.delete("/delete-chat/{chat_id}")
async def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Delete messages first
    db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).delete()
    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted"}
