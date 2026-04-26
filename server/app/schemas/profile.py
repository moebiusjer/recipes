
from pydantic import BaseModel
from datetime import datetime



class ProfileOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: str | None = None
    posted_count: int
    saved_count: int
    pantry_count: int
    comments_count: int




class ProfileUpdate(BaseModel):
    username: str | None = None
    avatar_url: str | None = None

class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str