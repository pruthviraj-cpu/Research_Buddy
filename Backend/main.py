from fastapi import FastAPI, Depends,status,HTTPException, File, UploadFile
import models2
from datafile import engine, SessionLocal
from typing import Annotated
from sqlalchemy.orm import Session
from auth import get_current_user
from paper_routes import paper_router
from analytics_routes import analytics_router
import auth
from research_processor import ResearchProcessor
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app= FastAPI()
app.include_router(auth.router)
app.include_router(paper_router)
app.include_router(analytics_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                    "https://research-papaer-data-base-managemen.vercel.app"],  # React app URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models2.Base.metadata.create_all(bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db:db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or Auth failed")
    return { "user": user}

# Add new endpoint for research paper processing
@app.post("/process-research-paper/")
async def process_research_paper(
    user: user_dependency, 
    db: db_dependency,
    file: UploadFile = File(...),
    pdf_url: str = None
):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Process the research paper
        processor = ResearchProcessor()
        result = processor.process_research_paper(file_content, file.filename)
        
        # Convert publication_date string to date object if available
        publication_date = None
        if 'publication_date' in result and result['publication_date']:
            try:
                publication_date = datetime.strptime(result['publication_date'], '%Y-%m-%d').date()
            except:
                # Try other date formats if needed
                publication_date = None
                pass
        
        # Save to database with all fields
        db_paper = models2.research_papers_test(
            title=result.get('title', 'Unknown Title'),
            abstract=result.get('abstract', ''),
            summary=result.get('summary', ''),
            authors=result.get('authors', []),
            domain=result.get('domain', ''),
            category=result.get('category', ''),
            keywords=result.get('keywords', []),
            publication_date=publication_date,
            pdf_url=pdf_url,
        )
        db.add(db_paper)
        db.commit()
        db.refresh(db_paper)
        
        # Return both the database record and the full analysis
        return {
            "database_record": {
                "paper_id": db_paper.paper_id,
                "title": db_paper.title,
                "publication_date": db_paper.publication_date,
                "created_at": db_paper.created_at
            },
            "full_analysis": result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Processing failed: {str(e)}"
        )