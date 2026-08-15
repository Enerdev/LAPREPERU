import "dotenv/config";
import express from "express";
import cors from "cors";
import { studentsRouter } from "./routes/students.routes";
import { paymentsRouter } from "./routes/payments.routes";
import { sedesRouter } from "./routes/sedes.routes";

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
app.use("/api/sedes", sedesRouter);

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

server.on("error", (err: any) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Puerto ${PORT} en uso. ¿Otro proceso ya está ejecutando el backend?`);
    process.exit(1);
  }
  console.error("Server error:", err);
});
