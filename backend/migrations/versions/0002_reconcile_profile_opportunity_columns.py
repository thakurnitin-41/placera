"""Add fields needed by the persisted API without rewriting the initial migration.

The initial milestone's migration used ORM metadata dynamically. This guarded follow-up
works both for databases created from that version and fresh databases where the
initial revision already created the newer columns.
"""
from alembic import op
import sqlalchemy as sa
revision="0002_reconcile_api_columns"
down_revision="0001_initial"
branch_labels=None
depends_on=None

def upgrade():
    inspector=sa.inspect(op.get_bind())
    tables=set(inspector.get_table_names())
    if "student_profiles" in tables:
        columns={c["name"] for c in inspector.get_columns("student_profiles")}
        if "name" not in columns:
            op.add_column("student_profiles",sa.Column("name",sa.String(length=160),nullable=True))
        if "skills" not in columns:
            op.add_column("student_profiles",sa.Column("skills",sa.JSON(),nullable=True))
    inspector=sa.inspect(op.get_bind())
    tables=set(inspector.get_table_names())
    if "opportunities" in tables:
        columns={c["name"] for c in inspector.get_columns("opportunities")}
        if "required_skills" not in columns:
            op.add_column("opportunities",sa.Column("required_skills",sa.JSON(),nullable=True))

def downgrade():
    inspector=sa.inspect(op.get_bind())
    tables=set(inspector.get_table_names())
    if "opportunities" in tables and "required_skills" in {c["name"] for c in inspector.get_columns("opportunities")}:
        op.drop_column("opportunities","required_skills")
    if "student_profiles" in tables:
        columns={c["name"] for c in inspector.get_columns("student_profiles")}
        if "skills" in columns: op.drop_column("student_profiles","skills")
        if "name" in columns: op.drop_column("student_profiles","name")