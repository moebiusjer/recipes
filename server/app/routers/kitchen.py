from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

from app import models, schemas, auth




router = APIRouter(prefix = "/kitchen", tags = ["kitchen"])




def format_out(item, db):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == item.ingredient_id).first()
    
    if not ing:
        return None
    
    
    return schemas.KitchenItemOut(
        id = item.id,
        status = item.status,
        quantity_text = item.quantity_text,
        is_checked = item.is_checked,
        ingredient = schemas.IngredientOut.model_validate(ing),
    )



def get_my_item(item_id, user, db):
    item = db.query(models.UserIngredient).filter(models.UserIngredient.id == item_id, models.UserIngredient.user_id == user.id,).first()
    
    if not item:
        raise HTTPException(404, "item not found")
    return item



@router.get("", response_model = list[schemas.KitchenItemOut])

def list_items(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    items = db.query(models.UserIngredient).filter(models.UserIngredient.user_id == user.id).all()
    return [out for out in (format_out(i, db) for i in items) if out is not None]








@router.post("", response_model = schemas.KitchenItemOut)

def add_item(data: schemas.KitchenItemIn, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    if data.status not in ("have", "shopping"):
        raise HTTPException(400, "status must be 'have' or 'shopping'")

    item = models.UserIngredient(
        user_id = user.id,
        ingredient_id = data.ingredient_id,
        status = data.status,
        quantity_text = data.quantity_text,
    )
    
    db.add(item)
    db.commit()
    db.refresh(item)
    return format_out(item, db)




@router.put("/{item_id}", response_model = schemas.KitchenItemOut)

def update_item(item_id: int, data: schemas.KitchenItemUpdate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    item = get_my_item(item_id, user, db)

    if data.quantity_text is not None:
        item.quantity_text = data.quantity_text
    if data.is_checked is not None:
        item.is_checked = data.is_checked
    if data.status is not None:
        item.status = data.status

    db.commit()
    db.refresh(item)
    return format_out(item, db)


@router.delete("/{item_id}")

def delete_item(item_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    item = get_my_item(item_id, user, db)
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.post("/move-checked")

def move_checked_to_have(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    items = db.query(models.UserIngredient).filter(models.UserIngredient.user_id == user.id, models.UserIngredient.status == "shopping", models.UserIngredient.is_checked == True).all()

    for item in items:
        item.status = "have"
        item.is_checked = False
    db.commit()
    return {"moved": len(items)}


@router.delete("/clear")

def clear_items(status: str | None = None, only_checked: bool = False, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    query = db.query(models.UserIngredient).filter(models.UserIngredient.user_id == user.id)
    
    if status:
        query = query.filter(models.UserIngredient.status == status)
    if only_checked:
        query = query.filter(models.UserIngredient.is_checked == True)

    deleted = query.delete()
    db.commit()
    return {"deleted": deleted}