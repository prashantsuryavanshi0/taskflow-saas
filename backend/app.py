from flask import Flask, jsonify
from flask_cors import CORS
from marshmallow import ValidationError
from sqlalchemy import text

from config import Config
from extensions import db, jwt, migrate
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.tasks import tasks_bp
from routes.users import users_bp


def create_app() -> Flask:
    Config.validate()
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": [Config.FRONTEND_URL]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(tasks_bp, url_prefix="/tasks")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")

    @app.get("/health")
    def health():
        db.session.execute(text("select 1"))
        return jsonify({"status": "ok"})

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(ValidationError)
    def validation_error(error):
        return jsonify({"error": error.messages}), 400

    @app.errorhandler(Exception)
    def server_error(error):
        app.logger.exception(error)
        return jsonify({"error": "Internal server error"}), 500

    @jwt.unauthorized_loader
    def missing_token(error):
        return jsonify({"error": error}), 401

    @jwt.invalid_token_loader
    def invalid_token(error):
        return jsonify({"error": error}), 422

    @jwt.expired_token_loader
    def expired_token(_header, _payload):
        return jsonify({"error": "Token has expired"}), 401

    return app


app = create_app()
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)