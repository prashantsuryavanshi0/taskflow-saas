import enum
import uuid
from datetime import datetime, timezone

from extensions import db


class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Enum(TaskPriority), nullable=False, default=TaskPriority.medium)
    status = db.Column(db.Enum(TaskStatus), nullable=False, default=TaskStatus.todo, index=True)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_to = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator = db.relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
    assignee = db.relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tasks")

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value,
            "status": self.status.value,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "created_by": str(self.created_by),
            "assigned_to": str(self.assigned_to) if self.assigned_to else None,
            "creator": self.creator.to_dict() if self.creator else None,
            "assignee": self.assignee.to_dict() if self.assignee else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
