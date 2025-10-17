from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User, Comment
from schemas import CommentCreate, CommentUpdate, CommentResponse, CommentWithReplies, UserResponse
from database import get_db
from auth import get_current_user
from utils import detect_spam, build_comment_tree

router = APIRouter(prefix="/comments", tags=["comments"])

@router.get("/", response_model=List[CommentWithReplies])
def get_comments(
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get paginated top-level comments"""
    offset = (page - 1) * limit
    
    # Get paginated comments with proper sorting
    query = db.query(Comment).filter(
        Comment.parent_id.is_(None),
        Comment.is_approved == True
    )
    
    # Apply sorting
    if sort_by == "upvotes":
        if order == "desc":
            query = query.order_by(Comment.upvotes.desc())
        else:
            query = query.order_by(Comment.upvotes.asc())
    elif sort_by == "created_at":
        if order == "desc":
            query = query.order_by(Comment.created_at.desc())
        else:
            query = query.order_by(Comment.created_at.asc())
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    comments = query.offset(offset).limit(limit).all()
    
    # Build tree structure for paginated comments only
    comment_ids = [c.id for c in comments]
    result = []
    
    for comment in comments:
        # Count total direct replies for this comment
        all_comments = db.query(Comment).all()
        direct_replies_total = len([c for c in all_comments if c.parent_id == comment.id and c.is_approved])
        
        # Create the comment dict with empty replies array (no nested content by default)
        comment_dict = {
            "id": comment.id,
            "text": comment.text,
            "upvotes": comment.upvotes,
            "created_at": comment.created_at,
            "user_id": comment.user_id,
            "parent_id": comment.parent_id,
            "is_approved": comment.is_approved,
            "is_pending": comment.is_pending,
            "user": {
                "id": comment.user.id,
                "name": comment.user.name,
                "email": comment.user.email,
                "avatar": comment.user.avatar,
                "is_admin": comment.user.is_admin,
                "created_at": comment.user.created_at
            },
            "replies": [],  # Empty by default - replies only load when user clicks "show more"
            "has_more": direct_replies_total > 0,
            "total_count": direct_replies_total
        }
        result.append(comment_dict)
    
    return result

@router.get("/summary")
def get_comments_summary(db: Session = Depends(get_db)):
    """Get total comment count and upvotes from database"""
    # Get total approved comments
    total_comments = db.query(Comment).filter(
        Comment.is_approved == True
    ).count()
    
    # Get total upvotes from all approved comments
    total_upvotes = db.query(func.sum(Comment.upvotes)).filter(
        Comment.is_approved == True
    ).scalar() or 0
    
    return {
        "total_comments": total_comments,
        "total_upvotes": total_upvotes
    }

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment with spam detection"""
    # Check for spam
    is_spam = detect_spam(comment.text)
    
    db_comment = Comment(
        text=comment.text,
        user_id=current_user.id,
        parent_id=comment.parent_id,
        is_approved=not is_spam,  # Auto-approve if not spam
        is_pending=is_spam  # Mark as pending if spam detected
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return CommentResponse(
        id=db_comment.id,
        text=db_comment.text,
        upvotes=db_comment.upvotes,
        created_at=db_comment.created_at,
        user_id=db_comment.user_id,
        parent_id=db_comment.parent_id,
        is_approved=db_comment.is_approved,
        is_pending=db_comment.is_pending,
        user=UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            avatar=current_user.avatar,
            is_admin=current_user.is_admin,
            created_at=current_user.created_at
        ),
        replies=[],
        has_more=False,  # New comments have no replies initially
        total_count=0    # New comments have no replies initially
    )

@router.put("/{comment_id}/upvote")
def upvote_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upvote a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.upvotes += 1
    db.commit()
    
    return {"message": "Comment upvoted successfully", "upvotes": comment.upvotes}

@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment (only by author or admin)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    comment.text = comment_update.text
    db.commit()
    db.refresh(comment)
    
    # Count total direct replies for this comment
    all_comments = db.query(Comment).all()
    direct_replies_total = len([c for c in all_comments if c.parent_id == comment.id and c.is_approved])
    
    return CommentResponse(
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
        has_more=direct_replies_total > 0,
        total_count=direct_replies_total
    )

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (only by author or admin)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}

