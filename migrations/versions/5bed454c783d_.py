"""empty message

Revision ID: 5bed454c783d
Revises: e6e803f959af
Create Date: 2020-04-13 15:51:39.083447

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5bed454c783d'
down_revision = 'e6e803f959af'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('plan',
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=1200), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('program')
    op.add_column('task', sa.Column('plan', sa.Integer(), nullable=True))
    op.drop_constraint(None, 'task', type_='foreignkey')
    op.create_foreign_key(None, 'task', 'plan', ['plan'], ['id'])
    op.drop_column('task', 'program')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('task', sa.Column('program', sa.INTEGER(), nullable=True))
    op.drop_constraint(None, 'task', type_='foreignkey')
    op.create_foreign_key(None, 'task', 'program', ['program'], ['id'])
    op.drop_column('task', 'plan')
    op.create_table('program',
    sa.Column('user_id', sa.INTEGER(), nullable=True),
    sa.Column('name', sa.VARCHAR(length=120), nullable=False),
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('description', sa.VARCHAR(length=1200), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('plan')
    # ### end Alembic commands ###
