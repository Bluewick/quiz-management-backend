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
  'https://quiz-management-frontend-one.vercel.app', 
  'http://localhost:5253', 
  'http://localhost:3000'
];

const allowedRegexPatterns = [
  /^https:\/\/.*\.vercel\.app$/ // Extracted regex out of .includes()
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (Insomnia, Postman, mobile apps)
    if (!origin) return callback(null, true);

    const isAllowed = 
      allowedOrigins.includes(origin) || 
      allowedRegexPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
  res.send("Quiz Management Backend is running 🚀");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/student/quizzes", studentQuizRoutes);
app.use("/api/student/attempts", studentAttemptRoutes);

app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/profile", profileRoutes);

// Error Middleware (Must always be last among route handlers)
app.use(errorHandler);

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