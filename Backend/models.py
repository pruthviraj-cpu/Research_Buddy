from database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, String, Date, TIMESTAMP

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)  
    hashed_password = Column(String)

class Admins(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)  
    hashed_password = Column(String)

class research_papers(Base):
    __tablename__= "research_papers"
    paper_id=Column(Integer,primary_key=True)
    title = Column(String(100))
    abstract = Column(Text)
    summary = Column(Text)
    publication_date = Column(Date)
    pdf_url = Column(String(200))
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)
