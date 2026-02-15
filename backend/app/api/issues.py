from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/issues", tags=["Issues"])


@router.post("/projects/{project_id}", response_model=schemas.IssueOut)
def create_issue(
    project_id: int,
    payload: schemas.IssueCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not crud.is_project_member(db, project_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")

    if payload.assignee_id:
        assignee = db.query(models.User).filter_by(id=payload.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=400, detail="Assignee user not found")

    return crud.create_issue(
        db,
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        type_=payload.type,
        priority=payload.priority,
        assignee_id=payload.assignee_id,
    )


@router.get("/projects/{project_id}", response_model=List[schemas.IssueOut])
def list_issues(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not crud.is_project_member(db, project_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")

    return crud.list_issues_for_project(db, project_id)
@router.patch("/{issue_id}/status")
def update_issue_status(
    issue_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = db.query(models.ProjectMember).filter_by(
        project_id=issue.project_id,
        user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    issue.status = status
    db.commit()
    db.refresh(issue)
    return issue


@router.delete("/{issue_id}")
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = db.query(models.ProjectMember).filter_by(
        project_id=issue.project_id,
        user_id=current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    db.delete(issue)
    db.commit()
    return {"ok": True}
