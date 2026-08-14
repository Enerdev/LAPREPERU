import { Router } from "express";
import { listSedes, createSede, deleteSede } from "../controllers/sedes.controller";

export const sedesRouter = Router();

sedesRouter.get("/", listSedes);
sedesRouter.post("/", createSede);
sedesRouter.delete("/:id", deleteSede);
