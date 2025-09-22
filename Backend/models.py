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

# class research_papers(Base):
#     __tablename__= "research_papers"
#     paper_id=Column(Integer,primary_key=True)
#     title = Column(String(100))
#     abstract = Column(Text)
#     summary = Column(Text)
#     publication_date = Column(Date)
#     pdf_url = Column(String(200))
#     created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)


class research_papers(Base):
    __tablename__ = "research_papers"
    paper_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)  # Increased length
    authors = Column(JSON, nullable=False)  # New field for authors array
    domain = Column(String(100), nullable=False)  # New field
    category = Column(String(100), nullable=False)  # New field
    abstract = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=False)  # New field for keywords array
    publication_date = Column(Date, nullable=False)  # Keep existing
    pdf_url = Column(String(500))  # Increased length for URLs
    summary = Column(Text)  # Keep if you want to generate this later
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)
