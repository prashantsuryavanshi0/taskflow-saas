import os
from datetime import timedelta
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-too")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_EXPIRES_HOURS", "12"))
    )

    SQLALCHEMY_DATABASE_URI = ""
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # RESEND
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

    @staticmethod
    def database_url() -> str:
        url = os.getenv("DATABASE_URL", "")

        if url.startswith("postgres://"):
            url = url.replace(
                "postgres://",
                "postgresql://",
                1
            )

        if (
            url.startswith("postgresql://")
            and "sslmode=" not in url
        ):
            parts = urlsplit(url)
            host = parts.hostname or ""

            if host not in {
                "localhost",
                "127.0.0.1",
                "::1",
            }:
                query = dict(parse_qsl(parts.query))
                query["sslmode"] = "require"

                url = urlunsplit(
                    (
                        parts.scheme,
                        parts.netloc,
                        parts.path,
                        urlencode(query),
                        parts.fragment,
                    )
                )

        return url

    @staticmethod
    def validate() -> None:
        required = [
            "DATABASE_URL",
            "JWT_SECRET_KEY",
            "GOOGLE_CLIENT_ID",
            "RESEND_API_KEY",
        ]

        missing = [
            key
            for key in required
            if not os.getenv(key)
        ]

        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}"
            )


Config.SQLALCHEMY_DATABASE_URI = Config.database_url()