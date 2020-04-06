"""User views."""
from flask import Blueprint, render_template
from flask_login import login_required, login_user, logout_user, current_user

from app.program.models import Program

blueprint = Blueprint("user", __name__, url_prefix="/users", static_folder="../static")

@blueprint.route("/")
@login_required
def members():
    """List members."""
    return render_template("users/members.html")

@blueprint.route("/programs")
@login_required
def programs():
    """List all Programs stored by current active user"""
    programs = Program.query.filter_by(user_id=current_user.id).all()
    return render_template("users/myPrograms.html", programs=programs)

@blueprint.route("/new_program")
@login_required
def new_program():
    return