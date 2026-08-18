import logging
import uuid
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from shared.models import Base, Tenant, User
from shared.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("seed")


def main():
    logger.info("Starting seed script...")
    
    # We must use a sync engine for seeding, or we could use async engine, but the prompt says:
    # "Uses the sync database URL (not async) for simplicity"
    # The config defines DATABASE_URL_SYNC if it's there.
    # Otherwise we replace +asyncpg with empty.
    sync_url = os.environ.get("DATABASE_URL_SYNC")
    if not sync_url:
        sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
    
    logger.info("Connecting to database...")
    engine = create_engine(sync_url)
    Session = sessionmaker(bind=engine)
    
    with Session() as session:
        try:
            # 1. Create a test tenant
            tenant = session.query(Tenant).filter_by(slug="al-noor").first()
            if not tenant:
                logger.info("Creating tenant 'Al-Noor Mosque'")
                tenant = Tenant(
                    name="Al-Noor Mosque",
                    slug="al-noor",
                    plan="pro"
                )
                session.add(tenant)
                session.commit()
            else:
                logger.info("Tenant 'Al-Noor Mosque' already exists")
            
            # 2. Users
            users_data = [
                {"email": "admin@al-noor.test", "role": "admin", "name": "Admin User"},
                {"email": "imam@al-noor.test", "role": "imam", "name": "Sheikh Ahmad"},
                {"email": "operator@al-noor.test", "role": "operator", "name": "AV Operator"}
            ]
            
            password = b"minbar_dev_123"
            hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")
            
            for u in users_data:
                user = session.query(User).filter_by(email=u["email"]).first()
                if not user:
                    logger.info(f"Creating user {u['email']}")
                    user = User(
                        tenant_id=tenant.id,
                        email=u["email"],
                        password_hash=hashed,
                        full_name=u["name"],
                        role=u["role"]
                    )
                    session.add(user)
                else:
                    logger.info(f"User {u['email']} already exists")
            
            session.commit()
            logger.info("Seed completed successfully")
            
        except Exception as e:
            logger.error(f"Error during seeding: {e}")
            session.rollback()

if __name__ == "__main__":
    main()
