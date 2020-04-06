import datetime as datetime

from app.database import (
    Column,
    Model,
    db,
    relationship,
)

class Program(Model):
    __tablename__ = "program"
    user_id = Column(db.Integer, db.ForeignKey('user.id'))
    name = Column(db.String(120), nullable=False)
    id = Column(db.Integer, primary_key=True)
    description = Column(db.String(1200), nullable=True)