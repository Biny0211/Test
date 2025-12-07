from sqlalchemy import func
from uuid import uuid4
from database import database
from sqlalchemy.dialects.postgresql import UUID


class File(database.Model):
    __tablename__ = "files"

    # note to self: add foreign keys later

    file_id = database.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    filename = database.Column(database.String(255), nullable=False)
    group_id = database.Column(database.Integer, nullable=False)
    account_id = database.Column(database.Integer, nullable=False)
    shard_count = database.Column(database.Integer, nullable=False)
    original_length = database.Column(database.Integer, nullable=False)
    required_shards = database.Column(database.Integer, nullable=False)
    created_at = database.Column(database.DateTime, default=func.now())
    key_threshold = database.Column(database.Integer, nullable=False, default=1)