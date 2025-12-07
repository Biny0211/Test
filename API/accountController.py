from account import Account
from database import database
from sqlalchemy import func
import bcrypt


class AccountController:
    # method to get account details
    @staticmethod
    def get_account(account_id: int):
        try:
            # we don't need input sanitization since sqlalchemy auto does it for us
            account = database.session.get(Account, account_id)
            if not account:
                return None
            return account.get_user_details()
        except Exception as e:
            print(f"Error getting account: {e}")
            return None

    # method to get accounts
    @staticmethod
    def get_accounts(page=1, limit=15, query=None):
        try:
            if query is None:
                query = Account.query
            if limit is None:
                accounts = query.all()
            else:
                offset = (page - 1) * limit
                accounts = query.offset(offset).limit(limit).all()
            return {
                "success": True,
                "accounts": [account.get_user_details() for account in accounts],
                "count": len(accounts)
            }
        except Exception as e:
            print(f"Error getting accounts: {e}")
            return None

    # legacy method (reworked to filter_account)
    # @staticmethod
    # def get_status_filter(status_filter):
    #     accounts = Account.query.filter_by(status=status_filter).all()
    #     return [
    #         account.get_user_details() for account in accounts
    #     ]

    @staticmethod
    def filter_account(name=None, email=None, role=None, created_start=None, created_end=None, status=None,
                       page=1, limit=15):
        try:
            query = Account.query
            if name:
                query = query.filter(Account.name.ilike(f"%{name}%"))
            if email:
                query = query.filter(Account.email.ilike(f"%{email}%"))
            if role:
                query = query.filter_by(role=role)
            if created_start and created_end:
                query = query.filter(Account.created_at.between(created_start, created_end))
            if status:
                query = query.filter_by(status=status)

            return AccountController.get_accounts(page=page, limit=limit, query=query)
        except Exception as e:
            print(f"Error filtering account: {e}")
            return None

    @staticmethod
    def create_account(name, email, password, role):
        try:
            exists = database.session.query(Account).filter_by(
                email=email
            ).first()

            if exists:
                return False

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            new_account = Account(
                name=name,
                email=email,
                password=hashed_password.decode('utf-8'),
                role=role,
                created_at=func.now(),
                status="Active"
            )
            database.session.add(new_account)
            database.session.commit()
            return True
        except Exception as e:
            database.session.rollback()
            print(f"Error creating account: {e}")
            return False

    # to do: return false and custom message
    @staticmethod
    def edit_account(requester_id, account_id, name=None, email=None, password=None, status=None, role=None):
        try:
            requester = database.session.get(Account, requester_id)
            if not requester:
                return False, None
            if requester.role in ['PIN', 'CSR']:
                return False, None

            account = database.session.get(Account, account_id)
            if not account:
                return False, None

            if account.role in ['Admin', 'Manager']:
                return False, None

            if role in ['Admin', 'Manager']:
                return False, None

            if password is not None:
                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                account.password = hashed.decode('utf-8')

            change = {
                "name": name,
                "email": email,
                "status": status,
                "role": role
            }

            for field, value in change.items():
                if value is not None:
                    setattr(account, field, value)

            database.session.commit()
            return True, change.items()
        except Exception as e:
            database.session.rollback()
            print(f"Error editing account: {e}")
            return False, None

    @staticmethod
    def delete_account(account_id):
        try:
            account = database.session.get(Account, account_id)
            if not account:
                return False

            if account.role in ['Admin', 'Manager']:
                return False

            database.session.delete(account)
            database.session.commit()
            return True
        except Exception as e:
            database.session.rollback()
            print(f"Error deleting account: {e}")
            return False

    @staticmethod
    def login(email, password):
        try:
            user = Account.query.filter_by(email=email).first()
            if not user:
                return {"success": False, "message": "Email not found"}

            if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                return {
                    "success": True,
                    "user_id": user.account_id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "status": user.status
                }

            return {"success": False, "message": "Incorrect password"}
        except Exception as e:
            print(f"Error during login: {e}")
            return {"success": False, "message": "Login failed"}

    # Change user password
    @staticmethod
    def change_password(account_id, old_password, new_password):
        try:
            account = database.session.get(Account, account_id)
            if not account:
                return False, "Account not found"

            # Verify old password
            if old_password is not None:
                if not bcrypt.checkpw(old_password.encode('utf-8'), account.password.encode('utf-8')):
                    return False, "Incorrect old password"

            # Hash and set new password
            hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            account.password = hashed.decode('utf-8')

            database.session.commit()
            return True, "Password changed successfully"
        except Exception as e:
            database.session.rollback()
            print(f"Error changing password: {e}")
            return False, f"Failed to change password: {str(e)}"


