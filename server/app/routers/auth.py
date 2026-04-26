from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth







router = APIRouter(prefix="/auth", tags=["auth"])



@router.post("/signup")
def signup(data: schemas.SignupIn, db: Session = Depends(get_db)):
    taken = db.query(models.User).filter((models.User.email == data.email) | (models.User.username == data.username)).first()
    
    if taken:
        raise HTTPException(400, "username or email already taken")

    user = models.User(
        username=data.username,
        email=data.email,
        password_hash=auth.hash_password(data.password),
    )
    
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"access_token": auth.create_token(user.id), "token_type": "bearer"}



@router.post("/login")
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    if not user or not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(401, "wrong email or password")
    
    return {"access_token": auth.create_token(user.id), "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(auth.get_current_user)):
    return user