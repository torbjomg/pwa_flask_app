"""User views."""
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from app.extensions import login_manager, csrf_protect, db
from app.plan.models import Plan
from app.task.models import Task

blueprint = Blueprint("user", __name__, url_prefix="/users", static_folder="../static")

@blueprint.route("/")
@login_required
def members():
    """List members."""
    plans = Plan.query.filter_by(user_id=current_user.id).all()
    return render_template("users/member_page.html", plans=plans)

@blueprint.route("/load_plans/", methods=["POST"])
@csrf_protect.exempt
@login_required
def load_plans():
    plans = Plan.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        "plans": [
            {"name": plan.name,
            "description": plan.description,
            "planId": plan.id
            } for plan in plans
        ]
    })

@blueprint.route("/get_plan_details/", methods=["POST"])
@csrf_protect.exempt
@login_required
def get_plan_details():
    data = request.get_json()
    plan_id = data["plan_id"]
    tasks = Task.query.filter_by(plan=plan_id)
    return jsonify({
        "tasks": [
            {
            "name": task.name,
            "description": task.description,
            "taskId": task.id
            } for task in tasks
        ],
        "planId": plan_id,
    })


@blueprint.route("/add_plan/", methods=["POST"])
@csrf_protect.exempt
@login_required
def add_plan():
    data = request.get_json()
    user_id = current_user.id
    new_plan = Plan(
        user_id=user_id,
        name=data["name"],
        description=data["description"],
    )
    try:
        new_plan.save(commit=True)
    except IntegrityError as exc:
        return jsonify({
            "success": False,
            "result": "Plan name taken",
            "exc": str(exc)
            })
    return jsonify({
        "success": True,
        "result": "Plan saved to database",
        "name": data["name"],
        "description": data["description"],
        "planId": new_plan.id
    })


@blueprint.route("/add_task/", methods=["POST"])
@csrf_protect.exempt
@login_required
def add_task():
    data = request.get_json()
    user_id = current_user.id
    new_task = Task(
        user_id=user_id,
        name=data["name"],
        description=data["description"],
        plan=data["plan_id"],
    )
    try:
        new_task.save(commit=True)
    except IntegrityError as exc:
        return jsonify({
            "success": False,
            "result": "Name Taken",
            "exc": str(exc),
        })
    return jsonify({
        "success": True,
        "result": "Task saved to database",
        "name": data["name"],
        "description": data["description"],
        "taskId": new_task.id,
        "planId": data["plan_id"],
    })


@blueprint.route("/delete_plan/", methods=["POST"])
@csrf_protect.exempt
@login_required
def delete_plan():
    data = request.get_json()
    plan = Plan.query.filter_by(id=data["planId"])[0]
    result = plan.delete(commit=True)
    return jsonify({
        "result": True,
        "planId": data["planId"]
    })

@blueprint.route("/delete_task/", methods=["POST"])
@csrf_protect.exempt
@login_required
def delete_task():
    data = request.get_json()
    task = Task.query.filter_by(id=data["taskId"])[0]
    result = task.delete(commit=True)
    return jsonify({
        "result": True,
        "taskId": data["taskId"]
    })