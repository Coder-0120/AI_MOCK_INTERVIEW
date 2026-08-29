# 🎤🤖 PrepX – Practice. Analyze. Crack Interviews. 💼🚀

**PrepX** is a full-stack MERN-based AI interview preparation platform that simulates realistic interview experiences and generates **personalized, resume-aware interview questions using RAG (Retrieval-Augmented Generation)**.

<img width="1898" height="1080" alt="Screenshot (316)" src="https://github.com/user-attachments/assets/f2ba1e22-1632-42a0-8123-5565c1622190" />


It combines AI-powered question generation, voice-based answering, real-time face detection, performance analysis, and interview history to help candidates practice and improve continuously.

---

## 🌟 What is PrepX?

PrepX helps candidates prepare for interviews through an AI-powered interview environment.

Unlike a traditional interview-question generator, PrepX uses the candidate's **resume as a personalized knowledge base**.

During signup, the candidate can upload their resume once. PrepX then:

```text
Resume
   ↓
Text Extraction
   ↓
Chunking
   ↓
Gemini Embeddings
   ↓
Vector Storage
   ↓
Semantic Retrieval
   ↓
Resume-Aware AI Questions
```

This allows the AI interviewer to ask questions based on the candidate's **actual projects, skills, technologies, and experience**.

For example, if a candidate's resume mentions a MERN project using Gemini API, PrepX can generate questions specifically related to that project instead of relying only on generic MERN questions.

---

## 🚀 Key Features

### 🔐 Authentication & Security

* 🔑 Secure Login & Signup
* 🔒 JWT-based authentication
* 🛡️ Protected backend routes
* 💾 Persistent user sessions
* 👤 User-specific resume knowledge base
* 🔐 Resume data isolated using user ID

---

### 📄 Resume-Powered RAG

PrepX uses the candidate's resume as a personalized knowledge base.

#### Resume Processing Pipeline

```text
📄 Resume Upload
       ↓
📝 Text Extraction
       ↓
✂️ Text Chunking
       ↓
🧠 Gemini Embeddings
       ↓
🗄️ MongoDB Vector Storage
```

During an interview:

```text
🎯 Selected Role
       ↓
🔎 Retrieval Query
       ↓
🧠 Query Embedding
       ↓
📊 Cosine Similarity
       ↓
📄 Top Relevant Resume Chunks
       ↓
🤖 Gemini
       ↓
🎤 Personalized Interview Questions
```

### RAG Features

* 📄 Resume uploaded once during signup
* 🧩 Resume divided into meaningful chunks
* 🧠 Gemini embedding generation
* 📊 Semantic similarity-based retrieval
* 👤 User-specific resume retrieval
* 🎯 Top relevant resume chunks selected
* 🤖 Resume-grounded question generation
* 🚫 Prevents questions from inventing unsupported experience

---

### 🎯 AI Interview System

* 🧠 AI-generated interview questions
* 📄 Resume-aware question generation using RAG
* 🎯 Questions tailored to selected job role
* 📋 Multiple-question interview flow
* ⏭️ Smooth question navigation
* 📌 Stores candidate answers
* 💼 Project and technology-specific questions

Example:

```text
Resume:
Built PrepX using React, Node.js, MongoDB and Gemini API

        ↓

AI Interviewer:

"You mentioned integrating Gemini API into PrepX.
How did you handle API failures and structure the
AI interaction in your application?"
```

---

### 🎤 Voice Answer Input

* 🎙️ Speech-to-text using Web Speech API
* 📝 Converts spoken answers into text
* 🔁 Option to re-record answers
* ⚡ Real-time answer capture
* 🗣️ Hands-free interview experience

---

### 👁️ Face Detection & Proctoring

* 📷 Live camera feed during interview
* 🧠 Face detection using face-api.js
* ⚠️ Detects when the face is not visible
* ⏱️ Tracks total face-not-visible duration
* 📊 Includes camera/eye-contact insights in performance analysis

---

### 📊 AI Performance Analysis

After completing an interview, PrepX provides:

* 📈 AI-generated score out of 10
* 🏆 Performance grade
* 💡 Detailed AI feedback
* ⚠️ Weak-area identification
* 🎯 Personalized improvement suggestions
* 👁️ Eye-contact / camera insights

---

### 🧾 Interview History

PrepX stores previous interview sessions for continuous improvement.

* 📂 View previous interviews
* 📊 Track scores
* 💬 Review AI feedback
* 🔁 Compare interview performance
* 📈 Monitor improvement over time

---

### 🔔 Smart Feedback System

PrepX analyzes the candidate's answers and provides:

* 💡 Strengths
* ⚠️ Weak areas
* 🎯 Improvement recommendations
* 🧠 Technical feedback
* 🗣️ Communication-oriented feedback

