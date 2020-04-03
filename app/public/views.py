import json

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify,
)

from flask_login import (
    login_required,
    login_user,
    logout_user,
    current_user,
)
from app.extensions import login_manager, csrf_protect, db
# from app.public.forms import LoginForm
# from app.user.forms import RegisterForm
from app.user.models import User

blueprint = Blueprint("public", __name__, static_folder="../static")


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    return User.get_by_id(int(user_id))

@blueprint.route("/", methods=["GET", "POST"])
def home():
    return render_template("/public/home.html", form=None)

@blueprint.route("/about")
def about():
    return render_template("/public/about.html")