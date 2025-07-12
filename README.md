# 🔄 Skill Swap Platform

A collaborative platform where users exchange skills directly — learn what you want, teach what you know.

> 🚀 Built with FastAPI (Backend) + React.js (Frontend)  
> 🎯 Hackathon Project – ODOO Hackathon 2025  
 

---

## 🧩 Overview

The **Skill Swap Platform** connects individuals who want to learn and teach skills. Instead of monetary transactions, it enables peer-to-peer knowledge exchange. For example, someone can offer Python training in exchange for learning Graphic Design.

---

## 🌐 Features

### 👤 User Management
- Registration & secure login (JWT-based)
- Public/private profile visibility
- View own skill portfolio and feedback

### 🎓 Skill System
- Offer your skills (SkillOffered)
- Declare skills you want to learn (SkillWanted)
- Browse available skills of others

### 🔁 Swap Mechanism
- Send skill swap requests
- Accept, reject, or cancel swaps
- Track status: Pending / Accepted / Rejected / Completed

### 💬 Feedback System
- Leave feedback after a swap
- Ratings and comments
- View feedback history (given and received)

### 🛡️ Admin Features *(WIP)*
- Moderate user activity
- Remove inappropriate content

---

## 🏗️ Tech Stack

| Layer     | Technology     |
|-----------|----------------|
| Backend   | FastAPI, SQLAlchemy, Pydantic |
| Database  | SQLite (dev) / PostgreSQL (prod ready) |
| Frontend  | React.js, Vite, Axios |
| Auth      | OAuth2 Password Flow + JWT |
| DevOps    | Uvicorn, pip, npm, GitHub |
| Others    | python-multipart, passlib, jose, email-validator |

---

## 🚀 Installation

```bash
### 📦 Backend Setup (FastAPI)
# 1. Go to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  

 ###Frontend Setup (React)

# 1. Go to frontend directory
cd frontend

# 2. Install Node packages
npm install

# 3. Run development server
npm run dev


