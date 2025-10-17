from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session

# Database setup
DATABASE_URL = "sqlite:///./comments.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    comments = relationship("Comment", back_populates="user")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    user_id = Column(String, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    is_approved = Column(Boolean, default=True)
    is_pending = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id])
