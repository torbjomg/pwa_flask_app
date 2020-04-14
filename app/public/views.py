import json

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    send_from_directory,
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
from app.public.forms import LoginForm
from app.user.forms import RegisterForm
from app.user.models import User
from app.utils import flash_errors, seed_data

blueprint = Blueprint("public", __name__, static_folder="../static")


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    return User.get_by_id(int(user_id))


@blueprint.route("/", methods=["GET", "POST"])
def home():
    """Home page."""
    form = LoginForm(request.form)
    current_app.logger.info("Hello from the home page!")
    # Handle logging in
    if request.method == "POST":
        if form.validate_on_submit():
            login_user(form.user)
            flash("You are logged in.", "success")
            redirect_url = request.args.get("next") or url_for("user.members")
            return redirect(redirect_url)
        else:
            flash_errors(form)
    return render_template("public/home.html", form=form)


@blueprint.route("/logout/")
@login_required
def logout():
    """Logout."""
    logout_user()
    flash("You are logged out.", "info")
    return redirect(url_for("public.home"))


@blueprint.route("/register/", methods=["GET", "POST"])
def register():
    """Register new user."""
    form = RegisterForm(request.form)
    if form.validate_on_submit():
        user = User.create(
            username=form.username.data,
            email=form.email.data,
            password=form.password.data,
            active=True,
        )
        seed_data(user.id)
        flash("Thank you for registering. You can now log in. (user was seeded with some random data)", "success")
        return redirect(url_for("public.home"))
    else:
        flash_errors(form)
    return render_template("public/register.html", form=form)


@blueprint.route("/about")
def about():
    return render_template("/public/about.html")


@blueprint.route("/manifest.json")
def manifest():
    return send_from_directory("static", "manifest.json")

@blueprint.route("/sw.js")
def sw():
    return current_app.send_static_file("sw.js")

