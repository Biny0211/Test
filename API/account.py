from sqlalchemy import func
from database import database


class Account(database.Model):
    __tablename__ = 'users'

    # we found that sqlalchemy already has a super init
    account_id = database.Column(database.Integer, primary_key=True, autoincrement=True)
    name = database.Column(database.String(100), nullable=False)
    email = database.Column(database.String(100), unique=True, nullable=False)
    password = database.Column(database.String(255), nullable=False)
    role = database.Column(database.String(50), nullable=False)
    created_at = database.Column(database.DateTime, nullable=True, default=func.now())
    status = database.Column(database.Enum('Active', 'Banned', 'Suspended'), nullable=False, default="Active")

    def get_user_details(self):
        return {
            "account_id": self.account_id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at,
            "status": self.status
        }
