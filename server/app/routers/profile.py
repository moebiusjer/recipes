from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth




router = APIRouter(prefix = "/profile", tags = ["profile"])





@router.get("", response_model=schemas.ProfileOut)

def get_profile(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    posted = db.query(models.Recipe).filter(models.Recipe.author_id == user.id).count()
    saved = db.query(models.Cookbook).filter(models.Cookbook.user_id == user.id).count()
    pantry = db.query(models.UserIngredient).filter(models.UserIngredient.user_id == user.id).count()
    comments = db.query(models.Comment).filter(models.Comment.user_id == user.id).count()


    return schemas.ProfileOut(
        id = user.id,
        username = user.username,
        email = user.email,
        avatar_url = user.avatar_url,
        posted_count = posted,
        saved_count = saved,
        pantry_count = pantry,
        comments_count = comments,
        )




@router.put("", response_model = schemas.UserOut)

def update_profile(data: schemas.ProfileUpdate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user),):
    
    if data.username is not None:
        taken = db.query(models.User).filter(models.User.username == data.username, models.User.id != user.id,).first()
        
        if taken:
            raise HTTPException(400, "the username is already taken")
        user.username = data.username

    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    db.commit()
    db.refresh(user)
    return user


@router.put("/password")

def update_password( data: schemas.PasswordUpdate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    if not auth.verify_password(data.old_password, user.password_hash):
        raise HTTPException(400, "wrong current password")

    user.password_hash = auth.hash_password(data.new_password)
    db.commit()
    return {"ok": True}