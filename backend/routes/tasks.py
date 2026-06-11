import uuid

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from sqlalchemy import or_

from extensions import db
from middleware.auth import require_auth
from models import Task, TaskPriority, TaskStatus, User
from services.email_service import gmail_service
from utils.validation import StatusSchema, TaskSchema, TaskUpdateSchema, validate_json

tasks_bp = Blueprint("tasks", __name__)


def get_task_or_404(task_id):
    try:
        parsed_id = uuid.UUID(task_id)
    except ValueError:
        return None
    return Task.query.get(parsed_id)


@tasks_bp.get("")
@require_auth
def list_tasks(current_user):
    query = Task.query
    assigned = request.args.get("assigned")
    search = request.args.get("search")
    status = request.args.get("status")
    priority = request.args.get("priority")
    sort = request.args.get("sort", "updated_at")

    if assigned == "me":
        query = query.filter(Task.assigned_to == current_user.id)
    if search:
        query = query.filter(or_(Task.title.ilike(f"%{search}%"), Task.description.ilike(f"%{search}%")))
    if status:
        try:
            query = query.filter(Task.status == TaskStatus(status))
        except ValueError:
            return jsonify({"error": "Invalid status filter"}), 400
    if priority:
        try:
            query = query.filter(Task.priority == TaskPriority(priority))
        except ValueError:
            return jsonify({"error": "Invalid priority filter"}), 400

    if sort not in {"updated_at", "due_date", "created_at"}:
        return jsonify({"error": "Invalid sort field"}), 400
    sort_column = {"due_date": Task.due_date, "created_at": Task.created_at}.get(sort, Task.updated_at)
    tasks = query.order_by(sort_column.desc().nullslast()).all()
    return jsonify([task.to_dict() for task in tasks])


@tasks_bp.post("")
@require_auth
def create_task(current_user):
    try:
        data = validate_json(TaskSchema(), request.get_json())
    except ValidationError as exc:
        return jsonify({"error": exc.messages}), 400

    if data.get("assigned_to") and not User.query.get(data["assigned_to"]):
        return jsonify({"error": "Assigned user does not exist"}), 400

    task = Task(
        title=data["title"],
        description=data["description"],
        priority=TaskPriority(data["priority"]),
        status=TaskStatus(data["status"]),
        due_date=data["due_date"],
        created_by=current_user.id,
        assigned_to=data["assigned_to"],
    )
    db.session.add(task)
    db.session.commit()
    gmail_service.task_assigned(task)
    return jsonify(task.to_dict()), 201


@tasks_bp.put("/<task_id>")
@require_auth
def update_task(_current_user, task_id):
    task = get_task_or_404(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    try:
        data = TaskUpdateSchema(partial=True).load(request.get_json() or {})
    except ValidationError as exc:
        return jsonify({"error": exc.messages}), 400

    old_assignee = task.assigned_to
    old_status = task.status
    if data.get("assigned_to") and not User.query.get(data["assigned_to"]):
        return jsonify({"error": "Assigned user does not exist"}), 400

    for key in ["title", "description", "due_date", "assigned_to"]:
        if key in data:
            setattr(task, key, data[key])
    if "priority" in data:
        task.priority = TaskPriority(data["priority"])
    if "status" in data:
        task.status = TaskStatus(data["status"])

    db.session.commit()
    if task.assigned_to and task.assigned_to != old_assignee:
      gmail_service.task_assigned(task)

    if task.status == TaskStatus.completed and old_status != TaskStatus.completed:
      gmail_service.task_completed(task)
    return jsonify(task.to_dict())


@tasks_bp.delete("/<task_id>")
@require_auth
def delete_task(_current_user, task_id):
    task = get_task_or_404(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"deleted": True})


@tasks_bp.patch("/<task_id>/status")
@require_auth
def update_status(_current_user, task_id):
    task = get_task_or_404(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    try:
        data = validate_json(StatusSchema(), request.get_json())
    except ValidationError as exc:
        return jsonify({"error": exc.messages}), 400

    old_status = task.status
    task.status = TaskStatus(data["status"])
    db.session.commit()
    if task.status == TaskStatus.completed and old_status != TaskStatus.completed:
        gmail_service.task_completed(task)
    return jsonify(task.to_dict())
