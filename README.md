W26_4495_S2_KhushiB
Team Members

Khushi Bhatt – 300394398 – khushi.bhatt0405@gmail.com
 – Team Leader

Aditi Aditi – 300396361 – a60@student.douglascollege.ca
 – Team Member

Project Name: Bookstagram

Bookstagram is a full-stack MERN (MongoDB, Express, React, Node.js) social platform that transforms writing into a community-driven and AI-powered experience.

The platform allows users to:

Create and share book-style content

Generate AI-powered story outlines and e-books

Post short visual story threads

Engage with a creative community

It integrates Google Gemini AI for intelligent content generation and uses JWT-based authentication for secure user access.

Tech Stack

Frontend: React (Vite)

Backend: Node.js + Express

Database: MongoDB Atlas

Authentication: JWT

AI Integration: Google Gemini API

Installation Instructions

Follow these steps to run the project locally.

1. Clone the Repository

Go to the main branch of the repository.

Click Code.

Copy the HTTPS URL.

Open VS Code.

Open Terminal and run:

git clone <repository_url>

Navigate into the project folder.

2. MongoDB Atlas Setup

Visit: https://www.mongodb.com/

Log in or create an account.

Click New Project.

Enter a project name and click Next.

Click Clusters in the side menu.

Click Build a Cluster.

Select Free Tier.

Enter a cluster name.

Choose a cloud provider and region close to you.

Click Create Deployment.

Add IP Address (select "Allow access from anywhere" if unsure).

Create a Database User with a username and password.

Click Choose a connection method.

Select Drivers.

Copy the Node.js connection string.

3. Update .env File (Backend Folder)

Inside:

Implementation/backend

Create a .env file and add:

MONGO_URI=your_mongodb_connection_string
PORT=8000
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_generated_secret

Important:

Replace <db_password> in the connection string with your database user password.

Do not commit the .env file to GitHub.

Generate JWT Secret

Run the following command in terminal:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Copy the output and paste it as JWT_SECRET.

4. Generate Google Gemini API Key

Visit: https://ai.google.dev/

Generate an API key.

Copy and paste it inside .env:

GEMINI_API_KEY=your_key_here
Running the Project
Start Backend

Open terminal:

cd Implementation
cd backend
npm install
npm run dev

Backend runs on:

http://localhost:8000
Start Frontend

Open a new terminal:

cd Implementation
cd frontend
cd bookstagram
npm install
npm run dev

Frontend runs on:

http://localhost:5173
