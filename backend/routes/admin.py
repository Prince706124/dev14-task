from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User, Comment
from schemas import UserResponse, CommentResponse, UserUpdate
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(User).all()
    return [UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        is_admin=user.is_admin,
        created_at=user.created_at
    ) for user in users]

@router.get("/pending-comments", response_model=List[CommentResponse])
def get_pending_comments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending comments (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    comments = db.query(Comment).filter(Comment.is_pending == True).all()
    return [CommentResponse(
        id=comment.id,
        text=comment.text,
        upvotes=comment.upvotes,
        created_at=comment.created_at,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        is_approved=comment.is_approved,
        is_pending=comment.is_pending,
        user=UserResponse(
            id=comment.user.id,
            name=comment.user.name,
            email=comment.user.email,
            avatar=comment.user.avatar,
            is_admin=comment.user.is_admin,
            created_at=comment.user.created_at
        ),
        replies=[],
        has_more=False,  # Pending comments don't have replies
        total_count=0    # Pending comments don't have replies
    ) for comment in comments]

@router.put("/comments/{comment_id}/approve")
def approve_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a pending comment (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_approved = True
    comment.is_pending = False
    db.commit()
    
    return {"message": "Comment approved successfully"}

@router.put("/comments/{comment_id}/reject")
def reject_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a pending comment (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_approved = False
    comment.is_pending = False
    db.commit()
    
    return {"message": "Comment rejected successfully"}

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user information (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        is_admin=user.is_admin,
        created_at=user.created_at
    )
