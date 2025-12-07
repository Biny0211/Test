from sqlalchemy import func
from uuid import uuid4
from database import database
from sqlalchemy.dialects.postgresql import UUID


class FileKey(database.Model):
    __tablename__ = "file_keys"

    # note to self: add foreign keys later

    key_id = database.Column(database.Integer, primary_key=True, autoincrement=True)
    file_id = database.Column(UUID(as_uuid=True), default=uuid4)
    storage_id = database.Column(database.Integer, nullable=False)
    key_file_id = database.Column(database.String(255), nullable=False)  # Google Drive file id
    created_at = database.Column(database.DateTime, default=func.now())
