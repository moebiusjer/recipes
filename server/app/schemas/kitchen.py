

from pydantic import BaseModel
from app.schemas.ingredient import IngredientOut





#kitchen
class KitchenItemIn(BaseModel):
    
    ingredient_id: int
    status: str  #should be ether have or shoping 
    quantity_text: str | None = None





class KitchenItemUpdate(BaseModel):
    quantity_text: str | None = None
    is_checked: bool | None = None
    status: str | None = None



class KitchenItemOut(BaseModel):
    id: int
    status: str
    quantity_text: str | None = None
    is_checked: bool
    ingredient: IngredientOut
    class Config:
        from_attributes = True