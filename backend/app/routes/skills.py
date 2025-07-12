from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..core.auth import get_current_user
from ..database import get_db
from ..models.user import User
from ..models.skill import SkillOffered, SkillWanted, SkillStatus
from ..schemas.skill import (
    SkillOfferedCreate, SkillOfferedUpdate, SkillOfferedInDB,
    SkillWantedCreate, SkillWantedUpdate, SkillWantedInDB,
    SkillSearch, SkillSearchResult
)

router = APIRouter(prefix="/skills", tags=["skills"])


# Skills offered routes
@router.post("/offered", response_model=SkillOfferedInDB, status_code=status.HTTP_201_CREATED)
async def create_skill_offered(
    skill: SkillOfferedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new skill offered
    """
    db_skill = SkillOffered(
        user_id=current_user.id,
        name=skill.name,
        description=skill.description
    )
    
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


@router.get("/offered", response_model=List[SkillOfferedInDB])
async def get_current_user_skills_offered(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all skills offered by current user
    """
    return db.query(SkillOffered).filter(SkillOffered.user_id == current_user.id).all()


@router.get("/offered/{skill_id}", response_model=SkillOfferedInDB)
async def get_skill_offered(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a skill offered by ID
    """
    skill = db.query(SkillOffered).filter(SkillOffered.id == skill_id).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return skill


@router.put("/offered/{skill_id}", response_model=SkillOfferedInDB)
async def update_skill_offered(
    skill_id: int,
    skill_update: SkillOfferedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a skill offered
    """
    db_skill = db.query(SkillOffered).filter(
        SkillOffered.id == skill_id,
        SkillOffered.user_id == current_user.id
    ).first()
    
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or not owned by you"
        )
    
    # Update skill
    update_data = skill_update.dict(exclude_unset=True)
    
    # Only admin can update status
    if "status" in update_data and current_user.role != "admin":
        del update_data["status"]
    
    for field, value in update_data.items():
        setattr(db_skill, field, value)
    
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


@router.delete("/offered/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill_offered(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Delete a skill offered
    """
    db_skill = db.query(SkillOffered).filter(
        SkillOffered.id == skill_id,
        SkillOffered.user_id == current_user.id
    ).first()
    
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or not owned by you"
        )
    
    db.delete(db_skill)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Skills wanted routes
@router.post("/wanted", response_model=SkillWantedInDB, status_code=status.HTTP_201_CREATED)
async def create_skill_wanted(
    skill: SkillWantedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new skill wanted
    """
    db_skill = SkillWanted(
        user_id=current_user.id,
        name=skill.name,
        description=skill.description
    )
    
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


@router.get("/wanted", response_model=List[SkillWantedInDB])
async def get_current_user_skills_wanted(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all skills wanted by current user
    """
    return db.query(SkillWanted).filter(SkillWanted.user_id == current_user.id).all()


@router.get("/wanted/{skill_id}", response_model=SkillWantedInDB)
async def get_skill_wanted(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a skill wanted by ID
    """
    skill = db.query(SkillWanted).filter(SkillWanted.id == skill_id).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return skill


@router.put("/wanted/{skill_id}", response_model=SkillWantedInDB)
async def update_skill_wanted(
    skill_id: int,
    skill_update: SkillWantedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a skill wanted
    """
    db_skill = db.query(SkillWanted).filter(
        SkillWanted.id == skill_id,
        SkillWanted.user_id == current_user.id
    ).first()
    
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or not owned by you"
        )
    
    # Update skill
    update_data = skill_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_skill, field, value)
    
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    return db_skill


@router.delete("/wanted/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill_wanted(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Delete a skill wanted (only by the user who added it)
    """
    db_skill = db.query(SkillWanted).filter(
        SkillWanted.id == skill_id,
        SkillWanted.user_id == current_user.id
    ).first()
    
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or not owned by you"
        )
    
    db.delete(db_skill)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)



# Skill search
@router.get("/search", response_model=List[SkillSearchResult])
async def search_skills(
    query: str,
    skill_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Search for skills by name
    """
    results = []
    
    # Search skills offered
    if not skill_type or skill_type == "offered":
        skills_offered = db.query(SkillOffered).join(User).filter(
            SkillOffered.name.ilike(f"%{query}%"),
            SkillOffered.status == SkillStatus.APPROVED,
            User.is_active == True,
            User.is_banned == False
        ).all()
        
        for skill in skills_offered:
            results.append({
                "skill_id": skill.id,
                "skill_type": "offered",
                "name": skill.name,
                "description": skill.description,
                "user_id": skill.user_id,
                "username": skill.user.username,
                "user_name": skill.user.name
            })
    
    # Search skills wanted
    if not skill_type or skill_type == "wanted":
        skills_wanted = db.query(SkillWanted).join(User).filter(
            SkillWanted.name.ilike(f"%{query}%"),
            User.is_active == True,
            User.is_banned == False
        ).all()
        
        for skill in skills_wanted:
            results.append({
                "skill_id": skill.id,
                "skill_type": "wanted",
                "name": skill.name,
                "description": skill.description,
                "user_id": skill.user_id,
                "username": skill.user.username,
                "user_name": skill.user.name
            })
    
    return results
