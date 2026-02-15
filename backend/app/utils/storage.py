import uuid
from supabase import create_client
from app.core.config import settings

_supabase = None


def _client():
    global _supabase
    if _supabase is None:
        storage_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        if not settings.SUPABASE_URL or not storage_key:
            raise RuntimeError("Supabase credentials not configured")
        _supabase = create_client(
            settings.SUPABASE_URL,
            storage_key,
        )
    return _supabase


def upload_fileobj_to_storage(fileobj, filename: str):
    """
    Upload file to Supabase Storage.
    Returns (key, public_url).
    Bucket must be public.
    """
    client = _client()
    key = f"attachments/{uuid.uuid4().hex}_{filename}"

    fileobj.seek(0)
    data = fileobj.read()

    client.storage.from_(settings.SUPABASE_BUCKET).upload(
        path=key,
        file=data,
    )

    public_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/public/"
        f"{settings.SUPABASE_BUCKET}/{key}"
    )

    return key, public_url


def delete_file_from_storage(key: str):
    """
    Best-effort delete from Supabase Storage.
    """
    client = _client()
    client.storage.from_(settings.SUPABASE_BUCKET).remove([key])
