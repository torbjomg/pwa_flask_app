"""User views."""
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.extensions import login_manager, csrf_protect, db
from app.program.models import Program
from app.workout.models import Workout

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

@blueprint.route("/get_program_details/", methods=["POST"])
@csrf_protect.exempt
@login_required
def get_program_details():
    data = request.get_json()
    program_id = data["program_id"]
    workouts = Workout.query.filter_by(program=program_id)
    return jsonify({
        "workouts": [
            {
            "name": workout.name,
            "description": workout.description,
            "workoutId": workout.id
            } for workout in workouts
        ],
        "programId": program_id,
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


@blueprint.route("/add_workout/", methods=["POST"])
@csrf_protect.exempt
@login_required
def add_workout():
    data = request.get_json()
    user_id = current_user.id
    new_workout = Workout(
        user_id=user_id,
        name=data["name"],
        description=data["description"],
        program=data["program_id"],
    )
    try:
        new_workout.save(commit=True)
    except IntegrityError as exc:
        return jsonify({
            "success": False,
            "result": "Name Taken",
            "exc": str(exc),
        })
    return jsonify({
        "success": True,
        "result": "Workout saved to database",
        "name": data["name"],
        "description": data["description"],
        "workoutId": new_workout.id,
        "programId": data["program_id"],
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

@blueprint.route("/delete_workout/", methods=["POST"])
@csrf_protect.exempt
@login_required
def delete_workout():
    data = request.get_json()
    workout = Workout.query.filter_by(id=data["workoutId"])[0]
    result = workout.delete(commit=True)
    return jsonify({
        "result": True,
        "workoutId": data["workoutId"]
    })