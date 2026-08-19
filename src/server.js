import express from "express";
import cors from "cors";
import db from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import quizRoutes from "./routes/quiz.routes.js";
import questionRoutes from "./routes/question.routes.js";
import studentQuizRoutes from "./routes/studentQuiz.routes.js";
import studentAttemptRoutes from "./routes/studentAttempt.routes.js";
import adminStudentRoutes from "./routes/userManagement.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();


const allowedOrigins = [
  'https://quiz-management-frontend-one.vercel.app/',
  /^https:\/\/.*\.vercel\.app$/,
  'http://localhost:5253', 
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required if you use cookies or Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


// Middleware
app.use(cors(corsOptions));

// Middleware
// app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/student/quizzes", studentQuizRoutes);
app.use("/api/student/attempts", studentAttemptRoutes);

app.use("/api/admin/students", adminStudentRoutes);


app.use("/api/profile", profileRoutes);

app.use(errorHandler);


app.get("/", (req, res) => {
  res.send("Quiz Management Backend is running 🚀");
});



const PORT = process.env.PORT || 5213;

try {
  const result = await db.query("SELECT NOW()");
  console.log("✅ PostgreSQL Connected");
  console.log(result.rows[0]);
} catch (err) {
  console.error("❌ Database Connection Failed");
  console.error(err.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});