from pydantic import BaseModel 
from app.schemas.recipe import RecipeShort








#schemas for cookbook



class CookbookStats(BaseModel):
    saved_count: int
    posted_count: int
    
    top_ingredients_saved: list[str] = []
    top_ingredients_posted: list[str] = []



class CookbookOut(BaseModel):
    saved: list[RecipeShort]
    posted: list[RecipeShort]
    stats: CookbookStats