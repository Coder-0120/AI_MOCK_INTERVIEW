# 🎤🤖 PrepX – Practice. Analyze. Crack Interviews. 💼🚀  

**PrepX** is a full-stack MERN application designed to simulate real interview experiences using AI.  
It provides voice-based answering, real-time face detection, performance scoring, and detailed feedback to help users improve their interview skills.

<img width="1898" height="1080" alt="Screenshot (316)" src="https://github.com/user-attachments/assets/f2ba1e22-1632-42a0-8123-5565c1622190" />

---

## 🌟 What is PrepX?

**PrepX** helps candidates prepare for interviews by providing:

- 🎤 Voice-based answering system  
- 🤖 AI-generated interview questions  
- 👁️ Real-time face detection & eye contact tracking  
- 📊 Performance scoring & analytics  
- 💡 Smart feedback after interview  

It creates a realistic interview environment and ensures continuous improvement.

---

## 🚀 Key Features  

### 🔐 Authentication & Security  
🔑 Secure Login & Signup  
🔒 JWT-based authentication  
🛡️ Protected routes for dashboard  
💾 User session persistence  

---

### 🎯 AI Interview System  
🧠 Dynamic question generation based on role  
📋 Multiple interview question flow  
⏭️ Smooth question navigation  
📌 Stores answers for evaluation  

---

### 🎤 Voice Answer Input  
🎙️ Speech-to-text using Web Speech API  
📝 Converts spoken answers into text  
🔁 Option to re-record answers  
⚡ Real-time answer capture  

---

### 👁️ Face Detection & Proctoring  
📷 Live camera feed during interview  
🧠 Face detection using face-api.js  
⚠️ Detects when user looks away  
⏱️ Tracks total “face not visible” duration  
📊 Adds eye-contact insights in feedback  

---

### 📊 Performance Analysis  
📈 AI-generated score (out of 10)  
🏆 Grade system (A+, A, B, etc.)  
💡 Detailed feedback on answers  
👁️ Eye-contact performance insights  

---

### 🧾 Interview History  
📂 Stores past interviews  
📊 View previous scores & feedback  
🔁 Track progress over time  

---

### 🔔 Smart Feedback System  
💡 AI suggestions for improvement  
⚠️ Highlights weak areas  
🎯 Personalized recommendations  

---

### 📱 Responsive UI  
📱 Mobile-friendly interface  
💻 Optimized for desktop  
🎨 Clean, modern UI with animations  

---

## 🛠️ Tech Stack  

🖥️ Frontend: React.js  
⚙️ Backend: Node.js, Express.js  
🗄️ Database: MongoDB  
🤖 AI API: Gemini 
🎤 Voice: Web Speech API  
👁️ Face Detection: face-api.js  
📡 HTTP Client: Axios  

---

## ⚡ Getting Started  

### 🔽 Clone Repository  

```bash
git clone https://github.com/Coder-0120/PrepX.git
cd PrepX
```

---

### 📦 Install Backend Dependencies  

```bash
cd server
npm install
```

---

### 📦 Install Frontend Dependencies  

```bash
cd client
npm install
```

---

### 🔑 Create a `.env` File (Server)

Add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

---

### ▶️ Run Development Server  

From root directory:

```bash
npm run dev
```

Frontend will run at:  
http://localhost:3000  

Backend will run at:  
http://localhost:5000  

---

## 🎯 Why PrepX? 

- 💼 Real interview simulation
-🎤 Hands-free answering experience
-👁️ Eye contact tracking (unique feature)
-📊 AI-driven performance insights
-🚀 Boosts confidence & communication

---

## 📌 Future Improvements  

- 📱 Mobile application
-🧑‍🤝‍🧑 Live peer mock interviews
-🏆 Leaderboard system
-🌐 OAuth login (Google, LinkedIn)
-🎥 Interview recording playback

---

## 👨‍💻 Author  

Developed to help students and professionals crack interviews with confidence 🚀
If you like this project, ⭐ star the repository and share it!
