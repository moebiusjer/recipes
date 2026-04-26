# How to run

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Seed the database

```bash
python -m app.seed
```

This ill drop all tables and reloads 50 recipes from dummyjson

## Start the server

```bash
uvicorn app.main:app --reload
```

Server runs at http://localhost:8000

API docs: http://localhost:8000/docs

