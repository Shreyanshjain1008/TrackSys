from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.api.deps import get_db, get_current_user
from app.utils.storage import upload_fileobj_to_storage, delete_file_from_storage

router = APIRouter(prefix="/attachments", tags=["Attachments"])


@router.post(
    "/issues/{issue_id}",
    response_model=schemas.AttachmentOut,
)
def upload_attachment(
    issue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = (
        db.query(models.ProjectMember)
        .filter_by(project_id=issue.project_id, user_id=current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    try:
        key, url = upload_fileobj_to_storage(file.file, file.filename)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="File upload failed")

    attachment = models.Attachment(
        issue_id=issue_id,
        filename=file.filename,
        s3_key=key,
        url=url,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.post(
    "/register",
    response_model=schemas.AttachmentOut,
)
def register_attachment(
    payload: schemas.AttachmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Register an already-uploaded file (Supabase/S3).
    """
    issue = db.query(models.Issue).filter_by(id=payload.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = (
        db.query(models.ProjectMember)
        .filter_by(project_id=issue.project_id, user_id=current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    attachment = models.Attachment(
        issue_id=payload.issue_id,
        filename=payload.filename,
        s3_key=payload.key,
        url=payload.url,
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.get(
    "/issues/{issue_id}",
    response_model=List[schemas.AttachmentOut],
)
def list_attachments(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    issue = db.query(models.Issue).filter_by(id=issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = (
        db.query(models.ProjectMember)
        .filter_by(project_id=issue.project_id, user_id=current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    return (
        db.query(models.Attachment)
        .filter_by(issue_id=issue_id)
        .all()
    )


@router.delete("/{attachment_id}")
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    attachment = db.query(models.Attachment).filter_by(id=attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    issue = db.query(models.Issue).filter_by(id=attachment.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    member = (
        db.query(models.ProjectMember)
        .filter_by(project_id=issue.project_id, user_id=current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    try:
        delete_file_from_storage(attachment.s3_key)
    except Exception:
        pass

    db.delete(attachment)
    db.commit()
    return {"ok": True}
