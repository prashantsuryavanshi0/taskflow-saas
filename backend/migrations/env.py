from logging.config import fileConfig

from alembic import context
from app import create_app
from extensions import db
from models import Task, User

config = context.config
fileConfig(config.config_file_name)

app = create_app()
target_metadata = db.metadata


def get_url():
    return app.config["SQLALCHEMY_DATABASE_URI"]


def run_migrations_offline():
    context.configure(url=get_url(), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    with app.app_context():
        connectable = db.engine
        with connectable.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
