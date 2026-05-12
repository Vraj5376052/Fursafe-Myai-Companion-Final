from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.core.database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    chat_id = Column(Integer, nullable=True)
    raw_text = Column(Text)
    ai_explanation = Column(String(255))
    created_at = Column(DateTime, default=datetime.now(timezone.utc))