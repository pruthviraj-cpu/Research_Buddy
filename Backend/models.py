from database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, String, Date, TIMESTAMP,func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

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
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)

#     authors = relationship("Author", back_populates="paper", cascade="all, delete-orphan")
#     keywords = relationship("Keyword", back_populates="paper", cascade="all, delete-orphan")

# class Author(Base):
#     __tablename__ = "authors"

#     author_id = Column(Integer, primary_key=True)
#     paper_id = Column(Integer, ForeignKey("research_papers_test.paper_id", ondelete="CASCADE"), nullable=False)
#     name = Column(String(255), nullable=False)

#     paper = relationship("research_papers_test", back_populates="authors")


# class Keyword(Base):
#     __tablename__ = "keywords"

#     keyword_id = Column(Integer, primary_key=True)
#     paper_id = Column(Integer, ForeignKey("research_papers_test.paper_id", ondelete="CASCADE"), nullable=False)
#     keywords = Column(String(100), nullable=False)
#     created_at = Column(String, default="now()")

#     paper = relationship("research_papers_test", back_populates="keywords")