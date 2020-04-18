from flask import (
    Blueprint,
    current_app,
    render_template,
    redirect,
    request,
    jsonify,    
)

from sqlalchemy.exc import IntegrityError

from flask_login import (
    login_required,
    login_user,
    logout_user,
    current_user,
)
from app.extensions import login_manager, csrf_protect, db
from app.plan.models import Plan

blueprint = Blueprint("plan", __name__, static_folder=".:/static")

