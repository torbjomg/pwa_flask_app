# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
from flask import flash
from app.plan.models import Plan
from app.task.models import Task
from essential_generators import DocumentGenerator
from uuid import uuid4

GEN = DocumentGenerator()

def flash_errors(form, category="warning"):
    """Flash all errors for a form."""
    for field, errors in form.errors.items():
        for error in errors:
            flash(f"{getattr(form, field).label.text} - {error}", category)


def seed_data(user_id):
    """ seed new user profile with dummy data """
    for p in range(5):
        new_plan = Plan(
            user_id=user_id,
            name=GEN.sentence(),
            description=GEN.paragraph()
            )
        new_plan.save(commit=True)
        for t in range(3):
            new_task = Task(
                user_id=user_id,
                plan=new_plan.id,
                name=GEN.sentence(),
                description=GEN.paragraph()
            )
            new_task.save(commit=True)

