from datetime import datetime

from marshmallow import Schema, ValidationError, fields, validate, validates_schema


class GoogleAuthSchema(Schema):
    credential = fields.String(required=True)


class TaskSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=180))
    description = fields.String(allow_none=True, load_default=None)
    priority = fields.String(validate=validate.OneOf(["low", "medium", "high", "urgent"]), load_default="medium")
    status = fields.String(validate=validate.OneOf(["todo", "in_progress", "completed"]), load_default="todo")
    due_date = fields.String(allow_none=True, load_default=None)
    assigned_to = fields.UUID(allow_none=True, load_default=None)

    @validates_schema
    def parse_due_date(self, data, **_):
        if data.get("due_date"):
            try:
                data["due_date"] = datetime.fromisoformat(data["due_date"].replace("Z", "+00:00"))
            except ValueError as exc:
                raise ValidationError({"due_date": ["Must be an ISO-8601 datetime"]}) from exc


class TaskUpdateSchema(TaskSchema):
    title = fields.String(validate=validate.Length(min=1, max=180))


class StatusSchema(Schema):
    status = fields.String(required=True, validate=validate.OneOf(["todo", "in_progress", "completed"]))


def validate_json(schema: Schema, payload: dict):
    return schema.load(payload or {})
