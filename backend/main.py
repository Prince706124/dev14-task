from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import from the same directory
from models import Base, engine
from database import create_tables
from routes import auth, comments, admin
from config import CORS_ORIGINS

# Create FastAPI app
app = FastAPI(title="Comment System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
create_tables()

# Include routers
app.include_router(auth.router)
app.include_router(comments.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Comment System API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)