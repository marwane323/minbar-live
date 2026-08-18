"""initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # We must enable the pg_trgm extension for fuzzy search
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    
    # 1. Tenants table
    op.create_table('tenants',
        sa.Column('id', sa.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('slug', sa.String(length=63), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('plan', sa.String(length=50), server_default='free', nullable=False),
        sa.Column('branding', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )

    # 2. Users table
    op.create_table('users',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=320), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), server_default='listener', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    # RLS
    op.execute('ALTER TABLE users ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY users_tenant_policy ON users USING (tenant_id = current_setting('app.tenant_id')::UUID);")

    # 3. Khutba scripts
    op.create_table('khutba_scripts',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('imam_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('topic_hint', sa.Text(), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=10), server_default='ar', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['imam_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('ALTER TABLE khutba_scripts ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY khutba_scripts_tenant_policy ON khutba_scripts USING (tenant_id = current_setting('app.tenant_id')::UUID);")

    # 4. Khutba segments (inherits tenant implicitly, but let's see if we add RLS. The requirements didn't explicitly say RLS on segments, just tenant-scoped tables: users, sessions, khutba_scripts, session_events, voice_profiles, audit_logs)
    op.create_table('khutba_segments',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('script_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('sequence_number', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('segment_type', sa.String(length=20), server_default='speech', nullable=False),
        sa.Column('quran_reference', sa.String(length=20), nullable=True),
        sa.Column('hadith_reference', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['script_id'], ['khutba_scripts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('script_id', 'sequence_number', name='uq_script_seq')
    )

    # 5. Segment translations
    op.create_table('segment_translations',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('segment_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('translation', sa.Text(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('audio_s3_key', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['segment_id'], ['khutba_segments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('segment_id', 'language', name='uq_segment_lang')
    )

    # 6. Sessions
    op.create_table('sessions',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('imam_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('source_language', sa.String(length=10), server_default='ar', nullable=False),
        sa.Column('target_languages', postgresql.ARRAY(sa.Text()), server_default="{'en'}", nullable=False),
        sa.Column('status', sa.String(length=20), server_default='preparing', nullable=False),
        sa.Column('khutba_script_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('listener_count_peak', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_public', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('recording_s3_key', sa.String(length=500), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['imam_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['khutba_script_id'], ['khutba_scripts.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY sessions_tenant_policy ON sessions USING (tenant_id = current_setting('app.tenant_id')::UUID);")
    op.create_index('ix_sessions_tenant_status', 'sessions', ['tenant_id', 'status'])

    # 7. Session Events
    op.create_table('session_events',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('sequence_number', sa.Integer(), nullable=True),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY session_events_tenant_policy ON session_events USING (tenant_id = current_setting('app.tenant_id')::UUID);")
    op.create_index('ix_session_events_session_sequence', 'session_events', ['session_id', 'sequence_number'])

    # 8. Voice Profiles
    op.create_table('voice_profiles',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('imam_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('sample_s3_key', sa.String(length=500), nullable=True),
        sa.Column('profile_s3_key', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('consent_given_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consent_ip', sa.String(length=45), nullable=True),
        sa.ForeignKeyConstraint(['imam_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY voice_profiles_tenant_policy ON voice_profiles USING (tenant_id = current_setting('app.tenant_id')::UUID);")

    # 9. Quran Verses Cache
    op.create_table('quran_verses_cache',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('surah_number', sa.Integer(), nullable=False),
        sa.Column('ayah_number', sa.Integer(), nullable=False),
        sa.Column('arabic_text', sa.Text(), nullable=False),
        sa.Column('arabic_normalized', sa.Text(), nullable=False),
        sa.Column('translations', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('surah_number', 'ayah_number', name='uq_surah_ayah')
    )
    op.execute("CREATE INDEX ix_quran_verses_arabic_norm_trgm ON quran_verses_cache USING gin (arabic_normalized gin_trgm_ops);")

    # 10. Hadith Cache
    op.create_table('hadith_cache',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('collection', sa.String(length=100), nullable=False),
        sa.Column('hadith_number', sa.String(length=50), nullable=False),
        sa.Column('arabic_text', sa.Text(), nullable=False),
        sa.Column('arabic_normalized', sa.Text(), nullable=False),
        sa.Column('translations', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('grade', sa.String(length=50), nullable=True),
        sa.Column('narrator_chain', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('collection', 'hadith_number', name='uq_coll_hadith')
    )
    op.execute("CREATE INDEX ix_hadith_cache_arabic_norm_trgm ON hadith_cache USING gin (arabic_normalized gin_trgm_ops);")

    # 11. Audit Logs
    op.create_table('audit_logs',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;')
    op.execute("CREATE POLICY audit_logs_tenant_policy ON audit_logs USING (tenant_id = current_setting('app.tenant_id')::UUID);")


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('hadith_cache')
    op.drop_table('quran_verses_cache')
    op.drop_table('voice_profiles')
    op.drop_table('session_events')
    op.drop_table('sessions')
    op.drop_table('segment_translations')
    op.drop_table('khutba_segments')
    op.drop_table('khutba_scripts')
    op.drop_table('users')
    op.drop_table('tenants')
    op.execute('DROP EXTENSION IF EXISTS pg_trgm;')
