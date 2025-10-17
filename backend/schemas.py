from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Comment schemas
class CommentCreate(BaseModel):
    text: str
    parent_id: Optional[int] = None

class CommentUpdate(BaseModel):
    text: str

class CommentResponse(BaseModel):
    id: int
    text: str
    upvotes: int
    created_at: datetime
    user_id: str
    parent_id: Optional[int]
    is_approved: bool
    is_pending: bool
    user: UserResponse
    replies: List['CommentResponse'] = []
    has_more: bool
    total_count: int
    
    class Config:
        from_attributes = True

class CommentWithReplies(CommentResponse):
    replies: List['CommentWithReplies'] = []

# Auth schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Admin schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_admin: Optional[bool] = None
