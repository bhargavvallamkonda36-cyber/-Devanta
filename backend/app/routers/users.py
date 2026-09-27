from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=500)
    avatar_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    twitter_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)


def user_to_dict(user: User, published_count: int | None = None):
    result = {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "github_url": user.github_url,
        "twitter_url": user.twitter_url,
        "website_url": user.website_url,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }

    if published_count is not None:
        result["published_posts_count"] = published_count

    return result


def public_post(post: Post):
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "cover_image": post.cover_image,
        "status": post.status,
        "published_at": post.published_at,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "author": {
            "id": post.author.id,
            "username": post.author.username,
            "name": post.author.name,
            "avatar_url": post.author.avatar_url,
        },
        "tags": [
            {
                "id": tag.id,
                "name": tag.name,
                "slug": tag.slug,
            }
            for tag in post.tags
        ],
    }


# ============================================================
# CURRENT USER
# IMPORTANT: /me MUST COME BEFORE /{user_id}
# ============================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return user_to_dict(current_user)


# ============================================================
# UPDATE CURRENT USER
# ============================================================

@router.put("/me")
def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.name is not None:
        current_user.name = data.name.strip() or None

    if data.bio is not None:
        current_user.bio = data.bio.strip() or None

    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url.strip() or None

    if data.github_url is not None:
        current_user.github_url = data.github_url.strip() or None

    if data.twitter_url is not None:
        current_user.twitter_url = data.twitter_url.strip() or None

    if data.website_url is not None:
        current_user.website_url = data.website_url.strip() or None

    db.commit()
    db.refresh(current_user)

    return user_to_dict(current_user)


# ============================================================
# ALL PUBLIC DEVELOPERS
# ============================================================

@router.get("")
def get_public_users(
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.name.asc(), User.username.asc())
        .all()
    )

    result = []

    for user in users:
        published_count = (
            db.query(func.count(Post.id))
            .filter(
                Post.author_id == user.id,
                Post.status == "published",
            )
            .scalar()
        )

        result.append(
            user_to_dict(
                user,
                published_count or 0,
            )
        )

    return result


# ============================================================
# PUBLIC PROFILE
# ============================================================

@router.get("/{user_id}")
def get_public_profile(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_active == True,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer profile not found",
        )

    posts = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags),
        )
        .filter(
            Post.author_id == user.id,
            Post.status == "published",
        )
        .order_by(
            Post.published_at.desc(),
            Post.created_at.desc(),
        )
        .all()
    )

    return {
        "user": user_to_dict(
            user,
            len(posts),
        ),
        "posts": [
            public_post(post)
            for post in posts
        ],
    }
