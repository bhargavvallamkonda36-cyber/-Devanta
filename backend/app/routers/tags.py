from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tag import Tag
from app.models.post import Post

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.get("")
def get_tags(db: Session = Depends(get_db)):
    rows = (db.query(Tag, func.count(Post.id).label("post_count"))
            .outerjoin(Tag.posts)
            .filter((Post.id.is_(None)) | (Post.status == "published"))
            .group_by(Tag.id)
            .order_by(Tag.name.asc()).all())
    return [{"id": tag.id, "name": tag.name, "slug": tag.slug, "post_count": int(count or 0)} for tag, count in rows]
