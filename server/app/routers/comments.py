from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth




router = APIRouter(tags=["comments"])




def format_out(comment, db):
    
    user = db.query(models.User).filter(models.User.id == comment.user_id).first()
    
    return schemas.CommentOut(
        id = comment.id,
        body = comment.body,
        user_id = comment.user_id,
        username = user.username if user else "deleted",
        created_at = comment.created_at
    )



def get_my_comment(comment_id, user, db):
    
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(404, "comment not found")
    if comment.user_id != user.id:
        raise HTTPException(403, "comment does not belong to the user")
    return comment



@router.get("/recipes/{recipe_id}/comments", response_model=list[schemas.CommentOut])

def list_comments(recipe_id: int, db: Session = Depends(get_db)):
    
    comments = db.query(models.Comment).filter(models.Comment.recipe_id == recipe_id).order_by(models.Comment.created_at.desc()).all()
    
    return [format_out(i, db) for i in comments]


@router.post("/recipes/{recipe_id}/comments", response_model=schemas.CommentOut)

def add_comment(recipe_id: int, data: schemas.CommentIn, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(404, "recipe not found")
    
    comment = models.Comment(recipe_id=recipe_id, user_id=user.id, body=data.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return format_out(comment, db)


@router.put("/comments/{comment_id}", response_model=schemas.CommentOut)

def edit_comment(comment_id: int, data: schemas.CommentIn, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    comment = get_my_comment(comment_id, user, db)
    comment.body = data.body
    db.commit()
    db.refresh(comment)
    return format_out(comment, db)


@router.delete("/comments/{comment_id}")

def delete_comment(comment_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    comment = get_my_comment(comment_id, user, db)
    db.delete(comment)
    db.commit()
    return {"ok": True} 