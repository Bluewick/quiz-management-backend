import express from "express";
import cors from "cors";
import db from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import quizRoutes from "./routes/quiz.routes.js";
import questionRoutes from "./routes/question.routes.js";
import studentQuizRoutes from "./routes/studentQuiz.routes.js";
import studentAttemptRoutes from "./routes/studentAttempt.routes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/student/quizzes", studentQuizRoutes);
app.use("/api/student/attempts", studentAttemptRoutes);


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