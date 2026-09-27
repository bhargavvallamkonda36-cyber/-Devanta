from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# TAG RESPONSE
# ============================================================

class TagResponse(BaseModel):
    id: int
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# AUTHOR RESPONSE
# ============================================================

class AuthorResponse(BaseModel):
    id: int
    username: str
    name: str | None = None
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# CREATE POST
# ============================================================

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

    content: str = Field(
        ...,
        min_length=1
    )

    tags: list[str] = Field(
        default_factory=list,
        max_length=5
    )

    cover_image: str | None = Field(
        default=None,
        alias="coverImage",
        max_length=500
    )

    status: Literal["draft", "published"] = "draft"

    model_config = ConfigDict(
        populate_by_name=True
    )


# ============================================================
# UPDATE POST
# ============================================================

class PostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200
    )

    content: str | None = Field(
        default=None,
        min_length=1
    )

    tags: list[str] | None = Field(
        default=None,
        max_length=5
    )

    cover_image: str | None = Field(
        default=None,
        alias="coverImage",
        max_length=500
    )

    status: Literal["draft", "published"] | None = None

    model_config = ConfigDict(
        populate_by_name=True
    )


# ============================================================
# POST RESPONSE
# ============================================================

class PostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str | None = None

    cover_image: str | None = Field(
        default=None,
        serialization_alias="coverImage"
    )

    status: str

    author_id: int

    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None

    author: AuthorResponse | None = None
    tags: list[TagResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )
    