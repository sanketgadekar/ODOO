# Skill Swap Platform - Backend

This is the backend for the Skill Swap Platform, built with FastAPI and SQLAlchemy.

## Features

- User authentication and profile management
- Skill offering and requesting
- Swap request, acceptance, and rejection
- Feedback system
- Admin panel for moderation

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment:

```bash
python -m venv venv
```

4. Activate the virtual environment:

- Windows:
```bash
venv\Scripts\activate
```

- Unix/MacOS:
```bash
source venv/bin/activate
```

5. Install dependencies:

```bash
pip install -r requirements.txt
```

### Configuration

The application uses environment variables for configuration. You can create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=sqlite:///./skill_swap.db
SECRET_KEY=your-secret-key-change-in-production
```

### Running the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `POST /api/users/me/profile-photo` - Upload profile photo
- `GET /api/users/{user_id}` - Get user profile by ID
- `GET /api/users` - Search users

### Skills

- `POST /api/skills/offered` - Create a new skill offered
- `GET /api/skills/offered` - Get all skills offered by current user
- `GET /api/skills/offered/{skill_id}` - Get a skill offered by ID
- `PUT /api/skills/offered/{skill_id}` - Update a skill offered
- `DELETE /api/skills/offered/{skill_id}` - Delete a skill offered
- `POST /api/skills/wanted` - Create a new skill wanted
- `GET /api/skills/wanted` - Get all skills wanted by current user
- `GET /api/skills/wanted/{skill_id}` - Get a skill wanted by ID
- `PUT /api/skills/wanted/{skill_id}` - Update a skill wanted
- `DELETE /api/skills/wanted/{skill_id}` - Delete a skill wanted
- `GET /api/skills/search` - Search for skills by name

### Swaps

- `POST /api/swaps` - Create a new swap request
- `GET /api/swaps` - Get all swaps for current user
- `GET /api/swaps/sent` - Get all swaps sent by current user
- `GET /api/swaps/received` - Get all swaps received by current user
- `GET /api/swaps/{swap_id}` - Get a swap by ID
- `PUT /api/swaps/{swap_id}` - Update a swap status
- `DELETE /api/swaps/{swap_id}` - Delete a swap
- `POST /api/swaps/feedback` - Create feedback for a completed swap
- `GET /api/swaps/feedback/received` - Get all feedback received by current user
- `GET /api/swaps/feedback/given` - Get all feedback given by current user
- `GET /api/swaps/{swap_id}/feedback` - Get all feedback for a swap

### Admin

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{user_id}/ban` - Ban a user
- `PUT /api/admin/users/{user_id}/unban` - Unban a user
- `PUT /api/admin/users/{user_id}/make-admin` - Make a user an admin
- `GET /api/admin/skills/pending` - Get all pending skills
- `PUT /api/admin/skills/{skill_id}/approve` - Approve a skill
- `PUT /api/admin/skills/{skill_id}/reject` - Reject a skill
- `GET /api/admin/swaps` - Get all swaps
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/message` - Send a platform-wide message
