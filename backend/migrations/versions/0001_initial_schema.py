"""Create the initial Placera PBL schema."""
from alembic import op
from placera_ai.db import Base
from placera_ai import orm_models  # register metadata
revision="0001_initial"
down_revision=None
branch_labels=None
depends_on=None
def upgrade(): Base.metadata.create_all(bind=op.get_bind())
def downgrade(): Base.metadata.drop_all(bind=op.get_bind())