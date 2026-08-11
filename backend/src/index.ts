import "dotenv/config";
import express from "express";
import cors from "cors";
import { studentsRouter } from "./routes/students.routes";
import { paymentsRouter } from "./routes/payments.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de salud, para comprobar que el servidor está vivo
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/students", studentsRouter);
app.use("/api/payments", paymentsRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
