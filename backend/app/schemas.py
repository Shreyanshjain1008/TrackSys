from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime


# ---------- ENUMS (mirror models) ----------

class RoleEnum(str, Enum):
    admin = "admin"
    developer = "developer"
    viewer = "viewer"


class IssueStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class IssueTypeEnum(str, Enum):
    bug = "bug"
    task = "task"
    feature = "feature"


# ---------- USER ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: RoleEnum

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- PROJECT ----------

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class ProjectMemberAdd(BaseModel):
    email: EmailStr
    role: RoleEnum = RoleEnum.developer


class ProjectMemberOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: RoleEnum


# ---------- ISSUE ----------

class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: IssueTypeEnum = IssueTypeEnum.task
    priority: int = 3
    assignee_id: Optional[int] = None


class IssueOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: IssueStatusEnum
    type: IssueTypeEnum
    priority: int
    assignee_id: Optional[int]
    project_id: int
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- COMMENT ----------

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    issue_id: int
    author_id: int
    content: str
    parent_id: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- ATTACHMENT ----------

class AttachmentCreate(BaseModel):
    issue_id: int
    filename: str
    key: str
    url: str


class AttachmentOut(BaseModel):
    id: int
    issue_id: int
    filename: str
    url: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
