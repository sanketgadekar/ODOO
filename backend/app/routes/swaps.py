from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session, joinedload

from ..core.auth import get_current_user
from ..database import get_db
from ..models.user import User
from ..models.swap import Swap, Feedback, SwapStatus
from ..schemas.swap import (
    SwapCreate, SwapUpdate, SwapInDB, SwapWithDetails,
    FeedbackCreate, FeedbackInDB, FeedbackWithDetails
)

router = APIRouter(prefix="/swaps", tags=["swaps"])


# Swap routes
@router.post("", response_model=SwapInDB, status_code=status.HTTP_201_CREATED)
async def create_swap(
    swap: SwapCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new swap request
    """
    # Check if provider exists
    provider = db.query(User).filter(User.id == swap.provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Check if skill offered exists
    if swap.skill_offered_id:
        skill_offered = db.query("SkillOffered").filter_by(id=swap.skill_offered_id).first()
        if not skill_offered:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill offered not found"
            )
    
    # Check if skill wanted exists
    if swap.skill_wanted_id:
        skill_wanted = db.query("SkillWanted").filter_by(id=swap.skill_wanted_id).first()
        if not skill_wanted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill wanted not found"
            )
    
    # Create swap
    db_swap = Swap(
        requester_id=current_user.id,
        provider_id=swap.provider_id,
        skill_offered_id=swap.skill_offered_id,
        skill_wanted_id=swap.skill_wanted_id,
        message=swap.message,
        status=SwapStatus.PENDING
    )
    
    db.add(db_swap)
    db.commit()
    db.refresh(db_swap)
    
    return db_swap


@router.get("", response_model=List[SwapWithDetails])
async def get_current_user_swaps(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all swaps for current user
    """
    query = db.query(Swap).filter(
        (Swap.requester_id == current_user.id) | (Swap.provider_id == current_user.id)
    ).options(
        joinedload(Swap.requester),
        joinedload(Swap.provider),
        joinedload(Swap.skill_offered),
        joinedload(Swap.skill_wanted)
    )
    
    if status:
        query = query.filter(Swap.status == status)
    
    return query.all()


@router.get("/sent", response_model=List[SwapWithDetails])
async def get_sent_swaps(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all swaps sent by current user
    """
    query = db.query(Swap).filter(
        Swap.requester_id == current_user.id
    ).options(
        joinedload(Swap.requester),
        joinedload(Swap.provider),
        joinedload(Swap.skill_offered),
        joinedload(Swap.skill_wanted)
    )
    
    if status:
        query = query.filter(Swap.status == status)
    
    return query.all()


@router.get("/received", response_model=List[SwapWithDetails])
async def get_received_swaps(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all swaps received by current user
    """
    query = db.query(Swap).filter(
        Swap.provider_id == current_user.id
    ).options(
        joinedload(Swap.requester),
        joinedload(Swap.provider),
        joinedload(Swap.skill_offered),
        joinedload(Swap.skill_wanted)
    )
    
    if status:
        query = query.filter(Swap.status == status)
    
    return query.all()


@router.get("/{swap_id}", response_model=SwapWithDetails)
async def get_swap(
    swap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a swap by ID
    """
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        ((Swap.requester_id == current_user.id) | (Swap.provider_id == current_user.id))
    ).options(
        joinedload(Swap.requester),
        joinedload(Swap.provider),
        joinedload(Swap.skill_offered),
        joinedload(Swap.skill_wanted)
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not accessible"
        )
    
    return swap


@router.put("/{swap_id}", response_model=SwapInDB)
async def update_swap(
    swap_id: int,
    swap_update: SwapUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a swap status
    """
    swap = db.query(Swap).filter(Swap.id == swap_id).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found"
        )
    
    # Check permissions
    if swap.status == SwapStatus.PENDING:
        # Requester can cancel
        if swap.requester_id == current_user.id and swap_update.status == SwapStatus.CANCELLED:
            swap.status = SwapStatus.CANCELLED
        
        # Provider can accept or reject
        elif swap.provider_id == current_user.id and swap_update.status in [SwapStatus.ACCEPTED, SwapStatus.REJECTED]:
            swap.status = swap_update.status
        
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action"
            )
    
    elif swap.status == SwapStatus.ACCEPTED:
        # Either user can mark as completed
        if (swap.requester_id == current_user.id or swap.provider_id == current_user.id) and swap_update.status == SwapStatus.COMPLETED:
            swap.status = SwapStatus.COMPLETED
            swap.completed_at = datetime.now()
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action"
            )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update swap with status {swap.status}"
        )
    
    # Update message if provided
    if swap_update.message:
        swap.message = swap_update.message
    
    db.add(swap)
    db.commit()
    db.refresh(swap)
    
    return swap


@router.delete("/{swap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_swap(
    swap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Response:
    """
    Delete a swap (only if it's pending and you're the requester)
    """
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        Swap.requester_id == current_user.id,
        Swap.status == SwapStatus.PENDING
    ).first()

    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found, not owned by you, or not in pending status"
        )

    db.delete(swap)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)  # ✅ MUST return explicit Response



# Feedback routes
@router.post("/feedback", response_model=FeedbackInDB, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create feedback for a completed swap
    """
    # Check if swap exists and is completed
    swap = db.query(Swap).filter(
        Swap.id == feedback.swap_id,
        Swap.status == SwapStatus.COMPLETED,
        ((Swap.requester_id == current_user.id) | (Swap.provider_id == current_user.id))
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found, not completed, or not accessible"
        )
    
    # Check if receiver is part of the swap
    if feedback.receiver_id != swap.requester_id and feedback.receiver_id != swap.provider_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiver must be part of the swap"
        )
    
    # Check if giver is not receiver
    if current_user.id == feedback.receiver_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot give feedback to yourself"
        )
    
    # Check if feedback already exists
    existing_feedback = db.query(Feedback).filter(
        Feedback.swap_id == feedback.swap_id,
        Feedback.giver_id == current_user.id
    ).first()
    
    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already given feedback for this swap"
        )
    
    # Create feedback
    db_feedback = Feedback(
        swap_id=feedback.swap_id,
        giver_id=current_user.id,
        receiver_id=feedback.receiver_id,
        rating=feedback.rating,
        comment=feedback.comment
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback


@router.get("/feedback/received", response_model=List[FeedbackWithDetails])
async def get_received_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all feedback received by current user
    """
    return db.query(Feedback).filter(
        Feedback.receiver_id == current_user.id
    ).options(
        joinedload(Feedback.giver),
        joinedload(Feedback.receiver),
        joinedload(Feedback.swap)
    ).all()


@router.get("/feedback/given", response_model=List[FeedbackWithDetails])
async def get_given_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all feedback given by current user
    """
    return db.query(Feedback).filter(
        Feedback.giver_id == current_user.id
    ).options(
        joinedload(Feedback.giver),
        joinedload(Feedback.receiver),
        joinedload(Feedback.swap)
    ).all()


@router.get("/{swap_id}/feedback", response_model=List[FeedbackWithDetails])
async def get_swap_feedback(
    swap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all feedback for a swap
    """
    # Check if swap exists and user is part of it
    swap = db.query(Swap).filter(
        Swap.id == swap_id,
        ((Swap.requester_id == current_user.id) | (Swap.provider_id == current_user.id))
    ).first()
    
    if not swap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap not found or not accessible"
        )
    
    return db.query(Feedback).filter(
        Feedback.swap_id == swap_id
    ).options(
        joinedload(Feedback.giver),
        joinedload(Feedback.receiver)
    ).all()
