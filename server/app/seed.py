import requests
from app.database import SessionLocal, engine, Base
from app import models


def normalize(text):
    return text.lower().split(",")[0].strip().replace(" ", "_")

def de_normalize(text):
    return text.split(",")[0].strip().title()



def seed():
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    data = requests.get("https://dummyjson.com/recipes?limit=0").json()
    recipes = data["recipes"]
    ingredient_map = {}
    tag_map = {}
    meal_map = {}
    
    for r in recipes:
        for ing in r["ingredients"]:
            key = normalize(ing)
            if key and key not in ingredient_map:
                ingredient_map[key] = models.Ingredient(
                    name=key,
                    display_name=de_normalize(ing),
                    category="other",
                )
        for t in r["tags"]:
            if t not in tag_map:
                tag_map[t] = models.Tag(name=t)
        for m in r["mealType"]:
            if m not in meal_map:
                meal_map[m] = models.MealType(name=m)
                
                
    db = SessionLocal()
    db.add_all(ingredient_map.values())
    db.add_all(tag_map.values())
    db.add_all(meal_map.values())
    db.commit()
    

    for r in recipes:
        
        
        recipe = models.Recipe(
            name=r["name"],
            image_url=r.get("image"),
            cuisine=r.get("cuisine"),
            difficulty=r.get("difficulty"),
            prep_time_minutes=r.get("prepTimeMinutes"),
            cook_time_minutes=r.get("cookTimeMinutes"),
            servings=r.get("servings"),
            calories_per_serving=r.get("caloriesPerServing"),
            rating=r.get("rating"),
            review_count=r.get("reviewCount", 0),
            is_community=False,
        )
        
        db.add(recipe)
        db.flush()

        for i, ing in enumerate(r["ingredients"]):
            key = normalize(ing)
            db.add(models.RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient_map[key].id,
                original_text=ing,
                display_order=i,
            ))

        for i, step in enumerate(r["instructions"]):
            db.add(models.RecipeInstruction(
                recipe_id=recipe.id,
                step_number=i + 1,
                text=step,
            ))


        for t in r["tags"]:
            db.add(models.RecipeTag(recipe_id=recipe.id, tag_id=tag_map[t].id))


        for m in r["mealType"]:
            db.add(models.RecipeMealType(recipe_id=recipe.id, meal_type_id=meal_map[m].id))



    db.commit()
    print(f"seeded succesfukly with {len(recipes)} recipes")
    db.close()



if __name__ == "__main__":
    seed()