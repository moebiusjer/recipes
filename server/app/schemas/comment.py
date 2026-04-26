
from pydantic import BaseModel
from datetime import datetime


class CommentIn(BaseModel):
    body: str



class CommentOut(BaseModel):
    id: int
    body: str
    user_id: int
    username: str
    created_at: datetime