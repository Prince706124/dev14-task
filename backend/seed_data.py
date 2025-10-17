#!/usr/bin/env python3
"""
Database seeding script for the comment system.
Loads user and comment data from JSON files.
"""

import json
import os
import uuid
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Import our refactored modules
from models import Base, engine, User, Comment
from config import SPAM_KEYWORDS

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def load_json_data(filename):
    """Load data from JSON file"""
    file_path = os.path.join(os.path.dirname(__file__), filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def detect_spam(text: str) -> bool:
    """Detect spam in comment text"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in SPAM_KEYWORDS)

def seed_database():
    """Seed the database with users and comments"""
    print("Starting database seeding...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        existing_comments = db.query(Comment).count()
        
        if existing_users > 0 or existing_comments > 0:
            print(f"Database already has {existing_users} users and {existing_comments} comments. Skipping seed.")
            return
        
        # Load data from JSON files
        print("Loading data from JSON files...")
        users_data = load_json_data('users.json')
        comments_data = load_json_data('comments.json')
        
        print(f"Found {len(users_data)} users and {len(comments_data)} comments to seed")
        
        # Create admin user first
        print("Creating admin user...")
        admin_user = User(
            id="admin-user-001",
            name="Admin User",
            email="admin@example.com",
            hashed_password=pwd_context.hash("admin123"),
            avatar="https://i.pravatar.cc/150?img=admin",
            is_admin=True,
            created_at=datetime.now()
        )
        db.add(admin_user)
        
        # Seed users from JSON
        print("Seeding users...")
        for i, user_data in enumerate(users_data):
            # Generate a default password and unique email if not present
            default_password = "password123"  # Default password for all users
            default_email = f"{user_data['name'].lower().replace(' ', '.')}.{i+1}@example.com"
            
            # Hash the password
            hashed_password = pwd_context.hash(default_password)
            
            db_user = User(
                id=user_data['id'],
                name=user_data['name'],
                email=user_data.get('email', default_email),
                hashed_password=hashed_password,
                avatar=user_data['avatar'],
                is_admin=user_data.get('is_admin', False),
                created_at=datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00'))
            )
            db.add(db_user)
        
        db.commit()
        print(f"Seeded {len(users_data)} users")
        
        # Seed comments
        print("Seeding comments...")
        for comment_data in comments_data:
            # Check for spam
            is_spam = detect_spam(comment_data['text'])
            
            db_comment = Comment(
                id=comment_data['id'],
                text=comment_data['text'],
                upvotes=comment_data['upvotes'],
                created_at=datetime.fromisoformat(comment_data['created_at'].replace('Z', '+00:00')),
                user_id=comment_data['user_id'],
                parent_id=comment_data.get('parent_id'),
                is_approved=not is_spam,  # Auto-approve if not spam
                is_pending=is_spam  # Mark as pending if spam detected
            )
            db.add(db_comment)
        
        db.commit()
        print(f"Seeded {len(comments_data)} comments")
        
        # Print summary
        total_users = db.query(User).count()
        admin_users = db.query(User).filter(User.is_admin == True).count()
        total_comments = db.query(Comment).count()
        approved_comments = db.query(Comment).filter(Comment.is_approved == True).count()
        pending_comments = db.query(Comment).filter(Comment.is_pending == True).count()
        
        print("\nDatabase seeding completed!")
        print(f"Summary:")
        print(f"   Total Users: {total_users}")
        print(f"   Admin Users: {admin_users}")
        print(f"   Total Comments: {total_comments}")
        print(f"   Approved Comments: {approved_comments}")
        print(f"   Pending Comments: {pending_comments}")
        print(f"\nAdmin Login Credentials:")
        print(f"   Email: admin@example.com")
        print(f"   Password: admin123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
