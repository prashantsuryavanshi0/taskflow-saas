from google.auth.transport import requests
from google.oauth2 import id_token
from flask import current_app


def verify_google_credential(credential: str) -> dict:
    payload = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        current_app.config["GOOGLE_CLIENT_ID"],
    )
    if not payload.get("email_verified"):
        raise ValueError("Google email is not verified")
    return {
        "name": payload.get("name") or payload["email"].split("@")[0],
        "email": payload["email"],
        "avatar": payload.get("picture"),
    }
