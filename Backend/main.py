import re
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
import fitz 

app= FastAPI()
app.include_router(auth.router)
app.include_router(paper_router)
app.include_router(analytics_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                    "https://research-papaer-data-base-managemen.vercel.app",
                    "https://frontend.pruthvirajgawande.dev"],  # React app URLs
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


# main.py (add this new endpoint)
@app.post("/validate-pdf/")
async def validate_pdf(
    user: user_dependency, 
    file: UploadFile = File(...),
    pdf_url: str = None,
    skip_validation: bool = False  # Optional flag to skip validation (use with caution)
):
    """
    Validate if a PDF is a research paper before processing
    """
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text and validate
        processor = ResearchProcessor()
        text = processor.extract_text_from_pdf(file_content)
        is_research_paper = processor.validate_research_paper(text)
        
        # Get additional info about the PDF
        doc = fitz.open(stream=file_content, filetype="pdf")
        page_count = len(doc)
        doc.close()
        
        # Check for common indicators
        text_lower = text.lower()
        indicators = {
            'has_abstract': bool(re.search(r'abstract', text_lower)),
            'has_introduction': bool(re.search(r'introduction', text_lower)),
            'has_references': bool(re.search(r'references', text_lower)),
            'has_doi': bool(re.search(r'doi:', text_lower)),
            'has_academic_structure': len(re.findall(r'\b(abstract|introduction|methodology|results|discussion|conclusion|references)\b', text_lower)) >= 3
        }
        
        return {
            "is_research_paper": is_research_paper,
            "page_count": page_count,
            "text_length": len(text),
            "validation_indicators": indicators,
            "recommendation": "Proceed with processing" if is_research_paper else "This PDF may not be a research paper"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Validation failed: {str(e)}"
        )



# main.py (updated process_research_paper endpoint)
@app.post("/process-research-paper/")
async def process_research_paper(
    user: user_dependency, 
    db: db_dependency,
    file: UploadFile = File(...),
    pdf_url: str = None,
    skip_validation: bool = False  # Optional flag to skip validation (use with caution)
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
        
        # Skip validation if explicitly requested (for edge cases)
        if not skip_validation:
            text = processor.extract_text_from_pdf(file_content)
            if not processor.validate_research_paper(text):
                # Provide detailed feedback
                doc = fitz.open(stream=file_content, filetype="pdf")
                page_count = len(doc)
                doc.close()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": "Not a research paper",
                        "message": "The uploaded PDF does not appear to be a valid research paper. Please upload academic research papers only.",
                        "page_count": page_count,
                        "suggestion": "Use /validate-pdf/ endpoint first to check if your PDF is suitable"
                    }
                )
        
        result = processor.process_research_paper(file_content, file.filename)
        
        # Validate that required fields are present
        required_fields = ['title', 'abstract', 'summary', 'authors', 'domain', 'category']
        missing_fields = [field for field in required_fields if not result.get(field)]
        
        if missing_fields and not skip_validation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Incomplete research paper",
                    "missing_fields": missing_fields,
                    "message": "The PDF appears to be missing key research paper components"
                }
            )
        
        # Convert publication_date string to date object if available
        publication_date = None
        if 'publication_date' in result and result['publication_date']:
            try:
                publication_date = datetime.strptime(result['publication_date'], '%Y-%m-%d').date()
            except:
                # Try other date formats if needed
                try:
                    # Try to extract year if full date not available
                    year_match = re.search(r'(\d{4})', result['publication_date'])
                    if year_match:
                        publication_date = datetime(int(year_match.group(1)), 1, 1).date()
                except:
                    publication_date = None
        
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
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Processing failed: {str(e)}"
        )