from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole, UserAvailability, ProfileVisibility
from sqlalchemy import text

def test_db_connection():
    """Test database connection"""
    try:
        # Test raw connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Raw connection test: {result.scalar() == 1}")
        
        # Test session
        db = SessionLocal()
        try:
            # Try to query users
            users = db.query(User).all()
            print(f"Session test: Found {len(users)} users")
            
            # Create a test user if none exists
            if len(users) == 0:
                test_user = User(
                    email="test@example.com",
                    username="testuser",
                    name="Test User",
                    hashed_password="hashed_password",
                    role=UserRole.USER,
                    availability=UserAvailability.ANYTIME,
                    visibility=ProfileVisibility.PUBLIC
                )
                db.add(test_user)
                db.commit()
                print("Created test user")
                
                # Verify user was created
                users = db.query(User).all()
                print(f"After creation: Found {len(users)} users")
            
            print("Database connection and operations successful!")
            return True
        finally:
            db.close()
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Test connection
    test_db_connection() 