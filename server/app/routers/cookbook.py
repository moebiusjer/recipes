from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas, auth



router = APIRouter(prefix = "/cookbook", tags = ["cookbook"])


def top_ingredient_names(recipe_ids, db, limit=5):
    
    if not recipe_ids:
        return []
    
    
    rows = (db.query(models.Ingredient.display_name)
        .join(models.RecipeIngredient, models.RecipeIngredient.ingredient_id == models.Ingredient.id)
        .filter(models.RecipeIngredient.recipe_id.in_(recipe_ids))
        .group_by(models.Ingredient.display_name)
        .order_by(func.count(models.RecipeIngredient.id).desc())
        .limit(limit)
        .all()
    )
    return [i[0] for i in rows]




@router.get("", response_model=schemas.CookbookOut)

def get_cookbook(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    
    saved_ids = [s.recipe_id for s in db.query(models.Cookbook).filter(models.Cookbook.user_id == user.id).all()]
    
    saved = db.query(models.Recipe).filter(models.Recipe.id.in_(saved_ids)).all() if saved_ids else []
    posted = db.query(models.Recipe).filter(models.Recipe.author_id == user.id).all()


    return schemas.CookbookOut(
        saved=[schemas.RecipeShort.model_validate(i) for i in saved],
        posted=[schemas.RecipeShort.model_validate(i) for i in posted],
        stats=schemas.CookbookStats(saved_count=len(saved), posted_count=len(posted), top_ingredients_saved=top_ingredient_names(saved_ids, db), top_ingredients_posted=top_ingredient_names([i.id for i in posted], db),)
    )


@router.post("/{recipe_id}")

def save_recipe(recipe_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(404, "recipe not found")

    existing = db.query(models.Cookbook).filter(models.Cookbook.user_id == user.id, models.Cookbook.recipe_id == recipe_id).first()
    
    if existing:
        return {"ok": True}

    db.add(models.Cookbook(user_id=user.id, recipe_id=recipe_id))
    db.commit()
    return {"ok": True}


@router.delete("/{recipe_id}")

def unsave_recipe(recipe_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    entry = db.query(models.Cookbook).filter(models.Cookbook.user_id == user.id, models.Cookbook.recipe_id == recipe_id).first()
    
    if not entry:
        raise HTTPException(404, "not in cookbook")

    db.delete(entry)
    db.commit()
    return {"ok": True}