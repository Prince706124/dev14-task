from config import SPAM_KEYWORDS

def detect_spam(text: str) -> bool:
    """Detect spam in comment text"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in SPAM_KEYWORDS)

def build_comment_tree(comments, parent_id=None, level=0, max_level=2):
    """Build nested comment tree structure"""
    tree = []
    
    for comment in comments:
        if comment.parent_id == parent_id and comment.is_approved:
            total_replies = len([c for c in comments if c.parent_id == comment.id and c.is_approved])
            
            replies = []
            if level + 1 < max_level:
                replies = build_comment_tree(comments, comment.id, level + 1, max_level)
            else:
                # Even if we don't show nested replies, we still need to add pagination info
                nested_comments = [c for c in comments if c.parent_id == comment.id and c.is_approved]
                for nested_comment in nested_comments:
                    nested_total = len([c for c in comments if c.parent_id == nested_comment.id and c.is_approved])
                    reply_dict = {
                        "id": nested_comment.id,
                        "text": nested_comment.text,
                        "upvotes": nested_comment.upvotes,
                        "created_at": nested_comment.created_at,
                        "user_id": nested_comment.user_id,
                        "parent_id": nested_comment.parent_id,
                        "is_approved": nested_comment.is_approved,
                        "is_pending": nested_comment.is_pending,
                        "user": {
                            "id": nested_comment.user.id,
                            "name": nested_comment.user.name,
                            "email": nested_comment.user.email,
                            "avatar": nested_comment.user.avatar,
                            "is_admin": nested_comment.user.is_admin,
                            "created_at": nested_comment.user.created_at
                        },
                        "replies": [],
                        "has_more": nested_total > 0,
                        "total_count": nested_total
                    }
                    replies.append(reply_dict)
            
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
                "replies": replies,
                "has_more": total_replies > 0,
                "total_count": total_replies
            }
            tree.append(comment_dict)
    
    return tree
