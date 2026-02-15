from sqlalchemy.orm import Session
from typing import Optional, List

from app import models
from app.core.security import get_password_hash


# ---------- USERS ----------

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    role: models.RoleEnum = models.RoleEnum.developer,
) -> models.User:
    hashed_password = get_password_hash(password)

    user = models.User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------- PROJECTS ----------

def create_project(
    db: Session,
    name: str,
    description: Optional[str],
    creator_id: int,
    creator_role: models.RoleEnum,
) -> models.Project:
    project = models.Project(
        name=name,
        description=description,
    )
    db.add(project)
    db.flush()  # get project.id without committing

    member = models.ProjectMember(
        project_id=project.id,
        user_id=creator_id,
        role=creator_role,
    )
    db.add(member)

    db.commit()
    db.refresh(project)
    return project


def is_project_member(
    db: Session,
    project_id: int,
    user_id: int,
) -> Optional[models.ProjectMember]:
    return (
        db.query(models.ProjectMember)
        .filter_by(project_id=project_id, user_id=user_id)
        .first()
    )


# ---------- ISSUES ----------

def create_issue(
    db: Session,
    project_id: int,
    title: str,
    description: Optional[str],
    type_: models.IssueTypeEnum,
    priority: int,
    assignee_id: Optional[int] = None,
) -> models.Issue:
    issue = models.Issue(
        title=title,
        description=description,
        type=type_,
        priority=priority,
        project_id=project_id,
        assignee_id=assignee_id,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def list_issues_for_project(
    db: Session,
    project_id: int,
) -> List[models.Issue]:
    return (
        db.query(models.Issue)
        .filter_by(project_id=project_id)
        .all()
    )


def update_issue_status(
    db: Session,
    issue: models.Issue,
    status: models.IssueStatus,
) -> models.Issue:
    issue.status = status
    db.commit()
    db.refresh(issue)
    return issue    