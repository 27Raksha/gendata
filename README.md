# GEN DATA Application

**GEN DATA** is an AI-powered application that allows users to manage system prompts and interact with an intelligent chatbot. The app is built using Flask for the backend and React for the frontend. It offers features like adding, editing, and deleting system prompts, generating chatbot responses, and managing conversations.

The application is deployed and accessible at: **[GEN DATA Live Application](https://gendata-rouge.vercel.app/)**.

---

## Features

- **System Prompt Management**: Add, update, and delete system prompts.
- **AI Chatbot**: Interact with a chatbot for solving problems efficiently.
- **Conversation Logs**: Manage conversations and save logs for reference.
- **API Integration**: Backend powered by Flask and MongoDB for data storage.

---

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Flask, MongoDB
- **Deployment**: Vercel (Frontend), Render (Backend)
- **APIs**: Groq API for chatbot responses

---

## Getting Started

Follow these steps to clone the repository, set up the environment, and run the application in development mode.

### Prerequisites

Ensure the following are installed:
- **Node.js** (v16 or later)
- **Python** (v3.9 or later)
- **MongoDB** (Local or Atlas cloud instance)
- **Git**

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/27Raksha/gendata.git
   cd gendata
   ```
2. **Set up the Backend**:
  ```bash
  cd backend
  ```
``` bash
python -m venv venv
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate     # For Windows
```
**Install dipendencies**:
```bash
pip install -r requirements.txt
```
**Create .env**:
```bash
API_KEY=<Your_Groq_API_Key>
MONGO_URI=<Your_MongoDB_URI>
PORT=5000
```
3. **Run the backend**:
```bash
python app.py
```
4. **Set up the Frontend**:
   navigate to the folder
   ```bash
   cd ../frontend
   ```
   Install dependencies:
   ```bash
   npm install
   ```
   Update backend URL:
   ```bash
   const backendURL = "http://localhost:5000";
   ```
   Run the server:
   ```bash
   npm run dev
   ```
**Live Demo**
The application is live and accessible at: **[GEN DATA Live Application](https://gendata-rouge.vercel.app/)**.

**Demo Video link**
The demo video link is available at: **[Video Link](https://drive.google.com/file/d/10odEKyOCUyq8RmLnnfHd63GDk7wchWqq/view?usp=sharing)**

