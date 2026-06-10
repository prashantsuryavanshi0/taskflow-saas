from flask import Blueprint, jsonify

from middleware.auth import require_auth
from models import User

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@require_auth
def list_users(_current_user):
    users = User.query.order_by(User.name.asc()).all()
    return jsonify([user.to_dict() for user in users])
