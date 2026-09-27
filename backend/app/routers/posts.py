import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.schemas.post import (
    PostCreate,
    PostResponse,
    PostUpdate,
)
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


# ============================================================
# HELPERS
# ============================================================

def create_slug(text: str) -> str:

    slug = text.lower().strip()

    slug = re.sub(
        r"[^a-z0-9\s-]",
        "",
        slug
    )

    slug = re.sub(
        r"[\s_-]+",
        "-",
        slug
    )

    slug = slug.strip("-")

    return slug or "untitled-post"


def generate_unique_slug(
    title: str,
    db: Session,
    post_id: int | None = None
) -> str:

    base_slug = create_slug(title)

    slug = base_slug
    counter = 2

    while True:

        query = (
            db.query(Post)
            .filter(Post.slug == slug)
        )

        if post_id is not None:
            query = query.filter(
                Post.id != post_id
            )

        existing = query.first()

        if not existing:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


def get_or_create_tags(
    tag_names: list[str],
    db: Session
) -> list[Tag]:

    result = []
    seen = set()

    for raw_name in tag_names:

        name = raw_name.strip().lower()

        if not name:
            continue

        if name in seen:
            continue

        seen.add(name)

        slug = create_slug(name)

        tag = (
            db.query(Tag)
            .filter(Tag.name == name)
            .first()
        )

        if not tag:

            tag = (
                db.query(Tag)
                .filter(Tag.slug == slug)
                .first()
            )

        if not tag:

            tag = Tag(
                name=name,
                slug=slug
            )

            db.add(tag)
            db.flush()

        result.append(tag)

    return result


def create_excerpt(
    content: str,
    max_length: int = 250
) -> str:

    text = re.sub(
        r"[#*`_>\[\]\(\)]",
        "",
        content
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    if len(text) <= max_length:
        return text

    return text[:max_length].rstrip() + "..."


def load_post(
    db: Session,
    post_id: int
) -> Post | None:

    return (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags)
        )
        .filter(Post.id == post_id)
        .first()
    )


# ============================================================
# CREATE POST
# ============================================================

@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED
)
def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    slug = generate_unique_slug(
        data.title,
        db
    )

    tags = get_or_create_tags(
        data.tags,
        db
    )

    published_at = None

    if data.status == "published":
        published_at = datetime.now(timezone.utc)

    post = Post(
        title=data.title.strip(),
        slug=slug,
        content=data.content,
        excerpt=create_excerpt(data.content),
        cover_image=data.cover_image,
        status=data.status,
        author_id=current_user.id,
        published_at=published_at,
    )

    post.tags = tags

    db.add(post)
    db.commit()
    db.refresh(post)

    return load_post(
        db,
        post.id
    )


# ============================================================
# PUBLIC FEED
# ============================================================

@router.get(
    "",
    response_model=list[PostResponse]
)
def get_published_posts(
    search: str | None = Query(
        default=None
    ),
    tag: str | None = Query(
        default=None
    ),
    db: Session = Depends(get_db)
):

    query = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags)
        )
        .filter(
            Post.status == "published"
        )
    )

    if search:

        search_text = f"%{search.strip()}%"

        query = query.filter(
            Post.title.ilike(search_text)
        )

    if tag:

        tag_name = tag.strip().lower()

        query = query.join(
            Post.tags
        ).filter(
            Tag.slug == tag_name
        )

    return (
        query
        .order_by(
            Post.published_at.desc(),
            Post.created_at.desc()
        )
        .all()
    )


# ============================================================
# MY POSTS
# IMPORTANT: KEEP THIS BEFORE /{post_slug}
# ============================================================

@router.get(
    "/mine",
    response_model=list[PostResponse]
)
def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags)
        )
        .filter(
            Post.author_id == current_user.id
        )
        .order_by(
            Post.updated_at.desc()
        )
        .all()
    )


# ============================================================
# GET SINGLE PUBLISHED POST
# ============================================================

@router.get(
    "/{post_slug}",
    response_model=PostResponse
)
def get_post_by_slug(
    post_slug: str,
    db: Session = Depends(get_db)
):

    post = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.tags)
        )
        .filter(
            Post.slug == post_slug,
            Post.status == "published"
        )
        .first()
    )

    if not post:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Published post not found"
        )

    return post


# ============================================================
# UPDATE POST
# ============================================================

@router.put(
    "/{post_id}",
    response_model=PostResponse
)
def update_post(
    post_id: int,
    data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    post = (
        db.query(Post)
        .filter(
            Post.id == post_id
        )
        .first()
    )

    if not post:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # --------------------------------------------------------
    # OWNERSHIP CHECK
    # --------------------------------------------------------

    if post.author_id != current_user.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own posts"
        )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    if data.title is not None:

        new_title = data.title.strip()

        if not new_title:

            raise HTTPException(
                status_code=400,
                detail="Title cannot be empty"
            )

        if new_title != post.title:

            post.title = new_title

            post.slug = generate_unique_slug(
                new_title,
                db,
                post.id
            )

    # --------------------------------------------------------
    # CONTENT
    # --------------------------------------------------------

    if data.content is not None:

        post.content = data.content

        post.excerpt = create_excerpt(
            data.content
        )

    # --------------------------------------------------------
    # COVER IMAGE
    # --------------------------------------------------------

    if data.cover_image is not None:

        post.cover_image = data.cover_image

    # --------------------------------------------------------
    # TAGS
    # --------------------------------------------------------

    if data.tags is not None:

        post.tags = get_or_create_tags(
            data.tags,
            db
        )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if data.status is not None:

        if (
            data.status == "published"
            and post.status != "published"
        ):

            post.published_at = datetime.now(
                timezone.utc
            )

        elif (
            data.status == "draft"
        ):

            post.published_at = None

        post.status = data.status

    db.commit()
    db.refresh(post)

    return load_post(
        db,
        post.id
    )


# ============================================================
# DELETE POST
# ============================================================

@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    post = (
        db.query(Post)
        .filter(
            Post.id == post_id
        )
        .first()
    )

    if not post:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # --------------------------------------------------------
    # OWNERSHIP CHECK
    # --------------------------------------------------------

    if post.author_id != current_user.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts"
        )

    db.delete(post)
    db.commit()

    return None
