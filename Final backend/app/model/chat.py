from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    messages = relationship("ChatMessage", back_populates="chat")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), index=True)
    user_id = Column(Integer, index=True)
    message = Column(String(1000), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    role = Column(String(50), nullable=False)  # e.g., "user" or "assistant"
    chat = relationship("Chat", back_populates="messages")

