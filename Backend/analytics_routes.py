from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from database import SessionLocal
from models import PaperAction
from auth import get_current_user

analytics_router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

user_dependency = Annotated[dict, Depends(get_current_user)]

@analytics_router.get("/paper-actions")
async def get_paper_actions(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    actions = db.query(PaperAction).order_by(PaperAction.timestamp.desc()).all()

    return [
        {
            "paper_id": a.paper_id,
            "paper_title": a.paper_title,
            "action": a.action,
            "user": a.user,
            "timestamp": a.timestamp.isoformat(),
            "notes": a.notes or "",
        }
        for a in actions
    ]