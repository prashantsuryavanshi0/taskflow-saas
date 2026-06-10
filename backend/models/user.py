import uuid
from datetime import datetime, timezone

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    avatar = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    created_tasks = db.relationship("Task", foreign_keys="Task.created_by", back_populates="creator", lazy="dynamic")
    assigned_tasks = db.relationship("Task", foreign_keys="Task.assigned_to", back_populates="assignee", lazy="dynamic")

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "created_at": self.created_at.isoformat(),
        }
