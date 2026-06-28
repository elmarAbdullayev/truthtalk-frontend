# TruthTalk – Real-Time Voice Room Platform

## 📌 Overview

TruthTalk is a full-stack real-time voice communication platform where users can create, join, and manage voice rooms.

The system includes authentication, role-based access control (admin/user), room management, and real-time voice communication using Agora SDK.

---

## ⚙️ Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- MySQL (PyMySQL)
- JWT Authentication (python-jose)
- Passlib (bcrypt)
- Agora RTC Token Builder

### Frontend
- React + TypeScript
- Redux Toolkit
- Axios
- React Router
- TailwindCSS

---

## 🚀 Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Persistent login using localStorage

---

### Voice Rooms
- Create and join voice rooms
- Public and private rooms
- Language-based filtering
- Maximum participants control
- Real-time voice communication using Agora

---

### Room Management
- Join / leave rooms
- Kick and mute users (room owner only)
- Auto delete room when empty
- Close room functionality

---

### Admin Panel
- View platform statistics
- Ban / unban users
- Manage rooms
- Force close rooms
- Remove users from rooms

---

## 🏗️ Architecture

Frontend (React + Redux)  
→ API Layer (Axios)  
→ FastAPI Backend  
→ MySQL Database  
→ Agora Real-Time Voice Service

---

## 🔑 Backend Structure

- auth → authentication (register/login/JWT)
- rooms → room lifecycle management
- admin → admin controls
- core → security & dependencies
- services → Agora token generation

---

## 📡 API Endpoints

### Auth
- POST `/auth/register`
- POST `/auth/login`

### Rooms
- GET `/rooms`
- POST `/rooms`
- POST `/rooms/{id}/join`
- POST `/rooms/{id}/leave`
- POST `/rooms/{id}/kick/{user_id}`

### Admin
- GET `/admin/stats`
- GET `/admin/users`
- POST `/admin/users/{id}/ban`
- POST `/admin/rooms/{id}/close`

---

## 🔥 Key Highlights

- Real-time voice communication system
- Full authentication + authorization system
- Role-based access (Admin / User)
- Scalable backend architecture
- Clean API design
- Production-style full-stack project

---

## 🚀 Future Improvements

- WebSocket real-time updates
- Chat system inside rooms
- Notifications system
- Docker deployment
- CI/CD pipeline

---

## 👨‍💻 Author

Full-Stack Developer Project  
Built with FastAPI + React + Agora
