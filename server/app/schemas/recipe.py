from pydantic import BaseModel

from app.schemas.ingredient import IngredientOut






#scehmas fro recepies 
class RecipeIngredientOut(BaseModel):
    original_text: str
    quantity_text: str | None = None
    ingredient: IngredientOut
    class Config:
        from_attributes = True



class RecipeInstructionOut(BaseModel):
    step_number: int
    text: str
    
    class Config:
        from_attributes = True



class RecipeShort(BaseModel):
    id: int
    name: str
    image_url: str | None = None
    cuisine: str | None = None
    difficulty: str | None = None
    rating: float | None = None
    review_count: int
    cook_time_minutes: int | None = None
    servings: int | None = None
    class Config:
        from_attributes = True




class RecipeFull(RecipeShort):
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    servings: int | None = None
    calories_per_serving: int | None = None
    author_id: int | None = None
    ingredients: list[RecipeIngredientOut] = []
    instructions: list[RecipeInstructionOut] = []
    tags: list[str] = []
    meal_types: list[str] = []




class RecipeIn(BaseModel):
    
    name: str
    image_url: str | None = None
    cuisine: str | None = None
    difficulty: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int| None = None
    servings: int | None = None
    calories_per_serving: int | None = None
    ingredients: list[str]
    instructions: list[str]
    tags: list[str] = []
    meal_types: list[str] = []