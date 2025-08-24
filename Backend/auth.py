from datetime import timedelta, datetime
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal, engine
from models import Users, Admins
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from dotenv import load_dotenv
import os
load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set in environment variables")
    

ADMIN_SECRET_PASSWORD = os.getenv("ADMIN_SECRET_PASSWORD")  

ALGORITHM = "HS256"

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

class CreateUserRequest(BaseModel):
    username: str
    password: str

class CreateAdminRequest(BaseModel):
    username: str
    password: str
    admin_secret: str  

class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/User", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    # Check if username already exists
    existing_user = db.query(Users).filter(Users.username == create_user_request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    create_user_model = Users(
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password),
    )
    db.add(create_user_model)
    db.commit()

@router.post("/Admin", status_code=status.HTTP_201_CREATED)
async def create_admin(db: db_dependency, create_admin_request: CreateAdminRequest):
    # Verify the admin secret password
    if create_admin_request.admin_secret != ADMIN_SECRET_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin secret password"
        )
    
    # Check if admin username already exists
    existing_admin = db.query(Admins).filter(Admins.username == create_admin_request.username).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin username already exists"
        )
    
    create_admin_model = Admins(
        username=create_admin_request.username,
        hashed_password=bcrypt_context.hash(create_admin_request.password),
    )
    db.add(create_admin_model)
    db.commit()
    return {"message": "Admin created successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    # First try to authenticate as a user
    user = authenticate_user(form_data.username, form_data.password, db)
    if user:
        token = create_access_token(user.username, user.id, timedelta(minutes=20), "user")
        return {'access_token': token, 'token_type': 'bearer'}
    
    # If not a user, try to authenticate as an admin
    admin = authenticate_admin(form_data.username, form_data.password, db)
    if admin:
        token = create_access_token(admin.username, admin.id, timedelta(minutes=20), "admin")
        return {'access_token': token, 'token_type': 'bearer'}
    
    # If neither user nor admin, raise error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

def authenticate_user(username: str, password: str, db):
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def authenticate_admin(username: str, password: str, db):
    admin = db.query(Admins).filter(Admins.username == username).first()
    if not admin:
        return False
    if not bcrypt_context.verify(password, admin.hashed_password):
        return False
    return admin

def create_access_token(username: str, user_id: int, expires_delta: timedelta, role: str):
    encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        
        if username is None or user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username, "id": user_id, "role": role}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_admin(current_user: Annotated[dict, Depends(get_current_user)]):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/admin/dashboard")
async def admin_dashboard(current_admin: Annotated[dict, Depends(get_current_admin)]):
    return {"message": f"Welcome to the admin dashboard, {current_admin['username']}!"}