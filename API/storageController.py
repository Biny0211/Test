from flask import request, redirect, session, url_for
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
import requests as http_requests
import os
import pathlib
from database import database
from storage import Storage

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  # only for local testing
GOOGLE_CLIENT_SECRETS_FILE = str(pathlib.Path(__file__).parent / "credentials.json")
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]


class StorageController:

    @staticmethod
    def login(name):
        session["storage_name"] = name
        flow = Flow.from_client_secrets_file(
            GOOGLE_CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=url_for("oauth2callback", _external=True)
        )

        auth_url, state = flow.authorization_url(
            access_type="offline",
            prompt="consent",
            include_granted_scopes="true"
        )

        session["state"] = state
        return redirect(auth_url)

    @staticmethod
    def get_google_creds(storage_id):
        storage = Storage.query.filter_by(storage_id=storage_id).first()
        if not storage:
            return None

        creds = Credentials(
            token=storage.token,
            refresh_token=storage.refresh_token,
            token_uri=storage.token_uri,
            client_id=storage.client_id,
            client_secret=storage.client_secret,
            scopes=storage.scopes.split(",")
        )

        if creds.expired and creds.refresh_token:
            # refresh token
            try:
                creds.refresh(Request())
            except RefreshError:
                return None  # note: later, make it so that user need to re-login

            # save new token
            storage.token = creds.token
            database.session.commit()
        return creds

    @staticmethod
    def oauth_callback():
        flow = Flow.from_client_secrets_file(
            GOOGLE_CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=session["state"],
            redirect_uri=url_for("oauth2callback", _external=True)
        )

        flow.fetch_token(authorization_response=request.url)
        creds = flow.credentials

        # --- Fetch User Email ---
        userinfo_response = http_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {creds.token}"}
        )
        user_info = userinfo_response.json()
        email = user_info.get("email")
        name = session.get("storage_name") or "Default Name"

        # Save storage record
        storage = Storage(
            group_id=1,
            account_id=1,
            name=name,
            email=email,
            storage_type="google_drive",
            refresh_token=creds.refresh_token,
            token=creds.token,
            token_uri=creds.token_uri,
            client_id=creds.client_id,
            client_secret=creds.client_secret,
            scopes=",".join(creds.scopes),
        )

        database.session.add(storage)
        database.session.commit()

        session["storage_id"] = storage.storage_id

        return f"Login successful! Connected as {email}"

    @staticmethod
    def get_storage_info(storage_id):
        storage = Storage.query.filter_by(storage_id=storage_id).first()
        if not storage:
            raise ValueError(f"No storage found for storage_id={storage_id}")
        return storage
