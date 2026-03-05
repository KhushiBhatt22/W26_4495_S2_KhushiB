# W26_4495_S2_KhushiB

## Team Members

- Khushi Bhatt – 300394398 – khushi.bhatt0405@gmail.com – Team Leader  
- Aditi Aditi – 300396361 – a60@student.douglascollege.ca – Team Member  

---

# Project Name: Bookstagram

Bookstagram is a full-stack MERN (MongoDB, Express, React, Node.js) social platform that transforms writing into a community-driven and AI-powered experience.

## Features

- Create and share book-style content  
- Generate AI-powered story outlines and e-books  
- Post short visual story threads  
- Engage with a creative community  

The platform integrates Google Gemini AI for intelligent content generation and uses JWT-based authentication for secure user access.

---

## Tech Stack

- Frontend: React (Vite)  
- Backend: Node.js + Express  
- Database: MongoDB Atlas  
- Authentication: JWT  
- AI Integration: Google Gemini API  

---

# Installation Instructions

Follow these steps to run the project locally.

## 1. Clone the Repository

1. Go to the main branch of the repository.
2. Click Code.
3. Copy the HTTPS URL.
4. Open VS Code.
5. Run:

git clone <repository_url>

6. Navigate into the project folder.

---

## 2. MongoDB Atlas Setup

1. Visit https://www.mongodb.com/
2. Log in or create an account.
3. Click New Project.
4. Enter a project name and click Next.
5. Click Clusters in the side menu.
6. Click Build a Cluster.
7. Select Free Tier.
8. Enter a cluster name.
9. Choose a cloud provider and region close to you.
10. Click Create Deployment.
11. Add IP Address (Allow access from anywhere if unsure).
12. Create a Database User with username and password.
13. Click Choose a connection method.
14. Select Drivers.
15. Copy the Node.js connection string.

---

## 3. Update .env File (Backend Folder)

Inside Implementation/backend create a .env file and add:

MONGO_URI=your_mongodb_connection_string  
PORT=8000  
GEMINI_API_KEY=your_gemini_api_key  
JWT_SECRET=your_generated_secret  

Replace <db_password> with your database password.

### Generate JWT Secret

Run:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Copy the output and paste it as JWT_SECRET.

---

## 4. Generate Google Gemini API Key

1. Visit https://ai.google.dev/
2. Generate an API key.
3. Add to .env:

GEMINI_API_KEY=your_key_here

---

# Running the Project

## Start Backend

cd Implementation  
cd backend  
npm install  
npm run dev  

Backend runs on http://localhost:8000

## Start Frontend

cd Implementation  
cd frontend  
cd bookstagram  
npm install  
npm run dev  

Frontend runs on http://localhost:5173
