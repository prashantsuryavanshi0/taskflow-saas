from functools import wraps
from uuid import UUID

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from models import User


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        try:
            user_id = UUID(get_jwt_identity())
        except (TypeError, ValueError):
            return jsonify({"error": "Unauthorized"}), 401
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(user, *args, **kwargs)

    return wrapper
