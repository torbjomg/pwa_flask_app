import logging
import sys

from flask import Flask, render_template

from app import public, user, program, workout, exercise
from app.program.models import Program
from app.workout.models import Workout
from app.exercise.models import Exercise

from app.extensions import (
    bcrypt,
    csrf_protect,
    login_manager,
    db,
    migrate,
    cache,
    debug_toolbar,
    flask_static_digest,
)

def create_app(config_object="app.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split(".")[0])
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    return app


def register_extensions(app):
    """register Flask extensions."""
    bcrypt.init_app(app)
    csrf_protect.init_app(app)
    login_manager.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    cache.init_app(app)
    debug_toolbar.init_app(app)
    flask_static_digest.init_app(app)
    

def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(program.views.blueprint)
    app.register_blueprint(workout.views.blueprint)
    app.register_blueprint(exercise.views.blueprint)
    app.register_blueprint(public.views.blueprint)
    app.register_blueprint(user.views.blueprint)


def register_errorhandlers(app):
    def render_error(error):
        error_code = getattr(error, "code", 500)
        return render_template(f"{error-code}.html"), error_code

    for errcode in [401, 404, 500]:
        app.errorhandler(errcode)(render_error)


def register_shellcontext(app):

    def shell_context():
        return {
            "db": db,
            "User": user.models.User,
        }

    app.shell_context_processor(shell_context)


def configure_logger(app):
    handler = logging.StreamHandler(sys.stdout)
    if not app.logger.handlers:
        app.logger.addHandler(handler)
