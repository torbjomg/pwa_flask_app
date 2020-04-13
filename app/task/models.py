import datetime as datetime

from app.database import (
    Column,
    Model,
    db,
    relationship,
)

class Task(Model):
    __tablename__ = "task"
    user_id = Column(db.Integer, db.ForeignKey('users.id'))
    plan = Column(db.Integer, db.ForeignKey('plan.id'))
    name = Column(db.String(120), unique=True, nullable=False)
    id = Column(db.Integer, primary_key=True)
    description = Column(db.String(1200), nullable=False)
    