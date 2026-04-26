from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Numeric, ForeignKey
from datetime import datetime, UTC
from app.database import Base


def now():
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String)
    created_at = Column(DateTime, nullable=False, default=now)
    updated_at = Column(DateTime, nullable=False, default=now, onupdate=now)


class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    category = Column(String)
    image_url = Column(String)



class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    image_url = Column(String)
    cuisine = Column(String)
    difficulty = Column(String)
    prep_time_minutes = Column(Integer)
    cook_time_minutes = Column(Integer)
    servings = Column(Integer)
    calories_per_serving = Column(Integer)
    rating = Column(Numeric(2, 1))
    review_count = Column(Integer, nullable=False, default=0)
    author_id = Column(Integer, ForeignKey("users.id"))
    is_community = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=now)
    updated_at = Column(DateTime, nullable=False, default=now, onupdate=now)


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    original_text = Column(String, nullable=False)
    quantity_text = Column(String)
    display_order = Column(Integer, nullable=False, default=0)


class RecipeInstruction(Base):
    __tablename__ = "recipe_instructions"
    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)


class RecipeTag(Base):
    __tablename__ = "recipe_tags"
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)


class MealType(Base):
    __tablename__ = "meal_types"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)


class RecipeMealType(Base):
    __tablename__ = "recipe_meal_types"
    recipe_id = Column(Integer, ForeignKey("recipes.id"), primary_key=True)
    meal_type_id = Column(Integer, ForeignKey("meal_types.id"), primary_key=True)



class Cookbook(Base):
    __tablename__ = "cookbook"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    saved_at = Column(DateTime, nullable=False, default=now)


class UserIngredient(Base):
    __tablename__ = "user_ingredients"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    status = Column(String, nullable=False)
    quantity_text = Column(String)
    is_checked = Column(Boolean, nullable=False, default=False)
    added_at = Column(DateTime, nullable=False, default=now)


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=now)
    updated_at = Column(DateTime, nullable=False, default=now, onupdate=now)