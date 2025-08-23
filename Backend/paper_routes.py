from fastapi import APIRouter,status,Depends, UploadFile, File, Form, Query
from typing import Optional
from database import SessionLocal
from sqlalchemy.orm import Session
from models import research_papers
from typing import Annotated

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


@paper_router.post('/add-paper', status_code=status.HTTP_201_CREATED)
async def add_paper(
    db: Annotated[Session, Depends(get_db)],
    title: str = Form(...),
    abstract: str = Form(...),
    summary: Optional[str] = Form(None),
    publication_date: Optional[str] = Form(None),
    pdf_url: Optional[UploadFile] = File(None)
):
    # Save uploaded pdf to disk
    upload_dir = "C:/Users/hp/Desktop/AI_RPMS/uploads" # Enter your PC path
    pdf_path = f"{upload_dir}/{pdf_url.filename}"

    with open(pdf_path, "wb") as buffer:
        buffer.write(await pdf_url.read())

    new_paper = research_papers(
        title=title,
        abstract=abstract,
        summary=summary,
        publication_date=publication_date,
        pdf_url=pdf_path
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return new_paper

