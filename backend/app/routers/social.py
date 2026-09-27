from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from app.database import get_db

from app.models.post import Post
from app.models.user import User
from app.models.like import PostLike
from app.models.bookmark import Bookmark
from app.models.comment import Comment

from app.utils.dependencies import get_current_user


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/social/posts",
    tags=["Post Social"],
)


# ============================================================
# SCHEMAS
# ============================================================

class CommentCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=1000,
    )


# ============================================================
# HELPERS
# ============================================================

def get_post_by_id(
    post_id: int,
    db: Session,
) -> Post:
    """
    Get a published post by ID.
    """

    post = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags),
        )
        .filter(
            Post.id == post_id,
            Post.status == "published",
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    return post


def get_social_state(
    post: Post,
    user: User,
    db: Session,
):
    """
    Return current social state for a post.
    """

    liked = (
        db.query(PostLike)
        .filter(
            PostLike.post_id == post.id,
            PostLike.user_id == user.id,
        )
        .first()
        is not None
    )

    bookmarked = (
        db.query(Bookmark)
        .filter(
            Bookmark.post_id == post.id,
            Bookmark.user_id == user.id,
        )
        .first()
        is not None
    )

    likes_count = (
        db.query(PostLike)
        .filter(
            PostLike.post_id == post.id,
        )
        .count()
    )

    comments_count = (
        db.query(Comment)
        .filter(
            Comment.post_id == post.id,
        )
        .count()
    )

    return (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    )


# ============================================================
# GET SOCIAL STATUS
# ============================================================

@router.get("/{post_id}/status")
def get_social_status(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get like/bookmark state and counts for the current user.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    ) = get_social_state(
        post=post,
        user=user,
        db=db,
    )

    return {
        "liked": liked,
        "bookmarked": bookmarked,
        "likes": likes_count,
        "comments": comments_count,
    }


# ============================================================
# LIKE POST
# ============================================================

@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Like a post.

    If the post is already liked by this user,
    the request remains successful and does not create
    a duplicate record.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    existing = (
        db.query(PostLike)
        .filter(
            PostLike.post_id == post.id,
            PostLike.user_id == user.id,
        )
        .first()
    )

    if not existing:
        like = PostLike(
            post_id=post.id,
            user_id=user.id,
        )

        db.add(like)

        try:
            db.commit()
        except Exception:
            db.rollback()

            # Another request may have created the unique record.
            existing = (
                db.query(PostLike)
                .filter(
                    PostLike.post_id == post.id,
                    PostLike.user_id == user.id,
                )
                .first()
            )

            if not existing:
                raise

    (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    ) = get_social_state(
        post=post,
        user=user,
        db=db,
    )

    return {
        "liked": liked,
        "bookmarked": bookmarked,
        "likes": likes_count,
        "comments": comments_count,
    }


# ============================================================
# UNLIKE POST
# ============================================================

@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Remove the current user's like.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    existing = (
        db.query(PostLike)
        .filter(
            PostLike.post_id == post.id,
            PostLike.user_id == user.id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    ) = get_social_state(
        post=post,
        user=user,
        db=db,
    )

    return {
        "liked": liked,
        "bookmarked": bookmarked,
        "likes": likes_count,
        "comments": comments_count,
    }


# ============================================================
# BOOKMARK POST
# ============================================================

@router.post("/{post_id}/bookmark")
def bookmark_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Bookmark a post.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    existing = (
        db.query(Bookmark)
        .filter(
            Bookmark.post_id == post.id,
            Bookmark.user_id == user.id,
        )
        .first()
    )

    if not existing:
        bookmark = Bookmark(
            post_id=post.id,
            user_id=user.id,
        )

        db.add(bookmark)

        try:
            db.commit()
        except Exception:
            db.rollback()

            existing = (
                db.query(Bookmark)
                .filter(
                    Bookmark.post_id == post.id,
                    Bookmark.user_id == user.id,
                )
                .first()
            )

            if not existing:
                raise

    (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    ) = get_social_state(
        post=post,
        user=user,
        db=db,
    )

    return {
        "liked": liked,
        "bookmarked": bookmarked,
        "likes": likes_count,
        "comments": comments_count,
    }


# ============================================================
# REMOVE BOOKMARK
# ============================================================

@router.delete("/{post_id}/bookmark")
def remove_bookmark(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Remove the current user's bookmark.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    existing = (
        db.query(Bookmark)
        .filter(
            Bookmark.post_id == post.id,
            Bookmark.user_id == user.id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()

    (
        liked,
        bookmarked,
        likes_count,
        comments_count,
    ) = get_social_state(
        post=post,
        user=user,
        db=db,
    )

    return {
        "liked": liked,
        "bookmarked": bookmarked,
        "likes": likes_count,
        "comments": comments_count,
    }


# ============================================================
# GET COMMENTS
# ============================================================

@router.get("/{post_id}/comments")
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all comments for a published post.

    This endpoint is public.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
        )
        .filter(
            Comment.post_id == post.id,
        )
        .order_by(
            Comment.created_at.asc(),
        )
        .all()
    )

    return [
        {
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at,
            "user": {
                "id": comment.user.id,
                "username": comment.user.username,
                "name": comment.user.name,
                "avatar_url": comment.user.avatar_url,
            },
        }
        for comment in comments
    ]


# ============================================================
# CREATE COMMENT
# ============================================================

@router.post(
    "/{post_id}/comments",
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Create a comment on a published post.
    """

    post = get_post_by_id(
        post_id=post_id,
        db=db,
    )

    content = payload.content.strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment cannot be empty",
        )

    comment = Comment(
        content=content,
        post_id=post.id,
        user_id=user.id,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at,
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar_url": user.avatar_url,
        },
    }


# ============================================================
# MY BOOKMARKS
# ============================================================
# IMPORTANT:
# This route MUST be declared before:
#
# /{post_id}/...
#
# because "bookmarks" should not be interpreted as post_id.
# ============================================================

@router.get("/bookmarks/mine")
def get_my_bookmarks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Return all bookmarks belonging to the logged-in user.
    """

    rows = (
        db.query(Bookmark)
        .options(
            joinedload(Bookmark.post)
            .joinedload(Post.author),
        )
        .filter(
            Bookmark.user_id == user.id,
        )
        .order_by(
            Bookmark.created_at.desc(),
        )
        .all()
    )

    result = []

    for row in rows:

        # Safety check in case a referenced post was removed.
        if not row.post:
            continue

        # Only return published posts.
        if row.post.status != "published":
            continue

        author = row.post.author

        result.append(
            {
                "id": row.id,
                "created_at": row.created_at,
                "post": {
                    "id": row.post.id,
                    "slug": row.post.slug,
                    "title": row.post.title,
                    "excerpt": row.post.excerpt,
                    "cover_image": row.post.cover_image,
                    "published_at": row.post.published_at,
                    "author": {
                        "id": author.id if author else None,
                        "username": (
                            author.username
                            if author
                            else None
                        ),
                        "name": (
                            author.name
                            if author
                            else None
                        ),
                        "avatar_url": (
                            author.avatar_url
                            if author
                            else None
                        ),
                    },
                },
            }
        )

    return result
