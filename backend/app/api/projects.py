from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.api.deps import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_project(
        db,
        name=payload.name,
        description=payload.description,
        creator_id=current_user.id,
        creator_role=current_user.role,
    )


@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    memberships = (
        db.query(models.ProjectMember)
        .filter(models.ProjectMember.user_id == current_user.id)
        .all()
    )
    project_ids = [m.project_id for m in memberships]

    return (
        db.query(models.Project)
        .filter(models.Project.id.in_(project_ids))
        .all()
    )


@router.get("/{project_id}/members", response_model=List[schemas.ProjectMemberOut])
def list_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not crud.is_project_member(db, project_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")

    rows = (
        db.query(models.ProjectMember, models.User)
        .join(models.User, models.ProjectMember.user_id == models.User.id)
        .filter(models.ProjectMember.project_id == project_id)
        .all()
    )

    return [
        schemas.ProjectMemberOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=member.role,
        )
        for member, user in rows
    ]


@router.post("/{project_id}/members", response_model=schemas.ProjectMemberOut)
def add_project_member(
    project_id: int,
    payload: schemas.ProjectMemberAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not crud.is_project_member(db, project_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")

    user = crud.get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = crud.is_project_member(db, project_id, user.id)
    if existing:
        raise HTTPException(status_code=400, detail="User already in project")

    membership = models.ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=payload.role,
    )
    db.add(membership)
    db.commit()

    return schemas.ProjectMemberOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=payload.role,
    )


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    member = crud.is_project_member(db, project_id, current_user.id)
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    project = db.query(models.Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"ok": True}


@router.delete("/{project_id}/members/{user_id}")
def remove_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    requester = crud.is_project_member(db, project_id, current_user.id)
    if not requester:
        raise HTTPException(status_code=403, detail="Not a member")

    membership = (
        db.query(models.ProjectMember)
        .filter_by(project_id=project_id, user_id=user_id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(membership)
    db.commit()
    return {"ok": True}
