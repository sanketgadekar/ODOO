# Skill Swap Platform - Frontend

This is the frontend for the Skill Swap Platform, built with React and Material-UI.

## Features

- User authentication and profile management
- Skill offering and requesting
- Swap request, acceptance, and rejection
- Feedback system
- Admin panel for moderation

## Setup

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

### Configuration

The frontend is configured to proxy API requests to http://localhost:8000 by default. If your backend is running on a different URL, update the `proxy` field in `package.json`.

### Running the Application

```bash
npm start
```

The frontend will be available at http://localhost:3000

## Pages

- **Authentication**
  - Login
  - Registration

- **User Profile**
  - View and edit profile
  - Upload profile photo
  - Manage skills offered
  - Manage skills wanted
  - View feedback received

- **Skill Search**
  - Search for skills by name
  - Filter by skill type (offered or wanted)
  - View user profiles

- **Swap Management**
  - View sent swap requests
  - View received swap requests
  - Accept or reject swap requests
  - Mark swaps as completed
  - Give feedback

- **Admin Panel**
  - Manage users (ban/unban)
  - Moderate skills
  - Monitor swaps
  - View statistics
  - Send platform-wide messages

## Folder Structure

- `src/components` - Reusable UI components
- `src/pages` - Page components
- `src/services` - API service functions
- `src/context` - React context for state management
- `src/styles` - Global styles and theme
- `src/utils` - Utility functions
