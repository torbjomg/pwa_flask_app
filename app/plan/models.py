import datetime as datetime

from app.database import (
    Column,
    Model,
    db,
    relationship,
)

class Plan(Model):
    __tablename__ = "plan"
    user_id = Column(db.Integer, db.ForeignKey('users.id'))
    name = Column(db.String(120), nullable=False)
    id = Column(db.Integer, primary_key=True)
    description = Column(db.String(1200), nullable=True)