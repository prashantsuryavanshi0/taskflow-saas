import smtplib
from email.message import EmailMessage

from flask import current_app


class GmailService:
    def send_email(self, to_email: str, subject: str, body: str) -> None:
        username = current_app.config["SMTP_USERNAME"]
        password = current_app.config["SMTP_PASSWORD"]

        if not username or not password:
            current_app.logger.warning(
                "SMTP credentials are not configured; skipped email to %s",
                to_email,
            )
            return

        try:
            message = EmailMessage()
            message["From"] = current_app.config["SMTP_FROM"]
            message["To"] = to_email
            message["Subject"] = subject
            message.set_content(body)

            with smtplib.SMTP(
                current_app.config["SMTP_HOST"],
                current_app.config["SMTP_PORT"],
                timeout=10,
            ) as smtp:
                smtp.starttls()
                smtp.login(username, password)
                smtp.send_message(message)

            current_app.logger.info(
                "Email sent successfully to %s",
                to_email,
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
                f"You have been assigned: {task.title}\n\n"
                f"Priority: {task.priority.value}\n"
                f"Status: {task.status.value}",
            )

    def task_completed(self, task) -> None:
        if task.creator:
            assignee = task.assignee.name if task.assignee else "A teammate"

            self.send_email(
                task.creator.email,
                "Task Completed",
                f"{assignee} completed the task: {task.title}",
            )


gmail_service = GmailService()