---

### 📱 Responsive UI

* 📱 Mobile-friendly interface
* 💻 Desktop optimized
* 🎨 Modern interface
* ✨ Smooth animations and transitions
* ⚡ Interactive interview experience

---

# 🏗️ System Architecture

```text
                         ┌─────────────────┐
                         │   React Client  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Express / Node  │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       Authentication       Interview Engine       RAG Pipeline
             │                    │                    │
             ▼                    ▼                    ▼
           JWT                 Gemini API         Resume Parser
             │                                         │
             ▼                                         ▼
          MongoDB                                  Chunking
                                                       │
                                                       ▼
                                                  Embeddings
                                                       │
                                                       ▼
                                                   MongoDB
                                                       │
                                                       ▼
                                               Semantic Retrieval
                                                       │
                                                       ▼
                                                   Gemini AI
```

---

# 🧠 RAG Architecture

The RAG implementation consists of two major stages.

## 1. Knowledge Base Creation

The resume is processed once during signup:

```text
Resume
  ↓
PDF/DOCX Text Extraction
  ↓
Text Chunking
  ↓
Embedding Generation
  ↓
MongoDB
```

Each resume chunk stores information such as:

```javascript
{
  userId: "...",
  text: "...",
  chunkIndex: 0,
  embedding: [...]
}
```

---

## 2. Retrieval During Interview

When an interview begins:

```text
Role + Interview Context
        ↓
Query Embedding
        ↓
Compare with Resume Embeddings
        ↓
Cosine Similarity
        ↓
Top-K Relevant Chunks
        ↓
Gemini Prompt
        ↓
Personalized Questions
```

This makes PrepX **context-aware instead of purely prompt-based**.

---

# 🛠️ Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* Axios

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* bcrypt

### Database

* MongoDB
* Mongoose

### AI / RAG

* Gemini API
* Gemini Embeddings
* Retrieval-Augmented Generation (RAG)
* Cosine Similarity
* Semantic Search

### Resume Processing

* `pdf-parse`
* `mammoth`
* Custom text chunking

### Voice

* Web Speech API

### Computer Vision

* face-api.js

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

# ⚡ Getting Started

## 🔽 Clone Repository

```bash
git clone https://github.com/Coder-0120/PrepX.git
cd PrepX
```

---

## 📦 Install Backend Dependencies

```bash
cd server
npm install
```

---

## 📦 Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 🔑 Create `.env`

Inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

---

## ▶️ Run Development Server

From the appropriate project directory, run your development command:

```bash
npm run dev
```

Typical local services:

```text
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

---

# 🔄 Interview Workflow

```text
1. User Signup
       ↓
2. Upload Resume
       ↓
3. Extract Resume Text
       ↓
4. Create Resume Chunks
       ↓
5. Generate Embeddings
       ↓
6. Store Chunks + Embeddings
       ↓
7. User Starts Interview
       ↓
8. Select Role
       ↓
9. Generate Query Embedding
       ↓
10. Retrieve Relevant Resume Chunks
       ↓
11. Gemini Generates Questions
       ↓
12. User Answers Through Voice
       ↓
13. Face Detection Tracks Presence
       ↓
14. Gemini Evaluates Answers
       ↓
15. Score + Feedback
       ↓
16. Interview Saved to History
```

---

# 🎯 Why PrepX?

* 📄 **Resume-aware AI interviews**
* 🧠 **RAG-powered personalized questions**
* 🎤 **Hands-free voice answering**
* 👁️ **Real-time face detection**
* 📊 **AI-powered performance analysis**
* 💡 **Personalized feedback**
* 📈 **Interview history and progress tracking**
* 🚀 **Realistic interview simulation**

The key differentiator is that PrepX doesn't simply generate generic questions — it can **retrieve relevant information from the candidate's own resume and use that context while generating interview questions**.

---

# 📌 Future Improvements

* 📱 Mobile application
* 🧑‍🤝‍🧑 Live peer mock interviews
* 🏆 Leaderboard system
* 🌐 OAuth login with Google / LinkedIn
* 🎥 Interview recording and playback
* 🔎 More advanced vector database support
* 🧠 Multi-stage RAG with interview history
* 🎯 Adaptive difficulty based on candidate performance
* 📚 Job-description + resume combined RAG
* 💼 Job-specific interview preparation
* 🧑‍💼 Recruiter interview mode

---

# 👨‍💻 Author

Developed to help students and professionals practice interviews, understand their weaknesses, and improve their confidence through AI-powered interview simulation.

If you find PrepX useful, ⭐ **star the repository and share it!**

---

## 🚀 PrepX

**Practice smarter.
Answer confidently.
Analyze your performance.
Crack your interview.**


