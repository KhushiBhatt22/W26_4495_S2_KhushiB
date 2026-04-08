# W26_4495_S2_KhushiB

## Team Members

- Khushi Bhatt – 300394398 – khushi.bhatt0405@gmail.com – Team Leader  
- Aditi Aditi – 300396361 – a60@student.douglascollege.ca – Team Member  

---

# Project Name: Bookstagram

Bookstagram is a full-stack MERN (MongoDB, Express, React, Node.js) application that transforms writing into a community-driven and AI-powered experience.

Users can create, edit, and share book-style content, generate AI-powered chapters, and interact with a creative storytelling community.

## Features

- AI-powered eBook creation with automatic outlines and chapter generation  
- Multiple writing modes: manual, full AI, and hybrid (human + AI)  
- AI story generation using prompts and personalized avatar creation  
- AI-generated and custom cover image support (Cloudinary integration)  
- Social platform features: follow users, like content, and explore books  
- Real-time messaging with users and AI chatbot (BookBot)  
- Export eBooks as PDF or Word documents  

The platform leverages Google Gemini AI for generating story content and avatars, and Hugging Face for AI-based image generation, while ensuring secure user authentication through JWT.

---

## Tech Stack

- Frontend: React (Vite)  
- Backend: Node.js + Express  
- Database: MongoDB Atlas  
- Authentication: JWT  
- AI Integration: 
- Google Gemini API (for AI-powered content generation)
- Hugging Face API (for AI-based image generation) 

---

# Installation Instructions

## Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas account
- Git
- VS Code (recommended)

---

## Clone Repository
git clone https://github.com/KhushiBhatt22/W26_4495_S2_KhushiB.git

---

## Backend Setup
cd Implementation/backend
npm install

Create a .env file and add:

PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
HUGGING_FACE_API_KEY=your_hf_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Run backend:
npm run dev

---

## Frontend Setup
cd Implementation/frontend/bookstagram
npm install
npm run dev

---

## Run the Application
Run both frontend and backend:

Backend → http://localhost:8000  
Frontend → http://localhost:5173  

---

# How to Use the Application

1. Register a new account or log in.
2. Create a new book or story.
3. Use AI tools to generate chapters or outlines.
4. Upload or generate a cover image.
5. Save and explore content created by other users.

This demonstrates the core features of the Bookstagram platform.

---
# Additional Documentation

For more detailed setup instructions, please refer to:

- Bookstagram_Installation_Guide.docx (available in the Reports/Documentation folder)

For a complete user guide on how to use the application, refer to:

- Bookstagram_User_Guide.doc (available in the Reports/Documentation folder)
