# from pydantic import BaseModel, HttpUrl
# from typing import List, Optional
# from datetime import date


# class PaperUpdate(BaseModel):
#     title: str
#     authors: List[str]
#     domain: str
#     category: str
#     publish_date: str
#     abstract: str
#     keywords: List[str]
#     pdf_url: HttpUrl

# class AuthorBase(BaseModel):
#     name: str

# class KeywordBase(BaseModel):
#     keywords: str

# class PaperBase(BaseModel):
#     paper_id: int
#     title: str
#     domain: Optional[str]
#     category: Optional[str]
#     abstract: str
#     publication_date: Optional[date]
#     pdf_url: Optional[str]
#     authors: List[AuthorBase] = []
#     keywords: List[KeywordBase] = []

#     class Config:
#         orm_mode = True