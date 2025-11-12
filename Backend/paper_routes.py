from fastapi import APIRouter,status,Depends, UploadFile, File, Form, Query,HTTPException
from typing import Optional
from auth import get_current_user
from database import SessionLocal
from sqlalchemy.orm import Session
from models import research_papers_test
from typing import Annotated, List
import json
import models
from schemas import PaperUpdate

paper_router = APIRouter(
    prefix='/papers',
    tags=['papers']
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

user_dependency = Annotated[dict, Depends(get_current_user)]

@paper_router.post('/add-paper', status_code=status.HTTP_201_CREATED)
async def add_paper(
    db: Annotated[Session, Depends(get_db)],
    title: str = Form(...),
    authors: str = Form(...), 
    domain: str = Form(...),
    category: str = Form(...),
    publishDate: str = Form(...), 
    abstract: str = Form(...),
    summary: str = Form(...),
    keywords: str = Form(...), 
    pdfUrl: str = Form(...) 
):
    authors_list = json.loads(authors)
    keywords_list = json.loads(keywords)
    
    new_paper = research_papers_test(
        title=title,
        authors=authors_list, 
        domain=domain,
        category=category,
        publication_date=publishDate,
        abstract=abstract,
        summary=summary,
        keywords=keywords_list,
        pdf_url=pdfUrl
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return new_paper


# Endpoint to get research papers
@paper_router.get("/research-papers")
async def get_research_papers(user: user_dependency,db: Annotated[Session, Depends(get_db)],):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    papers = db.query(models.research_papers_test).all()
    return {"papers": papers}

# # Endpoint to get specific research paper
@paper_router.get("/research-papers/{paper_id}")
async def get_research_paper(paper_id: int, user: user_dependency, db: Annotated[Session, Depends(get_db)],):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    paper = db.query(models.research_papers_test).filter(models.research_papers_test.paper_id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
    
    return {"paper": paper}

# # route to edit paper
@paper_router.put("/update-paper/{paper_id}")
async def update_paper(
    paper_id: int,
    payload: PaperUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: user_dependency,
):
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )

    paper = (
        db.query(research_papers_test)
        .filter(research_papers_test.paper_id == paper_id)
        .first()
    )

    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    paper.title = payload.title
    paper.authors = payload.authors
    paper.domain = payload.domain
    paper.category = payload.category
    paper.abstract = payload.abstract
    paper.summary = payload.summary
    paper.keywords = payload.keywords
    paper.publication_date = payload.publication_date 
    paper.pdf_url = str(payload.pdf_url)
    paper.summary = payload.summary

    db.commit()
    db.refresh(paper)

    return {"message": "Paper updated successfully", "paper_id": paper_id}


# route to delete paper
@paper_router.delete("/delete-paper/{paper_id}")
async def delete_paper(paper_id: int, user: user_dependency, db: Annotated[Session, Depends(get_db)],):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    paper = (
        db.query(research_papers_test)
        .filter(research_papers_test.paper_id == paper_id)
        .first()
    )
    
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
    
    db.delete(paper)
    db.commit()

    if db.query(research_papers_test).filter_by(paper_id=paper_id).first():
        raise HTTPException(status_code=500, detail="Failed to delete paper")

    return {"message": "Paper deleted successfully", "paper_id": paper_id}
