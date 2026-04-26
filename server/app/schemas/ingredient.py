from pydantic import BaseModel



#schemas for ingredients
class IngredientOut(BaseModel):
    id: int
    name: str
    display_name: str
    category: str | None = None
    
    class Config:
        from_attributes = True