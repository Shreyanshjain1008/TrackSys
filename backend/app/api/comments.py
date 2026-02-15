from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/issues/{issue_id}", response_model=schemas.CommentOut)
def post_comment(
    issue_id: int,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = db.query(models.ProjectMember).filter_by(
        project_id=issue.project_id, user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    comment = models.Comment(
        issue_id=issue_id,
        author_id=current_user.id,
        content=payload.content,
        parent_id=payload.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
@router.get("/issues/{issue_id}", response_model=List[schemas.CommentOut])
def list_comments(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = db.query(models.ProjectMember).filter_by(
        project_id=issue.project_id, user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    return (
        db.query(models.Comment)
        .filter_by(issue_id=issue_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    comment = db.query(models.Comment).filter_by(id=comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    issue = db.query(models.Issue).filter_by(id=comment.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = db.query(models.ProjectMember).filter_by(
        project_id=issue.project_id, user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    db.delete(comment)
    db.commit()
    return {"ok": True}
