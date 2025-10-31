from database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, String, Date, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSON

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)  
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False) 

class research_papers_test(Base):
    __tablename__ = "research_papers_test"
    paper_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    authors = Column(JSON, nullable=True)  # Made nullable
    domain = Column(String(100), nullable=True)  # Made nullable
    category = Column(String(100), nullable=True)  # Made nullable
    abstract = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=True)  # Made nullable
    publication_date = Column(Date, nullable=True)  # Made nullable
    pdf_url = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    publication_venue = Column(String(255), nullable=True)  # New field
    region = Column(String(100), nullable=True)  # New field
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)