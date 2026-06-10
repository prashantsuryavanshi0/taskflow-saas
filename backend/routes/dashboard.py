from flask import Blueprint, jsonify
from sqlalchemy import func

from middleware.auth import require_auth
from models import Task

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/stats")
@require_auth
def stats(_current_user):
    status_rows = (
        Task.query.with_entities(Task.status, func.count(Task.id))
        .group_by(Task.status)
        .all()
    )
    priority_rows = (
        Task.query.with_entities(Task.priority, func.count(Task.id))
        .group_by(Task.priority)
        .all()
    )
    recent = Task.query.order_by(Task.updated_at.desc()).limit(8).all()
    by_status = {status.value: count for status, count in status_rows}
    by_priority = {priority.value: count for priority, count in priority_rows}
    return jsonify(
        {
            "total": sum(by_status.values()),
            "pending": by_status.get("todo", 0),
            "in_progress": by_status.get("in_progress", 0),
            "completed": by_status.get("completed", 0),
            "by_status": by_status,
            "by_priority": by_priority,
            "recent_activity": [task.to_dict() for task in recent],
        }
    )
