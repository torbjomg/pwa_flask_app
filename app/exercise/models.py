import datetime as dt

from app.database import (
    Column,
    Model,
    db,
    relationship,
)

class Exercise(Model):
    __tablename__ = "exercise"
    user_id = Column(db.Integer, db.ForeignKey('users.id'))
    workout = Column(db.Integer, db.ForeignKey('workout.id'))
    name = Column(db.String(40), unique=True, nullable=False)
    id = Column(db.Integer, primary_key=True)
    description = Column(db.String(300), nullable=False)
    frequency_lower = Column(db.Integer)
    frequency_upper = Column(db.Integer)
    completetion_type = Column(db.Integer)