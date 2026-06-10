from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

from extensions import db
from models import User
from services.google_auth import verify_google_credential
from utils.validation import GoogleAuthSchema, validate_json

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/google")
def google_login():
    try:
        data = validate_json(GoogleAuthSchema(), request.get_json())
        profile = verify_google_credential(data["credential"])
    except (ValidationError, ValueError) as exc:
        return jsonify({"error": str(exc)}), 400

    user = User.query.filter_by(email=profile["email"]).first()
    if user:
        user.name = profile["name"]
        user.avatar = profile["avatar"]
    else:
        user = User(**profile)
        db.session.add(user)

    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.to_dict()})
