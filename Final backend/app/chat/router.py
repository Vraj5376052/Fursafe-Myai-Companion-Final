import os
import requests as req
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.model.chat import Chat, ChatMessage
from app.model.user import User
from datetime import datetime, timezone
from app.auth.router import get_current_user

router = APIRouter()

# System prompt for the AI — keeps responses safe and patient-appropriate
SYSTEM_PROMPT = (
    "You are MyAI Companion, a supportive assistant for patients in healthcare settings. "
    "Your ONLY role is to listen to what the user describes and provide a clear, plain-language summary. "
    "\n\nSTRICT RULES:\n"
    "- NEVER provide a medical diagnosis, clinical advice, or treatment recommendations.\n"
    "- NEVER suggest medications, dosages, or any form of treatment.\n"
    "- ONLY summarise and simplify what the user has shared in plain, easy-to-understand language.\n"
    "- Always end with a gentle reminder to speak with their healthcare professional.\n"
    "- Keep responses short, calm, and reassuring — suitable for elderly or stressed patients.\n"
    "- Use simple words. Avoid medical jargon."
)


@router.get("/fetch-chats")
async def fetch_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is fetching their chat list.")

    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()).all()

    # Return serialised list so SQLAlchemy objects don't cause issues
    return [
        {"id": c.id, "title": c.title, "created_at": str(c.created_at)}
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
        "title": chat.title,
        "messages": [
            {"id": m.id, "role": m.role, "message": m.message, "timestamp": str(m.timestamp)}
            for m in messages
        ]
    }


@router.post("/create-chat")
async def create_chat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"[DEBUG] User {current_user.id} is creating a new chat.")

    new_chat = Chat(
        title="New Chat",
        user_id=current_user.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    print(f"[DEBUG] Successfully created Chat ID {new_chat.id} for User {current_user.id}.")
    return {"chatId": new_chat.id, "title": new_chat.title, "created_at": str(new_chat.created_at)}


@router.post("/add-chat/{chat_id}")
async def add_chat(chat_id: int, request: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    message_text = request.get("message", "").strip()
    print(f"[DEBUG] User {current_user.id} is sending a message to chat {chat_id}.")

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
        message=message_text,
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
        messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in past_messages:
            role = "user" if msg.role == "user" else "assistant"
            messages_payload.append({"role": role, "content": msg.message})
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
        message=ai_text,
        role="ai",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)

    # Update chat title from first message
    if chat.title == "New Chat":
        chat.title = message_text[:40] + ("..." if len(message_text) > 40 else "")

    db.commit()

    print(f"[DEBUG] Chat {chat_id} updated with AI response for User {current_user.id}.")
    return {"user_message": user_message.message, "ai_message": ai_text}


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
