from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import auth
from app.routers import auth, recipes, cookbook, kitchen, comments, profile



Base.metadata.create_all(bind=engine)




app = FastAPI()

app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(cookbook.router)
app.include_router(kitchen.router)
app.include_router(comments.router)
app.include_router(profile.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"I'm": "workin'"}