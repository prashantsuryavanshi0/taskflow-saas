import smtplib
from email.message import EmailMessage

from flask import current_app


class GmailService:
    def send_email(self, to_email: str, subject: str, body: str) -> None:
        username = current_app.config.get("SMTP_USERNAME")
        password = current_app.config.get("SMTP_PASSWORD")
        host = current_app.config.get("SMTP_HOST", "smtp.gmail.com")
        port = int(current_app.config.get("SMTP_PORT", 587))

        if not username or not password:
            current_app.logger.warning(
                "SMTP credentials are not configured; skipped email to %s",
                to_email,
            )
            return

        try:
            current_app.logger.info(
                f"Connecting to SMTP server {host}:{port}"
            )

            message = EmailMessage()
            message["From"] = current_app.config.get("SMTP_FROM", username)
            message["To"] = to_email
            message["Subject"] = subject
            message.set_content(body)

            with smtplib.SMTP(host, port, timeout=20) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()

                current_app.logger.info("SMTP TLS started")

                smtp.login(username, password)

                current_app.logger.info("SMTP login successful")

                smtp.send_message(message)

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
                f"""You have been assigned a new task.

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
                f"""{assignee} completed the task:

{task.title}

Please check TaskFlow for updates.
""",
            )


gmail_service = GmailService()