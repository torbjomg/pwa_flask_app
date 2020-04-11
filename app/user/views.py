"""User views."""
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.extensions import login_manager, csrf_protect, db
from app.program.models import Program

blueprint = Blueprint("user", __name__, url_prefix="/users", static_folder="../static")

@blueprint.route("/")
@login_required
def members():
    """List members."""
    programs = Program.query.filter_by(user_id=current_user.id).all()
    return render_template("users/member_page.html", programs=programs)

@blueprint.route("/load_programs/", methods=["POST"])
@csrf_protect.exempt
@login_required
def load_programs():
    programs = Program.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        "programs": [
            {"name": program.name,
            "description": program.description,
            "programId": program.id
            } for program in programs
        ]
    })


@blueprint.route("/add_program/", methods=["POST"])
@csrf_protect.exempt
@login_required
def add_program():
    data = request.get_json()
    user_id = current_user.id
    new_program = Program(
        user_id=user_id,
        name=data["name"],
        description=data["description"],
    )
    try:
        new_program.save(commit=True)
    except IntegrityError as exc:
        return jsonify({
            "success": False,
            "result": "Program name taken",
            "exc": str(exc)
            })
    return jsonify({
        "success": True,
        "result": "Program saved to database",
        "name": data["name"],
        "description": data["description"],
        "programId": new_program.id
    })


@blueprint.route("/delete_program/", methods=["POST"])
@csrf_protect.exempt
@login_required
def delete_program():
    data = request.get_json()
    program = Program.query.filter_by(id=data["programId"])[0]
    result = program.delete(commit=True)
    return jsonify({
        "result": True,
        "programId": data["programId"]
    })
