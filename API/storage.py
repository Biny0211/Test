from sqlalchemy import Enum, func, Text
from database import database


class Storage(database.Model):
    __tablename__ = 'storage'

    storage_id = database.Column(database.Integer, primary_key=True, autoincrement=True)
    group_id = database.Column(database.Integer, nullable=False)
    account_id = database.Column(database.Integer, nullable=False)
    storage_type = database.Column(
        Enum('google_drive', 'dropbox', name='storage_type_enum'),
        nullable=False
    )
    refresh_token = database.Column(Text, nullable=True)
    token = database.Column(Text, nullable=True)
    token_uri = database.Column(Text, nullable=True)
    client_id = database.Column(Text, nullable=True)
    client_secret = database.Column(Text, nullable=True)
    scopes = database.Column(Text, nullable=True)
    last_login = database.Column(database.DateTime, default=func.now())
    name = database.Column(database.String(255), nullable=True)
    email = database.Column(database.String(255), nullable=True)
