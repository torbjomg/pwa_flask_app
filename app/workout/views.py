from flask import (
    Blueprint,
    current_app,
    render_template,
    redirect,
    request,
    jsonify,    
)

from flask_login import (
    login_required,
    login_user,
    logout_user,
    current_user,
)
from app.extensions import login_manager, csrf_protect, db

blueprint = Blueprint("workout", __name__, static_folder=".:/static")
