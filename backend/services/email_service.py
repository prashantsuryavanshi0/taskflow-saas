import resend
from flask import current_app


class EmailService:

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
    ) -> None:

        try:
            resend.api_key = current_app.config[
                "RESEND_API_KEY"
            ]

            resend.Emails.send(
                {
                    "from": "onboarding@resend.dev",
                    "to": [to_email],
                    "subject": subject,
                    "text": body,
                }
            )

            current_app.logger.info(
                f"Email sent successfully to {to_email}"
            )

        except Exception as e:
            current_app.logger.error(
                f"EMAIL ERROR: {str(e)}"
            )

    def task_assigned(self, task) -> None:
        if task.assignee:

            self.send_email(
                task.assignee.email,
                "New Task Assigned",
                f"""
You have been assigned a new task.

Title: {task.title}
Priority: {task.priority.value}
Status: {task.status.value}

Please check TaskFlow for details.
""",
            )

    def task_completed(self, task) -> None:

        if task.creator:

            assignee = (
                task.assignee.name
                if task.assignee
                else "A teammate"
            )

            self.send_email(
                task.creator.email,
                "Task Completed",
                f"""
{assignee} completed the task:

{task.title}

Please check TaskFlow for updates.
""",
            )


gmail_service = EmailService()