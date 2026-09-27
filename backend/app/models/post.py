from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.tag import post_tags


class Post(Base):
    __tablename__ = "posts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    slug = Column(
        String(250),
        unique=True,
        nullable=False,
        index=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    excerpt = Column(
        String(500),
        nullable=True,
    )

    cover_image = Column(
        String(500),
        nullable=True,
    )

    status = Column(
        String(20),
        nullable=False,
        default="draft",
        index=True,
    )

    author_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    published_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ========================================================
    # AUTHOR
    # ========================================================

    author = relationship(
        "User",
        back_populates="posts",
    )

    # ========================================================
    # TAGS
    # ========================================================

    tags = relationship(
        "Tag",
        secondary=post_tags,
        back_populates="posts",
    )

    # ========================================================
    # LIKES
    # ========================================================

    likes = relationship(
        "PostLike",
        back_populates="post",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # BOOKMARKS
    # ========================================================

    bookmarks = relationship(
        "Bookmark",
        back_populates="post",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # COMMENTS
    # ========================================================

    comments = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
        order_by="Comment.created_at.asc()",
    )
    