@router.get("/{comment_id}/replies", response_model=List[CommentWithReplies])
def get_comment_replies(
    comment_id: int,
    page: int = 1,
    limit: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    """Get paginated replies for a specific comment"""
    offset = (page - 1) * limit
    
    # Get total count
    total = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_approved == True
    ).count()
    
    # Build query with sorting
    query = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_approved == True
    )
    
    # Apply sorting
    if sort_by == "upvotes":
        if order == "desc":
            query = query.order_by(Comment.upvotes.desc())
        else:
            query = query.order_by(Comment.upvotes.asc())
    elif sort_by == "created_at":
        if order == "desc":
            query = query.order_by(Comment.created_at.desc())
        else:
            query = query.order_by(Comment.created_at.asc())
    
    # Get paginated replies
    replies = query.offset(offset).limit(limit).all()
    
    # Count nested replies for each reply
    all_comments = db.query(Comment).all()
    result = []
    
    for reply in replies:
        # Count total nested replies for this reply
        nested_total = len([c for c in all_comments if c.parent_id == reply.id and c.is_approved])
        
        # Create the reply dict with empty replies array (no nested content by default)
        reply_dict = {
            "id": reply.id,
            "text": reply.text,
            "upvotes": reply.upvotes,
            "created_at": reply.created_at,
            "user_id": reply.user_id,
            "parent_id": reply.parent_id,
            "is_approved": reply.is_approved,
            "is_pending": reply.is_pending,
            "user": {
                "id": reply.user.id,
                "name": reply.user.name,
                "email": reply.user.email,
                "avatar": reply.user.avatar,
                "is_admin": reply.user.is_admin,
                "created_at": reply.user.created_at
            },
            "replies": [],  # Empty by default - nested content only loads when user clicks "show more"
            "has_more": nested_total > 0,
            "total_count": nested_total
        }
        result.append(reply_dict)
    
    return result

@router.get("/{comment_id}/nested-replies", response_model=List[CommentWithReplies])
def get_nested_replies(
    comment_id: int,
    page: int = 1,
    limit: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    """Get paginated nested replies for a specific comment (deeper than level 1)"""
    offset = (page - 1) * limit
    
    # Get total count of nested replies (level 2 and deeper)
    total = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_approved == True
    ).count()
    
    # Build query with sorting
    query = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_approved == True
    )
    
    # Apply sorting
    if sort_by == "upvotes":
        if order == "desc":
            query = query.order_by(Comment.upvotes.desc())
        else:
            query = query.order_by(Comment.upvotes.asc())
    elif sort_by == "created_at":
        if order == "desc":
            query = query.order_by(Comment.created_at.desc())
        else:
            query = query.order_by(Comment.created_at.asc())
    
    # Get paginated nested replies
    replies = query.offset(offset).limit(limit).all()
    
    # Build tree structure for each paginated reply individually
    all_comments = db.query(Comment).all()
    result = []
    
    for reply in replies:
        # Count total nested replies for this reply
        nested_total = len([c for c in all_comments if c.parent_id == reply.id and c.is_approved])
        
        # Build tree for this specific reply
        reply_tree = build_comment_tree(all_comments, parent_id=reply.id, max_level=2)
        
        # Create the reply dict with nested replies
        reply_dict = {
            "id": reply.id,
            "text": reply.text,
            "upvotes": reply.upvotes,
            "created_at": reply.created_at,
            "user_id": reply.user_id,
            "parent_id": reply.parent_id,
            "is_approved": reply.is_approved,
            "is_pending": reply.is_pending,
            "user": {
                "id": reply.user.id,
                "name": reply.user.name,
                "email": reply.user.email,
                "avatar": reply.user.avatar,
                "is_admin": reply.user.is_admin,
                "created_at": reply.user.created_at
            },
            "replies": reply_tree,
            "has_more": nested_total > 0,
            "total_count": nested_total
        }
        result.append(reply_dict)
    
    return result
