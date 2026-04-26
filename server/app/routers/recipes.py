from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas, auth




router = APIRouter(prefix = "/recipes", tags = ["recipes"])



def normalize_name(text):
    return text.lower().split(",")[0].strip().replace(" ", "_")


def build_full(recipe, db):
    
    recipe_ings = db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == recipe.id).order_by(models.RecipeIngredient.display_order).all()

    ing_ids = [i.ingredient_id for i in recipe_ings]
    
    ings_by_id = {i.id: i for i in db.query(models.Ingredient).filter(models.Ingredient.id.in_(ing_ids)).all()}


    ingredients = [
        schemas.RecipeIngredientOut(
            original_text = i .original_text,
            quantity_text = i.quantity_text,
            ingredient = schemas.IngredientOut.model_validate(ings_by_id[i.ingredient_id]),
        )
        for i in recipe_ings
    ]

    instructions = db.query(models.RecipeInstruction).filter(models.RecipeInstruction.recipe_id == recipe.id).order_by(models.RecipeInstruction.step_number).all()
    tag_names = [i.name for i in db.query(models.Tag).join(models.RecipeTag, models.RecipeTag.tag_id == models.Tag.id).filter(models.RecipeTag.recipe_id == recipe.id).all()]
    meal_names = [i.name for i in db.query(models.MealType).join(models.RecipeMealType, models.RecipeMealType.meal_type_id == models.MealType.id).filter(models.RecipeMealType.recipe_id == recipe.id).all()]

    return schemas.RecipeFull(
        id = recipe.id,
        name = recipe.name,
        image_url = recipe.image_url,
        cuisine = recipe.cuisine,
        difficulty = recipe.difficulty,
        rating = float(recipe.rating) if recipe.rating else None,
        review_count = recipe.review_count,
        prep_time_minutes = recipe.prep_time_minutes,
        cook_time_minutes = recipe.cook_time_minutes,
        servings = recipe.servings,
        calories_per_serving = recipe.calories_per_serving,
        author_id = recipe.author_id,
        ingredients = ingredients,
        instructions = [schemas.RecipeInstructionOut.model_validate(u) for u in instructions],
        tags = tag_names,
        meal_types = meal_names,
    )


def get_or_create(db, model, name):
    
    obj = db.query(model).filter(model.name == name).first()
    
    if obj:
        return obj
    
    obj = model(name=name) if model is not models.Ingredient else model(
        name = name,
        display_name = name.replace("_", " ").title(),
        category = "other",
    )
    
    db.add(obj)
    db.flush()
    return obj



def attach_children(recipe, data, db):
    for i, text in enumerate(data.ingredients):
        
        key = normalize_name(text)
        ing = db.query(models.Ingredient).filter(models.Ingredient.name == key).first()
        
        if not ing:
            ing = models.Ingredient(
                name = key,
                display_name = text.split(",")[0].strip().title(),
                category = "other",
            )
            
            db.add(ing)
            db.flush()
            
        db.add(models.RecipeIngredient(recipe_id=recipe.id, ingredient_id=ing.id, original_text=text, display_order=i))


    for i, step in enumerate(data.instructions):
        db.add(models.RecipeInstruction(recipe_id=recipe.id, step_number=i + 1, text=step))


    for tag_name in data.tags:
        tag = get_or_create(db, models.Tag, tag_name)
        db.add(models.RecipeTag(recipe_id=recipe.id, tag_id=tag.id))


    for meal_name in data.meal_types:
        meal = get_or_create(db, models.MealType, meal_name)
        db.add(models.RecipeMealType(recipe_id=recipe.id, meal_type_id=meal.id))




def clear_children(recipe_id, db):
    db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == recipe_id).delete()
    db.query(models.RecipeInstruction).filter(models.RecipeInstruction.recipe_id == recipe_id).delete()
    db.query(models.RecipeTag).filter(models.RecipeTag.recipe_id == recipe_id).delete()
    db.query(models.RecipeMealType).filter(models.RecipeMealType.recipe_id == recipe_id).delete()


def get_owned_recipe(recipe_id, user, db):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(404, "recipe not found")
    if recipe.author_id != user.id:
        raise HTTPException(403, "not your recipe")
    return recipe


@router.get("", response_model=list[schemas.RecipeShort])

def list_recipes(q: str | None = None, cuisine: str | None = None, difficulty: str | None = None, db: Session = Depends(get_db)):
    
    query = db.query(models.Recipe)
    
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Recipe.name.ilike(like), models.Recipe.cuisine.ilike(like)))
        
    if cuisine:
        query = query.filter(models.Recipe.cuisine == cuisine)
    if difficulty:
        query = query.filter(models.Recipe.difficulty == difficulty)
    return query.all()


@router.get("/{recipe_id}", response_model=schemas.RecipeFull)

def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(404, "recipe not found")
    return build_full(recipe, db)


@router.post("", response_model=schemas.RecipeFull) 

def create_recipe(data: schemas.RecipeIn, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    recipe = models.Recipe(
        name = data.name,
        image_url = data.image_url,
        cuisine = data.cuisine,
        difficulty = data.difficulty,
        prep_time_minutes = data.prep_time_minutes,
        cook_time_minutes = data.cook_time_minutes,
        servings = data.servings,
        calories_per_serving = data.calories_per_serving,
        author_id = user.id,
        is_community = True,
    )
    
    db.add(recipe)
    db.flush()
    attach_children(recipe, data, db)
    db.commit()
    return build_full(recipe, db)


@router.put("/{recipe_id}", response_model = schemas.RecipeFull)

def update_recipe(recipe_id: int, data: schemas.RecipeIn, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    recipe = get_owned_recipe(recipe_id, user, db)

    recipe.name = data.name
    recipe.image_url = data.image_url
    recipe.cuisine = data.cuisine
    recipe.difficulty = data.difficulty
    recipe.prep_time_minutes = data.prep_time_minutes
    recipe.cook_time_minutes = data.cook_time_minutes
    recipe.servings = data.servings
    recipe.calories_per_serving = data.calories_per_serving

    clear_children(recipe.id, db)
    attach_children(recipe, data, db)
    db.commit()
    return build_full(recipe, db)


@router.delete("/{recipe_id}")

def delete_recipe(recipe_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    
    recipe = get_owned_recipe(recipe_id, user, db)
    clear_children(recipe.id, db)
    db.delete(recipe)
    db.commit()
    
    return {"ok": True}