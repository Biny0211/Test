from sqlalchemy import func
from uuid import uuid4
from database import database
from sqlalchemy.dialects.postgresql import UUID


class FileShard(database.Model):
    __tablename__ = "file_shards"

    # note to self: add foreign keys later

    shard_id = database.Column(database.Integer, primary_key=True, autoincrement=True)
    file_id = database.Column(UUID(as_uuid=True), default=uuid4)
    shard_index = database.Column(database.Integer, nullable=False)
    storage_id = database.Column(database.Integer, nullable=False)
    shard_file_id = database.Column(database.String(255), nullable=False)  # ex: google drive file id
    folder_id = database.Column(database.String(255), nullable=False)
    shard_size = database.Column(database.Integer, nullable=True)
    created_at = database.Column(database.DateTime, default=func.now())
