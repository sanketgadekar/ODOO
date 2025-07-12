from app.schemas.user import UserCreate, UserUpdate, UserInDB, UserPublic
from app.schemas.skill import SkillOfferedCreate, SkillWantedCreate, SkillSearch
from app.schemas.swap import SwapCreate, FeedbackCreate
from app.models.user import UserRole, UserAvailability, ProfileVisibility
from datetime import datetime

# Test UserCreate
user_create = UserCreate(
    email="test@example.com",
    username="testuser",
    name="Test User",
    password="password123"
)
print("UserCreate validation successful")

# Test UserUpdate
user_update = UserUpdate(
    name="Updated Name",
    bio="This is my updated bio"
)
print("UserUpdate validation successful")

# Test SkillOfferedCreate
skill_offered = SkillOfferedCreate(
    name="Python Programming",
    description="Teaching Python programming"
)
print("SkillOfferedCreate validation successful")

# Test SkillWantedCreate
skill_wanted = SkillWantedCreate(
    name="Guitar Lessons",
    description="Want to learn guitar"
)
print("SkillWantedCreate validation successful")

# Test SkillSearch
skill_search = SkillSearch(
    query="programming",
    skill_type="offered"
)
print("SkillSearch validation successful")

# Test SwapCreate
swap_create = SwapCreate(
    provider_id=1,
    skill_offered_id=1,
    skill_wanted_id=2,
    message="I would like to swap skills"
)
print("SwapCreate validation successful")

# Test FeedbackCreate
feedback_create = FeedbackCreate(
    swap_id=1,
    receiver_id=2,
    rating=4.5,
    comment="Great teacher!"
)
print("FeedbackCreate validation successful")

print("All validations successful!") 